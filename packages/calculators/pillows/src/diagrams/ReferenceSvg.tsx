import {
  cutShapeSvgProps,
  finishedShapeSvgProps,
  DIAGRAM_SR_BLUE,
  DIAGRAM_CUT_FILL,
  DIAGRAM_FINISHED_DASH,
  DIAGRAM_FINISHED_STROKE_WIDTH,
} from '@sailrite/calc-shell'
import type { FillStyle } from '../lib/fillStyle'
import { fromInches, type Unit } from '../lib/throwPillows'

function fmt(inches: number, unit: Unit): string {
  const v = fromInches(inches, unit)
  return unit === 'in'
    ? Number.isInteger(v)
      ? String(v)
      : v.toFixed(2).replace(/\.?0+$/, '')
    : v.toFixed(0)
}

/**
 * Relative loft (thickness) for side-view teaching — Flat < Standard < Plump.
 * Unitless ratios vs face span so thumbs and large Reference share the same feel.
 */
function throwLoftRatio(fill: FillStyle): number {
  if (fill === 'flat') return 0.28
  if (fill === 'plump') return 0.58
  return 0.42
}

/** Slight face-span squeeze when plump (cover smaller → taller bun). */
function throwSpanRatio(fill: FillStyle): number {
  if (fill === 'flat') return 1.05
  if (fill === 'plump') return 0.9
  return 1
}

/**
 * Knife-edge throw side silhouette (thickness / loft view).
 * Pointed left/right tips; vertical half-height encodes plumpness.
 */
function knifeEdgeSidePath(
  cx: number,
  cy: number,
  halfSpan: number,
  halfLoft: number,
): string {
  const tip = Math.max(0.5, halfSpan)
  const loft = Math.max(0.5, halfLoft)
  // Cubic lens: left tip → top bulge → right tip → bottom bulge → left tip
  return [
    `M ${cx - tip} ${cy}`,
    `C ${cx - tip * 0.35} ${cy - loft} ${cx + tip * 0.35} ${cy - loft} ${cx + tip} ${cy}`,
    `C ${cx + tip * 0.35} ${cy + loft} ${cx - tip * 0.35} ${cy + loft} ${cx - tip} ${cy}`,
    'Z',
  ].join(' ')
}

/**
 * Form×Fill loft silhouette for left-stack reference — side / loft thickness view.
 * Mid stitch = pillow-join midline (NOT seam allowance). No SA dashed inset.
 */
export function ThrowReference(props: {
  formW: number
  formL: number
  cutW: number
  cutL: number
  finishedW: number
  finishedL: number
  /** Kept for call-site stability; loft view does not draw fabric-plate SA. */
  seamAllowanceIn?: number
  unit: Unit
  fillStyle: FillStyle
  /** Ignored — dog-ear 12-gon lives on nest cut panels only. */
  dogEarTrim?: boolean
  compact?: boolean
}) {
  // Dims kept for call-site stability; no form/cut/fin labels or SA overlay.
  void props.formW
  void props.formL
  void props.cutW
  void props.cutL
  void props.finishedW
  void props.finishedL
  void props.unit
  void props.seamAllowanceIn
  const { fillStyle } = props
  const compact = props.compact ?? true
  const loftR = throwLoftRatio(fillStyle)
  const spanR = throwSpanRatio(fillStyle)

  // Side / loft stage — proportions from fill style (not face-on fabric plate).
  const stageW = compact ? 120 : 200
  const stageH = compact ? 72 : 120
  const padX = compact ? 10 : 20
  const padY = compact ? 14 : 22
  const maxHalfSpan = (stageW - padX * 2) / 2
  const maxHalfLoft = (stageH - padY * 2) / 2
  // Fit plump loft + flat span into the stage
  const halfSpan = Math.min(maxHalfSpan, maxHalfLoft / loftR) * spanR
  const halfLoft = halfSpan * (loftR / spanR)

  const cx = stageW / 2
  const cy = padY + maxHalfLoft
  const svgW = stageW + (compact ? 0 : 8)
  const svgH = stageH + (compact ? 4 : 16)
  const cut = cutShapeSvgProps()
  const groundY = Math.min(svgH - (compact ? 6 : 10), cy + halfLoft + 6)
  // Mid stitch: sewing plane where top + bottom panels meet (Style B SR Blue dashed) — not SA.
  const stitchHalf = halfSpan * 0.88

  return (
    <svg
      className="pillow-diagram pillow-ref-compact"
      viewBox={`0 0 ${svgW} ${svgH}`}
      role="img"
      aria-label={`Throw reference thickness view ${fillStyle}`}
    >
      <line
        x1={cx - halfSpan - 4}
        y1={groundY}
        x2={cx + halfSpan + 4}
        y2={groundY}
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={1}
        opacity={0.25}
      />
      <path d={knifeEdgeSidePath(cx, cy, halfSpan, halfLoft)} {...cut} />
      <line
        x1={cx - stitchHalf}
        y1={cy}
        x2={cx + stitchHalf}
        y2={cy}
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={DIAGRAM_FINISHED_STROKE_WIDTH}
        strokeDasharray={DIAGRAM_FINISHED_DASH}
      />
    </svg>
  )
}

