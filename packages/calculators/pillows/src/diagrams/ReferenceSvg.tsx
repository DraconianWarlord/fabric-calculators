import {
  cutShapeSvgProps,
  finishedShapeSvgProps,
  CutFinishedLegend,
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
}) {
  const { formW, formL, cutW, cutL, finishedW, finishedL, unit, fillStyle, dogEarTrim } = props
  const max = Math.max(cutW, cutL, finishedW, finishedL, 1)
  const scale = 140 / max
  const cw = cutW * scale
  const cl = cutL * scale
  const fw = Math.max(4, finishedW * scale)
  const fl = Math.max(4, finishedL * scale)
  const pad = 28
  const svgW = cw + pad * 2 + 130
  const svgH = cl + pad * 2 + (dogEarTrim ? 22 : 8)
  const cut = cutShapeSvgProps()
  const fin = finishedShapeSvgProps()
  const fx = pad + (cw - fw) / 2
  const fy = pad + (cl - fl) / 2
  return (
    <svg className="pillow-diagram" viewBox={`0 0 ${svgW} ${svgH}`} role="img" aria-label={`Throw reference ${fillStyle}`}>
      {dogEarTrim ? (
        <polygon points={dogEarPolygonPointsAttr(cutW, cutL, scale, pad, pad)} {...cut} />
      ) : (
        <rect x={pad} y={pad} width={cw} height={cl} rx={2} {...cut} />
      )}
      <text x={pad + cw / 2} y={pad - 10} textAnchor="middle" className="diag-label">
        cut {fmt(cutW, unit)} × {fmt(cutL, unit)} {unit} ({fillStyle})
      </text>
      {dogEarTrim ? (
        <polygon points={dogEarPolygonPointsAttr(finishedW, finishedL, scale, fx, fy)} {...fin} />
      ) : (
        <rect x={fx} y={fy} width={fw} height={fl} rx={2} {...fin} />
      )}
      <text x={pad + cw / 2} y={pad + cl / 2 + 4} textAnchor="middle" className="diag-label diag-label-inner">
        finished
      </text>
      {dogEarTrim &&
        dogEarSaMarks(cutW, cutL).map((m) => (
          <g key={m.corner}>
            <circle cx={pad + m.a.x * scale} cy={pad + m.a.y * scale} r={1.5} fill={DIAGRAM_SR_BLUE} />
            <circle cx={pad + m.b.x * scale} cy={pad + m.b.y * scale} r={1.5} fill={DIAGRAM_SR_BLUE} />
          </g>
        ))}
      {dogEarTrim && (
        <text x={pad} y={pad + cl + 14} className="diag-legend">
          dog-ear @ side÷4 (e.g. {fmt(dogEarTrimAlongEdge(cutW), unit)} on {fmt(cutW, unit)})
        </text>
      )}
      <CutFinishedLegend
        x={pad + cw + 16}
        y={pad + 8}
        cutLabel={`cut ${fmt(cutW, unit)}×${fmt(cutL, unit)}`}
        finishedLabel={`finished ${fmt(finishedW, unit)}×${fmt(finishedL, unit)}`}
      />
      <text x={pad + cw + 16} y={pad + 48} className="diag-legend">
        form {fmt(formW, unit)}×{fmt(formL, unit)}
      </text>
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
  fillStyle: FillStyle
}) {
  const { diameterIn, lengthIn, endDiameterIn, barrelAlongIn, barrelCircIn, unit, fillStyle } = props
  const r = 36
  const bodyW = 120
  const bodyH = 72
  const cx = 50
  const cy = 70
  const cut = cutShapeSvgProps()
  const fin = finishedShapeSvgProps()
  return (
    <svg className="pillow-diagram" viewBox="0 0 300 150" role="img" aria-label={`Bolster reference ${fillStyle}`}>
      <ellipse cx={cx} cy={cy} rx={r * 0.45} ry={r} {...cut} />
      <rect x={cx} y={cy - r} width={bodyW} height={bodyH} fill={DIAGRAM_CUT_FILL} stroke="none" />
      <ellipse cx={cx + bodyW} cy={cy} rx={r * 0.45} ry={r} fill="#c5cae9" stroke={DIAGRAM_SR_BLUE} strokeWidth={2} />
      <ellipse cx={cx} cy={cy} rx={r * 0.35} ry={r * 0.85} {...fin} />
      <line x1={cx} y1={cy - r} x2={cx + bodyW} y2={cy - r} stroke={DIAGRAM_SR_BLUE} strokeWidth={2} />
      <line x1={cx} y1={cy + r} x2={cx + bodyW} y2={cy + r} stroke={DIAGRAM_SR_BLUE} strokeWidth={2} />
      <text x={cx + bodyW / 2} y={cy - r - 8} textAnchor="middle" className="diag-label">
        B form {fmt(lengthIn, unit)} → cut {fmt(barrelAlongIn, unit)} ({fillStyle})
      </text>
      <text x={cx - 28} y={cy + 4} textAnchor="middle" className="diag-label" transform={`rotate(-90 ${cx - 28} ${cy})`}>
        A ⌀ {fmt(diameterIn, unit)}
      </text>
      <text x={cx + bodyW + 36} y={cy - 10} className="diag-legend">
        end cut ⌀ {fmt(endDiameterIn, unit)}
      </text>
      <text x={cx + bodyW + 36} y={cy + 8} className="diag-legend">
        barrel circ {fmt(barrelCircIn, unit)}
      </text>
      <CutFinishedLegend x={cx + bodyW + 36} y={cy + 28} />
    </svg>
  )
}
