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

  it('type cards are ≥44px Daisy ghost buttons', () => {
    expect(pageTsx).toMatch(/btn btn-ghost h-auto min-h-11 w-full flex-col/)
  })

  it('unit toggles are Daisy join ≥44px and neutral when selected (not dual primary)', () => {
    expect(pageTsx).toMatch(/className="join(?: w-full)?"/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{unit === 'in' \? 'btn-neutral'/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{unit === 'mm' \? 'btn-neutral'/)
    expect(pageTsx).not.toMatch(/unit === 'in' \? 'btn-primary'/)
    expect(pageTsx).not.toMatch(/unit === 'mm' \? 'btn-primary'/)
  })

  it('pattern direction uses segmented join/btn ≥44px (not radio rows)', () => {
    expect(pageTsx).toMatch(/aria-label="Pattern direction"/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{pattern === val \? 'btn-neutral'/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{bolsterPattern === val \? 'btn-neutral'/)
    expect(pageTsx).not.toMatch(/name="pattern"/)
    expect(pageTsx).not.toMatch(/name="bolster-pattern"/)
    expect(pageTsx).not.toMatch(/radio radio-sm radio-primary/)
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

  it('compact reference strip lives in left stack (not hero above nest)', () => {
    expect(pageTsx).toMatch(/ThrowFormThumb|FillStyleThumb/)
    expect(referenceSvg).toMatch(/dogEarPanelPolygon|dogEarPolygonPointsAttr/)
    expect(pageTsx).toMatch(/reference/)
  })

  it('keeps Sailrite brand tokens (SR Blue / Alert Red)', () => {
    expect(webStyles).toMatch(/--color-primary:\s*#24285e/)
    expect(webStyles).toMatch(/--color-error:\s*#e75053/)
    expect(tokensCss).toMatch(/--sr-action:\s*#24285e/)
    expect(tokensCss).toMatch(/--sr-danger:\s*#e75053/)
  })

  it('nest captions are HTML outside SVG (no viewBox-scaled text labels)', () => {
    expect(nestPreviewSvg).toMatch(/pillow-nest-frame/)
    expect(nestPreviewSvg).toMatch(/pillow-nest-captions/)
    expect(nestPreviewSvg).toMatch(/text-xs/)
    expect(nestPreviewSvg).not.toMatch(/<text[\s\S]*bolt/i)
    expect(nestPreviewSvg).not.toMatch(/fontSize=\{Math\.max/)
  })

  it('captions live inside nest Daisy card under SVG (not clip-prone canvas/sidebar sibling)', () => {
    expect(pageTsx).toMatch(/pillow-nest-card/)
    expect(pageTsx).toMatch(
      /card bg-base-100 border border-base-300 shadow-none pillow-nest-card[\s\S]*?nest preview[\s\S]*?NestPreviewSvg/,
    )
    expect(nestPreviewSvg).toMatch(
      /pillow-nest-stage[\s\S]*?<\/svg>[\s\S]*?pillow-nest-captions/,
    )
    expect(pageCss).toMatch(/\.pillow-nest-card/)
    expect(pageCss).toMatch(
      /\.pillow-nest-captions\s*\{[\s\S]*?display:\s*block/,
    )
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
      /\.layout\.mobile-results \.pillow-nest-captions[\s\S]*?overflow:\s*visible/,
    )
    expect(pageCss).toMatch(/\.layout\.mobile-results\s*\{[\s\S]*?gap:\s*0\.75rem/)
    expect(pageCss).not.toMatch(
      /\.layout\.mobile-results \.pillow-nest-captions[\s\S]*?overflow:\s*hidden/,
    )
  })

  it('left stack reference is after pattern (secondary) with scroll padding', () => {
    const refAt = pageTsx.lastIndexOf('reference')
    const patternAt = pageTsx.lastIndexOf('\n                pattern\n')
    expect(patternAt).toBeGreaterThan(0)
    expect(refAt).toBeGreaterThan(patternAt)
    expect(pageCss).toMatch(/scroll-padding-bottom/)
    expect(pageCss).toMatch(/padding-bottom:\s*2rem/)
  })
})
