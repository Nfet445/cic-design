# press layers and own-ring containers

Status: ready-for-agent
Blocked by: 52
Wave: 9
Ticket: 53
Parent: `00-epic-stylex-to-tailwind-4`

## What

The last three `stylex.create` blocks in `packages/core/src/privateAttributes`, the ones
ticket 41 could not move once the marker scopes became attributes.

## Files

- `packages/core/src/privateAttributes/press.stylex.ts:138` `rowPressLayerStyles`
- `packages/core/src/privateAttributes/press.stylex.ts:387` `rowPressPaintStyles`
- `packages/core/src/privateAttributes/ownRing.stylex.ts:37` `ownRingContainerStyles`

## Why they stayed

`rowPressLayerStyles.cell` is one element's paint keyed on four attribute states at once
(`data-astryx-press=on|fading`, a coarse pointer, `data-astryx-disabled`) across a
`::before` layer and its own `animationName`/`isolation` arms. A class set cannot express
"this property only while three attributes agree" without one variant per combination, so
the map is the cheaper description today. `rowPressPaintStyles` (two custom properties) and
`ownRingContainerStyles` (four outline longhands behind `data-astryx-own-ring`) are small
enough to move, and they are the place to start.

## Done when

- The two small maps are classes in `privateAttributes/pressClasses.ts` and
  `privateAttributes/ownRingClasses.ts`, registered in
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`.
- `rowPressLayerStyles` either moves or stays with its reason written here and in
  `packages/core/src/privateAttributes/pressClasses.ts`.
- `rg "stylex.create" packages/core/src/privateAttributes` returns nothing but a documented
  survivor.

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
