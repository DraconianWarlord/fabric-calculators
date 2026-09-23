/**
 * Knife-edge dog-ear corner trim (throw only).
 *
 * Videos Expert / Sailrite practice:
 * 1. Mark 1/2" in from each corner along both edges (SA reference)
 * 2. From corner along each edge measure side_length / 4
 * 3. Cut wedge through that point (both layers)
 *
 * Cap: min(side÷4, DOG_EAR_TRIM_CAP_IN). Uncapped side÷4 on large
 * knife-edge panels (e.g. 18" → 4.5") reads as a dramatic octagon in
 * reference + nest; 2.5" keeps the same geometry family but calmer.
 * ReferenceSvg and NestPreviewSvg MUST use dogEarPanelPolygon — one path.
 */

export const DOG_EAR_SA_MARK_IN = 0.5
export const DOG_EAR_TRIM_FRACTION = 0.25
/** Max trim along each edge (inches) — tones down cartoon octagons. */
export const DOG_EAR_TRIM_CAP_IN = 2.5

export type Point = { x: number; y: number }

export function dogEarTrimAlongEdge(sideLengthIn: number): number {
  return Math.min(sideLengthIn * DOG_EAR_TRIM_FRACTION, DOG_EAR_TRIM_CAP_IN)
}

export function dogEarPanelPolygon(widthIn: number, lengthIn: number): Point[] {
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
  'corners trimmed to reduce dog-ears (1/2" SA mark; trim at min(side÷4, 2.5") each edge)'

export const DOG_EAR_OPTIONAL_NOTE =
  'Optional — ½″ SA marks + side÷4 wedge (capped at 2.5″). Some zipper+piping methods skip this.'
