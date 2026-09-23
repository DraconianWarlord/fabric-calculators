import { describe, expect, it } from 'vitest'
import {
  FORM_TO_FINISHED_REDUCTION_IN,
  SEAM_ALLOWANCE_IN,
  calculateThrowPillows,
  cutPanelSize,
  exactYards,
  finishedSize,
  orderYards,
  packPanels,
  orientationsForPattern,
} from './throwPillows'

describe('snug / cut constants', () => {
  it('documents 1″ finished reduction from ½″ seams', () => {
    expect(SEAM_ALLOWANCE_IN).toBe(0.5)
    expect(FORM_TO_FINISHED_REDUCTION_IN).toBe(1)
    expect(cutPanelSize(18)).toBe(18)
    expect(finishedSize(18)).toBe(17)
  })
})

describe('orderYards (nesting convention)', () => {
  it('ceils to whole yards', () => {
    expect(orderYards(0)).toBe(0)
    expect(orderYards(0.01)).toBe(1)
    expect(orderYards(0.5)).toBe(1)
    expect(orderYards(1)).toBe(1)
    expect(orderYards(1.01)).toBe(2)
    expect(exactYards(18)).toBeCloseTo(0.5, 5)
  })
})

describe('live Sailrite reverse-engineer cases', () => {
  it('18×18 qty1 fab54 horizontal → 18 in / 0.5 yd', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.panelsNeeded).toBe(2)
    expect(r.pack.lengthInches).toBe(18)
    expect(r.pack.exactYards).toBeCloseTo(0.5, 5)
    expect(r.pack.acrossCount).toBe(3)
    expect(r.pack.leftoverAcrossIn).toBe(18) // last row places 2 of 3 capacity
    expect(r.pack.orderYards).toBe(1)
  })

  it('18×18 qty2 fab54 → 36 in / 1 yd', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 2,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.panelsNeeded).toBe(4)
    expect(r.pack.lengthInches).toBe(36)
    expect(r.pack.rows).toBe(2)
  })

  it('Nesting-style rotation 90° swaps panel across/along packing', () => {
    const r = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 1,
      fabricWidthIn: 54,
      rotation: 90,
    })
    expect(r.pack.orientation.label).toBe('length-across')
    expect(r.pack.orientation.acrossIn).toBe(16)
    expect(r.pack.orientation.alongIn).toBe(20)
    expect(r.pack.lengthInches).toBe(20)
  })

  it('rect 20×16 horizontal vs vertical packing', () => {
    const h = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    const v = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'vertical',
    })
    expect(h.pack.lengthInches).toBe(16)
    expect(v.pack.lengthInches).toBe(20)
    expect(h.pack.orientation.label).toBe('width-across')
    expect(v.pack.orientation.label).toBe('length-across')
  })

  it('20×16 qty3 fab54 horizontal → 48 in', () => {
    const r = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 3,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.pack.acrossCount).toBe(2)
    expect(r.pack.rows).toBe(3)
    expect(r.pack.lengthInches).toBe(48)
    expect(r.pack.exactYards).toBeCloseTo(48 / 36, 5)
  })

  it('narrow fabric 20×16 on 36″ → 32 in', () => {
    const r = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 1,
      fabricWidthIn: 36,
      pattern: 'horizontal',
    })
    expect(r.pack.acrossCount).toBe(1)
    expect(r.pack.rows).toBe(2)
    expect(r.pack.lengthInches).toBe(32)
  })

  it('12×12 qty4 → 24 in', () => {
    const r = calculateThrowPillows({
      formWidthIn: 12,
      formLengthIn: 12,
      quantity: 4,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.panelsNeeded).toBe(8)
    expect(r.pack.acrossCount).toBe(4)
    expect(r.pack.lengthInches).toBe(24)
  })

  it('30×18 horizontal 36 in; vertical 30 in', () => {
    const h = calculateThrowPillows({
      formWidthIn: 30,
      formLengthIn: 18,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    const v = calculateThrowPillows({
      formWidthIn: 30,
      formLengthIn: 18,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'vertical',
    })
    expect(h.pack.lengthInches).toBe(36)
    expect(v.pack.lengthInches).toBe(30)
  })

  it('pattern none picks lower yardage orientation', () => {
    const r = calculateThrowPillows({
      formWidthIn: 30,
      formLengthIn: 18,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'none',
    })
    expect(r.pack.lengthInches).toBe(30)
    expect(r.pack.orientation.label).toBe('length-across')
    expect(r.alternatePack?.lengthInches).toBe(36)
  })
})

describe('yardage responds to width / qty / fabric width', () => {
  it('larger form width increases yardage when packing suffers', () => {
    const a = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    const b = calculateThrowPillows({
      formWidthIn: 30,
      formLengthIn: 18,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(b.pack.lengthInches).toBeGreaterThan(a.pack.lengthInches)
  })

  it('higher qty increases length', () => {
    const q1 = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    const q2 = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 2,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(q2.pack.lengthInches).toBe(q1.pack.lengthInches * 2)
  })

  it('wider fabric can reduce rows', () => {
    const narrow = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 1,
      fabricWidthIn: 36,
      pattern: 'horizontal',
    })
    const wide = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 1,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(wide.pack.lengthInches).toBeLessThan(narrow.pack.lengthInches)
  })
})

describe('orientationsForPattern', () => {
  it('locks horizontal / vertical; none offers both', () => {
    expect(orientationsForPattern(20, 16, 'horizontal')).toHaveLength(1)
    expect(orientationsForPattern(20, 16, 'vertical')).toHaveLength(1)
    expect(orientationsForPattern(20, 16, 'none')).toHaveLength(2)
  })
})

describe('packPanels', () => {
  it('never uses acrossCount 0', () => {
    const p = packPanels(
      { acrossIn: 60, alongIn: 20, label: 'width-across' },
      2,
      54,
    )
    expect(p.acrossCount).toBe(1)
    expect(p.rows).toBe(2)
    expect(p.lengthInches).toBe(40)
  })
})


describe('piping optional (live Sailrite parity)', () => {
  it('18×18 qty2 fab54 → pref 154 in / 12.83 ft, match 9 / 0.25, bias 60 / 1.67', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 2,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.piping.prefabricatedIn).toBe(154)
    expect(r.piping.prefabricatedFt).toBeCloseTo(12.83, 2)
    expect(r.piping.matchingFabricIn).toBe(9)
    expect(r.piping.matchingFabricYd).toBeCloseTo(0.25, 2)
    expect(r.piping.biasFabricIn).toBe(60)
    expect(r.piping.biasFabricYd).toBeCloseTo(1.67, 2)
  })

  it('prefabricated = qty × perimeter + 10 join ease', () => {
    const r = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 3,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.piping.prefabricatedIn).toBe(3 * 2 * (20 + 16) + 10) // 226
  })

  it('matching uses strip 3″ over (fabricWidth − 1)', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 2,
      fabricWidthIn: 36,
      pattern: 'horizontal',
    })
    expect(r.piping.matchingFabricIn).toBe(14)
    expect(r.piping.biasFabricIn).toBe(45)
  })
})

describe('leftover strip (live Sailrite parity)', () => {
  it('18×18 qty2 fab54 → 36 × 18 leftover', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 2,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.pack.leftover).toEqual({ widthIn: 36, lengthIn: 18 })
  })

  it('18×18 qty2 fab36 → no leftover (full width used)', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 2,
      fabricWidthIn: 36,
      pattern: 'horizontal',
    })
    expect(r.pack.leftover).toBeNull()
  })

  it('20×16 qty3 fab54 → 14 × 48 side strip', () => {
    const r = calculateThrowPillows({
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 3,
      fabricWidthIn: 54,
      pattern: 'horizontal',
    })
    expect(r.pack.leftover).toEqual({ widthIn: 14, lengthIn: 48 })
  })
})
