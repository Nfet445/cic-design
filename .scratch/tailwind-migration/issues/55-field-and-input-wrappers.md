# field and input wrappers

Status: ready-for-agent
Blocked by: —
Wave: 10
Ticket: 55
Parent: `00-epic-stylex-to-tailwind-4`

## What

The field base and the wrappers around it. `packages/core/src/Field/inputStyles.stylex.ts` writes
the unlayered `paddingBlock`/`paddingInline` shorthands of the shared field, so a wrapper's own
utilities lose to it at any order — that tie is the reason the wrappers below never moved.

## Measured scope

- `packages/core/src/Field/inputStyles.stylex.ts` 5 maps, `Field/inputDisabledFocus.ts` 1,
  `hooks/inputStatusIconFocus.stylex.ts` 1.
- `packages/core/src/InputGroup/groupStyles.ts` 1.
- One map each in `NumberInput/NumberInput.tsx`, `MultiSelector/MultiSelector.tsx`,
  `Selector/Selector.tsx`, `Typeahead/Typeahead.tsx`, `Typeahead/BaseTypeahead.tsx`,
  `ComplexSelector/ComplexSelector.tsx`, `Tokenizer/Tokenizer.tsx` (4), `Tokenizer/TokenizerBottomSheet.tsx`.

## Done when

- The field base publishes its padding and border as classes plus `--astryx-field-*` properties, and
  every wrapper states its own extras instead of cancelling a shorthand.
- `rg "stylex.create" packages/core/src/Field packages/core/src/InputGroup packages/core/src/NumberInput packages/core/src/Selector packages/core/src/MultiSelector packages/core/src/Typeahead packages/core/src/ComplexSelector packages/core/src/Tokenizer`
  returns nothing but documented survivors.
- `ComplexSelector` publishes the `content` seam ticket 30 needed (`TransferListSelector` blocks on it).

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src/{Field,InputGroup,NumberInput,Selector,MultiSelector,Typeahead,ComplexSelector,Tokenizer,TextInput,TextArea,DateInput,DateTimeInput,TimeInput,DateRangeInput} packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `pnpm -F @astryxdesign/core typecheck`, plus the iOS 16px floor test `packages/core/src/inputFontFloor.test.ts`.

## Notes

- Follow `.scratch/tailwind-migration/README.md`. The 16px floor is the class
  `pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]`
  and `inputFontFloor.test.ts` must point at the class map, not the component.
