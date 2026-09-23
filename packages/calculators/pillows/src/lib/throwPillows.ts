/**
 * Throw pillow (knife-edge cover) yardage math.
 *
 * Aligned with Sailrite Fabric Calculator:
 * https://www.fabric-calculator.com/throw-pillows.aspx
 * Tips: https://www.fabric-calculator.com/tips.aspx#throwPillows
 *
 * Units are inches internally.
 */

import {
  DEFAULT_FILL_STYLE,
  throwCutFace,
  throwFinishedFace,
  type FillStyle,
} from './fillStyle'
import { DOG_EAR_CUT_LIST_NOTE, DOG_EAR_OPTIONAL_NOTE } from './dogEar'

export type { FillStyle }
export { DEFAULT_FILL_STYLE }

export type Unit = 'in' | 'mm'
export type PatternDirection = 'none' | 'horizontal' | 'vertical'
/** Panel pose on the bolt. A 90° turn swaps across/along, like Nesting. */
export type PanelRotation = 0 | 90

export const MM_PER_IN = 25.4

/**
 * Default Sailrite throw tip: cut = form (Standard fill) with 1/2" seams →
 * finished ≈ form − 1" per dimension. Explicit SA control overrides this.
 */
export const SEAM_ALLOWANCE_IN = 0.5

/** Effective finished reduction vs form when using default SEAM_ALLOWANCE_IN seams. */
export const FORM_TO_FINISHED_REDUCTION_IN = 2 * SEAM_ALLOWANCE_IN // 1"

/** Knife-edge: front + back panels per pillow. */
export const PANELS_PER_PILLOW = 2

export const DEFAULT_FABRIC_WIDTH_IN = 54
export const MIN_QUANTITY = 1
export const MAX_QUANTITY = 20

/** Join ease added once to total prefabricated piping length (inches). */
export const PIPING_JOIN_EASE_IN = 10

/**
 * Straight (matching) piping strip width (inches).
 * Live: add-on = ceil(prefIn * strip / (fabricWidth - joinLoss)).
 */
export const MATCHING_PIPING_STRIP_WIDTH_IN = 3

/** Usable fabric-width reduction when estimating matching-piping strip yield. */
export const MATCHING_PIPING_WIDTH_JOIN_LOSS_IN = 1

/**
 * Bias-cut piping fabric add-on (inches of fabric length):
 * fabricWidth + round(2 * prefIn / (fabricWidth - adjust)).
 * Reverse-engineered from live Sailrite throw results (18x18 qty2 @54 -> 60 in).
 */
export const BIAS_PIPING_WIDTH_ADJUST_IN = 3
export const BIAS_PIPING_PREF_COEFF = 2

export function toInches(value: number, unit: Unit): number {
  return unit === 'in' ? value : value / MM_PER_IN
}

export function fromInches(inches: number, unit: Unit): number {
  return unit === 'in' ? inches : inches * MM_PER_IN
}

/**
 * Cut panel size from form + fill style (Videos Expert).
 * Default Standard: cut = form (Sailrite live calculator parity).
 */
export function cutPanelSize(
  formInches: number,
  fill: FillStyle = DEFAULT_FILL_STYLE,
  seamAllowanceIn: number = SEAM_ALLOWANCE_IN,
): number {
  return throwCutFace(formInches, fill, seamAllowanceIn)
}

/** Finished face = cut − 2×SA. */
export function finishedSize(
  formInches: number,
  fill: FillStyle = DEFAULT_FILL_STYLE,
  seamAllowanceIn: number = SEAM_ALLOWANCE_IN,
): number {
  return throwFinishedFace(formInches, fill, seamAllowanceIn)
}

export function exactYards(usedInches: number): number {
  return usedInches / 36
}

/** Match nesting: Sailrite sells full yards — ceil to whole yards. */
export function orderYards(exact: number, step = 1): number {
  if (exact <= 0) return 0
  return Math.ceil(exact / step - 1e-9) * step
}

/** Round to 2 decimal places (Sailrite display for feet / yard fractions). */
export function round2(n: number): number {
  return Math.round(n * 100 + Number.EPSILON) / 100
}

