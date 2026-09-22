/**
 * Fill / fit style — UX labels mapped from Sailrite Videos Expert corpus.
 * These are NOT official Sailrite product names; override if Expert revises.
 *
 * Throw (knife-edge), with ~1/2" SA all around (finished ≈ cut − 1"):
 *   Flat:     cut = form + 1"  → finished ≈ form
 *   Standard: cut = form       → finished ≈ form − 1"   (default)
 *   Plump:    cut = form − 1"  → finished ≈ form − 2"
 *
 * Bolster patterning add to diameter & length (do not stack with a second SA add):
 *   Flat / Standard: +1"
 *   Plump:           +1/2"
 * Circumference uses finished diameter ≈ (form + add − 1") + closure overlap.
 */

export type FillStyle = 'flat' | 'standard' | 'plump'

export const THROW_CUT_DELTA_IN: Record<FillStyle, number> = {
  flat: 1,
  standard: 0,
  plump: -1,
}

export const BOLSTER_PATTERNING_ADD_IN: Record<FillStyle, number> = {
  flat: 1,
  standard: 1,
  plump: 0.5,
}

export const FILL_STYLE_HELP: Record<FillStyle, string> = {
  flat: 'Flat: cut = form + 1" → finished cover ≈ form (looser).',
  standard: 'Standard: cut = form → finished ≈ form − 1" (modern tutorials).',
  plump: 'Plump: cut = form − 1" → finished ≈ form − 2" (classic undersize).',
}

export const BOLSTER_FILL_HELP: Record<FillStyle, string> = {
  flat: 'Flat: +1" to diameter & length (near-form finish with 1/2" SA).',
  standard: 'Standard: +1" patterning add to diameter & length.',
  plump: 'Plump: +1/2" patterning add (tighter / plumper cover).',
}

export const DEFAULT_FILL_STYLE: FillStyle = 'standard'

export function throwCutFace(formInches: number, fill: FillStyle): number {
  return Math.max(0.1, formInches + THROW_CUT_DELTA_IN[fill])
}

export function throwFinishedFace(formInches: number, fill: FillStyle): number {
  return throwCutFace(formInches, fill) - 1
}

export function bolsterPatterningAdd(fill: FillStyle): number {
  return BOLSTER_PATTERNING_ADD_IN[fill]
}
