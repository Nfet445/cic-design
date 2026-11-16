# tooltip hovercard

Status: ready-for-agent
Blocked by: 22
Wave: 7
Family: `family:overlay-dismissal`
Ticket: 24

## What

Migrate `Tooltip/` and `HoverCard/`.

## Files

- `packages/core/src/Tooltip/**`
- `packages/core/src/HoverCard/**`

## Done when

- The arrow offset and the hover-intent timings keep their values.
- `docs/specs/components/Tooltip/Tooltip.spec.md` claims are unchanged and still hold.

## Verification

- `pnpm exec vitest run packages/core/src/Tooltip packages/core/src/HoverCard`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
