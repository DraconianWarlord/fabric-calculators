import { useEffect, useMemo, useState } from 'react'
import {
  buildShopLinks,
  shopFabricYardsLabel,
  useHeaderStatusOptional,
  cutShapeSvgProps,
  finishedShapeSvgProps,
  CutFinishedLegend,
  DIAGRAM_SR_BLUE,
  DIAGRAM_CUT_FILL,
} from '@sailrite/calc-shell'
import { PILLOW_TYPES } from './pillowTypes'
import {
  DEFAULT_FABRIC_WIDTH_IN,
  FORM_TO_FINISHED_REDUCTION_IN,
  MAX_QUANTITY,
  MIN_QUANTITY,
  SEAM_ALLOWANCE_IN,
  calculateThrowPillows,
  fromInches,
  toInches,
  type PatternDirection,
  type Unit,
} from './lib/throwPillows'
import {
  calculateBolster,
  type BolsterFit,
  type BolsterPattern,
} from './lib/bolsterPillows'
import './Page.css'

const SHOP = buildShopLinks('pillows', 'fabric_pillows')

function formatDim(inches: number, unit: Unit): string {
  const v = fromInches(inches, unit)
  if (unit === 'in') {
    return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, '')
  }
  return v.toFixed(0)
}

function ThrowDiagram({
  formW,
  formL,
  cutW,
  cutL,
  finishedW,
  finishedL,
  unit,
}: {
  formW: number
  formL: number
  cutW: number
  cutL: number
  finishedW: number
  finishedL: number
  unit: Unit
}) {
  const max = Math.max(cutW, cutL, finishedW, finishedL, 1)
  const scale = 140 / max
  const cw = cutW * scale
  const cl = cutL * scale
  const finW = Math.max(4, finishedW * scale)
  const finL = Math.max(4, finishedL * scale)
  const pad = 28
  const svgW = cw + pad * 2 + 120
  const svgH = cl + pad * 2 + 8

  return (
    <svg
      className="pillow-diagram"
      viewBox={`0 0 ${svgW} ${svgH}`}
      role="img"
      aria-label="Form, cut, and finished cover diagram"
    >
      <rect
        x={pad}
        y={pad}
        width={cw}
        height={cl}
        rx={2}
        {...cutShapeSvgProps()}
      />
      <text x={pad + cw / 2} y={pad - 10} textAnchor="middle" className="diag-label">
        cut (= form) {formatDim(cutW, unit)} × {formatDim(cutL, unit)} {unit}
      </text>
      <rect
        x={pad + (cw - finW) / 2}
        y={pad + (cl - finL) / 2}
        width={finW}
        height={finL}
        rx={2}
        {...finishedShapeSvgProps()}
      />
      <text
        x={pad + cw / 2}
        y={pad + cl / 2 + 4}
        textAnchor="middle"
        className="diag-label diag-label-inner"
      >
        finished
      </text>
      <CutFinishedLegend
        x={pad + cw + 16}
        y={pad + 8}
        cutLabel={`cut / form ${formatDim(formW, unit)}×${formatDim(formL, unit)}`}
        finishedLabel={`finished (−${FORM_TO_FINISHED_REDUCTION_IN}")`}
      />
    </svg>
  )
}

