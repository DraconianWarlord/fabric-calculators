# SPEC: Suite shell (`@sailrite/calc-shell`)

## Purpose

Shared chrome for every Sailrite fabric calculator in the monorepo: black header, calculator switcher, design tokens, shop links, and unit helpers.

## Visual

- **Theme**: DaisyUI `sailrite` (default) — see `apps/web/src/styles.css` and `docs/STYLING.md`
- **Header**: `navbar` on `bg-neutral` (black), white type, Sailrite logo
- **Actions**: Sailrite Blue `#24285e` → `btn-primary`
- **Alert / danger**: `#e75053` → `error` / `btn-error` / `alert-error`
- **Chrome**: black / white / grey — tool-like, modest radii (`--radius-box` ~0.5rem)
- **Disclaimer**: light grey strip under header (owned by each Page when needed)
- **Nav badges**: `badge` — Open / Here (`badge-primary`), Coming soon (white)

## Responsibilities

| Module | Role |
|--------|------|
| `Header` | Logo, current tool chip (mobile), `CalculatorNav`, status slot, Shop Sailrite CTA |
| `CalculatorNav` / `MobileMoreCalculators` | Active calc by route; More menu with Open (in-suite Link or external) vs Coming soon |
| `HeaderStatusProvider` | Lets Pages inject yardage / Export PDF into the header without owning the header |
| `tokens.css` | Brand CSS variables only (`--sr-*`); live chrome is Daisy/Tailwind |
| `shopLinks` | UTM-tagged Sailrite.com URLs (`buildShopLinks(medium)`) |
| `units` | Shared `Unit` / `toInches` / `fromInches` (calcs may keep local copies for formula isolation) |

## Non-goals

- Calculator formulas and panel UIs
- Per-calc layout grids (controls / canvas / results)
- Rewriting Sailrite Brand or UX checklists
- Stock Daisy `light` / `dark` as default theme

## Nav behavior

- Catalog comes from `@sailrite/calc-registry` (passed as props — shell does not import registry at build time to avoid cycles)
- Highlight = path match (`currentPath === calc.path`)
- In-suite active calcs: React Router `Link`
- `live` + `href`: external Open
- `soon`: disabled Coming soon
