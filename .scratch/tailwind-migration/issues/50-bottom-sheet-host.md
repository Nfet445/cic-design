# bottom sheet host and lightbox

Status: done
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

Window 2 (commit `5bb4e806b`; `poc/tailwind-layout-primitives` was already
merged, so no sheet-test conflict appeared):

- Done: `BottomSheetPanel.tsx:286` (`pastGrabBarStyles`) and the `clearsGrabBar`
  rule of the map at `:332`. They moved — unchanged — to
  `packages/core/src/BottomSheet/bottomSheetPanelPadding.stylex.ts` as
  `bottomSheetPastGrabBarStyles` / `bottomSheetClearsGrabBarStyles`, with the
  reason in the file header. They cannot be classes: the content box is a
  layout container, so `Layout/container.stylex.ts:71` applies
  `padding-block-start: var(--container-padding-block-start)` and `:259`
  publishes the theme's block-start inset, all unlayered. An unlayered
  declaration beats a `@layer astryx-base` class, so a class for either side
  would be dead. This is a deliberate survivor of the same shape as
  `bottomSheetStackMotion.stylex.ts`, not a deferral.
- Assertions moved: none, and none needed to move. `BottomSheetPanel.test.tsx`
  reads the computed values the padding chain produces (`:967` returns the
  content box, `:1050` reads the panel's `--container-padding-inline-start`),
  and both sides of that chain are still StyleX rules that jsdom injects. The
  `document.styleSheets` walks at `:845`/`:866` and the `getComputedStyle` spy
  at `:627-634` still pass and still read the sheet, so they belong to the
  window that moves `sheet`/`sheetClosing`.
- Verified: `node packages/core/scripts/build-css-tailwind.mjs` (184.6 kB, same
  before and after the change — the survivor adds no Tailwind class),
  `vitest run BottomSheet Lightbox tailwindStylesheet.source-build` 851 passed,
  prettier, eslint, `pnpm -F @astryxdesign/core typecheck` clean.

Window 3 (commit `980e25ec7`; merged `poc/tailwind-layout-primitives` first, no
conflict):

- Done: `BottomSheet.tsx`'s map is gone. `packages/core/src/BottomSheet/
bottomSheetClasses.ts` holds the dialog shell (`DIALOG`), the panel host,
  the non-modal box, the scrim and its transition arms, `POSITIONER` and the
  switcher's `flow` wrapper, exposed as `bottomSheetDialogClassName`,
  `bottomSheetPositionerClassName` and `bottomSheetSwitcherFlowClassName`.
  Each state prints one `display` arm, and `scrimTransition` picks one
  duration and one timing function, so the sheet's order never decides them.
  `bottomSheetScrimReducedMotionDurationClassName` is exported: it is the
  pin's only reader.
- Done: `BottomSheetSwitcher.tsx` holds no `stylex.create` and no `stylex`
  import (its flow wrapper is now `className={...}`).
- Assertions moved, each with what replaced it:
  - `BottomSheetSwitcher.test.tsx:1700-1711` — three `getComputedStyle`
    reads (`isolation`, `zIndex` of the flow wrapper, `zIndex` of the top
    dialog, `zIndex >= 1000` scan) — now `expectClassSet(flow, {includes:
['isolate', 'z-[1000]', 'fixed']})`, `expectClassSet(confirmDialog,
{includes: ['z-1']})` and `expectClassSet(detailsDialog, {excludes:
['z-1', 'z-[1000]']})`.
  - `BottomSheetSwitcher.test.tsx:1789` — the `document.styleSheets` walk for
    a reduced-motion `::backdrop` `transition-duration` — the dialog now
    asserts it carries
    `bottomSheetScrimReducedMotionDurationClassName`, and the rule itself is
    the new sheet case `it('keeps the scrim takeover pin under
prefers-reduced-motion')` in `Layout/tailwindStylesheet.source-build.
test.mjs`, reading `stylesheet.blockOf(...)` for
    `transition-duration:var(--_sheet-scrim-duration,0.01s);`.
  - `BottomSheetStacking.test.tsx:1173` — `classes(a)` contained the StyleX
    class `scrimClosing` — now contains
    `backdrop:[transition-timing-function:var(--_sheet-scrim-easing,linear)]`,
    the class the leaving scrim's timing-function arm prints.
- The sheet test's coverage block registers the new map (both dialog arms, the
  three entry/exit states, the positioner and both flow wrappers). Measured
  1424 rules; the ceiling stayed at 1460 and the comment records the new
  number.
- `BottomSheetPanel.tsx` needed one type fix that predates this window: its
  `getContentProps` call got `mergeProps`'s widened props bag, so it now
  asserts `as ScrollableElementProps<HTMLDivElement>`. `typecheck` was red on
  the branch before this window.
- Verified: `node packages/core/scripts/build-css-tailwind.mjs` (204.8 kB),
  `vitest run BottomSheet Layout/tailwindStylesheet.source-build` 677 passed,
  prettier, eslint, `pnpm -F @astryxdesign/core typecheck` clean.

## What is left

- `Lightbox.tsx:193` and `:578` — the only `stylex.create` left in the four
  files of this ticket, and the whole of the remaining work. Shape it as
  `lightboxClasses.ts` with class functions; per-instance entries become a
  class plus an inline `--_lightbox-*` variable: `pageStyles.position(index)`
  → `--_lightbox-page-offset`, `captionTogglePlaceShown(width, lines)` →
  `--_lightbox-toggle-width` plus a clamp arm, `captionTextBesideToggle(width)`
  → the same width variable. Arbitrary values the sheet must print:
  `grid-rows-subgrid`, `box-content`, `shape-outside`, the `-webkit-box`
  clamp, `content` with its 240 `\A0` lines, `color-mix` backing. `dialog`'s
  `::backdrop` reads `--_lightbox-backdrop-filter` inline;
  `stylex.firstThatWorks('100dvh', '100vh')` becomes `h-dvh`.
- The precedence question that decides how much of it stays in a
  `*.stylex.ts`: many entries land on another component's root, where the
  original `xstyle` order — not the sheet — decided the winner. Passed to
  `control()` as `place`: `closeButton`, `navButton`, `navPrev`, `navNext`
  (`absolute`, `top`, `inset-inline-*`, `zIndex`, `translate`) and `counter`
  all style a Button or Counter root; `controlButton`
  (`pointerEvents: 'auto'`) and `controlIcon` (`color`) do too;
  `zoomButtonFocusInset` (`outlineOffset` on `:focus-visible`) must beat the
  zoom button's own focus ring; `captionClamped`, `captionTextOpen`,
  `captionToggle`, `captionTextToggleOwnLine` style `Text` roots. Check each
  against the target component's current classes: where its own utility sets
  the same property, one arm has to be chosen (a class function) or the rule
  kept as a small survivor with its reason, as the panel's block padding is.
- `Lightbox.test.tsx` names `getComputedStyle` once, in a comment, so the
  unit test needs no assertions moved. The `__tests__/*.browser.spec.ts`
  files read computed values (`translate`, `::backdrop` opacity, caption
  padding, floats, line boxes) — they are the check that every class prints
  what the map printed, so run them.

## Notes

- Start from `BottomSheetStacking.test.tsx`: the recorded failures were `expected '' to contain 'scale(.96)'` at `:627` plus the z-index and reduced-motion duration reads in `BottomSheetSwitcher.test.tsx`. Move those reads to `classesOf`/`expectClassSet` from `packages/core/src/__tests__/classNameAssertions.ts` first, then move the map.
- A depth recede or a travel arm that must outrank a layer utility stays in its own tiny `*.stylex.ts`, following `packages/core/src/Card/cardBorder.stylex.ts`.
- Follow the ticket rules in `.scratch/tailwind-migration/README.md`; its `Traps that cost a window each` section is the list this migration already paid for.
- Manual Windows High Contrast check is part of this ticket's checklist when the component draws a border, an outline or a focus ring.

## Comments

- 2026-11-17: closed. `BottomSheet` host, panel, switcher, scrim and `Lightbox` draw from class maps.
- Survivors, each with its reason in the file: `packages/core/src/Lightbox/lightboxOverrides.stylex.ts` keeps the zoom button's inset focus ring and the on-dark chrome, because two utilities for one property in one layer settle by sheet order; `packages/core/src/BottomSheet/bottomSheetPanelMotion.stylex.ts`, `bottomSheetStackMotion.stylex.ts` and `bottomSheetPanelPadding.stylex.ts` keep the entry, exit and stack motion plus the block-start padding past the grab bar, because a layer utility loses to the unlayered rules they must beat.
- Lightbox page geometry travels as `--astryx-lightbox-page-offset`, and the caption toggle's measured width and line count as `--astryx-lightbox-caption-toggle-width`/`-lines` plus `--_lightbox-caption-place-lines` for the generated place; they are listed in `packages/core/src/theme/derivedVarRegistry.test.ts`.
