import { cutShapeSvgProps, DIAGRAM_SR_BLUE } from '@sailrite/calc-shell'
import { patternHOffset, type NestPreviewModel } from '../lib/nestPreview'
import { fromInches, type Unit } from '../lib/throwPillows'

function fmt(inches: number, unit: Unit): string {
  const v = fromInches(inches, unit)
  return unit === 'in'
    ? Number.isInteger(v)
      ? String(v)
      : v.toFixed(2).replace(/\.?0+$/, '')
    : v.toFixed(0)
}

export function NestPreviewSvg({
  model,
  unit,
  hRepeatIn = 0,
  vRepeatIn = 0,
}: {
  model: NestPreviewModel
  unit: Unit
  hRepeatIn?: number
  vRepeatIn?: number
}) {
  const fabricW = Math.max(model.fabricWidthIn, 1)
  const len = Math.max(model.lengthInches, 1)
  const pad = 24
  const scale = Math.min(420 / fabricW, 280 / len, 8)
  const svgW = fabricW * scale + pad * 2
  const svgH = len * scale + pad * 2 + 20
  const cut = cutShapeSvgProps()
  const hOff = patternHOffset(fabricW, hRepeatIn)
  const showGrid = hRepeatIn > 0 || vRepeatIn > 0

  return (
    <svg
      className="pillow-diagram pillow-nest-preview"
      viewBox={`0 0 ${svgW} ${svgH}`}
      role="img"
      aria-label="Panel nest preview on fabric bolt"
    >
      <rect
        x={pad}
        y={pad}
        width={fabricW * scale}
        height={len * scale}
        fill="#fafafa"
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={1.5}
      />
      {showGrid && (
        <g stroke="#c5cae9" strokeWidth={0.75} opacity={0.85}>
          {hRepeatIn > 0 &&
            Array.from({ length: Math.ceil((fabricW - hOff) / hRepeatIn) + 1 }).map((_, i) => {
              const x = hOff + i * hRepeatIn
              if (x < -1e-6 || x > fabricW + 1e-6) return null
              return (
                <line key={`v${i}`} x1={pad + x * scale} y1={pad} x2={pad + x * scale} y2={pad + len * scale} />
              )
            })}
          {vRepeatIn > 0 &&
            Array.from({ length: Math.ceil(len / vRepeatIn) + 1 }).map((_, i) => {
              const y = i * vRepeatIn
              return (
                <line key={`h${i}`} x1={pad} y1={pad + y * scale} x2={pad + fabricW * scale} y2={pad + y * scale} />
              )
            })}
        </g>
      )}
      {model.panels.map((p, i) => {
        const x = pad + p.x * scale
        const y = pad + p.y * scale
        if (p.kind === 'end') {
          return (
            <ellipse
              key={i}
              cx={x + (p.w * scale) / 2}
              cy={y + (p.h * scale) / 2}
              rx={(p.w * scale) / 2}
              ry={(p.h * scale) / 2}
              {...cut}
            />
          )
        }
        if (p.polygon) {
          return (
            <polygon
              key={i}
              points={p.polygon.map((pt) => `${x + pt.x * scale},${y + pt.y * scale}`).join(' ')}
              {...cut}
            />
          )
        }
        return <rect key={i} x={x} y={y} width={p.w * scale} height={p.h * scale} {...cut} />
      })}
      {model.leftoverAcrossIn > 0.1 && (
        <rect
          x={pad + (fabricW - model.leftoverAcrossIn) * scale}
          y={pad}
          width={model.leftoverAcrossIn * scale}
          height={len * scale}
          fill="none"
          stroke={DIAGRAM_SR_BLUE}
          strokeWidth={1}
          strokeDasharray="3 3"
          opacity={0.5}
        />
      )}
      <text x={pad} y={pad - 8} className="diag-label">
        bolt {fmt(fabricW, unit)} {unit} wide · {fmt(len, unit)} {unit} along
      </text>
      <text x={pad} y={pad + len * scale + 14} className="diag-legend">
        {model.panels.length} piece{model.panels.length === 1 ? '' : 's'}
        {model.leftoverAcrossIn > 0.1
          ? ` · leftover ~${fmt(model.leftoverAcrossIn, unit)} ${unit} across`
          : ''}
      </text>
    </svg>
  )
}
