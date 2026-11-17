# table plugins and the cells they borrow

Status: done
Blocked by: 23, 41
Wave: 8
Ticket: 42
Parent: `00-epic-stylex-to-tailwind-4`

## What

Move the StyleX that ticket 28 could not: 27 `stylex.create` blocks left in `Table/`.

- the 21 in `Table/plugins/**` — `rowExpansion` 6, `columnResize` 3, `table.stylex.ts` 3, `stickyColumns` 2, and one each in `tree`, `rowStatus`, `rowIndex`, `pagination`, `infiniteScroll`, `groupedRows`, `glidingDivider`;
- `BaseTable.tsx`'s `fixedRow: (height) => ({height})`, whose height rides the row's `xstyle` channel and so waits for `TableRow` (ticket 37);
- `TableHeaderCell.tsx`'s `headerTriggerStyles.unpositioned`, which needs `ContextMenu` to accept class names (ticket 23);
- `Table.tsx` and the scroll wrapper read `focusOutlineStyles.focusVisible` from the shared module that ticket 41 owns.

## Why it waits

Two of the blockers are not about the table at all: a class-based `ContextMenu` does not exist yet, and the shared focus module cannot move while its consumers paint the same property through StyleX. The plugin maps also read cell and row internals that ticket 37 finishes.

## Done when

- `rg "stylex.create" packages/core/src/Table` returns nothing outside deprecated shims.
- The package stylesheet test covers every class the plugin maps emit.
- The plugin suites (row expansion, column resize, sticky columns, tree, pagination, infinite scroll, grouping) are green, and any assertion that read a computed style or a StyleX debug class moved to the class set.

## Verification

- `pnpm exec vitest run packages/core/src/Table`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Comments

- 2026-11-17: closed. Every plugin under `packages/core/src/Table/plugins/**` draws its paint from a literal class map: row index, status marker, pagination, grouped rows, tree, infinite scroll, row expansion, column resize (handle, indicator, header row and cell), filtering, sorting and selection.
- `BaseTable`'s fixed row height left StyleX in `c977443bb`: the row now takes `FIXED_ROW_HEIGHT_CLASS` plus an inline `--astryx-table-row-height`, and `className` merges `rowHtml.className` so a plugin's own class survives.
- Survivors, each named in its file: `packages/core/src/Table/TableCell.tsx:64` (`contextTriggerStyles`, because `ContextMenu`'s `triggerXstyle` accepts a StyleX value only), `packages/core/src/Table/TableHeaderCell.tsx:53` (`headerTriggerStyles.unpositioned`, same trigger contract), `packages/core/src/Table/glidingDivider.ts:57` (the divider keys off `data-astryx-row-gliding`/`data-astryx-cell-gliding`, and the cell's own transparent arm has to outrank the row's paint), and `packages/core/src/Table/table.stylex.ts` plus the two `stylex.when.ancestor` reads in `stickyColumns` and `rowExpansion` (ticket 07 flips the markers).
- Tests: `packages/core/src/Table/plugins/columnResize/useTableColumnResize.test.tsx` still reads the header's inline `width`/`maxWidth`, which the plugin writes itself during a drag; 935 Table tests pass.
