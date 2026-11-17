# top nav

Status: ready-for-agent
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
