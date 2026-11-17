# the full suite back to its known-failing count

Status: in-progress
Wave: 4
Ticket: 43
Parent: `00-epic-stylex-to-tailwind-4`

## What

The first full `pnpm exec vitest run packages/core/src` after wave 4 reported
`Test Files 16 failed | 868 passed (884)` and
`Tests 25 failed | 23704 passed (23729)`. Eighteen of the 25 name a case no
ticket owns:

- Fourteen are the ICU and Temporal cases that fail on `main` too —
  `Calendar.calendarSystems`, `PowerSearch.calendarSystems`, five `Timestamp`
  cases, `postinstall.test.mjs`, and
  `utils/{calendarDateParser.roundtrip,calendarSystem,plainDate}`.
- Four belong to other workers: `Selector.test.tsx` (narrow row) and
  `Link.test.tsx` (new-tab name), each two cases.

The remaining seven are assertions left behind by the sheet ticket 11 replaced
with class maps, and the count cannot return to its known set until each reads
the class or the built sheet instead:

- `inputFontFloor.test.ts` "gates every floored text control to iOS alone" and
  `theme/dynamicType.test.ts` "keeps the iOS text-entry floor" scan source text
  for the StyleX floor literal
  ``'@media (pointer: coarse)': {'@supports (-webkit-touch-callout: none)': `max(1rem, …`}``.
  The floor now ships as
  `pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,…)]`
  in the class maps, and the iOS gate itself is intact.
- `AppShell.test.tsx` reads `isolation` off the Field root, `Drawer.test.tsx`
  `text-align` off the root dialog, `HoverCard.test.tsx` `font-family` off the
  floating layer, and `Stepper.test.tsx` the `--step-connector-gap` declaration
  the layer reset used to inject. `FormLayout.test.tsx` still looks for the
  StyleX debug name `horizontalLabels` in the Field root's class attribute.

## Result

Filled in by the ticket's last commit.
