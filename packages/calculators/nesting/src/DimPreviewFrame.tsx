import type { ReactNode } from 'react'
import {
  DIAGRAM_CUT_STROKE_WIDTH,
  DIAGRAM_FINISHED_DASH,
  DIAGRAM_FINISHED_STROKE_WIDTH,
  DIAGRAM_SR_BLUE,
} from '@sailrite/calc-shell'

export const DIM_PREVIEW_VIEWBOX = '0 0 320 240' as const

type Props = {
  /** Accessible name for the figure */
  'aria-label': string
  /** Shape-specific class for regression hooks (e.g. rect-dims-figure) */
  className?: string
  /** Drawing svg only — cut + finished + dim labels */
  children: ReactNode
}

/**
 * Shared Nesting dim-preview frame: 4:3 stage (max 20rem) + Cut/Finished key below.
 * Drawing and key are siblings — never put the legend inside the stage svg.
 */
export function DimPreviewFrame({
  'aria-label': ariaLabel,
  className,
  children,
}: Props) {
  return (
    <figure
      className={['dim-preview-frame', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
    >
      <div className="dim-preview-stage bg-base-200 rounded-box">{children}</div>
      <DimPreviewKey />
    </figure>
  )
}

/** HTML key under the stage (full width). Uses diagram B stroke tokens. */
function DimPreviewKey() {
  return (
    <div className="dim-preview-key" aria-hidden="true">
      <span className="dim-preview-key-item">
        <svg
          className="dim-preview-key-swatch"
          width="16"
          height="10"
          viewBox="0 0 16 10"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="5"
            x2="16"
            y2="5"
            stroke={DIAGRAM_SR_BLUE}
            strokeWidth={DIAGRAM_CUT_STROKE_WIDTH}
          />
        </svg>
        Cut (solid)
      </span>
      <span className="dim-preview-key-sep" aria-hidden="true">
        ·
      </span>
      <span className="dim-preview-key-item">
        <svg
          className="dim-preview-key-swatch"
          width="16"
          height="10"
          viewBox="0 0 16 10"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="5"
            x2="16"
            y2="5"
            stroke={DIAGRAM_SR_BLUE}
            strokeWidth={DIAGRAM_FINISHED_STROKE_WIDTH}
            strokeDasharray={DIAGRAM_FINISHED_DASH}
          />
        </svg>
        Finished (dashed)
      </span>
    </div>
  )
}
