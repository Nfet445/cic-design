# private attributes

Status: ready-for-agent
Blocked by: 5
Wave: 3
Ticket: 07
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate the marker and variable infrastructure in `privateAttributes/` (10 `stylex.create`, 26 `.stylex.ts` files) to class maps and plain CSS variables.

## Files

- `packages/core/src/privateAttributes/**`
- `packages/core/src/Indicator/indicator.markers`
- `packages/core/src/internal/indicatorPress`

## Done when

- A marker that today is `stylex.defineMarker()` becomes a class the owner applies, or a `data-astryx-*` attribute where CSS needs a hook.
- The `80`-entry export surface loses no entry in this ticket; subpaths change only in ticket 35.
- Every consumer of a migrated marker still matches its parent state.

## Verification

- `pnpm exec vitest run packages/core/src/Indicator packages/core/src/internal`
- `pnpm specs:for packages/core/src/privateAttributes`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
