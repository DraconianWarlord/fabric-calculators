# `@sailrite/calc-shell`

Shared chrome for Sailrite fabric calculators: header, calculator switcher, brand tokens, shop links, units.

## Styling

- **DaisyUI theme**: `sailrite` (default) — defined in `apps/web/src/styles.css`
- **Brand hex** (do not invent new hex):
  - Primary / actions: `#24285e`
  - Header chrome: black / white (`neutral` / `base-100`)
  - Errors / alerts: `#e75053`
- Shell components use Tailwind utilities + Daisy (`navbar`, `btn`, `badge`, `menu`, `dropdown`-style menus)
- Legacy CSS variables remain in `tokens.css` for any calculator custom CSS still referencing `--sr-*`

See `docs/STYLING.md` and `docs/SPEC-shell.md`.

## Diagrams (standard B)

Cut/finished nested outlines: import `cutShapeSvgProps`, `finishedShapeSvgProps`, and `CutFinishedLegend` from `@sailrite/calc-shell`. See `docs/DIAGRAM-STYLE.md`.

