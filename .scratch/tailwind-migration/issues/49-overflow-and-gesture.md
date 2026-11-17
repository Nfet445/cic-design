# overflow and gesture surfaces

Status: ready-for-agent
Blocked by: 11
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
