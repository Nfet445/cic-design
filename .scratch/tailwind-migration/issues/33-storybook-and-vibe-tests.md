# storybook and vibe tests

Status: ready-for-agent
Blocked by: 31
Wave: 9
Ticket: 33
Parent: `00-epic-stylex-to-tailwind-4`

## What

Load the Tailwind sheet in Storybook and in `internal/vibe-tests`, so stories and generated examples show the class-backed declarations.

## Files

- `apps/storybook/.storybook/**`
- `internal/vibe-tests/environments/**`

## Done when

- A migrated story shows the same computed values as the browser check page.
- The Tailwind environment no longer needs a second stylesheet.

## Verification

- `pnpm -F storybook build`
- `pnpm -F @astryxdesign/vibe-tests aggregate --help`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
