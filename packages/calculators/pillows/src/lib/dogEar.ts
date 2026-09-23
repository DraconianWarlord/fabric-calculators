/**
 * Knife-edge dog-ear corner trim (throw only).
 *
 * Sailrite “How to Sew a Throw Pillow” (howto + video youtu.be/-Esvp31f65o ~3:19):
 * 1. Mark ½″ from the corner along each edge (SA reference)
 * 2. Trim distance = overall width ÷ 4 (e.g. 18″ → 4½″) — NO 2.5″ cap
 * 3. Strike a diagonal wedge that intersects the ½″ mark / opposite edge;
 *    same on both sides of the corner; cut the wedge (both layers / all corners)
 *
 * Preview geometry: measure uncapped side÷4 along each edge from the corner →
 * octagon (same magnitude family as the Sailrite wedge; not a square chop).
 * ReferenceSvg and NestPreviewSvg MUST use dogEarPanelPolygon — one path.
 */

export const DOG_EAR_SA_MARK_IN = 0.5
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
  return [
    { x: tw, y: 0 },
    { x: widthIn - tw, y: 0 },
    { x: widthIn, y: tl },
    { x: widthIn, y: lengthIn - tl },
    { x: widthIn - tw, y: lengthIn },
    { x: tw, y: lengthIn },
    { x: 0, y: lengthIn - tl },
    { x: 0, y: tl },
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

export function dogEarSaMarks(
  widthIn: number,
  lengthIn: number,
): { corner: string; a: Point; b: Point }[] {
  const s = DOG_EAR_SA_MARK_IN
  return [
    { corner: 'tl', a: { x: s, y: 0 }, b: { x: 0, y: s } },
    { corner: 'tr', a: { x: widthIn - s, y: 0 }, b: { x: widthIn, y: s } },
    { corner: 'br', a: { x: widthIn - s, y: lengthIn }, b: { x: widthIn, y: lengthIn - s } },
    { corner: 'bl', a: { x: s, y: lengthIn }, b: { x: 0, y: lengthIn - s } },
  ]
}

export const DOG_EAR_CUT_LIST_NOTE =
  'corners trimmed to reduce dog-ears (1/2" SA mark; trim at side÷4 each edge — Sailrite throw-pillow howto / video -Esvp31f65o ~3:19)'

export const DOG_EAR_OPTIONAL_NOTE =
  'Optional — ½″ SA marks + side÷4 wedge (Sailrite). Some zipper+piping methods skip this.'
