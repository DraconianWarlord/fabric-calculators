/**
 * PDF export for Sailrite Pillows (jsPDF + autotable).
 * Mirrors Nesting: summary + cut list on page 1, yard-paginated nest preview after.
 * Pure scale helpers are unit-tested; PDF binary itself is not asserted.
 */
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { patternHOffset, type NestPanelPlacement, type NestPreviewModel } from './nestPreview'
import { fromInches, type Unit } from './throwPillows'

const SHOP_FABRIC_PDF =
  'https://www.sailrite.com/Fabrics?utm_source=sailrite_calculators&utm_medium=pillows&utm_campaign=fabric_pillows&utm_content=pdf_shop_button'

/** PDF points per inch of fabric when drawing the nest (before fit-to-page). */
export const DEFAULT_PT_PER_IN = 4

export interface NestDrawScale {
  originX: number
  originY: number
  ptPerIn: number
}

export function inchesToPdfPt(
  inches: number,
  scale: Pick<NestDrawScale, 'ptPerIn'>,
): number {
  return inches * scale.ptPerIn
}

export function fabricToPdf(
  xIn: number,
  yIn: number,
  scale: NestDrawScale,
  sliceStartIn = 0,
): { x: number; y: number } {
  return {
    x: scale.originX + xIn * scale.ptPerIn,
    y: scale.originY + (yIn - sliceStartIn) * scale.ptPerIn,
  }
}

export function fitNestScale(
  fabricWidthIn: number,
  _usedLengthIn: number,
  box: { x: number; y: number; w: number; h: number },
  minPtPerIn = 1.5,
): NestDrawScale {
  const sx = box.w / Math.max(fabricWidthIn, 1e-6)
  const ptPerIn = Math.max(minPtPerIn, Math.min(sx, DEFAULT_PT_PER_IN * 2.5))
  return { originX: box.x, originY: box.y, ptPerIn }
}

export function nestBoltHeightIn(usedLengthIn: number): number {
  return Math.max(usedLengthIn, 12) + 6
}

export interface NestSlice {
  startIn: number
  endIn: number
  label: string
}

function formatYd(inches: number): string {
  const yd = inches / 36
  const s = yd.toFixed(2).replace(/\.?0+$/, '')
  return s === '' ? '0' : s
}

export function chooseNestPageScale(
  widthPtPerIn: number,
  usableHeightPt: number,
  minPtPerIn = 1.5,
): { ptPerIn: number; yardsPerPage: number } {
  const YARD = 36
  const widthScale = Math.max(minPtPerIn, widthPtPerIn)
  const usable = Math.max(YARD * minPtPerIn, usableHeightPt)
  const maxYards = Math.max(1, Math.floor(usable / (minPtPerIn * YARD)))
  const yardsAtWidth = usable / (widthScale * YARD)
  let yardsPerPage = Math.min(maxYards, Math.max(1, Math.round(yardsAtWidth)))
  if (yardsPerPage < maxYards && yardsAtWidth - Math.floor(yardsAtWidth) > 0.35) {
    yardsPerPage = Math.min(maxYards, Math.floor(yardsAtWidth) + 1)
  }
  const ptPerIn = Math.min(widthScale, usable / (yardsPerPage * YARD))
  return { ptPerIn, yardsPerPage }
}

export function computeNestSlices(
  usedLengthIn: number,
  ptPerIn: number,
  firstPageUsableH: number,
  fullPageUsableH: number,
): NestSlice[] {
  const YARD = 36
  const boltH = nestBoltHeightIn(usedLengthIn)
  const slices: NestSlice[] = []
  let y = 0
  let page = 0
  const maxPages = 50
  while (y < boltH - 1e-9 && page < maxPages) {
    const usableH = page === 0 ? firstPageUsableH : fullPageUsableH
    const usableInches = usableH / Math.max(ptPerIn, 1e-6)
    const yardsOnPage = Math.max(1, Math.floor(usableInches / YARD))
    const end = Math.min(boltH, y + yardsOnPage * YARD)
    slices.push({
      startIn: y,
      endIn: end,
      label: `Nest ${formatYd(y)}–${formatYd(end)} yd`,
    })
    if (end <= y + 1e-9) break
    y = end
    page += 1
  }
  return slices.length > 0 ? slices : [{ startIn: 0, endIn: boltH, label: 'Nest 0–0 yd' }]
}

