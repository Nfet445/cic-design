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

## Notes

- Start from `BottomSheetStacking.test.tsx`: the recorded failures were `expected '' to contain 'scale(.96)'` at `:627` plus the z-index and reduced-motion duration reads in `BottomSheetSwitcher.test.tsx`. Move those reads to `classesOf`/`expectClassSet` from `packages/core/src/__tests__/classNameAssertions.ts` first, then move the map.
- A depth recede or a travel arm that must outrank a layer utility stays in its own tiny `*.stylex.ts`, following `packages/core/src/Card/cardBorder.stylex.ts`.
- Follow the ticket rules in `.scratch/tailwind-migration/README.md`; its `Traps that cost a window each` section is the list this migration already paid for.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.
