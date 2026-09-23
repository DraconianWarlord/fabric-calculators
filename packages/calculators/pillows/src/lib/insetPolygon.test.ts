import { describe, expect, it } from 'vitest'
import { dogEarPanelPolygon } from './dogEar'
import { insetPolygon, throwSeamAllowanceOutline } from './insetPolygon'
import type { Point } from './dogEar'

/** Min distance from point to polygon edges (segment projection). */
function minDistPointToPoly(pt: Point, poly: Point[]): number {
  let min = Infinity
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]
    const b = poly[(i + 1) % poly.length]
    const abx = b.x - a.x
    const aby = b.y - a.y
    const apx = pt.x - a.x
    const apy = pt.y - a.y
    const denom = abx * abx + aby * aby || 1
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / denom))
    const qx = a.x + t * abx
    const qy = a.y + t * aby
    min = Math.min(min, Math.hypot(pt.x - qx, pt.y - qy))
  }
  return min
}

describe('insetPolygon', () => {
  it('insets a unit square by 0.1', () => {
    const sq: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]
    const inn = insetPolygon(sq, 0.1)
    expect(inn).not.toBeNull()
    expect(inn!.length).toBe(4)
    const xs = inn!.map((p) => p.x)
    const ys = inn!.map((p) => p.y)
    expect(Math.min(...xs)).toBeCloseTo(0.1, 5)
    expect(Math.max(...xs)).toBeCloseTo(0.9, 5)
    expect(Math.min(...ys)).toBeCloseTo(0.1, 5)
    expect(Math.max(...ys)).toBeCloseTo(0.9, 5)
  })

  it('returns null when dist collapses the polygon', () => {
    const sq: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
    ]
    expect(insetPolygon(sq, 0.6)).toBeNull()
  })
})

describe('throwSeamAllowanceOutline', () => {
  it('dog-ear off: AABB inset by SA (matches finished = cut − 2×SA)', () => {
    const o = throwSeamAllowanceOutline(18, 18, 0.5, false)
    expect(o).toEqual({ kind: 'rect', x: 0.5, y: 0.5, w: 17, h: 17 })
  })

  it('dog-ear on: true inward offset of cut 12-gon (not naive finished dog-ear)', () => {
    const sa = 0.5
    const cut = dogEarPanelPolygon(18, 18)
    const o = throwSeamAllowanceOutline(18, 18, sa, true)
    expect(o?.kind).toBe('poly')
    if (o?.kind !== 'poly') return
    expect(o.points.length).toBeGreaterThanOrEqual(4)
    // Each SA vertex sits ~SA inside the cut boundary (true inset).
    for (const pt of o.points) {
      const d = minDistPointToPoly(pt, cut)
      expect(d).toBeGreaterThanOrEqual(sa - 1e-6)
      expect(d).toBeLessThan(sa * 3)
    }
    // Must NOT equal dog-ear of the finished rectangle (naive shrink).
    const naive = dogEarPanelPolygon(17, 17)
    // Translate naive finished dog-ear to sit inside cut AABB at (0.5,0.5)
    const naiveShifted = naive.map((p) => ({ x: p.x + sa, y: p.y + sa }))
    const sameAsNaive =
      o.points.length === naiveShifted.length &&
      o.points.every(
        (p, i) =>
          Math.abs(p.x - naiveShifted[i].x) < 1e-6 && Math.abs(p.y - naiveShifted[i].y) < 1e-6,
      )
    expect(sameAsNaive).toBe(false)
  })

  it('returns null when SA is 0', () => {
    expect(throwSeamAllowanceOutline(18, 18, 0, true)).toBeNull()
    expect(throwSeamAllowanceOutline(18, 18, 0, false)).toBeNull()
  })
})
