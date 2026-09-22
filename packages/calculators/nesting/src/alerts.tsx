import type { SplitSuggestion, Unit } from './lib/geometry'

export function formatSplitMessage(
  cutW: number,
  cutL: number,
  fabricWidth: number,
  s: SplitSuggestion,
  displayFn: (inches: number) => string,
  unit: Unit,
  seamAllowance: number,
): string {
  const saNote = seamAllowance > 0 ? ' (plus seam allowance on joins)' : ''
  return `This cut piece (${displayFn(cutW)}×${displayFn(cutL)} ${unit}) is wider than the ${displayFn(fabricWidth)} ${unit} bolt in both orientations. Split the ${displayFn(s.overSize)} ${unit} side into ${s.pieceCount} panels of ~${displayFn(s.pieceCutApprox)} ${unit}${saNote} and nest the strips.`
}

type SplitSuggestionAlertProps = {
  message: string
  pieceCount: number
  onSplit: () => void
}

/**
 * Warning + CTA for oversized panels. Must stack vertically: DaisyUI `alert`
 * defaults to a multi-column grid that overlays the button on the copy.
 */
export function SplitSuggestionAlert({ message, pieceCount, onSplit }: SplitSuggestionAlertProps) {
  return (
    <div
      className="alert alert-warning alert-stack my-2 flex flex-col items-stretch gap-2 py-2 text-sm"
      role="alert"
    >
      <p className="w-full min-w-0 whitespace-normal break-words">{message}</p>
      <button type="button" className="btn btn-primary w-full shrink-0" onClick={onSplit}>
        Split into {pieceCount} panels
      </button>
    </div>
  )
}

type ActionHintBannerProps = {
  message: string
  onDismiss: () => void
}

/**
 * Error / action-hint banner under the header. Horizontal flex with padding so
 * long copy wraps and Dismiss does not clip the first characters.
 */
export function ActionHintBanner({ message, onDismiss }: ActionHintBannerProps) {
  return (
    <div
      className="alert alert-error mx-3 mt-2 mb-2 flex items-start gap-3 px-4 py-2 text-sm font-semibold"
      role="alert"
    >
      <p className="min-w-0 flex-1 whitespace-normal break-words">{message}</p>
      <button
        type="button"
        className="btn btn-sm shrink-0 border-0 bg-white text-neutral hover:bg-white/90"
        onClick={onDismiss}
      >
        Dismiss
      </button>
    </div>
  )
}
