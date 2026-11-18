# data token sheet

Status: done
Blocked by: —
Wave: 9
Ticket: 38
Parent: `00-epic-stylex-to-tailwind-4`

## What

Move the 56 `--color-data-*` declarations out of `stylex.defineVars` and into a generated sheet, the way ticket 05 did for the core tokens: a plain `dataTokenVars.ts` carrying the defaults and a `var()` reference map, a generated `dataTokens.css`, and `dataTokens.stylex.ts` left as a deprecated re-export.

## Files

- `packages/core/src/theme/dataTokens.stylex.ts`
- `packages/core/src/theme/dataTokenVars.ts` (new)
- `packages/core/src/theme/dataTokens.css` (generated)
- `packages/core/scripts/generate-tokens-css.mjs` (the second group, or a shared generator)
- `scripts/build-css.mjs`, `scripts/generate-data-tokens.mjs`, `scripts/generate-token-docs.mjs`

## Done when

- The 56 declarations still reach `dist/astryx.css` — `scripts/build-css.data-tokens.test.mjs` asserts exactly 56 and must stay green.
- `scripts/generate-data-tokens.mjs` still produces `theme/domainTokens/dataTokens.ts`, reading defaults rather than `defineVars`.
- `docs/specs/domain-tokens` docs regenerate unchanged.
- `dataTokens.stylex.ts` resolves as a deprecated re-export during the migration.

## Verification

- `pnpm exec vitest run scripts/build-css.data-tokens.test.mjs packages/core/src/theme`
- `ASTRYX_STYLEX_BROWSER=1 pnpm exec vitest run scripts/build-css.data-tokens.browser.test.mjs`
- `node scripts/generate-data-tokens.mjs --check`
- `node scripts/generate-token-docs.mjs --check`

## Notes

- Deferred from ticket 06 because the change crosses into `scripts/**`, which the family tickets do not own.
- The patterns to copy are `packages/core/src/theme/tokenVars.ts`, `tokens.css` and `packages/core/scripts/generate-tokens-css.mjs`.

## Closing notes

- `27e5713bc` generates `packages/core/src/theme/dataTokens.css` from `dataTokenDefaults` (56 tokens), exports it as `./dataTokens.css`, and keeps `dataTokens.stylex.ts` as a shim. `bb1ad2d05` adds both generated core sheets to the source build (`GENERATED_SHEETS[CORE]`), to `withAstryx`, and exports `readExtraCss` from `scripts/build-css.mjs`.
- The file keeps generator-true uppercase hex: Prettier lowercases CSS hex and is not wired to `.css` in lint-staged, so formatting it would make `generate-tokens-css.mjs --check` fail on a change nobody meant.
- Parity was proven, not assumed: 56 tokens before and after, zero value differences, 56 declarations in both `theme/dataTokens.css` and `dist/astryx.css`.
- `c97656240` fixed a hole the merge exposed: the Vite split stylesheet was built only from StyleX `rulesById`, so once token defaults moved into generated sheets a Vite build carried no `:root` declarations at all — every `var(--color-…)` read and every `light-dark()` was unresolved. `renderSplitLayers` now appends each package's generated sheets inside `@layer astryx-base`, through the same `generatedSheetsFor` that the webpack path uses, so dev middleware and build agree. Merged as `34d7f2f8c`; `packages/build/src`, `scripts/build-css.graph.test.mjs` and `packages/core/src/theme` passed 1966 tests with one expected failure (the iOS floor check, ticket 43).
