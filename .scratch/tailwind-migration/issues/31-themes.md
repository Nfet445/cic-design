# themes

Status: done
Blocked by: 6
Wave: 9
Ticket: 31
Parent: `00-epic-stylex-to-tailwind-4`

## What

Themes keep their packages and their build; only the bridge they emit is renamed, so `theme.css` carries the same variables the class maps read.

## Files

- `packages/core/src/theme/generateThemeRules.ts`
- `packages/cli/api/theme/build/build.mjs`
- `packages/themes/*/src`
- `packages/themes/*/CHANGELOG.md`

## Done when

- Eight theme builds produce the same variable names as today.
- `theme.css` and `fonts.css` keep their export paths.
- No theme source imports StyleX (none does today).

## Verification

- `pnpm -F @astryxdesign/core build`
- `astryx theme build packages/themes/neutral/src/neutralTheme.ts`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Closing notes

- All eight themes build from the current tree: `butter` 35.9 KB / 199 token + 22 component overrides, `chocolate` 24.7 KB / 196 + 8, `gothic` 21.8 KB / 197 + 11, `matcha` 20.3 KB / 211 + 5, `neutral` 27.2 KB / 197 + 14, `stone` 32.8 KB / 197 + 22, `y2k` 24.8 KB / 210 + 12, `probe` 178.6 KB / 31 + 276. Command: `node packages/cli/clients/cli/bin/astryx.mjs theme build packages/themes/<name>/src/<name>Theme.ts`.
- `pnpm -F @astryxdesign/core build` exits 0 and writes its stylesheet declarations; no theme source or emitted theme file carries the string `stylex`.
- Variable names are unchanged by construction: both sides read the same `*Defaults` groups through `packages/core/src/theme/tokenVars.ts`, and `packages/core/src/theme/tokens.defaults.test.ts` guards the parity, so a rename would fail that test before a theme build.
- No source change was needed, so this ticket ships no changeset.
