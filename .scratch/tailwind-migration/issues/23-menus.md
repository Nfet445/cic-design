# menus

Status: done except the nav heading menus and the option menus — every menu row, surface, sheet and sub-menu class is a Tailwind map; `NavHeadingMenu`, `NavHeadingMenuItem`, `Selector` and `MultiSelector` wait (see Result)
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

### Window 6

The five items the window opened with were already landed when it started:
`DropdownMenu.tsx` keeps no create (`f118555dd`), `ContextMenu.tsx` keeps none
(`ef9ecef7b`), and the four row-state copies are one
`DropdownMenu/menuRowState.stylex.ts` (`a07ab3a91`). So this window closed the
two survivors and the stale assertion that kept the suite red, one commit per
file:

- `DropdownMenu/menuTouchAction.stylex.ts` — `04f3c61c0`, with the count fixed
  in the follow-up. It stays, and the header now carries the reason: the values
  face no unlayered rule, so the class form works; what blocks the swap is
  ownership. Six of its seven call sites are other components
  (`SideNav/SideNavHeading.tsx:237`, `TopNav/TopNavHeading.tsx:232`,
  `TopNav/TopNavMenu.tsx:451`, `TabList/TabMenu.tsx:253`,
  `Breadcrumbs/BreadcrumbItem.tsx:647`, `NavMenu/NavHeadingMenu.tsx:221`), each
  passing the pair to `stylex.props()` beside its own state styles, so the
  conversion rewrites those components in the same commit. The class strings it
  would become are already in `dropdownMenuSubMenuClasses.ts`: the flyout's own
  `dropdownMenuSubMenuTouchClassName` and `dropdownMenuSubMenuTouchPinchClassName`
  (`:86`, `:92`).
- `DropdownMenuSubMenu.tsx` — `6e8100752`. `triggerStyles.caret` stays, and the
  comment now says why the check settled it that way: the
  `@astryx/no-style-only-wrapper` rule keeps a `<span>` over one Astryx child
  only while the style it applies resolves to a structural property
  (`display`, `alignItems` in `internal/eslint-plugin-astryx/no-style-only-wrapper.js`),
  and a class string resolves to no style at all, so the wrapper would be
  reported. `triggerStyles.row` was already gone; this create is the file's
  only one.
- `MoreMenu/MoreMenu.test.tsx` — `5893342d4`. The suite was red on the branch
  (749 tests, one failure): "keeps the trigger visually pressed while the menu
  is open" asserted `DropdownMenu__styles.triggerOpen`, a StyleX debug name the
  trigger stopped printing when it moved to `dropdownMenuTriggerOpenClassName`.
  It reads the class set through `expectClassSet` now, in both directions.
- Merge of `poc/tailwind-layout-primitives`: `41d043870` was already an ancestor
  (`86532c368`), so the merge was a no-op and the sheet-test conflict the
  window expected did not appear.

