/**
 * Bolster (cylinder / neck-roll) pillow yardage math.
 *
 * Aligned with Sailrite Fabric Calculator:
 * https://www.fabric-calculator.com/bolster-pillows.aspx
 * Tips: https://www.fabric-calculator.com/tips.aspx#bolsterPillows
 *
 * Units are inches internally.
 */

import {
  DEFAULT_FABRIC_WIDTH_IN,
  MAX_QUANTITY,
  MIN_QUANTITY,
  exactYards,
  fromInches,
  nestCellPitch,
  nestCountAcross,
  nestSpanInches,
  orderYards,
  round2,
  toInches,
  type Unit,
  type PanelRotation,
} from './throwPillows'

export type { Unit }
export { DEFAULT_FABRIC_WIDTH_IN, MAX_QUANTITY, MIN_QUANTITY, fromInches, toInches }

export type BolsterPattern = 'horizontal' | 'vertical'
export type BolsterFit = 'regular' | 'tight'

/** Closure overlap added to barrel circumference (inches). Page note + live calc use 2". */
export const CLOSURE_OVERLAP_IN = 2

/**
 * Tips page mentions 2-1/4" for a 1" Velcro fold each side; live calculator and the
 * on-page note use 2". We follow live (2"). See docs/SPEC.md.
 */
export const CLOSURE_OVERLAP_TIPS_VELCRO_IN = 2.25

/** Regular Fit: SA added to diameter and length for cut sizes. */
export const REGULAR_SEAM_ALLOWANCE_IN = 0.5

/**
 * Tight Fit: cover finishes ~1" smaller in diameter and length; no SA added to cuts.
 * Circumference uses (D - 1).
 */
export const TIGHT_FINISHED_REDUCTION_IN = 1

/** Ease added per pillow to zipper length beyond barrel-along cut (inches). */
export const ZIPPER_EASE_IN = 2

/** Ease added per pillow for prefabricated end-circle piping (inches). */
export const BOLSTER_PIPING_EASE_PER_PILLOW_IN = 8

export type BolsterInput = {
  /** A — form diameter / width (inches) */
  diameterIn: number
  /** B — form length (inches) */
  lengthIn: number
  quantity: number
  fabricWidthIn: number
  pattern?: BolsterPattern
  /** Nesting-style panel pose; 90° swaps barrel across/along. */
  rotation?: PanelRotation
  /** Pattern cell repeat across/along the bolt. */
  hRepeatIn?: number
  vRepeatIn?: number
  /** Regular adds ½″; tight uses no cut add and a 1″ finished reduction. */
  fit?: BolsterFit
}

export type BolsterCuts = {
  endDiameterIn: number
  barrelAlongIn: number
  barrelCircIn: number
}

export type BolsterNesting = {
  barrelAcrossIn: number
  barrelAlongBoltIn: number
  barrelAcrossCount: number
  barrelRows: number
  barrelUsedAlongIn: number
  endsNestedBeside: number
  endAcrossCount: number
  endExtraRows: number
  endsUsedAlongIn: number
  lengthInches: number
  exactYards: number
  orderYards: number
  /** Cell pitches used when pattern repeats are active. */
  barrelAcrossPitchIn?: number
  barrelAlongPitchIn?: number
  endPitchIn?: number
  endAlongPitchIn?: number
}

export type BolsterResult = {
  cuts: BolsterCuts
  nest: BolsterNesting
  pipingIn: number
  pipingFt: number
  pipingOrderFt: number
  zipperIn: number
  cutList: { label: string; widthIn: number; lengthIn: number; qty: number }[]
  materials: string[]
}

export function bolsterCuts(
  diameterIn: number,
  lengthIn: number,
  fit: BolsterFit = 'regular',
): BolsterCuts {
  if (fit === 'regular') {
    return {
      endDiameterIn: diameterIn + REGULAR_SEAM_ALLOWANCE_IN,
      barrelAlongIn: lengthIn + REGULAR_SEAM_ALLOWANCE_IN,
      barrelCircIn: Math.PI * (diameterIn - REGULAR_SEAM_ALLOWANCE_IN) + CLOSURE_OVERLAP_IN,
    }
  }
  return {
    endDiameterIn: diameterIn,
    barrelAlongIn: lengthIn,
    barrelCircIn: Math.PI * (diameterIn - TIGHT_FINISHED_REDUCTION_IN) + CLOSURE_OVERLAP_IN,
  }
}

/** Backward-compatible explicit fit helper. */
export function bolsterCutsFromFit(
  diameterIn: number,
  lengthIn: number,
  fit: BolsterFit,
): BolsterCuts {
  return bolsterCuts(diameterIn, lengthIn, fit)
}

/**
 * Nest barrels + end circles on fabric width.
 * Horizontal: pattern around pillow -> circ down the nest, barrel-along across.
 * Vertical: pattern across pillow -> barrel-along down the nest, circ across.
 * End circles fill leftover width beside barrel rows when possible.
 */
