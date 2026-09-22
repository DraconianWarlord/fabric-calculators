/**
 * Panel placements for nest-on-bolt SVG preview (visualization).
 * Uses existing throw pack / bolster nest math (across × rows).
 */

import { dogEarPanelPolygon, type Point } from './dogEar'
import type { PackResult } from './throwPillows'
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

export function throwNestPlacements(
  pack: PackResult,
  opts: { dogEar?: boolean } = {},
): NestPanelPlacement[] {
  const { acrossIn, alongIn } = pack.orientation
  const panels: NestPanelPlacement[] = []
  for (let i = 0; i < pack.panelsNeeded; i++) {
    const row = Math.floor(i / pack.acrossCount)
    const col = i % pack.acrossCount
    panels.push({
      kind: 'throw-panel',
      x: col * acrossIn,
      y: row * alongIn,
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
  opts: { dogEar?: boolean } = {},
): NestPreviewModel {
  return {
    fabricWidthIn,
    lengthInches: pack.lengthInches,
    panels: throwNestPlacements(pack, opts),
    leftoverAcrossIn: pack.leftoverAcrossIn,
  }
}

export function bolsterNestPreview(
  cuts: BolsterCuts,
  nest: BolsterNesting,
  quantity: number,
  fabricWidthIn: number,
): NestPreviewModel {
  const panels: NestPanelPlacement[] = []
  const endD = cuts.endDiameterIn
  let endsPlaced = 0
  const endsNeeded = quantity * 2

  for (let row = 0; row < nest.barrelRows; row++) {
    const barrelsInRow =
      row < nest.barrelRows - 1
        ? nest.barrelAcrossCount
        : quantity - (nest.barrelRows - 1) * nest.barrelAcrossCount
    const y = row * nest.barrelAlongBoltIn
    for (let col = 0; col < barrelsInRow; col++) {
      panels.push({
        kind: 'barrel',
        x: col * nest.barrelAcrossIn,
        y,
        w: nest.barrelAcrossIn,
        h: nest.barrelAlongBoltIn,
        label: `barrel ${panels.filter((p) => p.kind === 'barrel').length + 1}`,
      })
    }
    const free = fabricWidthIn - barrelsInRow * nest.barrelAcrossIn
    const endsThisRow = Math.max(0, Math.floor(free / endD + 1e-9))
    const place = Math.min(endsThisRow, endsNeeded - endsPlaced)
    for (let e = 0; e < place; e++) {
      panels.push({
        kind: 'end',
        x: barrelsInRow * nest.barrelAcrossIn + e * endD,
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
    const endAcross = Math.max(1, Math.floor(fabricWidthIn / endD + 1e-9))
    for (let i = 0; i < endsRemaining; i++) {
      const row = Math.floor(i / endAcross)
      const col = i % endAcross
      panels.push({
        kind: 'end',
        x: col * endD,
        y: nest.barrelUsedAlongIn + row * endD,
        w: endD,
        h: endD,
        label: `end ${endsPlaced + i + 1}`,
      })
    }
  }

  return {
    fabricWidthIn,
    lengthInches: nest.lengthInches,
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
