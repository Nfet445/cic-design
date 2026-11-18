# table row and body cell

Status: done
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

## Result

Landed on `ticket/37-table-row-and-cell`, cut from the top of
`poc/tailwind-layout-primitives`, and merged there as `5728e466a` and
`126868d97`:

- `tableRowClasses.ts` (new) — `tableRowClassName({hasHover, hasKnownPosition,
isStriped})` paints one surface: the stripe
  (`[&:nth-child(even_of_:not([data-expansion-panel]))]:bg-…`), the stripe of a
  row that knows its own parity by logical index, or the fine-pointer hover
  tint. Every arm also publishes `--table-row-overlay`, the variable a pinned
  cell replays over its opaque background (`d4f445a6a`).
- `tableCellClasses.ts` — density padding (`py-1 px-2` … `py-3 px-4`), container
  edge inset, body text, vertical alignment, wrap and truncate, the column and
  row dividers, and the last-row reset that zeroes
  `--_table-row-divider-width`. `TableHeaderCell` reads the same density
  helpers, so a density change has one owner (`d4f445a6a`).
- Tests: `TableRow.test.tsx` and `TableCell.test.tsx` assert class sets through
  `classesOf`/`expectClassSet`. Four assertions moved off computed style and
  `document.styleSheets`: the cell's vertical alignment, the row's transition
  property, the `wrapStyles`/`overflowStyles` debug class names, and the striped
  row rule; `Layout/tailwindStylesheet.source-build.test.mjs` now pins
  `align-*`, the transition duration and easing, `overflow-wrap`/`word-break`
  with `text-ellipsis`, and the stripe (`49a5c7041`).
- `pnpm exec vitest run packages/core/src/Table` — 49 files, 935 passed;
  the sheet test — 54 passed, sheet 173.7 kB inside the 1260-rule ceiling; the
  four theme guards — 700 passed. The ceiling did not move.

What stays in StyleX, and why:

- `glidingDividerStyles` (`glidingDivider.ts`) keys off the
  `data-astryx-cell-gliding` attribute the plugin sets while a row moves, and is
  shared with the plugin.
- The context-menu trigger wrapper: `ContextMenu`'s `triggerXstyle` accepts only
  a StyleX value, so `TableCell`'s density padding on the wrapper stays in
  `contextTriggerStyles` until `ContextMenu` carries class names.
- `tableRowMarker`, the scoped marker for ancestor selectors.

The plugin-owned row pieces — the selection wash, the pinned-column shadow and
its divider carry — belong to `42-table-plugin-styles`.