export function nestBolster(
  cuts: BolsterCuts,
  quantity: number,
  fabricWidthIn: number,
  pattern: BolsterPattern,
  hRepeatIn = 0,
  vRepeatIn = 0,
): BolsterNesting {
  const barrelAcrossIn = pattern === 'horizontal' ? cuts.barrelAlongIn : cuts.barrelCircIn
  const barrelAlongBoltIn = pattern === 'horizontal' ? cuts.barrelCircIn : cuts.barrelAlongIn
  const barrelAcrossPitchIn = nestCellPitch(barrelAcrossIn, hRepeatIn)
  const barrelAlongPitchIn = nestCellPitch(barrelAlongBoltIn, vRepeatIn)
  const endPitchIn = nestCellPitch(cuts.endDiameterIn, hRepeatIn)
  const endAlongPitchIn = nestCellPitch(cuts.endDiameterIn, vRepeatIn)

  const barrelAcrossCount = nestCountAcross(fabricWidthIn, barrelAcrossIn, barrelAcrossPitchIn)
  const barrelRows = Math.ceil(quantity / barrelAcrossCount)
  const barrelUsedAlongIn = nestSpanInches(barrelRows, barrelAlongBoltIn, barrelAlongPitchIn)

  const endsNeeded = quantity * 2
  const endD = cuts.endDiameterIn
  const endAcrossCount = nestCountAcross(fabricWidthIn, endD, endPitchIn)

  let endsPlacedBeside = 0
  for (let row = 0; row < barrelRows; row++) {
    const barrelsInRow =
      row < barrelRows - 1
        ? barrelAcrossCount
        : quantity - (barrelRows - 1) * barrelAcrossCount
    const usedAcross = nestSpanInches(barrelsInRow, barrelAcrossIn, barrelAcrossPitchIn)
    const free = Math.max(0, fabricWidthIn - usedAcross)
    // Waste gap already in pitches; remaining strip packs end circles with endPitch.
    endsPlacedBeside += free + 1e-9 >= endD ? nestCountAcross(free, endD, endPitchIn) : 0
  }
  endsPlacedBeside = Math.min(endsPlacedBeside, endsNeeded)

  const endsRemaining = Math.max(0, endsNeeded - endsPlacedBeside)
  const endExtraRows = endsRemaining === 0 ? 0 : Math.ceil(endsRemaining / endAcrossCount)
  const endsUsedAlongIn = nestSpanInches(endExtraRows, endD, endAlongPitchIn)

  const lengthInches = barrelUsedAlongIn + endsUsedAlongIn
  const exact = exactYards(lengthInches)

  return {
    barrelAcrossIn,
    barrelAlongBoltIn,
    barrelAcrossCount,
    barrelRows,
    barrelUsedAlongIn,
    endsNestedBeside: endsPlacedBeside,
    endAcrossCount,
    endExtraRows,
    endsUsedAlongIn,
    lengthInches,
    exactYards: exact,
    orderYards: orderYards(exact),
    barrelAcrossPitchIn,
    barrelAlongPitchIn,
    endPitchIn,
    endAlongPitchIn,
  }
}

/**
 * Prefabricated piping around both end circles (inches).
 * Live: round(qty * (2 * PI * endDiameter + BOLSTER_PIPING_EASE_PER_PILLOW_IN))
 */
export function bolsterPipingInches(endDiameterIn: number, quantity: number): number {
  const per = 2 * Math.PI * endDiameterIn + BOLSTER_PIPING_EASE_PER_PILLOW_IN
  return Math.round(quantity * per)
}

/** Zipper chain along barrel length (inches): qty * (barrelAlong + ZIPPER_EASE_IN). */
export function zipperInches(barrelAlongIn: number, quantity: number): number {
  return quantity * (barrelAlongIn + ZIPPER_EASE_IN)
}

export function calculateBolster(input: BolsterInput): BolsterResult {
  const {
    diameterIn,
    lengthIn,
    quantity,
    fabricWidthIn,
    pattern = 'horizontal',
    rotation,
    hRepeatIn = 0,
    vRepeatIn = 0,
    fit = 'regular',
  } = input
  const cuts = bolsterCuts(diameterIn, lengthIn, fit)
  const resolvedPattern = rotation === 90 ? 'vertical' : rotation === 0 ? 'horizontal' : pattern
  const nest = nestBolster(cuts, quantity, fabricWidthIn, resolvedPattern, hRepeatIn, vRepeatIn)

  const pipingIn = bolsterPipingInches(cuts.endDiameterIn, quantity)
  const pipingFt = round2(pipingIn / 12)
  const pipingOrderFt = Math.ceil(pipingFt - 1e-9)
  const zipperIn = zipperInches(cuts.barrelAlongIn, quantity)

  const cutList = [
    {
      label: 'end circle',
      widthIn: cuts.endDiameterIn,
      lengthIn: cuts.endDiameterIn,
      qty: quantity * 2,
    },
    {
      label: 'barrel panel',
      widthIn: cuts.barrelAlongIn,
      lengthIn: round2(cuts.barrelCircIn),
      qty: quantity,
    },
  ]

  const materials = [
    `${nest.orderYards} yd fabric (${nest.exactYards.toFixed(2)} yd exact)`,
    `optional prefabricated piping: ${pipingOrderFt} ft (need ${pipingIn} in / ${pipingFt} ft)`,
    `Seamstick 1/4" basting tape: 1 roll`,
    `#4.5 zipper chain (coil): ${round2(zipperIn)} in`,
    `zipper sliders (coil): ${quantity}`,
    `thread: 1 cone`,
    `pillow forms: ${quantity}`,
  ]

  return {
    cuts,
    nest,
    pipingIn,
    pipingFt,
    pipingOrderFt,
    zipperIn,
    cutList,
    materials,
  }
}
