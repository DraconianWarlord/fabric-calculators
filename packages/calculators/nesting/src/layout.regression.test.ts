import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))
const pageTsx = readFileSync(resolve(srcDir, 'Page.tsx'), 'utf8')
const pageCss = readFileSync(resolve(srcDir, 'Page.css'), 'utf8')
const dimPreviewsTsx = readFileSync(resolve(srcDir, 'dimPreviews.tsx'), 'utf8')
const dimFrameTsx = readFileSync(resolve(srcDir, 'DimPreviewFrame.tsx'), 'utf8')
const dimSources = `${pageTsx}\n${dimPreviewsTsx}\n${dimFrameTsx}`
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
    expect(headerTsx).toMatch(/Shop Sailrite/)
    expect(headerTsx).toMatch(/btn btn-outline/)
    expect(calcNav).toMatch(/badge-primary/)
    expect(calcNav).toMatch(/Coming soon/)
    expect(calcNav).toMatch(/min-h-11/)
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


  it('collapse headers are full-width 44px hit targets with btn-square chevrons', () => {
    expect(pageTsx).toMatch(/collapse-header[^"]*min-h-11/)
    expect(pageTsx).toMatch(/collapse-chevron[^"]*btn btn-ghost btn-square/)
    expect(pageTsx).toMatch(/collapse-chevron[\s\S]*?h-4 w-4/)
    expect(pageTsx).toMatch(/collapse-chevron[\s\S]*?<svg/)
    expect(pageTsx).not.toMatch(/collapse-chevron[^>]*>[\s]*[\u25BE\u25B8]/)
  })

  it('panels list rows are single horizontal flex rows (44px, no stacked swatch)', () => {
    expect(pageCss).toMatch(/\.list-item\s*\{[^}]*display:\s*flex/)
    expect(pageCss).toMatch(/\.list-item\s*\{[^}]*align-items:\s*center/)
    expect(pageCss).toMatch(/\.list-item\s*\{[^}]*min-height:\s*2\.75rem/)
    expect(pageCss).toMatch(/flex-direction:\s*row/)
    expect(pageTsx).toMatch(/className=\{`list-item/)
    expect(pageTsx).not.toMatch(/list-item btn btn-ghost/)
    expect(pageTsx).not.toMatch(/className="list-main"/)
  })

  it('Add to bolt is primary; Auto-Nest is outline (not both solid primary)', () => {
    expect(pageTsx).toMatch(/btn btn-primary w-full[\s\S]*?Add to bolt/)
    expect(pageTsx).toMatch(/btn btn-outline w-full auto-nest/)
    expect(pageTsx).not.toMatch(/btn btn-primary w-full auto-nest/)
    expect(pageCss).toMatch(/\.add-panel-auto-nest\s*\{[^}]*margin-top:\s*1\.25rem/)
  })

  it('Auto-Nest shows Daisy spinner while busy (after paint yield)', () => {
    expect(pageTsx).toMatch(/autoNestBusy/)
    expect(pageTsx).toMatch(/autoNestShowSpinner/)
    expect(pageTsx).toMatch(/loading loading-spinner loading-sm/)
    expect(pageTsx).toMatch(/aria-busy=\{autoNestBusy\}/)
    expect(pageTsx).toMatch(/disabled=\{panels\.length === 0 \|\| autoNestBusy\}/)
    expect(pageTsx).toMatch(/btn btn-outline w-full auto-nest/)
  })

  it('Selected Rotate/Duplicate/Flip use Daisy ghost buttons (≥44px)', () => {
    expect(pageTsx).toMatch(/btn btn-sm btn-ghost min-h-11[\s\S]*?Rotate 90/)
    expect(pageTsx).toMatch(/btn btn-sm btn-ghost min-h-11[\s\S]*?Duplicate/)
    expect(pageTsx).toMatch(/btn btn-sm btn-ghost min-h-11[\s\S]*?Flip H/)
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

  it('shape dim previews use diagram standard B (nested cut/finished, no CAD ticks)', () => {
    expect(dimPreviewsTsx).toMatch(/cutShapeSvgProps/)
    expect(dimPreviewsTsx).toMatch(/finishedShapeSvgProps/)
    expect(dimFrameTsx).toMatch(/DIAGRAM_SR_BLUE/)
    // Key is HTML below the stage — not CutFinishedLegend inside the drawing svg
    expect(dimFrameTsx).toMatch(/Cut \(solid\)/)
    expect(dimFrameTsx).toMatch(/Finished \(dashed\)/)
    expect(dimFrameTsx).toMatch(/dim-preview-key/)
    expect(dimPreviewsTsx).not.toMatch(/CutFinishedLegend/)
    expect(pageTsx).not.toMatch(/CutFinishedLegend/)
    // Shared 320×240 viewBox for all four shapes
    expect(dimFrameTsx).toMatch(/DIM_PREVIEW_VIEWBOX\s*=\s*'0 0 320 240'/)
    expect(dimPreviewsTsx).toMatch(/DIM_PREVIEW_VIEWBOX/)
    expect(dimSources).not.toMatch(/viewBox="0 0 260 200"/)
    expect(dimSources).not.toMatch(/viewBox="0 0 320 220"/)
    expect(dimSources).not.toMatch(/viewBox="0 0 340 240"/)
    expect(dimSources).not.toMatch(/viewBox="0 0 280 200"/)
    // Stage sizing: max-width 20rem / aspect-ratio 4:3
    expect(pageCss).toMatch(/\.dim-preview-frame[^{]*\{[^}]*max-width:\s*20rem/)
    expect(pageCss).toMatch(/\.dim-preview-stage[^{]*\{[^}]*aspect-ratio:\s*4\s*\/\s*3/)
    expect(pageCss).toMatch(/\.dim-preview-frame[^{]*\{[^}]*gap:\s*0\.75rem/)
    // no mono black shape stroke / exterior tick-dimension CAD style on dim figures
    expect(dimSources).not.toMatch(/stroke="#111"/)
    expect(dimSources).not.toMatch(/same tick style as trapezoid/)
    expect(dimSources).not.toMatch(/trap-style ticks/)
    // rect preview present via shared frame
    expect(dimPreviewsTsx).toMatch(/rect-dims-figure/)
    expect(pageTsx).toMatch(/RectDimPreview/)
    expect(pageCss).toMatch(/\.rect-dims-figure/)
  })

  it('diagram tokens live in @sailrite/calc-shell', () => {
    const diagrams = readFileSync(resolve(shellSrc, 'diagrams/cutFinished.ts'), 'utf8')
    expect(diagrams).toMatch(/DIAGRAM_SR_BLUE\s*=\s*'#24285e'/)
    expect(diagrams).toMatch(/DIAGRAM_CUT_FILL\s*=\s*'#e8eaf6'/)
    expect(diagrams).toMatch(/DIAGRAM_FINISHED_DASH\s*=\s*'4 3'/)
    expect(diagrams).not.toMatch(/#e75053/)
  })


  it('split warning + action hint alerts stack / pad so CTA does not overlay or clip text', () => {
    // Warning alerts with Split CTA must use stacked layout (Daisy alert grid overlays otherwise)
    expect(pageTsx).toMatch(/SplitSuggestionAlert/)
    expect(pageTsx).toMatch(/ActionHintBanner/)
    const alerts = readFileSync(resolve(srcDir, 'alerts.tsx'), 'utf8')
    expect(alerts).toMatch(/alert-stack/)
    expect(alerts).toMatch(/flex flex-col items-stretch/)
    expect(alerts).toMatch(/w-full min-w-0 whitespace-normal break-words/)
    expect(alerts).toMatch(/btn btn-primary w-full shrink-0/)
    // Error action-hint banner: padding + min-w-0 so first chars are not clipped
    expect(alerts).toMatch(/alert alert-error[^"]*px-4/)
    expect(alerts).toMatch(/min-w-0 flex-1[^"]*break-words/)
    expect(alerts).toMatch(/Dismiss/)
    expect(alerts).toMatch(/shrink-0/)
    expect(pageCss).toMatch(/\.alert\s*\{[^}]*overflow:\s*visible/)
    expect(pageCss).toMatch(/\.alert-stack\s*\{[^}]*flex-direction:\s*column/)
  })

})
