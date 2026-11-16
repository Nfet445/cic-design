# date inputs

Status: ready-for-agent
Blocked by: 14
Wave: 4
Family: `family:input-fields`
Ticket: 16
Parent: `00-epic-stylex-to-tailwind-4`

## What

Third form slice: `DateInput/` (16), `DateRangeInput/`, `DateTimeInput/` (10) and `TimeInput/` (5).

## Files

- `packages/core/src/DateInput/**`
- `packages/core/src/DateRangeInput/**`
- `packages/core/src/DateTimeInput/**`
- `packages/core/src/TimeInput/**`

## Done when

- Wheel and grid segments style from maps.
- `DateInput/tokens` keeps its export path (it changes only in ticket 35).

## Verification

- `pnpm exec vitest run packages/core/src/DateInput packages/core/src/DateRangeInput packages/core/src/DateTimeInput packages/core/src/TimeInput`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
