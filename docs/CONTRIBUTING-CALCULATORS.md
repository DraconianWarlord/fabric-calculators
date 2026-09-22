# Contributing calculators

## Add a calculator (summary)

1. Copy `packages/calculators/_template` → `packages/calculators/<id>/`
2. Fill `meta.ts`, `Page.tsx`, and `lib/` (+ tests)
3. Register meta in `packages/registry/src/catalog.ts`
4. Add a lazy route in `apps/web/src/routes.tsx` and a workspace dependency
5. `pnpm install && pnpm test && pnpm --filter @sailrite/calc-web build`

See `packages/calculators/_template/README.md` for the detailed 4-step process.

## Rules

| Rule | Why |
|------|-----|
| **No cross-calc imports** | Nesting must not import pillows (or vice versa). Share only via `@sailrite/calc-shell` or tiny pure helpers you own. |
| **Math in `lib/`** | Keep formulas unit-testable without React. Page.tsx is UI + wiring. |
| **Shell owns look** | Header, calculator nav, design tokens, and Shop CTA live in `@sailrite/calc-shell`. Do not re-implement the black suite header in a Page. |
| **Status slot** | Yardage / Export PDF belong in the header status area via `useHeaderStatusOptional().setStatus(...)`. |
| **Brand** | Sailrite Blue `#24285e`, B/W chrome, alert `#e75053`. Do not rewrite Brand/UX rules. |
| **Meta** | Export `{ id, label, path, status, href? }` from `meta.ts`. In-suite calcs use `status: 'active'` and a `path`. External-only tools use `status: 'live'` + `href`. Roadmap items use `soon`. |

## Scripts (repo root)

```bash
pnpm install
pnpm test          # all packages with a test script
pnpm build         # production build of @sailrite/calc-web
pnpm dev           # vite dev server for the suite
```

## Package names

- `@sailrite/calc-shell` — chrome
- `@sailrite/calc-registry` — catalog
- `@sailrite/calc-<id>` — each calculator
- `@sailrite/calc-web` — Vite app
