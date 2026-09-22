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
    expect(alert.className).toMatch(/items-start/)
    expect(alert.className).toMatch(/gap-3/)

    const copy = alert.querySelector('p')
    expect(copy).toBeTruthy()
    expect(copy!.className).toMatch(/min-w-0/)
    expect(copy!.className).toMatch(/flex-1/)
    expect(copy!.className).toMatch(/break-words/)

    const dismiss = screen.getByRole('button', { name: /Dismiss/i })
    expect(dismiss.className).toMatch(/shrink-0/)
    await user.click(dismiss)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })
})
