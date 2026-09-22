# Diagram / dimension render — suite standard **B**

Locked by Zach for Nesting, Pillows, and future Sailrite fabric calculators.

## Nested cut / finished (not CAD ticks)

| Element | Style |
|---------|--------|
| **Cut** (outer) | Solid stroke SR Blue `#24285e`; light fill `#e8eaf6` (or base-200 / primary tint) |
| **Finished** (inner) | Dashed stroke SR Blue `#24285e`; white / transparent fill |
| **Labels** | Cut vs finished sizes on or near shapes |
| **Legend** | Cut = solid · Finished = dashed |

### Do not

- Exterior tick-dimension CAD style as the suite default (that was option **A**)
- Alert Red `#e75053` for finished / decorative outlines (errors only)

## Shared helper

Import from `@sailrite/calc-shell`:

```ts
import {
  cutShapeSvgProps,
  finishedShapeSvgProps,
  CutFinishedLegend,
  DIAGRAM_SR_BLUE,
  DIAGRAM_CUT_FILL,
} from '@sailrite/calc-shell'
```

Source: `packages/shell/src/diagrams/`.

## Scope notes

- **Shape dim previews** (Nesting circle / trap / rect / irregular): use nested cut + finished with legend; no mono tick bars.
- **Pillows** form/cut diagrams: same stroke / dash / fill tokens.
- **Nesting bolt canvas**: panel fill colors may stay; any cut-vs-finished *overlay* must follow B.

Also summarized in `docs/STYLING.md` and UX checklist §I2.
