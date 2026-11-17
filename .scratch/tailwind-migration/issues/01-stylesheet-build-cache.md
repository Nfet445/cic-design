# stylesheet build cache

Status: ready-for-agent
Blocked by: —
Wave: 0
Ticket: 01
Parent: `00-epic-stylex-to-tailwind-4`

## What

Cache the Tailwind stylesheet build per class-map module, the way the StyleX build caches per module, so a full build does not rescan every `*Classes.ts` on each run. Keep the sheet byte-identical to an uncached build.

## Files

- `packages/core/scripts/build-css-tailwind.mjs`
- `packages/core/tailwind/astryx.input.css`
- `scripts/build-css.mjs (cache convention to mirror)`

## Done when

- A second build with no source change reuses the cache and writes the same bytes.
- A changed class map invalidates only its own entry.
- The build prints hit and miss counts once.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs twice; compare `shasum` of the sheet`
- `pnpm exec vitest run packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
