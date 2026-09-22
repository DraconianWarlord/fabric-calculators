import {
  DIAGRAM_FINISHED_DASH,
  DIAGRAM_FINISHED_STROKE_WIDTH,
  DIAGRAM_CUT_STROKE_WIDTH,
  DIAGRAM_SR_BLUE,
} from './cutFinished'

type Props = {
  x?: number
  y?: number
  /** Optional compact label text override */
  cutLabel?: string
  finishedLabel?: string
}

/**
 * Small SVG legend: Cut = solid · Finished = dashed (suite standard B).
 */
export function CutFinishedLegend({
  x = 0,
  y = 0,
  cutLabel = 'Cut (solid)',
  finishedLabel = 'Finished (dashed)',
}: Props) {
  return (
    <g
      transform={`translate(${x}, ${y})`}
      className="diag-cut-finished-legend"
      aria-hidden="true"
    >
      <line
        x1={0}
        y1={0}
        x2={14}
        y2={0}
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={DIAGRAM_CUT_STROKE_WIDTH}
      />
      <text
        x={20}
        y={4}
        fontSize={10}
        fill="#555"
        fontFamily="system-ui,sans-serif"
      >
        {cutLabel}
      </text>
      <line
        x1={0}
        y1={16}
        x2={14}
        y2={16}
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={DIAGRAM_FINISHED_STROKE_WIDTH}
        strokeDasharray={DIAGRAM_FINISHED_DASH}
      />
      <text
        x={20}
        y={20}
        fontSize={10}
        fill="#555"
        fontFamily="system-ui,sans-serif"
      >
        {finishedLabel}
      </text>
    </g>
  )
}
