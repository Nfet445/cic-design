# layout, text and stack utilities

Status: ready-for-agent
Blocked by: —
Wave: 10
Ticket: 54
Parent: `00-epic-stylex-to-tailwind-4`

## What

The utility modules every component composes but that still build a `stylex.create` map.
They are what keeps the StyleX runtime in the package after the components themselves moved.

## Measured scope

- `packages/core/src/Layout/container.stylex.ts` 15 maps — `container()` returns the four
  container paddings and corners from theme variables; Card, Section, Dialog, BottomSheet and
  Drawer call it.
- `packages/core/src/Layout/padding.stylex.ts` 14 maps — the container variables and the overlay
  reset that must stay unlayered.
- `packages/core/src/Layout/paddingStyles.stylex.ts` 1, `containerCorners.stylex.ts` 1,
  `edgeCompensation.stylex.ts` 1, `overlayPaddingReset.stylex.ts` 1.
- `packages/core/src/Text/text.stylex.ts` 15 maps — Heading and lab `LineClamp` still read it.
- `packages/core/src/Stack/stack.stylex.ts` 6 and `Stack/stackItem.stylex.ts` 3 — kept for the
  deprecated public subpaths and for readers that never moved.

## Done when

- Each of those modules publishes custom properties and literal classes instead of a map, and its
  deprecated subpath either re-exports classes or states why it must keep a StyleX export.
- `rg "stylex.create" packages/core/src/Layout packages/core/src/Text packages/core/src/Stack`
  returns nothing but `privateAttributes`-style owners with a written reason.
- Card, Section, Dialog, BottomSheet and Drawer keep their theme overrides: `pnpm -F
@astryxdesign/core build` and `astryx theme build packages/themes/neutral/src/neutralTheme.ts`
  both succeed, and the emitted CSS keeps every `--astryx-<component>-padding*` name.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src/{Layout,Text,Stack,Card,Section,Dialog,BottomSheet,Drawer} packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `pnpm -F @astryxdesign/core typecheck`
- Manual Windows High Contrast check where a border or focus ring moves.

## Notes

- Follow `.scratch/tailwind-migration/README.md`: literal class text only, a per-instance value is a
  class plus an inline `--astryx-*` property, and a rule that must beat a layer utility stays in its
  own module with a reason.
