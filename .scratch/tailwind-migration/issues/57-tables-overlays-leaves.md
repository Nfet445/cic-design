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
