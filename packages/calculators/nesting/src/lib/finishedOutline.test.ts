import { describe, expect, it } from 'vitest'
import {
  finishedPanelOutline,
  insetPolygon,
  irregularCutFromFinished,
  panelPolygon,
  type Panel,
  type Point,
} from './geometry'

function base(partial: Partial<Panel> & Pick<Panel, 'id' | 'width' | 'length'>): Panel {
  return {
    label: partial.label ?? 'P',
    x: partial.x ?? 0,
    y: partial.y ?? 0,
    rotation: partial.rotation ?? 0,
    flippedH: partial.flippedH ?? false,
    flippedV: partial.flippedV ?? false,
    color: partial.color ?? '#24285e',
    ...partial,
  }
}

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

  it('returns null for non-positive dist', () => {
    expect(insetPolygon([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }], 0)).toBeNull()
  })
})

describe('finishedPanelOutline', () => {
  it('returns null when SA is 0', () => {
    expect(finishedPanelOutline(base({ id: 'a', width: 10, length: 12 }), 0)).toBeNull()
  })

  it('insets rectangle footprint AABB by SA', () => {
    const o = finishedPanelOutline(base({ id: 'r', width: 10, length: 12, x: 2, y: 3 }), 0.5)
    expect(o).toEqual({ kind: 'aabb', x: 2.5, y: 3.5, w: 9, h: 11 })
  })

  it('concentric circle with r = cutR − SA', () => {
    const o = finishedPanelOutline(
      base({ id: 'c', kind: 'circle', width: 10, length: 10, x: 0, y: 0 }),
      0.5,
    )
    expect(o?.kind).toBe('circle')
    if (o?.kind === 'circle') {
      expect(o.cx).toBe(5)
      expect(o.cy).toBe(5)
      expect(o.r).toBe(4.5)
    }
  })

  it('trap returns a polygon inset from cut dims', () => {
    const o = finishedPanelOutline(
      base({
        id: 't',
        kind: 'trap',
        width: 12,
        length: 10,
        topWidth: 8,
        bottomWidth: 12,
        x: 0,
        y: 0,
      }),
      0.5,
    )
    expect(o?.kind).toBe('poly')
    if (o?.kind === 'poly') {
      expect(o.points.length).toBeGreaterThanOrEqual(4)
      // True inward offset moves horizontal edges by SA → y from 0.5 .. 9.5
      const ys = o.points.map((p) => p.y)
      expect(Math.min(...ys)).toBeCloseTo(0.5, 5)
      expect(Math.max(...ys)).toBeCloseTo(9.5, 5)
    }
  })

  it('irregular with SA returns poly outline ~SA inside cut edges', () => {
    const sa = 0.5
    const cut = irregularCutFromFinished(12, 20, 14, 18, 22, sa)!
    const p = base({
      id: 'i',
      kind: 'irregular',
      width: cut.width,
      length: cut.length,
      sideLeft: cut.sideLeft,
      sideFront: cut.sideFront,
      sideRight: cut.sideRight,
      sideBack: cut.sideBack,
      diagonal: cut.diagonal,
      x: 3,
      y: 4,
    })
    const cutPoly = panelPolygon(p)
    const fin = finishedPanelOutline(p, sa)
    expect(fin?.kind).toBe('poly')
    if (fin?.kind !== 'poly') return
    expect(fin.points.length).toBeGreaterThanOrEqual(4)
    // Each finished vertex should sit roughly SA away from the cut boundary
    // (vertex-to-edge distance ≈ SA / sin(half-angle) ≥ SA for convex verts).
    for (const pt of fin.points) {
      const d = minDistPointToPoly(pt, cutPoly)
      expect(d).toBeGreaterThanOrEqual(sa - 1e-6)
      expect(d).toBeLessThan(sa * 3)
    }
  })

  it('irregular SA works when shrink-rebuild of sides would be invalid', () => {
    // Expanding finished lengths by 2×SA can yield a valid cut even when the
    // finished lengths alone are not a valid quad. Shrink-rebuild then fails,
    // but a true inward offset of the cut polygon still succeeds.
    const sa = 0.25
    const cut = irregularCutFromFinished(10, 15, 8, 6, 16.224980739587952, sa)
    expect(cut).not.toBeNull()
    const p = base({
      id: 'skinny',
      kind: 'irregular',
      width: cut!.width,
      length: cut!.length,
      sideLeft: cut!.sideLeft,
      sideFront: cut!.sideFront,
      sideRight: cut!.sideRight,
      sideBack: cut!.sideBack,
      diagonal: cut!.diagonal,
      x: 1,
      y: 2,
    })
    const shrinkRebuild = irregularCutFromFinished(
      cut!.sideLeft - 2 * sa,
      cut!.sideFront - 2 * sa,
      cut!.sideRight - 2 * sa,
      cut!.sideBack - 2 * sa,
      cut!.diagonal - 2 * sa,
      0,
    )
    expect(shrinkRebuild).toBeNull()
    const fin = finishedPanelOutline(p, sa)
    expect(fin?.kind).toBe('poly')
    if (fin?.kind === 'poly') {
      expect(fin.points.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('irregular rotated 90 still insets uniformly', () => {
    const sa = 0.5
    const cut = irregularCutFromFinished(12, 20, 14, 18, 22, sa)!
    const p = base({
      id: 'i90',
      kind: 'irregular',
      width: cut.width,
      length: cut.length,
      sideLeft: cut.sideLeft,
      sideFront: cut.sideFront,
      sideRight: cut.sideRight,
      sideBack: cut.sideBack,
      diagonal: cut.diagonal,
      x: 3,
      y: 4,
      rotation: 90,
    })
    const cutPoly = panelPolygon(p)
    const fin = finishedPanelOutline(p, sa)
    expect(fin?.kind).toBe('poly')
    if (fin?.kind !== 'poly') return
    for (const pt of fin.points) {
      const d = minDistPointToPoly(pt, cutPoly)
      expect(d).toBeGreaterThanOrEqual(sa - 1e-6)
      expect(d).toBeLessThan(sa * 3)
    }
  })

  it('returns null when irregular SA is too large to inset', () => {
    const cut = irregularCutFromFinished(4, 5, 4, 5, 6, 0.25)!
    const p = base({
      id: 'tiny',
      kind: 'irregular',
      width: cut.width,
      length: cut.length,
      sideLeft: cut.sideLeft,
      sideFront: cut.sideFront,
      sideRight: cut.sideRight,
      sideBack: cut.sideBack,
      diagonal: cut.diagonal,
    })
    expect(finishedPanelOutline(p, 100)).toBeNull()
  })
})
