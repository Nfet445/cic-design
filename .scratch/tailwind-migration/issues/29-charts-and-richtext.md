# charts and richtext

Status: ready-for-agent
Blocked by: 17
Wave: 8
Ticket: 29
Parent: `00-epic-stylex-to-tailwind-4`

## What

Give `packages/charts` (5) and `packages/richtext` (12) their own Tailwind builds and migrate their modules.

## Files

- `packages/charts/**`
- `packages/richtext/**`
- `packages/charts/tailwind/ (new input)`
- `packages/richtext/tailwind/ (new input)`
- `packages/charts/package.json`
- `packages/richtext/package.json`

## Done when

- Each package exports its sheet and runs its build inside `build:css`.
- Each sheet has the coverage and budget test from ticket 2.

## Verification

- `pnpm -F @astryxdesign/charts build`
- `pnpm -F @astryxdesign/richtext build`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
