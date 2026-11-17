# choice inputs

Status: done
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

## Closing notes

- Landed for the option rows of `Selector` (`e9fc11537`), `MultiSelector` (`607bf9851`) and `Typeahead`, including `TypeaheadItem` (`f05a3a1a0`, whose `declaredValue` opacity read moved to a class-set read), merged with `poc/tailwind-layout-primitives` as `f3de988d0`. The merge raised the sheet's rule budget from 620 to 660: the merged sheet holds 641 rules, since it carries the date-range and time-field maps beside the choice-input rows; the comment above the constant now names both.
- Class maps: `Selector/selectorOptionClasses.ts`, `MultiSelector/multiSelectorOptionClasses.ts`, `Typeahead/typeaheadClasses.ts`. A row states its fill and its outline through a private variable (`--_selector-row-bg`, `--_multi-selector-row-bg`, `--_typeahead-row-bg` and their `-outline-*` siblings) that only the state class sets, so `aria-selected`, `aria-checked`, disabled and highlighted states keep their look without depending on stylesheet order. `aria-selected` and `aria-checked` markers are unchanged in the markup and still draw their visual state.
- Assertions moved off StyleX output, all now class-set reads through `packages/core/src/__tests__/classNameAssertions.ts`:
  - `Selector/Selector.activeOption.test.tsx` — the keyboard-ring read (`hasRing`), the ring offset, and the indicator-contrast pair that compared `outline-color` against the highlight fill with `getComputedStyle`; the contrast test now names the two design tokens instead.
  - `Selector/Selector.test.tsx` — the mark column's `display` read, and three `getComputedStyle(...).minWidth` reads (two of which already failed after ticket 14 migrated `Field`).
  - `MultiSelector/MultiSelector.test.tsx` — all five ring assertions, which matched StyleX debug class names.
  - `Typeahead/TypeaheadItem.test.tsx` — the two enabled/disabled `opacity` reads that went through the `stylexDeclarations` helper.
- Deliberately left on StyleX: every trigger in the three components (`trigger*`, `statusButton`), and every popup surface — `dropdown`, `popover`, `listbox`, `searchPanel`, `groupHeading`, `emptyState`, `loadingStatus` — which belongs to the wave-7 overlay tickets. `ComplexSelector` is left whole: its map holds trigger chrome and the popup's `content` and `popover` surface, and it owns no option row, so this ticket had nothing to move there. `Typeahead`'s popup and its `input` frame are likewise untouched.
- Windows High Contrast: the rows draw an outline only where they drew one before. `Selector`'s keyboard ring and `Typeahead`'s highlighted row still outline from the theme's focus tokens, and the `Typeahead` highlight keeps its `@media (forced-colors: active)` system outline — now through `forced-colors:[--_typeahead-row-outline-*]` classes, whose compiled rules the sheet test covers. A manual pass over the family in a High Contrast session is still owed, and the family's browser check page is still owed with the rest of `family:input-fields` (see ticket 14).