export function pdfFilename(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `sailrite-pillows-${y}-${m}-${d}.pdf`
}

export function fmtDim(inches: number, unit: Unit): string {
  const v = fromInches(inches, unit)
  if (unit === 'in') return String(Number(v.toFixed(2)))
  return String(Number(v.toFixed(1)))
}

export type PillowTypeKind = 'throw' | 'bolster'

export type CutListRow = {
  label: string
  widthIn: number
  lengthIn: number
  qty: number
  note?: string
}

export interface ExportPillowsPdfInput {
  pillowType: PillowTypeKind
  fabricWidthIn: number
  seamAllowanceIn: number
  unit: Unit
  exact: number
  order: number
  quantity: number
  nest: NestPreviewModel
  cutList: CutListRow[]
  /** Throw fill style label, or bolster fit. */
  styleLabel?: string
  formWidthIn?: number
  formLengthIn?: number
  hRepeatIn?: number
  vRepeatIn?: number
  dogEarTrim?: boolean
}

const PANEL_FILL: Record<NestPanelPlacement['kind'], string> = {
  'throw-panel': '#24285e',
  barrel: '#3f51b5',
  end: '#5c6bc0',
}

function contrastLabelColor(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return [255, 255, 255]
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? [20, 20, 30] : [255, 255, 255]
}

type DrawNestSliceOpts = {
  sliceStartIn?: number
  sliceEndIn?: number
  showWidthNote?: boolean
  /** Pattern repeat stripes (same as Nest Preview SVG). */
  hRepeatIn?: number
  vRepeatIn?: number
}

/**
 * Draw one vertical slice of the pillows nest (rect / circle / dog-ear polygon).
 */
