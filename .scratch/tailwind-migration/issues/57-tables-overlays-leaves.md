# tables, overlays and remaining leaves

Status: ready-for-agent
Blocked by: 54, 55
Wave: 10
Ticket: 57
Parent: `00-epic-stylex-to-tailwind-4`

## What

The per-component maps that survive because they feed a seam that still takes a StyleX value, plus a
handful of one-map leaves.

## Measured scope

- `packages/core/src/Table/Table.tsx` and its plugins: `table.stylex.ts` 3,
  `plugins/stickyColumns/useTableStickyColumns.tsx` 2, `Table/TableCell.tsx` 1 (`contextTriggerStyles`),
  `Table/TableHeaderCell.tsx` 1 (`headerTriggerStyles.unpositioned`), `Table/glidingDivider.ts` 1.
  The first two wait on `ContextMenu`'s `triggerXstyle`.
- `packages/core/src/Resizable/ResizeHandle.tsx` 2, `SideNav/SideNavItem.tsx` 2, `SideNav/SideNav.tsx` 1,
  `AppShell/AppShell.tsx` 1, `Layer/useLayer.tsx` 1, `Layout/layoutReset.ts` 1,
  `Breadcrumbs/BreadcrumbItem.tsx` 1, `DropdownMenu/DropdownMenuSubMenu.tsx` 1,
  `hooks/anchoredHint.tsx` 1, `hooks/useScrollableArea.ts` 1, `hooks/containerReveal.stylex.ts` 1.
- Motion and safe-area modules: `BottomSheet/bottomSheetPanelMotion.stylex.ts`,
  `bottomSheetStackMotion.stylex.ts`, `AlertDialog/alertDialogTouchMotion.stylex.ts`,
  `Drawer/drawerContentSafeArea.stylex.ts`, `Dialog/dialogFullscreenSafeArea.stylex.ts`,
  `ProgressBar/progressBarFill.stylex.ts`, `Thumbnail/thumbnailRemoveButtonOverrides.stylex.ts`.

## Done when

- `rg "stylex.create" packages/core/src --glob '!*.test.*' --glob '!__tests__/**'` returns nothing
  outside the modules ticket 56 decides to keep.
- Every `ContextMenu`-shaped seam either takes a class or names why it cannot.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src/{Table,Resizable,SideNav,AppShell,Layer,Breadcrumbs,DropdownMenu,AutoSizer} packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Notes

- Follow `.scratch/tailwind-migration/README.md`; the sheet test always conflicts, so keep both sides
  at statement level and raise the ceiling only against a measured count.

## Comments — window 1 salvage

`b30582f49` removed the dead cell maps, `90ed8943c` moved the breadcrumb menu
surface to classes, and the window's uncommitted slice became
`ac28ec67d refactor(scrollable-area): отдать переполнение осям через переменные`
(the hook writes `--astryx-scrollable-overflow-x` / `-y` and the viewport reads
them through `[overflow-x:var(…)]`; the utility form `overflow-x-[var(…)]`
emitted no rule at all, which is now a recorded trap).

Already done before this ticket: the Table context-menu trigger is a class
(`packages/core/src/Table/TableCell.tsx:108` `triggerClassName`,
`packages/core/src/Table/tableContextMenu.tsx:109`), because
`ContextMenu` has carried `triggerClassName` since it was migrated.

Left: `Table/plugins/stickyColumns/useTableStickyColumns.tsx` (2 maps),
`Table/glidingDivider.ts` (3 maps, attribute-descendant arms),
`Table/table.stylex.ts` (markers only), `DropdownMenu/DropdownMenuSubMenu.tsx`
`triggerStyles.caret` (a `className`-only wrapper, which
`@astryx/no-style-only-wrapper` rejects), and the motion/safe-area modules
(`BottomSheet/bottomSheetPanelMotion.stylex.ts`,
`bottomSheetStackMotion.stylex.ts`, `AlertDialog/alertDialogTouchMotion.stylex.ts`,
`Drawer/drawerContentSafeArea.stylex.ts`, `Dialog/dialogFullscreenSafeArea.stylex.ts`,
`ProgressBar/progressBarFill.stylex.ts`,
`Thumbnail/thumbnailRemoveButtonOverrides.stylex.ts`).

