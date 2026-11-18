# point xstyle at the Tailwind adapter

Status: ready-for-agent
Blocked by: 61
Wave: 9
Ticket: 62
Parent: `00-epic-stylex-to-tailwind-4`

## What

`xstyle` must keep working: AST-119 FR5 and OQ3 require its value to land unlayered, so a consumer rule always beats a component rule. Today the prop is a `StyleXStyles` value passed to `stylex.props`.

Retarget it at a Tailwind-shaped adapter: the prop accepts a class string or a style object, and its value reaches the element after the component's classes and before `style`. `mergeProps` already accepts both shapes, so most of this stage is deleting the `stylex.props` passthrough and typing the prop.

## Files

- `packages/core/src/utils/mergeProps.ts`
- every `BaseProps`/`xstyle` declaration under `packages/core/src` (measured: 258 files mention `xstyle`)
- `packages/core/src/__tests__/classNameAssertions.ts`

## Done when

- No `stylex.props` call remains in `packages/core/src`, `packages/lab/src`, `packages/charts/src` or `packages/richtext/src`.
- A consumer `xstyle={{'--x': 'red'}}` and a consumer `xstyle="some-class"` both land on the element after the component's classes.
- A new `packages/core/src/__tests__/xstyleContract.test.ts` pins the merge order and the unlayered rule.

## Verification

- `pnpm exec vitest run packages/core/src packages/lab/src packages/charts/src packages/richtext/src`
- `pnpm -F @astryxdesign/core typecheck`

## Comments — window 62b

Started from `/tmp/win-wt62b.md` on `ticket/62b-xstyle`. `poc/tailwind-layout-primitives` was already
an ancestor (its tip is this branch's base, `1cc2816b7`), so there was nothing to merge.

Measured over the window's own directories (forms, choice inputs, dates, slider/stepper, search
surfaces): `grep -rn "stylex.props(xstyle)"` went from **22 to 0**. Eight commits, one per component
or family:

- `refactor(field)` — `Field`, `FieldLabel`, `PanelSearchInput`, `FieldStatus`, `InputGroup`,
  `InputGroupText`, `FormLayout`. The `stylex` import left all seven.
- `refactor(typeahead)` — `BaseTypeahead` held `stylex.props(inputXStyle, xstyle)`, so it now keeps
  `stylex.props(inputXStyle)` in the component slot and passes `xstyleProps(xstyle).className` after
  its own classes with `{...xstyleProps(xstyle).style, ...style}` last; `TypeaheadItem` is a straight
  swap.
- `refactor(command-palette)` — five parts plus `CommandPaletteItem`, which keeps its pressed-alpha
  StyleX arm and moves the consumer class after its eight component classes.
- `refactor(stepper)` — `Step` (four roots) and `Stepper`, where `listXstyle = isHorizontal ? undefined : xstyle`
  means the vertical list carries the consumer override: that call went through the adapter too, or a
  vertical `xstyle="my-class"` string would have stopped working. `stylex` left `Stepper.tsx`.
- `refactor(calendar)`, `refactor(switch)`, `refactor(checkbox-input)`, `refactor(power-search)` —
  straight swaps. `PowerSearch` passes `xstyleProps(status && !isDisabled ? xstyle : undefined)`,
  because `status && !isDisabled && xstyle` yields `false` and the adapter would have read that as a
  style object.

Left alone on purpose, all of them separate props whose type this window may not change:
`controlXstyle` (20-odd sites in `TextInput`, `TextArea`, `NumberInput`, `FileInput`, `Tokenizer`,
`DateInput`/`DateTimeInput`/`TimeInput`/`DateRangeInput`/`CheckboxList`/`RadioList`/`Slider`),
`inputXStyle`, `contentXstyle`, `PanelSearchInput`'s private `fieldXstyle?: StyleXStyles`, `SelectorOption`'s
own `xstyle?: StyleXStyles` prop, and the Layer/Popover `xstyle: styles.popover` in `Selector`,
`MultiSelector`, `ComplexSelector` and `BaseTypeahead`'s menu. A BaseProps `xstyle` that still carries a
StyleX value — `TokenizerBottomSheet` passes `styles.sheetTokenDisabled` — keeps working, because
`xstyleProps` classifies a `$$css` value and hands it to `stylex.props`.

Divergence from the instruction's second shape: where the component style was non-empty the class slot is
`tw(componentClasses, xstyleProps(xstyle).className, className)`, i.e. the consumer class sits before the
consumer `className`, which is the order the window file spells out; the two are both consumer-owned and
never win against each other.

Verification: `pnpm exec vitest run` over the eleven touched directories — 69 files, 1898 tests, 2
failures (`Calendar.calendarSystems`, `PowerSearch.calendarSystems`), both the expected ICU/Chinese
calendar pair. `tsc --noEmit -p packages/core/tsconfig.json` reports only the three pre-existing
`locales/pseudo.json` module errors in `i18n` and `SideNav` tests. `prettier` and `eslint` on the
touched files: no new findings.

Left for whoever closes ticket 62: the `controlXstyle`/`contentXstyle`/`fieldXstyle` family and the
Layer `xstyle` still take `StyleXStyles`, and `packages/core/src/__tests__/xstyleContract.test.ts` is
not written yet.