export function drawPillowNest(
  doc: jsPDF,
  nest: NestPreviewModel,
  scale: NestDrawScale,
  unit: Unit,
  slice?: DrawNestSliceOpts,
): void {
  const fabricWidthIn = nest.fabricWidthIn
  const used = nest.lengthInches
  const boltH = nestBoltHeightIn(used)
  const sliceStart = slice?.sliceStartIn ?? 0
  const sliceEnd = slice?.sliceEndIn ?? boltH
  const sliceH = Math.max(0, sliceEnd - sliceStart)
  const boltWpt = inchesToPdfPt(fabricWidthIn, scale)
  const boltHpt = inchesToPdfPt(sliceH, scale)

  doc.setFillColor(245, 245, 248)
  doc.setDrawColor(40, 40, 50)
  doc.setLineWidth(0.8)
  doc.rect(scale.originX, scale.originY, boltWpt, boltHpt, 'FD')

  // Pattern H/V guides — match NestPreviewSvg (lavender stripes/grid).
  const hR = slice?.hRepeatIn ?? 0
  const vR = slice?.vRepeatIn ?? 0
  if (hR > 0 || vR > 0) {
    doc.setDrawColor(197, 202, 233) // #c5cae9
    doc.setLineWidth(0.5)
    if (hR > 0) {
      const hOff = patternHOffset(fabricWidthIn, hR)
      const n = Math.ceil((fabricWidthIn - hOff) / hR) + 2
      for (let i = 0; i < n; i++) {
        const xIn = hOff + i * hR
        if (xIn < -1e-6 || xIn > fabricWidthIn + 1e-6) continue
        const { x } = fabricToPdf(xIn, sliceStart, scale, sliceStart)
        doc.line(x, scale.originY, x, scale.originY + boltHpt)
      }
    }
    if (vR > 0) {
      const first = Math.floor(sliceStart / vR)
      const last = Math.ceil(sliceEnd / vR) + 1
      for (let j = first; j <= last; j++) {
        const yIn = j * vR
        if (yIn < sliceStart - 1e-6 || yIn > sliceEnd + 1e-6) continue
        const { y } = fabricToPdf(0, yIn, scale, sliceStart)
        doc.line(scale.originX, y, scale.originX + boltWpt, y)
      }
    }
  }

  const firstYd = Math.floor(sliceStart / 36)
  const lastYd = Math.ceil(sliceEnd / 36)
  doc.setDrawColor(180, 140, 40)
  doc.setTextColor(100, 80, 0)
  doc.setFontSize(7)
  for (let yd = firstYd; yd <= lastYd; yd++) {
    const yIn = yd * 36
    if (yIn < sliceStart - 1e-6 || yIn > sliceEnd + 1e-6) continue
    const { y } = fabricToPdf(0, yIn, scale, sliceStart)
    doc.setLineWidth(yd === 0 ? 0.6 : 0.4)
    doc.line(scale.originX, y, scale.originX + boltWpt, y)
    const label = yd === 0 ? '0' : `${yd} yd`
    doc.text(label, scale.originX + 2, Math.max(scale.originY + 7, y - 1.5))
  }

  for (const p of nest.panels) {
    const py1 = p.y
    const py2 = p.y + p.h
    if (py2 <= sliceStart + 1e-9 || py1 >= sliceEnd - 1e-9) continue

    const visY1 = Math.max(py1, sliceStart)
    const visY2 = Math.min(py2, sliceEnd)
    const { x } = fabricToPdf(p.x, visY1, scale, sliceStart)
    const y = scale.originY + (visY1 - sliceStart) * scale.ptPerIn
    const w = inchesToPdfPt(p.w, scale)
    const h = inchesToPdfPt(visY2 - visY1, scale)
    if (h < 0.5 || w < 0.5) continue

    const fill = PANEL_FILL[p.kind] ?? '#24285e'
    doc.setFillColor(fill)
    doc.setDrawColor(20, 20, 30)
    doc.setLineWidth(0.6)

    if (p.kind === 'end') {
      const cx = p.x + p.w / 2
      const cy = p.y + p.h / 2
      const r = Math.min(p.w, p.h) / 2
      const { x: cpx, y: cpy } = fabricToPdf(cx, cy, scale, sliceStart)
      const rPt = inchesToPdfPt(r, scale)
      doc.saveGraphicsState()
      doc.rect(scale.originX, scale.originY, boltWpt, boltHpt)
      doc.clip()
      doc.circle(cpx, cpy, rPt, 'FD')
      doc.restoreGraphicsState()
    } else if (p.polygon && p.polygon.length >= 3) {
      // Dog-ear 12-gon in local panel space → fabric inches; bolt-slice clip handles spans.
      const poly = p.polygon.map((pt) => ({ x: p.x + pt.x, y: p.y + pt.y }))
      const pts = poly.map((pt) => fabricToPdf(pt.x, pt.y, scale, sliceStart))
      const deltas: number[][] = []
      for (let i = 1; i < pts.length; i++) {
        deltas.push([pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y])
      }
      doc.saveGraphicsState()
      doc.rect(scale.originX, scale.originY, boltWpt, boltHpt)
      doc.clip()
      doc.lines(deltas, pts[0]!.x, pts[0]!.y, [1, 1], 'FD', true)
      doc.restoreGraphicsState()
    } else {
      doc.rect(x, y, w, h, 'FD')
    }

    const topOnSlice = py1 >= sliceStart - 1e-6 && py1 < sliceEnd
    const showLabel = h >= 10 && (topOnSlice || h >= 16)
    if (showLabel && p.label) {
      const dimStr = `${fmtDim(p.w, unit)}×${fmtDim(p.h, unit)} ${unit}`
      doc.setTextColor(...contrastLabelColor(fill))
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      const cx = x + w / 2
      const ty = y + Math.min(h / 2 + 2, h - 4)
      doc.text(p.label, cx, Math.max(y + 8, ty - 5), { align: 'center', maxWidth: Math.max(4, w - 4) })
      if (h >= 18) {
        doc.setFontSize(7)
        doc.text(dimStr, cx, Math.max(y + 16, ty + 5), {
          align: 'center',
          maxWidth: Math.max(4, w - 4),
        })
      }
    }
  }

  if (used > 0 && used >= sliceStart - 1e-6 && used <= sliceEnd + 1e-6) {
    const { y } = fabricToPdf(0, used, scale, sliceStart)
    doc.setDrawColor(200, 120, 0)
    doc.setLineWidth(1.2)
    doc.setLineDashPattern([3, 2], 0)
    doc.line(scale.originX, y, scale.originX + boltWpt, y)
    doc.setLineDashPattern([], 0)
    doc.setTextColor(36, 37, 142)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    const usedLabel = `${(used / 36).toFixed(2)} yd · ${fmtDim(used, unit)} ${unit}`
    doc.text(usedLabel, scale.originX + boltWpt - 2, y - 2, { align: 'right' })
    doc.setFont('helvetica', 'normal')
  }

  if (slice?.showWidthNote !== false && Math.abs(sliceEnd - boltH) < 1e-3) {
    doc.setTextColor(80, 80, 90)
    doc.setFontSize(7)
    doc.text(
      `Width ${fmtDim(fabricWidthIn, unit)} ${unit}`,
      scale.originX + boltWpt / 2,
      scale.originY + boltHpt + 10,
      { align: 'center' },
    )
  }
}

