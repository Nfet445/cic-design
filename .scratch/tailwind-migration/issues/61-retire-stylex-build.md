# retire the StyleX build

Status: done
Blocked by: 60
Wave: 9
Ticket: 61
Parent: `00-epic-stylex-to-tailwind-4`

## What

`packages/build` still carries a StyleX pipeline: `source-stylesheet.js` collects `rulesById`, the vite plugin has a StyleX branch, and `scripts/build-css.mjs` writes a per-package StyleX sheet. With stage 60 landed no package has a rule to collect.

Delete that half, keep the generated-sheet path (`GENERATED_SHEETS`, `readExtraCss`, `extraCss`), and keep `astryx.css` emitting its token and reset sheets until OQ1 decides its fate.

## Files

- `packages/build/src/source-stylesheet.js`, `packages/build/src/vite.ts`, `packages/build/src/index.js`
- `scripts/build-css.mjs`
- `packages/core/scripts/build-css-tailwind.mjs` (only where it reads a StyleX manifest)

## Done when

- `grep -r "@stylexjs" packages/build scripts` is empty outside changesets.
- `pnpm build` is green and the emitted `dist/astryx.css` carries the token sheets plus the reset.
- The StyleX gzip gate in the sheet test is retired or replaced by a raw-size budget with a measured number.

## Verification

- `pnpm build`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src/Layout packages/build scripts`

## Comments — closed

The StyleX pass is optional and nothing in the emitted sheet depends on it:
`writePackageStylesheet` reads the generated sheets first, so a target with zero
rules still writes the layer order plus its token sheets, and the strict default
now covers only the case that is a mistake (no rules, no sheet, no
`--allow-empty`). `processRules` and the undefined-variable check run only when
rules exist. Guard: `scripts/build-css.zero-rules.test.mjs` builds a package with
one plain `.ts` file, a `tokens.css` and a `reset.css`, and asserts the layer
statement, the `:root` token block and the reset, plus disk equality.

Validated with `node scripts/build-css.mjs --package core` (677 rules, 65.5 KB)
and `--package richtext --allow-empty` (a live zero-rule package).
