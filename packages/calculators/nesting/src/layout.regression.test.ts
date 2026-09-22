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
/** Page + shell chrome CSS (header rules live in shell tokens). */
const chromeCss = `${tokensCss}\n${pageCss}`
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
    expect(pageCss).toMatch(/button\.add-panel-auto-nest\s*\{[^}]*margin-top:\s*1\.25rem/)
    expect(pageTsx).toMatch(/add-panel-auto-nest/)
  })

  it('stacks mobile header status onto its own row so chrome does not overlap', () => {
    const mobile = tokensCss.match(/@media \(max-width: 800px\)\s*\{[\s\S]*?\n\}(?=\s*\/\*|\s*@media|\s*$)/)
    expect(mobile, 'missing 800px media query in shell tokens').toBeTruthy()
    const block = mobile![0]
    expect(block).toMatch(/\.app-header-bar\s*\{[^}]*flex-wrap:\s*wrap/)
    expect(block).toMatch(/\.app-header-status\s*\{[^}]*flex:\s*1\s+1\s+100%/)
    expect(block).toMatch(/\.calc-switch\s*\{\s*display:\s*none/)
    expect(block).toMatch(/\.current-tool\s*\{[^}]*display:\s*inline-flex/)
  })

  it('header + calc nav classNames used in TSX have CSS rules', () => {
    const classes = new Set<string>()
    for (const src of [chromeTsx]) {
      for (const m of src.matchAll(/className="([^"]+)"/g)) {
        for (const c of m[1].split(/\s+/)) classes.add(c)
      }
      for (const m of src.matchAll(/className=\{`([^`]+)`\}/g)) {
        for (const c of m[1].split(/\s+/)) {
          if (!c.includes('${')) classes.add(c)
        }
      }
    }
    const required = [
      'app-header',
      'app-header-bar',
      'app-header-identity',
      'app-header-status',
      'brand-logo',
      'current-tool',
      'calc-switch',
      'calc-more-mobile',
      'export-pdf',
      'add-panel-auto-nest',
    ]
    for (const c of required) {
      expect(classes.has(c), `tsx missing class ${c}`).toBe(true)
      expect(chromeCss).toMatch(new RegExp(`\\.${c.replace(/-/g, '\\-')}\\b`))
    }
  })

  it('disabled primary/Auto-Nest uses opaque muted colors (not opacity wash)', () => {
    expect(pageCss).toMatch(/button\.primary:disabled[\s\S]*?color:\s*#333333/)
    expect(pageCss).not.toMatch(/button:disabled\s*\{\s*opacity:\s*0\.5/)
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
    expect(calcNav).toMatch(/calc-more-live/)
    expect(tokensCss).toMatch(/\.calc-more-soon\s*\{[^}]*background:\s*#fff/)
    expect(tokensCss).toMatch(/\.calc-more-soon\s*\{[^}]*color:\s*#111/)
    expect(tokensCss).toMatch(/\.calc-more-soon\s*\{[^}]*font-weight:\s*700/)
    expect(tokensCss).toMatch(/\.calc-more-live\s*\{[^}]*background:\s*var\(--sr-action\)/)
  })
})
