# the full suite back to its known-failing count

Status: done
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

The full core suite is back to its known-failing count: 9 files and 18 tests
fail, which is the fourteen ICU and Temporal cases that fail on `main` plus the
four `Selector` and `Link` cases the narrow-row and new-tab tickets own. No
component changed; every assertion that moved now reads the class or the sheet
that replaced the rule it used to compute.

- `a5a6e8129` rewrote the two floor scans. `inputFontFloor.test.ts` reads the
  file that states each floor — the class map for a migrated control, the
  component source for one still on StyleX — and matches
  `pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-…-size))]`
  or the StyleX declaration with the same nesting. Its new sheet case reads the
  built stylesheet: the floor's block is exactly
  `@media(pointer:coarse){@supports(-webkit-touch-callout:none){font-size:max(1rem,var(--text-body-size));}}`,
  and no `@media(pointer:coarse){font-size:max(1rem…` exists, so no platform
  gets the floor without the iOS gate. `theme/dynamicType.test.ts` reads the
  same class out of `TextInput/textInputClasses.ts`.
- `ed34b694e` moved five stale assertions: the AppShell case reads `isolate` on
  the Field root, FormLayout reads `fieldHorizontalLabelsClassName`
  (`contents`) instead of the StyleX debug name `horizontalLabels`, and Drawer,
  HoverCard and Stepper read `layerTextResetClassName` and
  `layerStructureResetClassName` — the classes whose rules in the sheet's
  `@layer reset` declare `text-align: start`, `font-family:
var(--font-family-body)` and `--step-connector-gap: initial`. The sheet test
  already pins all three declarations.
- None of the five was a real regression: each containment and each reset is
  present in the class map or the sheet, only the computed-style route to it is
  gone. Drawer, HoverCard, Stepper and FormLayout are untouched.
- `a1cdcf163` merges `poc/tailwind-layout-primitives`. The merge applied
  without a conflict and the sheet test kept its rule budget and gzip gate.
