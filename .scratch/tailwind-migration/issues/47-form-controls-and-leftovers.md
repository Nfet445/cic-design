# form controls and family leftovers

Status: ready-for-agent
Blocked by: 14, 15
Wave: 8
Ticket: 47
Parent: `00-epic-stylex-to-tailwind-4`

## What

Two groups in one ticket because they share the same shape: a control that
publishes a size or a state to its parts, and the pieces the earlier family
tickets left behind.

### Group A — the controls

- `packages/core/src/Switch/Switch.tsx` — 8 creations, the largest map left
  outside a family ticket
- `packages/core/src/CheckboxInput/CheckboxInput.tsx` — 3
- `packages/core/src/CheckboxList/CheckboxListItem.tsx` — 1
- `packages/core/src/RadioList/RadioList.tsx` — 1, `RadioListItem.tsx` — 3
- `packages/core/src/Slider/Slider.tsx` — 1
- `packages/core/src/Stepper/Stepper.tsx` — 1, `Step.tsx` — 1
- `packages/core/src/Collapsible/Collapsible.tsx` — 2,
  `CollapsibleGroup.tsx` — 1
- `packages/core/src/SelectableCard/SelectableCard.tsx` — 1
- `packages/core/src/Kbd/Kbd.tsx` — 1
- `packages/core/src/InfoTip/InfoTip.tsx` — 1
- `packages/core/src/FormLayout/FormLayout.tsx` — 1
- `packages/core/src/InputGroup/InputGroup.tsx` — 2, `InputGroupText.tsx` — 1,
  `groupStyles.ts` — 1 (the shared segment join)
- `packages/core/src/FieldStatus/FieldStatus.tsx` — 2,
  `Field/FieldLabel.tsx` — 1, `Field/inputDisabledFocus.ts` — 1,
  `Field/PanelSearchInput.tsx` — 1

### Group B — what the family tickets left

- `packages/core/src/NumberInput/NumberInput.tsx` — 2
- `packages/core/src/Selector/Selector.tsx` — 2, `SelectorOption.tsx` — 2
- `packages/core/src/MultiSelector/MultiSelector.tsx` — 2
- `packages/core/src/Typeahead/Typeahead.tsx` — 2, `BaseTypeahead.tsx` — 1
- `packages/core/src/ComplexSelector/ComplexSelector.tsx` — 1
- `packages/core/src/ToggleButton/ToggleButtonGroup.tsx` — 2
- `packages/core/src/Icon/Icon.tsx` — 2
- `packages/core/src/AvatarGroup/AvatarGroup.tsx` — 2,
  `AvatarGroupOverflow.tsx` — 2
- `packages/core/src/TextArea/TextArea.tsx` — 1
- `packages/core/src/NavIcon/NavIcon.tsx` — 1

Read the closing notes of tickets 14, 15, 18 and 20 before touching Group B:
each names the rule it deliberately left and the reason. A survivor stays a
survivor unless the reason is now gone.

## Approach

- Literal classes in a `*Classes.ts` module, joined with `tw()`.
- A control that publishes a size or a tone to its parts keeps the variable
  path (`--astryx-*` written inline by the parent, read by the class), so a
  consumer rule still overrides.
- A `focusOutlineProps` caller keeps calling it and joins its `className` into
  one `className`; a lone `{...stylex.props()}` beside `className` trips
  `@astryx/no-classname-clobber`.
- Custom-property text in a class needs a narrow `eslint-disable` for
  `@astryx/no-raw-private-attribute`.

## Done when

- No `stylex.create` under these paths, except a survivor the ticket names with
  its reason.
- Every test that read a computed style or a StyleX debug name reads the class
  set instead, and the ticket lists them.
- New exports are registered in the coverage block of
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`.
- One `component`/patch changeset covers both groups.

## Verification

- `pnpm exec vitest run packages/core/src/Switch packages/core/src/CheckboxInput packages/core/src/CheckboxList packages/core/src/RadioList packages/core/src/Slider packages/core/src/Stepper packages/core/src/Collapsible packages/core/src/InputGroup packages/core/src/Field packages/core/src/NumberInput packages/core/src/Selector packages/core/src/MultiSelector packages/core/src/Typeahead packages/core/src/ToggleButton packages/core/src/AvatarGroup packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- Manual Windows High Contrast check applies to Switch, Checkbox, Radio,
  Stepper and Collapsible.

## Window log

### 2026-11-17, window 1

Group A only; Group B not started. The plan's file order (Switch first) did
not survive contact with the files: Switch alone is a window, so the supervisor
approved smallest-first inside Group A.

Done and committed, one file per commit:

- `CheckboxListItem` — `checkboxListItemClasses.ts`; the checked row's fill is
  Item's own `itemSelectedClassName`, reused instead of duplicated, so a theme
  restyles both from one record. No new `--astryx-*` variable.
- `RadioList` — `radioListClasses.ts`; one class per orientation, each owning
  its axis and its gap.

Both are covered in the sheet test's `familyClassNames()`, and neither had a
test that read a computed style or a StyleX debug name, so no assertion moved
for them.

Changeset: `.changeset/ticket-47-form-controls-tailwind.md`.

Left to measure, so the next window sizes itself instead of re-reading:

- `Switch/Switch.tsx` 1004 lines, 8 `stylex.create` calls, ~40 style keys;
  `Switch.test.tsx` 1820 lines full of `getComputedStyle`,
  `document.styleSheets` and injected-CSS assertions; plus
  `Switch.focusRing.source-build.test.mjs` (88 lines), which compiles the source
  through the StyleX babel plugin — it must be converted, not deleted.
  Supervisor's decision for that window: the three marker-scoped paints (hover
  tint, press layers, focus ring) stay in one
  `Switch/switchHoverPress.stylex.ts` following
  `Indicator/indicatorHover.stylex.ts`, because a marker's generated class name
  genuinely cannot be restated as a utility; everything else becomes classes.
  A test that reads a computed style for a value only that survivor owns keeps
  its read, pointed at the survivor.
- `Slider/Slider.tsx` 1927 lines, but its one `stylex.create` holds about 50
  keys (travel box in `cqi`/`cqb`, fill movers, thumb geometry), so the ticket's
  "1" counts calls, not work.
- `Stepper/Step.tsx` 1910 lines and `Stepper/Stepper.tsx` 582.
- `CheckboxInput/CheckboxInput.tsx` 665 lines, 3 calls; its press overlays read
  the `indicatorPressScope` marker, so they are survivor-shaped like Switch's.
- `RadioList/RadioListItem.tsx` 437 lines, 3 calls; its `root` zeroes Item's
  padding, radius and background. Item now sets those as classes in the same
  layer, so this one needs a variant that beats a sibling declaration, not a
  later class.
- Still untouched in Group A: `Collapsible`, `SelectableCard`, `Kbd`,
  `InfoTip`, `FormLayout`, `InputGroup` (3 files), `FieldStatus`, `Field`
  (3 files).

Known failure carried into this window and unchanged by it:
`RadioList.test.tsx` "does not call onChange when group is disabled" and "…
when individual item is disabled" fail on the branch tip too (jsdom does not
honour the StyleX `pointer-events` these two read), verified by stashing this
window's work.

Merge of `poc/tailwind-layout-primitives` into this branch was clean: no
conflict in `tailwindStylesheet.source-build.test.mjs`, so the conflict-keeper
rule did not have to be applied. Sheet after the merge: 168.7 kB raw; the size
gate stayed green.
