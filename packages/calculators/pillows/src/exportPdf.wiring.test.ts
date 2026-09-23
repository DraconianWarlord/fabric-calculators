import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const srcDir = dirname(fileURLToPath(import.meta.url))
const page = readFileSync(resolve(srcDir, 'Page.tsx'), 'utf8')

describe('Export PDF wiring (pillows)', () => {
  it('statically imports exportPillowsPdf (no post-click dynamic import)', () => {
    expect(page).toMatch(/import\s*\{\s*exportPillowsPdf\s*\}\s*from\s*'\.\/lib\/exportPdf'/)
    expect(page).not.toMatch(/import\(\s*['"]\.\/lib\/exportPdf['"]\s*\)/)
  })

  it('surfaces export failures to the user via setActionHint', () => {
    expect(page).toMatch(/Export PDF failed/)
    expect(page).toMatch(/setActionHint/)
  })
})
