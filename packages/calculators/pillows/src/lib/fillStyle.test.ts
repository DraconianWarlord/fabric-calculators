import { describe, expect, it } from 'vitest'
import {
  BOLSTER_PATTERNING_ADD_IN,
  DEFAULT_FILL_STYLE,
  THROW_CUT_DELTA_IN,
  bolsterPatterningAdd,
  throwCutFace,
  throwFinishedFace,
} from './fillStyle'
import { calculateThrowPillows, cutPanelSize, finishedSize } from './throwPillows'
import { bolsterCuts, calculateBolster } from './bolsterPillows'

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

describe('Videos Expert bolster patterning adds', () => {
  it('Flat/Standard +1, Plump +0.5', () => {
    expect(BOLSTER_PATTERNING_ADD_IN.flat).toBe(1)
    expect(BOLSTER_PATTERNING_ADD_IN.standard).toBe(1)
    expect(BOLSTER_PATTERNING_ADD_IN.plump).toBe(0.5)
    expect(bolsterPatterningAdd('plump')).toBe(0.5)
  })

  it('Standard: end=D+1, along=L+1, circ=πD+2', () => {
    const c = bolsterCuts(8, 20, 'standard')
    expect(c.endDiameterIn).toBe(9)
    expect(c.barrelAlongIn).toBe(21)
    expect(c.barrelCircIn).toBeCloseTo(Math.PI * 8 + 2, 5)
  })

  it('Plump matches legacy Regular (+0.5)', () => {
    expect(bolsterCuts(8, 20, 'plump')).toEqual(bolsterCuts(8, 20, 'regular'))
    expect(bolsterCuts(8, 20, 'plump').endDiameterIn).toBe(8.5)
  })

  it('calculateBolster defaults to Standard (+1)', () => {
    const r = calculateBolster({
      diameterIn: 8, lengthIn: 20, quantity: 1, fabricWidthIn: 54, pattern: 'horizontal',
    })
    expect(r.fillStyle).toBe('standard')
    expect(r.cuts.endDiameterIn).toBe(9)
  })
})
