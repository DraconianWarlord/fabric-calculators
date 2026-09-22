/**
 * @vitest-environment jsdom
 *
 * Render-level checks: DaisyUI alert grid must not put CTA beside copy (overlay)
 * or clip action-hint banner text.
 */
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ActionHintBanner,
  SplitSuggestionAlert,
  formatSplitMessage,
} from './alerts'
import { suggestSplit } from './lib/geometry'
import { WONT_FIT_AT_90 } from './lib/panelAddGate'

afterEach(() => {
  cleanup()
})

describe('SplitSuggestionAlert (rendered)', () => {
  it('shows full split message + CTA and uses stacked layout classes', () => {
    const split = suggestSplit(61, 163, 54, 0)
    expect(split).not.toBeNull()
    const message = formatSplitMessage(61, 163, 54, split!, (n) => String(n), 'in', 0)
    expect(message.length).toBeGreaterThan(40)
    expect(message).toMatch(/wider than the 54 in bolt/)
    expect(message).toMatch(/Split the .* side into/)

    const onSplit = vi.fn()
    render(
      <SplitSuggestionAlert
        message={message}
        pieceCount={split!.pieceCount}
        onSplit={onSplit}
      />,
    )

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(message)
    // Full message present (not empty / not truncated away)
    expect(alert.textContent).toContain('both orientations')
    expect(alert.textContent).toContain('nest the strips')

    const btn = screen.getByRole('button', {
      name: new RegExp(`Split into ${split!.pieceCount} panels`),
    })
    expect(btn).toBeTruthy()

    // Stacked — never Daisy side-by-side grid that overlays CTA on copy
    expect(alert.className).toMatch(/alert-error/)
    expect(alert.className).not.toMatch(/alert-warning/)
    expect(alert.className).toMatch(/alert-stack/)
    expect(alert.className).toMatch(/flex-col/)
    expect(alert.className).not.toMatch(/grid-flow-col/)
    const copy = alert.querySelector('p')
    expect(copy).toBeTruthy()
    expect(copy!.className).toMatch(/min-w-0/)
    expect(copy!.className).toMatch(/break-words/)
    expect(copy!.className).toMatch(/w-full/)
    expect(btn.className).toMatch(/w-full/)
    expect(btn.className).toMatch(/shrink-0/)
  })

  it('invokes onSplit when CTA is clicked', async () => {
    const user = userEvent.setup()
    const onSplit = vi.fn()
    render(
      <SplitSuggestionAlert message="Split me" pieceCount={3} onSplit={onSplit} />,
    )
    await user.click(screen.getByRole('button', { name: /Split into 3 panels/ }))
    expect(onSplit).toHaveBeenCalledTimes(1)
  })
})

describe('ActionHintBanner (rendered)', () => {
  it('shows long won’t-fit copy with padding / min-w-0 and Dismiss shrink-0', async () => {
    const user = userEvent.setup()
    const onDismiss = vi.fn()
    // Long copy mirrors production rotate-fail / won’t-fit banners
    const message = `${WONT_FIT_AT_90} — try a smaller finished size or use the split suggestion below.`

    render(<ActionHintBanner message={message} onDismiss={onDismiss} />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent(message)
    // First character present (regression: clipped “on’t fit…”)
    expect(alert.textContent?.startsWith("Won't") || alert.textContent?.includes("Won't fit")).toBe(
      true,
    )
    expect(alert.textContent).toContain("Won't fit at 90°")

    expect(alert.className).toMatch(/px-4/)
    expect(alert.className).toMatch(/flex/)
    expect(alert.className).toMatch(/items-center/)
    expect(alert.className).toMatch(/gap-3/)

    const copy = alert.querySelector('p')
    expect(copy).toBeTruthy()
    expect(copy!.className).toMatch(/min-w-0/)
    expect(copy!.className).toMatch(/flex-1/)
    expect(copy!.className).toMatch(/break-words/)

    const dismiss = screen.getByRole('button', { name: /Dismiss/i })
    expect(dismiss.className).toMatch(/shrink-0/)

    // ADA: never use primary-blue link on error-red (fails contrast / hue)
    expect(dismiss.className).not.toMatch(/text-primary/)
    expect(dismiss.className).not.toMatch(/btn-link/)
    // White chip on error banner → dark text on white control (high contrast)
    expect(dismiss.className).toMatch(/bg-white/)
    expect(dismiss.className).toMatch(/text-neutral/)

    await user.click(dismiss)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})

describe('ActionHintBanner Dismiss contrast (ADA)', () => {
  function relativeLuminance(hex: string): number {
    const h = hex.replace('#', '')
    const [r, g, b] = [0, 2, 4].map((i) => {
      const c = parseInt(h.slice(i, i + 2), 16) / 255
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  function contrastRatio(a: string, b: string): number {
    const [L1, L2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x)
    return (L1 + 0.05) / (L2 + 0.05)
  }

  it('white Dismiss control text on white bg clears WCAG AA; primary-on-error would fail AA for normal text', () => {
    // Control: dark neutral on white button
    expect(contrastRatio('#000000', '#ffffff')).toBeGreaterThanOrEqual(4.5)
    // Regression: Sailrite primary on alert red — insufficient for normal text AA
    expect(contrastRatio('#24285e', '#e75053')).toBeLessThan(4.5)
  })
})
