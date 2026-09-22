/** Pillow subtypes — Throw + Bolster active. */

export type PillowTypeStatus = 'active' | 'soon'

export type PillowType = {
  id: string
  label: string
  status: PillowTypeStatus
  /** Sailrite reference URL when known */
  referenceUrl?: string
  /** Short blurb for Coming soon cards */
  blurb?: string
}

export const PILLOW_TYPES: PillowType[] = [
  {
    id: 'throw',
    label: 'Throw Pillows',
    status: 'active',
    referenceUrl: 'https://www.fabric-calculator.com/throw-pillows.aspx',
    blurb: 'Knife-edge cover (front + back panels)',
  },
  {
    id: 'bolster',
    label: 'Bolster Pillows',
    status: 'active',
    referenceUrl: 'https://www.fabric-calculator.com/bolster-pillows.aspx',
    blurb: 'Cylinder / neck-roll cover (ends + barrel)',
  },
]

export const ACTIVE_PILLOW_TYPE = PILLOW_TYPES.find((t) => t.status === 'active')!
