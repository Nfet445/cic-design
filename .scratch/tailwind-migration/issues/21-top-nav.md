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

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
