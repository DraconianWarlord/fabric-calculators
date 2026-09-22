import { useEffect } from 'react'
import { useHeaderStatusOptional } from '@sailrite/calc-shell'

/**
 * Calculator page body only — suite Header/nav live in apps/web + @sailrite/calc-shell.
 * Inject yardage (or other status) into the header via useHeaderStatusOptional().
 */
export default function ExamplePage() {
  const headerStatusCtx = useHeaderStatusOptional()
  useEffect(() => {
    if (!headerStatusCtx) return
    headerStatusCtx.setStatus(
      <div className="yards" aria-label="Yardage summary">
        <span className="yards-exact">0.00 yd</span>
        <span className="yards-order">Order 0 yd</span>
      </div>,
    )
    return () => headerStatusCtx.setStatus(null)
  }, [headerStatusCtx])

  return (
    <div className="calc-page calc-page--example">
      <p className="disclaimer" role="note">
        Estimate only — double-check all results thoroughly. Sailrite is not responsible for
        miscalculations, cut fabric, or purchased fabric from this tool.
      </p>
      <div style={{ padding: '1rem' }}>
        <h1>Example calculator</h1>
        <p>Replace this Page with your UI. Keep math in <code>lib/</code>.</p>
      </div>
    </div>
  )
}
