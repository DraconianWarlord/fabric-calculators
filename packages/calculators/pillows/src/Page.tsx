import { useEffect, useMemo, useState } from 'react'
import {
  buildShopLinks,
  shopFabricYardsLabel,
  useHeaderStatusOptional,
} from '@sailrite/calc-shell'
import { PILLOW_TYPES } from './pillowTypes'
import {
  DEFAULT_FABRIC_WIDTH_IN,
  DEFAULT_FILL_STYLE,
  MAX_QUANTITY,
  MIN_QUANTITY,
  calculateThrowPillows,
  fromInches,
  toInches,
  type FillStyle,
  type PatternDirection,
  type Unit,
} from './lib/throwPillows'
import {
  calculateBolster,
  type BolsterPattern,
} from './lib/bolsterPillows'
import { FILL_STYLE_HELP, BOLSTER_FILL_HELP } from './lib/fillStyle'
import { DOG_EAR_OPTIONAL_NOTE } from './lib/dogEar'
import { throwNestPreview, bolsterNestPreview } from './lib/nestPreview'
import { ThrowReference, BolsterReference } from './diagrams/ReferenceSvg'
import { NestPreviewSvg } from './diagrams/NestPreviewSvg'
import './Page.css'

const SHOP = buildShopLinks('pillows', 'fabric_pillows')

function formatDim(inches: number, unit: Unit): string {
  const v = fromInches(inches, unit)
  if (unit === 'in') {
    return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/\.?0+$/, '')
  }
  return v.toFixed(0)
}


