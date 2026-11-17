# menus

Status: partly done — `DropdownMenuDivider`, `DropdownMenuGroup`, `DropdownMenuItem`, the bottom-sheet frame and `DropdownMenuSubMenu`'s row, flyout and drill-in list landed; the popover container, the selectable rows, `ContextMenu`, `MoreMenu` and the option menus wait (see Result)
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

Window 3 (this branch, after merging `poc/tailwind-layout-primitives` once):

- `DropdownMenuSubMenu` leaves in `DropdownMenu/dropdownMenuSubMenuClasses.ts`:
  - `dropdownMenuSubMenuTriggerClassName({isDisabled, size, isOpen})` — the
    sub-menu row reuses `dropdownMenuItemClassName`'s box and adds the open
    branch's paint (`9fe5b40c5`);
  - `dropdownMenuSubMenuFlyoutClassName` — the flyout surface: the column, the
    menu's radius and padding handed to its rows, the popover paint, the
    forced-colors border and the two viewport caps. The caps follow
    `DateRangeInput/dateRangeInputClasses.ts`'s idiom: one base class and one
    `[@supports_not_(…)]` arm for the `env()`-less fallback;
  - `dropdownMenuSubMenuScrollClassName`,
    `dropdownMenuSubMenuTouchClassName`, `dropdownMenuSubMenuTouchPinchClassName`
    — the scroll gesture of the rows;
  - `dropdownMenuSubMenuDrillInClassName` — the drilled list. Its display waits
    for the `hidden` attribute to go (`[&:not([hidden])]:flex`): the attribute
    alone loses to a `flex` class in `astryx-base`.
- `triggerStyles` is down to the row's `:focus` paint, its `outlineOffset` and
  the caret's slot wrapper; `triggerSizeStyles` and `drillInStyles` are gone.
  `flyoutStyles` keeps only the four `popover*` keys: `useLayer`'s render
  options take StyleX styles for the anchored container, so that size cannot
  be a class this ticket owns.
- `DropdownMenuSubMenu.test.tsx`: the viewport-cap assertion read a StyleX
  declaration (`toHaveStyle`), which jsdom could only resolve because StyleX
  injected it. It reads the class set through `expectClassSet` now, and the
  scroll assertion moved with it.
- Sheet: 13 new rules, 151.4 kB. The merge conflict in the budget test kept
  both sides' reasoning and moved the ceiling once, to 1140, for their sum
  (1130 rules). `node --check` clean.
- Tests: `pnpm exec vitest run packages/core/src/DropdownMenu
packages/core/src/ContextMenu packages/core/src/MoreMenu
packages/core/src/NavMenu
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 609
  passed, no assertion weakened.

Still in StyleX in this file, with the reason:

- `regionStyles` / `dynamicRegionStyles` (the header-and-footer frame). The
  frame and the drilled view both set the block cap, and the drilled view's
  value comes from the root menu's `menuMaxHeight` at runtime: it needs the
  Cap-as-variable seam (`[max-block-size:min(var(--astryx-…), …)]`) before the
  two can be one class. Its inline cap pair also still uses `firstThatWorks`.
- The caret's slot wrapper: the style is structural, and the rule against a
  style-only wrapper reads that from a style module, not from a class string.

Window 4 (this branch, after merging `poc/tailwind-layout-primitives` once):

- `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem` (`15a1e7aaf`): the row box
  (`w-full`, the inset radius, the text color, the pointer cursor and the
  disabled opacity) is `dropdownMenuCheckableRowClassName`, and the marker's
  place in the row — first, at the inline-end under `pointer-coarse` — is
  `dropdownMenuMarkerClassName`, handed to the indicator's `className`. The row
  keeps `Item`'s own padding: it never took `dropdownMenuItemClassName`'s box,
  so the shared map is not the row's owner here. `menuRowStateStyles` stays
  (the `:focus` paint and the `outlineOffset`, the ticket 17/44 reason), the
  same block `DropdownMenuItem` keeps.
- `DropdownMenuRadioGroup`: the column and the menu's inter-row gap are
  `dropdownMenuRadioGroupClassName`; the create is gone.
- The bottom sheet and the drill-in (`19b2643ac`): `menuBottomSheet.stylex.ts`
  is replaced by `DropdownMenu/menuBottomSheetClasses.ts` (the content box with
  its container variables, the lone heading's gap, and the action list's list,
  destructive row, structural item, section and section heading).
  `MenuBottomSheetActionList` and `useMenuDrillIn` are class-only now;
  `renderDropdownItems`' data section heading reuses
  `dropdownMenuGroupHeadingClassName`, which it duplicated exactly. The
  drill-in wrappers are `dropdownMenuTreeClassName` (`contents`) and
  `dropdownMenuTreeHiddenClassName` (`hidden`) — the `hidden` attribute alone
  loses to a `contents` class in `astryx-base`.
- `DropdownMenu.test.tsx` read the sheet content box with `toHaveStyle`; jsdom
  only resolved it because StyleX injected the declarations, so it reads the
  class set now.
- The merge resolved two conflicts: `DropdownMenu.tsx` keeps this side's
  `themeProps` + `tw(...)` shape, and `DropdownMenuSubMenu.tsx` takes the
  merged side's `tw(...)` call, which also put `layerAnimations.end` in the
  class list where it had been handed to `stylex.props` (that pair was the
  branch's only type error before the merge).
- Sheet: 1187 rules, ceiling moved to 1200 with the reason in the test.
- Tests: `pnpm exec vitest run packages/core/src/DropdownMenu
packages/core/src/ContextMenu packages/core/src/MoreMenu
packages/core/src/NavMenu
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 609
  passed.

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
- `DropdownMenuSubMenu.tsx`: the row, the flyout surface and the drill-in list
  landed (window 3). Two creates remain: `regionStyles` /
  `dynamicRegionStyles`, which need the cap-as-variable seam because the
  drilled view takes the root menu's `menuMaxHeight`, and the four `popover*`
  keys, which `useLayer` receives as `xstyle`.
