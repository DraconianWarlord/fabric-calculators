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
 * Bolsters use their own Regular/Tight fit control and do not use these throw fill styles.
 */

export type FillStyle = 'flat' | 'standard' | 'plump'

/** @deprecated Prefer throwCutDelta(sa). Kept for tests documenting SA=0.5 defaults. */
export const THROW_CUT_DELTA_IN: Record<FillStyle, number> = {
  flat: 1,
  standard: 0,
  plump: -1,
}

export const FILL_STYLE_HELP: Record<FillStyle, string> = {
  flat: 'Cut = form + 2×SA → finished ≈ form.',
  standard: 'Cut = form → finished ≈ form − 2×SA.',
  plump: 'Cut = form − 2×SA → finished ≈ form − 4×SA.',
}

/** Bolster does not use the throw SA control — its fit rule encodes the cut sizes. */
export const BOLSTER_SA_NOTE =
  'Bolster cut sizes use the fit rule (not a separate seam-allowance control).'

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