function BolsterDiagram({
  diameterIn,
  lengthIn,
  endDiameterIn,
  barrelAlongIn,
  barrelCircIn,
  unit,
}: {
  diameterIn: number
  lengthIn: number
  endDiameterIn: number
  barrelAlongIn: number
  barrelCircIn: number
  unit: Unit
}) {
  const r = 36
  const bodyW = 120
  const bodyH = 72
  const cx = 50
  const cy = 70
  return (
    <svg
      className="pillow-diagram"
      viewBox="0 0 280 150"
      role="img"
      aria-label="Bolster form and cut diagram"
    >
      <ellipse cx={cx} cy={cy} rx={r * 0.45} ry={r} {...cutShapeSvgProps()} />
      <rect x={cx} y={cy - r} width={bodyW} height={bodyH} fill={DIAGRAM_CUT_FILL} stroke="none" />
      <ellipse
        cx={cx + bodyW}
        cy={cy}
        rx={r * 0.45}
        ry={r}
        fill="#c5cae9"
        stroke={DIAGRAM_SR_BLUE}
        strokeWidth={2}
      />
      <line x1={cx} y1={cy - r} x2={cx + bodyW} y2={cy - r} stroke={DIAGRAM_SR_BLUE} strokeWidth={2} />
      <line x1={cx} y1={cy + r} x2={cx + bodyW} y2={cy + r} stroke={DIAGRAM_SR_BLUE} strokeWidth={2} />
      <text x={cx + bodyW / 2} y={cy - r - 8} textAnchor="middle" className="diag-label">
        B form {formatDim(lengthIn, unit)} → cut {formatDim(barrelAlongIn, unit)}
      </text>
      <text x={cx - 28} y={cy + 4} textAnchor="middle" className="diag-label" transform={`rotate(-90 ${cx - 28} ${cy})`}>
        A ⌀ {formatDim(diameterIn, unit)}
      </text>
      <text x={cx + bodyW + 40} y={cy - 10} className="diag-legend">
        end cut ⌀ {formatDim(endDiameterIn, unit)}
      </text>
      <text x={cx + bodyW + 40} y={cy + 8} className="diag-legend">
        barrel circ {formatDim(barrelCircIn, unit)}
      </text>
    </svg>
  )
}