function drawShopFabricButton(
  doc: jsPDF,
  x: number,
  y: number,
  opts?: { label?: string; width?: number },
): number {
  const label = opts?.label ?? 'Shop fabric at Sailrite'
  const w = opts?.width ?? 200
  const h = 28
  doc.setFillColor(36, 40, 94) // Sailrite Blue #24285e
  doc.roundedRect(x, y, w, h, 4, 4, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(255, 255, 255)
  doc.text(label, x + w / 2, y + h / 2 + 3.5, { align: 'center' })
  doc.link(x, y, w, h, { url: SHOP_FABRIC_PDF })
  return y + h
}

function drawFooter(doc: jsPDF, margin: number, pageH: number): void {
  doc.setFontSize(7)
  doc.setTextColor(120, 120, 120)
  doc.setFont('helvetica', 'normal')
  doc.text(
    'Estimate only. Double-check before cutting or ordering. Sailrite sells full yards.',
    margin,
    pageH - 40,
  )
  drawShopFabricButton(doc, margin, pageH - 34, {
    label: 'Shop fabric at Sailrite',
    width: 190,
  })
}

/**
 * Build and open/download the pillows PDF. Returns the filename used.
 */
export function exportPillowsPdf(input: ExportPillowsPdfInput): string {
  const {
    pillowType,
    fabricWidthIn,
    seamAllowanceIn,
    unit,
    exact,
    order,
    quantity,
    nest,
    cutList,
    styleLabel,
    formWidthIn,
    formLengthIn,
    hRepeatIn = 0,
    vRepeatIn = 0,
    dogEarTrim = false,
  } = input

  const used = nest.lengthInches
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' })
  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 40
  const footerReserve = 48
  const widthNoteReserve = 14

  const title =
    pillowType === 'bolster' ? 'Sailrite Bolster Pillows' : 'Sailrite Throw Pillows'
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(36, 40, 94)
  doc.text(title, margin, margin)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(40, 40, 40)
  let y = margin + 18
  const line = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold')
    doc.text(label, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(value, margin + 120, y)
    y += 12
  }

  if (formWidthIn != null && formLengthIn != null) {
    const a = pillowType === 'bolster' ? 'Diameter × length:' : 'Form size:'
    line(a, `${fmtDim(formWidthIn, unit)} × ${fmtDim(formLengthIn, unit)} ${unit}`)
  }
  line('Fabric width:', `${fmtDim(fabricWidthIn, unit)} ${unit}`)
  if (pillowType === 'throw') {
    line(
      'Seam allowance:',
      seamAllowanceIn > 0
        ? `${fmtDim(seamAllowanceIn, unit)} ${unit} per side`
        : '0 (cut sizes)',
    )
  }
  if (styleLabel) line(pillowType === 'bolster' ? 'Fit:' : 'Side / loft:', styleLabel)
  if (pillowType === 'throw') {
    line('Dog-ear:', dogEarTrim ? 'On' : 'Off')
  }
  if (hRepeatIn > 0 || vRepeatIn > 0) {
    line(
      'Pattern repeats:',
      `H ${fmtDim(hRepeatIn, unit)} × V ${fmtDim(vRepeatIn, unit)} ${unit}`,
    )
  } else {
    line('Pattern repeats:', 'Off')
  }
  line('Pillows:', String(quantity))
  line('Exact yards:', exact.toFixed(2))
  line('Order yards:', String(order))
  line('Used length:', `${fmtDim(used, unit)} ${unit} (${(used / 36).toFixed(2)} yd)`)
  line('Pieces nested:', String(nest.panels.length))

  y += 10
  const shopLabel =
    order > 0 ? `Shop ${order} yd of fabric at Sailrite` : 'Shop fabric at Sailrite'
  y = drawShopFabricButton(doc, margin, y, { label: shopLabel, width: 240 }) + 14

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(36, 40, 94)
  doc.text('Cut list', margin, y)
  y += 4

  const u = unit
  const tableBody = cutList.map((c) => {
    const dim = `${fmtDim(c.widthIn, u)}×${fmtDim(c.lengthIn, u)} ${u}`
    // Keep Piece short; long notes used to paint past Qty (no in-cell wrap).
    const piece = c.note ? `${c.label} (${c.note})` : c.label
    return [piece, dim, String(c.qty)]
  })

  const usableTableW = pageW - margin * 2
  const qtyCol = 36
  const cutCol = 78
  const pieceCol = Math.max(120, usableTableW - cutCol - qtyCol)

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Piece', 'Cut size', 'Qty']],
    body: tableBody.length > 0 ? tableBody : [['—', '—', '—']],
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [30, 30, 30],
      overflow: 'linebreak',
      cellWidth: 'wrap',
    },
    headStyles: {
      fillColor: [42, 51, 171],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      overflow: 'linebreak',
    },
    alternateRowStyles: { fillColor: [245, 246, 252] },
    columnStyles: {
      0: { cellWidth: pieceCol, overflow: 'linebreak' },
      1: { cellWidth: cutCol, overflow: 'linebreak' },
      2: { halign: 'center', cellWidth: qtyCol },
    },
  })

  drawFooter(doc, margin, pageH)

  doc.addPage()
  let nestTop = margin

  const usableWidth = pageW - margin * 2
  const baseScale = fitNestScale(fabricWidthIn, used, {
    x: margin,
    y: nestTop,
    w: usableWidth,
    h: Math.max(80, pageH - margin * 2 - footerReserve),
  })

  const titleBlock = 22
  const fullContentTop = margin + titleBlock
  const fullUsableH = Math.max(
    80,
    pageH - fullContentTop - margin - footerReserve - widthNoteReserve,
  )
  const firstUsableH = fullUsableH
  const { ptPerIn } = chooseNestPageScale(baseScale.ptPerIn, fullUsableH)
  const slices = computeNestSlices(used, ptPerIn, firstUsableH, fullUsableH)

  slices.forEach((sl, i) => {
    if (i > 0) {
      doc.addPage()
      nestTop = margin
    }

    const contentTop = nestTop + titleBlock
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(36, 40, 94)
    const nestTitle =
      slices.length === 1
        ? 'Nest layout'
        : `Nest layout (${sl.label}${i > 0 ? ', continued' : ''})`
    doc.text(nestTitle, margin, nestTop + 10)

    if (slices.length > 1) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(80, 80, 90)
      doc.text(sl.label, margin, nestTop + 20)
    }

    const scale: NestDrawScale = {
      originX: margin,
      originY: contentTop,
      ptPerIn,
    }
    const sliceHpt = inchesToPdfPt(sl.endIn - sl.startIn, scale)
    const maxH = pageH - contentTop - margin - footerReserve - widthNoteReserve
    if (sliceHpt > maxH + 1e-6) {
      scale.ptPerIn = maxH / Math.max(sl.endIn - sl.startIn, 1e-6)
    }

    drawPillowNest(doc, nest, scale, unit, {
      sliceStartIn: sl.startIn,
      sliceEndIn: sl.endIn,
      showWidthNote: i === slices.length - 1,
      hRepeatIn,
      vRepeatIn,
    })

    drawFooter(doc, margin, pageH)
  })

  const name = pdfFilename()
  const url = doc.output('bloburl')
  const opened =
    typeof window !== 'undefined' ? window.open(url, '_blank', 'noopener,noreferrer') : null
  if (!opened) {
    doc.save(name)
  }
  return name
}
