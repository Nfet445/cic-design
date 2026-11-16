---
schema_version: 1
template_version: 2
kind: family
id: family:data-tables
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [behavior, layout, theming, accessibility, public-api]
verified_by:
  [
    packages/core/src/Table/Table.test.tsx,
    packages/core/src/Table/TableHeaderCell.test.tsx,
    packages/core/src/Table/TableHoverWindow.test.tsx,
    packages/core/src/Table/TableRowContext.test.tsx,
    packages/core/src/Table/TableWindowFallback.test.tsx,
    packages/core/src/Table/TableSelectionToolbar.test.tsx,
    packages/core/src/Table/plugins/selection/useTableSelection.test.tsx,
    packages/core/src/Table/plugins/stickyColumns/useTableStickyColumns.test.tsx,
    packages/core/src/Table/plugins/virtualization/useTableRowsVirtualization.test.tsx,
    packages/core/src/Table/plugins/virtualization/useTableWindow.test.tsx,
    packages/core/src/Table/__tests__/Table.a11y.test.tsx,
    packages/core/src/Table/__tests__/TableCellMenus.a11y.browser.spec.ts,
    packages/core/src/Table/__tests__/TableRowGlide.a11y.browser.spec.ts,
    packages/core/src/Table/__tests__/TableStickyDividers.a11y.browser.spec.ts,
    packages/core/src/Table/__tests__/TableVirtualization.release.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
  ]
members:
  [
    component:Table,
    component:TableHeader,
    component:TableHeaderCell,
    component:TableRow,
    component:TableCell,
    component:TableBody,
    component:TableFooter,
    component:TableSelectionToolbar,
  ]
architecture:
  [
    architecture:component-theming-surface,
    architecture:container-padding,
    architecture:list-windowing,
    architecture:public-component-api,
  ]
contributing: []
deciding_specs: [spec:AST-119/DEC-3]
applies_to: [packages/core/src/Table]
---

# Data table family contract

## Intent

People should read one table surface whether it is composed by hand from
sections, rows, and cells or rendered from `data` and `columns`. Members share
one set of appearance axes, one divider model, one pinned-column model, one
selection column, and one windowed body. A cell stays inside its column, a row
paints only its own state, and the header states what each column holds.

The shared axes are `density`, `dividers`, `isStriped`, `hasHover`,
`textOverflow`, and `verticalAlign`. Each member reads them from the table
context instead of accepting a private copy, so a header cell and the body cell
below it answer the same question the same way.

## Membership rule

A component belongs when its primary purpose is to render one part of a native
table — its surface, a section, a row, a cell, a range of cells, or the
selection column that a table plugin inserts into those cells — and it must
follow the table's shared appearance axes and divider model.

- **Members:** Table, TableHeader, TableHeaderCell, TableRow, TableCell,
  TableBody, TableFooter, and TableSelectionToolbar.
- **Collaborators:** the Table plugins (`useTableSelection`,
  `useTableStickyColumns`, `useTableColumnResize`, `useTableRowsVirtualization`,
  and their siblings) supply cell props, row props, and columns through the
  plugin pipeline without joining the family; `Toolbar` and `Button` supply the
  selection toolbar's presentation; `CheckboxInput` supplies a selection cell's
  control; `ContextMenu` and `DropdownMenu` supply a cell's menu content.
- **Excluded:** Sheet and Card grids that arrange content without table
  semantics, and `Toolbar` itself, whose contract belongs to
  `family:layout-regions` and `family:action-groups`. A component that renders a
  table-shaped layout for another purpose, such as a comparison card, keeps its
  own family.

Membership follows rendered table responsibility, not the use of a `<table>`
element or an import of the family.

## Shared owner

- The table root is owned by Table: it owns the appearance axes, the plugin
  pipeline, the `table` theme target, the observed scroll wrapper, and the
  choice between `children` composition and `data`/`columns` rendering.
