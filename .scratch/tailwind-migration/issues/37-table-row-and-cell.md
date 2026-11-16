# table row and body cell

Status: ready-for-agent
Blocked by: —
Wave: 8
Ticket: 37
Parent: `00-epic-stylex-to-tailwind-4`

## What

Finish the table slice ticket 27 started: migrate `TableRow` (5 `stylex.create`) and `TableCell` (9 `create`) onto the class maps `tableCellClasses.ts` already carries, and close the two clauses of the family record that stay open until they migrate — row striping (FR3) and the sticky header offset (FR5).

## Files

- `packages/core/src/Table/TableRow.tsx`
- `packages/core/src/Table/TableCell.tsx`
- `packages/core/src/Table/tableRowClasses.ts` (new)
- `packages/core/src/Table/tableCellClasses.ts`
- `packages/core/src/Table/TableRow.test.tsx`, `TableCell.test.tsx`

## Done when

- Row striping (`:nth-child`) and the selected-row surface come from classes, not a `stylex.create` block.
- The body cell reuses `tableCellClasses.ts` so a density change has one owner.
- The sticky-header and sticky-column offsets keep reading `--_table-row-divider-width`.
- Tests assert classes and variables; the stylesheet test's covered set gains every new literal.

## Verification

- `pnpm exec vitest run packages/core/src/Table`
- `pnpm exec vitest run packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `node packages/core/scripts/build-css-tailwind.mjs` (sheet only grows by the new literals)

## Notes

- Ticket 27 migrated `TableHeaderCell` only; `TableRow` and `TableCell` were left because together they own 14 `stylex.create` calls, above the ticket cap.
- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
