/**
 * True inward polygon offset (convex), shared practice with Nesting irregular SA.
 * Used for throw dog-ear 12-gon seam-allowance dashed overlays.
 */

import type { Point } from './dogEar'
import { dogEarPanelPolygon } from './dogEar'

function signedPolyArea(pts: Point[]): number {
  let a = 0
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    const q = pts[(i + 1) % pts.length]
    a += p.x * q.y - q.x * p.y
  }
  return a / 2
}

function lineLineIntersect(
  p1: Point,
  d1: Point,
  p2: Point,
  d2: Point,
  eps = 1e-12,
): Point | null {
  const cross = d1.x * d2.y - d1.y * d2.x
  if (Math.abs(cross) < eps) return null
  const t = ((p2.x - p1.x) * d2.y - (p2.y - p1.y) * d2.x) / cross
  return { x: p1.x + t * d1.x, y: p1.y + t * d1.y }
}

/**
 * True inward polygon offset by `dist` for convex polygons.
 * Returns null when dist ≤ 0, the poly is degenerate, or SA collapses it.
 */
export function insetPolygon(points: Point[], dist: number): Point[] | null {
  if (!(dist > 0) || points.length < 3) return null
  const n = points.length
  const area = signedPolyArea(points)
  if (!(Math.abs(area) > 1e-10)) return null
  const ccw = area > 0

  type OffsetEdge = { p: Point; d: Point }
  const edges: OffsetEdge[] = []
  for (let i = 0; i < n; i++) {
    const a = points[i]
    const b = points[(i + 1) % n]
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    if (!(len > 1e-12)) return null
    const ux = dx / len
    const uy = dy / len
    const nx = ccw ? -uy : uy
    const ny = ccw ? ux : -ux
    edges.push({
      p: { x: a.x + nx * dist, y: a.y + ny * dist },
      d: { x: ux, y: uy },
    })
  }

  const out: Point[] = []
  for (let i = 0; i < n; i++) {
    const prev = edges[(i - 1 + n) % n]
    const cur = edges[i]
    const hit = lineLineIntersect(prev.p, prev.d, cur.p, cur.d)
    if (!hit || !Number.isFinite(hit.x) || !Number.isFinite(hit.y)) return null
    out.push(hit)
  }

  if (out.length < 3) return null
  const newArea = signedPolyArea(out)
  if (!(Math.abs(newArea) > 1e-10)) return null
  if (Math.sign(newArea) !== Math.sign(area)) return null
  if (Math.abs(newArea) >= Math.abs(area) - 1e-12) return null

  for (let i = 0; i < n; i++) {
    const a = out[i]
    const b = out[(i + 1) % n]
    const ndx = b.x - a.x
    const ndy = b.y - a.y
    const nlen = Math.hypot(ndx, ndy)
    if (!(nlen > 1e-9)) return null
    if (ndx * edges[i].d.x + ndy * edges[i].d.y <= 0) return null
  }

  const cleaned: Point[] = []
  for (let i = 0; i < out.length; i++) {
    const a = out[i]
    const b = out[(i + 1) % out.length]
    if (Math.hypot(b.x - a.x, b.y - a.y) > 1e-9) cleaned.push(a)
  }
  if (cleaned.length < 3) return null
  if (!(Math.abs(signedPolyArea(cleaned)) > 1e-10)) return null
  return cleaned
}

export type SeamAllowanceOutline =
  | { kind: 'rect'; x: number; y: number; w: number; h: number }
  | { kind: 'poly'; points: Point[] }

/**
 * Finished / SA dashed outline for a throw cut panel.
 * Dog-ear on → true inset of the cut 12-gon; off → AABB inset by SA.
 */
export function throwSeamAllowanceOutline(
  cutW: number,
  cutL: number,
  seamAllowanceIn: number,
  dogEar: boolean,
): SeamAllowanceOutline | null {
  const sa = Math.max(0, seamAllowanceIn)
  if (!(sa > 0)) return null
  if (dogEar) {
    const inset = insetPolygon(dogEarPanelPolygon(cutW, cutL), sa)
    if (!inset || inset.length < 3) return null
    return { kind: 'poly', points: inset }
  }
  const w = cutW - 2 * sa
  const h = cutL - 2 * sa
  if (!(w > 0) || !(h > 0)) return null
  return { kind: 'rect', x: sa, y: sa, w, h }
}
