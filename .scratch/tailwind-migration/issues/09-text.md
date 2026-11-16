# text

Status: ready-for-agent
Blocked by: 5
Wave: 3
Ticket: 09
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `Text/` (19 `stylex.create`) — the typography vocabulary every family reads — to class maps over the token variables.

## Files

- `packages/core/src/Text/**`

## Done when

- Variant and size classes name the same token variables as before.
- The public variants and their TypeScript types are unchanged.

## Verification

- `pnpm exec vitest run packages/core/src/Text`
- `node packages/core/scripts/build-css-tailwind.mjs`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
