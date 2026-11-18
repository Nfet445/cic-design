# token names without the StyleX shim

Status: ready-for-agent
Blocked by: —
Wave: 9
Ticket: 59
Parent: `00-epic-stylex-to-tailwind-4`

## What

`packages/core/src/theme/tokens.stylex.ts` is a `stylex.defineVars` module that 33 non-test files under `packages/core/src` import to read a token name (`spacingVars['--spacing-3']` becomes `'var(--spacing-3)'`). StyleX's runtime is what turns those names into variables, so nothing can drop `@stylexjs/*` while the shim exists, even though `packages/core/src/theme/tokenVars.ts` and the generated `packages/core/src/theme/tokens.css` already carry the same values.

Replace the import at every call site with a name source that needs no runtime: a plain record exported from `packages/core/src/theme/tokenVars.ts` (its `*Defaults` groups already list every name) or, where a site needs one or two names, the literal `var(--spacing-3)`.

## Files

- `packages/core/src/theme/tokens.stylex.ts`
- `packages/core/src/theme/tokenVars.ts`
- every non-test file under `packages/core/src`, `packages/lab/src`, `packages/charts/src` and `packages/richtext/src` that imports `tokens.stylex` (measured: 33 in core, plus the `.stylex.ts` modules stages 60 and 61 delete — such a module may be skipped and its import goes with it)

## Done when

- No non-test source imports `tokens.stylex` for a value.
- `pnpm exec vitest run packages/core/src` and `pnpm -F @astryxdesign/core typecheck` are green.
- `node packages/core/scripts/generate-tokens-css.mjs --check` exits 0 with a byte-identical sheet.

## Verification

- `pnpm exec vitest run packages/core/src packages/lab/src`
- `cd packages/core && pnpm exec tsc --noEmit -p tsconfig.json`
- `node packages/core/scripts/generate-tokens-css.mjs --check`

## Notes

- A name source stays a compile-time constant: a runtime value is invisible to the Tailwind scanner and to `packages/core/src/theme/tokens.defaults.test.ts`.
- `packages/core/src/theme/derivedVarRegistry.test.ts` walks sources for `--astryx-*` names; a new literal in a component moves a name into that component's doc file or into `CROSS_COMPONENT_VARS`.
