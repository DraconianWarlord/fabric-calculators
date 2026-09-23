/**
 * Panel placements for nest-on-bolt SVG preview (visualization).
 * Uses existing throw pack / bolster nest math (across × rows).
 * When H/V repeats > 0, panels are re-centered onto pattern cell centers
 * (same idea as Nesting snapCenterToPattern) — not paint-only.
 */

import { dogEarPanelPolygon, type Point } from './dogEar'
import { patternCellPitch, type PackResult } from './throwPillows'
import type { BolsterCuts, BolsterNesting } from './bolsterPillows'

export type NestPanelKind = 'throw-panel' | 'barrel' | 'end'

export type NestPanelPlacement = {
  kind: NestPanelKind
  x: number
  y: number
  w: number
  h: number
  polygon?: Point[]
  label?: string
}

export type NestPreviewModel = {
  fabricWidthIn: number
  lengthInches: number
  panels: NestPanelPlacement[]
  leftoverAcrossIn: number
}

export function patternHOffset(fabricWidthIn: number, hRepeatIn: number): number {
  if (hRepeatIn <= 0) return 0
  return (fabricWidthIn % hRepeatIn) / 2
}

/**
 * Major yard marks along bolt length (inches), same contract as Nesting Page yardTicks.
 * Includes one step past ceil(length/36) so the end of a partial yard still gets a mark
 * when the canvas is tall enough; callers clip draw to the bolt rect.
 */
export function yardMajorInches(lengthInches: number): number[] {
  const majors: number[] = []
  const maxYd = Math.ceil(Math.max(0, lengthInches) / 36) + 1
  for (let yd = 0; yd <= maxYd; yd++) majors.push(yd * 36)
  return majors
}

/** Snap panel top-left so its center lands on the nearest pattern cell/stripe center. */
export function snapPanelToPatternCenter(
  panelW: number,
  panelH: number,
  approxX: number,
  approxY: number,
  fabricWidthIn: number,
  hRepeatIn: number,
  vRepeatIn: number,
): { x: number; y: number } {
  let x = approxX
  let y = approxY
  const cx = approxX + panelW / 2
  const cy = approxY + panelH / 2
  if (hRepeatIn > 0) {
    const hOff = patternHOffset(fabricWidthIn, hRepeatIn)
    const i = Math.max(0, Math.round((cx - hOff) / hRepeatIn - 0.5))
    x = hOff + (i + 0.5) * hRepeatIn - panelW / 2
    x = Math.max(0, Math.min(x, Math.max(0, fabricWidthIn - panelW)))
  }
  if (vRepeatIn > 0) {
    const j = Math.max(0, Math.round(cy / vRepeatIn - 0.5))
    y = Math.max(0, (j + 0.5) * vRepeatIn - panelH / 2)
  }
  return { x, y }
}

export type ThrowNestOpts = {
  dogEar?: boolean
  hRepeatIn?: number
  vRepeatIn?: number
}

export function throwNestPlacements(
  pack: PackResult,
  fabricWidthIn: number,
  opts: ThrowNestOpts = {},
): NestPanelPlacement[] {
  const { acrossIn, alongIn } = pack.orientation
  const hR = opts.hRepeatIn ?? 0
  const vR = opts.vRepeatIn ?? 0
  const acrossPitch = patternCellPitch(acrossIn, hR)
  const alongPitch = patternCellPitch(alongIn, vR)
  const panels: NestPanelPlacement[] = []

  for (let i = 0; i < pack.panelsNeeded; i++) {
    const row = Math.floor(i / pack.acrossCount)
    const col = i % pack.acrossCount
    // Center panel inside its pitch cell, then snap to pattern centers when active.
    const cellX = col * acrossPitch
    const cellY = row * alongPitch
    let x = cellX + (acrossPitch - acrossIn) / 2
    let y = cellY + (alongPitch - alongIn) / 2
    if (hR > 0 || vR > 0) {
      const snapped = snapPanelToPatternCenter(
        acrossIn,
        alongIn,
        x,
        y,
        fabricWidthIn,
        hR,
        vR,
      )
      x = snapped.x
      y = snapped.y
    }
    panels.push({
      kind: 'throw-panel',
      x,
      y,
      w: acrossIn,
      h: alongIn,
      polygon: opts.dogEar ? dogEarPanelPolygon(acrossIn, alongIn) : undefined,
      label: `P${i + 1}`,
    })
  }
  return panels
}

export function throwNestPreview(
  pack: PackResult,
  fabricWidthIn: number,
  opts: ThrowNestOpts = {},
): NestPreviewModel {
  const panels = throwNestPlacements(pack, fabricWidthIn, opts)
  const maxBottom =
    panels.length === 0
      ? pack.lengthInches
      : Math.max(pack.lengthInches, ...panels.map((p) => p.y + p.h))
  return {
    fabricWidthIn,
    lengthInches: maxBottom,
    panels,
    leftoverAcrossIn: pack.leftoverAcrossIn,
  }
}

