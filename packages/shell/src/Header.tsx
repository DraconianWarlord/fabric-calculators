import type { ReactNode } from 'react'
import type { CalculatorMeta } from './types'
import { CalculatorNav, MobileMoreCalculators } from './CalculatorNav'
import { SHOP } from './shopLinks'

export function Header({
  catalog,
  currentPath,
  status,
  logoSrc = '/sailrite-logo.png',
  shopHref = SHOP.home,
  showShop = true,
}: {
  catalog: CalculatorMeta[]
  currentPath: string
  status?: ReactNode
  logoSrc?: string
  shopHref?: string
  showShop?: boolean
}) {
  const current = catalog.find(
    (c) => c.path && (currentPath === c.path || currentPath.startsWith(c.path + '/')),
  )

  return (
    <header className="app-header">
      <div className="app-header-bar">
        <div className="app-header-identity">
          <img src={logoSrc} alt="Sailrite" className="brand-logo" />
          {current && (
            <span className="current-tool" aria-current="page">
              {current.label}
            </span>
          )}
          <MobileMoreCalculators catalog={catalog} currentPath={currentPath} />
        </div>

        <CalculatorNav catalog={catalog} currentPath={currentPath} />

        <div className="app-header-status">
          {status}
          {showShop && (
            <a
              className="shop-sailrite"
              href={shopHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              Shop Sailrite
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
