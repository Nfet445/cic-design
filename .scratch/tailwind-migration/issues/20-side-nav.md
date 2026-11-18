# side nav

Status: done
Blocked by: 18
Wave: 6
Family: `family:navigation-destinations`
Ticket: 20
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `SideNav/` (8), `TreeList/` (6) and their row controls, including the size cascade from `family:component-size-cascade`.

## Files

- `packages/core/src/SideNav/**`
- `packages/core/src/TreeList/**`

## Done when

- The row-control size cascade still reaches an action the consumer did not size.
- Collapse and resize affordances keep their measured geometry.

## Verification

- `pnpm exec vitest run packages/core/src/SideNav packages/core/src/TreeList`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Progress

Landed (commit `refactor(SideNav)`, branch `ticket/20-side-nav`):

- `packages/core/src/SideNav/SideNav.tsx` — the `styles` block is gone;
  `packages/core/src/SideNav/sideNavClasses.ts` holds every zone as a literal
  class set, joined with `tw()`.
- One StyleX member is left on purpose: `leftoverStyles.resizableHandle`
  (outline offset `0` / `:focus-visible` negative width). `ResizeHandle`
  applies `focusOutlineStyles.focusVisible` unlayered, and a utility inside
  `@layer astryx-base` loses to it at any order; the `:focus-visible` pair also
  cannot live in an inline style.
- Tests: `SideNav.test.tsx` finds the footer row and the clipping wrapper by
  the map's classes and asserts `items-center` / `overflow-clip` instead of
  `getComputedStyle`; `SideNav.slotPresence.test.tsx` finds the sticky zones
  and the footer row by class. `topContent` has no wrapper class any more, so
  its slot is proved through the sticky top it renders in.
- `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` registers
  `sideNavClassName`; the 1020-rule budget still holds, so the limit is
  unchanged.

## Progress (second pass)

Landed in `refactor(SideNav): переместить оформление SideNavItem в классы Tailwind`:

- `packages/core/src/SideNav/SideNavItem.tsx` — the `styles` block is gone;
  `packages/core/src/SideNav/sideNavItemClasses.ts` holds the row wrapper, the
  label, the end-content and actions slots, the children group and its
  expanded/collapsed states, the chevron, the standalone toggle, the split
  action, the popover surface and header, and the popover gap.
- Two leftovers stay StyleX, both because `navItemStyles` is another family's
  unlayered rule that wins inside `@layer astryx-base` at every order:
  `leftoverStyles.collapsedItem/Sm/Lg` (the square a rail row keeps over
  `width: 100%` plus the padding `navItemStyles` paints) and `indentStyles`
  (the nesting indent, which replaces `padding-inline-start`).
  `indentStyles.sm/md` read `spacingVars` only; they keep the `IndentStyle`
  shape, so the indent is still a class plus a variable.
- The standalone expand toggle keeps the shape `iconButtonHeight(size)`
  already reads: `h-[var(--size-element-sm)]` / `w-[var(--size-element-sm)]`.
- Tests: `declaredOn` is gone from `SideNav.test.tsx`; the children group has
  no padding through `classesOf`, the collapsed group is found by
  `overflow-hidden`, and the toggle's box is asserted as `h-[…]` / `w-[…]`.
  The disabled-row test proves the actions slot carries `pointer-events-auto`
  (jsdom resolves no Tailwind class, so the class is the proof).
  `SideNav.slotPresence.test.tsx` finds `SideNavItem`'s end-content slot by its
  class set instead of a debug name.
- `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` registers
  `sideNavItemClassName`; the sheet grew from 1020 rules to 1025, so the budget
  is raised to 1040 with the reason in the comment.

## Left

- `SideNav.test.tsx` keeps its own `expectSharedFocusRing` and
  `expectNoSharedFocusRing`; the shared `__tests__/insetFocusRing.ts` exports
  only `expectSharedFocusRing`, so the negative helper has no home yet. No
  helper in that file reads a StyleX declaration any more: they read `tw()`
  class sets and the inline `--_tree-indent` / `--astryx-*` variables.
- `TreeListItem.tsx` carries one narrow `eslint-disable` for
  `@astryx/no-style-only-wrapper` on the `<div>` that holds the guide column:
  `TreeListBranches` returns a fragment, so no child element can carry the
  `ps-2` indent column, and the wrapper also keeps the pre-migration DOM.

## Result

- The whole ticket's styling is Tailwind: `SideNav`, `SideNavItem`,
  `SideNavHeading` and `TreeListItem` each read a literal class map from a
  `*Classes.ts` file beside them. No `stylex.create` block is left in
  `SideNav/` or `TreeList/` other than the family's shared interaction and focus
  rings, which stay StyleX because an unlayered rule must outrank a class.
- `SideNavHeading`: the roots' `:has(.astryx-nav-icon)` paddingInlineStart is
  `[&:has(.astryx-nav-icon)]:ps-0` on the class; the built sheet carries it at
  `packages/core/dist/astryx-tailwind.css` (`&:has(.astryx-nav-icon) {`).
  Collapsed rows take their own `collapsedRoot` without `ps-2`/`pe-2`, so no
  utility has to outrank another for the same property.
- `TreeListItem`: `styles`, `densityStyles` and the three identical
  `descriptionSizeStyles` arms became `treeListItemClassName` and
  `treeListItemDensityClassName`. `IndentStyle` keeps its shape (a class plus
  the inline `--_tree-indent` variable), and the row's z-index still reads the
  `--_tree-focus-z` variable the treeitem publishes.
- Tests that read compiled StyleX rules or debug names now read class sets:
  the indent (padding not margin), the row-gap padding, the focus lift, the
  focus z-index pair and the chevron column. `collectCssText` is gone from
  `TreeList.test.tsx` because nothing in it reads StyleX CSS any more.
- Sheet test: `sideNavHeadingClassName`, `treeListItemClassName` and
  `treeListItemDensityClassName` are registered. The merged branch's ceiling of
  1050 no longer fits 1055 rules, so it moves to 1060 with the reason in the
  comment; the head-side rules reused almost every utility their families
  already spell.
- Commits: `36ec143e9` (SideNavHeading), `193444b91` (TreeListItem),
  `dbb6cf199` (merge of `poc/tailwind-layout-primitives`, sheet-test conflict
  resolved keeping both sides, `node --check` passes).
- After the merge: `node packages/core/scripts/build-css-tailwind.mjs`
  (`dist/astryx-tailwind.css`, 150.0 kB),
  `pnpm exec vitest run packages/core/src/SideNav packages/core/src/TreeList
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 6 files,
  538 tests pass; `pnpm exec eslint packages/core/src/SideNav
packages/core/src/TreeList packages/core/src/Layout` — 0 errors, 6 pre-existing
  warnings in `SideNavCollapseStacking.a11y.chromium.spec.ts`; `pnpm exec tsc -p
packages/core --noEmit` clean.
