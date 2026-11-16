# data tables record

Status: done
Blocked by: —
Wave: 8
Family: `family:data-tables`
Ticket: 26
Parent: `00-epic-stylex-to-tailwind-4`

## What

Write `docs/families/data-tables.md` before touching `Table/`: 53 `stylex.create` in 33 files and no current record names it.

## Files

- `docs/families/data-tables.md (new)`
- `docs/families/README.md`

## Done when

- The record states members, functional requirements for header, header-cell, row, cell and the sticky and virtualised paths, and the checks that prove them.
- `docs/families/README.md` links it.
- `pnpm check:knowledge` passes.

## Verification

- `pnpm check:knowledge`
- `pnpm specs:for packages/core/src/Table`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