export function BolsterReference(props: {
  diameterIn: number
  lengthIn: number
  endDiameterIn: number
  barrelAlongIn: number
  barrelCircIn: number
  unit: Unit
  compact?: boolean
}) {
  const { diameterIn, lengthIn, endDiameterIn, barrelAlongIn, barrelCircIn, unit } = props
  const compact = props.compact ?? true
  const r = compact ? 22 : 36
  const bodyW = compact ? 72 : 120
  const bodyH = r * 2
  const cx = compact ? 28 : 50
  const cy = compact ? 40 : 70
  const cut = cutShapeSvgProps()
  const fin = finishedShapeSvgProps()
  const svgW = compact ? 200 : 300
  const svgH = compact ? 90 : 150
  return (
    <svg
      className="pillow-diagram pillow-ref-compact"
      viewBox={`0 0 ${svgW} ${svgH}`}
      role="img"
      aria-label="Bolster reference profile view"
    >
      <ellipse cx={cx} cy={cy} rx={r * 0.45} ry={r} {...cut} />
      <rect x={cx} y={cy - r} width={bodyW} height={bodyH} fill={DIAGRAM_CUT_FILL} stroke="none" />
      <ellipse
        cx={cx + bodyW}
        cy={cy}
        rx={r * 0.45}
        ry={r}
        fill="#c5cae9"
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={2}
      />
      <ellipse cx={cx} cy={cy} rx={r * 0.35} ry={r * 0.85} {...fin} />
      <line x1={cx} y1={cy - r} x2={cx + bodyW} y2={cy - r} stroke={DIAGRAM_SR_BLUE} strokeWidth={2} />
      <line x1={cx} y1={cy + r} x2={cx + bodyW} y2={cy + r} stroke={DIAGRAM_SR_BLUE} strokeWidth={2} />
      <text x={cx + bodyW / 2} y={cy - r - 4} textAnchor="middle" className="diag-label">
        B {fmt(lengthIn, unit)}→{fmt(barrelAlongIn, unit)}
      </text>
      <text x={cx + bodyW + 8} y={cy - 6} className="diag-legend">
        end ⌀{fmt(endDiameterIn, unit)}
      </text>
      <text x={cx + bodyW + 8} y={cy + 10} className="diag-legend">
        circ {fmt(barrelCircIn, unit)} · A ⌀{fmt(diameterIn, unit)}
      </text>
    </svg>
  )
}

/** Tiny Throw product silhouette for form thumb (face plate — identity, not loft). */
export function ThrowFormThumb({ selected }: { selected?: boolean }) {
  const cut = cutShapeSvgProps()
  const fin = finishedShapeSvgProps()
  return (
    <svg viewBox="0 0 48 40" className="pillow-thumb-svg" aria-hidden="true">
      <rect x={6} y={4} width={36} height={32} rx={2} {...cut} strokeWidth={selected ? 2.5 : 1.5} />
      <rect x={10} y={8} width={28} height={24} rx={1} {...fin} />
    </svg>
  )
}

