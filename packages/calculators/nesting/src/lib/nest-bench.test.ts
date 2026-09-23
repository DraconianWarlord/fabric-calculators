import { describe, it, expect } from 'vitest'
import {
  autoNestPanels,
  autoNestCandidates,
  irregularCutFromFinished,
  usedLengthInches,
  panelFootprint,
  isValidPacking,
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

/** Distinct Y bands (¼" buckets) — multi-across packs have fewer bands than n. */
function yBandCount(panels: Panel[]): number {
  return new Set(panels.map((p) => Math.round(p.y * 4) / 4)).size
}

function firstRowAcross(panels: Panel[]): number {
  const minY = Math.min(...panels.map((p) => p.y))
  return panels.filter((p) => Math.abs(p.y - minY) < 0.5).length
}

describe('irregular nest performance', () => {
  it('auto-nests 6 irregulars with finite used length (quality floor)', () => {
    const panels = Array.from({ length: 6 }, (_, i) => irreg(`q${i}`))
    const t0 = performance.now()
    const cands = autoNestCandidates(panels, 54, 0.25)
    const ms = performance.now() - t0
    expect(cands.length).toBeGreaterThan(0)
    expect(cands[0]).toHaveLength(6)
    expect(isValidPacking(cands[0], 54)).toBe(true)
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
    expect(isValidPacking(out, 54)).toBe(true)
    const used = usedLengthInches(out)
    expect(Number.isFinite(used)).toBe(true)
    expect(used).toBeGreaterThan(0)
    // Matches historical best for this fixture (~56in).
    expect(used).toBeLessThan(70)
    expect(ms).toBeLessThan(1000)
  })

  it('auto-nests 12 irregulars multi-across within ~3s', () => {
    const n = 12
    const panels = Array.from({ length: n }, (_, i) => irreg(`r${i}`))
    const fp = panelFootprint(panels[0])
    const t0 = performance.now()
    const cands = autoNestCandidates(panels, 54, 0.25)
    const ms = performance.now() - t0
    expect(cands.length).toBeGreaterThan(0)
    expect(cands[0]).toHaveLength(n)
    expect(isValidPacking(cands[0], 54)).toBe(true)
    const used = usedLengthInches(cands[0])
    expect(Number.isFinite(used)).toBe(true)
    expect(used).toBeGreaterThan(0)
    // Single-column bound — multi-across must beat this clearly when width fits 2-across.
    const singleCol = n * fp.h + (n - 1) * 0.25
    expect(used).toBeLessThan(singleCol * 0.75)
    if (fp.w <= 54 / 2 + 1e-6) {
      expect(firstRowAcross(cands[0])).toBeGreaterThanOrEqual(2)
      expect(yBandCount(cands[0])).toBeLessThan(n)
    }
    expect(ms).toBeLessThan(3000)
  })

  it('auto-nests 16 identical irregulars multi-across within ~5s', () => {
    const n = 16
    const panels = Array.from({ length: n }, (_, i) => irreg(`s${i}`))
    const fp = panelFootprint(panels[0])
    const t0 = performance.now()
    const cands = autoNestCandidates(panels, 54, 0.25)
    const ms = performance.now() - t0
    expect(cands.length).toBeGreaterThan(0)
    expect(cands[0]).toHaveLength(n)
    expect(isValidPacking(cands[0], 54)).toBe(true)
    const used = usedLengthInches(cands[0])
    expect(Number.isFinite(used)).toBe(true)
    expect(used).toBeGreaterThan(0)
    const singleCol = n * fp.h + (n - 1) * 0.25
    expect(used).toBeLessThan(singleCol * 0.75)
    if (fp.w <= 54 / 2 + 1e-6) {
      expect(firstRowAcross(cands[0])).toBeGreaterThanOrEqual(2)
      expect(yBandCount(cands[0])).toBeLessThan(n)
    }
    expect(ms).toBeLessThan(5000)
  })
})
