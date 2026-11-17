# search surfaces

Status: done
Blocked by: 23
Wave: 7
Family: `family:overlay-dismissal`
Ticket: 25
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `CommandPalette/` (8), `PowerSearch/` (9) and the remaining input popovers (`Tokenizer/` (10), `ChatComposerInput/`, `PowerSearchEditPopover/`).

## Files

- `packages/core/src/CommandPalette/**`
- `packages/core/src/PowerSearch/**`
- `packages/core/src/Tokenizer/**`
- `packages/core/src/Chat/** (composer input only)`

## Done when

- The palette grid and the anchored edit popover style from maps.
- Typing state and empty state keep their measured heights.

## Verification

- `pnpm exec vitest run packages/core/src/CommandPalette packages/core/src/PowerSearch packages/core/src/Tokenizer`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Comments

CommandPalette and PowerSearch are classes now (merged on the integration
branch, `PowerSearch/powerSearchClasses.ts`, `powerSearchEditPopoverClasses.ts`,
`powerSearchSheetClasses.ts`); the field's box and states stay in
`Field/inputStyles.stylex.ts` and the sheet body's padding variables in
`Layout/padding.stylex.ts` because those rules are unlayered and would lose to a
`@layer astryx-base` utility at any order.

What is left: `Tokenizer/Tokenizer.tsx` (5), `TokenizerBottomSheet.tsx` (1) and
`useEndLaneReserve.ts` (1). The Tokenizer carries the same 16px input floor as
the other fields — keep `pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]`
in whatever class map takes over the input, or
`packages/core/src/inputFontFloor.test.ts` fails.

## Comments

- 2026-11-17: closed. `CommandPalette`, `PowerSearch` (field, editor, popover, bottom sheet) and `Tokenizer`'s bottom sheet and rows draw from classes.
- `Tokenizer`'s remaining four maps at `packages/core/src/Tokenizer/Tokenizer.tsx:455`, `:564`, `:570`, `:576` are the documented tie: the wrapper is the same element as `inputWrapperStyles.base` and `groupStyles.inGroup`, whose unlayered `padding`, `gap`, `flex-wrap` and `height` beat any utility in `astryx-base`, and the input states face the same tie against `typeaheadInputClassName`'s own `flex` and `min-w` utilities. The map's header says this.
- The 16px iOS floor is a class in `packages/core/src/Tokenizer/tokenizerClasses.ts` and stays in `packages/core/src/inputFontFloor.test.ts`'s list.
