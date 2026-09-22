/** Sailrite.com commerce links with calculator UTMs for attribution. */

export type ShopMedium = 'nesting' | 'pillows' | 'suite' | (string & {})

export function buildShopLinks(medium: ShopMedium, campaign?: string) {
  const utmCampaign = campaign ?? `fabric_${medium}`
  const UTM = `utm_source=sailrite_calculators&utm_medium=${medium}&utm_campaign=${utmCampaign}`
  return {
    home: `https://www.sailrite.com/?${UTM}`,
    fabric: `https://www.sailrite.com/Fabrics?${UTM}&utm_content=shop_fabric`,
    foam: `https://www.sailrite.com/Foam-Cushion-Supplies?${UTM}&utm_content=shop_foam`,
    thread: `https://www.sailrite.com/Thread?${UTM}&utm_content=shop_thread`,
    tools: `https://www.sailrite.com/Tools-Notions?${UTM}&utm_content=shop_tools`,
    sewingMachines: `https://www.sailrite.com/Sewing-Machines?${UTM}&utm_content=shop_machines`,
  } as const
}

/** Default suite-level shop links (header CTA). */
export const SHOP = buildShopLinks('suite', 'fabric_calculators')

export function shopFabricYardsLabel(orderYards: number): string {
  if (orderYards <= 0) return 'Shop fabric at Sailrite'
  const n = Number.isInteger(orderYards) ? String(orderYards) : orderYards.toFixed(0)
  return `Shop ${n} yd of fabric at Sailrite`
}
