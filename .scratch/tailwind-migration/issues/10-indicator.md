# indicator

Status: ready-for-agent
Blocked by: 5,7
Wave: 3
Ticket: 10
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `Indicator/` (8 `stylex.create`) including its press and marker hooks.

## Files

- `packages/core/src/Indicator/**`

## Done when

- Indicator states come from class variants; the marker path from ticket 7 is reused, not duplicated.

## Verification

- `pnpm exec vitest run packages/core/src/Indicator`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
