import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PT_PER_IN,
  chooseNestPageScale,
  computeNestSlices,
  fabricToPdf,
  fitNestScale,
  fmtDim,
  inchesToPdfPt,
  nestBoltHeightIn,
  pdfFilename,
} from './exportPdf'

describe('pillows exportPdf scale helpers', () => {
  it('inchesToPdfPt multiplies by ptPerIn', () => {
    expect(inchesToPdfPt(10, { ptPerIn: 4 })).toBe(40)
    expect(inchesToPdfPt(0, { ptPerIn: 4 })).toBe(0)
    expect(inchesToPdfPt(36, { ptPerIn: DEFAULT_PT_PER_IN })).toBe(36 * DEFAULT_PT_PER_IN)
  })

  it('fabricToPdf offsets from origin and slice', () => {
    const scale = { originX: 40, originY: 100, ptPerIn: 2 }
    expect(fabricToPdf(0, 0, scale)).toEqual({ x: 40, y: 100 })
    expect(fabricToPdf(10, 5, scale)).toEqual({ x: 60, y: 110 })
    expect(fabricToPdf(0, 36, scale, 36)).toEqual({ x: 40, y: 100 })
  })

  it('fitNestScale fits fabric width into the box', () => {
    const box = { x: 40, y: 200, w: 500, h: 400 }
    const scale = fitNestScale(54, 48, box)
    expect(scale.originX).toBe(40)
    expect(scale.originY).toBe(200)
    expect(scale.ptPerIn).toBeGreaterThan(0)
    expect(54 * scale.ptPerIn).toBeLessThanOrEqual(box.w + 1e-6)
  })

  it('pdfFilename uses YYYY-MM-DD pillows prefix', () => {
    const d = new Date(2026, 8, 23) // Sep 23 2026 local
    expect(pdfFilename(d)).toBe('sailrite-pillows-2026-09-23.pdf')
  })

  it('fmtDim respects unit', () => {
    expect(fmtDim(18, 'in')).toBe('18')
    expect(fmtDim(18.5, 'in')).toBe('18.5')
    expect(fmtDim(18, 'mm')).toBe('457.2')
  })

  it('chooseNestPageScale returns whole yards', () => {
    const { yardsPerPage, ptPerIn } = chooseNestPageScale(4, 200)
    expect(yardsPerPage).toBeGreaterThanOrEqual(1)
    expect(ptPerIn).toBeGreaterThan(0)
  })
})

describe('computeNestSlices (pillows)', () => {
  it('returns one slice when bolt fits first page', () => {
    const used = 24
    const ptPerIn = 4
    const boltH = nestBoltHeightIn(used)
    const firstH = boltH * ptPerIn + 10
    const slices = computeNestSlices(used, ptPerIn, firstH, 600)
    expect(slices).toHaveLength(1)
    expect(slices[0]!.startIn).toBe(0)
    expect(slices[0]!.endIn).toBeCloseTo(boltH)
  })

  it('paginates tall nests with yard-aligned non-final breaks', () => {
    const used = 36 * 8
    const ptPerIn = 6
    const slices = computeNestSlices(used, ptPerIn, 500, 500)
    expect(slices.length).toBeGreaterThan(1)
    expect(slices[0]!.startIn).toBe(0)
    for (let i = 1; i < slices.length; i++) {
      expect(slices[i]!.startIn).toBeCloseTo(slices[i - 1]!.endIn)
    }
    for (let i = 0; i < slices.length - 1; i++) {
      expect(slices[i]!.endIn % 36).toBeCloseTo(0)
    }
  })
})
