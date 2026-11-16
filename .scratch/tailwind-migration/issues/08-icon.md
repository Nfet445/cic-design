# icon

Status: ready-for-agent
Blocked by: 5
Wave: 3
Ticket: 08

## What

Migrate `Icon/` and its size contract to class maps, keeping `IconSize` a public union.

## Files

- `packages/core/src/Icon/**`
- `packages/core/src/Icon/IconSize`

## Done when

- Every icon size resolves from a class, and `IconSize` keeps its name and members.
- 11 `stylex.create` in `Icon/` reach zero.

## Verification

- `pnpm exec vitest run packages/core/src/Icon`
- `node packages/core/scripts/build-css-tailwind.mjs`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
