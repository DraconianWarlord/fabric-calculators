export type CalculatorStatus = 'active' | 'soon' | 'live'

export type CalculatorMeta = {
  id: string
  label: string
  /** In-suite route path, e.g. `/nesting` */
  path?: string
  status: CalculatorStatus
  /** External URL when status === 'live' and not in this suite */
  href?: string
  /** Reserved for future primary-pill layouts */
  primary?: boolean
}
