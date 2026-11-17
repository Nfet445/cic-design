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
