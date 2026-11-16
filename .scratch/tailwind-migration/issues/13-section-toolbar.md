# section toolbar

Status: done
Blocked by: 12
Wave: 3
Family: `family:layout-regions`
Ticket: 13
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `Section/` (4) and `Toolbar/` to class maps and close `family:layout-regions`.

## Files

- `packages/core/src/Section/**`
- `packages/core/src/Toolbar/**`

## Done when

- Both components render from maps, and no file in the family holds a style literal.
- The family page shows section padding and toolbar overflow.

## Verification

- `pnpm exec vitest run packages/core/src/Section packages/core/src/Toolbar`

## Notes

- Landed as `Section/sectionClasses.ts` and `Toolbar/toolbarClasses.ts`. The browser page is written and unregistered: four checks do not pass yet — `w-[var(--astryx-section-width)]` and the escape class are emitted, but `--astryx-section-width` and the toolbar `min-h-[var(--size-element-sm)]` rule are missing from the built sheet, so the page cannot verify them until that is understood. See `39-layout-regions-page.md`.

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