- The appearance axes are owned by the table context. Every member resolves
  `density`, `dividers`, `isStriped`, `hasHover`, `textOverflow`, and
  `verticalAlign` from it, and a member outside a table renders unstyled.
- Divider geometry is owned by the cells: a body cell draws the row divider and
  the column divider its table asks for, and a header cell follows the same
  axis rules with one addition of its own.
- The pinned-column model is owned by `useTableStickyColumns`, which sets
  `position: sticky` and the logical inline offset on the header cell and the
  body cell of the same column, and carries the row divider under a pinned cell.
- The windowed body is owned by Table's admission and rendering, not by the
  window planner; `useTableRowsVirtualization` supplies geometry intent only.
- The selection column is owned by `useTableSelection`, which inserts one column
  through the same header-cell and body-cell path as any other column.

## Canonical concepts

| Concept          | Values or states                                                                                      | Default semantics                                                                                                       | Stability                  |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| composition mode | `children`, `data` with `columns`                                                                     | `children` renders no section of its own; `data` renders the header row, body rows, and the empty state                 | shipped family distinction |
| density          | `compact`, `balanced`, `spacious`                                                                     | `balanced`; padding and label type scale move together, and the resolved value is on `data-density` for both cell kinds | shipped family axis        |
| divider axis     | `rows`, `columns`, `grid`, `none`                                                                     | `rows`; a header cell always draws its bottom divider, and the last cell of a run draws no trailing divider             | shipped family axis        |
| surface target   | `table`, `table-header`, `table-body`, `table-footer`, `table-row`, `table-cell`, `table-header-cell` | each part carries its own stable theme target class, and `table-cell` and `table-header-cell` add the `density` state   | shipped family rule        |
| row state        | rest, striped, hovered, selected                                                                      | striping and hover apply to body rows only; the row publishes its current fill as `--table-row-overlay`                 | shipped family rule        |
| pin              | none, `start`, `end`                                                                                  | a pinned column pins its header cell and its body cells at one logical inline offset, with the pinned side's shadow     | shipped family axis        |
| window           | full body, windowed body                                                                              | full body unless a valid virtualization capability is admitted; a refused capability falls back to the full body        | shipped family distinction |
| selection        | none, some, all                                                                                       | the plugin prepends one column; the header cell selects all, each body cell selects its row                             | shipped family axis        |

## Cross-component invariants

- **FR1 — The table names its own sections.** Table renders one `<table>` with
  the `table` theme target and a scroll wrapper with the `table-scroll-wrapper`
  target. A section member renders `thead`, `tbody`, or `tfoot` with its own
  target and forwards the rest of its HTML attributes. In `children` mode the
  caller supplies every section, and Table renders none of its own. In `data`
  mode Table renders the header row and numbers the body rows for assistive
  technology only when the caller supplies `rowCount` or `rowIndexStart`.
- **FR2 — A header cell states the column it names.** TableHeaderCell renders a
  `th` with the `table-header-cell` target and the table's resolved `density`
  state. It uses the header label weight and secondary text color, takes its
  padding from the table's density, and always draws its bottom divider, even
  when the table's divider axis draws no row dividers. It draws a column divider
  only when the axis includes columns, and the last header cell of the row
  zeroes it. It sets `scope` only when the caller passes one; `data` mode sets
  `scope="col"` on every generated column header. A header cell truncates its
  label whatever `textOverflow` says, and a string label carries a `title`
  attribute. Outside a table it renders unstyled.
- **FR3 — A body row paints only its own state.** TableRow renders a `tr` with
  the `table-row` target and marks itself so a cell's ancestor selectors match
  only its own row. Striping and hover apply to body rows and never to a header
  row. When the row knows its logical index, striping follows that index's
  parity; otherwise it counts body rows and excludes an appended row-expansion
  panel from the count. Hover is limited to a device with a fine pointer and
  skips a disabled row. The row publishes its current fill as
  `--table-row-overlay` so a pinned cell can replay it. When the table draws row
  dividers, the row carries the divider that glides with it.