export function bolsterNestPreview(
  cuts: BolsterCuts,
  nest: BolsterNesting,
  quantity: number,
  fabricWidthIn: number,
  opts: { hRepeatIn?: number; vRepeatIn?: number } = {},
): NestPreviewModel {
  const panels: NestPanelPlacement[] = []
  const endD = cuts.endDiameterIn
  const barrelAcrossPitch = nest.barrelAcrossPitchIn ?? nest.barrelAcrossIn
  const barrelAlongPitch = nest.barrelAlongPitchIn ?? nest.barrelAlongBoltIn
  const endPitch = nest.endPitchIn ?? endD
  const endAlongPitch = nest.endAlongPitchIn ?? endD
  let endsPlaced = 0
  const endsNeeded = quantity * 2
  const hR = opts.hRepeatIn ?? 0
  const vR = opts.vRepeatIn ?? 0

  for (let row = 0; row < nest.barrelRows; row++) {
    const barrelsInRow =
      row < nest.barrelRows - 1
        ? nest.barrelAcrossCount
        : quantity - (nest.barrelRows - 1) * nest.barrelAcrossCount
    const y0 = row * barrelAlongPitch
    for (let col = 0; col < barrelsInRow; col++) {
      let x = col * barrelAcrossPitch + (barrelAcrossPitch - nest.barrelAcrossIn) / 2
      let y = y0 + (barrelAlongPitch - nest.barrelAlongBoltIn) / 2
      if (hR > 0 || vR > 0) {
        const snapped = snapPanelToPatternCenter(
          nest.barrelAcrossIn,
          nest.barrelAlongBoltIn,
          x,
          y,
          fabricWidthIn,
          hR,
          vR,
        )
        x = snapped.x
        y = snapped.y
      }
      panels.push({
        kind: 'barrel',
        x,
        y,
        w: nest.barrelAcrossIn,
        h: nest.barrelAlongBoltIn,
        label: `barrel ${panels.filter((p) => p.kind === 'barrel').length + 1}`,
      })
    }
    const free = fabricWidthIn - barrelsInRow * barrelAcrossPitch
    const endsThisRow = Math.max(0, Math.floor(free / endPitch + 1e-9))
    const place = Math.min(endsThisRow, endsNeeded - endsPlaced)
    for (let e = 0; e < place; e++) {
      let x = barrelsInRow * barrelAcrossPitch + e * endPitch + (endPitch - endD) / 2
      let y = y0 + (barrelAlongPitch - nest.barrelAlongBoltIn) / 2
      if (hR > 0 || vR > 0) {
        const snapped = snapPanelToPatternCenter(endD, endD, x, y, fabricWidthIn, hR, vR)
        x = snapped.x
        y = snapped.y
      }
      panels.push({
        kind: 'end',
        x,
        y,
        w: endD,
        h: endD,
        label: `end ${endsPlaced + e + 1}`,
      })
    }
    endsPlaced += place
  }

  const endsRemaining = Math.max(0, endsNeeded - endsPlaced)
  if (endsRemaining > 0) {
    const endAcross = Math.max(1, Math.floor(fabricWidthIn / endPitch + 1e-9))
    for (let i = 0; i < endsRemaining; i++) {
      const row = Math.floor(i / endAcross)
      const col = i % endAcross
      let x = col * endPitch + (endPitch - endD) / 2
      let y = nest.barrelUsedAlongIn + row * endAlongPitch
      if (hR > 0 || vR > 0) {
        const snapped = snapPanelToPatternCenter(endD, endD, x, y, fabricWidthIn, hR, vR)
        x = snapped.x
        y = snapped.y
      }
      panels.push({
        kind: 'end',
        x,
        y,
        w: endD,
        h: endD,
        label: `end ${endsPlaced + i + 1}`,
      })
    }
  }

  const maxBottom =
    panels.length === 0
      ? nest.lengthInches
      : Math.max(nest.lengthInches, ...panels.map((p) => p.y + p.h))

  return {
    fabricWidthIn,
    lengthInches: maxBottom,
    panels,
    leftoverAcrossIn: leftoverOnLastRow(panels, fabricWidthIn),
  }
}

function leftoverOnLastRow(panels: NestPanelPlacement[], fabricWidthIn: number): number {
  if (panels.length === 0) return fabricWidthIn
  const lastY = Math.max(...panels.map((p) => p.y))
  const onLast = panels.filter((p) => Math.abs(p.y - lastY) < 1e-9)
  const right = onLast.reduce((m, p) => Math.max(m, p.x + p.w), 0)
  return Math.max(0, fabricWidthIn - right)
}

export function countNestPanels(model: NestPreviewModel, kind?: NestPanelKind): number {
  if (!kind) return model.panels.length
  return model.panels.filter((p) => p.kind === kind).length
}
