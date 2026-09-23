/**
 * Fill / fit style — UX labels mapped from Sailrite Videos Expert corpus.
 * These are NOT official Sailrite product names; override if Expert revises.
 *
 * Throw (knife-edge), with seam allowance SA all around (finished ≈ cut − 2×SA):
 *   Flat:     cut = form + 2×SA  → finished ≈ form
 *   Standard: cut = form         → finished ≈ form − 2×SA   (default)
 *   Plump:    cut = form − 2×SA  → finished ≈ form − 4×SA
 * At SA = ½″ this matches the classic Flat +1 / Standard 0 / Plump −1 deltas.
 *
 * Bolster patterning add to diameter & length (do not stack with a second SA add —
 * bolster SA is entangled in fill patterning; throw owns the explicit SA control):
 *   Flat / Standard: +1"
 *   Plump:           +1/2"
 * Circumference uses finished diameter ≈ (form + add − 1") + closure overlap.
 */

export type FillStyle = 'flat' | 'standard' | 'plump'

/** @deprecated Prefer throwCutDelta(sa). Kept for tests documenting SA=0.5 defaults. */
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
  flat: 'Cut = form + 2×SA → finished ≈ form.',
  standard: 'Cut = form → finished ≈ form − 2×SA.',
  plump: 'Cut = form − 2×SA → finished ≈ form − 4×SA.',
}

export const BOLSTER_FILL_HELP: Record<FillStyle, string> = {
  flat: '+1″ to diameter & length.',
  standard: '+1″ patterning add (default).',
  plump: '+½″ patterning add (tighter).',
}

/** Bolster does not use the throw SA control — fill patterning add already encodes fit. */
export const BOLSTER_SA_NOTE =
  'Bolster cut sizes use fill patterning add (not a separate seam-allowance control).'

export const DEFAULT_FILL_STYLE: FillStyle = 'standard'

export function throwCutDelta(fill: FillStyle, seamAllowanceIn: number): number {
  if (fill === 'flat') return 2 * seamAllowanceIn
  if (fill === 'plump') return -2 * seamAllowanceIn
  return 0
}

export function throwCutFace(
  formInches: number,
  fill: FillStyle,
  seamAllowanceIn = 0.5,
): number {
  return Math.max(0.1, formInches + throwCutDelta(fill, seamAllowanceIn))
}

export function throwFinishedFace(
  formInches: number,
  fill: FillStyle,
  seamAllowanceIn = 0.5,
): number {
  return throwCutFace(formInches, fill, seamAllowanceIn) - 2 * seamAllowanceIn
}

export function bolsterPatterningAdd(fill: FillStyle): number {
  return BOLSTER_PATTERNING_ADD_IN[fill]
}
