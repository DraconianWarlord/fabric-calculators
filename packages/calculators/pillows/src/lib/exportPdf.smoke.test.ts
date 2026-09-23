/**
 * @vitest-environment jsdom
 *
 * Exercises the real exportPillowsPdf path (jsPDF + autotable).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { exportPillowsPdf } from './exportPdf'
import type { NestPreviewModel } from './nestPreview'

function emptyNest(fabricWidthIn = 54): NestPreviewModel {
  return { fabricWidthIn, lengthInches: 0, panels: [], leftoverAcrossIn: fabricWidthIn }
}

function throwNest(): NestPreviewModel {
  return {
    fabricWidthIn: 54,
    lengthInches: 36,
    leftoverAcrossIn: 18,
    panels: [
      { kind: 'throw-panel', x: 0, y: 0, w: 18, h: 18, label: 'P1' },
      { kind: 'throw-panel', x: 18, y: 0, w: 18, h: 18, label: 'P2' },
    ],
  }
}

describe('exportPillowsPdf smoke', () => {
  beforeEach(() => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    vi.spyOn(window, 'open').mockImplementation(() => {
      return { closed: false } as Window
    })
    if (!URL.createObjectURL) {
      Object.defineProperty(URL, 'createObjectURL', {
        value: () => 'blob:test',
        configurable: true,
      })
    }
    if (!URL.revokeObjectURL) {
      Object.defineProperty(URL, 'revokeObjectURL', { value: () => {}, configurable: true })
    }
  })

  it('returns a .pdf filename for an empty throw nest', () => {
    const name = exportPillowsPdf({
      pillowType: 'throw',
      fabricWidthIn: 54,
      seamAllowanceIn: 0.5,
      unit: 'in',
      exact: 0,
      order: 0,
      quantity: 1,
      nest: emptyNest(),
      cutList: [],
      styleLabel: 'standard',
    })
    expect(name).toMatch(/\.pdf$/)
  })

  it('builds a multi-page PDF for throw panels', () => {
    const name = exportPillowsPdf({
      pillowType: 'throw',
      fabricWidthIn: 54,
      seamAllowanceIn: 0.5,
      unit: 'in',
      exact: 1,
      order: 1,
      quantity: 1,
      nest: throwNest(),
      cutList: [{ label: 'Front/back panels', widthIn: 18, lengthIn: 18, qty: 2 }],
      styleLabel: 'standard',
      formWidthIn: 18,
      formLengthIn: 18,
      dogEarTrim: false,
    })
    expect(name).toMatch(/sailrite-pillows-.*\.pdf/)
  })

  it('builds a PDF for bolster without throwing', () => {
    expect(() =>
      exportPillowsPdf({
        pillowType: 'bolster',
        fabricWidthIn: 54,
        seamAllowanceIn: 0,
        unit: 'in',
        exact: 1.2,
        order: 2,
        quantity: 1,
        nest: {
          fabricWidthIn: 54,
          lengthInches: 42,
          leftoverAcrossIn: 4,
          panels: [
            { kind: 'barrel', x: 0, y: 0, w: 20.5, h: 25.56, label: 'Barrel' },
            { kind: 'end', x: 22, y: 0, w: 8.5, h: 8.5, label: 'End' },
            { kind: 'end', x: 32, y: 0, w: 8.5, h: 8.5, label: 'End' },
          ],
        },
        cutList: [
          { label: 'Barrel', widthIn: 20.5, lengthIn: 25.56, qty: 1 },
          { label: 'Ends', widthIn: 8.5, lengthIn: 8.5, qty: 2 },
        ],
        styleLabel: 'regular',
        formWidthIn: 8,
        formLengthIn: 20,
      }),
    ).not.toThrow()
  })
})
