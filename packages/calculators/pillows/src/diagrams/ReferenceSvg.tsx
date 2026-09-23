import {
  cutShapeSvgProps,
  finishedShapeSvgProps,
  DIAGRAM_SR_BLUE,
  DIAGRAM_CUT_FILL,
} from '@sailrite/calc-shell'
import {
  dogEarPolygonPointsAttr,
  dogEarSaMarks,
  dogEarTrimAlongEdge,
} from '../lib/dogEar'
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

/** Form×Fill cut/finished silhouette for left-stack reference (secondary, not hero). */
export function ThrowReference(props: {
  formW: number
  formL: number
  cutW: number
  cutL: number
  finishedW: number
  finishedL: number
  unit: Unit
  fillStyle: FillStyle
  dogEarTrim: boolean
  compact?: boolean
}) {
  const { formW, formL, cutW, cutL, finishedW, finishedL, unit, fillStyle, dogEarTrim } = props
  const compact = props.compact ?? true
  const max = Math.max(cutW, cutL, finishedW, finishedL, 1)
  const scale = (compact ? 88 : 140) / max
  const cw = cutW * scale
  const cl = cutL * scale
  const fw = Math.max(4, finishedW * scale)
  const fl = Math.max(4, finishedL * scale)
  const pad = compact ? 16 : 28
  const svgW = cw + pad * 2 + (compact ? 8 : 130)
  const svgH = cl + pad * 2 + (dogEarTrim ? 18 : 6)
  const cut = cutShapeSvgProps()
  const fin = finishedShapeSvgProps()
  const fx = pad + (cw - fw) / 2
  const fy = pad + (cl - fl) / 2
  return (
    <svg
      className="pillow-diagram pillow-ref-compact"
      viewBox={`0 0 ${svgW} ${svgH}`}
      role="img"
      aria-label={`Throw reference ${fillStyle}`}
    >
      {dogEarTrim ? (
        <polygon points={dogEarPolygonPointsAttr(cutW, cutL, scale, pad, pad)} {...cut} />
      ) : (
        <rect x={pad} y={pad} width={cw} height={cl} rx={2} {...cut} />
      )}
      <text x={pad + cw / 2} y={pad - 4} textAnchor="middle" className="diag-label">
        cut {fmt(cutW, unit)}×{fmt(cutL, unit)} ({fillStyle})
      </text>
      {dogEarTrim ? (
        <polygon points={dogEarPolygonPointsAttr(finishedW, finishedL, scale, fx, fy)} {...fin} />
      ) : (
        <rect x={fx} y={fy} width={fw} height={fl} rx={2} {...fin} />
      )}
      {dogEarTrim &&
        dogEarSaMarks(cutW, cutL).map((m) => (
          <g key={m.corner}>
            <circle cx={pad + m.a.x * scale} cy={pad + m.a.y * scale} r={1.2} fill={DIAGRAM_SR_BLUE} />
            <circle cx={pad + m.b.x * scale} cy={pad + m.b.y * scale} r={1.2} fill={DIAGRAM_SR_BLUE} />
          </g>
        ))}
      {dogEarTrim && (
        <text x={pad} y={pad + cl + 12} className="diag-legend">
          dog-ear side÷4 · e.g. {fmt(dogEarTrimAlongEdge(cutW), unit)} on{' '}
          {fmt(cutW, unit)}
        </text>
      )}
      {!compact && (
        <text x={pad + cw + 16} y={pad + 14} className="diag-legend">
          form {fmt(formW, unit)}×{fmt(formL, unit)} · fin {fmt(finishedW, unit)}×
          {fmt(finishedL, unit)}
        </text>
      )}
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

/** Tiny Throw product silhouette for form thumb. */
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

/** Flat / Standard / Plump comparison thumb — cut solid, finished dashed. */
export function FillStyleThumb({
  fill,
  selected,
}: {
  fill: FillStyle
  selected?: boolean
}) {
  // Relative sizes teaching cut vs form (unitless): form=20 box
  const form = 20
  const cut =
    fill === 'flat' ? form + 4 : fill === 'plump' ? form - 4 : form
  const fin = cut - 4
  const stage = 28
  const ox = (stage - cut) / 2
  const oy = (stage - cut) / 2
  const fx = (stage - fin) / 2
  const fy = (stage - fin) / 2
  const sw = selected ? 2 : 1.25
  return (
    <svg viewBox="0 0 48 40" className="pillow-thumb-svg" aria-hidden="true">
      <rect
        x={10 + ox}
        y={6 + oy}
        width={cut}
        height={cut}
        rx={1}
        fill={DIAGRAM_CUT_FILL}
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={sw}
      />
      <rect
        x={10 + fx}
        y={6 + fy}
        width={fin}
        height={fin}
        rx={1}
        fill="none"
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={1}
        strokeDasharray="3 2"
      />
    </svg>
  )
}

/** HTML key under reference drawings (Nesting DimPreviewFrame pattern). */
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
            strokeDasharray="4 3"
          />
        </svg>
        Finished (dashed)
      </span>
    </div>
  )
}