- **FR4 — A body cell holds content within its column.** TableCell renders a
  `td` with the `table-cell` target and the resolved `density` state, takes the
  same density padding as a header cell, and applies `textOverflow` by truncating
  or wrapping its content. It draws the row divider and the column divider its
  table asks for, removes the row divider in the last body row, and publishes
  the width of the divider it draws as a private variable for a pinned cell to
  match. When the cell owns a context menu, it moves its padding onto a trigger
  that fills the whole cell, so a press anywhere in the cell opens the menu and
  the cell keeps its row height.
- **FR5 — A pinned header cell stays with its column.** A pinned column sets
  `position: sticky` and the logical inline offset on its header cell and on its
  body cells, computed from the rendered widths of the contiguous pinned
  columns before it. The pinned cell paints an opaque sticky base and replays the
  row's fill from `--table-row-overlay`, so the row's striping, hover, and
  selection wash continue under the pinned column. The pinned header cell stacks
  above the pinned body cells, which stack above the unpinned cells, and the
  pinned side paints a shadow over the scrolling region. The pinned header cell
  draws the divider that the row beneath it shows, and follows a border that a
  theme, a CSS state, or a later change puts on that row. Pinning composes with
  column resizing in either plugin order.
- **FR6 — Selection adds one column through the same cell path.** `useTableSelection`
  prepends one column that renders a header cell selecting every row and a body
  cell selecting its row, through the same header-cell and body-cell path as
  every other column. The header control names itself "Select all rows", and a
  row control names itself "Select row", or the label `getRowLabel` derives. A
  row that is not selectable renders no control, and a disabled row renders a
  disabled one. A selected row carries `aria-selected="true"` and the
  `table-row` target's `selected` theme state, and paints the accent wash unless
  the caller turns the row highlight off; the wash is published as
  `--table-row-overlay` so pinned cells replay it. TableSelectionToolbar renders
  nothing without a selection and otherwise shows the selected count and a
  command that clears the whole selection; the plugin itself renders no product
  chrome.
- **FR7 — A windowed body keeps whole-table semantics.** An admitted
  virtualization capability plans the mounted window before constructing any
  cell, renders the window as native table rows, and keeps the row metadata
  truthful for the whole data set. The first frame is seeded from
  `initialViewportHeight` and sizes nothing; the table takes its height from its
  parent. A capability that the hook did not make, an identity that is missing or
  duplicated, a parent without a height, or geometry that is not a positive
  finite size renders the full body instead, reports one diagnostic for that
  reason, and keeps the focused selection control on the same keyed row. Without
  a capability the body renders in full and no diagnostic is reported.
- **FR8 — Appearance axes resolve once, in the table.** A member reads
  `density`, `dividers`, `isStriped`, `hasHover`, `textOverflow`, and
  `verticalAlign` from the table context and exposes no private copy of an axis.
  The resolved density appears as `data-density` on both cell kinds, so one theme
  rule reaches a header cell and a body cell alike. A member outside a table
  renders without family styling.
- **FR9 — A caller's style wins, the theme target stays.** A member applies the
  family context styles first, then the `xstyle` slot that the plugin pipeline
  and the caller fill in composition order, then the caller's `className` and
  `style`. A caller's value therefore overrides a family value, and the
  member's stable theme target class stays applied either way.

## Allowed component variation

- **AV1 — Who supplies a section.** In `children` mode the caller composes
  TableHeader, TableBody, TableFooter, TableRow, and TableCell, because an HTML
  parser would otherwise insert an implied section that React does not. In `data`
  mode Table renders those parts itself.
- **AV2 — Header truncation.** A header cell truncates its label regardless of
  `textOverflow`, because a column label that wraps changes the header height for
  every row. A body cell follows `textOverflow`.
- **AV3 — Column declaration.** A column's width, alignment, and minimum width
  are declared once on the column and applied by the cell, so a cell does not
  carry a private alignment axis.
