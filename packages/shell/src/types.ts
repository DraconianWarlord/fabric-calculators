/** Nav/catalog shape — mirrored by @sailrite/calc-registry CalculatorMeta. */
export type CalculatorStatus = 'active' | 'soon' | 'live'

export type CalculatorMeta = {
  id: string
  label: string
  path?: string
  status: CalculatorStatus
  href?: string
  primary?: boolean
}
