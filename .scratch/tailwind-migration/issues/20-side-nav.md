# side nav

Status: ready-for-agent
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

- `packages/core/src/SideNav/SideNavHeading.tsx` — one `stylex.create` block
  (`styles`, 25 members) and about 70 call sites, several of which pass members
  into `focusOutlineProps`, so each paint has to move to `tw()` beside the
  ring. The root's `:has(.astryx-nav-icon)` paddingInlineStart needs a class
  plus a `has-[.astryx-nav-icon]:` variant, or a leftover, because the two
  values come from one StyleX conditional.
- `packages/core/src/TreeList/TreeListItem.tsx` — three blocks: `styles`,
  `densityStyles`, `descriptionSizeStyles`, plus the `IndentStyle` type around
  line 325 (class plus inline indent variable).
- `packages/core/src/SideNav/SideNav.slotPresence.test.tsx` still reaches
  `SideNavHeading` slots through `zeroIsInsideStyleXSlot(debugName)`; the
  helper goes away with that component.
- `SideNav.test.tsx` helpers `indentOf`, `ringSelectorsFor`,
  `expectSharedFocusRing` read StyleX rules or debug names; they follow
  `SideNavHeading` (and `indentOf` `TreeListItem`).

## Result

- `SideNav` and `SideNavItem` paint with Tailwind classes; `SideNavHeading` and
  `TreeListItem` stay StyleX until the next pass, listed under Left.
- Merged `poc/tailwind-layout-primitives` with no conflict: the branch does not
  touch
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`, so this
  ticket's `sideNavClassName` / `sideNavItemClassName` registrations and its
  1040 budget stand. `node --check` on that file passes after the merge.
- After the merge: `node packages/core/scripts/build-css-tailwind.mjs`,
  `pnpm exec vitest run packages/core/src/SideNav packages/core/src/TreeList
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` — 6 files,
  538 tests pass; `pnpm exec eslint packages/core/src/SideNav
packages/core/src/Layout` — 0 errors, 6 pre-existing warnings in
  `SideNavCollapseStacking.a11y.chromium.spec.ts`.
