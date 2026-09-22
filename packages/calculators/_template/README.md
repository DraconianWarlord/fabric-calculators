# Calculator template

Copy this folder to add a new Sailrite fabric calculator.

## 4-step add process

1. **Copy** `packages/calculators/_template` → `packages/calculators/<id>/`
   - Rename the package in `package.json` to `@sailrite/calc-<id>`
   - Set `meta.ts` (`id`, `label`, `path`, `status: 'active'`)
   - Implement `Page.tsx` (body only — no suite header)
   - Put formulas + tests in `lib/`

2. **Register** in `packages/registry/src/catalog.ts`
   - `import { meta as xMeta } from '@sailrite/calc-<id>/meta'`
   - Add `xMeta` to `CATALOG` (near other active calcs)

3. **Route** in `apps/web/src/routes.tsx`
   - Lazy-import the Page
   - Add `<Route path="/<id>" element={<XPage />} />`

4. **Wire workspace**
   - Add `"@sailrite/calc-<id>": "workspace:*"` to `apps/web` (and registry) dependencies
   - `pnpm install` from repo root
   - `pnpm test` / `pnpm --filter @sailrite/calc-web dev`

## Rules

- No cross-calculator imports (nesting must not import pillows, etc.)
- Math lives in `lib/` with vitest coverage
- Shell owns look (header, nav, tokens) — pages inject status via `useHeaderStatusOptional`
