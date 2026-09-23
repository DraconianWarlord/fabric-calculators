import { describe, expect, it } from 'vitest'
import { calculateThrowPillows } from './throwPillows'
import { calculateBolster } from './bolsterPillows'
import {
  bolsterNestPreview,
  countNestPanels,
  patternHOffset,
  snapPanelToPatternCenter,
  throwNestPreview,
} from './nestPreview'

describe('nest preview panel counts', () => {
  it('throw qty1 -> 2 panels', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 1, fabricWidthIn: 54, pattern: 'horizontal',
    })
    const model = throwNestPreview(r.pack, 54)
    expect(countNestPanels(model)).toBe(2)
    expect(countNestPanels(model, 'throw-panel')).toBe(2)
    expect(model.panels[0]).toMatchObject({ x: 0, y: 0, w: 18, h: 18 })
  })

  it('throw dog-ear polygons', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 1, fabricWidthIn: 54, pattern: 'horizontal',
    })
    expect(throwNestPreview(r.pack, 54, { dogEar: true }).panels[0]?.polygon).toHaveLength(8)
  })

  it('throw qty2 -> 4 panels', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 2, fabricWidthIn: 54, pattern: 'horizontal',
    })
    const model = throwNestPreview(r.pack, 54)
    expect(countNestPanels(model)).toBe(4)
    expect(model.lengthInches).toBe(36)
  })

  it('bolster qty1 plump: 1 barrel + 2 ends', () => {
    const r = calculateBolster({
      diameterIn: 8, lengthIn: 20, quantity: 1, fabricWidthIn: 54,
      pattern: 'horizontal', fillStyle: 'plump',
    })
    const model = bolsterNestPreview(r.cuts, r.nest, 1, 54)
    expect(countNestPanels(model, 'barrel')).toBe(1)
    expect(countNestPanels(model, 'end')).toBe(2)
  })

  it('patternHOffset centers leftover', () => {
    expect(patternHOffset(54, 10)).toBe(2)
    expect(patternHOffset(54, 0)).toBe(0)
  })

  it('H/V repeats re-center panels onto pattern cell centers', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 1, fabricWidthIn: 54,
      pattern: 'horizontal', hRepeatIn: 12, vRepeatIn: 12,
    })
    // Pitch expands to 24 (ceil(18/12)*12) → fewer across, longer nest
    expect(r.pack.acrossCount).toBe(2) // floor(54/24)
    expect(r.pack.lengthInches).toBe(24) // 1 row * 24 pitch
    const model = throwNestPreview(r.pack, 54, { hRepeatIn: 12, vRepeatIn: 12 })
    const p0 = model.panels[0]!
    const cx = p0.x + p0.w / 2
    const cy = p0.y + p0.h / 2
    const hOff = patternHOffset(54, 12)
    const fracH = ((cx - hOff) / 12) % 1
    const fracV = (cy / 12) % 1
    expect(Math.abs(fracH - 0.5)).toBeLessThan(1e-6)
    expect(Math.abs(fracV - 0.5)).toBeLessThan(1e-6)
  })

  it('snapPanelToPatternCenter snaps X only for H stripes', () => {
    const { x, y } = snapPanelToPatternCenter(10, 10, 1, 7, 54, 12, 0)
    expect(x + 5).toBeCloseTo(9, 5) // hOff 3 + 6
    expect(y).toBeCloseTo(7, 5)
  })
})
