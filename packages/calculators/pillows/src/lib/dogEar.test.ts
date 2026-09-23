import { describe, expect, it } from 'vitest'
import {
  DOG_EAR_SA_MARK_IN,
  DOG_EAR_TRIM_FRACTION,
  dogEarPanelPolygon,
  dogEarTrimAlongEdge,
} from './dogEar'
import { calculateThrowPillows } from './throwPillows'

describe('dog-ear corner trim (Sailrite side÷4, uncapped)', () => {
  it('documents 1/2" SA mark and side/4 fraction (no cap)', () => {
    expect(DOG_EAR_SA_MARK_IN).toBe(0.5)
    expect(DOG_EAR_TRIM_FRACTION).toBe(0.25)
    // Sailrite: 18" → 4½", 12" → 3", 8" → 2" (no 2.5" cap)
    expect(dogEarTrimAlongEdge(18)).toBe(4.5)
    expect(dogEarTrimAlongEdge(12)).toBe(3)
    expect(dogEarTrimAlongEdge(8)).toBe(2)
  })

  it('octagon clips corners at side/4 along each edge', () => {
    const poly = dogEarPanelPolygon(18, 18)
    expect(poly).toHaveLength(8)
    expect(poly[0]).toEqual({ x: 4.5, y: 0 })
    expect(poly[2]).toEqual({ x: 18, y: 4.5 })
  })

  it('rect panel uses each edge side/4 independently', () => {
    const poly = dogEarPanelPolygon(8, 18)
    expect(poly[0]).toEqual({ x: 2, y: 0 }) // 8/4
    expect(poly[2]).toEqual({ x: 8, y: 4.5 }) // 18/4
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
