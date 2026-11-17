# bottom sheet host and lightbox

Status: ready-for-agent
Blocked by: 22
Wave: 6
Ticket: 50
Parent: `00-epic-stylex-to-tailwind-4`

## What

Finish the two surfaces ticket 22 could not carry, now that their shape is known. Both are blocked less by the styling than by their tests, so each starts with the assertions.

- `packages/core/src/BottomSheet/BottomSheet.tsx` — the dialog host and its depth recede (1 creation, `:136`)
- `packages/core/src/BottomSheet/BottomSheetPanel.tsx` — 2 creations (`:286`, `:332`)
- `packages/core/src/BottomSheet/BottomSheetSwitcher.tsx` — 1 creation (`:98`)
- `packages/core/src/Lightbox/Lightbox.tsx` — 2 creations (`:193`, `:578`)

## Why it is its own ticket

`BottomSheet/` owns about twenty `getComputedStyle` and `document.styleSheets` reads across `BottomSheetStacking.test.tsx` and `BottomSheetPanel.test.tsx`, and `Lightbox/Lightbox.tsx` carries about thirteen hundred lines of style. A window that tries to move the map and the assertions together dies at the twenty-minute mark; ticket 22 tried once and reverted after 57 failures.

## Done when

- The four files hold no `stylex.create` except a named survivor.
- Each moved assertion is named in this ticket, with the class set or the sheet case that replaced it.
- The sheet test still passes with one ceiling, raised only with the measured number.

## Verification

- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm exec vitest run packages/core/src/BottomSheet packages/core/src/Lightbox packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Progress

Window 1 (branch `ticket/50-bottom-sheet`, merged `poc/tailwind-layout-primitives` after the commit):

- Done: the depth recede. It moved out of `BottomSheet.tsx`'s `stylex.create`
  into `packages/core/src/BottomSheet/bottomSheetStackMotion.stylex.ts`
  (`motion`, `receded1`, `receded2`), together with
  `bottomSheetStackRecedeContract`, the two transform strings its test
  compares against (same shape as `dialogFullscreenSafeAreaPaddingContract`).
  `stackPositionerStyles` in `BottomSheet.tsx` now reads that module, so the
  stacked switcher step keeps the same rules.
- Assertions moved in `BottomSheetStacking.test.tsx`: the eleven
  `getComputedStyle(...positioner).transform` reads (old `:441`, `:627`,
  `:830-836`, `:954-993`, `:2384`, `:2746`, `:3164`, `:3220`) are now
  `data-sheet-stack-depth` / `data-sheet-stack` assertions on the dialog, and
  one new case asserts `bottomSheetStackRecedeContract.depth1` /
  `.depth2` — the layout question the old reads answered. The unused
  `getPositioner` helper went with them; the file holds no `getComputedStyle`
  call.
- Verified: `node packages/core/scripts/build-css-tailwind.mjs` (175.8 kB before
  the merge, 176.6 kB after it), `vitest run BottomSheet Lightbox
tailwindStylesheet.source-build` 851 passed, `pnpm -F @astryxdesign/core
typecheck` clean.

## What is left

- `BottomSheet.tsx:132` — the dialog host: `dialog`, `dialogOpen`,
  `dialogPanelHost`, `dialogNonModal*`, `positioner*` and the `::backdrop`
  scrim. The scrim needs its duration and timing-function arms chosen in the
  class function rather than layered (`isEntrySettled` → `0.01s`, `isExiting`
  → `var(--_sheet-scrim-easing, linear)`), because two classes of one property
  are ordered by the sheet, not by the map. `--_sheet-scrim-opacity` /
  `--_sheet-scrim-duration` stay inline variables the classes read.
- `BottomSheetPanel.tsx:286` (`pastGrabBarStyles`) and `:332` (`styles`), then
  `BottomSheetPanel.test.tsx:627-634` (a `getComputedStyle` spy), `:738`,
  `:742`, `:845`, `:866` (`document.styleSheets` walks), `:967`, `:1050`.
- `BottomSheetSwitcher.tsx:98` (`flow`, `flowNonModal`), then
  `BottomSheetSwitcher.test.tsx:1626` (transition duration), `:1700-1711`
  (`isolation` / `zIndex`), `:1789` (sheet walk).
- `Lightbox.tsx:193` and `:578` — only if a window is left.

## Notes

- Start from `BottomSheetStacking.test.tsx`: the recorded failures were `expected '' to contain 'scale(.96)'` at `:627` plus the z-index and reduced-motion duration reads in `BottomSheetSwitcher.test.tsx`. Move those reads to `classesOf`/`expectClassSet` from `packages/core/src/__tests__/classNameAssertions.ts` first, then move the map.
- A depth recede or a travel arm that must outrank a layer utility stays in its own tiny `*.stylex.ts`, following `packages/core/src/Card/cardBorder.stylex.ts`.
- Follow the ticket rules in `.scratch/tailwind-migration/README.md`; its `Traps that cost a window each` section is the list this migration already paid for.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
