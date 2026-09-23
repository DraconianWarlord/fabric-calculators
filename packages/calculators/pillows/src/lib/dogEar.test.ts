import { describe, expect, it } from 'vitest'
import {
  DOG_EAR_SA_MARK_IN,
  DOG_EAR_TRIM_CAP_IN,
  DOG_EAR_TRIM_FRACTION,
  dogEarPanelPolygon,
  dogEarTrimAlongEdge,
} from './dogEar'
import { calculateThrowPillows } from './throwPillows'

describe('dog-ear corner trim (Videos Expert, toned down)', () => {
  it('documents 1/2" SA mark, side/4 fraction, and 2.5" cap', () => {
    expect(DOG_EAR_SA_MARK_IN).toBe(0.5)
    expect(DOG_EAR_TRIM_FRACTION).toBe(0.25)
    expect(DOG_EAR_TRIM_CAP_IN).toBe(2.5)
    // 18" uncapped would be 4.5" — cap tones it down
    expect(dogEarTrimAlongEdge(18)).toBe(2.5)
    expect(dogEarTrimAlongEdge(12)).toBe(2.5)
    expect(dogEarTrimAlongEdge(8)).toBe(2) // 8/4 = 2 < cap
  })

  it('octagon clips corners at min(side/4, 2.5)', () => {
    const poly = dogEarPanelPolygon(18, 18)
    expect(poly).toHaveLength(8)
    expect(poly[0]).toEqual({ x: 2.5, y: 0 })
    expect(poly[2]).toEqual({ x: 18, y: 2.5 })
  })

  it('rect panel uses each edge min(side/4, cap)', () => {
    const poly = dogEarPanelPolygon(8, 18)
    expect(poly[0]).toEqual({ x: 2, y: 0 }) // 8/4
    expect(poly[2]).toEqual({ x: 8, y: 2.5 }) // capped
  })

  it('cut list note when dogEarTrim on', () => {
    const r = calculateThrowPillows({
      formWidthIn: 18, formLengthIn: 18, quantity: 1, fabricWidthIn: 54,
      pattern: 'horizontal', dogEarTrim: true,
    })
    expect(r.dogEarTrim).toBe(true)
    expect(r.cutList[0]?.note).toMatch(/dog-ear/i)
  })
})
