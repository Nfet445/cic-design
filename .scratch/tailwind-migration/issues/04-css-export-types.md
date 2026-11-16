# css export types

Status: ready-for-agent
Blocked by: —
Wave: 0
Ticket: 04

## What

Point the `./astryx-tailwind.css` export types at a declaration the file itself carries, and do the same for `./astryx.css`, so a consumer resolves a type from the stylesheet it imports.

## Files

- `packages/core/package.json`
- `packages/core/tailwind/astryx.css.d.ts`
- `packages/core/src/astryx.css.d.ts`

## Done when

- Both exports carry their own declaration beside the file.
- No consumer import changes.

## Verification

- `pnpm -F @astryxdesign/core build`
- `pnpm -F @astryxdesign/core typecheck`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
