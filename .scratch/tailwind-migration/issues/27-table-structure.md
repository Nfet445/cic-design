# table structure

Status: ready-for-agent
Blocked by: 26
Wave: 8
Family: `family:data-tables`
Ticket: 27

## What

First table slice: header, header cell, row and cell styling.

## Files

- `packages/core/src/Table/BaseTable*`
- `packages/core/src/Table/TableHeader*`
- `packages/core/src/Table/TableRow*`
- `packages/core/src/Table/TableCell*`

## Done when

- Row striping comes from `:nth-child`, not from an index, as `docs/design` asks.
- Sticky header offsets keep their computed values.

## Verification

- `pnpm exec vitest run packages/core/src/Table`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