- **AV4 — Standalone rendering.** TableRow, TableCell, TableHeaderCell, and the
  section members render their element without family styling when no table
  context is present, which lets a caller reuse them in a composed table.
- **AV5 — Product chrome.** TableSelectionToolbar is a product-composed surface
  that stays outside the plugin: the caller owns its actions and placement, and
  the component owns the counted selection label and the clear command.
- **AV6 — Cell menu content.** A cell may own a context menu supplied through the
  table's actions, and the menu content belongs to that menu component rather
  than to the cell.

## Representative matrix

| Member and state                                  | Shared invariant                                                     | Deliberate variation                                                 |
| ------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `component:Table` / `data` mode                   | one table surface, resolved appearance axes, windowed or full body   | renders sections, the header row, the empty state, and row numbering |
| `component:Table` / `children` mode               | same surface and axes; sections belong to the caller                 | `table-layout: auto`; no generated header or empty state             |
| `component:TableHeader` with `TableHeaderCell`    | header target, density padding, label type, always-on bottom divider | `scope` is the caller's; labels truncate                             |
| `component:TableBody` with `TableRow`/`TableCell` | body targets, row state, divider axes, `textOverflow`                | row parity from the logical index; cell menu relocation              |
| pinned column via `useTableStickyColumns`         | sticky base, overlay replay, carried divider, pinned side shadow     | `start` or `end` edge; header cell stacks above body cells           |
| selection column via `useTableSelection`          | one prepended column, named controls, selected state and wash        | row label source, `hasRowHighlight`, toolbar composition             |
| windowed body via `useTableRowsVirtualization`    | native rows, truthful metadata, one admitted geometry                | window plan and measured row height; full-body fallback              |

## Adoption and exceptions

| Component                         | Current adoption                                                                   | Gap or exception |
| --------------------------------- | ---------------------------------------------------------------------------------- | ---------------- |
| `component:Table`                 | owns the axes, plugin pipeline, scroll wrapper, and the body/mode decision         | none             |
| `component:TableHeader`           | renders `thead` with the `table-header` target and forwards its attributes         | none             |
| `component:TableHeaderCell`       | reads the table's axes; owns label type, truncation, and the bottom divider        | none             |
| `component:TableRow`              | reads the table's axes; owns row state, overlay publication, and the glide divider | none             |
| `component:TableCell`             | reads the table's axes; owns divider geometry, overflow, and menu relocation       | none             |
| `component:TableBody`             | renders `tbody` with the `table-body` target and forwards its attributes           | none             |
| `component:TableFooter`           | renders `tfoot` with the `table-footer` target and forwards its attributes         | none             |
| `component:TableSelectionToolbar` | reads the shared selection state and renders count plus clear                      | none             |

## Verification map