- `ContextMenu.tsx` (1 create). `MoreMenu.tsx` verified clean in window 4: it
  has no create of its own. `MenuBottomSheet*`, `useMenuDrillIn.tsx` and
  `renderDropdownItems.tsx` landed in window 4.
- `menuTouchAction.stylex.ts`: still StyleX. Its two keys are read by seven
  call sites outside this family (`SideNav/SideNavHeading.tsx`,
  `TabList/TabMenu.tsx`, `TopNav/TopNavHeading.tsx`, `TopNav/TopNavMenu.tsx`,
  `Breadcrumbs/BreadcrumbItem.tsx`, `NavMenu/NavHeadingMenu.tsx` and
  `DropdownMenu/DropdownMenu.tsx`), each passing the value as `xstyle`, so the
  swap to a class string edits another family's component. The window left it
  rather than widen into those files; the module owner is this ticket, so the
  next window can convert it and its call sites at once.
- `NavMenu/NavHeadingMenu.tsx` (two creates) and `NavHeadingMenuItem.tsx` (two
  creates) did not start; the window closed on the bottom sheet.
- `Selector`/`MultiSelector` option menus and `NavHeadingMenu`.
- The sheet-size gate has ~10 rules of room left under 1050 after this window;
  the popover container will need the constant raised with its reason.

### Window 5

Landed, one commit per file:

- `ContextMenu.tsx` — `ef9ecef7b`. The whole `styles` block (11 keys) is
  `ContextMenu/contextMenuClasses.ts`. Three parts are worth knowing:
  - `popoverCustomWidth` became a class plus `--astryx-context-menu-min-inline-size`
    set on the layer container, so a consumer class still overrides it; the
    variable is in `ContextMenu.doc.mjs` and the registry allowlist.
  - the 1px cursor anchor keeps `left`/`top` inline (runtime geometry) and its
    box is the class `contextMenuCursorAnchorClassName`.
  - the sheet heading row reuses `dropdownMenuSheetClassName.header`/
    `.rootHeading`/`.viewHeading` instead of a second copy.
- `DropdownMenu.tsx` — `f118555dd`. `styles` (18 keys) and `dynamicStyles` (2)
  are gone; `DropdownMenu/dropdownMenuClasses.ts` grew a "pointer popover"
  section. Decisions the next window needs to keep:
  - `menuMaxHeight` lifts the menu cap through
    `--astryx-dropdown-menu-max-block-size`, read by both the menu's cap class
    and `dropdownMenuPopoverViewportClassName`, so the layer's flip decision
    still sees the height the menu takes. The cap class keeps `300px` as the
    variable's fallback.
  - `menuWidth` writes `--astryx-dropdown-menu-inline-size` and picks
    `min-w-`/`w-` from `resolvedMenuWidth.property`, so the fixed and minimum
    cases stay distinct without a second inline declaration.
  - `stepsAsideForView` is one `[&:has(~ [data-astryx-submenu-host] >
[data-astryx-submenu-regions=view]:not([hidden]))]:hidden` utility, with a
    narrow `@astryx/no-raw-private-attribute` disable for the scan.
  - `popoverMatchTrigger` keeps the `@supports_not_(inline-size:100vi)` arm
    around the same `min(anchor-size(width), …)` clamp.
  - tests: the four `DropdownMenu.test.tsx` groups that read `toHaveStyle` now
    read the class set or the inline variable; `DropdownMenuSubMenu.test.tsx`
    gained a `stepsAside()` helper that asserts the DOM shape the `:has()` rule
    reads, because jsdom parses no stylesheet.
  - sheet: 170.4 kB, rules still under the 1200 ceiling; the ceiling did not
    move.

Left for the next window, in this order (the window closed at the 20-minute
mark with items 3–5 still open):

1. `DropdownMenuSubMenu.tsx`:
   - `triggerStyles.row` is the documented unlayered survivor (Item's overlays +
     the shared ring) — same shape as the three row creates in item 4.
   - `triggerStyles.caret` (`display:flex; align-items:center`) — check whether
     `dropdownMenuSubMenuTriggerClassName` can carry `flex items-center` on the
     caret slot; the comment says a style-only wrapper rule reads it, so verify
     that rule first.
   - `flyoutStyles` (4 keys) goes to `useLayer` as `xstyle`; the layer takes
     `className` and `style` too, so the viewport cap becomes a class and the
     widths become classes plus an inline variable, as in `DropdownMenu.tsx`.
   - `regionStyles.frame` is the same frame as
     `dropdownMenuRegionsFrameClassName`; `dynamicRegionStyles.viewMaxHeight`
     is the drill-in cap and needs the cap-as-variable seam (the root's
     `menuMaxHeight` reaches the view through the same variable name).
2. The three identical `menuRowStateStyles` (`DropdownMenuCheckboxItem.tsx:53`,
   `DropdownMenuRadioItem.tsx:50`, `DropdownMenuItem.tsx:54`, plus
   `DropdownMenuSubMenu.tsx`'s `triggerStyles.row`) fold into one shared
   `.stylex.ts` beside them: `:focus` paint from
   `--_menu-row-focus-paint` and the `-1 * focus-outline-width` offset, unlayered
   because Item's overlays and the focus ring are.
3. `menuTouchAction.stylex.ts` stays this window: seven call sites outside this
   family pass it as `xstyle`, so converting it edits other families. Recorded
   as a documented survivor; the next window that is allowed to touch those
   files can do it in one commit.