Verification: `node packages/core/scripts/build-css-tailwind.mjs` (184.6 kB),
`pnpm exec vitest run packages/core/src/DropdownMenu
packages/core/src/ContextMenu packages/core/src/MoreMenu packages/core/src/Item
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 27 files,
749 passed; prettier and eslint clean on the three files;
`pnpm -F @astryxdesign/core typecheck` clean. No class was added, so the sheet
coverage block and its ceiling did not move.

Still open for this ticket, in this order:

1. `NavMenu/NavHeadingMenu.tsx` (creates at `:36` and `:44`) and
   `NavMenu/NavHeadingMenuItem.tsx` (`:36`, `:79`) — the last two menu files
   with a create of their own.
2. `Selector/Selector.tsx` (`:143`, `:507`), `Selector/SelectorBottomSheet.tsx`
   (`:24`) and `MultiSelector/MultiSelector.tsx` (`:154`, `:418`) — the option
   menus the family still owns.
3. `menuTouchAction.stylex.ts` and its six foreign call sites in one commit,
   when a window is allowed to edit those families.

### Window 7

One commit per component, both in `NavMenu/`:

- `NavHeadingMenu.tsx` — `a07208a02`. Its two creates are
  `NavMenu/navHeadingMenuClasses.ts` now: `navHeadingMenuClassName` (the rows'
  column and the menu's gap) and `navHeadingMenuMinWidthClassName`, one per
  size. `minWidth` no longer writes an inline `minWidth` beside a class that
  also sets the property: the prop sets
  `--astryx-nav-heading-menu-min-inline-size` and each size class reads it with
  its own fallback, so `min-width` keeps one owner. The variable is in
  `NavMenu.doc.mjs` (`theming.vars`) and in the
  `derivedVarRegistry.test.ts` allowlist with its reason.
  `NavHeadingMenu.test.tsx`'s "applies minWidth override via inline style"
  asserted `menu.style.minWidth`, which only existed as an inline declaration;
  it reads the variable through `expectVariable` and the class through
  `expectClassSet`, and a second case asserts the column classes.
- `NavHeadingMenuItem.tsx` — `36504ab4b`. The row box, its `:focus` and hover
  fill, the disabled opacity and the three sizes are
  `navHeadingMenuItemClassName({isDisabled, size})`; the label-and-description
  track is `navHeadingMenuItemContentClassName`, a plain `className` because
  the span sets no StyleX. `xstyle` stays in `stylex.props` and `className`
  follows the map inside `tw(...)`, as `DropdownMenu.tsx:1730` does.
- Coverage: both maps in the `familyClassNames()` block, every size crossed
  with the disabled state. The sheet grew by 10 rules for the three minimum
  widths, the row state arms and the content box; 186.0 kB raw, still inside
  the 1380 ceiling, so the constant did not move.
- `menuTouchAction.stylex.ts` call sites left alone: the menu hands its pair to
  `stylex.props` beside `xstyle` (`NavHeadingMenu.tsx:213`), which the
  documented survivor keeps.

Verification: `node packages/core/scripts/build-css-tailwind.mjs` (186.0 kB),
`pnpm exec vitest run packages/core/src/NavMenu packages/core/src/Selector
packages/core/src/MultiSelector
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 22 files,
728 passed; `pnpm exec vitest run packages/core/src/theme` — 1821 passed;
prettier and eslint clean on the touched files;
`pnpm -F @astryxdesign/core typecheck` clean.

The merge of `poc/tailwind-layout-primitives` at the window's end carried
ticket 47's Switch map (`82d950466`). Git auto-merged
`Layout/tailwindStylesheet.source-build.test.mjs` this time — the two sides'
imports and coverage statements did not overlap and both survived, `node
--check` is clean — so no conflict needed resolving. The sheet measures
186.2 kB with both maps and 844 tests pass; the ceiling stays 1380, the
number the form-controls ticket set with its own measurement.

Still open for this ticket, with what each needs:

1. `Selector/Selector.tsx:143` — the `styles` create, 31 keys: the trigger
   frame, button, placeholder, label, value, icon and its rotation, the three
   variants with their press transform and `LAYER_OPEN` transition arm, the
   status button, `searchPanel` and `dropdown` (both `stylex.firstThatWorks`
   caps over `layerViewportInset`, so they take the
   `[@supports_not_(block-size:100dvb)]:` idiom at
   `DateRangeInput/dateRangeInputClasses.ts:107`), `dropdownInput` and
   `searchRowInput` (a padding `calc()` with `--border-width`), the two touch
   actions, `dropdownHidden` (an opacity longhand beside `transitionProperty:
none`), `popover` (`anchor-size(width)`), `emptyState`, `sectionHeading` and
   `divider`. The last two already have an exact owner:
   `dropdownMenuGroupHeadingClassName` and `dropdownMenuDividerClassName`, so
   they should reuse it rather than add a second vocabulary.
2. `Selector/Selector.tsx:507` — `sizeStyles`, three keys: `minHeight` plus a
   `lineHeight` and `paddingBlock` computed from the same size token and
   `--border-width`. One class per size, and the three values stay in one rule
   so the trigger's height contract (`max(min(...))` capped by the token) keeps
   its current shape.
