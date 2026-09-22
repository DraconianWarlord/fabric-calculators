import { describe, expect, it } from 'vitest'
import {
  finishedPanelOutline,
  type Panel,
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
      expect(o.points.length).toBe(4)
      // finished height 9, centered in cut height 10 → y from 0.5 .. 9.5
      const ys = o.points.map((p) => p.y)
      expect(Math.min(...ys)).toBeCloseTo(0.5, 5)
      expect(Math.max(...ys)).toBeCloseTo(9.5, 5)
    }
  })
})
