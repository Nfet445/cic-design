# lab

Status: ready-for-agent
Blocked by: 22,29
Wave: 8
Ticket: 30

## What

Migrate `packages/lab` (58 `stylex.create`, 283 `stylex.props`) in two halves: non-overlay components first, then the tour and emoji pickers that build on `Layer`.

## Files

- `packages/lab/src/**`
- `packages/lab/tailwind/ (new input)`
- `packages/lab/package.json`

## Done when

- `lab` ships its own sheet and its tests cover the class maps.
- The overlay-backed components reuse the wave 7 layer classes instead of new ones.

## Verification

- `pnpm -F @astryxdesign/lab build`
- `pnpm exec vitest run packages/lab/src`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
