import { describe, expect, it } from 'vitest'
import { calculateThrowPillows } from './throwPillows'
import { calculateBolster } from './bolsterPillows'
import {
  bolsterNestPreview,
  countNestPanels,
  patternHOffset,
  snapPanelToPatternCenter,
  throwNestPreview,
  yardMajorInches,
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
    expect(throwNestPreview(r.pack, 54, { dogEar: true }).panels[0]?.polygon).toHaveLength(12)
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
      pattern: 'horizontal', fit: 'regular',
    })
    const model = bolsterNestPreview(r.cuts, r.nest, 1, 54)
    expect(countNestPanels(model, 'barrel')).toBe(1)
    expect(countNestPanels(model, 'end')).toBe(2)
  })

  it('patternHOffset centers leftover', () => {
    expect(patternHOffset(54, 10)).toBe(2)
    expect(patternHOffset(54, 0)).toBe(0)
  })

  it('bolster repeats expand nest pitch before preview centering', () => {
    const r = calculateBolster({
      diameterIn: 8,
      lengthIn: 20,
      quantity: 1,
      fabricWidthIn: 54,
      rotation: 0,
      hRepeatIn: 12,
      vRepeatIn: 12,
      fit: 'regular',
    })
    expect(r.nest.barrelAcrossPitchIn).toBe(24)
    expect(r.nest.barrelAlongPitchIn).toBe(36)
    expect(r.nest.lengthInches).toBe(36)
    const model = bolsterNestPreview(r.cuts, r.nest, 1, 54, { hRepeatIn: 12, vRepeatIn: 12 })
    expect(countNestPanels(model, 'barrel')).toBe(1)
    expect(model.lengthInches).toBeGreaterThanOrEqual(r.nest.lengthInches)
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

  it('non-square 20×16: H vs V pattern direction changes pack (guards square-only illusion)', () => {
    const base = {
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 2,
      fabricWidthIn: 54,
    }
    const h = calculateThrowPillows({ ...base, pattern: 'horizontal' })
    const v = calculateThrowPillows({ ...base, pattern: 'vertical' })
    expect(h.pack.orientation.label).not.toBe(v.pack.orientation.label)
    expect(h.pack.lengthInches).not.toBe(v.pack.lengthInches)
    expect(h.pack.acrossCount).not.toBe(v.pack.acrossCount)
    const mh = throwNestPreview(h.pack, 54)
    const mv = throwNestPreview(v.pack, 54)
    expect(mh.panels[0]!.w).not.toBe(mv.panels[0]!.w)
    expect(mh.panels.map((p) => [p.x, p.y])).not.toEqual(mv.panels.map((p) => [p.x, p.y]))
  })

  it('non-square 20×16: H-only vs V-only repeat expands pitch and re-centers differently', () => {
    const base = {
      formWidthIn: 20,
      formLengthIn: 16,
      quantity: 2,
      fabricWidthIn: 54,
      pattern: 'horizontal' as const,
    }
    const hOnly = calculateThrowPillows({ ...base, hRepeatIn: 12, vRepeatIn: 0 })
    const vOnly = calculateThrowPillows({ ...base, hRepeatIn: 0, vRepeatIn: 12 })
    // H repeat expands across pitch (20→24); V expands along (16→24)
    expect(hOnly.pack.lengthInches).toBe(32) // 2 rows × 16
    expect(vOnly.pack.lengthInches).toBe(48) // 2 rows × 24
    expect(hOnly.pack.lengthInches).not.toBe(vOnly.pack.lengthInches)

    const mh = throwNestPreview(hOnly.pack, 54, { hRepeatIn: 12, vRepeatIn: 0 })
    const mv = throwNestPreview(vOnly.pack, 54, { hRepeatIn: 0, vRepeatIn: 12 })
    const centersH = mh.panels.map((p) => [p.x + p.w / 2, p.y + p.h / 2])
    const centersV = mv.panels.map((p) => [p.x + p.w / 2, p.y + p.h / 2])
    expect(centersH).not.toEqual(centersV)

    // V-only: panel centers sit on horizontal stripe centers
    for (const [, cy] of centersV) {
      const frac = (cy / 12) % 1
      expect(Math.abs(frac - 0.5)).toBeLessThan(1e-6)
    }
    // H-only: X on stripe centers when clamp allows; else edge-clamped
    const hOff = patternHOffset(54, 12)
    for (const [cx] of centersH) {
      const frac = ((cx - hOff) / 12) % 1
      const onCell = Math.abs(frac - 0.5) < 1e-6
      const clampedEdge = cx <= 10 + 1e-6 // half of 20″ panel at x≈0
      expect(onCell || clampedEdge).toBe(true)
    }
  })

  it('square 18×18: H vs V direction alone is identical (documents square illusion)', () => {
    const base = {
      formWidthIn: 18,
      formLengthIn: 18,
      quantity: 2,
      fabricWidthIn: 54,
    }
    const h = calculateThrowPillows({ ...base, pattern: 'horizontal' })
    const v = calculateThrowPillows({ ...base, pattern: 'vertical' })
    expect(h.pack.lengthInches).toBe(v.pack.lengthInches)
    expect(h.pack.acrossCount).toBe(v.pack.acrossCount)
    const mh = throwNestPreview(h.pack, 54)
    const mv = throwNestPreview(v.pack, 54)
    expect(mh.panels.map((p) => [p.x, p.y, p.w, p.h])).toEqual(
      mv.panels.map((p) => [p.x, p.y, p.w, p.h]),
    )
  })
})

describe('yardMajorInches (Nesting-parity)', () => {
  it('matches Nesting majors: 0..ceil(len/36)+1 steps of 36', () => {
    expect(yardMajorInches(36)).toEqual([0, 36, 72])
    expect(yardMajorInches(40)).toEqual([0, 36, 72, 108])
    expect(yardMajorInches(1)).toEqual([0, 36, 72])
  })

  it('tracks lengthInches from nest model so ticks update when cut dims change', () => {
    const short = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 1, fabricWidthIn: 54, pattern: 'horizontal',
    })
    const long = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 4, fabricWidthIn: 54, pattern: 'horizontal',
    })
    const mShort = throwNestPreview(short.pack, 54)
    const mLong = throwNestPreview(long.pack, 54)
    expect(mLong.lengthInches).toBeGreaterThan(mShort.lengthInches)
    const ticksShort = yardMajorInches(mShort.lengthInches).filter((y) => y <= mShort.lengthInches + 1e-6)
    const ticksLong = yardMajorInches(mLong.lengthInches).filter((y) => y <= mLong.lengthInches + 1e-6)
    expect(ticksLong.length).toBeGreaterThanOrEqual(ticksShort.length)
    expect(ticksLong.at(-1)).toBeGreaterThanOrEqual(mLong.lengthInches > 36 ? 36 : 0)
  })
})