| Contract | Verification                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Representative members and states                                                            | Mutation or failure expectation                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| FR1      | `packages/core/src/Table/Table.test.tsx` (section structure, `scope`, section rest forwarding, ARIA row numbering); `packages/core/src/Table/__tests__/Table.a11y.test.tsx` (per-state row, header, and cell inventory)                                                                                                                                                                                                                                                                          | data mode, children mode, empty data, paginated numbering                                    | a section renders twice, a generated header loses `scope`, or a children-mode table grows an owned `thead` |
| FR2      | `packages/core/src/Table/TableHeaderCell.test.tsx` (padding per density, label type, bottom divider with dividers off, column divider axes, last cell, `xstyle`, ref, attributes); `packages/core/src/theme/themingTargets.test.ts`                                                                                                                                                                                                                                                              | three densities, four divider axes, standalone header cell                                   | a header cell loses its bottom divider, wraps a label, or drops its theme target                           |
| FR3      | `packages/core/src/Table/Table.test.tsx` (row attributes, header row without hover, appearance props); `packages/core/src/Table/TableHoverWindow.test.tsx` (logical parity under windowing); `packages/core/src/Table/TableRowContext.test.tsx` (a row keeps its current position after a re-sort); `packages/core/src/Table/__tests__/TableRowGlide.a11y.browser.spec.ts` (divider moves with its row, pinned cells included)                                                                   | striped, hovered, expanded panels, disabled rows, windowed rows                              | a header row takes hover, an open panel flips the stripe, or a windowed row loses its parity               |
| FR4      | `packages/core/src/Table/Table.test.tsx` (cells, overflow, vertical alignment); `packages/core/src/Table/__tests__/TableCellMenus.a11y.browser.spec.ts` (full-cell menu press, row height); `packages/core/src/Table/__tests__/TableStickyDividers.a11y.browser.spec.ts` (carried divider width)                                                                                                                                                                                                 | three densities, truncate and wrap, last body row, cell with a context menu                  | a last-row divider reappears, a wrapped cell changes row height, or a menu opens on part of the cell       |
| FR5      | `packages/core/src/Table/plugins/stickyColumns/useTableStickyColumns.test.tsx` (offsets, body cells, no-op config, resize composition, key changes); `packages/core/src/Table/__tests__/TableStickyDividers.a11y.browser.spec.ts` (divider, shadow, theme and state borders, mode switch)                                                                                                                                                                                                        | start and end pins, one and many pinned columns, resized and rerendered tables               | a pinned column stops pinning, the row fill stops under the pin, or the divider under a pin diverges       |
| FR6      | `packages/core/src/Table/plugins/selection/useTableSelection.test.tsx` (named controls, toggles, selected state, overlay, non-selectable and disabled rows, prepended cells); `packages/core/src/Table/TableSelectionToolbar.test.tsx`                                                                                                                                                                                                                                                           | none, some, all selected; row highlight on and off; labelled and unlabelled rows             | a row control loses its name, the wash stops reaching pinned cells, or the toolbar renders empty           |
| FR7      | `packages/core/src/Table/plugins/virtualization/useTableWindow.test.tsx` (bounded ranges and anchor retention); `packages/core/src/Table/plugins/virtualization/useTableRowsVirtualization.test.tsx` (planning at 100k, seeded first frame, parent height, identity and content fallbacks); `packages/core/src/Table/TableWindowFallback.test.tsx` (one diagnostic per reason, kept focus, owned wrapper); `packages/core/src/Table/__tests__/TableVirtualization.release.a11y.chromium.spec.ts` | 100k rows, unsized parent, duplicate ids, replaced scroll wrapper, focused selection control | a full intermediate body renders, metadata lies about the window, or a fallback drops the focused control  |
| FR8      | `packages/core/src/Table/Table.test.tsx` (density and divider axes on cells and header cells, combined appearance props); `packages/core/src/Table/TableHeaderCell.test.tsx` (context padding and dividers)                                                                                                                                                                                                                                                                                      | every axis value, standalone members                                                         | a member keeps a private axis, or `data-density` disagrees with the painted padding                        |
| FR9      | `packages/core/src/Table/Table.test.tsx` (row and root `className`/`style`, canonical theme class kept); `packages/core/src/Table/TableHeaderCell.test.tsx` (`xstyle` precedence, theme class kept)                                                                                                                                                                                                                                                                                              | caller `xstyle` array, `className`, `style`, plugin styles                                   | a caller value is dropped, or the theme target class disappears                                            |

## Decision links

- `spec:AST-119/DEC-3` — the class map module holds the utility vocabulary that
  each surface's styling resolves through.

## Open questions

- **OQ1 — Does a header row stay in view when the body scrolls vertically?**
  (`human-design`) The family's sticky path pins a header cell with its column.
  No member pins the header row itself.

## Content boundary

This file owns only cross-component table behavior: the composition modes, the
appearance axes, the divider model, the pinned-column and selection columns, and
the windowed body. Component-specific prop tables, column width algorithms, the
plugin pipeline's transform contract, the window planner's geometry, consumer
docs, the selection state hook's API, and menu content remain with their
component, module, architecture, design, or spec owners.
