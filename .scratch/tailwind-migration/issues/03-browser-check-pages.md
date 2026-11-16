# browser check pages

Status: done
Blocked by: —
Wave: 0
Ticket: 03
Parent: `00-epic-stylex-to-tailwind-4`

## What

Replace the throwaway `/tmp/poc` pages with a checked-in harness: one page and one fixture per family inside the Tailwind environment, plus the script that renders them and the values they must show.

## Files

- `internal/vibe-tests/environments/project-astryx-tailwind/pages/<family>.html`
- `internal/vibe-tests/environments/project-astryx-tailwind/pages/<family>.tsx`
- `the script that renders a fixture to its page`

## Done when

- `family:layout-primitives` and `family:buttons` pages reproduce the values already measured (gap 8px, padding-inline-start 16px, track template, 300×120 centre, button 32/32/36, icon 32×32).
- A page prints the computed values it asserts, so a reviewer reads them without a console.
- The manual High Contrast checklist item lives in the ticket template, not in a page.

## Verification

- `Render both pages; open them with the browser automation tool; compare against the recorded values`
- `pnpm specs:for internal/vibe-tests/environments/project-astryx-tailwind`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