export type ThrowPillowInput = {
  /** A — pillow form width (inches) */
  formWidthIn: number
  /** B — pillow form length (inches) */
  formLengthIn: number
  quantity: number
  fabricWidthIn: number
  /** Legacy grain-direction input. Prefer `rotation`; retained for API compatibility. */
  pattern?: PatternDirection
  /** 0° keeps width across the bolt; 90° puts length across the bolt. */
  rotation?: PanelRotation
  /** Flat | Standard | Plump -- default Standard (cut = form). */
  fillStyle?: FillStyle
  /** Knife-edge dog-ear corner trim (default off). */
  dogEarTrim?: boolean
  /** Seam allowance per side (inches). Default 0.5. Finished = cut − 2×SA. */
  seamAllowanceIn?: number
  /** Pattern horizontal repeat (inches). >0 expands across pitch and re-centers. */
  hRepeatIn?: number
  /** Pattern vertical repeat (inches). >0 expands along pitch and re-centers. */
  vRepeatIn?: number
}

export type Orientation = {
  /** Panel edge placed across the bolt (fabric width direction). */
  acrossIn: number
  /** Panel edge placed along the bolt (yardage direction). */
  alongIn: number
  label: 'width-across' | 'length-across'
}

export type LeftoverStrip = {
  widthIn: number
  lengthIn: number
}

export type PackResult = {
  orientation: Orientation
  panelsNeeded: number
  acrossCount: number
  rows: number
  lengthInches: number
  exactYards: number
  orderYards: number
  leftoverAcrossIn: number
  leftover: LeftoverStrip | null
}

export type PipingOptional = {
  prefabricatedIn: number
  prefabricatedFt: number
  matchingFabricIn: number
  matchingFabricYd: number
  biasFabricIn: number
  biasFabricYd: number
}

export type ThrowPillowResult = {
  fillStyle: FillStyle
  dogEarTrim: boolean
  seamAllowanceIn: number
  cutWidthIn: number
  cutLengthIn: number
  finishedWidthIn: number
  finishedLengthIn: number
  panelsNeeded: number
  pack: PackResult
  alternatePack: PackResult | null
  cutList: { label: string; widthIn: number; lengthIn: number; qty: number; note?: string }[]
  materials: string[]
  piping: PipingOptional
}

/**
 * Horizontal: pattern on pillow length -> length down the nest, width across.
 * Vertical: pattern on pillow width -> width down the nest, length across.
 * None: try both; pick lower yardage (ties prefer horizontal).
 */
export function orientationsForPattern(
  formWidthIn: number,
  formLengthIn: number,
  pattern: PatternDirection,
): Orientation[] {
  const widthAcross: Orientation = {
    acrossIn: formWidthIn,
    alongIn: formLengthIn,
    label: 'width-across',
  }
  const lengthAcross: Orientation = {
    acrossIn: formLengthIn,
    alongIn: formWidthIn,
    label: 'length-across',
  }
  if (pattern === 'horizontal') return [widthAcross]
  if (pattern === 'vertical') return [lengthAcross]
  return [widthAcross, lengthAcross]
}

/** Nesting-style orientation control: rotating a panel swaps its across/along edges. */
export function orientationsForRotation(
  formWidthIn: number,
  formLengthIn: number,
  rotation: PanelRotation = 0,
): Orientation[] {
  return orientationsForPattern(formWidthIn, formLengthIn, rotation === 90 ? 'vertical' : 'horizontal')
}

/**
 * Prefabricated knife-edge piping (inches).
 * Live: qty * 2*(W+L) + PIPING_JOIN_EASE_IN
 * Example: 18x18 qty2 -> 2*72 + 10 = 154.
 */
export function prefabricatedPipingInches(
  formWidthIn: number,
  formLengthIn: number,
  quantity: number,
): number {
  const perimeter = 2 * (formWidthIn + formLengthIn)
  return quantity * perimeter + PIPING_JOIN_EASE_IN
}

/** Matching (straight-grain) piping fabric add-on along the bolt (inches). */
export function matchingPipingFabricInches(
  prefabricatedIn: number,
  fabricWidthIn: number,
): number {
  const usable = Math.max(1, fabricWidthIn - MATCHING_PIPING_WIDTH_JOIN_LOSS_IN)
  return Math.ceil((prefabricatedIn * MATCHING_PIPING_STRIP_WIDTH_IN) / usable - 1e-12)
}

/** Bias-cut piping fabric add-on along the bolt (inches). */
export function biasPipingFabricInches(
  prefabricatedIn: number,
  fabricWidthIn: number,
): number {
  const denom = Math.max(1, fabricWidthIn - BIAS_PIPING_WIDTH_ADJUST_IN)
  return fabricWidthIn + Math.round((BIAS_PIPING_PREF_COEFF * prefabricatedIn) / denom)
}