/** Tiny Bolster product silhouette for form thumb. */
export function BolsterFormThumb({ selected }: { selected?: boolean }) {
  const sw = selected ? 2.5 : 1.5
  return (
    <svg viewBox="0 0 48 40" className="pillow-thumb-svg" aria-hidden="true">
      <ellipse cx={12} cy={20} rx={6} ry={12} fill={DIAGRAM_CUT_FILL} stroke={DIAGRAM_SR_BLUE} strokeWidth={sw} />
      <rect x={12} y={8} width={24} height={24} fill={DIAGRAM_CUT_FILL} stroke="none" />
      <ellipse cx={36} cy={20} rx={6} ry={12} fill="#c5cae9" stroke={DIAGRAM_SR_BLUE} strokeWidth={sw} />
      <line x1={12} y1={8} x2={36} y2={8} stroke={DIAGRAM_SR_BLUE} strokeWidth={sw} />
      <line x1={12} y1={32} x2={36} y2={32} stroke={DIAGRAM_SR_BLUE} strokeWidth={sw} />
    </svg>
  )
}

/** Flat / Standard / Plump comparison thumb — side / loft view (mid stitch, no SA inset). */
export function FillStyleThumb({
  fill,
  selected,
}: {
  fill: FillStyle
  selected?: boolean
}) {
  const loftR = throwLoftRatio(fill)
  const spanR = throwSpanRatio(fill)
  const halfSpan = 16 * spanR
  const halfLoft = 16 * loftR
  const cx = 24
  const cy = 20
  const sw = selected ? 2 : 1.25
  const cut = cutShapeSvgProps()
  const stitchHalf = halfSpan * 0.88
  return (
    <svg viewBox="0 0 48 40" className="pillow-thumb-svg" aria-hidden="true">
      <path
        d={knifeEdgeSidePath(cx, cy, halfSpan, halfLoft)}
        fill={cut.fill}
        stroke={cut.stroke}
        strokeWidth={sw}
      />
      <line
        x1={cx - stitchHalf}
        y1={cy}
        x2={cx + stitchHalf}
        y2={cy}
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={1.25}
        strokeDasharray={DIAGRAM_FINISHED_DASH}
      />
    </svg>
  )
}

/** HTML key under bolster / nest-style cut+finished drawings. */
export function CutFinishedKey() {
  return (
    <div className="pillow-ref-key text-xs text-base-content/60" aria-hidden="true">
      <span className="inline-flex items-center gap-1">
        <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
          <line x1="0" y1="4" x2="14" y2="4" stroke={DIAGRAM_SR_BLUE} strokeWidth={2} />
        </svg>
        Cut (solid)
      </span>
      <span className="mx-1.5" aria-hidden="true">
        ·
      </span>
      <span className="inline-flex items-center gap-1">
        <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
          <line
            x1="0"
            y1="4"
            x2="14"
            y2="4"
            stroke={DIAGRAM_SR_BLUE}
            strokeWidth={1.5}
            strokeDasharray={DIAGRAM_FINISHED_DASH}
          />
        </svg>
        Finished (dashed)
      </span>
    </div>
  )
}

/** HTML key under throw side/loft drawings — mid stitch (join), not fabric-plate SA. */
export function ThrowLoftKey() {
  return (
    <div className="pillow-ref-key text-xs text-base-content/60" aria-hidden="true">
      <span className="inline-flex items-center gap-1">
        <svg width="14" height="8" viewBox="0 0 14 8" aria-hidden="true">
          <line
            x1="0"
            y1="4"
            x2="14"
            y2="4"
            stroke={DIAGRAM_SR_BLUE}
            strokeWidth={1.5}
            strokeDasharray={DIAGRAM_FINISHED_DASH}
          />
        </svg>
        Mid stitch (top + bottom join)
      </span>
    </div>
  )
}
