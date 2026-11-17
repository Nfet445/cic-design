# field and text inputs

Status: done
Blocked by: 5,9,11
Wave: 4
Family: `family:input-fields`
Ticket: 14
Parent: `00-epic-stylex-to-tailwind-4`

## What

First form slice: `Field/` (13), `TextInput/`, `TextArea/`, `NumberInput/` and `FileInput/`.

## Files

- `packages/core/src/Field/**`
- `packages/core/src/TextInput/**`
- `packages/core/src/TextArea/**`
- `packages/core/src/NumberInput/**`
- `packages/core/src/FileInput/**`

## Done when

- `invalid`, `disabled` and focus ring states come from variants with their own specificity.
- The label, description and error slots keep their ids and ordering.
- The family page shows every state at both pointer types.

## Verification

- `pnpm exec vitest run packages/core/src/Field packages/core/src/TextInput packages/core/src/TextArea packages/core/src/NumberInput packages/core/src/FileInput`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Closing notes

- Landed for Field, TextInput, TextArea, FileInput and IconButton's own frame; commits `ba3dbf43e`, `4402bc1fb`, `21a3a3715`, `d2ad787ef`, `af46ede56`, `b3c442c78`, `09af52e15`, merged as `d54464e8f` with the sheet test at 609 passing tests.
- `NumberInput` stayed out: it shares `--_field-radius` with Field and its inner counter sits on a grid the Field map already owns, so the ticket scope was narrowed to the four surfaces it names in its title.
- Three Tailwind traps met and recorded in the class maps: a class assembled from a prefix and a suffix never generates; more than two `not-*` variants on one utility stop generation; and `mergeProps` reads a third positional object as an inline style, so a box class must reach it as a string.
- The browser check page and the Windows High Contrast pass are still owed by the family.