export function computePipingOptional(
  formWidthIn: number,
  formLengthIn: number,
  quantity: number,
  fabricWidthIn: number,
): PipingOptional {
  const prefabricatedIn = prefabricatedPipingInches(formWidthIn, formLengthIn, quantity)
  const matchingFabricIn = matchingPipingFabricInches(prefabricatedIn, fabricWidthIn)
  const biasFabricIn = biasPipingFabricInches(prefabricatedIn, fabricWidthIn)
  return {
    prefabricatedIn,
    prefabricatedFt: round2(prefabricatedIn / 12),
    matchingFabricIn,
    matchingFabricYd: round2(matchingFabricIn / 36),
    biasFabricIn,
    biasFabricYd: round2(biasFabricIn / 36),
  }
}

/**
 * Sailrite leftover strip:
 * - sideStrip = fabricWidth - acrossCount * acrossDim
 * - unusedInLastRow = (acrossCount - lastRowPanels) * acrossDim
 * - width = sideStrip + unusedInLastRow
 * - length = alongDim when sideStrip ~= 0; else full used length
 */
export function leftoverStrip(
  orientation: Orientation,
  panelsNeeded: number,
  acrossCount: number,
  rows: number,
  lengthInches: number,
  fabricWidthIn: number,
): LeftoverStrip | null {
  const sideStrip = fabricWidthIn - acrossCount * orientation.acrossIn
  const lastRowPanels = panelsNeeded - (rows - 1) * acrossCount
  const unusedInLastRow = (acrossCount - lastRowPanels) * orientation.acrossIn
  const widthIn = sideStrip + unusedInLastRow
  if (widthIn <= 1e-9) return null
  const lengthIn = sideStrip <= 1e-9 ? orientation.alongIn : lengthInches
  return { widthIn, lengthIn }
}

/**
 * Pitch for one panel cell when matching a pattern repeat.
 * With no repeat, pitch = panel edge. With repeat, ceil to whole repeats
 * so each panel sits in a cell large enough for pattern matching.
 */
export function patternCellPitch(panelDimIn: number, repeatIn: number): number {
  if (repeatIn <= 0) return panelDimIn
  return Math.max(panelDimIn, Math.ceil(panelDimIn / repeatIn - 1e-9) * repeatIn)
}

/**
 * Cutting clearance / waste between adjacent nested panels (both axes).
 * Included in pack pitch + yardage so totals stay honest.
 */
export const NEST_WASTE_GAP_IN = 0.5

/**
 * Origin-to-origin pitch for one nest cell: panel edge + waste gap,
 * or larger when pattern repeat requires it.
 */
export function nestCellPitch(
  panelDimIn: number,
  repeatIn = 0,
  gapIn = NEST_WASTE_GAP_IN,
): number {
  const minPitch = panelDimIn + Math.max(0, gapIn)
  if (repeatIn <= 0) return minPitch
  return Math.max(minPitch, patternCellPitch(panelDimIn, repeatIn))
}

/** Along-bolt (or across) span for `count` panels with pitch between origins. */
export function nestSpanInches(count: number, panelDimIn: number, pitchIn: number): number {
  if (count <= 0) return 0
  return (count - 1) * pitchIn + panelDimIn
}

/** How many panels fit in `spanIn` with the given origin pitch. */
export function nestCountAcross(spanIn: number, panelDimIn: number, pitchIn: number): number {
  if (panelDimIn <= 0) return 1
  if (panelDimIn > spanIn + 1e-9) return 1
  return Math.max(1, Math.floor((spanIn - panelDimIn) / Math.max(pitchIn, 1e-9) + 1e-9) + 1)
}

