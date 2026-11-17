# date inputs

Status: ready-for-agent
Blocked by: 14
Wave: 4
Family: `family:input-fields`
Ticket: 16
Parent: `00-epic-stylex-to-tailwind-4`

## What

Third form slice: `DateInput/` (16), `DateRangeInput/`, `DateTimeInput/` (10) and `TimeInput/` (5).

## Files

- `packages/core/src/DateInput/**`
- `packages/core/src/DateRangeInput/**`
- `packages/core/src/DateTimeInput/**`
- `packages/core/src/TimeInput/**`

## Done when

- Wheel and grid segments style from maps.
- `DateInput/tokens` keeps its export path (it changes only in ticket 35).

## Verification

- `pnpm exec vitest run packages/core/src/DateInput packages/core/src/DateRangeInput packages/core/src/DateTimeInput packages/core/src/TimeInput`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Closing notes

Landed: `DateRangeInput/` (3 `stylex.create` calls) and `TimeInput/` (5, counting
the touch field's two maps) keep no literal in the component; their classes live
in `dateRangeInputClasses.ts`, `timeInputClasses.ts` and
`touchTimeFieldClasses.ts` and the package stylesheet test walks every arm of
them.

Left on StyleX, in this ticket's own scope:

- `DateInput/` — `DateInput.tsx`, `Wheel.tsx`, `PickerWheel.tsx`,
  `MonthScroller.tsx`, `MonthYearWheels.tsx`, `NativeDateField.tsx`,
  `TouchDateField.tsx`: 16 maps, and three test files assert on StyleX output
  (`DateInputTouch.test.tsx` matches the source text `stylex.create(`), so the
  slice needs its test moves before the component moves.
- `DateTimeInput/` — `DateTimeInput.tsx`, `TouchDateTimeField.tsx`,
  `nativePickerSegmentStyles.ts`: 10 maps, same test surface
  (`DateTimeInputTouch.test.tsx`, `NativePickerSegments.test.tsx`).

Assertions moved off StyleX output: `TimeInput.test.tsx`'s `isStyledInvalid`
matched the debug class `.inputInvalid`; it now names the class
`timeInputClassName({isDisabled: false, isRejected: true})` emits and asserts it
through `classesOf`.

Two traps beyond the three the field slice recorded: an arm that must beat the
control's own utility has to key off an attribute the component sets
(`[&[aria-disabled=true]]`, `[&[aria-invalid=true]]`), because two plain
utilities in `astryx-base` are ordered by the sheet, not by the class attribute;
and `Wheel`'s pane block size is a geometry constant, so the row reads
`--astryx-time-wheels-block-size` and the element writes it inline.

### Session 2 (branch `ticket/16-date-inputs`, merged with the POC)

Landed: `DateInput/DateInput.tsx` keeps no `stylex.create`.
`dateInputClasses.ts` gained `dateInputToggleClassName`,
`dateInputControlClassName`, `dateInputSizeClassName` and the `DateInputSize`
union; the component spreads only `focusOutlineStyles.focusVisible` (a shared
StyleX ring it does not own) and joins its class into the same `className`,
because a lone `{...stylex.props()}` followed by `className` trips
`@astryx/no-classname-clobber`. `DateInput.test.tsx` reads the rejected arm
through `classesOf`; `inputFontFloor.test.ts` now lists
`DateInput/dateInputClasses.ts` in place of `DateInput/DateInput.tsx`. The sheet
test's coverage block gained the toggle, control and size arms; the sheet stayed
under the existing 1020 budget.

Left, with the traps that will bite the next worker:

- `DateInput/`: `MonthScroller.tsx`, `NativeDateField.tsx`, `TouchDateField.tsx`,
  `Wheel.tsx` — 7 maps. `DateInputTouch.test.tsx` reads their source text
  (`const styles = stylex.create(`, `const sizeStyles = stylex.create(`,
  `blockSize: dateInputTouchGeometry.paneBlockSize` twice, the `band:` object,
  the `transitionTimingFunction`/`transitionDuration` counts), so the
  assertions move before the maps do. The `sizeStyles` equality between
  `TouchDateField.tsx` and `NativeDateField.tsx` needs both files to move in one
  commit.
- `DateTimeInput/`: `DateTimeInput.tsx` (3 creates) and `TouchDateTimeField.tsx`
  (2). The invalid arm at `styles.inputInvalid` cannot move on its own: the
  element's `color` is declared by the leftover unlayered `styles.input`, and an
  unlayered StyleX rule beats a class in `astryx-base` at any order. `input`,
  `inputDisabled` and `inputInvalid` move together, the way
  `timeInputClassName` already does. `DateTimeInput.test.tsx` keeps
  `/\.inputInvalid\b/` beside `nativePickerSegmentInvalidClassName` for the same
  reason.
- `NativeDateField.test.tsx` keeps its debug-name regex: that surface renders
  `NativeDateField`'s own map, not `dateInputControlClassName`.
- Pre-existing, not this ticket: `inputFontFloor.test.ts` → "gates every floored
  text control to iOS alone" fails on `../../richtext/src/RichTextEditor.tsx` at
  HEAD (reproduced with this ticket's diff stashed); it arrived with the
  rich-text merge.

## Added scope: Calendar

`packages/core/src/Calendar/styles.ts` still holds four creations
(`calendarStyles`, `monthGridStyles`, and two more), read by `Calendar.tsx` and
`Calendar.test.tsx`. It belongs to this family, so it moves in the same ticket.
Do it last: the calendar's grid geometry is the one place where a row height and
a month grid meet, and the wheel work above already established the variable
pattern (`--astryx-date-wheel-*`) this file should reuse rather than reinvent.

### Session 3 (branch `ticket/16-date-inputs`, merged with the POC twice)

Landed: `DateInput/MonthScroller.tsx` keeps no `stylex.create`.
`dateInputClasses.ts` gained the month-scroller group — `monthScrollerClassName`,
`monthScrollerSpacerClassName`, `monthPaneClassName`, `monthRowClassName`,
`monthCellClassName`, `monthDayClassName`, `monthDayOutsideClassName`,
`monthDayDisabledClassName`, `monthDayPuckClassName`,
`monthDayPuckHoverableClassName`, `monthDayPuckTodayClassName`,
`monthDayPuckSelectedClassName`, plus `dateInputMonthSpacerStyle` and
`dateInputMonthPaneStyle` for the measured geometry. `DateInputTouch.test.tsx`
reads those classes instead of the source text of the maps (five assertions),
and the day-outside/day-disabled parity checks now read Calendar's StyleX
declarations and assert the same colour variable and the same opacity percent
appear in the touch class — they keep following the desktop when it moves.

New private variables: `--astryx-date-pane-inline-start`,
`--astryx-date-pane-inline-size`, `--astryx-date-spacer-inline-size`. They are
measured per element, so they cannot be constants like `--astryx-date-wheel-*`.
They are registered in both `theming.vars[]` lists of `DateInput.doc.mjs`
(`private: true`) and in `VARS_WITHOUT_DERIVED_MAPPING`; `derivedVarRegistry`
and `check:token-docs` are green.

Traps found this session:

- Two plain opacity utilities are ordered by the sheet, not by the class
  attribute: `monthDayOutsideClassName` sets `opacity-50` and the disabled arm
  needs 0.3, so the disabled arm reads `[&[aria-disabled=true]]:opacity-30`.
  The attribute variant wins on specificity at any sheet order.
- The selected puck no longer carries the hover tint beside it: the caller
  applies `monthDayPuckHoverableClassName` only when `!isDisabled && !isSelected`
  (as the StyleX version did by application order). Keeping the hover arm on
  the selected puck would have needed a second, equally specific `:hover` rule
  and sheet order would have decided.
- `font-[var(--font-weight-semibold)]` is emitted BEFORE `.font-medium` in the
  sheet, so it broke the sheet test's "state class later than the base" check
  by adding an earlier occurrence of that declaration. Use the stock
  `font-semibold` / `font-normal` utilities instead of the arbitrary form.
- `grid-template-rows` is a literal: `grid-rows-6` matches
  `dateInputTouchGeometry.paneRows` (`repeat(6, 1fr)`) and `WEEKS_PER_PANE` is
  the same 6, but an interpolated class would emit nothing.
- The day button and the puck need no `mergeProps` except where the shared focus
  ring joins a class: `mergeProps(stylex.props(focusOutlineStyles.focusVisible),
{className})` is the sanctioned shape and passes `no-classname-clobber`.

Left, in order:

1. `NativeDateField.tsx` (`styles` 94, `sizeStyles` 247) and
   `TouchDateField.tsx` (`sizeStyles` 175, `styles` 190) — ONE commit: the
   `sizes the closed field the same on both surfaces` test compares the two
   `sizeStyles` objects textually, and `DateInputTouch.test.tsx` also reads
   `monthArrow:`, `titleChevron:`, the `SWAP_DURATION` counts (6) and the
   linear-fade counts (4) out of `TouchDateField.tsx`'s `styles`. Those
   assertions move first.
2. `Wheel.tsx` (`styles` 120) — `DateInputTouch.test.tsx` reads `scroller`,
   `band`, the `boxSizing: 'border-box'` line and the large-size font from it.
3. `DateTimeInput/TouchDateTimeField.tsx` (175, 189) and
   `DateTimeInput/DateTimeInput.tsx` (170, 286, 301, invalid map 233) — the
   invalid arm moves with `input` and `inputDisabled`, as before.
4. `Calendar/styles.ts` (`calendarStyles` 32, `monthGridStyles` 78,
   `dayCellStyles` 134, `dayCellTheme` 258). `dayCellTheme` publishes private
   variables for the day-cell states; if a class cannot carry it, keep it as a
   `calendarDayCellVars` module of `--astryx-calendar-*` names and say why.

Verified this session: `node packages/core/scripts/build-css-tailwind.mjs`
rebuilds clean at 162.7 kB; the sheet test passes with no ceiling change;
`DateInput` alone is 798 tests green; the wider set is 1532/1533 with the known
`Calendar.calendarSystems.test.tsx` "names each day by the month and day the
grid shows when Intl disagrees" failure, which fails without this diff. `derivedVarRegistry.test.ts` still fails
`TreeList: all source vars are in doc file`, which arrived with the ticket-20
merge and is not this ticket's.

### Session 4 (branch `ticket/16-date-inputs`, merged with the POC again)

Landed: both closed fields' `sizeStyles` maps are gone — `NativeDateField.tsx`
and `TouchDateField.tsx` now join `tw(dateInputSizeClassName({size}),
controlClassName)` in the wrapper's `mergeProps` class slot, the third argument
the helper accepts. The parity test in `DateInputTouch.test.tsx` no longer
compares two source texts; it asserts both files read the one shared call, so
the two surfaces cannot drift apart. `DateInput` is 798 tests green, the wider
set is 1685/1686 with the pre-existing `Calendar.calendarSystems.test.tsx`
failure, the sheet rebuilds at 166.5 kB, and eslint reports only the two
pre-existing findings in `DateInput/__tests__/WheelContrast.a11y.chromium.spec.ts`
and `dateInputClasses.ts`. The changeset still names the same patch.

Read this before the next window: the remaining five files are map-sized, not
edit-sized. `TouchDateField.tsx`'s `styles` map is 373 lines and around a dozen
assertions in `DateInputTouch.test.tsx` read it as source text
(`monthArrow:`, `monthArrowIcon:`, `titleChevron:`, `panelOverlay`,
`panelBeneath`, `weekdays`, `monthArrows`, the `styles.panelBeneath,` /
`styles.panelOverlay,` counts, the six `transitionDuration: SWAP_DURATION`
occurrences, the one eased and four linear timing functions, `width="100%"`
twice, and the section insets). Each needs a class to assert against before the
map moves, exactly as the month scroller did; budget one window for
`TouchDateField.tsx` alone. `Wheel.tsx` carries its own keyframes
(`tip`, `tipAndDim`, `dim`, `fade`) — check whether the sheet has a
keyframes home for a class-based animation before starting it, because four
`stylex.keyframes` calls do not translate to utilities. `NativeDateField.tsx`
`styles` is the mechanical one (14 objects, no cross-file test), and
`Calendar/styles.ts` stays last.

Still open, in order: `NativeDateField.tsx` `styles`, `TouchDateField.tsx`
`styles`, `Wheel.tsx`, `DateTimeInput/TouchDateTimeField.tsx`,
`DateTimeInput/DateTimeInput.tsx` (+ the `/\.inputInvalid\b/` assertion), then
`Calendar/styles.ts`.

### Session 5 (branch `ticket/16-date-inputs`, merged with the POC twice)

Landed: `DateInput/NativeDateField.tsx` keeps no `stylex.create` for its 11
objects. `dateInputClasses.ts` gained `nativeDateFieldWrapperClassName`,
`nativeDateFieldIconButtonClassName`, `nativeDateFieldInputClassName`,
`nativeDateFieldInvalidTextClassName`, `nativeDateFieldSlotClassName`,
`nativeDateFieldOverlayClassName`, `nativeDateFieldOverlayValueClassName` and
`nativeDateFieldOverlayPlaceholderClassName`. The component still spreads the
shared `focusOutlineStyles` ring and the `inputWrapperStyles` frame from StyleX;
its own paint is the class. `inputFontFloor.test.ts` now lists
`DateInput/dateInputClasses.ts` alone for this surface,
`DateInputTouch.test.tsx`'s parity test matches the shared size call with a
whitespace-tolerant pattern, and the sheet's coverage block walks the input's
three flags. `DateInput` is green; the wider set is 1692/1693 with the known
`Calendar.calendarSystems.test.tsx` failure; the sheet rebuilds at 168.7 kB
after the merge brought the Skeleton classes; typecheck passes.

Traps found this session:

- `NativeDateField.test.tsx` read declarations through a `rulesFor()` helper
  that scans `document.styleSheets` for the element's class names — that only
  sees StyleX's injected rules. Three tests (`hides the engine's own text`,
  `bounds the overlay`, `paints the formatted date again`) asserted through it
  and had to become `expectClassSet`/`classesOf` assertions; the helper is
  gone. Any remaining `.tsx` with such a helper needs the same move before its
  map leaves.
- Two plain colour utilities on one element are ordered by the sheet, so the
  rejected arm is not an extra class beside the base one: the input's class
  expresses the colour once, as a ternary. `[&[aria-invalid=true]]:` would have
  recoloured text for a caller `error` status too, which the StyleX rule did
  not.
- The `sizes the closed field the same on both surfaces` parity test matched
  the exact one-line text `tw(dateInputSizeClassName({size}), controlClassName)`.
  Adding the wrapper class to that call made prettier wrap it and the test went
  red after the commit. Run `DateInputTouch.test.tsx` before every commit that
  touches either closed field; the assertion now matches a pattern, not a line.
- The Tailwind build scans `src/**/*Classes.ts`, so a class added there needs no
  input-stylesheet edit; only the coverage block in the sheet test wants the new
  arms.

Still open, in order: `TouchDateField.tsx` `styles` (`DateInputTouch.test.tsx`
reads about a dozen facts out of its source text: `monthArrow:`,
`monthArrowIcon:`, `titleChevron:`, `panelOverlay`, `panelBeneath`,
`weekdays:`, `monthArrows:`, the section insets, and the `SWAP_DURATION`
counts), `Wheel.tsx` (its four keyframes plus the source-text reads at
`DateInputTouch.test.tsx` — `scrollSnapType`, `scrollSnapAlign`, the
`animation-timeline` and reduced-motion arms), `DateTimeInput/TouchDateTimeField.tsx`,
`DateTimeInput/DateTimeInput.tsx` (with the `/\.inputInvalid\b/` assertion and
the `input`/`inputDisabled`/`inputInvalid` triple), then `Calendar/styles.ts`.
