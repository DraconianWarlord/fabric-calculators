/** Shared unit helpers. Calculators may keep their own copies for formula isolation. */
export type Unit = 'in' | 'mm'

export function toInches(value: number, unit: Unit): number {
  return unit === 'mm' ? value / 25.4 : value
}

export function fromInches(inches: number, unit: Unit): number {
  return unit === 'mm' ? inches * 25.4 : inches
}
