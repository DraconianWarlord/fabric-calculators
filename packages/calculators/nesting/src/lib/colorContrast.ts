/**
 * High-contrast ink for overlays drawn on top of a panel fill.
 * Uses simple perceived luminance (same threshold as PDF nest labels):
 * light fill → near-black; dark fill → white. Keeps dashed SA readable
 * on Sailrite palette fills (navy/teal/coral/amber/etc.).
 */
export function contrastingInkOnFill(fillHex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(fillHex.trim())
  if (!m) return '#111111'
  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.55 ? '#111111' : '#ffffff'
}
