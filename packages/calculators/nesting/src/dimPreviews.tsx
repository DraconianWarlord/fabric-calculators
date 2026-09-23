import type { ReactNode } from 'react'
import { cutShapeSvgProps, finishedShapeSvgProps } from '@sailrite/calc-shell'
import { DimPreviewFrame, DIM_PREVIEW_VIEWBOX } from './DimPreviewFrame'

/** Dim label style — UX: ~10–11px, #333/#555, never Alert Red */
const LABEL = {
  fill: '#333',
  fontSize: 11,
  fontWeight: 700 as const,
  fontFamily: 'system-ui,sans-serif',
}
const LABEL_MUTED = { ...LABEL, fill: '#555', fontSize: 10, fontWeight: 600 as const }

type SvgProps = {
  title: string
}

function DimSvg({ title, children }: SvgProps & { children: ReactNode }) {
  return (
    <svg
      className="dim-preview-svg"
      viewBox={DIM_PREVIEW_VIEWBOX}
      role="img"
      aria-hidden="true"
    >
      <title>{title}</title>
      {children}
    </svg>
  )
}

/** Rectangle — width under cut; length beside; ≥6px clear of strokes */
export function RectDimPreview() {
  // Safe draw ~24,16 → 296,200. Cut letterboxed with room for side/bottom labels.
  const cut = { x: 68, y: 36, w: 184, h: 128 }
  const inset = 18
  const fin = {
    x: cut.x + inset,
    y: cut.y + inset,
    w: cut.w - inset * 2,
    h: cut.h - inset * 2,
  }
  const cx = cut.x + cut.w / 2
  const cy = cut.y + cut.h / 2
  return (
    <DimPreviewFrame
      className="rect-dims-figure"
      aria-label="Rectangle cut and finished dimensions"
    >
      <DimSvg title="Width and length">
        <rect
          x={cut.x}
          y={cut.y}
          width={cut.w}
          height={cut.h}
          rx="2"
          {...cutShapeSvgProps()}
        />
        <rect
          x={fin.x}
          y={fin.y}
          width={fin.w}
          height={fin.h}
          rx="2"
          {...finishedShapeSvgProps()}
        />
        {/* Width under cut */}
        <text
          x={cx}
          y={cut.y + cut.h + 18}
          textAnchor="middle"
          {...LABEL}
        >
          Width
        </text>
        {/* Length beside (left), ≥6px clear */}
        <text
          x={cut.x - 14}
          y={cy}
          textAnchor="middle"
          {...LABEL}
          transform={`rotate(-90 ${cut.x - 14} ${cy})`}
        >
          Length
        </text>
      </DimSvg>
    </DimPreviewFrame>
  )
}

/** Circle — diameter label below the cut */
export function CircleDimPreview() {
  const cx = 160
  const cy = 108
  const cutR = 72
  const finR = 54
  return (
    <DimPreviewFrame
      className="circle-dims-figure"
      aria-label="Circle cut and finished diameter"
    >
      <DimSvg title="Cut and finished diameter">
        <circle cx={cx} cy={cy} r={cutR} {...cutShapeSvgProps()} />
        <circle cx={cx} cy={cy} r={finR} {...finishedShapeSvgProps()} />
        <text x={cx} y={cy + cutR + 18} textAnchor="middle" {...LABEL_MUTED}>
          Diameter
        </text>
      </DimSvg>
    </DimPreviewFrame>
  )
}

/** Trapezoid — top/bottom/height outside cut */
export function TrapDimPreview() {
  // Cut: shorter top, longer bottom — letterboxed in safe rect
  const cutPts = '100,40 220,40 276,176 44,176'
  const finPts = '118,62 202,62 242,154 78,154'
  return (
    <DimPreviewFrame
      className="trap-dims-figure"
      aria-label="Trapezoid cut and finished dimensions"
    >
      <DimSvg title="Top width, bottom width, and height">
        <polygon points={cutPts} {...cutShapeSvgProps()} />
        <polygon points={finPts} {...finishedShapeSvgProps()} />
        <text x="160" y="30" textAnchor="middle" {...LABEL}>
          Top width
        </text>
        <text x="160" y="196" textAnchor="middle" {...LABEL}>
          Bottom width
        </text>
        <text
          x="292"
          y="110"
          textAnchor="middle"
          {...LABEL}
          transform="rotate(90 292 110)"
        >
          Height
        </text>
      </DimSvg>
    </DimPreviewFrame>
  )
}

/** Irregular — L/R/T/B outside; diagonal only if no collision */
export function IrregularDimPreview() {
  // BL, BR, TR, TL — letterboxed
  const cutPts = '56,176 248,176 278,48 42,72'
  const finPts = '74,160 230,160 250,68 64,88'
  return (
    <DimPreviewFrame
      className="irregular-dims-figure"
      aria-label="Irregular cut and finished dimensions"
    >
      <DimSvg title="Left, Bottom, Right, Top, and Diagonal">
        <polygon points={cutPts} {...cutShapeSvgProps()} />
        <polygon points={finPts} {...finishedShapeSvgProps()} />
        {/* Diagonal on finished — clear of edge labels */}
        <line
          x1="74"
          y1="160"
          x2="250"
          y2="68"
          stroke="#555"
          strokeWidth="1.25"
          strokeDasharray="4 3"
          opacity="0.85"
        />
        <text x="152" y="194" textAnchor="middle" {...LABEL}>
          Bottom
        </text>
        <text
          x="160"
          y="40"
          textAnchor="middle"
          {...LABEL}
          transform="rotate(-8 160 40)"
        >
          Top
        </text>
        <text
          x="36"
          y="128"
          textAnchor="middle"
          {...LABEL}
          transform="rotate(-90 36 128)"
        >
          Left
        </text>
        <text
          x="292"
          y="118"
          textAnchor="middle"
          {...LABEL}
          transform="rotate(90 292 118)"
        >
          Right
        </text>
        <text
          x="178"
          y="108"
          textAnchor="middle"
          {...LABEL_MUTED}
          transform="rotate(-28 178 108)"
        >
          Diagonal
        </text>
      </DimSvg>
    </DimPreviewFrame>
  )
}
