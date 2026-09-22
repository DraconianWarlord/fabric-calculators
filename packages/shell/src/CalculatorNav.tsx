import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CalculatorMeta } from './types'

function isCurrent(calc: CalculatorMeta, currentPath: string): boolean {
  if (!calc.path) return false
  return currentPath === calc.path || currentPath.startsWith(calc.path + '/')
}

function MoreItem({
  calc,
  className,
  currentPath,
  onNavigate,
}: {
  calc: CalculatorMeta
  className?: string
  currentPath: string
  onNavigate?: () => void
}) {
  if (calc.path && (calc.status === 'active' || calc.status === 'live')) {
    if (isCurrent(calc, currentPath)) {
      return (
        <button type="button" className={className} disabled role="menuitem">
          <span>{calc.label}</span>
          <span className="calc-more-live">Here</span>
        </button>
      )
    }
    return (
      <Link
        className={className}
        to={calc.path}
        role="menuitem"
        onClick={onNavigate}
      >
        <span>{calc.label}</span>
        <span className="calc-more-live">Open</span>
      </Link>
    )
  }
  if (calc.status === 'live' && calc.href) {
    return (
      <a
        className={className}
        href={calc.href}
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
      >
        <span>{calc.label}</span>
        <span className="calc-more-live">Open</span>
      </a>
    )
  }
  return (
    <button
      type="button"
      className={className}
      disabled
      title="Coming soon"
      role="menuitem"
    >
      <span>{calc.label}</span>
      <span className="calc-more-soon">Coming soon</span>
    </button>
  )
}

export function CalculatorNav({
  catalog,
  currentPath,
}: {
  catalog: CalculatorMeta[]
  currentPath: string
}) {
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const current = useMemo(
    () => catalog.find((c) => isCurrent(c, currentPath)),
    [catalog, currentPath],
  )
  const others = useMemo(
    () => catalog.filter((c) => c.id !== current?.id),
    [catalog, current],
  )

  useEffect(() => {
    if (!moreOpen) return
    const onDoc = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [moreOpen])

  return (
    <nav className="calc-switch" aria-label="Calculators">
      {current ? (
        <span className="calc-switch-tab active" aria-current="page">
          {current.label}
        </span>
      ) : (
        <span className="calc-switch-tab active" aria-current="page">
          Calculators
        </span>
      )}
      <div className="calc-more" ref={moreRef}>
        <button
          type="button"
          className={`calc-more-btn${moreOpen ? ' open' : ''}`}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setMoreOpen((o) => !o)}
        >
          More <span aria-hidden>▾</span>
        </button>
        {moreOpen && (
          <ul className="calc-more-menu" role="menu">
            {others.map((c) => (
              <li key={c.id} role="none">
                <MoreItem
                  calc={c}
                  className="calc-more-item"
                  currentPath={currentPath}
                  onNavigate={() => setMoreOpen(false)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </nav>
  )
}

export function MobileMoreCalculators({
  catalog,
  currentPath,
}: {
  catalog: CalculatorMeta[]
  currentPath: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = useMemo(
    () => catalog.find((c) => isCurrent(c, currentPath)),
    [catalog, currentPath],
  )
  const others = useMemo(
    () => catalog.filter((c) => c.id !== current?.id),
    [catalog, current],
  )

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="calc-more-mobile" ref={ref}>
      <button
        type="button"
        className={`calc-more-mobile-btn${open ? ' open' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        More calculators <span aria-hidden>▾</span>
      </button>
      {open && (
        <ul className="calc-more-menu calc-more-menu--mobile" role="menu">
          {others.map((c) => (
            <li key={c.id} role="none">
              <MoreItem
                calc={c}
                className="calc-more-item"
                currentPath={currentPath}
                onNavigate={() => setOpen(false)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
