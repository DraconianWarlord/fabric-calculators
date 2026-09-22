# Sailrite Fabric Calculators

Monorepo suite for Sailrite fabric yardage calculators (Nesting, Pillows, and more).

## Packages

| Package | Name | Role |
|---------|------|------|
| `apps/web` | `@sailrite/calc-web` | Vite + React shell app (routes all calculators) |
| `packages/shell` | `@sailrite/calc-shell` | Shared header, nav, tokens, shop links, units |
| `packages/registry` | `@sailrite/calc-registry` | Calculator catalog + types |
| `packages/calculators/nesting` | `@sailrite/calc-nesting` | Fabric nesting calculator |
| `packages/calculators/pillows` | `@sailrite/calc-pillows` | Throw + bolster pillows calculator |
| `packages/calculators/_template` | — | Starter for new calculators |

## Quick start

```bash
pnpm install
pnpm test
pnpm --filter @sailrite/calc-web dev
pnpm build
```

## Add a calculator

See [docs/CONTRIBUTING-CALCULATORS.md](./docs/CONTRIBUTING-CALCULATORS.md). Copy `packages/calculators/_template`, fill in `meta` + `Page`, register in the catalog.

## Legacy repos

Standalone prototypes remain at `sailrite-fabric-nesting` and `sailrite-pillows`. Prefer this monorepo for new work.
