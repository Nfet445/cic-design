# data token sheet

Status: ready-for-agent
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
