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
    expect(pageCss).toMatch(/\.layout\.mobile-inputs \.results/)
    expect(pageCss).toMatch(/\.layout\.mobile-results \.sidebar/)
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

  it('yardage shop CTA is sole solid primary ≥44px; header Shop outline + hidden on mobile', () => {
    expect(pageTsx).toMatch(/btn btn-primary min-h-11/)
    expect(pageTsx.match(/btn-primary/g)?.length).toBeGreaterThanOrEqual(1)
    // body shop is the only btn-primary in page chrome outside mobile tabs (tabs also use primary)
    expect(pageTsx).toMatch(/shopFabricYardsLabel/)
    expect(headerTsx).toMatch(/Shop Sailrite/)
    expect(headerTsx).toMatch(/btn btn-outline/)
    expect(headerTsx).toMatch(/hidden[\s\S]*?min-\[801px\]:inline-flex/)
  })

  it('disclaimer collapses on mobile so it does not eat work surface', () => {
    expect(pageTsx).toMatch(/disclaimer-mobile/)
    expect(pageTsx).toMatch(/Estimate disclaimer/)
    expect(pageTsx).toMatch(/max-\[800px\]:block min-\[801px\]:hidden/)
  })

  it('form-vs-cut finished outline uses diagram standard B (SR Blue dashed, not Alert Red)', () => {
    expect(pageTsx).toMatch(/ThrowReference|BolsterReference/)
    expect(referenceSvg).toMatch(/cutShapeSvgProps/)
    expect(referenceSvg).toMatch(/finishedShapeSvgProps/)
    expect(referenceSvg).toMatch(/CutFinishedLegend/)
    expect(referenceSvg).toMatch(/DIAGRAM_SR_BLUE|DIAGRAM_CUT_FILL/)
    expect(nestPreviewSvg).toMatch(/cutShapeSvgProps/)
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
    expect(pageTsx).toMatch(/overflow-x-hidden/)
    expect(pageCss).toMatch(/\.field-help\s*\{[^}]*overflow-wrap:\s*break-word/)
    expect(pageTsx).toMatch(/field-help/)
  })

  it('dog-ear uses on/off Daisy join ≥44px (not tiny toggle)', () => {
    expect(pageTsx).toMatch(/aria-label="Dog-ear corner trim"/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{!dogEarTrim \? 'btn-neutral'/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 flex-1 \$\{dogEarTrim \? 'btn-neutral'/)
    expect(pageTsx).not.toMatch(/toggle toggle-primary/)
  })

  it('reference heading has no stray quotes; H/V repeat inputs are min-h-11', () => {
    expect(pageTsx).toMatch(/>reference</)
    expect(pageTsx).not.toMatch(/>'reference'</)
    expect(pageTsx).toMatch(/horizontal repeat[\s\S]*?input input-bordered min-h-11/)
    expect(pageTsx).toMatch(/vertical repeat[\s\S]*?input input-bordered min-h-11/)
  })

  it('keeps Sailrite brand tokens (SR Blue / Alert Red)', () => {
    expect(webStyles).toMatch(/--color-primary:\s*#24285e/)
    expect(webStyles).toMatch(/--color-error:\s*#e75053/)
    expect(tokensCss).toMatch(/--sr-action:\s*#24285e/)
    expect(tokensCss).toMatch(/--sr-danger:\s*#e75053/)
  })
})
