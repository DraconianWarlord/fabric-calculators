import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))
const pageTsx = readFileSync(resolve(srcDir, 'Page.tsx'), 'utf8')
const pageCss = readFileSync(resolve(srcDir, 'Page.css'), 'utf8')
const referenceSvg = readFileSync(resolve(srcDir, 'diagrams/ReferenceSvg.tsx'), 'utf8')
const nestPreviewSvg = readFileSync(resolve(srcDir, 'diagrams/NestPreviewSvg.tsx'), 'utf8')
const shellSrc = resolve(srcDir, '../../../shell/src')
const headerTsx = readFileSync(resolve(shellSrc, 'Header.tsx'), 'utf8')
const calcNav = readFileSync(resolve(shellSrc, 'CalculatorNav.tsx'), 'utf8')
const tokensCss = readFileSync(resolve(shellSrc, 'tokens.css'), 'utf8')
const webStyles = readFileSync(
  resolve(srcDir, '../../../../apps/web/src/styles.css'),
  'utf8',
)

describe('pillows layout regressions', () => {
  it('mobile Inputs|Results tabs eliminate dual nested scroll at ≤800px', () => {
    expect(pageTsx).toMatch(/mobile-tabs/)
    expect(pageTsx).toMatch(/mobileView === 'inputs'/)
    expect(pageTsx).toMatch(/mobileView === 'results'/)
    expect(pageTsx).toMatch(/setMobileView\('inputs'\)/)
    expect(pageTsx).toMatch(/setMobileView\('results'\)/)
    expect(pageTsx).toMatch(/layout mobile-\$\{mobileView\}/)
    expect(pageCss).toMatch(/\.layout\.mobile-inputs \.canvas-wrap/)
    expect(pageCss).toMatch(/\.layout\.mobile-results \.sidebar\.left/)
    expect(pageCss).toMatch(/@media \(max-width: 800px\)/)
  })

  it('form+fill chooser is Reference thumbs ≥44px (no separate Form/Fill cards)', () => {
    expect(pageTsx).not.toMatch(/btn btn-ghost h-auto min-h-11 w-full flex-col/)
    expect(pageTsx).not.toMatch(/^\s+form\s*$/m)
    expect(pageTsx).not.toMatch(/^\s+fill\s*$/m)
    expect(pageTsx).not.toMatch(/join w-full" role="group" aria-label="Fill style"/)
    expect(pageTsx).toMatch(/className="ref-thumb/)
    expect(pageTsx).toMatch(/ThrowFormThumb|FillStyleThumb/)
    expect(pageTsx).toMatch(/aria-label="Pillow form"/)
    expect(pageTsx).toMatch(/aria-label="Fill style"/)
    expect(pageTsx).toMatch(/FILL_STYLE_HELP|BOLSTER_FILL_HELP/)
    expect(pageTsx).toMatch(/Coming soon/)
    expect(pageCss).toMatch(/\.ref-thumb\s*\{[^}]*min-height:\s*2\.75rem/)
    expect(pageTsx).toMatch(/compact=\{false\}/)
  })

  it('bolster hides throw fill chooser and uses independent fit math', () => {
    expect(pageTsx).toMatch(/!isBolster\s*&&\s*\(\s*<>[\s\S]*?FillStyleThumb/)
    expect(pageTsx).toMatch(/rotation: bolsterRotation,[\s\S]*?fit: bolsterFit/)
    expect(pageTsx).not.toMatch(/calculateBolster\([\s\S]*?fillStyle:/)
    expect(pageTsx).toMatch(/setThrowFillStyle/)
  })

  it('bolster fit (Regular|Tight) lives under Size near SA, not under Pattern', () => {
    const sizeAt = pageTsx.indexOf('\n                size\n')
    const patternAt = pageTsx.indexOf('\n                pattern & rotation\n')
    const fitAt = pageTsx.indexOf('aria-label="Bolster fit"')
    const saAt = pageTsx.indexOf('Seam allowance')
    expect(sizeAt).toBeGreaterThan(0)
    expect(patternAt).toBeGreaterThan(sizeAt)
    expect(fitAt).toBeGreaterThan(sizeAt)
    expect(fitAt).toBeLessThan(patternAt)
    expect(saAt).toBeGreaterThan(sizeAt)
    expect(fitAt).toBeGreaterThan(saAt)
    expect(pageTsx).toMatch(/isBolster && \([\s\S]*?aria-label="Bolster fit"/)
    expect(pageTsx).toMatch(/regular adds .* seam allowance; tight cuts to form/)
    // Pattern card owns rotation/repeats only; fit remains in Size.
    const patternSlice = pageTsx.slice(patternAt, patternAt + 1400)
    expect(patternSlice).toMatch(/panel rotation/)
    expect(patternSlice).not.toMatch(/aria-label="Bolster fit"/)
  })

  it('bolster references are single horizontal profile silhouettes', () => {
    expect(referenceSvg).toMatch(/aria-label="Bolster reference profile view"/)
    expect(referenceSvg).toMatch(/const bodyW = compact \? 72 : 120/)
    expect(referenceSvg).toMatch(/export function BolsterFormThumb[\s\S]*?<ellipse[\s\S]*?<rect[\s\S]*?<ellipse/)
    expect(referenceSvg).not.toMatch(/Bolster reference \$\{fillStyle\}/)
  })

  it('unit toggles are Daisy join ≥44px and neutral when selected (not dual primary)', () => {
    expect(pageTsx).toMatch(/className="join(?: w-full)?"/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{unit === 'in' \? 'btn-neutral'/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{unit === 'mm' \? 'btn-neutral'/)
    expect(pageTsx).not.toMatch(/unit === 'in' \? 'btn-primary'/)
    expect(pageTsx).not.toMatch(/unit === 'mm' \? 'btn-primary'/)
  })

  it('pattern card uses Nesting-style 90° rotation (not direction joins)', () => {
    expect(pageTsx).toMatch(/aria-label="Rotate panels 90 degrees"/)
    expect(pageTsx).toMatch(/setThrowRotation|setBolsterRotation/)
    expect(pageTsx).toMatch(/panel rotation/)
    expect(pageTsx).not.toMatch(/pattern direction/)
    expect(pageTsx).not.toMatch(/aria-label="Pattern direction"/)
    expect(pageTsx).not.toMatch(/aria-label="Bolster pattern direction"/)
  })

  it('yardage Shop is outline (not dual primary with header); header Shop outline + hidden on mobile', () => {
    expect(pageTsx).toMatch(/btn btn-outline min-h-11/)
    expect(pageTsx).toMatch(/shopFabricYardsLabel/)
    // Results Shop must not be solid primary (header already has Shop)
    expect(pageTsx).not.toMatch(/className="btn btn-primary min-h-11"/)
    expect(headerTsx).toMatch(/Shop Sailrite/)
    expect(headerTsx).toMatch(/btn btn-outline/)
    expect(headerTsx).toMatch(/hidden[\s\S]*?min-\[801px\]:inline-flex/)
  })

  it('Estimate-only banner is gone (desktop and mobile)', () => {
    expect(pageTsx).not.toMatch(/disclaimer-mobile/)
    expect(pageTsx).not.toMatch(/Estimate disclaimer/)
    expect(pageTsx).not.toMatch(/Estimate only/)
    expect(pageTsx).not.toMatch(/className="disclaimer/)
  })

  it('form-vs-cut finished outline uses diagram standard B (SR Blue dashed, not Alert Red)', () => {
    expect(pageTsx).toMatch(/ThrowReference|BolsterReference/)
    expect(referenceSvg).toMatch(/cutShapeSvgProps/)
    expect(referenceSvg).toMatch(/finishedShapeSvgProps/)
    expect(referenceSvg).toMatch(/CutFinishedKey/)
    expect(referenceSvg).toMatch(/DIAGRAM_SR_BLUE|DIAGRAM_CUT_FILL/)
    expect(nestPreviewSvg).toMatch(/DIAGRAM_SR_BLUE|DIAGRAM_CUT_FILL/)
    expect(nestPreviewSvg).toMatch(/DIAGRAM_FINISHED_DASH|strokeDasharray/)
    expect(nestPreviewSvg).toMatch(/insetPolygon|seamAllowanceIn/)
    // Nest cut panels keep dashed SA inset; throw Reference is side/loft (no face-on SA plate)
    expect(nestPreviewSvg).toMatch(/throwSeamAllowanceOutline|seamAllowanceIn|insetPolygon/)
    expect(pageTsx).not.toMatch(/stroke="#e75053"/)
    expect(referenceSvg).not.toMatch(/stroke="#e75053"/)
    expect(pageCss).toMatch(/\.diag-label-inner\s*\{[^}]*fill:\s*var\(--color-primary/)
    expect(pageCss).not.toMatch(/diag-label-inner[^}]*--sr-danger/)
    const diagrams = readFileSync(resolve(shellSrc, 'diagrams/cutFinished.ts'), 'utf8')
    expect(diagrams).toMatch(/DIAGRAM_SR_BLUE\s*=\s*'#24285e'/)
    expect(diagrams).toMatch(/DIAGRAM_FINISHED_DASH/)
  })

  it('header More controls are ≥44px hit targets', () => {
    expect(calcNav).toMatch(/btn btn-ghost btn-sm min-h-11 rounded-full border border-white\/25/)
    expect(calcNav).toMatch(/btn btn-ghost btn-sm min-h-11 rounded-full border border-white\/30/)
    expect(calcNav).toMatch(/min-h-11 items-center justify-between/)
  })

  it('inputs pane has no H-scrollbar (overflow-x hidden + wrapping helpers)', () => {
    expect(pageCss).toMatch(/\.sidebar\s*\{[^}]*overflow-x:\s*hidden/)
    expect(pageCss).toMatch(/\.field-help\s*\{[^}]*overflow-wrap:\s*break-word/)
    expect(pageTsx).toMatch(/field-help/)
  })

  it('dog-ear uses on/off Daisy join ≥44px (not tiny toggle)', () => {
    expect(pageTsx).toMatch(/aria-label="Dog-ear corner trim"/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{!dogEarTrim \? 'btn-neutral'/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{dogEarTrim \? 'btn-neutral'/)
    expect(pageTsx).not.toMatch(/toggle toggle-primary/)
  })

  it('reference strip + H/V repeat inputs are min-h-11; no stray quotes', () => {
    expect(pageTsx).toMatch(/reference/)
    expect(pageTsx).not.toMatch(/>'reference'</)
    expect(pageTsx).toMatch(/horizontal repeat[\s\S]*?input input-bordered min-h-11/)
    expect(pageTsx).toMatch(/vertical repeat[\s\S]*?input input-bordered min-h-11/)
  })

  it('Nesting-parity desktop shell: 280px | 1fr | 300px with middle nest focus', () => {
    expect(pageCss).toMatch(/grid-template-columns:\s*280px\s+1fr\s+300px/)
    expect(pageTsx).toMatch(/className="canvas-wrap"/)
    expect(pageTsx).toMatch(/sidebar left/)
    expect(pageTsx).toMatch(/sidebar right/)
    expect(pageTsx).toMatch(/nest preview/)
    expect(nestPreviewSvg).toMatch(/non-scaling-stroke/)
  })

  it('Quantity labeled Pillows with panel helper; SA control present', () => {
    expect(pageTsx).toMatch(/>\s*Pillows\s*</)
    expect(pageTsx).toMatch(/2 per pillow|panels \(2 per pillow\)/)
    expect(pageTsx).toMatch(/Seam allowance/)
  })

  it('reference chooser lives in left stack (not hero above nest)', () => {
    expect(pageTsx).toMatch(/ThrowFormThumb|FillStyleThumb/)
    expect(pageTsx).toMatch(/reference/)
    expect(pageTsx).toMatch(/sidebar left[\s\S]*?reference[\s\S]*?size/)
    expect(pageTsx).not.toMatch(/canvas-wrap[\s\S]*?ThrowFormThumb/)
  })

  it('throw fill Reference + FillStyleThumb are side/thickness loft views (not face-on)', () => {
    expect(referenceSvg).toMatch(/Throw reference thickness view/)
    expect(referenceSvg).toMatch(/side \/ loft/)
    expect(referenceSvg).toMatch(/function throwLoftRatio/)
    expect(referenceSvg).toMatch(/function knifeEdgeSidePath/)
    expect(referenceSvg).toMatch(/export function FillStyleThumb[\s\S]*?knifeEdgeSidePath/)
    expect(referenceSvg).toMatch(/export function ThrowReference[\s\S]*?knifeEdgeSidePath/)
    // Dog-ear 12-gon stays on nest fabric plates, not the loft reference
    expect(referenceSvg).not.toMatch(/dogEarPolygonPointsAttr|dogEarPanelPolygon/)
    const nestLib = readFileSync(resolve(srcDir, 'lib/nestPreview.ts'), 'utf8')
    expect(nestLib).toMatch(/dogEarPanelPolygon/)
  })

  it('keeps Sailrite brand tokens (SR Blue / Alert Red)', () => {
    expect(webStyles).toMatch(/--color-primary:\s*#24285e/)
    expect(webStyles).toMatch(/--color-error:\s*#e75053/)
    expect(tokensCss).toMatch(/--sr-action:\s*#24285e/)
    expect(tokensCss).toMatch(/--sr-danger:\s*#e75053/)
  })

  it('nest captions are HTML outside SVG (no viewBox-scaled text labels)', () => {
    expect(nestPreviewSvg).not.toMatch(/pillow-nest-frame/)
    expect(nestPreviewSvg).toMatch(/pillow-nest-stage/)
    expect(nestPreviewSvg).toMatch(/pillow-nest-captions/)
    expect(nestPreviewSvg).toMatch(/text-xs/)
    expect(nestPreviewSvg).toMatch(/text-sm/)
    expect(nestPreviewSvg).toMatch(/text-base-content/)
    expect(nestPreviewSvg).not.toMatch(/text-base-content\/7/)
    expect(nestPreviewSvg).not.toMatch(/<text[\s\S]*bolt/i)
    expect(nestPreviewSvg).not.toMatch(/fontSize=\{Math\.max/)
  })

  it('captions are card-body siblings of stage (not trapped in flex-grow figure)', () => {
    expect(pageTsx).toMatch(/pillow-nest-card/)
    expect(pageTsx).toMatch(
      /card bg-base-100 border border-base-300 shadow-none pillow-nest-card[\s\S]*?nest preview[\s\S]*?NestPreviewSvg/,
    )
    // Fragment: stage then captions as siblings — no wrapping flex:1 frame
    expect(nestPreviewSvg).toMatch(
      /pillow-nest-stage[\s\S]*?<\/svg>[\s\S]*?<\/div>[\s\S]*?pillow-nest-captions/,
    )
    expect(nestPreviewSvg).not.toMatch(/<figure/)
    expect(pageCss).toMatch(/\.pillow-nest-card/)
    expect(pageCss).toMatch(
      /\.pillow-nest-captions\s*\{[\s\S]*?flex:\s*0\s+0\s+auto/,
    )
    expect(pageCss).toMatch(
      /\.pillow-nest-captions\s*\{[\s\S]*?flex-shrink:\s*0/,
    )
    expect(pageCss).not.toMatch(/pillow-nest-frame/)
  })

  it('mobile Results keeps nest card + captions content-sized with gap-3 before Yardage', () => {
    expect(pageCss).toMatch(/\.layout\.mobile-results/)
    expect(pageCss).toMatch(
      /\.layout\.mobile-results \.canvas-wrap[\s\S]*?flex:\s*0\s+0\s+auto/,
    )
    expect(pageCss).toMatch(
      /\.layout\.mobile-results \.pillow-nest-card[\s\S]*?flex:\s*0\s+0\s+auto/,
    )
    expect(pageCss).toMatch(
      /\.layout\.mobile-results \.pillow-nest-card > \.card-body[\s\S]*?flex:\s*0\s+0\s+auto/,
    )
    expect(pageCss).toMatch(
      /\.layout\.mobile-results \.pillow-nest-stage[\s\S]*?flex:\s*0\s+0\s+auto/,
    )
    expect(pageCss).toMatch(
      /\.layout\.mobile-results \.pillow-nest-captions[\s\S]*?overflow:\s*visible/,
    )
    expect(pageCss).toMatch(
      /\.layout\.mobile-results \.pillow-nest-card[\s\S]*?min-height:\s*auto/,
    )
    expect(pageCss).toMatch(/\.layout\.mobile-results\s*\{[\s\S]*?gap:\s*0\.75rem/)
    expect(pageCss).not.toMatch(
      /\.layout\.mobile-results \.pillow-nest-captions[\s\S]*?overflow:\s*hidden/,
    )
  })

  it('left stack order: reference → size → pattern (secondary chooser) with scroll padding', () => {
    const refAt = pageTsx.indexOf('\n                reference\n')
    const sizeAt = pageTsx.indexOf('\n                size\n')
    const patternAt = pageTsx.indexOf('\n                pattern & rotation\n')
    expect(refAt).toBeGreaterThan(0)
    expect(sizeAt).toBeGreaterThan(refAt)
    expect(patternAt).toBeGreaterThan(sizeAt)
    expect(pageCss).toMatch(/scroll-padding-bottom/)
    expect(pageCss).toMatch(/padding-bottom:\s*2rem/)
  })
})
