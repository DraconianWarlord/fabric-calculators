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
    <header className="navbar sticky top-0 z-30 min-h-[60px] flex-wrap gap-x-3 gap-y-2 bg-neutral px-3 py-2 text-neutral-content sm:px-4">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-none">
        <img
          src={logoSrc}
          alt="Sailrite"
          className="h-8 w-auto object-contain sm:h-10"
        />
        {current && (
          <span
            className="badge badge-lg rounded-full border-0 bg-base-100 px-2.5 text-xs font-bold text-base-content max-[800px]:inline-flex min-[801px]:hidden"
            aria-current="page"
          >
            {current.label}
          </span>
        )}
        <MobileMoreCalculators catalog={catalog} currentPath={currentPath} />
      </div>

      <CalculatorNav catalog={catalog} currentPath={currentPath} />

      <div className="flex w-full min-w-0 flex-shrink-0 items-center justify-between gap-2 min-[801px]:ml-auto min-[801px]:w-auto min-[801px]:justify-end">
        {status}
        {showShop && (
          <a
            className="btn btn-primary btn-sm hidden min-h-9 border-base-100 text-primary-content min-[801px]:inline-flex"
            href={shopHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Shop Sailrite
          </a>
        )}
      </div>
    </header>
  )
}
