# tabs and headings

Status: ready-for-agent
Blocked by: 18
Wave: 6
Family: `family:navigation-destinations`
Ticket: 19
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `TabList/` (10), nav-mode `Tab/`, `TabMenu/`, `NavHeadingMenu/`, `NavHeadingMenuItem/` and `SegmentedControl/` (5).

## Files

- `packages/core/src/TabList/**`
- `packages/core/src/TabMenu/**`
- `packages/core/src/NavMenu/**`
- `packages/core/src/SegmentedControl/**`

## Done when

- The active-third-order indicator keeps its measured position after the move.
- `SegmentedControl` stays the named exception of `family:action-groups` and follows the button maps.

## Verification

- `pnpm exec vitest run packages/core/src/TabList packages/core/src/SegmentedControl`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
