# press layers and own-ring containers

Status: done
Wave: 9
Ticket: 53
Parent: `00-epic-stylex-to-tailwind-4`

## What

The last three `stylex.create` blocks in `packages/core/src/privateAttributes`, the ones
ticket 41 could not move once the marker scopes became attributes.

## Files

- `packages/core/src/privateAttributes/press.stylex.ts` `rowPressLayerStyles` — stays
- `packages/core/src/privateAttributes/press.stylex.ts` `rowPressPaintStyles` — moved to
  `privateAttributes/pressClasses.ts`
- `packages/core/src/privateAttributes/ownRing.stylex.ts` `ownRingContainerStyles` — stays

## Why they stayed

`rowPressLayerStyles.cell` is one element's paint keyed on four attribute states at once
(`data-astryx-press=on|fading`, a coarse pointer, `data-astryx-disabled`) across a
`::before` layer and its own `animationName`/`isolation` arms. A class set cannot express
"this property only while three attributes agree" without one variant per combination, so
the map is the cheaper description today. `rowPressPaintStyles` (two custom properties) and
`ownRingContainerStyles` (four outline longhands behind `data-astryx-own-ring`) are small
enough to move, and they are the place to start.

## Done when

- ~~The two small maps are classes in `privateAttributes/pressClasses.ts` and
  `privateAttributes/ownRingClasses.ts`, registered in
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`.~~
  `rowPressPaintStyles.radioRow` moved to `privateAttributes/pressClasses.ts`
  (`rowPressPaintRadioRowClassName`, mouse and coarse arms) and is registered there.
  `ownRingContainerStyles` did not move: see Comments, it needs the ring application in
  `Item` to be a class first.
- `rowPressLayerStyles` stays with its reason written here and in
  `packages/core/src/privateAttributes/pressClasses.ts`.
- `rg "stylex.create" packages/core/src/privateAttributes` returns two documented
  survivors: `press.stylex.ts` (`rowPressLayerStyles`) and `ownRing.stylex.ts`
  (`ownRingContainerStyles`).

## Verification

- `pnpm exec vitest run packages/core/src/privateAttributes packages/core/src/Item packages/core/src/List packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`
- Manual Windows High Contrast check: a pressed row and a reorder container both draw paint
  and a ring.

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- The attribute spellings here are private: owner modules under
  `packages/core/src/privateAttributes/` write them, and class text gets one narrow
  `eslint-disable @astryx/no-raw-private-attribute` naming its owner.

## Comments

Measured before starting, so the next agent does not repeat the analysis:

- `ownRingContainerStyles` cannot become a plain utility. Its rest state writes
  `outline-width: 0` / `outline-style: none` on the reorder row to keep the row's own focus ring
  off while the handle rings itself. That row ring comes from `focusOutlineStyles.focusVisible`
  inside `Item`, which is unlayered, and an unlayered rule beats any `@layer astryx-base`
  utility at every order. A class version would have to spell `!important`, which then beats the
  theme too. It becomes movable when the ring application inside `Item`/`Layer` is a class as
  well, not when the map alone changes.
- `rowPressPaintStyles.radioRow` is one custom property gated on `:active:not(…)` plus a
  `:not(:has(…))` over nine nested-control selectors, with a coarse-pointer arm. A class can
  spell it, but `packages/core/src/RadioList/RadioList.test.tsx:1176` `declaresRowPress` reads the
  injected StyleX rule text, so the test has to move first.
- `rowPressLayerStyles.cell` remains the variant-per-combination case the header describes.
  Measured: one row element crosses thirteen condition paths there — the enabled arm
  (`[data-astryx-disabled]` absent), `[data-astryx-press=on]` and `=fading`, the coarse
  pointer media, `prefers-reduced-motion`, and the `::before` pseudo-element, some arms
  crossing three of them. It also has to beat `interactionOverlayStyles`' class on
  `background-image` and `animation-name` on the same element, and StyleX wins over a class
  at any order (`privateAttributes/travellingClasses.ts` relies on that); as a class it
  would resolve by sheet order instead. Its four arms (`cell`, `overDividers`,
  `cellWithoutLayer`, `cellOnImage`) compose in call order for the same reason.

## Done

- Map 1 (moved): `rowPressPaintStyles.radioRow` →
  `privateAttributes/pressClasses.ts:rowPressPaintRadioRowClassName`. The row's own paint is
  one inherited custom property, so one class token per pointer arm: the base one carries
  `:active:not([data-astryx-press="on"],[data-astryx-press="fading"]):not(:has(<nested
  controls>))` and `pointer-coarse:` the same with `transparent`. Both rules print, the
  coarse one after the base one at the same specificity. `RadioList/RadioListItem.tsx` appends
  the class through `mergeProps(themeProps(…), {className}, style)`; `RadioListItem`'s
  `xstyle` keeps only `rowPressLayerStyles.cellWithoutLayer` and its own row styles.
  `RadioList.test.tsx` `declaresRowPress` now reads `classesOf` instead of the injected
  StyleX rule text, and `RadioListItem.press.source-build.test.mjs` asserts the class text
  itself (exclusion anchored on the row, coarse arm transparent, nested-control list equal
  to `INTERACTIVE_SELECTORS` less the read-only ones and the row's own radio).
  The stylesheet test registers the class and the sheet measured 2015 rules under its 2020
  ceiling.
- Map 2 (left as a survivor): `ownRingContainerStyles.focusWithin`. A reorderable row with
  `interactiveRef` is a delegate (`Item.tsx:486`), so `Item` applies the unlayered
  `focusOutlineStyles.focusWithin` (`Item.tsx:850`). A class cannot cancel an unlayered
  declaration from `@layer astryx-base` at any order, so the class version would need
  `!important`, which would then beat the `astryx-theme` layer too. It becomes movable when
  `Item` applies that ring as a class, i.e. when `utils/focusOutline.stylex.ts` (marked
  `@deprecated` as staying until StyleX leaves) goes, not when this map alone changes.
- Map 3 (left as a survivor): `rowPressLayerStyles`, with the measured reason above and in
  `pressClasses.ts`.
- `press.stylex.ts` `checkboxRow` is already gone: `privateAttributes/pressClasses.ts` carries it
  for `CheckboxInput`.
