# menus

Status: partly done — `DropdownMenuDivider`, `DropdownMenuGroup`, `DropdownMenuItem` landed; the menu container, the selectable rows, the sub-menu, `ContextMenu`, `MoreMenu` and the option menus wait (see Result)
Blocked by: 22
Wave: 7
Family: `family:action-groups`
Ticket: 23
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `DropdownMenu/` (23), `ContextMenu/`, `MoreMenu/` and the option menus of `family:action-groups`; this ticket closes that family.

## Files

- `packages/core/src/DropdownMenu/**`
- `packages/core/src/ContextMenu/**`
- `packages/core/src/MoreMenu/**`
- `packages/core/src/AppShell/** (menu slots)`

## Done when

- Menu item rows, separators and the checked marker style from maps.
- The sub-menu layer keeps its anchored placement.

## Verification

- `pnpm exec vitest run packages/core/src/DropdownMenu packages/core/src/ContextMenu packages/core/src/MoreMenu`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Result

Landed on `ticket/23-menus` (branch cut from `poc/tailwind-layout-primitives`):

- `DropdownMenu` leaves in `DropdownMenu/dropdownMenuClasses.ts`:
  - `dropdownMenuDividerClassName` — the rule between groups (`82d226e87`);
  - `dropdownMenuGroupHeadingClassName` — the group heading, padding,
    font and secondary color (`82d226e87`);
  - `dropdownMenuItemClassName({isDestructive, isDisabled, size})` — the row
    box, the block padding per menu size, the radius derived from the menu's
    `--_dropdown-menu-radius` and `--_dropdown-menu-padding`, the `destructive`
    recolor and the disabled opacity (`016c02629`).
- Registered in `Layout/tailwindStylesheet.source-build.test.mjs`'s coverage
  block; every emitted class has a rule and the sheet stays inside
  `toBeLessThan(1020)`, so the constant did not move.
- Tests: `pnpm exec vitest run packages/core/src/DropdownMenu
packages/core/src/ContextMenu packages/core/src/MoreMenu
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` —
  563 passed, no assertion changed.

What stays in StyleX, and why:

- `DropdownMenuItem`'s row paint (`:focus`/`:active` fill) and its
  `outlineOffset`. `Item`'s hover and press overlays and the shared
  `focusOutlineStyles` ring are unlayered, so a utility inside `astryx-base`
  loses to them whatever the class order says — this is the ticket 17/44 case.
  One `stylex.create` (`menuRowStateStyles`) remains for those two declarations.

Left for the rest of this ticket:

- `DropdownMenu.tsx`: the layer/sheet frame, header and footer slots, the
  scroll region, the row gap and the section sizing (its own class map).
- `DropdownMenuCheckboxItem.tsx`, `DropdownMenuRadioItem.tsx`,
  `DropdownMenuRadioGroup.tsx`: the checked marker and the row's own paint.
- `DropdownMenuSubMenu.tsx`: the flyout layer and the drill-in sheet.
- `ContextMenu.tsx`, `MoreMenu.tsx`, `MenuBottomSheet*`: their frames and rows.
- `Selector`/`MultiSelector` option menus and `NavHeadingMenu`.
- The sheet-size gate must be re-checked when the container lands: the menu
  family adds about 30 rules so far, and the 1020 constant has little room left.
