# layer hooks utils

Status: ready-for-agent
Blocked by: 5
Wave: 3
Ticket: 11
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `Layer/` (5), `hooks/` (6) and `utils/` (6) — the anchored-layer and focus-ring plumbing that every overlay family builds on.

## Files

- `packages/core/src/Layer/**`
- `packages/core/src/hooks/**`
- `packages/core/src/utils/focusOutline*`
- `packages/core/src/utils/interactionOverlay*`

## Done when

- Layer animations, text reset and viewport inset express as classes or as CSS the build carries.
- The focus-ring and interaction-overlay props keep the shape consumers already pass.
- The `stylex.props()` call inside each migrated module is replaced by a class string.

## Verification

- `pnpm exec vitest run packages/core/src/Layer packages/core/src/hooks`
- `node packages/core/scripts/build-css-tailwind.mjs`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
