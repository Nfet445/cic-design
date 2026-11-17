# table plugins and the cells they borrow

Status: ready-for-agent
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
