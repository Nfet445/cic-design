# top nav

Status: done
Blocked by: 18
Wave: 6
Family: `family:navigation-destinations`
Ticket: 21
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `TopNav/` (9) and its mega-menu members: the last large call-site rewrite before overlays.

## Files

- `packages/core/src/TopNav/**`

## Done when

- Mega-menu layout and the featured card keep their grid.
- The family page shows the collapsed and the expanded top nav.

## Verification

- `pnpm exec vitest run packages/core/src/TopNav`

## Progress

Migrated to Tailwind class maps (`*Classes.ts`), each in its own commit:

- `TopNav.tsx` → `topNavClasses.ts` (`1204fcad5`).
- `TopNavMegaMenuFeaturedCard.tsx` → `topNavMegaMenuFeaturedCardClasses.ts` (`4dd7cd4d8`).

Left to migrate, each with its own `*Classes.ts` and commit:

- `TopNavItem.tsx`. Its selected state composes `interactionOverlayStyles`
  (press arms on `data-astryx-press`) and, in the drawer, `navItemStyles` from
  `NavItem/**`, which ticket 44 owns. The horizontal path can move to classes
  with the selected fill keyed off `aria-current="page"`; the drawer path keeps
  the shared row styles until 44 lands.
- `TopNavHeading.tsx`. Four grid-template maps plus the `:has(.astryx-nav-icon)`
  inline-start padding and the popover's `anchor-size()` widths.
- `TopNavMenu.tsx` and `TopNavMegaMenu.tsx`. Both still spread
  `menuTouchActionStyles` from `DropdownMenu/**` (ticket 23) and
  `useMenuOverflow`; only their own style objects move.
- `TopNavMegaMenuItem.tsx`. The drawer item reuses `navItemStyles.item`.

Sheet coverage for the two migrated files is in
`packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`; the rule
budget there stays 820 until the merged sheet needs more.

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Result

Status: done (`ticket/21-top-nav`). The whole `TopNav/` family paints from
Tailwind class maps: `topNavClasses.ts`, `topNavItemClasses.ts`,
`topNavHeadingClasses.ts`, `topNavMenuClasses.ts`,
`topNavMegaMenuFeaturedCardClasses.ts`, `topNavMegaMenuClasses.ts` and
`topNavMegaMenuItemClasses.ts`. Earlier commits: `4ffc4bafc`, `8b3b75fb4`,
`a12b5f5b1`, `0dd913d17`.

This ticket's last commits:

- `909f2059d` — `topNavMegaMenuClasses.ts` and `topNavMegaMenuItemClasses.ts`,
  registered in the sheet test's coverage block (26 accessors, every class has a
  rule; the budget stays `toBeLessThan(1020)`).
- `0412ec8d7` — `TopNavMegaMenu.tsx` and `TopNavMegaMenuItem.tsx` render from
  the maps. StyleX stays only where it composes another family: the shared focus
  ring and `navItemStyles.item`, which ticket 44 owns. The panel's entrance
  travels as `className` through `popover.render()`.
- `4385475d4` — changeset `topnav-mega-menu-tailwind-classes.md`.
- `cc6c57924` — merge of `poc/tailwind-layout-primitives`; the sheet test did
  not conflict, so both sides were already one block.

Moved assertions:

- `TopNavMegaMenu.test.tsx` — "clips the drawer section only while it is
  collapsed" read `getComputedStyle`, which jsdom cannot derive from the built
  sheet; it now pins the drawer-items class set (the clip and the
  `[aria-hidden=false]` release), the inner box, and the `aria-hidden` the
  section publishes after the click.
- `TopNav.slotPresence.test.tsx` — the mega-menu item icon cases compared the
  StyleX debug name through `[class*="desktopIcon"]`; they now use the class-set
  form, as the TopNavMenu cases already did.
- `TopNavMegaMenu.reduced-motion.source-build.test.mjs` — the Babel/StyleX rule
  scan found nothing once the map moved. It now reads the built sheet and
  asserts the four reduced-motion arms, and that `@starting-style` prints after
  `[&:popover-open]:opacity-100`, since equal specificity leaves order deciding.

Verification: `node packages/core/scripts/build-css-tailwind.mjs`,
`pnpm exec vitest run packages/core/src/TopNav
packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs` (339
passed), `pnpm exec eslint packages/core/src/TopNav`,
`pnpm exec prettier --write`.
