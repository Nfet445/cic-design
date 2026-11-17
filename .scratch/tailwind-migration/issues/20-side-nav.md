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

## Left

- `packages/core/src/SideNav/SideNavHeading.tsx` — one `stylex.create` block
  (`styles`, 25 members) and its call sites, several of which pass members into
  `focusOutlineProps`, so each paint has to move to `tw()` beside the ring.
- `packages/core/src/SideNav/SideNavItem.tsx` — two blocks: `styles` and
  `indentStyles` (the per-level indent stays a class plus the
  `--_side-nav-indent`-style variable the `IndentStyle` shape already carries).
- `packages/core/src/TreeList/TreeListItem.tsx` — three blocks: `styles`,
  `densityStyles`, `descriptionSizeStyles`.
- `packages/core/src/SideNav/SideNav.slotPresence.test.tsx` still reaches
  `SideNavHeading` and `SideNavItem` slots through
  `zeroIsInsideStyleXSlot(debugName)`; each goes away with its component.
- `SideNav.test.tsx` helpers `declaredOn`, `indentOf`, `ringSelectorsFor`,
  `expectSharedFocusRing` and `iconButtonHeight` read StyleX rules or debug
  names; they follow `SideNavItem`/`SideNavHeading`.
