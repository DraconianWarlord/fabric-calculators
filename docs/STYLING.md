# Styling guide (Sailrite fabric calculators)

## Stack

- **Tailwind CSS v4** via `@tailwindcss/vite` in `apps/web`
- **DaisyUI** with a single custom theme: **`sailrite`** (default)
- Theme + `@source` globs live in `apps/web/src/styles.css`
- Root: `<html data-theme="sailrite">`

## Ownership

| Owner | Owns | Does not |
|-------|------|----------|
| **Brand** | Hex tokens (`#24285e`, `#e75053`, B/W chrome) | Spacing, overlap, component density |
| **UX** | Spacing, hierarchy, overlap, tool density | New brand colors |
| **Eng** | Daisy/Tailwind wiring, content globs, build | Ad-hoc hex outside Brand tokens |

## Brand tokens (hex — Brand only)

| Role | Hex | Daisy mapping |
|------|-----|---------------|
| Primary / actions | `#24285e` | `primary` |
| Primary text on actions | `#ffffff` | `primary-content` |
| Header chrome | `#000000` | `neutral` |
| Panels | `#ffffff` / `#f5f5f5` / `#e5e5e5` | `base-100` / `base-200` / `base-300` |
| Body text | `#111111` | `base-content` |
| Errors / alerts | `#e75053` | `error` |

Legacy CSS vars (`--sr-action`, `--sr-danger`, …) mirror these in `packages/shell/src/tokens.css` and `styles.css` for remaining custom CSS (e.g. bolt canvas).

## Patterns

Prefer Daisy + utilities; avoid new large CSS files for chrome.

- Cards: `card bg-base-100 border border-base-300`
- Primary actions: `btn btn-primary`
- Inputs: `input input-bordered` / `select select-bordered`
- Toggles: `join` + `btn` / `toggle`
- Alerts: `alert alert-error` / `alert-warning`
- Nav: `navbar`, `menu`, `badge` (Open / Coming soon)
- Status badges: `badge badge-primary` / `badge`

**Do not** set Daisy stock `light` / `dark` as the live default. Nesting bolt SVG/canvas may keep scoped custom CSS.

## Content globs

Tailwind must see classes in:

- `apps/web/src/**`
- `packages/shell/src/**`
- `packages/calculators/*/src/**`

## Suite page layout (Nesting parity — locked)

Locked by Zach (2026-09-23): **every calculator follows the Nesting app layout** unless Zach says otherwise for that calc.

Desktop (≥801px) — three columns, middle is the focus:

| Column | Role | Nesting reference |
|--------|------|-------------------|
| **Left** (~280px) | Controls / inputs card stack | `.sidebar.left` |
| **Middle** (`1fr`) | Primary render / work surface — the focus | `.canvas-wrap` / bolt |
| **Right** (~300px) | Results, yardage, list / secondary actions | `.sidebar.right` |

CSS shape (per-calc scoped): `grid-template-columns: 280px 1fr 300px` with column gutter matching spacing tokens. Do **not** invent alternate IA (e.g. dual right-column stacks that bury the middle render, or reference-above-preview as the hero).

Mobile (≤800px): tabbed panes — Nesting uses **Controls | Bolt | Panels**; other calcs may use **Inputs | Results** (or equivalent) so there is **one** scroll surface. No dual competing scroll panes. Default tab = the middle work surface when that helps.

Secondary visuals (comparison thumbs, dim keys, reference diagrams) stay secondary — compact in the left stack or under controls — never steal the middle focus.

Reference implementation: `packages/calculators/nesting/src/Page.tsx` + `Page.css` (`.layout`, `.canvas-wrap`, mobile pane classes).

## Desktop spacing tokens (≥801px)

From Sailrite UX (Nesting + Pillows). Use consistently on new calcs:

| Token | Value | Tailwind |
|-------|-------|----------|
| Stack gap (cards in a column) | 1rem | `gap-4` |
| Card padding | 1rem | `p-4` / `card-body p-4` |
| Column gutter | 1.5rem | `gap-6` |
| Label → field / field → helper | 0.375rem | `gap-1.5` |
| Helper → next label | 1rem | `gap-4` (section stack) |
| Type/chooser card padding | 0.75rem | `p-3` |
| Type/chooser gap | 0.75rem | `gap-3` |
| Section title → content | 0.5rem | `mb-2` |
| Touch / join min height | 2.75rem | `min-h-11` |

Avoid tangents: don’t let borders kiss (use gap); don’t place hairline column dividers flush against scrollbars; don’t use Alert Red for non-error diagram accents.

## Review gate

New calculators and major UI restyles: **Sailrite Brand** + **Sailrite UX** before Zach’s review (see `CONTRIBUTING-CALCULATORS.md`).

## Diagram / dimension render (suite standard: **B**)

Locked by Zach for Nesting, Pillows, and future calculators. Full spec: [`DIAGRAM-STYLE.md`](./DIAGRAM-STYLE.md).

| Element | Style |
|---------|--------|
| **Cut** outline | Solid stroke SR Blue `#24285e`; light fill (e.g. `#e8eaf6` / primary tint) |
| **Finished** outline | Dashed stroke SR Blue `#24285e` (never Alert Red) |
| **Labels** | Cut / finished sizes on or beside shapes |
| **Legend** | Cut = solid · Finished = dashed |

Shared helpers: `cutShapeSvgProps`, `finishedShapeSvgProps`, `CutFinishedLegend` in `@sailrite/calc-shell` (`packages/shell/src/diagrams/`).

Do **not** use exterior CAD tick-dimension style (option A) as the suite default.

