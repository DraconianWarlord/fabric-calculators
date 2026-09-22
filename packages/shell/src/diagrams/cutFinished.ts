/**
 * Suite diagram standard B — Nested cut / finished
 * Locked by Zach for Nesting, Pillows, and future calculators.
 * See docs/DIAGRAM-STYLE.md
 */

/** Sailrite Blue — cut + finished strokes */
export const DIAGRAM_SR_BLUE = '#24285e'

/** Light primary tint for cut (outer) fill */
export const DIAGRAM_CUT_FILL = '#e8eaf6'

/** Finished (inner) fill: transparent / none */
export const DIAGRAM_FINISHED_FILL = 'none'

export const DIAGRAM_CUT_STROKE_WIDTH = 2
export const DIAGRAM_FINISHED_STROKE_WIDTH = 1.5
export const DIAGRAM_FINISHED_DASH = '4 3'

/** SVG spread props for the cut (outer) outline */
export function cutShapeSvgProps(): {
  fill: string
  stroke: string
  strokeWidth: number
} {
  return {
    fill: DIAGRAM_CUT_FILL,
    stroke: DIAGRAM_SR_BLUE,
    strokeWidth: DIAGRAM_CUT_STROKE_WIDTH,
  }
}

/** SVG spread props for the finished (inner) dashed outline */
export function finishedShapeSvgProps(): {
  fill: string
  stroke: string
  strokeWidth: number
  strokeDasharray: string
} {
  return {
    fill: DIAGRAM_FINISHED_FILL,
    stroke: DIAGRAM_SR_BLUE,
    strokeWidth: DIAGRAM_FINISHED_STROKE_WIDTH,
    strokeDasharray: DIAGRAM_FINISHED_DASH,
  }
}

export const DIAGRAM_STYLE = {
  srBlue: DIAGRAM_SR_BLUE,
  cutFill: DIAGRAM_CUT_FILL,
  finishedFill: DIAGRAM_FINISHED_FILL,
  cutStrokeWidth: DIAGRAM_CUT_STROKE_WIDTH,
  finishedStrokeWidth: DIAGRAM_FINISHED_STROKE_WIDTH,
  finishedDash: DIAGRAM_FINISHED_DASH,
} as const
