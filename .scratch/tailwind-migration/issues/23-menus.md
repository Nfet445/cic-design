# menus

Status: partly done — `DropdownMenuDivider`, `DropdownMenuGroup`, `DropdownMenuItem` and the bottom-sheet frame landed; the popover container, the selectable rows, the sub-menu, `ContextMenu`, `MoreMenu` and the option menus wait (see Result)
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

Window 2 (this branch, after merging `poc/tailwind-layout-primitives` twice:
SideNavItem + Drawer, then Card):

- `dropdownMenuSheetClassName` in `DropdownMenu/dropdownMenuClasses.ts` — the
  bottom-sheet frame: `content`, `header` (the row carrying the back button),
  `rootHeading`, `viewHeading` and `region`. The `bottomSheetStyles` create is
  gone; `DropdownMenu.tsx` now has two creates left.
- `DropdownMenu.test.tsx` read the heading's inset as an inline declaration
  (`toHaveStyle({marginInlineStart: 'var(--spacing-3)'})`); it reads the class
  `[margin-inline-start:var(--spacing-3)]` through `expectClassSet` instead.
  jsdom cannot parse the built sheet, so the declaration could only pass while
  StyleX injected one at runtime. It also dropped an unused
  `itemDensityClassName` import.
- Coverage: both sides of the merge kept in
  `Layout/tailwindStylesheet.source-build.test.mjs` (`cardClassName`,
  `cardBorderClassName` and the menu maps together), `node --check` clean. The
  gate is `toBeLessThan(1050)`, moved by the Card ticket; this window's five
  classes fit inside it (148.8 kB sheet, 563 tests green).

Left for the rest of this ticket:

- `DropdownMenu.tsx`: `styles` (18 keys) and `dynamicStyles` (2). The parts that
  need a decision, not a transcription:
  - the two `stylex.firstThatWorks` caps (`maxInlineSize`, `maxBlockSize` with
    their `env()`-less pair) have no Tailwind equivalent that keeps both
    declarations in one rule; the established idiom is the base utility plus
    `[@supports_not_(block-size:100dvb)]:` — used by
    `DateRangeInput/dateRangeInputClasses.ts:107`. Follow it.
  - `dynamicStyles.menuMaxHeight` and `popoverViewportMaxBlockSize` set the same
    property the base class already sets, so they must become one class reading
    an inline `--astryx-*` variable, never a second class or an inline
    declaration (the gate forbids class order inside `astryx-base`).
  - `styles.dropdown` carries a `:has()` conditional `display`; the
    `[&:has(...)]:` form in `Layout/layoutClasses.ts:99` is the pattern.
  - `styles.surfaceHost` is `display: contents`, `styles.region` and
    `styles.stepsAsideForView` are the same shape.
- `DropdownMenuCheckboxItem.tsx`, `DropdownMenuRadioItem.tsx`,
  `DropdownMenuRadioGroup.tsx`: `root` splits — `width`, the derived radius,
  `color`, `cursor` and `disabled` move to classes (reuse
  `dropdownMenuItemClassName`'s row box); the `:focus` paint and
  `outlineOffset` stay (the ticket 17/44 reason). `styles.marker` passes
  `xstyle` to the indicator from `useIndicator`, so it moves only if that
  control takes `className`.
- `DropdownMenuSubMenu.tsx` (6 creates): the flyout layer and the drill-in sheet.
- `ContextMenu.tsx` (1 create), `MoreMenu.tsx` (verify first: it may already be
  clean), `MenuBottomSheet*`, `useMenuDrillIn.tsx`, `renderDropdownItems.tsx`.
- `Selector`/`MultiSelector` option menus and `NavHeadingMenu`.
- The sheet-size gate has ~10 rules of room left under 1050 after this window;
  the popover container will need the constant raised with its reason.
