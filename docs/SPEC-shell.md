# SPEC: Suite shell (`@sailrite/calc-shell`)

## Purpose

Shared chrome for every Sailrite fabric calculator in the monorepo: black header, calculator switcher, design tokens, shop links, and unit helpers.

## Visual

- **Header**: black background, white type, Sailrite logo
- **Actions**: Sailrite Blue `#24285e` (hover `#1a1d45`)
- **Alert / danger**: `#e75053`
- **Chrome**: black / white / grey — tool-like, not storefront clutter
- **Disclaimer**: light grey strip under header (owned by each Page when needed)

## Responsibilities

| Module | Role |
|--------|------|
| `Header` | Logo, current tool chip (mobile), `CalculatorNav`, status slot, Shop Sailrite CTA |
| `CalculatorNav` / `MobileMoreCalculators` | Active calc by route; More menu with Open (in-suite Link or external) vs Coming soon |
| `HeaderStatusProvider` | Lets Pages inject yardage / Export PDF into the header without owning the header |
| `tokens.css` | CSS variables + base resets + header/nav styles |
| `shopLinks` | UTM-tagged Sailrite.com URLs (`buildShopLinks(medium)`) |
| `units` | Shared `Unit` / `toInches` / `fromInches` (calcs may keep local copies for formula isolation) |

## Non-goals

- Calculator formulas and panel UIs
- Per-calc layout grids (controls / canvas / results)
- Rewriting Sailrite Brand or UX checklists

## Nav behavior

- Catalog comes from `@sailrite/calc-registry` (passed as props — shell does not import registry at build time to avoid cycles)
- Highlight = path match (`currentPath === meta.path`)
- In-suite active calcs: React Router `Link`
- `live` + `href`: external Open
- `soon`: disabled Coming soon
