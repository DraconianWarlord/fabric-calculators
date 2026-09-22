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
