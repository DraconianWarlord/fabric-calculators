import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))
const pageTsx = readFileSync(resolve(srcDir, 'Page.tsx'), 'utf8')
const shellSrc = resolve(srcDir, '../../../shell/src')
const headerTsx = readFileSync(resolve(shellSrc, 'Header.tsx'), 'utf8')
const tokensCss = readFileSync(resolve(shellSrc, 'tokens.css'), 'utf8')
const webStyles = readFileSync(
  resolve(srcDir, '../../../../apps/web/src/styles.css'),
  'utf8',
)

describe('pillows layout regressions', () => {
  it('type cards are ≥44px Daisy ghost buttons', () => {
    expect(pageTsx).toMatch(/btn btn-ghost h-auto min-h-11 w-full flex-col/)
  })

  it('unit toggles are ≥44px and neutral when selected (not dual primary)', () => {
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 \$\{unit === 'in' \? 'btn-neutral'/)
    expect(pageTsx).toMatch(/btn join-item btn-sm min-h-11 \$\{unit === 'mm' \? 'btn-neutral'/)
    expect(pageTsx).not.toMatch(/unit === 'in' \? 'btn-primary'/)
    expect(pageTsx).not.toMatch(/unit === 'mm' \? 'btn-primary'/)
  })

  it('pattern/fit radio rows are ≥44px hit targets', () => {
    expect(pageTsx).toMatch(/label cursor-pointer justify-start gap-2 min-h-11/)
    expect(pageTsx).not.toMatch(/label cursor-pointer justify-start gap-2 py-1/)
  })

  it('yardage shop CTA is sole solid primary and ≥44px; header Shop is outline', () => {
    expect(pageTsx).toMatch(/btn btn-primary mt-2 min-h-11/)
    expect(pageTsx.match(/btn-primary/g)?.length).toBe(1)
    expect(headerTsx).toMatch(/Shop Sailrite/)
    expect(headerTsx).toMatch(/btn btn-outline/)
  })

  it('keeps Sailrite brand tokens (SR Blue / Alert Red)', () => {
    expect(webStyles).toMatch(/--color-primary:\s*#24285e/)
    expect(webStyles).toMatch(/--color-error:\s*#e75053/)
    expect(tokensCss).toMatch(/--sr-action:\s*#24285e/)
    expect(tokensCss).toMatch(/--sr-danger:\s*#e75053/)
  })
})
