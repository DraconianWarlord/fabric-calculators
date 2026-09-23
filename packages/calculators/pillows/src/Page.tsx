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
  type PanelRotation,
  type Unit,
} from './lib/throwPillows'
import {
  calculateBolster,
  type BolsterFit,
} from './lib/bolsterPillows'
import { BOLSTER_SA_NOTE, FILL_STYLE_HELP } from './lib/fillStyle'
import { DOG_EAR_OPTIONAL_NOTE } from './lib/dogEar'
import { throwNestPreview, bolsterNestPreview } from './lib/nestPreview'
import {
  ThrowReference,
  BolsterReference,
  ThrowFormThumb,
  BolsterFormThumb,
  FillStyleThumb,
  CutFinishedKey,
  ThrowLoftKey,
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
  const [throwRotation, setThrowRotation] = useState<PanelRotation>(0)
  const [pillowTypeId, setPillowTypeId] = useState('throw')
  const [throwFillStyle, setThrowFillStyle] = useState<FillStyle>(DEFAULT_FILL_STYLE)
  const [bolsterFit, setBolsterFit] = useState<BolsterFit>('regular')
  const [dogEarTrim, setDogEarTrim] = useState(false)
  const [hRepeatDraft, setHRepeatDraft] = useState('0')
  const [vRepeatDraft, setVRepeatDraft] = useState('0')
  const [bolsterRotation, setBolsterRotation] = useState<PanelRotation>(0)
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
        rotation: throwRotation,
        fillStyle: throwFillStyle,
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
      throwRotation,
      throwFillStyle,
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
        rotation: bolsterRotation,
        hRepeatIn,
        vRepeatIn,
        fit: bolsterFit,
      }),
    [formWidthIn, formLengthIn, quantity, fabricWidthIn, bolsterRotation, bolsterFit, hRepeatIn, vRepeatIn],
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
      setBolsterRotation(0)
      setBolsterFit('regular')
    } else {
      setWidthDraft(unit === 'in' ? '18' : String(Math.round(18 * 25.4)))
      setLengthDraft(unit === 'in' ? '18' : String(Math.round(18 * 25.4)))
      setThrowRotation(0)
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
        {/* LEFT — Reference chooser + controls (Nesting-parity middle nest focus unchanged) */}
        <aside className="sidebar left" data-mobile-pane="inputs">
          <section className="card bg-base-100 border border-base-300 shadow-none">
            <div className="card-body gap-3 p-4">
              <h2 className="card-title mb-0 text-xs font-bold uppercase tracking-wider text-base-content/60">
                reference
              </h2>
              <div className="ref-thumbs" role="group" aria-label="Pillow form">
                {PILLOW_TYPES.map((t) => {
                  const selected = pillowTypeId === t.id
                  const soon = t.status === 'soon'
                  const shortLabel =
                    t.id === 'throw' ? 'Throw' : t.id === 'bolster' ? 'Bolster' : t.label
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className={`ref-thumb${soon ? ' ref-thumb--soon' : ''}`}
                      aria-current={selected && !soon ? 'true' : undefined}
                      disabled={soon}
                      title={soon ? 'Coming soon' : t.blurb}
                      onClick={() => !soon && selectPillowType(t.id)}
                    >
                      {t.id === 'throw' ? (
                        <ThrowFormThumb selected={selected && !soon} />
                      ) : t.id === 'bolster' ? (
                        <BolsterFormThumb selected={selected && !soon} />
                      ) : null}
                      <span>{shortLabel}</span>
                      {soon ? <span className="badge badge-sm">Coming soon</span> : null}
                    </button>
                  )
                })}
              </div>
              {PILLOW_TYPES.some((t) => t.status === 'soon') ? (
                <p className="field-help m-0 text-xs leading-snug text-base-content/60">
                  Coming soon:{' '}
                  {PILLOW_TYPES.filter((t) => t.status === 'soon')
                    .map((t) => t.label)
                    .join(', ')}
                </p>
              ) : null}
              {!isBolster && (
                <>
                  <div className="ref-thumbs ref-thumbs--fill" role="group" aria-label="Fill style">
                    {(['flat', 'standard', 'plump'] as const).map((val) => (
                      <button
                        key={val}
                        type="button"
                        className="ref-thumb"
                        aria-current={throwFillStyle === val ? 'true' : undefined}
                        onClick={() => setThrowFillStyle(val)}
                      >
                        <FillStyleThumb fill={val} selected={throwFillStyle === val} />
                        {val}
                      </button>
                    ))}
                  </div>
                  <span className="field-help mt-0 text-xs leading-snug text-base-content/60">
                    {FILL_STYLE_HELP[throwFillStyle]}
                  </span>
                </>
              )}
              {isBolster ? (
                <BolsterReference
                  diameterIn={formWidthIn}
                  lengthIn={formLengthIn}
                  endDiameterIn={bolsterResult.cuts.endDiameterIn}
                  barrelAlongIn={bolsterResult.cuts.barrelAlongIn}
                  barrelCircIn={bolsterResult.cuts.barrelCircIn}
                  unit={unit}
                  compact={false}
                />
              ) : (
                <ThrowReference
                  formW={formWidthIn}
                  formL={formLengthIn}
                  cutW={throwResult.cutWidthIn}
                  cutL={throwResult.cutLengthIn}
                  finishedW={throwResult.finishedWidthIn}
                  finishedL={throwResult.finishedLengthIn}
                  seamAllowanceIn={seamAllowanceIn}
                  unit={unit}
                  fillStyle={throwFillStyle}
                  dogEarTrim={dogEarTrim}
                  compact={false}
                />
              )}
              {isBolster ? <CutFinishedKey /> : <ThrowLoftKey />}
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

                {isBolster && (
                  <fieldset className="m-0 min-w-0 border-0 p-0">
                    <legend className="mb-1.5 float-none w-full px-0 text-sm font-normal">
                      bolster fit
                    </legend>
                    <div className="join w-full" role="group" aria-label="Bolster fit">
                      {([['regular', 'regular'], ['tight', 'tight']] as const).map(([val, label]) => (
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
                    <span className="field-help mt-1.5 text-xs leading-snug text-base-content/60">
                      regular adds ½″ seam allowance; tight cuts to form and finishes about 1″ smaller.
                    </span>
                  </fieldset>
                )}
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
                pattern & rotation
              </h2>
              <div className="flex flex-col gap-4">
                <fieldset className="m-0 min-w-0 border-0 p-0">
                  <legend className="mb-1.5 float-none w-full px-0 text-sm font-normal">
                    panel rotation
                  </legend>
                  <button
                    type="button"
                    className={`btn btn-sm min-h-11 w-full ${
                      (isBolster ? bolsterRotation : throwRotation) === 90
                        ? 'btn-neutral'
                        : 'btn-ghost border-base-300'
                    }`}
                    aria-label="Rotate panels 90 degrees"
                    aria-pressed={(isBolster ? bolsterRotation : throwRotation) === 90}
                    onClick={() => {
                      if (isBolster) setBolsterRotation((r) => (r === 0 ? 90 : 0))
                      else setThrowRotation((r) => (r === 0 ? 90 : 0))
                    }}
                  >
                    {(isBolster ? bolsterRotation : throwRotation) === 90
                      ? 'Rotated 90° (tap to reset)'
                      : 'Rotate 90°'}
                  </button>
                  <span className="field-help mt-1.5 text-xs leading-snug text-base-content/60">
                    Swaps panel across/along placement for a tighter nest.
                  </span>
                </fieldset>
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

        </aside>

        {/* MIDDLE — nest preview = focus (Nesting bolt parity) */}
        <main className="canvas-wrap" data-mobile-pane="results">
          <section className="card bg-base-100 border border-base-300 shadow-none pillow-nest-card">
            <div className="card-body gap-2 p-4">
              <h2 className="card-title mb-0 text-xs font-bold uppercase tracking-wider text-base-content/60">
                nest preview
              </h2>
              <NestPreviewSvg
                model={nestModel}
                unit={unit}
                hRepeatIn={hRepeatIn}
                vRepeatIn={vRepeatIn}
                seamAllowanceIn={isBolster ? 0 : seamAllowanceIn}
              />
            </div>
          </section>
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
