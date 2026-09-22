import { meta as nestingMeta } from '@sailrite/calc-nesting/meta'
import { meta as pillowsMeta } from '@sailrite/calc-pillows/meta'
import type { CalculatorMeta } from './types'

/** Full Sailrite calculator roadmap — in-suite calcs first, then soon list. */
export const CATALOG: CalculatorMeta[] = [
  nestingMeta,
  pillowsMeta,
  { id: 'foam-nesting', label: 'Foam Nesting', status: 'soon', primary: true },
  { id: 'cushions', label: 'Cushions', status: 'soon', primary: true },
  { id: 'awnings', label: 'Awnings', status: 'soon', primary: true },
  { id: 'tarps', label: 'Tarps', status: 'soon', primary: true },
  { id: 'sail-shades', label: 'Sail Shades', status: 'soon' },
  { id: 'window-treatments', label: 'Window Treatments', status: 'soon' },
  { id: 'upholstery', label: 'Upholstery', status: 'soon' },
  { id: 'boat-covers', label: 'Boat Covers', status: 'soon' },
  { id: 'wire-hung-canopies', label: 'Wire Hung Canopies', status: 'soon' },
  { id: 'sling-chairs', label: 'Sling Chairs', status: 'soon' },
  { id: 'umbrellas', label: 'Umbrellas', status: 'soon' },
  { id: 'porch-panels', label: 'Porch Panels', status: 'soon' },
  { id: 'slip-covers', label: 'Slip Covers', status: 'soon' },
  { id: 'flat-cone', label: 'Flat Cone', status: 'soon' },
]

export function getActiveByPath(pathname: string): CalculatorMeta | undefined {
  return CATALOG.find(
    (c) => c.path && (pathname === c.path || pathname.startsWith(c.path + '/')),
  )
}