## Comments — survivors after windows 1 and J

These stay on StyleX, each for a measured reason:

- `packages/core/src/ProgressBar/progressBarFill.stylex.ts` — the fill paints one declaration group
  under `:dir(rtl)`, `pointer: coarse`, `forced-colors: active` and `prefers-reduced-motion: reduce`
  at once. A forced-colors utility and a coarse one have the same specificity, and Tailwind fixes the
  variant order, so the forced-colors `width`/`transform`/`transition-property` trio cannot be made
  to win; StyleX raises a conditional rule and negates later keys against earlier ones.
- `packages/core/src/Drawer/drawerContentSafeArea.stylex.ts` and
  `packages/core/src/Dialog/dialogFullscreenSafeArea.stylex.ts` — both compose padding with
  `env(safe-area-inset-*)` on an element whose padding a `astryx-base` class already sets, so a class
  would only tie.
- `packages/core/src/DropdownMenu/DropdownMenuSubMenu.tsx` `triggerStyles.caret` — a `className`-only
  wrapper, which `@internal/eslint-plugin-astryx/no-style-only-wrapper.js` rejects.
- `packages/core/src/Table/table.stylex.ts` — StyleX markers, not paint (ticket 07).
- `packages/core/src/BottomSheet/bottomSheetPanelMotion.stylex.ts`,
  `bottomSheetStackMotion.stylex.ts`, `AlertDialog/alertDialogTouchMotion.stylex.ts` — animation arms
  whose `animation-name` and `@starting-style` frames the layer cannot pair with a utility.
- `packages/core/src/Thumbnail/thumbnailRemoveButtonOverrides.stylex.ts` — two rules for one property
  on one element; inside `astryx-base` the sheet order would decide.

## Comments — window J

`227251c8c refactor(table): стили ячейки закреплённой колонки переходят в
классы Tailwind` moves `useTableStickyColumns.tsx` off StyleX: its two maps
(cell + shadow) are now literal text in
`packages/core/src/Table/plugins/stickyColumns/stickyColumnClasses.ts`. The hook
keeps only the inline `position: sticky` and the logical offset, so the
composition-order fix recorded at `transformHeaderCell` still holds.

No StyleX survivor. The one arm that argued for one was the RTL flip of the
scroll shadow (`:is([dir="rtl"] *)` on `transform` and `background-image`). The
`rtl:` variant compiles to `&:where(:dir(rtl), [dir="rtl"], [dir="rtl"] *)`, adds
no specificity, and is emitted after the plain utilities (base at
`dist/astryx-tailwind.css` 6828/6834, `rtl:` arms at 7823/7839), so it wins by
order — the flip keeps working with no map. The divider's `[data-astryx-cell-
gliding]` and `[data-astryx-table-pinned=carry]` arms likewise compile, and the
`before:` variant supplies `content: var(--tw-content)` on every arm.

Trap found, worth adding to the README: a `_` inside `var()` survives in a
property-form arbitrary value (`[border-bottom-width:var(--_table-row-…)]`), but
Tailwind normalizes `calc()` and turns the underscore into a space there —
`calc(-1*var(--_table-row-divider-width,0px))` printed `var(-- table-row-…)`, an
invalid declaration. The negative-margin utility form instead emits it intact:
`-mb-[var(--_table-row-…)]` → `margin-bottom: calc(var(--_table-row-…) * -1)`.
`packages/core/src/Table/tableGlideClasses.ts` still carries the broken
`calc(-1*var(--_table-row-glide-offset,0px))` spelling at two rules
(`[[data-astryx-cell-gliding=line]]:after:[bottom:calc(…)]`); it is outside this
window and unfixed.

The private attributes in that class text are a literal, so the module carries
one `eslint-disable @astryx/no-raw-private-attribute` naming
`Table/glidingDivider.ts`, which writes both names today and owns their meaning;
there is no `privateAttributes/` owner for them yet.

`useTableStickyColumns.test.tsx` gains one test that asserts the class text
reaches the header, body, z-index and shadow classes, and the sheet test
registers all five names.
