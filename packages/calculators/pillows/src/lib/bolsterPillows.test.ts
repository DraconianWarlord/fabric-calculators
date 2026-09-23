import { describe, expect, it } from 'vitest'
import {
  BOLSTER_PIPING_EASE_PER_PILLOW_IN,
  CLOSURE_OVERLAP_IN,
  CLOSURE_OVERLAP_TIPS_VELCRO_IN,
  REGULAR_SEAM_ALLOWANCE_IN,
  bolsterCuts,
  bolsterPipingInches,
  calculateBolster,
  nestBolster,
  zipperInches,
} from './bolsterPillows'

describe('bolster cut formulas', () => {
  it('documents 2″ closure overlap (tips list 2¼″ for Velcro)', () => {
    expect(CLOSURE_OVERLAP_IN).toBe(2)
    expect(CLOSURE_OVERLAP_TIPS_VELCRO_IN).toBe(2.25)
    expect(REGULAR_SEAM_ALLOWANCE_IN).toBe(0.5)
    expect(BOLSTER_PIPING_EASE_PER_PILLOW_IN).toBe(8)
  })

  it('Regular Fit: end = D+0.5, along = L+0.5, circ = π(D−0.5)+2', () => {
    const c = bolsterCuts(8, 20, 'regular')
    expect(c.endDiameterIn).toBe(8.5)
    expect(c.barrelAlongIn).toBe(20.5)
    expect(c.barrelCircIn).toBeCloseTo(Math.PI * 7.5 + 2, 5)
    expect(c.barrelCircIn).toBeCloseTo(25.56, 2)
  })

  it('Tight Fit: end = D, along = L, circ = π(D−1)+2', () => {
    const c = bolsterCuts(8, 20, 'tight')
    expect(c.endDiameterIn).toBe(8)
    expect(c.barrelAlongIn).toBe(20)
    expect(c.barrelCircIn).toBeCloseTo(Math.PI * 7 + 2, 2)
    expect(c.barrelCircIn).toBeCloseTo(23.99, 2)
  })
})

describe('live Sailrite bolster parity — Regular Horizontal 8×20 qty2 @54', () => {
  const r = calculateBolster({
    diameterIn: 8,
    lengthIn: 20,
    quantity: 2,
    fabricWidthIn: 54,
    pattern: 'horizontal',
    fit: 'regular',
  })

  it('cuts: end 8.5, barrel 20.5 × 25.56', () => {
    expect(r.cuts.endDiameterIn).toBe(8.5)
    expect(r.cuts.barrelAlongIn).toBe(20.5)
    expect(r.cuts.barrelCircIn).toBeCloseTo(25.56, 2)
  })

  it('yardage: 34.06 in / 0.95 yd exact, order 1 yd', () => {
    expect(r.nest.lengthInches).toBeCloseTo(34.06, 2)
    expect(r.nest.exactYards).toBeCloseTo(0.95, 2)
    expect(r.nest.orderYards).toBe(1)
  })

  it('optional piping: 123 in / 10.25 ft, order 11 ft', () => {
    expect(r.pipingIn).toBe(123)
    expect(r.pipingFt).toBeCloseTo(10.25, 2)
    expect(r.pipingOrderFt).toBe(11)
  })

  it('materials: zipper 45 in, 2 sliders, Seamstick, thread, 2 forms', () => {
    expect(r.zipperIn).toBe(45)
    expect(r.materials.some((m) => m.includes('#4.5 zipper chain') && m.includes('45'))).toBe(true)
    expect(r.materials.some((m) => m.includes('zipper sliders') && m.includes('2'))).toBe(true)
    expect(r.materials.some((m) => /Seamstick/i.test(m))).toBe(true)
    expect(r.materials.some((m) => /thread/i.test(m) && m.includes('1'))).toBe(true)
    expect(r.materials.some((m) => /pillow forms/i.test(m) && m.includes('2'))).toBe(true)
  })
})

describe('bolster defaults to independent fit math', () => {
  it('default cuts use Regular fit, not throw fill styles', () => {
    const r = calculateBolster({
      diameterIn: 8,
      lengthIn: 20,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.cuts.endDiameterIn).toBe(8.5)
    expect(r.cuts.barrelAlongIn).toBe(20.5)
  })
})

describe('bolster nesting variants', () => {
  it('qty1 Regular H nests ends beside barrel → 25.56 in', () => {
    const r = calculateBolster({
      diameterIn: 8,
      lengthIn: 20,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
      fit: 'regular',
    })
    expect(r.nest.lengthInches).toBeCloseTo(25.56, 2)
    expect(r.nest.endsNestedBeside).toBe(2)
    expect(r.nest.endExtraRows).toBe(0)
    expect(r.pipingIn).toBe(61)
  })

  it('Vertical Regular qty2 → 29 in nest length', () => {
    const r = calculateBolster({
      diameterIn: 8,
      lengthIn: 20,
      quantity: 2,
      fabricWidthIn: 54,
      pattern: 'vertical',
      fit: 'regular',
    })
    expect(r.nest.lengthInches).toBeCloseTo(29, 2)
  })

  it('Tight Horizontal qty2 → ~31.99 in, piping 117', () => {
    const r = calculateBolster({
      diameterIn: 8,
      lengthIn: 20,
      quantity: 2,
      fabricWidthIn: 54,
      pattern: 'horizontal',
      fit: 'tight',
    })
    expect(r.nest.lengthInches).toBeCloseTo(31.99, 2)
    expect(r.pipingIn).toBe(117)
    expect(r.zipperIn).toBe(44)
  })
})

describe('bolster helpers', () => {
  it('piping = round(qty × (2π×endD + 8))', () => {
    expect(bolsterPipingInches(8.5, 2)).toBe(123)
    expect(bolsterPipingInches(8, 2)).toBe(117)
  })

  it('zipper = qty × (barrelAlong + 2)', () => {
    expect(zipperInches(20.5, 2)).toBe(45)
  })

  it('nestBolster places ends in dedicated rows when needed', () => {
    const cuts = bolsterCuts(8, 20, 'regular')
    const nest = nestBolster(cuts, 2, 54, 'horizontal')
    expect(nest.barrelRows).toBe(1)
    expect(nest.barrelAcrossCount).toBe(2)
    expect(nest.endExtraRows).toBe(1)
    expect(nest.endsUsedAlongIn).toBe(8.5)
  })
})

describe('materials copy', () => {
  it('omits nest-length inch phrasing from fabric summary', () => {
    const r = calculateBolster({
      diameterIn: 8,
      lengthIn: 20,
      quantity: 1,
      fabricWidthIn: 54,
    })
    const forbidden = new RegExp(['along', 'bolt'].join(' '), 'i')
    expect(r.materials.some((m) => forbidden.test(m))).toBe(false)
    expect(r.materials[0]).toMatch(/yd fabric/)
    expect(r.materials[0]).not.toMatch(forbidden)
  })
})
