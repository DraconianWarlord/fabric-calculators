import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))
const pageTsx = readFileSync(resolve(srcDir, 'Page.tsx'), 'utf8')
const pageCss = readFileSync(resolve(srcDir, 'Page.css'), 'utf8')
const shellSrc = resolve(srcDir, '../../../shell/src')
const calcNav = readFileSync(resolve(shellSrc, 'CalculatorNav.tsx'), 'utf8')
const tokensCss = readFileSync(resolve(shellSrc, 'tokens.css'), 'utf8')
const headerTsx = readFileSync(resolve(shellSrc, 'Header.tsx'), 'utf8')
const webStyles = readFileSync(
  resolve(srcDir, '../../../../apps/web/src/styles.css'),
  'utf8',
)
const chromeTsx = `${headerTsx}\n${calcNav}\n${pageTsx}`

describe('layout regressions', () => {
  it('does not render the estimate disclaimer bar', () => {
    expect(pageTsx).not.toMatch(/className="disclaimer"/)
    expect(pageTsx).not.toMatch(/Estimate only\. Double-check/)
  })

  it('does not render the shop strip bar', () => {
    expect(pageTsx).not.toMatch(/className="shop-strip"/)
    expect(pageTsx).not.toMatch(/Ready to order about/)
    expect(pageTsx).not.toMatch(/Foam & cushion supplies/)
  })

  it('keeps Auto-Nest spaced below Add to bolt (beats button.auto-nest reset)', () => {
    expect(pageCss).toMatch(/\.add-panel-auto-nest\s*\{[^}]*margin-top:\s*1\.25rem/)
    expect(pageTsx).toMatch(/add-panel-auto-nest/)
  })

  it('stacks mobile header status onto its own row so chrome does not overlap', () => {
    // Daisy/Tailwind header: status row goes full-width under identity on narrow viewports
    expect(headerTsx).toMatch(/navbar/)
    expect(headerTsx).toMatch(/bg-neutral/)
    expect(headerTsx).toMatch(/w-full/)
    expect(headerTsx).toMatch(/min-\[801px\]:w-auto/)
    expect(headerTsx).toMatch(/max-\[800px\]:inline-flex/)
    expect(calcNav).toMatch(/min-\[801px\]:flex/)
    expect(calcNav).toMatch(/min-\[801px\]:hidden/)
  })

  it('header + calc nav use DaisyUI shell patterns; page keeps export + auto-nest hooks', () => {
    expect(headerTsx).toMatch(/navbar/)
    expect(headerTsx).toMatch(/btn-primary/)
    expect(calcNav).toMatch(/badge-primary/)
    expect(calcNav).toMatch(/Coming soon/)
    expect(pageTsx).toMatch(/export-pdf/)
    expect(pageTsx).toMatch(/add-panel-auto-nest/)
    expect(pageTsx).toMatch(/btn btn-primary/)
    expect(webStyles).toMatch(/name:\s*"sailrite"/)
    expect(webStyles).toMatch(/--color-primary:\s*#24285e/)
    expect(webStyles).toMatch(/--color-error:\s*#e75053/)
    expect(tokensCss).toMatch(/--sr-action:\s*#24285e/)
    expect(tokensCss).toMatch(/--sr-danger:\s*#e75053/)
  })

  it('disabled primary/Auto-Nest uses Daisy btn (no opacity wash on generic button:disabled)', () => {
    expect(pageTsx).toMatch(/btn btn-primary/)
    expect(pageCss).not.toMatch(/button:disabled\s*\{\s*opacity:\s*0\.5/)
    // Daisy handles disabled btn muted look; avoid custom opacity wash
    expect(chromeTsx).not.toMatch(/opacity-50.*disabled|disabled.*opacity-50/)
  })

  it('mobile bolt canvas kills accidental horizontal scroll', () => {
    const mobile = pageCss.match(/@media \(max-width: 800px\)\s*\{[\s\S]*?\n\}(?=\s*\/\*|\s*@media|\s*$)/)
    expect(mobile, 'missing 800px media query').toBeTruthy()
    expect(mobile![0]).toMatch(/\.canvas-wrap\s*\{[^}]*overflow-x:\s*hidden/)
  })

  it('center nav is current-only + More; status chips are high-contrast', () => {
    expect(calcNav).not.toMatch(/PRIMARY_PILLS_MQ/)
    expect(calcNav).not.toMatch(/PRIMARY_SOON|MORE_ONLY/)
    expect(calcNav).toMatch(/catalog/)
    expect(calcNav).not.toMatch(/calc-more-item--current/)
    // Avoid a Current badge adjacent to Coming soon (aria-current is fine)
    expect(calcNav).not.toMatch(/>Current</)
    expect(calcNav).toMatch(/status === 'live'/)
    expect(calcNav).toMatch(/target="_blank"/)
    expect(calcNav).toMatch(/badge-primary/)
    expect(calcNav).toMatch(/Coming soon/)
    expect(calcNav).toMatch(/>Open</)
    expect(calcNav).toMatch(/>Here</)
  })
})
