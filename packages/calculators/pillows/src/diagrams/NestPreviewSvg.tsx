import type { CSSProperties } from 'react'
import {
  DIAGRAM_CUT_FILL,
  DIAGRAM_FINISHED_DASH,
  DIAGRAM_SR_BLUE,
} from '@sailrite/calc-shell'
import { insetPolygon } from '../lib/insetPolygon'
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

/** Constant screen stroke — does not fatten as nest viewBox grows with panel count. */
const PANEL_STROKE: CSSProperties = {
  vectorEffect: 'non-scaling-stroke',
  strokeWidth: 1.25,
}
const SA_STROKE: CSSProperties = {
  vectorEffect: 'non-scaling-stroke',
  strokeWidth: 1,
}
const BOLT_STROKE: CSSProperties = {
  vectorEffect: 'non-scaling-stroke',
  strokeWidth: 1.5,
}

/**
 * Nest preview: SVG/stage only + captions as sibling children of the card body.
 * Captions must NOT sit inside a flex-grow wrapper — on mobile Results that
 * lets the stage eat the card and clip/shove Bolt + pieces text.
 */
export function NestPreviewSvg({
  model,
  unit,
  hRepeatIn = 0,
  vRepeatIn = 0,
  seamAllowanceIn = 0,
}: {
  model: NestPreviewModel
  unit: Unit
  hRepeatIn?: number
  vRepeatIn?: number
  /** Throw only — dashed SA inset on cut panels (Style B). Bolster skips. */
  seamAllowanceIn?: number
}) {
  const fabricW = Math.max(model.fabricWidthIn, 1)
  const len = Math.max(model.lengthInches, 1)
  const pad = Math.max(fabricW, len) * 0.04 + 0.5
  const svgW = fabricW + pad * 2
  const svgH = len + pad * 2
  const hOff = patternHOffset(fabricW, hRepeatIn)
  const showGrid = hRepeatIn > 0 || vRepeatIn > 0
  const sa = Math.max(0, seamAllowanceIn)

  if (model.panels.length === 0) {
    return (
      <p className="text-sm text-base-content" role="status">
        No panels to nest — check size and quantity.
      </p>
    )
  }

  const boltCaption = `Bolt ${fmt(fabricW, unit)} ${unit} wide · ${fmt(len, unit)} ${unit} along`
  const piecesCaption =
    `${model.panels.length} piece${model.panels.length === 1 ? '' : 's'}` +
    (model.leftoverAcrossIn > 0.1
      ? ` · leftover ~${fmt(model.leftoverAcrossIn, unit)} ${unit} across`
      : '')

  return (
    <>
      <div className="pillow-nest-stage">
        <svg
          className="pillow-diagram pillow-nest-preview"
          viewBox={`0 0 ${svgW} ${svgH}`}
          role="img"
          aria-label="Panel nest preview on fabric bolt"
          preserveAspectRatio="xMidYMin meet"
        >
          <rect
            x={pad}
            y={pad}
            width={fabricW}
            height={len}
            fill="#fafafa"
            stroke={DIAGRAM_SR_BLUE}
            style={BOLT_STROKE}
          />
          {showGrid && (
            <g
              stroke="#c5cae9"
              opacity={0.85}
              style={{ vectorEffect: 'non-scaling-stroke', strokeWidth: 0.75 }}
            >
              {hRepeatIn > 0 &&
                Array.from({ length: Math.ceil((fabricW - hOff) / hRepeatIn) + 2 }).map((_, i) => {
                  const x = hOff + i * hRepeatIn
                  if (x < -1e-6 || x > fabricW + 1e-6) return null
                  return (
                    <line key={`v${i}`} x1={pad + x} y1={pad} x2={pad + x} y2={pad + len} />
                  )
                })}
              {vRepeatIn > 0 &&
                Array.from({ length: Math.ceil(len / vRepeatIn) + 2 }).map((_, i) => {
                  const y = i * vRepeatIn
                  if (y > len + 1e-6) return null
                  return (
                    <line key={`h${i}`} x1={pad} y1={pad + y} x2={pad + fabricW} y2={pad + y} />
                  )
                })}
            </g>
          )}
          {model.panels.map((p, i) => {
            const x = pad + p.x
            const y = pad + p.y
            const common = {
              fill: DIAGRAM_CUT_FILL,
              stroke: DIAGRAM_SR_BLUE,
              style: PANEL_STROKE,
            }
            const saProps = {
              fill: 'none' as const,
              stroke: DIAGRAM_SR_BLUE,
              strokeDasharray: DIAGRAM_FINISHED_DASH,
              style: SA_STROKE,
              pointerEvents: 'none' as const,
            }
            // Throw panels only: dashed SA inset (Style B). Skip bolster barrel/end.
            const showSa = p.kind === 'throw-panel' && sa > 0
            if (p.kind === 'end') {
              return (
                <ellipse
                  key={i}
                  cx={x + p.w / 2}
                  cy={y + p.h / 2}
                  rx={p.w / 2}
                  ry={p.h / 2}
                  {...common}
                />
              )
            }
            if (p.polygon) {
              const cutPts = p.polygon.map((pt) => `${x + pt.x},${y + pt.y}`).join(' ')
              const saPoly = showSa ? insetPolygon(p.polygon, sa) : null
              return (
                <g key={i}>
                  <polygon points={cutPts} {...common} />
                  {saPoly && (
                    <polygon
                      points={saPoly.map((pt) => `${x + pt.x},${y + pt.y}`).join(' ')}
                      {...saProps}
                    />
                  )}
                </g>
              )
            }
            const saW = p.w - 2 * sa
            const saH = p.h - 2 * sa
            return (
              <g key={i}>
                <rect x={x} y={y} width={p.w} height={p.h} {...common} />
                {showSa && saW > 0 && saH > 0 && (
                  <rect x={x + sa} y={y + sa} width={saW} height={saH} {...saProps} />
                )}
              </g>
            )
          })}
          {model.leftoverAcrossIn > 0.1 && (
            <rect
              x={pad + (fabricW - model.leftoverAcrossIn)}
              y={pad}
              width={model.leftoverAcrossIn}
              height={len}
              fill="none"
              stroke={DIAGRAM_SR_BLUE}
              strokeDasharray="3 3"
              opacity={0.5}
              style={{ vectorEffect: 'non-scaling-stroke', strokeWidth: 1 }}
            />
          )}
        </svg>
      </div>
      <div className="pillow-nest-captions">
        <p className="text-xs text-base-content">{boltCaption}</p>
        <p className="text-sm text-base-content">{piecesCaption}</p>
      </div>
    </>
  )
}