export function packPanels(
  orientation: Orientation,
  panelsNeeded: number,
  fabricWidthIn: number,
  hRepeatIn = 0,
  vRepeatIn = 0,
): PackResult {
  const acrossPitch = nestCellPitch(orientation.acrossIn, hRepeatIn)
  const alongPitch = nestCellPitch(orientation.alongIn, vRepeatIn)
  const acrossCount = nestCountAcross(fabricWidthIn, orientation.acrossIn, acrossPitch)
  const rows = Math.ceil(panelsNeeded / acrossCount)
  const lengthInches = nestSpanInches(rows, orientation.alongIn, alongPitch)
  const exact = exactYards(lengthInches)
  const lastRowPanels = panelsNeeded - (rows - 1) * acrossCount
  const leftoverAcrossIn = Math.max(
    0,
    fabricWidthIn - nestSpanInches(lastRowPanels, orientation.acrossIn, acrossPitch),
  )
  // Side strip = unused width after a full acrossCount row (honest nest span, not count×pitch).
  const fullRowSpan = nestSpanInches(acrossCount, orientation.acrossIn, acrossPitch)
  const sideStrip = Math.max(0, fabricWidthIn - fullRowSpan)
  const unusedInLastRow = Math.max(
    0,
    fullRowSpan - nestSpanInches(lastRowPanels, orientation.acrossIn, acrossPitch),
  )
  const leftoverWidth = sideStrip + unusedInLastRow
  const leftover: LeftoverStrip | null =
    leftoverWidth <= 1e-9
      ? null
      : {
          widthIn: leftoverWidth,
          lengthIn: sideStrip <= 1e-9 ? orientation.alongIn : lengthInches,
        }
  return {
    orientation,
    panelsNeeded,
    acrossCount,
    rows,
    lengthInches,
    exactYards: exact,
    orderYards: orderYards(exact),
    leftoverAcrossIn,
    leftover,
  }
}

export function calculateThrowPillows(input: ThrowPillowInput): ThrowPillowResult {
  const {
    formWidthIn,
    formLengthIn,
    quantity,
    fabricWidthIn,
    pattern = 'horizontal',
    rotation,
    fillStyle = DEFAULT_FILL_STYLE,
    dogEarTrim = false,
    seamAllowanceIn = SEAM_ALLOWANCE_IN,
    hRepeatIn = 0,
    vRepeatIn = 0,
  } = input

  const sa = Math.max(0, seamAllowanceIn)
  const cutWidthIn = cutPanelSize(formWidthIn, fillStyle, sa)
  const cutLengthIn = cutPanelSize(formLengthIn, fillStyle, sa)
  const panelsNeeded = quantity * PANELS_PER_PILLOW

  const orients = rotation === undefined
    ? orientationsForPattern(cutWidthIn, cutLengthIn, pattern)
    : orientationsForRotation(cutWidthIn, cutLengthIn, rotation)
  const packs = orients.map((o) => packPanels(o, panelsNeeded, fabricWidthIn, hRepeatIn, vRepeatIn))

  let best = packs[0]!
  for (const p of packs.slice(1)) {
    if (p.lengthInches + 1e-9 < best.lengthInches) best = p
  }
  const alternatePack =
    packs.length > 1 ? packs.find((p) => p !== best) ?? null : null

  const piping = computePipingOptional(
    formWidthIn,
    formLengthIn,
    quantity,
    fabricWidthIn,
  )

  const cutList: ThrowPillowResult['cutList'] = [
    {
      label: 'front / back panel',
      widthIn: cutWidthIn,
      lengthIn: cutLengthIn,
      qty: panelsNeeded,
      ...(dogEarTrim ? { note: DOG_EAR_CUT_LIST_NOTE } : {}),
    },
  ]

  const materials = [
    `${best.orderYards} yd fabric (${best.exactYards.toFixed(2)} yd exact)`,
    `${panelsNeeded} cut panels @ ${cutWidthIn} x ${cutLengthIn} in (knife-edge front + back; fill ${fillStyle})`,
    `finished cover approx ${finishedSize(formWidthIn, fillStyle, sa)} x ${finishedSize(formLengthIn, fillStyle, sa)} in (cut - ${2 * sa}" with ${sa}" seams)`,
    `optional prefabricated piping: ${piping.prefabricatedIn} in (${piping.prefabricatedFt} ft)`,
    `optional matching piping fabric: add ${piping.matchingFabricIn} in (${piping.matchingFabricYd} yd)`,
    `optional bias-cut piping fabric: add ${piping.biasFabricIn} in (${piping.biasFabricYd} yd)`,
  ]

  if (dogEarTrim) {
    materials.push(DOG_EAR_CUT_LIST_NOTE)
    materials.push(DOG_EAR_OPTIONAL_NOTE)
  }

  return {
    fillStyle,
    dogEarTrim,
    cutWidthIn,
    cutLengthIn,
    finishedWidthIn: finishedSize(formWidthIn, fillStyle, sa),
    finishedLengthIn: finishedSize(formLengthIn, fillStyle, sa),
    seamAllowanceIn: sa,
    panelsNeeded,
    pack: best,
    alternatePack,
    cutList,
    materials,
    piping,
  }
}
