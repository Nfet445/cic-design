# choice inputs

Status: ready-for-agent
Blocked by: 14
Wave: 4
Family: `family:input-fields`
Ticket: 15
Parent: `00-epic-stylex-to-tailwind-4`

## What

Second form slice: `Selector/` (13), `MultiSelector/` (10), `ComplexSelector/` and `Typeahead/` (7). Their popups belong to wave 7 tickets.

## Files

- `packages/core/src/Selector/**`
- `packages/core/src/MultiSelector/**`
- `packages/core/src/ComplexSelector/**`
- `packages/core/src/Typeahead/**`

## Done when

- Option rows style themselves from maps; the popup surface stays with its overlay ticket.
- `aria-selected`/`aria-checked` markers keep their visual state.

## Verification

- `pnpm exec vitest run packages/core/src/Selector packages/core/src/MultiSelector packages/core/src/Typeahead`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