3. `Selector/SelectorBottomSheet.tsx:24` — two keys: `content` (`width: 100%`)
   and `heading` (the margins around the sheet's `Heading`). Both are plain
   literals, so this one is a `selectorBottomSheetClasses.ts` away.
4. `MultiSelector/MultiSelector.tsx:154` — the `styles` create, about 25 keys:
   the same trigger frame and button, `triggerContent`, `triggerText`,
   `triggerBadges`, `triggerOverflow`, the icon wrapper, its rotation and open
   transform, the three variants with the press transform and the `LAYER_OPEN`
   arm, `triggerGhostDisabled`, `triggerReadOnly`, `triggerGhostReadOnly`, the
   status button, `searchPanel`, `dropdown` (both caps), `listbox`, `popover`,
   `sectionHeading`, `divider` and `emptyState`. The two option maps already
   hold the row vocabulary, so only the trigger half needs a new file.
5. `MultiSelector/MultiSelector.tsx:418` — `sizeStyles`, three keys, the
   trigger's `height` per size.
6. `menuTouchAction.stylex.ts` and its six foreign call sites in one commit,
   when a window is allowed to edit those families.

### Window 8

The assigned delta was already landed when the window opened: `DropdownMenu.tsx`
and `ContextMenu.tsx` keep no create, the four row-state copies are one
`DropdownMenu/menuRowState.stylex.ts`, and `DropdownMenuSubMenu.tsx` keeps only
`triggerStyles.caret` (the no-style-only-wrapper case). The window found one
real gap and closed the last survivor, as two commits:

- `e5bc3ff2c` — coverage. `Layout/tailwindStylesheet.source-build.test.mjs` never
  listed the maps window 5 added: `dropdownMenuClasses.ts`'s pointer-popover
  section (`dropdownMenuPopoverClassName`, its three width arms, the frame, the
  region, the surface host, the scroll, the step aside, the trigger's two
  states, the layer box) and all of `ContextMenu/contextMenuClasses.ts`. A class
  without a rule passed here silently; now it fails. No rule was added, so the
  sheet and the 1380 ceiling did not move.
- `62e28c834` — `menuTouchAction.stylex.ts` is deleted and its two values are
  the class strings the sub-menu map already held
  (`dropdownMenuSubMenuTouchClassName`, `dropdownMenuSubMenuTouchPinchClassName`).
  The module crossed into five closed families — `SideNav/SideNavHeading.tsx`,
  `TopNav/TopNavHeading.tsx`, `TopNav/TopNavMenu.tsx`, `TabList/TabMenu.tsx`,
  `Breadcrumbs/BreadcrumbItem.tsx` — because this ticket owns the module and a
  documented survivor here blocks the final StyleX removal. Each site swapped
  its `stylex.props()` argument for the class joined into its own `tw()`; every
  other StyleX value at those sites stayed, `xstyle` last. `TabMenu.tsx` and
  `TopNavMenu.tsx` dropped their `stylex` import; `NavHeadingMenu.tsx`,
  `BreadcrumbItem.tsx`, `SideNavHeading.tsx` and `TopNavHeading.tsx` keep it.
  The header lines that named StyleX were corrected where the import went.
- `DropdownMenu.test.tsx`: "owns touch scrolling" asserted a StyleX hash of the
  declaration; it reads `dropdownMenuSubMenuTouchPinchClassName` and excludes
  the pan class and `[touch-action:none]`. "caps menu height and only scrolls
  when content overflows" now asserts the pair in both directions, so the
  overflow branch of the swap is covered.

Verification: `node packages/core/scripts/build-css-tailwind.mjs` (194.9 kB),
`pnpm exec vitest run` on `DropdownMenu`, `ContextMenu`, `MoreMenu`, `SideNav`,
`TopNav`, `TabList`, `Breadcrumbs`, `NavMenu` and the stylesheet test — 36
files, 1416 passed; `pnpm -F @astryxdesign/core typecheck` clean; prettier and
eslint clean on the touched files.

Still open for this ticket: the option menus of the family, which no window has
started — `Selector/Selector.tsx:143` (31 keys), `Selector.tsx:507` (three
sizes), `Selector/SelectorBottomSheet.tsx:24` (two keys),
`MultiSelector/MultiSelector.tsx:154` (about 25 keys) and `:418` (three sizes).
Every menu surface and row in `DropdownMenu/`, `ContextMenu/`, `MoreMenu/` and
`NavMenu/` is a class map now.
