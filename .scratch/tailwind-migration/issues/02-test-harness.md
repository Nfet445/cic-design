# test harness

Status: ready-for-agent
Blocked by: —
Wave: 0
Ticket: 02
Parent: `00-epic-stylex-to-tailwind-4`

## What

Extract the class-set assertions (`classesOf`, `declaredOn`) into one shared test utility, add a stylesheet test per package that ships a sheet, and pin the gzip gate constant at the StyleX baseline measured on `f35022021`.

## Files

- `packages/core/src/__tests__/ (new `classNameAssertions.ts`)`
- `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `packages/lab/, packages/charts/, packages/richtext/ (new sheet tests, after ticket 29/30 give them a build)`
- `packages/core/tailwind/astryx.input.css (comment naming the gate)`

## Done when

- One helper asserts a class set, a variable, and the absence of a class; StyleX debug classes are ignored in one place.
- Each package with a sheet has a test that (a) covers every class its maps can emit, (b) fails above 1.15× its StyleX gzip baseline, (c) pins layer order.
- The baseline constant names the commit it was measured on.

## Verification

- `pnpm exec vitest run packages/core/src/Layout packages/core/src/Button`
- `pnpm exec vitest run packages/core/src (the seven pre-existing failures stay the only ones)`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
