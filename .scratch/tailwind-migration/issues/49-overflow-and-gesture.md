# overflow and gesture surfaces

Status: done — OverlayScrim перенесён в тикет 07 (маркер `overlayScope`)
Blocked by: —
Wave: 6
Ticket: 49
Parent: `00-epic-stylex-to-tailwind-4`

## What

The surfaces that measure or transform their content at runtime: scroll
shadows, overflow measurement, swipe actions and a resize handle. They are
small in count and awkward in kind, because each one passes a measured value
into its own style.

## Files

- `packages/core/src/ScrollableArea/ScrollableArea.tsx` — 2, plus
  `packages/core/src/hooks/useScrollableArea.ts` — 1
- `packages/core/src/OverflowList/OverflowList.tsx` — 3
- `packages/core/src/Swipe/SwipeActionsLayer.tsx` — 3
- `packages/core/src/Resizable/ResizeHandle.tsx` — 2
- `packages/core/src/Overlay/OverlayScrim.tsx` — 1

## Approach

- A measured value travels as an inline `--astryx-*` variable and the class
  reads it (`[translate:var(--astryx-swipe-offset)]`,
  `[mask-image:linear-gradient(…var(--astryx-scroll-fade)…)]`). The class stays
  literal; only the value moves.
- `ResizeHandle` is the one documented survivor of ticket 20: `focusOutlineStyles.focusVisible`
  is applied unlayered by the handle's consumer, so a `@layer astryx-base`
  utility loses at any order, and an inline style cannot express
  `:focus-visible`. Read that note before you touch it; if the focus ring has
  since become a class set, migrate the file, otherwise leave it and say so.
- `useScrollableArea` publishes state to a consumer; move only the paint it
  applies, not the measurement.

## Done when

- No `stylex.create` in these files, except a survivor the ticket names with
  its reason.
- `SwipeActionsLayer`'s gestures still work: its tests and the touch behaviour
  under `pointer: coarse` are unchanged.
- New exports are registered in the coverage block of
  `packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`.
- One `component`/patch changeset.

## Verification

- `pnpm exec vitest run packages/core/src/ScrollableArea packages/core/src/OverflowList packages/core/src/Swipe packages/core/src/Resizable packages/core/src/Overlay packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs`
- `node packages/core/scripts/build-css-tailwind.mjs`
- `pnpm -F @astryxdesign/core typecheck`

## Notes

- Follow the ticket rules in `.scratch/tailwind-migration/README.md`.
- Manual check: a scroll shadow in both colour schemes, and one swipe on a
  coarse pointer.

## Windows

### Window 1 — `ScrollableArea` (`b28de02bc`)

Painted as `scrollableAreaClasses.ts`; per-instance sizes ride
`--astryx-scrollable-area-*`.

### Window 2 — `OverflowList` (`81a515e71`)

`overflowListClasses.ts` covers the container (one line and wrapping), the gap
step map, the hidden measurement copy and the indicator. The row cap rides
`--_overflow-list-max-height`. Measurement logic untouched.

### Window 3 — `SwipeActionsLayer` (`d936072e4`)

`swipeActionsLayerClasses.ts` covers the window, the track and its cover fill,
the entries with their variants and the outermost entry. The gesture's
variables stay the one source of geometry; each class reads them inside a
literal `transform`. Left over:

- `packages/core/src/Overlay/OverlayScrim.tsx` — not migrated. Its reveal arms
  (`showOn`: hover, focus, hover-or-focus) hang on
  `stylex.when.ancestor(':hover' | ':focus-within', overlayScope)` from
  `packages/core/src/Overlay/overlay.markers.stylex.ts`, and the marker class
  is applied by `packages/core/src/Overlay/Overlay.tsx:126` and
  `packages/core/src/Overlay/useOverlay.tsx:207` — both outside this ticket's
  file list, and `useOverlay` consumers put that class on their own element.
  A literal Tailwind class cannot target an ancestor without a `group/…`
  class, and no component in `packages/core` has one. Migrating the scrim
  therefore needs a marker class (or `group`) added in those two files first;
  the scrim's paint (base, positions, aligns, backgrounds, hidden/visible and
  the strips' `@starting-style` entry) can move without it.

### Test conversions

`packages/core/src/Item/Item.test.tsx` read declared rules for the swipe
surface; the built Tailwind sheet is not parseable by jsdom, so eight
assertions now read the class set instead (`classesOf`): the window's
`overflow-clip`/`pointer-events-none`, the track's `end-full`, the one-travel
transform classes, the cover (`opacity-0`, `before:opacity-100`), the disabled
entry (`[filter:opacity(0.5)]`, `after:bg-[inherit]`) and the leading track's
`flex-row-reverse` with the trailing track's `before:bg-[var(--color-error)]`.

### Class-map note

A class in a map escapes the underscore that starts a private variable's name
(`var(--\_item-swipe-travel,0px)`): the stylesheet build needs the escape to
keep the underscore literal, while JavaScript reads the same string as a plain
underscore, which is what the emitted selector matches. `no-useless-escape` is
disabled for `packages/core/src/Swipe/swipeActionsLayerClasses.ts` with that
reason.
