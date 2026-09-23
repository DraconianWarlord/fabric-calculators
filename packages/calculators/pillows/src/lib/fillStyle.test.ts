import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FILL_STYLE,
  THROW_CUT_DELTA_IN,
  throwCutFace,
  throwFinishedFace,
} from './fillStyle'
import { calculateThrowPillows, cutPanelSize, finishedSize } from './throwPillows'

describe('Videos Expert throw fill deltas', () => {
  it('documents Flat +1 / Standard 0 / Plump -1', () => {
    expect(THROW_CUT_DELTA_IN.flat).toBe(1)
    expect(THROW_CUT_DELTA_IN.standard).toBe(0)
    expect(THROW_CUT_DELTA_IN.plump).toBe(-1)
    expect(DEFAULT_FILL_STYLE).toBe('standard')
  })

  it('Flat: cut = form+1, finished ≈ form', () => {
    expect(throwCutFace(18, 'flat')).toBe(19)
    expect(throwFinishedFace(18, 'flat')).toBe(18)
    expect(cutPanelSize(18, 'flat')).toBe(19)
    expect(finishedSize(18, 'flat')).toBe(18)
  })

  it('Standard: cut = form, finished ≈ form-1', () => {
    expect(throwCutFace(18, 'standard')).toBe(18)
    expect(throwFinishedFace(18, 'standard')).toBe(17)
    expect(cutPanelSize(18)).toBe(18)
    expect(finishedSize(18)).toBe(17)
  })

  it('Plump: cut = form-1, finished ≈ form-2', () => {
    expect(throwCutFace(18, 'plump')).toBe(17)
    expect(throwFinishedFace(18, 'plump')).toBe(16)
  })

  it('plump reduces yardage vs flat', () => {
    const flat = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 1, fabricWidthIn: 54,
      pattern: 'horizontal', fillStyle: 'flat',
    })
    const plump = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 1, fabricWidthIn: 54,
      pattern: 'horizontal', fillStyle: 'plump',
    })
    expect(flat.cutWidthIn).toBe(19)
    expect(plump.cutWidthIn).toBe(17)
    expect(plump.pack.lengthInches).toBeLessThan(flat.pack.lengthInches)
  })
})
