import { describe, expect, it } from 'vitest'
import { contrastingInkOnFill } from './colorContrast'
import { PANEL_COLORS } from './geometry'

describe('contrastingInkOnFill', () => {
  it('returns white on dark Sailrite blues/teals', () => {
    expect(contrastingInkOnFill('#24285e')).toBe('#ffffff') // SR Blue
    expect(contrastingInkOnFill('#2a33ab')).toBe('#ffffff') // indigo
    expect(contrastingInkOnFill('#00796b')).toBe('#ffffff') // teal
    expect(contrastingInkOnFill('#007dc6')).toBe('#ffffff') // accent blue
  })

  it('returns dark ink on light/amber fills', () => {
    expect(contrastingInkOnFill('#f1a500')).toBe('#111111') // amber
    expect(contrastingInkOnFill('#ffffff')).toBe('#111111')
    expect(contrastingInkOnFill('#eeeeee')).toBe('#111111')
  })

  it('accepts hex without leading # and falls back for invalid', () => {
    expect(contrastingInkOnFill('24285e')).toBe('#ffffff')
    expect(contrastingInkOnFill('not-a-color')).toBe('#111111')
    expect(contrastingInkOnFill('')).toBe('#111111')
  })

  it('picks a contrasting ink for every PANEL_COLORS entry', () => {
    for (const fill of PANEL_COLORS) {
      const ink = contrastingInkOnFill(fill)
      expect(['#ffffff', '#111111']).toContain(ink)
      // Ink must not equal the fill (exact match would be invisible)
      expect(ink.toLowerCase()).not.toBe(fill.toLowerCase())
    }
  })
})
