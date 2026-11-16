# deprecate stylex subpaths

Status: ready-for-agent
Blocked by: 31,32
Wave: 9
Ticket: 35
Parent: `00-epic-stylex-to-tailwind-4`

## What

Mark the 80 `stylex` export entries of `@astryxdesign/core` deprecated with `@deprecated` JSDoc, a `component` changeset that says they will be removed, and a docs note.

## Files

- `packages/core/package.json`
- `the 20 exported `*.stylex.ts` modules`
- `.changeset/`

## Done when

- Each of the 80 entries points at a module whose JSDoc says deprecated.
- A consumer sees the deprecation in the editor and in the changelog.

## Verification

- `pnpm check:changesets`
- `pnpm -F @astryxdesign/core build`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
