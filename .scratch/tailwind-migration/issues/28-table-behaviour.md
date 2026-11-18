# table behaviour

Status: done
Blocked by: 27
Wave: 8
Family: `family:data-tables`
Ticket: 28
Parent: `00-epic-stylex-to-tailwind-4`

## What

Second table slice: sorting, filtering, selection, and the virtualised body.

## Files

- `packages/core/src/Table/** (remaining)`

## Done when

- `Table/` reaches zero `stylex.create`.
- The family page shows a virtualised body and a filtered header.

## Verification

- `pnpm exec vitest run packages/core/src/Table`
- `node packages/core/scripts/build-css-tailwind.mjs`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Closing notes

- Sorting, filtering, row selection and the virtualised body landed: `8eba1265d`, `6f35a63a9`, `5d12e988d`, merged as `4aab023ff`; `pnpm exec vitest run packages/core/src/Table` is green.
- The ticket's "zero `stylex.create`" line was not reachable inside it: 27 remain in `Table/`, and each has an owner. `BaseTable.fixedRow`, `TableCell` and `TableRow` are ticket 37 and 42; `TableHeaderCell.headerTriggerStyles` waits for `ContextMenu` to take class names (ticket 23); `focusOutlineStyles.focusVisible` is the shared module in ticket 41; the 21 plugin creations are ticket 42.
