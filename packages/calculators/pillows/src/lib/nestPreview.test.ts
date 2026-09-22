import { describe, expect, it } from 'vitest'
import { calculateThrowPillows } from './throwPillows'
import { calculateBolster } from './bolsterPillows'
import {
  bolsterNestPreview,
  countNestPanels,
  patternHOffset,
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
})
