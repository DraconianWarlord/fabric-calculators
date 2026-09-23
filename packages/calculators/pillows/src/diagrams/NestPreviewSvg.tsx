import { useEffect, useRef, useState, type CSSProperties } from 'react'
import {
  DIAGRAM_CUT_FILL,
  DIAGRAM_FINISHED_DASH,
  DIAGRAM_SR_BLUE,
} from '@sailrite/calc-shell'
import { insetPolygon } from '../lib/insetPolygon'
import { patternHOffset, yardMajorInches, type NestPreviewModel } from '../lib/nestPreview'
import { fromInches, type Unit } from '../lib/throwPillows'

function fmt(inches: number, unit: Unit): string {
  const v = fromInches(inches, unit)
  return unit === 'in'
    ? Number.isInteger(v)
      ? String(v)
      : v.toFixed(2).replace(/\.?0+$/, '')
    : v.toFixed(0)
}

/** Minimum px per fabric inch so a tiny pane still draws (Nesting PX_PER_IN_MIN). */
const PX_PER_IN_MIN = 1
/** Fixed pad (user px) around bolt — Nesting has none; we keep a small gutter. */
const PAD_PX = 8

/**
 * Nesting: pxPerIn = availableWidthPx / fabricWidthIn so SVG user-space ≈ CSS
 * pixels (explicit width/height, not width:100%). Then CSS font-size:13px tick
 * labels stay ~13 screen px. A fixed NEST_PX_PER_IN + width:100% scaled the
 * whole SVG and blew labels into giant mid-bolt “2 yd” ghosts.
 */
function computeNestPxPerIn(availableWidthPx: number, fabricWidthIn: number): number {
  const usable = Math.max(40, availableWidthPx - PAD_PX * 2)
  return Math.max(PX_PER_IN_MIN, usable / Math.max(fabricWidthIn, 1e-6))
}

/** Constant screen stroke when SVG is near 1:1; kept for crispness if slightly scaled. */
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
const YARD_TICK_STROKE: CSSProperties = {
  vectorEffect: 'non-scaling-stroke',
  strokeWidth: 1.75,
}

/**
 * Nest preview: SVG/stage only + captions as sibling children of the card body.
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
  const stageRef = useRef<HTMLDivElement>(null)
  const [pxPerIn, setPxPerIn] = useState(PX_PER_IN_MIN)

  const fabricWIn = Math.max(model.fabricWidthIn, 1)
  const lenIn = Math.max(model.lengthInches, 1)

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const update = () => {
      setPxPerIn(computeNestPxPerIn(el.clientWidth, fabricWIn))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [fabricWIn])

  const s = (inches: number) => inches * pxPerIn
  const pad = PAD_PX
  const fabricW = s(fabricWIn)
  const len = s(lenIn)
  const svgW = fabricW + pad * 2
  const svgH = len + pad * 2
  const hOffIn = patternHOffset(fabricWIn, hRepeatIn)
  const showGrid = hRepeatIn > 0 || vRepeatIn > 0
  const saIn = Math.max(0, seamAllowanceIn)
  const yardMajors = yardMajorInches(lenIn)

  if (model.panels.length === 0) {
    return (
      <p className="text-sm text-base-content" role="status">
        No panels to nest — check size and quantity.
      </p>
    )
  }

  const boltCaption = `Bolt ${fmt(fabricWIn, unit)} ${unit} wide · ${fmt(lenIn, unit)} ${unit} along`
  const piecesCaption =
    `${model.panels.length} piece${model.panels.length === 1 ? '' : 's'}` +
    (model.leftoverAcrossIn > 0.1
      ? ` · leftover ~${fmt(model.leftoverAcrossIn, unit)} ${unit} across`
      : '')

  return (
    <>
      <div className="pillow-nest-stage" ref={stageRef}>
        <svg
          className="pillow-diagram pillow-nest-preview"
          width={svgW}
          height={svgH}
          viewBox={`0 0 ${svgW} ${svgH}`}
          role="img"
          aria-label="Panel nest preview on fabric bolt"
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
                Array.from({
                  length: Math.ceil((fabricWIn - hOffIn) / hRepeatIn) + 2,
                }).map((_, i) => {
                  const xIn = hOffIn + i * hRepeatIn
                  if (xIn < -1e-6 || xIn > fabricWIn + 1e-6) return null
                  const x = pad + s(xIn)
                  return <line key={`v${i}`} x1={x} y1={pad} x2={x} y2={pad + len} />
                })}
              {vRepeatIn > 0 &&
                Array.from({ length: Math.ceil(lenIn / vRepeatIn) + 2 }).map((_, i) => {
                  const yIn = i * vRepeatIn
                  if (yIn > lenIn + 1e-6) return null
                  const y = pad + s(yIn)
                  return (
                    <line key={`h${i}`} x1={pad} y1={y} x2={pad + fabricW} y2={y} />
                  )
                })}
            </g>
          )}
          {yardMajors.map((yIn) => {
            if (yIn > lenIn + 1e-6) return null
            const yd = yIn / 36
            const y = pad + s(yIn)
            // Nesting: left-edge labels in 1:1 user≈CSS px space
            return (
              <g key={`y-${yIn}`}>
                <line
                  x1={pad}
                  x2={pad + fabricW}
                  y1={y}
                  y2={y}
                  className="tick tick-major"
                  stroke="rgba(20, 20, 20, 0.7)"
                  style={YARD_TICK_STROKE}
                />
                <text
                  x={pad + 4}
                  y={yIn === 0 ? pad + 12 : Math.max(pad + 12, y - 4)}
                  className="tick-label"
                >
                  {yd === 0 ? '0' : `${yd} yd`}
                </text>
              </g>
            )
          })}
          {model.panels.map((p, i) => {
            const x = pad + s(p.x)
            const y = pad + s(p.y)
            const w = s(p.w)
            const h = s(p.h)
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
            const showSa = p.kind === 'throw-panel' && saIn > 0
            if (p.kind === 'end') {
              return (
                <ellipse
                  key={i}
                  cx={x + w / 2}
                  cy={y + h / 2}
                  rx={w / 2}
                  ry={h / 2}
                  {...common}
                />
              )
            }
            if (p.polygon) {
              const cutPts = p.polygon
                .map((pt) => `${pad + s(p.x + pt.x)},${pad + s(p.y + pt.y)}`)
                .join(' ')
              const saPoly = showSa ? insetPolygon(p.polygon, saIn) : null
              return (
                <g key={i}>
                  <polygon points={cutPts} {...common} />
                  {saPoly && (
                    <polygon
                      points={saPoly
                        .map((pt) => `${pad + s(p.x + pt.x)},${pad + s(p.y + pt.y)}`)
                        .join(' ')}
                      {...saProps}
                    />
                  )}
                </g>
              )
            }
            const saPx = s(saIn)
            const saW = w - 2 * saPx
            const saH = h - 2 * saPx
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} {...common} />
                {showSa && saW > 0 && saH > 0 && (
                  <rect x={x + saPx} y={y + saPx} width={saW} height={saH} {...saProps} />
                )}
              </g>
            )
          })}
        </svg>
      </div>
      <div className="pillow-nest-captions">
        <p className="text-xs text-base-content">{boltCaption}</p>
        <p className="text-sm text-base-content">{piecesCaption}</p>
      </div>
    </>
  )
}

/** @deprecated kept for tests that asserted the old constant — prefer ResizeObserver fit. */
export const NEST_PX_PER_IN = 8
