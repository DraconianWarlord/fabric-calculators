import { describe, it, expect } from 'vitest'
import {
  autoNestPanels,
  autoNestCandidates,
  irregularCutFromFinished,
  usedLengthInches,
  type Panel,
} from './geometry'

function irreg(id: string): Panel {
  const cut = irregularCutFromFinished(12, 20, 14, 18, 22, 0.5)!
  return {
    id,
    label: id,
    kind: 'irregular',
    width: cut.width,
    length: cut.length,
    sideLeft: cut.sideLeft,
    sideFront: cut.sideFront,
    sideRight: cut.sideRight,
    sideBack: cut.sideBack,
    diagonal: cut.diagonal,
    x: 0,
    y: 0,
    rotation: 0,
    flippedH: false,
    flippedV: false,
    color: '#000',
  }
}

describe('irregular nest performance', () => {
  it('auto-nests 6 irregulars with finite used length (quality floor)', () => {
    const panels = Array.from({ length: 6 }, (_, i) => irreg(`q${i}`))
    const t0 = performance.now()
    const cands = autoNestCandidates(panels, 54, 0.25)
    const ms = performance.now() - t0
    expect(cands.length).toBeGreaterThan(0)
    expect(cands[0]).toHaveLength(6)
    const used = usedLengthInches(cands[0])
    expect(Number.isFinite(used)).toBe(true)
    expect(used).toBeGreaterThan(0)
    // Should not get wildly worse than historical ~43in best.
    expect(used).toBeLessThan(55)
    expect(ms).toBeLessThan(3000)
  })

  it('auto-nests 8 irregulars within ~1s budget', () => {
    const panels = Array.from({ length: 8 }, (_, i) => irreg(`p${i}`))
    const t0 = performance.now()
    const out = autoNestPanels(panels, 54, 0.25)
    const ms = performance.now() - t0
    expect(out).toHaveLength(8)
    const used = usedLengthInches(out)
    expect(Number.isFinite(used)).toBe(true)
    expect(used).toBeGreaterThan(0)
    // Matches historical best for this fixture (~56in).
    expect(used).toBeLessThan(70)
    expect(ms).toBeLessThan(1000)
  })

  it('auto-nests 12 irregulars within ~2.5s budget', () => {
    const panels = Array.from({ length: 12 }, (_, i) => irreg(`r${i}`))
    const t0 = performance.now()
    const cands = autoNestCandidates(panels, 54, 0.25)
    const ms = performance.now() - t0
    expect(cands.length).toBeGreaterThan(0)
    expect(cands[0]).toHaveLength(12)
    const used = usedLengthInches(cands[0])
    expect(Number.isFinite(used)).toBe(true)
    expect(used).toBeGreaterThan(0)
    // Prefer speed over exhaustive search; keep a loose sanity bound.
    expect(used).toBeLessThan(130)
    expect(ms).toBeLessThan(2500)
  })
})
