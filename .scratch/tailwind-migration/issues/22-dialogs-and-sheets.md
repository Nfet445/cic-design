# dialogs and sheets

Status: partly done — Dialog, DialogHeader, AlertDialog and DrawerHeader have class maps; `Drawer/` (the panel), `BottomSheet/` (6 files), `MobileNav/` and `Lightbox/` still hold StyleX (see Result)
Blocked by: 11,17
Wave: 7
Family: `family:overlay-dismissal`
Ticket: 22
Parent: `00-epic-stylex-to-tailwind-4`

## What

Migrate `Dialog/`, `AlertDialog/`, `Drawer/` (4), `BottomSheet/` (6), `MobileNav/` and `Lightbox/`.

## Files

- `packages/core/src/Dialog/**`
- `packages/core/src/AlertDialog/**`
- `packages/core/src/Drawer/**`
- `packages/core/src/BottomSheet/**`
- `packages/core/src/MobileNav/**`
- `packages/core/src/Lightbox/**`

## Done when

- The `::backdrop`, entry animation and viewport inset come from classes the layer build carries.
- Anchor positioning keeps its CSS-only guarantee (INV21 of `architecture:layer-runtime`).

## Verification

- `pnpm exec vitest run packages/core/src/Dialog packages/core/src/AlertDialog packages/core/src/BottomSheet packages/core/src/Drawer`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`: one ticket, one worker, one pull request, one changeset.
- Reuse the contract in `docs/specs/AST-119-tailwind-utility-styling/spec.md` (FR1–FR10, DEC-1…DEC-7); do not invent a second styling path.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Result

Landed, each with its own class map, its own component edit, an entry in the
changeset `.changeset/dialog-tailwind-classes.md` and a coverage block in
`packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`:

- `cc83d31e1` — `Dialog/dialogClasses.ts`: root geometry and entrance, the
  inline preview, the scrolling inner surface and the sizing/offset variables
  (`--astryx-dialog-width`, `-max-width`, `-max-height`, `-inset-block-start`,
  `-inset-block-end`, `-inset-inline-start`, `-inset-inline-end`). `::backdrop`,
  the entrance `@keyframes` and the viewport inset are classes the layer build
  carries; both keyframes moved into `packages/core/tailwind/astryx.input.css`.
- `54fbf805d` — `AlertDialog/alertDialogClasses.ts`: the action row's
  `[touch-action:pinch-zoom]` and the stacked action's `w-full`. Button already
  keeps `min-w-0 max-w-full`, so the alert no longer repeats that pair.
- `8abbf4056` — `Layer/layerHeaderClasses.ts` (was `Dialog/dialogHeaderClasses.ts`):
  the dialog and drawer headers lay out the same row, so one map serves both, and
  `DrawerHeader` lost its own `stylex.create`.

Deliberately left on StyleX:

- `Dialog/Dialog.tsx` fullscreen safe-area padding. It pads the same element
  `container()` pads, and `container()` is unlayered: an unlayered declaration
  always wins over an `@layer astryx-base` class, so the padding cannot move
  without moving `container()` first.
- `AlertDialog/AlertDialog.tsx` touch motion. It must beat the dialog's
  `open:[animation-name:…]` class, which two classes in one layer cannot do —
  sheet order decides there, not the class attribute.
- `Popover/` is outside this ticket's `## What` and still holds both
  `stylex.create` blocks (the surface caps use a `firstThatWorks` fallback chain
  and `layerViewportInset` constants a class literal cannot import). It belongs
  in its own ticket.
- `Drawer/Drawer.tsx` (panel, scrim, content), `BottomSheet/` (`BottomSheet.tsx`,
  `BottomSheetPanel.tsx` 2, `BottomSheetEdgeTint.tsx`, `BottomSheetSwitcher.tsx`),
  `MobileNav/MobileNav.tsx` (2) and `Lightbox/Lightbox.tsx` (2) are untouched.

Moved assertions (a computed-style, `document.styleSheets` or StyleX debug-class
read replaced by a class-set or inline-variable assertion through
`packages/core/src/__tests__/classNameAssertions.ts`):

- `Dialog/Dialog.test.tsx`: "uses opacity-only fullscreen keyframes for the
  fullscreen variant" (source-text keyframe read) became "keeps the directional
  entrance for standard dialogs and the fade for fullscreen"; the sizing test
  now reads `--astryx-dialog-width`, `-max-width` and `-max-height`.
- `Dialog/Dialog.ssr.test.tsx`: `entryMotion()` reads the class set instead of
  `getComputedStyle(dialog).animationName`, and the hydration test compares
  class sets instead of class-name strings.
- `Dialog/Dialog.source-build.test.mjs`: the Babel/StyleX compile check became a
  source read of the border reset in `dialogClasses.ts`.
- `AlertDialog/AlertDialog.test.tsx`: the five `--x-width` debug reads became
  `--astryx-dialog-width` reads, and the `getComputedStyle(button).maxWidth` /
  `.width` reads became `expectClassSet` over `whitespace-nowrap w-full
max-w-full`.

Still StyleX-backed and unchanged: the two fullscreen safe-area padding
assertions and the container-padding isolation test in `Dialog.test.tsx`.

Verification on the merged tree (`ced593a88`):

- `pnpm exec vitest run packages/core/src/Dialog packages/core/src/AlertDialog
packages/core/src/BottomSheet packages/core/src/Drawer` — 967 passed.
- `pnpm exec vitest run packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
  — 42 passed, rule budget 860, sheet 94.7 kB.
- `node packages/core/scripts/build-css-tailwind.mjs` — 94.7 kB.
- `pnpm -F @astryxdesign/core typecheck` — exit 0.
- Prettier and ESLint on every touched file — clean.

The merge of `poc/tailwind-layout-primitives` (`ced593a88`) needed no conflict
resolution in the sheet test: both sides added their own imports and their own
coverage block, and the merged sheet fits the existing budget of 860.
