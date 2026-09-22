import { useEffect, useMemo, useState } from 'react'
import { buildShopLinks, shopFabricYardsLabel, useHeaderStatusOptional } from '@sailrite/calc-shell'
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
        fill="#e8eaf6"
        stroke="#24285e"
        strokeWidth={2}
        rx={2}
      />
      <text x={pad + cw / 2} y={pad - 10} textAnchor="middle" className="diag-label">
        cut (= form) {formatDim(cutW, unit)} × {formatDim(cutL, unit)} {unit}
      </text>
      <rect
        x={pad + (cw - finW) / 2}
        y={pad + (cl - finL) / 2}
        width={finW}
        height={finL}
        fill="none"
        stroke="#e75053"
        strokeWidth={1.5}
        strokeDasharray="4 3"
        rx={2}
      />
      <text
        x={pad + cw / 2}
        y={pad + cl / 2 + 4}
        textAnchor="middle"
        className="diag-label diag-label-inner"
      >
        finished
      </text>
      <g transform={`translate(${pad + cw + 16}, ${pad + 8})`}>
        <line x1={0} y1={0} x2={14} y2={0} stroke="#24285e" strokeWidth={2} />
        <text x={20} y={4} className="diag-legend">
          cut / form {formatDim(formW, unit)}×{formatDim(formL, unit)}
        </text>
        <line
          x1={0}
          y1={18}
          x2={14}
          y2={18}
          stroke="#e75053"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <text x={20} y={22} className="diag-legend">
          finished (−{FORM_TO_FINISHED_REDUCTION_IN}")
        </text>
      </g>
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
      <ellipse cx={cx} cy={cy} rx={r * 0.45} ry={r} fill="#e8eaf6" stroke="#24285e" strokeWidth={2} />
      <rect x={cx} y={cy - r} width={bodyW} height={bodyH} fill="#e8eaf6" stroke="none" />
      <ellipse
        cx={cx + bodyW}
        cy={cy}
        rx={r * 0.45}
        ry={r}
        fill="#c5cae9"
        stroke="#24285e"
        strokeWidth={2}
      />
      <line x1={cx} y1={cy - r} x2={cx + bodyW} y2={cy - r} stroke="#24285e" strokeWidth={2} />
      <line x1={cx} y1={cy + r} x2={cx + bodyW} y2={cy + r} stroke="#24285e" strokeWidth={2} />
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
      

      <p className="disclaimer" role="note">
        Estimate only — double-check all results thoroughly. Sailrite is not responsible for
        miscalculations, cut fabric, or purchased fabric from this tool.
      </p>

      <div className="layout">
        <aside className="sidebar left">
          <section className="card">
            <h2 className="card-title">pillow type</h2>
            <div className="type-grid" role="list">
              {PILLOW_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="listitem"
                  className={`type-card${t.id === activeType.id ? ' active' : ''}${
                    t.status === 'soon' ? ' soon' : ''
                  }`}
                  disabled={t.status === 'soon'}
                  onClick={() => t.status === 'active' && selectPillowType(t.id)}
                  title={t.status === 'soon' ? 'Coming soon' : t.blurb}
                >
                  <span className="type-label">{t.label}</span>
                  {t.status === 'soon' ? (
                    <span className="type-soon">Coming soon</span>
                  ) : (
                    <span className="type-blurb">{t.blurb}</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">units</h2>
            <div className="unit-toggle" role="group" aria-label="Unit of measurement">
              <button
                type="button"
                className={unit === 'in' ? 'active' : ''}
                aria-pressed={unit === 'in'}
                onClick={() => switchUnit('in')}
              >
                inches
              </button>
              <button
                type="button"
                className={unit === 'mm' ? 'active' : ''}
                aria-pressed={unit === 'mm'}
                onClick={() => switchUnit('mm')}
              >
                mm
              </button>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">
              {isBolster ? 'bolster pillow inputs' : 'throw pillow inputs'}
            </h2>
            <label>
              {isBolster ? 'A. diameter / width (form)' : 'A. width (form)'}
              <input
                type="number"
                min={1}
                step={1}
                value={widthDraft}
                onChange={(e) => setWidthDraft(e.target.value)}
              />
              <span className="hint">
                {isBolster
                  ? bolsterFit === 'regular'
                    ? `Regular Fit: end cut = form + ${SEAM_ALLOWANCE_IN}"; finished ≈ form − ${SEAM_ALLOWANCE_IN}"`
                    : 'Tight Fit: cut = form; finished ≈ form − 1"'
                  : `finished cover ≈ form − ${FORM_TO_FINISHED_REDUCTION_IN}" (${SEAM_ALLOWANCE_IN}" seams; cut = form)`}
              </span>
            </label>
            <label>
              {isBolster ? 'B. length (form)' : 'B. length (form)'}
              <input
                type="number"
                min={1}
                step={1}
                value={lengthDraft}
                onChange={(e) => setLengthDraft(e.target.value)}
              />
            </label>
            <label>
              quantity
              <select value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>
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
            <label>
              fabric width
              <input
                type="number"
                min={1}
                step={1}
                value={fabricDraft}
                onChange={(e) => setFabricDraft(e.target.value)}
              />
              <span className="hint">often 46, 54, or 60 {unitLabel}</span>
            </label>

            {isBolster ? (
              <>
                <fieldset className="pattern-fieldset">
                  <legend>pattern direction</legend>
                  {(
                    [
                      ['horizontal', 'horizontal'],
                      ['vertical', 'vertical'],
                    ] as const
                  ).map(([val, label]) => (
                    <label key={val} className="radio-label">
                      <input
                        type="radio"
                        name="bolster-pattern"
                        value={val}
                        checked={bolsterPattern === val}
                        onChange={() => setBolsterPattern(val)}
                      />
                      {label}
                    </label>
                  ))}
                  <span className="hint">
                    horizontal = pattern around the pillow (circ along bolt). vertical = pattern
                    across the pillow (length along bolt).
                  </span>
                </fieldset>
                <fieldset className="pattern-fieldset">
                  <legend>fit</legend>
                  {(
                    [
                      ['regular', 'regular'],
                      ['tight', 'tight'],
                    ] as const
                  ).map(([val, label]) => (
                    <label key={val} className="radio-label">
                      <input
                        type="radio"
                        name="bolster-fit"
                        value={val}
                        checked={bolsterFit === val}
                        onChange={() => setBolsterFit(val)}
                      />
                      {label}
                    </label>
                  ))}
                  <span className="hint">
                    Regular adds ½″ SA (default). Tight adds none — cover ~1″ smaller. Closure
                    overlap 2″ on circumference (tips mention 2¼″ for Velcro).
                  </span>
                </fieldset>
              </>
            ) : (
              <fieldset className="pattern-fieldset">
                <legend>pattern direction</legend>
                {(
                  [
                    ['horizontal', 'horizontal'],
                    ['vertical', 'vertical'],
                    ['none', 'none / best pack'],
                  ] as const
                ).map(([val, label]) => (
                  <label key={val} className="radio-label">
                    <input
                      type="radio"
                      name="pattern"
                      value={val}
                      checked={pattern === val}
                      onChange={() => setPattern(val)}
                    />
                    {label}
                  </label>
                ))}
                <span className="hint">
                  Sailrite default is horizontal (pattern on pillow length). vertical = pattern on
                  width. none / best pack = pick lower yardage orientation.
                </span>
              </fieldset>
            )}
          </section>
        </aside>

        <main className="results" data-mobile-pane="results">
          <section className="card results-hero">
            <h2 className="card-title">yardage</h2>
            <div className="results-yards">
              <div>
                <div className="big-exact">{exact.toFixed(2)} yd</div>
                <div className="big-meta">
                  {formatDim(
                    isBolster ? bolsterResult.nest.lengthInches : throwResult.pack.lengthInches,
                    unit,
                  )}{' '}
                  {unitLabel} along bolt
                </div>
              </div>
              <div>
                <div className="big-order">Order {order} yd</div>
                <div className="big-meta">rounded up to whole yards</div>
              </div>
            </div>
            <a
              className="shop-fabric"
              href={SHOP.fabric}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shopFabricYardsLabel(order)}
            </a>
          </section>

          <section className="card">
            <h2 className="card-title">cut list</h2>
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
              <p className="hint">
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
              <p className="hint">
                packing: {throwResult.pack.acrossCount} across × {throwResult.pack.rows} row
                {throwResult.pack.rows === 1 ? '' : 's'} (
                {throwResult.pack.orientation.label === 'width-across'
                  ? 'width across bolt'
                  : 'length across bolt'}
                )
              </p>
            )}
          </section>

          {!isBolster && (
            <section className="card">
              <h2 className="card-title">piping or binding (optional)</h2>
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
                <p className="hint">
                  Fabric left over: a strip{' '}
                  <strong>
                    {formatDim(throwResult.pack.leftover.widthIn, unit)} ×{' '}
                    {formatDim(throwResult.pack.leftover.lengthIn, unit)} {unitLabel}
                  </strong>{' '}
                  (usable for matching piping?).
                </p>
              ) : (
                <p className="hint">Fabric left over: none.</p>
              )}
            </section>
          )}

          {isBolster && (
            <section className="card">
              <h2 className="card-title">piping (optional)</h2>
              <ul className="materials">
                <li>
                  Prefabricated piping:{' '}
                  <strong>
                    {bolsterResult.pipingIn} in / {bolsterResult.pipingFt} ft
                  </strong>{' '}
                  — order {bolsterResult.pipingOrderFt} ft
                </li>
              </ul>
            </section>
          )}

          <section className="card">
            <h2 className="card-title">{isBolster ? 'form vs cut' : 'form vs cut'}</h2>
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
              <p className="hint">
                finished ≈ {formatDim(throwResult.finishedWidthIn, unit)} ×{' '}
                {formatDim(throwResult.finishedLengthIn, unit)} {unitLabel}
              </p>
            )}
          </section>

          <section className="card">
            <h2 className="card-title">materials summary</h2>
            <ul className="materials">
              {(isBolster ? bolsterResult.materials : throwResult.materials).map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>
        </main>
      </div>
    </div>
  )
}
