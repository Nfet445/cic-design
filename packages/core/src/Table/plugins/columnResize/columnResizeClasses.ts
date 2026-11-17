// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file columnResizeClasses.ts
 * @input Tailwind utilities
 * @output Exports the resize handle, its indicator, the header row's hint
 *   variable and the header cell's positioning classes
 * @position Table column-resize plugin; read by useTableColumnResize
 */

import {tw} from '../../../utils/tw';

/**
 * The handle is a wide transparent hit area, kept entirely inside the `<th>`:
 * extending outside gets clipped by the adjacent `<th>`'s overflow. It reaches
 * through the body rows because its cell is `relative overflow-visible`.
 *
 * `top-0` does not land on the table's top edge — the handle hangs from its
 * cell's content box, and the header's vertical centring shifts that box down
 * by an amount that depends on how tall its own content is. Subtracting that
 * drop keeps the handle from hanging past the last row and forcing the scroll
 * wrapper to scroll. Both variables are set by the plugin's ResizeObserver;
 * they fall back to header height until it fires.
 *
 * The visible line is `::after`, so it spans the full handle height
 * independently of the border box, and the resting colour is inherited from
 * the row's `--resize-hint`: an ancestor selector here would outrank the
 * handle's own `:hover` and the boundary under the pointer would never reach
 * accent. The pointer arm passes through the same `--resize-hint-gate` as the
 * row hint, because horizontal scrolling drags columns under a still pointer.
 * Focus-visible is ungated: focus is always deliberate.
 *
 * A coarse pointer loses pointer interaction only (dragging a hairline by
 * finger is a non-goal, and an invisible 8px strip that swallows touches is
 * worse than no target); the handle stays rendered and focusable.
 */
export const COLUMN_RESIZE_HANDLE_CLASS = tw(
  'absolute end-0 top-0 z-[1] w-2',
  'h-[calc(var(--table-resize-height,100%)_-_var(--table-resize-offset,0px))]',
  'touch-none select-none',
  'cursor-ew-resize [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  '[--indicator-color:var(--resize-hint,transparent)]',
  '[&:hover:where(:not(:disabled,[aria-disabled=true]))]:[--indicator-color:var(--resize-hint-gate,var(--color-accent))]',
  'focus-visible:[--indicator-color:var(--color-accent)]',
  '[@media(pointer:coarse)]:pointer-events-none',
  "after:content-[''] after:absolute after:end-0 after:top-0 after:bottom-0",
  'after:w-[var(--indicator-width,1px)]',
  'after:bg-[var(--indicator-color,transparent)]',
  'after:[transition:background-color_150ms_ease,width_150ms_ease]',
);

/**
 * Publishes the hint colour the handles read at rest. Hover has to be caught on
 * the row so that entering the header anywhere reveals every boundary, not only
 * the cell under the pointer; pointer-only, because there is no hover to lead
 * with on touch and the handles ignore touch there regardless.
 *
 * `--resize-hint-gate` is the scroll gate: the scroll listener sets it to
 * `transparent` on the scroll wrapper while the region is moving, which wins
 * because a set custom property beats the fallback arm of `var()`.
 */
export const COLUMN_RESIZE_HEADER_ROW_CLASS = tw(
  '[--resize-hint:transparent]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:[--resize-hint:var(--resize-hint-gate,var(--color-border))]',
);

/** The handle's containing block, and the overflow that lets it reach down. */
export const COLUMN_RESIZE_HEADER_CELL_CLASS = 'relative overflow-visible';
