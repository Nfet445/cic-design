# themes

Status: ready-for-agent
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
