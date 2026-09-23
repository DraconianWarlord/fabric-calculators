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
  PANELS_PER_PILLOW,
  SEAM_ALLOWANCE_IN,
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
import { BOLSTER_FILL_HELP, BOLSTER_SA_NOTE, FILL_STYLE_HELP } from './lib/fillStyle'
import { DOG_EAR_OPTIONAL_NOTE } from './lib/dogEar'
import { throwNestPreview, bolsterNestPreview } from './lib/nestPreview'
import {
  ThrowReference,
  BolsterReference,
  ThrowFormThumb,
  BolsterFormThumb,
  FillStyleThumb,
  CutFinishedKey,
} from './diagrams/ReferenceSvg'
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
  const [seamDraft, setSeamDraft] = useState(String(SEAM_ALLOWANCE_IN))
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
  const seamAllowanceIn = Math.max(0, toInches(Number(seamDraft) || 0, unit))
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
        seamAllowanceIn,
        hRepeatIn,
        vRepeatIn,
      }),
    [
      formWidthIn,
      formLengthIn,
      quantity,
      fabricWidthIn,
      pattern,
      fillStyle,
      dogEarTrim,
      seamAllowanceIn,
      hRepeatIn,
      vRepeatIn,
    ],
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
      return bolsterNestPreview(bolsterResult.cuts, bolsterResult.nest, quantity, fabricWidthIn, {
        hRepeatIn,
        vRepeatIn,
      })
    }
    return throwNestPreview(throwResult.pack, fabricWidthIn, {
      dogEar: dogEarTrim,
      hRepeatIn,
      vRepeatIn,
    })
  }, [
    isBolster,
    bolsterResult,
    throwResult.pack,
    quantity,
    fabricWidthIn,
    dogEarTrim,
    hRepeatIn,
    vRepeatIn,
  ])

  const exact = isBolster ? bolsterResult.nest.exactYards : throwResult.pack.exactYards
  const order = isBolster ? bolsterResult.nest.orderYards : throwResult.pack.orderYards
  const unitLabel = unit === 'in' ? 'in' : 'mm'
  const activeType = PILLOW_TYPES.find((t) => t.id === pillowTypeId) ?? PILLOW_TYPES[0]!
  const panelsNeeded = isBolster
    ? quantity /* barrel + ends called out in cut list */
    : quantity * PANELS_PER_PILLOW

  function switchUnit(next: Unit) {
    if (next === unit) return
    const convert = (draft: string, setter: (v: string) => void) => {
      const n = Number(draft)
      if (Number.isFinite(n) && n >= 0) {
        setter(String(Number(fromInches(toInches(n, unit), next).toFixed(next === 'in' ? 3 : 0))))
      }
    }
    convert(widthDraft, setWidthDraft)
    convert(lengthDraft, setLengthDraft)
    convert(fabricDraft, setFabricDraft)
    convert(seamDraft, setSeamDraft)
    convert(hRepeatDraft, setHRepeatDraft)
    convert(vRepeatDraft, setVRepeatDraft)
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

      <div className={`layout mobile-${mobileView}`}>
        {/* LEFT — controls (+ compact reference strip) */}
        <aside className="sidebar left" data-mobile-pane="inputs">
          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                form
              </h2>
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
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                fill
              </h2>
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
              <span className="field-help mt-1.5 text-xs leading-snug text-base-content/60">
                {isBolster ? BOLSTER_FILL_HELP[fillStyle] : FILL_STYLE_HELP[fillStyle]}
              </span>
            </div>
          </section>

          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                size
              </h2>
              <div className="flex flex-col gap-4">
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
                <label className="flex w-full min-w-0 flex-col gap-1.5 text-sm">
                  {isBolster ? 'A. diameter / width (form)' : 'A. width (form)'}
                  <input
                    className="input input-bordered min-h-11 w-full"
                    type="number"
                    min={1}
                    step={1}
                    value={widthDraft}
                    onChange={(e) => setWidthDraft(e.target.value)}
                  />
                </label>
                <label className="flex w-full min-w-0 flex-col gap-1.5 text-sm">
                  {isBolster ? 'B. length (form)' : 'B. length (form)'}
                  <input
                    className="input input-bordered min-h-11 w-full"
                    type="number"
                    min={1}
                    step={1}
                    value={lengthDraft}
                    onChange={(e) => setLengthDraft(e.target.value)}
                  />
                </label>
                <label className="flex w-full min-w-0 flex-col gap-1.5 text-sm">
                  fabric width
                  <input
                    className="input input-bordered min-h-11 w-full"
                    type="number"
                    min={1}
                    step={1}
                    value={fabricDraft}
                    onChange={(e) => setFabricDraft(e.target.value)}
                  />
                  <span className="field-help text-xs leading-snug text-base-content/60">
                    often 46, 54, or 60 {unitLabel}
                  </span>
                </label>
                <label className="flex w-full min-w-0 flex-col gap-1.5 text-sm">
                  Seam allowance ({unitLabel})
                  <input
                    className="input input-bordered min-h-11 w-full"
                    type="number"
                    min={0}
                    step={0.25}
                    value={seamDraft}
                    onChange={(e) => setSeamDraft(e.target.value)}
                  />
                  <span className="field-help text-xs leading-snug text-base-content/60">
                    {isBolster
                      ? BOLSTER_SA_NOTE
                      : 'Sailrite throw tip assumes ½″ seams unless you change this.'}
                  </span>
                </label>
                <label className="flex w-full min-w-0 flex-col gap-1.5 text-sm">
                  Pillows
                  <select
                    className="select select-bordered min-h-11 w-full"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    aria-label="Pillows"
                  >
                    {Array.from({ length: MAX_QUANTITY - MIN_QUANTITY + 1 }, (_, i) => {
                      const n = MIN_QUANTITY + i
                      return (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      )
                    })}
                  </select>
                  <span className="field-help text-xs leading-snug text-base-content/60">
                    {isBolster
                      ? '→ 1 barrel + 2 end circles per pillow'
                      : `→ ${quantity * PANELS_PER_PILLOW} panels (2 per pillow)`}
                  </span>
                </label>
              </div>
            </div>
          </section>

          {!isBolster && (
            <section className="card bg-base-100 border border-base-300 shadow-none">
              <div className="card-body gap-0 p-4">
                <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                  dog-ear
                </h2>
                <div className="join w-full" role="group" aria-label="Dog-ear corner trim">
                  <button
                    type="button"
                    className={`btn join-item btn-sm min-h-11 flex-1 ${!dogEarTrim ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
                    aria-pressed={!dogEarTrim}
                    onClick={() => setDogEarTrim(false)}
                  >
                    off
                  </button>
                  <button
                    type="button"
                    className={`btn join-item btn-sm min-h-11 flex-1 ${dogEarTrim ? 'btn-neutral' : 'btn-ghost border-base-300'}`}
                    aria-pressed={dogEarTrim}
                    onClick={() => setDogEarTrim(true)}
                  >
                    on
                  </button>
                </div>
                <span className="field-help mt-1.5 text-xs leading-snug text-base-content/60">
                  {DOG_EAR_OPTIONAL_NOTE}
                </span>
              </div>
            </section>
          )}

          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-0 p-4">
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                pattern
              </h2>
              <div className="flex flex-col gap-4">
                {isBolster ? (
                  <fieldset className="m-0 min-w-0 border-0 p-0">
                    <legend className="mb-1.5 float-none w-full px-0 text-sm font-normal">
                      pattern direction
                    </legend>
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
                  </fieldset>
                ) : (
                  <fieldset className="m-0 min-w-0 border-0 p-0">
                    <legend className="mb-1.5 float-none w-full px-0 text-sm font-normal">
                      pattern direction
                    </legend>
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
                  </fieldset>
                )}
                <details className="collapse collapse-arrow border border-base-300 bg-base-100">
                  <summary className="collapse-title min-h-11 py-2 text-sm font-medium">
                    Pattern repeats
                  </summary>
                  <div className="collapse-content">
                    <div className="mb-3 grid grid-cols-2 gap-3">
                      <label className="flex w-full min-w-0 flex-col gap-1.5 text-sm">
                        horizontal repeat
                        <input
                          className="input input-bordered min-h-11 w-full"
                          type="number"
                          min={0}
                          step={1}
                          value={hRepeatDraft}
                          onChange={(e) => setHRepeatDraft(e.target.value)}
                        />
                      </label>
                      <label className="flex w-full min-w-0 flex-col gap-1.5 text-sm">
                        vertical repeat
                        <input
                          className="input input-bordered min-h-11 w-full"
                          type="number"
                          min={0}
                          step={1}
                          value={vRepeatDraft}
                          onChange={(e) => setVRepeatDraft(e.target.value)}
                        />
                      </label>
                    </div>
                    <p className="field-help text-xs leading-snug text-base-content/60">
                      0 = off. Changing H/V re-nests and centers pattern on each panel.
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </section>

          {/* Compact Form×Fill reference strip (secondary — not hero) */}
          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-3 p-4">
              <h2 className="card-title mb-0 text-xs font-bold uppercase tracking-wider text-base-content/60">
                reference
              </h2>
              <div className="ref-thumbs" role="group" aria-label="Pillow form">
                <button
                  type="button"
                  className="ref-thumb"
                  aria-current={pillowTypeId === 'throw' ? 'true' : undefined}
                  onClick={() => selectPillowType('throw')}
                >
                  <ThrowFormThumb selected={pillowTypeId === 'throw'} />
                  Throw
                </button>
                <button
                  type="button"
                  className="ref-thumb"
                  aria-current={pillowTypeId === 'bolster' ? 'true' : undefined}
                  onClick={() => selectPillowType('bolster')}
                >
                  <BolsterFormThumb selected={pillowTypeId === 'bolster'} />
                  Bolster
                </button>
              </div>
              <div className="ref-thumbs ref-thumbs--fill" role="group" aria-label="Fill comparison">
                {(['flat', 'standard', 'plump'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    className="ref-thumb"
                    aria-current={fillStyle === val ? 'true' : undefined}
                    onClick={() => setFillStyle(val)}
                  >
                    <FillStyleThumb fill={val} selected={fillStyle === val} />
                    {val}
                  </button>
                ))}
              </div>
              {isBolster ? (
                <BolsterReference
                  diameterIn={formWidthIn}
                  lengthIn={formLengthIn}
                  endDiameterIn={bolsterResult.cuts.endDiameterIn}
                  barrelAlongIn={bolsterResult.cuts.barrelAlongIn}
                  barrelCircIn={bolsterResult.cuts.barrelCircIn}
                  unit={unit}
                  fillStyle={fillStyle}
                  compact
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
                  compact
                />
              )}
              <CutFinishedKey />
            </div>
          </section>

        </aside>

        {/* MIDDLE — nest preview = focus (Nesting bolt parity) */}
        <main className="canvas-wrap" data-mobile-pane="results">
          <h2 className="text-xs font-bold uppercase tracking-wider text-base-content/60">
            nest preview
          </h2>
          <NestPreviewSvg
            model={nestModel}
            unit={unit}
            hRepeatIn={hRepeatIn}
            vRepeatIn={vRepeatIn}
          />
        </main>

        {/* RIGHT — results / yardage */}
        <aside className="sidebar right" data-mobile-pane="results-side">
          <section className="card bg-base-100 border border-base-300 shadow-none results-hero">
            <div className="card-body gap-0 p-4">
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                yardage
              </h2>
              <div className="results-yards mb-3 flex flex-wrap gap-x-6 gap-y-3">
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
              <p className="mb-3 text-sm text-base-content/80">
                {isBolster
                  ? `${quantity} pillow${quantity === 1 ? '' : 's'} → ${quantity} barrel${quantity === 1 ? '' : 's'} + ${quantity * 2} ends`
                  : `${quantity} pillow${quantity === 1 ? '' : 's'} → ${panelsNeeded} panels (throw)`}
              </p>
              <a
                className="btn btn-outline min-h-11"
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
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                cut list
              </h2>
              <ul className="cut-list">
                {(isBolster ? bolsterResult.cutList : throwResult.cutList).map((c) => (
                  <li key={c.label}>
                    <strong>
                      {c.qty}× {formatDim(c.widthIn, unit)} × {formatDim(c.lengthIn, unit)}{' '}
                      {unitLabel}
                    </strong>
                    <span>{c.label}{'note' in c && c.note ? ` — ${c.note}` : ''}</span>
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
                <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                  piping or binding (optional)
                </h2>
                <ul className="materials">
                  <li>
                    Prefabricated piping:{' '}
                    <strong>
                      {throwResult.piping.prefabricatedIn} in / {throwResult.piping.prefabricatedFt} ft
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
              </div>
            </section>
          )}

          {isBolster && (
            <section className="card bg-base-100 border border-base-300 shadow-none">
              <div className="card-body gap-0 p-4">
                <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                  piping (optional)
                </h2>
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
              <h2 className="card-title mb-2 text-xs font-bold uppercase tracking-wider text-base-content/60">
                materials summary
              </h2>
              <ul className="materials">
                {(isBolster ? bolsterResult.materials : throwResult.materials).map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