export default function PillowsPage() {
  const [unit, setUnit] = useState<Unit>('in')
  const [widthDraft, setWidthDraft] = useState('18')
  const [lengthDraft, setLengthDraft] = useState('18')
  const [fabricDraft, setFabricDraft] = useState(String(DEFAULT_FABRIC_WIDTH_IN))
  const [quantity, setQuantity] = useState(1)
  const [pattern, setPattern] = useState<PatternDirection>('horizontal')
  const [pillowTypeId, setPillowTypeId] = useState('throw')
  const [fillStyle, setFillStyle] = useState<FillStyle>(DEFAULT_FILL_STYLE)
  const [dogEarTrim, setDogEarTrim] = useState(false)
  const [hRepeatDraft, setHRepeatDraft] = useState('0')
  const [vRepeatDraft, setVRepeatDraft] = useState('0')
  const [bolsterPattern, setBolsterPattern] = useState<BolsterPattern>('horizontal')
  const [mobileView, setMobileView] = useState<'inputs' | 'results'>('results')

  const formWidthIn = Math.max(0.1, toInches(Number(widthDraft) || 0, unit))
  const formLengthIn = Math.max(0.1, toInches(Number(lengthDraft) || 0, unit))
  const fabricWidthIn = Math.max(1, toInches(Number(fabricDraft) || 0, unit))
  const hRepeatIn = Math.max(0, toInches(Number(hRepeatDraft) || 0, unit))
  const vRepeatIn = Math.max(0, toInches(Number(vRepeatDraft) || 0, unit))

  const isBolster = pillowTypeId === 'bolster'

  const throwResult = useMemo(
    () =>
      calculateThrowPillows({
        formWidthIn,
        formLengthIn,
        quantity,
        fabricWidthIn,
        pattern,
        fillStyle,
        dogEarTrim,
      }),
    [formWidthIn, formLengthIn, quantity, fabricWidthIn, pattern, fillStyle, dogEarTrim],
  )

  const bolsterResult = useMemo(
    () =>
      calculateBolster({
        diameterIn: formWidthIn,
        lengthIn: formLengthIn,
        quantity,
        fabricWidthIn,
        pattern: bolsterPattern,
        fillStyle,
      }),
    [formWidthIn, formLengthIn, quantity, fabricWidthIn, bolsterPattern, fillStyle],
  )

  const nestModel = useMemo(() => {
    if (isBolster) {
      return bolsterNestPreview(bolsterResult.cuts, bolsterResult.nest, quantity, fabricWidthIn)
    }
    return throwNestPreview(throwResult.pack, fabricWidthIn, { dogEar: dogEarTrim })
  }, [isBolster, bolsterResult, throwResult.pack, quantity, fabricWidthIn, dogEarTrim])

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
    } else {
      setWidthDraft(unit === 'in' ? '18' : String(Math.round(18 * 25.4)))
      setLengthDraft(unit === 'in' ? '18' : String(Math.round(18 * 25.4)))
      setPattern('horizontal')
      setDogEarTrim(false)
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
                {isBolster ? BOLSTER_FILL_HELP[fillStyle] : FILL_STYLE_HELP[fillStyle]}
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

            <>
            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-1.5 float-none w-full px-0 text-sm font-normal">fill style</legend>
              <div className="join w-full" role="group" aria-label="Fill style">
                {(['flat', 'standard', 'plump'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`btn join-item btn-sm min-h-11 flex-1 ${fillStyle === val ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
                    aria-pressed={fillStyle === val}
                    onClick={() => setFillStyle(val)}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <span className="mt-1.5 text-xs leading-snug text-base-content/60">
                {isBolster ? BOLSTER_FILL_HELP[fillStyle] : FILL_STYLE_HELP[fillStyle]} UX labels
                (Videos Expert) — not Sailrite product names. Default Standard.
              </span>
            </fieldset>

            {!isBolster && (
              <label className="label cursor-pointer justify-start gap-3 min-h-11 py-0">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={dogEarTrim}
                  onChange={(e) => setDogEarTrim(e.target.checked)}
                />
                <span className="label-text text-sm">
                  Dog-ear corner trim
                  <span className="block text-xs font-normal text-base-content/60">
                    {DOG_EAR_OPTIONAL_NOTE}
                  </span>
                </span>
              </label>
            )}

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
            </>
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
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">'reference'</h2>
            {isBolster ? (
              <BolsterReference
                diameterIn={formWidthIn}
                lengthIn={formLengthIn}
                endDiameterIn={bolsterResult.cuts.endDiameterIn}
                barrelAlongIn={bolsterResult.cuts.barrelAlongIn}
                barrelCircIn={bolsterResult.cuts.barrelCircIn}
                unit={unit}
                fillStyle={fillStyle}
              />
            ) : (
              <ThrowReference
                formW={formWidthIn}
                formL={formLengthIn}
                cutW={throwResult.cutWidthIn}
                cutL={throwResult.cutLengthIn}
                finishedW={throwResult.finishedWidthIn}
                finishedL={throwResult.finishedLengthIn}
                unit={unit}
                fillStyle={fillStyle}
                dogEarTrim={dogEarTrim}
              />
            )}
            {!isBolster && (
              <p className="mt-2 text-xs leading-snug text-base-content/60">
                finished ≈ {formatDim(throwResult.finishedWidthIn, unit)} ×{' '}
                {formatDim(throwResult.finishedLengthIn, unit)} {unitLabel}
                {dogEarTrim ? ' · corners trimmed (dog-ears)' : ''}
              </p>
            )}
            </div>
          </section>


          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
            <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">nest preview</h2>
            <div className="mb-3 grid grid-cols-2 gap-3">
              <label className="flex w-full flex-col gap-1.5 text-sm">
                horizontal repeat
                <input className="input input-bordered w-full" type="number" min={0} step={1} value={hRepeatDraft} onChange={(e) => setHRepeatDraft(e.target.value)} />
              </label>
              <label className="flex w-full flex-col gap-1.5 text-sm">
                vertical repeat
                <input className="input input-bordered w-full" type="number" min={0} step={1} value={vRepeatDraft} onChange={(e) => setVRepeatDraft(e.target.value)} />
              </label>
            </div>
            <p className="mb-2 text-xs leading-snug text-base-content/60">
              0 = no pattern / stripes on that axis. Grid is visualization only.
            </p>
            <NestPreviewSvg model={nestModel} unit={unit} hRepeatIn={hRepeatIn} vRepeatIn={vRepeatIn} />
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
