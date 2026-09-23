/**
 * Knife-edge dog-ear corner trim (throw only).
 *
 * Sailrite “How to Sew a Throw Pillow” (howto + video youtu.be/-Esvp31f65o ~3:19):
 * 1. From the corner, mark side ÷ 4 along each adjacent edge (18″ → 4½″)
 * 2. Mark ½″ in from the corner (both directions → construction point at (0.5, 0.5)
 *    in corner-local coords). This is a construction mark, NOT seam allowance.
 * 3. Strike a line from each side÷4 edge mark to that ½″ corner mark; cut the wedge.
 * 4. Repeat all corners. Dog-ear math ignores seamAllowanceIn entirely.
 *
 * Preview geometry: 12-gon — per corner: edge mark → ½″ inset → other edge mark.
 * Nest cut panels (nestPreview → NestPreviewSvg) MUST use dogEarPanelPolygon — one path.
 * Throw fill Reference is side/loft (not a fabric plate) and does not draw dog-ear.
 */

/** ½″ construction mark inset from the corner (not seam allowance). */
export const DOG_EAR_CORNER_MARK_IN = 0.5
export const DOG_EAR_TRIM_FRACTION = 0.25

export type Point = { x: number; y: number }

/** Trim distance along each edge from the corner: side ÷ 4. */
export function dogEarTrimAlongEdge(sideLengthIn: number): number {
  return sideLengthIn * DOG_EAR_TRIM_FRACTION
}

export function dogEarPanelPolygon(widthIn: number, lengthIn: number): Point[] {
  // Clamp so trim stays strictly under half the side (degenerate edge guard).
  const tw = Math.min(dogEarTrimAlongEdge(widthIn), Math.max(0, widthIn / 2 - 1e-6))
  const tl = Math.min(dogEarTrimAlongEdge(lengthIn), Math.max(0, lengthIn / 2 - 1e-6))
  // Inset must sit inside the wedge (before the edge marks).
  const h = Math.min(DOG_EAR_CORNER_MARK_IN, Math.max(0, Math.min(tw, tl) - 1e-6))
  // Clockwise from top edge: 3 pts × 4 corners = 12-gon.
  return [
    { x: tw, y: 0 },
    { x: widthIn - tw, y: 0 },
    { x: widthIn - h, y: h }, // TR inset
    { x: widthIn, y: tl },
    { x: widthIn, y: lengthIn - tl },
    { x: widthIn - h, y: lengthIn - h }, // BR inset
    { x: widthIn - tw, y: lengthIn },
    { x: tw, y: lengthIn },
    { x: h, y: lengthIn - h }, // BL inset
    { x: 0, y: lengthIn - tl },
    { x: 0, y: tl },
    { x: h, y: h }, // TL inset
  ]
}

export function dogEarPolygonPointsAttr(
  widthIn: number,
  lengthIn: number,
  scale: number,
  ox = 0,
  oy = 0,
): string {
  return dogEarPanelPolygon(widthIn, lengthIn)
    .map((p) => `${ox + p.x * scale},${oy + p.y * scale}`)
    .join(' ')
}

/** ½″ corner construction marks (one inset point per corner). Not seam allowance. */
export function dogEarCornerMarks(
  widthIn: number,
  lengthIn: number,
): { corner: string; p: Point }[] {
  const tw = Math.min(dogEarTrimAlongEdge(widthIn), Math.max(0, widthIn / 2 - 1e-6))
  const tl = Math.min(dogEarTrimAlongEdge(lengthIn), Math.max(0, lengthIn / 2 - 1e-6))
  const h = Math.min(DOG_EAR_CORNER_MARK_IN, Math.max(0, Math.min(tw, tl) - 1e-6))
  return [
    { corner: 'tl', p: { x: h, y: h } },
    { corner: 'tr', p: { x: widthIn - h, y: h } },
    { corner: 'br', p: { x: widthIn - h, y: lengthIn - h } },
    { corner: 'bl', p: { x: h, y: lengthIn - h } },
  ]
}

/** Short cut-list / materials tag (no video citation — that overflows PDF Piece cells). */
export const DOG_EAR_CUT_LIST_NOTE = 'dog-ear trim (½″ corner mark)'

export const DOG_EAR_OPTIONAL_NOTE =
  'Optional — side÷4 to ½″ corner mark wedge (Sailrite; ignores SA). Some zipper+piping methods skip this.'
