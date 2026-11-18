# tokens

Status: done
Blocked by: —
Wave: 3
Ticket: 05
Parent: `00-epic-stylex-to-tailwind-4`

## What

Turn the 18 `defineVars` in `theme/tokens.stylex.ts` into a generated `tokens.css` plus a plain `theme/tokens.ts` that exports the same names as `var(--spacing-2)` strings, and keep `tokens.stylex.ts` as a deprecated re-export so the 251 importers move one line at a time.

## Files

- `packages/core/src/theme/tokens.stylex.ts`
- `packages/core/src/theme/tokens.ts (new)`
- `packages/core/src/theme/declarationBoundary.ts`
- `packages/core/src/theme/__tests__/`
- `the generator that writes tokens.css from the `*Defaults` objects`

## Done when

- `tokens.css` is generated from the `*Defaults` objects, not hand-written, and a test fails when the two drift.
- Every token name keeps its value and its `var(--…)` spelling.
- `tokens.stylex.ts` still resolves during the migration and is marked `@deprecated`.
- The 251 imports are untouched in this ticket; they move in the family tickets that own them.

## Verification

- `pnpm -F @astryxdesign/core typecheck`
- `pnpm exec vitest run packages/core/src/theme`
- `node packages/core/scripts/build-css-tailwind.mjs (sheet unchanged)`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
