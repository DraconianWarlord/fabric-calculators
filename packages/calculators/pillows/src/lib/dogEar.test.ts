import { describe, expect, it } from 'vitest'
import {
  DOG_EAR_SA_MARK_IN,
  DOG_EAR_TRIM_FRACTION,
  dogEarPanelPolygon,
  dogEarTrimAlongEdge,
} from './dogEar'
import { calculateThrowPillows } from './throwPillows'

describe('dog-ear corner trim (Videos Expert)', () => {
  it('documents 1/2" SA mark and side/4 trim', () => {
    expect(DOG_EAR_SA_MARK_IN).toBe(0.5)
    expect(DOG_EAR_TRIM_FRACTION).toBe(0.25)
    expect(dogEarTrimAlongEdge(18)).toBe(4.5)
    expect(dogEarTrimAlongEdge(12)).toBe(3)
  })

  it('octagon clips corners at side/4', () => {
    const poly = dogEarPanelPolygon(18, 18)
    expect(poly).toHaveLength(8)
    expect(poly[0]).toEqual({ x: 4.5, y: 0 })
    expect(poly[2]).toEqual({ x: 18, y: 4.5 })
  })

  it('rect panel uses each edge length / 4', () => {
    const poly = dogEarPanelPolygon(12, 18)
    expect(poly[0]).toEqual({ x: 3, y: 0 })
    expect(poly[2]).toEqual({ x: 12, y: 4.5 })
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