export default function PillowsPage() {
  const [unit, setUnit] = useState<Unit>('in')
  const [widthDraft, setWidthDraft] = useState('18')
  const [lengthDraft, setLengthDraft] = useState('18')
  const [fabricDraft, setFabricDraft] = useState(String(DEFAULT_FABRIC_WIDTH_IN))
  const [quantity, setQuantity] = useState(1)
  const [pattern, setPattern] = useState<PatternDirection>('horizontal')
  const [pillowTypeId, setPillowTypeId] = useState('throw')
  const [bolsterFit, setBolsterFit] = useState<BolsterFit>('regular')
  const [bolsterPattern, setBolsterPattern] = useState<BolsterPattern>('horizontal')
  const [mobileView, setMobileView] = useState<'inputs' | 'results'>('results')

  const formWidthIn = Math.max(0.1, toInches(Number(widthDraft) || 0, unit))
  const formLengthIn = Math.max(0.1, toInches(Number(lengthDraft) || 0, unit))
  const fabricWidthIn = Math.max(1, toInches(Number(fabricDraft) || 0, unit))

  const isBolster = pillowTypeId === 'bolster'

  const throwResult = useMemo(
    () =>
      calculateThrowPillows({
        formWidthIn,
        formLengthIn,
        quantity,
        fabricWidthIn,
        pattern,
      }),
    [formWidthIn, formLengthIn, quantity, fabricWidthIn, pattern],
  )

  const bolsterResult = useMemo(
    () =>
      calculateBolster({
        diameterIn: formWidthIn,
        lengthIn: formLengthIn,
        quantity,
        fabricWidthIn,
        pattern: bolsterPattern,
        fit: bolsterFit,
      }),
    [formWidthIn, formLengthIn, quantity, fabricWidthIn, bolsterPattern, bolsterFit],
  )

  const exact = isBolster ? bolsterResult.nest.exactYards : throwResult.pack.exactYards
  const order = isBolster ? bolsterResult.nest.orderYards : throwResult.pack.orderYards
  const unitLabel = unit === 'in' ? 'in' : 'mm'
  const activeType = PILLOW_TYPES.find((t) => t.id === pillowTypeId) ?? PILLOW_TYPES[0]!

  function switchUnit(next: Unit) {
    if (next === unit) return
    const w = Number(widthDraft)
    const l = Number(lengthDraft)
    const f = Number(fabricDraft)
    if (Number.isFinite(w) && w > 0) {
      setWidthDraft(
        String(Number(fromInches(toInches(w, unit), next).toFixed(next === 'in' ? 3 : 0))),
      )
    }
    if (Number.isFinite(l) && l > 0) {
      setLengthDraft(
        String(Number(fromInches(toInches(l, unit), next).toFixed(next === 'in' ? 3 : 0))),
      )
    }
    if (Number.isFinite(f) && f > 0) {
      setFabricDraft(
        String(Number(fromInches(toInches(f, unit), next).toFixed(next === 'in' ? 3 : 0))),
      )
    }
    setUnit(next)
  }

  function selectPillowType(id: string) {
    setPillowTypeId(id)
    if (id === 'bolster') {
      setWidthDraft(unit === 'in' ? '8' : String(Math.round(8 * 25.4)))
      setLengthDraft(unit === 'in' ? '20' : String(Math.round(20 * 25.4)))
      setBolsterPattern('horizontal')
      setBolsterFit('regular')
    } else {
      setWidthDraft(unit === 'in' ? '18' : String(Math.round(18 * 25.4)))
      setLengthDraft(unit === 'in' ? '18' : String(Math.round(18 * 25.4)))
      setPattern('horizontal')
    }
  }

  const headerStatusCtx = useHeaderStatusOptional()
  const setHeaderStatus = headerStatusCtx?.setStatus
  useEffect(() => {
    if (!setHeaderStatus) return
    setHeaderStatus(
      <div className="yards" aria-label="Yardage summary">
        <span className="yards-exact">{exact.toFixed(2)} yd</span>
        <span className="yards-order">Order {order} yd</span>
      </div>,
    )
    return () => setHeaderStatus(null)
  }, [setHeaderStatus, exact, order])

  return (
    <div className="calc-page calc-page--pillows">
      <details className="disclaimer-mobile shrink-0 border-b border-base-300 bg-base-100 px-3 max-[800px]:block min-[801px]:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center text-xs font-semibold text-base-content/70 [&::-webkit-details-marker]:hidden">
          Estimate disclaimer
        </summary>
        <p className="pb-2 text-xs leading-snug text-base-content/60" role="note">
          Estimate only — double-check all results thoroughly. Sailrite is not responsible for
          miscalculations, cut fabric, or purchased fabric from this tool.
        </p>
      </details>
      <p className="disclaimer hidden shrink-0 border-b border-base-300 px-4 py-3 text-xs leading-snug text-base-content/60 min-[801px]:block" role="note">
        Estimate only — double-check all results thoroughly. Sailrite is not responsible for
        miscalculations, cut fabric, or purchased fabric from this tool.
      </p>

      <nav
        className="mobile-tabs hidden shrink-0 gap-1.5 border-b border-base-300 bg-base-100 px-2.5 py-1.5 max-[800px]:flex"
        aria-label="Main sections"
      >
        <button
          type="button"
          className={`btn btn-sm min-h-11 flex-1 ${mobileView === 'inputs' ? 'btn-primary' : 'btn-ghost border-base-300'}`}
          aria-pressed={mobileView === 'inputs'}
          onClick={() => setMobileView('inputs')}
        >
          Inputs
        </button>
        <button
          type="button"
          className={`btn btn-sm min-h-11 flex-1 ${mobileView === 'results' ? 'btn-primary' : 'btn-ghost border-base-300'}`}
          aria-pressed={mobileView === 'results'}
          onClick={() => setMobileView('results')}
        >
          Results
        </button>
      </nav>

      <div className={`layout mobile-${mobileView} grid min-h-0 flex-1 grid-cols-1 bg-base-200 max-[800px]:bg-base-100 max-[800px]:p-0 min-[801px]:grid-cols-[minmax(280px,360px)_1fr] min-[801px]:gap-6 min-[801px]:px-4 min-[801px]:pb-4 min-[801px]:pt-4`}>
        <aside className="sidebar left flex flex-col gap-4 overflow-y-auto max-[800px]:p-4" data-mobile-pane="inputs">
          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">pillow type</h2>
            <div className="grid gap-3" role="list">
              {PILLOW_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="listitem"
                  className={`btn btn-ghost h-auto min-h-11 w-full flex-col items-start gap-0.5 rounded-lg border border-base-300 bg-base-100 p-3 text-left font-normal normal-case${t.id === activeType.id ? ' border-primary ring-1 ring-primary' : ''}${t.status === 'soon' ? ' cursor-not-allowed opacity-85 bg-base-200' : ''}`}
                  disabled={t.status === 'soon'}
                  onClick={() => t.status === 'active' && selectPillowType(t.id)}
                  title={t.status === 'soon' ? 'Coming soon' : t.blurb}
                >
                  <span className="font-bold text-sm">{t.label}</span>
                  {t.status === 'soon' ? (
                    <span className="badge badge-sm">Coming soon</span>
                  ) : (
                    <span className="text-xs text-base-content/60">{t.blurb}</span>
                  )}
                </button>
              ))}
            </div>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">units</h2>
            <div className="join w-full" role="group" aria-label="Unit of measurement">
              <button
                type="button"
                className={`btn join-item btn-sm min-h-11 flex-1 ${unit === 'in' ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
                aria-pressed={unit === 'in'}
                onClick={() => switchUnit('in')}
              >
                inches
              </button>
              <button
                type="button"
                className={`btn join-item btn-sm min-h-11 flex-1 ${unit === 'mm' ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
                aria-pressed={unit === 'mm'}
                onClick={() => switchUnit('mm')}
              >
                mm
              </button>
            </div>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
              {isBolster ? 'bolster pillow inputs' : 'throw pillow inputs'}
            </h2>
            <div className="flex flex-col gap-4">
            <label className="flex w-full flex-col gap-1.5 text-sm">
              {isBolster ? 'A. diameter / width (form)' : 'A. width (form)'}
              <input
                className="input input-bordered w-full"
                type="number"
                min={1}
                step={1}
                value={widthDraft}
                onChange={(e) => setWidthDraft(e.target.value)}
              />
              <span className="text-xs leading-snug text-base-content/60">
                {isBolster
                  ? bolsterFit === 'regular'
                    ? `Regular Fit: end cut = form + ${SEAM_ALLOWANCE_IN}"; finished ≈ form − ${SEAM_ALLOWANCE_IN}"`
                    : 'Tight Fit: cut = form; finished ≈ form − 1"'
                  : `finished cover ≈ form − ${FORM_TO_FINISHED_REDUCTION_IN}" (${SEAM_ALLOWANCE_IN}" seams; cut = form)`}
              </span>
            </label>
            <label className="flex w-full flex-col gap-1.5 text-sm">
              {isBolster ? 'B. length (form)' : 'B. length (form)'}
              <input
                className="input input-bordered w-full"
                type="number"
                min={1}
                step={1}
                value={lengthDraft}
                onChange={(e) => setLengthDraft(e.target.value)}
              />
            </label>
            <label className="flex w-full flex-col gap-1.5 text-sm">
              quantity
              <select className="select select-bordered w-full" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
                {Array.from({ length: MAX_QUANTITY - MIN_QUANTITY + 1 }, (_, i) => {
                  const n = MIN_QUANTITY + i
                  return (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  )
                })}
              </select>
            </label>
            <label className="flex w-full flex-col gap-1.5 text-sm">
              fabric width
              <input
                className="input input-bordered w-full"
                type="number"
                min={1}
                step={1}
                value={fabricDraft}
                onChange={(e) => setFabricDraft(e.target.value)}
              />
              <span className="text-xs leading-snug text-base-content/60">often 46, 54, or 60 {unitLabel}</span>
            </label>

            {isBolster ? (
              <>
                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend className="mb-1.5 float-none w-full px-0 text-sm font-normal">pattern direction</legend>
                  <div className="join w-full" role="group" aria-label="Bolster pattern direction">
                    {(
                      [
                        ['horizontal', 'horizontal'],
                        ['vertical', 'vertical'],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        className={`btn join-item btn-sm min-h-11 flex-1 ${bolsterPattern === val ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
                        aria-pressed={bolsterPattern === val}
                        onClick={() => setBolsterPattern(val)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <span className="mt-1.5 text-xs leading-snug text-base-content/60">
                    horizontal = pattern around the pillow (circ along bolt). vertical = pattern
                    across the pillow (length along bolt).
                  </span>
                </fieldset>
                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend className="mb-1.5 float-none w-full px-0 text-sm font-normal">fit</legend>
                  <div className="join w-full" role="group" aria-label="Bolster fit">
                    {(
                      [
                        ['regular', 'regular'],
                        ['tight', 'tight'],
                      ] as const
                    ).map(([val, label]) => (
                      <button
                        key={val}
                        type="button"
                        className={`btn join-item btn-sm min-h-11 flex-1 ${bolsterFit === val ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
                        aria-pressed={bolsterFit === val}
                        onClick={() => setBolsterFit(val)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <span className="mt-1.5 text-xs leading-snug text-base-content/60">
                    Regular adds ½″ SA (default). Tight adds none — cover ~1″ smaller. Closure
                    overlap 2″ on circumference (tips mention 2¼″ for Velcro).
                  </span>
                </fieldset>
              </>
            ) : (
              <fieldset className="m-0 min-w-0 border-0 p-0">
                <legend className="mb-1.5 float-none w-full px-0 text-sm font-normal">pattern direction</legend>
                <div className="join w-full" role="group" aria-label="Pattern direction">
                  {(
                    [
                      ['horizontal', 'horizontal'],
                      ['vertical', 'vertical'],
                      ['none', 'none'],
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      className={`btn join-item btn-sm min-h-11 flex-1 ${pattern === val ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
                      aria-pressed={pattern === val}
                      onClick={() => setPattern(val)}
                      title={val === 'none' ? 'none / best pack' : label}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <span className="mt-1.5 text-xs leading-snug text-base-content/60">
                  Sailrite default is horizontal (pattern on pillow length). vertical = pattern on
                  width. none / best pack = pick lower yardage orientation.
                </span>
              </fieldset>
            )}
            </div>
            </div>
          </section>
        </aside>

        <main className="results flex flex-col gap-4 overflow-y-auto max-[800px]:p-4" data-mobile-pane="results">
          <section className="card bg-base-100 border border-base-300 shadow-none results-hero">
            <div className="card-body gap-0 p-4">
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">yardage</h2>
            <div className="results-yards mb-4 flex flex-wrap gap-x-8 gap-y-4">
              <div>
                <div className="text-3xl font-extrabold tracking-tight">{exact.toFixed(2)} yd</div>
                <div className="text-xs text-base-content/60">
                  {formatDim(
                    isBolster ? bolsterResult.nest.lengthInches : throwResult.pack.lengthInches,
                    unit,
                  )}{' '}
                  {unitLabel} along bolt
                </div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary">Order {order} yd</div>
                <div className="text-xs text-base-content/60">rounded up to whole yards</div>
              </div>
            </div>
            <a
              className="btn btn-primary min-h-11"
              href={SHOP.fabric}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shopFabricYardsLabel(order)}
            </a>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">cut list</h2>
            <ul className="cut-list">
              {(isBolster ? bolsterResult.cutList : throwResult.cutList).map((c) => (
                <li key={c.label}>
                  <strong>
                    {c.qty}× {formatDim(c.widthIn, unit)} × {formatDim(c.lengthIn, unit)}{' '}
                    {unitLabel}
                  </strong>
                  <span>{c.label}</span>
                </li>
              ))}
            </ul>
            {isBolster ? (
              <p className="mt-2 text-xs leading-snug text-base-content/60">
                nesting: {bolsterResult.nest.barrelAcrossCount} barrel
                {bolsterResult.nest.barrelAcrossCount === 1 ? '' : 's'} across ×{' '}
                {bolsterResult.nest.barrelRows} row
                {bolsterResult.nest.barrelRows === 1 ? '' : 's'}
                {bolsterResult.nest.endExtraRows > 0
                  ? ` + ${bolsterResult.nest.endExtraRows} end-circle row${
                      bolsterResult.nest.endExtraRows === 1 ? '' : 's'
                    }`
                  : ' (ends nested beside barrels)'}
              </p>
            ) : (
              <p className="mt-2 text-xs leading-snug text-base-content/60">
                packing: {throwResult.pack.acrossCount} across × {throwResult.pack.rows} row
                {throwResult.pack.rows === 1 ? '' : 's'} (
                {throwResult.pack.orientation.label === 'width-across'
                  ? 'width across bolt'
                  : 'length across bolt'}
                )
              </p>
            )}
            </div>
          </section>

          {!isBolster && (
            <section className="card bg-base-100 border border-base-300 shadow-none">
              <div className="card-body gap-0 p-4">
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">piping or binding (optional)</h2>
              <ul className="materials">
                <li>
                  Prefabricated piping:{' '}
                  <strong>
                    {throwResult.piping.prefabricatedIn} in / {throwResult.piping.prefabricatedFt}{' '}
                    ft
                  </strong>
                </li>
                <li>
                  Matching (straight) piping fabric add-on:{' '}
                  <strong>
                    {throwResult.piping.matchingFabricIn} in /{' '}
                    {throwResult.piping.matchingFabricYd} yd
                  </strong>
                </li>
                <li>
                  Bias-cut piping fabric add-on:{' '}
                  <strong>
                    {throwResult.piping.biasFabricIn} in / {throwResult.piping.biasFabricYd} yd
                  </strong>
                </li>
              </ul>
              {throwResult.pack.leftover ? (
                <p className="mt-2 text-xs leading-snug text-base-content/60">
                  Fabric left over: a strip{' '}
                  <strong>
                    {formatDim(throwResult.pack.leftover.widthIn, unit)} ×{' '}
                    {formatDim(throwResult.pack.leftover.lengthIn, unit)} {unitLabel}
                  </strong>{' '}
                  (usable for matching piping?).
                </p>
              ) : (
                <p className="mt-2 text-xs leading-snug text-base-content/60">Fabric left over: none.</p>
              )}
              </div>
            </section>
          )}

          {isBolster && (
            <section className="card bg-base-100 border border-base-300 shadow-none">
              <div className="card-body gap-0 p-4">
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">piping (optional)</h2>
              <ul className="materials">
                <li>
                  Prefabricated piping:{' '}
                  <strong>
                    {bolsterResult.pipingIn} in / {bolsterResult.pipingFt} ft
                  </strong>{' '}
                  — order {bolsterResult.pipingOrderFt} ft
                </li>
              </ul>
              </div>
            </section>
          )}

          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">{isBolster ? 'form vs cut' : 'form vs cut'}</h2>
            {isBolster ? (
              <BolsterDiagram
                diameterIn={formWidthIn}
                lengthIn={formLengthIn}
                endDiameterIn={bolsterResult.cuts.endDiameterIn}
                barrelAlongIn={bolsterResult.cuts.barrelAlongIn}
                barrelCircIn={bolsterResult.cuts.barrelCircIn}
                unit={unit}
              />
            ) : (
              <ThrowDiagram
                formW={formWidthIn}
                formL={formLengthIn}
                cutW={throwResult.cutWidthIn}
                cutL={throwResult.cutLengthIn}
                finishedW={throwResult.finishedWidthIn}
                finishedL={throwResult.finishedLengthIn}
                unit={unit}
              />
            )}
            {!isBolster && (
              <p className="mt-2 text-xs leading-snug text-base-content/60">
                finished ≈ {formatDim(throwResult.finishedWidthIn, unit)} ×{' '}
                {formatDim(throwResult.finishedLengthIn, unit)} {unitLabel}
              </p>
            )}
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">materials summary</h2>
            <ul className="materials">
              {(isBolster ? bolsterResult.materials : throwResult.materials).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}
