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

## Comments — window 1

Landed: `ComplexSelector` publishes its content seam (`contentClassName` and an inline style path), which
unblocks `packages/lab/src/TransferList/TransferListSelector.tsx`; and the field wrapper's own paint moved
to `Field/inputClasses.ts` for the properties a class can hold.

Left: `Field/inputStyles.stylex.ts` still builds 5 maps (`inputWrapperStyles`, `inputStatusBorderStyles`,
`inputStatusHoverShadowStyles`, `inputStatusFocusWithinStyles`, `inputStatusFocusStyles`), `inputDisabledFocus.ts`
1, `InputGroup/groupStyles.ts` 1, and the wrapper maps in `NumberInput`, `MultiSelector`, `Selector`,
`Typeahead`, `BaseTypeahead`, `Tokenizer` (4). Those status maps key on `:hover`, `:focus-within` and
`:focus` together with a theme variable per status, so each needs the variant-per-state treatment and a
test that reads classes rather than declarations.

## Comments — window 2

Landed three commits: `fix(core): рамка статуса поля приходит из класса, а не из StyleX`,
`refactor(core): карта inputWrapperStyles удалена, прототипы берут класс поля`,
`refactor(core): группа InputGroup берёт геометрию строки из класса`, then one more for the five status
maps: `refactor(field): отдать состояние поля классам и убрать карты обёртки` (50 files). The five maps in
`Field/inputStyles.stylex.ts` are gone; `fieldClasses.ts` holds `fieldInputWrapperClassName`,
`fieldInputWrapperDisabledClassName` (`cursor-default opacity-50 shadow-none`) and one class per status and
state, and every input family plus `packages/richtext/src/RichTextEditor.tsx` reads them (the RichText
hover-shadow argument went away, so its wrapper is now pure class text plus `xstyle`). Two tests moved off
`getComputedStyle`: `packages/richtext/src/RichTextEditor.test.tsx` asserts the wrapper's `opacity-50`
class, and `packages/core/src/AppShell/AppShell.test.tsx` asserts the wrapper's `relative` class.
Suites: 147 files / 4412 tests in the branch, 152 files / 4555 on the integration branch.

A trunk regression surfaced while validating: ticket 41 deleted `utils/rtlStyles.ts`, but
`packages/richtext/src/RichTextEditorToolbar.tsx`, two Storybook stories and a sandbox page still imported
`rtlStyles`. Fixed on the integration branch in `fix(richtext): брать зеркало из класса вместо удалённого
rtlStyles` (they use `RTL_MIRROR_CLASS` through `className`, and the CLI's `i18n-rtl-and-testing.doc.mjs`
teaches the class instead of the retired style).

Left: `Field/inputDisabledFocus.ts` (1), `InputGroup/groupStyles.ts` (1), and the field-wrapper maps that
survive in components outside this ticket's list.
