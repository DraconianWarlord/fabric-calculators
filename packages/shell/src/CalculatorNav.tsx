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
  const itemClass =
    className ??
    'flex w-full min-h-11 items-center justify-between gap-4 rounded-md px-4 py-3 text-left text-sm font-semibold text-neutral-content'

  if (calc.path && (calc.status === 'active' || calc.status === 'live')) {
    if (isCurrent(calc, currentPath)) {
      return (
        <button type="button" className={`${itemClass} cursor-default opacity-90`} disabled role="menuitem">
          <span>{calc.label}</span>
          <span className="badge badge-primary badge-sm border-0 text-primary-content">Here</span>
        </button>
      )
    }
    return (
      <Link className={`${itemClass} hover:bg-white/10`} to={calc.path} role="menuitem" onClick={onNavigate}>
        <span>{calc.label}</span>
        <span className="badge badge-primary badge-sm border-0 text-primary-content">Open</span>
      </Link>
    )
  }
  if (calc.status === 'live' && calc.href) {
    return (
      <a
        className={`${itemClass} hover:bg-white/10`}
        href={calc.href}
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
      >
        <span>{calc.label}</span>
        <span className="badge badge-primary badge-sm border-0 text-primary-content">Open</span>
      </a>
    )
  }
  return (
    <button
      type="button"
      className={`${itemClass} cursor-not-allowed opacity-80`}
      disabled
      title="Coming soon"
      role="menuitem"
    >
      <span>{calc.label}</span>
      <span className="badge badge-sm border-0 bg-base-100 text-base-content">Coming soon</span>
    </button>
  )
}

function MoreMenu({
  others,
  currentPath,
  onNavigate,
  align = 'end',
}: {
  others: CalculatorMeta[]
  currentPath: string
  onNavigate: () => void
  align?: 'start' | 'end'
}) {
  return (
    <ul
      className={`menu absolute top-[calc(100%+0.35rem)] z-40 max-h-[min(70vh,22rem)] min-w-64 overflow-y-auto rounded-box border border-white/20 bg-neutral p-2 shadow-lg ${
        align === 'end' ? 'right-0' : 'left-0'
      }`}
      role="menu"
    >
      {others.map((c) => (
        <li key={c.id} role="none">
          <MoreItem calc={c} currentPath={currentPath} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
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
    <nav
      className="hidden flex-1 items-center justify-center gap-1.5 min-[801px]:flex"
      aria-label="Calculators"
    >
      <span
        className="badge badge-lg rounded-full border-0 bg-base-100 px-3 text-xs font-bold text-base-content"
        aria-current="page"
      >
        {current ? current.label : 'Calculators'}
      </span>
      <div className="relative shrink-0" ref={moreRef}>
        <button
          type="button"
          className={`btn btn-ghost btn-sm min-h-11 rounded-full border border-white/25 text-neutral-content hover:bg-white/10 ${
            moreOpen ? 'bg-white/10' : ''
          }`}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setMoreOpen((o) => !o)}
        >
          More <span aria-hidden>▾</span>
        </button>
        {moreOpen && (
          <MoreMenu
            others={others}
            currentPath={currentPath}
            onNavigate={() => setMoreOpen(false)}
            align="end"
          />
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
    <div className="relative ml-1 shrink-0 max-[800px]:inline-flex min-[801px]:hidden" ref={ref}>
      <button
        type="button"
        className={`btn btn-ghost btn-sm min-h-11 rounded-full border border-white/30 px-2.5 text-xs font-semibold text-neutral-content hover:bg-white/10 ${
          open ? 'bg-white/10' : ''
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        More calculators <span aria-hidden>▾</span>
      </button>
      {open && (
        <MoreMenu
          others={others}
          currentPath={currentPath}
          onNavigate={() => setOpen(false)}
          align="end"
        />
      )}
    </div>
  )
}
