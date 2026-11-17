// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listReorderHandleClasses.ts
 * @input Accepts the row's `align`, when the handle stands in the row instead
 *   of in a slot
 * @output Utility class strings for the reorder handle and for the list's
 *   insertion line
 * @position Internal to List's reorder machinery; scanned by the Tailwind build
 *
 * The handle is a 28 px button whose three lines are one bar and two shadows.
 * It takes only the lines' height in its row (the negative block margins), so
 * a compact row stays compact, and its ring reaches no further than the row's
 * own inline inset.
 */

import {tw} from '../utils/tw';
import type {ItemAlign} from '../Item/Item';

/**
 * The handle's box. The ring comes from `focusOutlineProps`, so the offset
 * here overrides the offset it sets: the handle reaches the row's inline end,
 * and the list clips what passes it. The class wins because `focusOutlineStyles`
 * and this class both land in `astryx-base`, where the sheet order decides.
 */
const HANDLE_FRAME = tw(
  'relative flex shrink-0 items-center justify-center size-7',
  // The lines' height, not the button's: 14 px, centred.
  '[margin-block:-7px]',
  '[margin-inline-end:calc(-1_*_min(8px,var(--_item-inset-inline,8px)))]',
  'p-0 border-0 rounded-[4px]',
  '[outline-offset:calc(-1_*_var(--focus-outline-width))]',
  // Pressed while its row is in reorder mode, as a pressed toggle button is.
  'bg-transparent aria-pressed:bg-[var(--color-overlay-pressed)]',
  // Forced colors strips the painted overlay, which would leave a pressed
  // handle indistinguishable. `forced-color-adjust` must be `none`: the UA
  // keeps native form-control colors for a <button> and would ignore both the
  // Highlight fill and the HighlightText lines.
  'aria-pressed:[forced-color-adjust:none]',
  'aria-pressed:forced-colors:bg-[color:Highlight]',
  'text-[color:var(--color-icon-secondary)]',
  'aria-disabled:text-[color:var(--color-icon-disabled)]',
  'aria-pressed:forced-colors:text-[color:HighlightText]',
  // Where the primary pointer is coarse the page keeps its scrolling and its
  // pinch-zoom until the hold claims the drag: a flick on the handle scrolls,
  // as on iOS. Elsewhere a finger gets the browser's defaults.
  'pointer-coarse:[touch-action:manipulation]',
  'pointer-coarse:[-webkit-tap-highlight-color:transparent]',
  // One bar and its two shadows, in the handle's color. Forced colors keep
  // them (shadows go there otherwise) on the color above.
  'before:block before:pointer-events-none',
  'before:w-5 before:h-[2px] before:rounded-[1px] before:bg-current',
  'before:[box-shadow:0_-6px_currentColor,0_6px_currentColor]',
  'before:[forced-color-adjust:none]',
);

/** The row's own child, in a row without end content: it ends the row. */
const HANDLE_IN_ROW = 'ms-auto';
/** `start`: at the top of the row's content. */
const HANDLE_IN_ROW_START = 'self-start';
/**
 * `first-line`: centred on the label's first line, a line of body text at the
 * top of the row's content. Item's first-line slots centre on it too. Its
 * layout height stays the lines' height, from the end margin. The leading
 * token is a unitless ratio, so the arithmetic below is not a length: the
 * browser drops the declaration and this arm aligns as `start` does.
 */
const HANDLE_IN_ROW_FIRST_LINE = tw(
  'self-start',
  '[margin-block-start:calc((var(--text-body-leading)_-_28px)_/_2)]',
);

/**
 * The handle's classes, given the row's `align` when the handle stands in the
 * row. Outside a slot the handle aligns as the row would align its end slot.
 */
export function listReorderHandleClassName({
  rowAlign,
}: {
  readonly rowAlign?: ItemAlign;
}): string {
  return tw(
    HANDLE_FRAME,
    rowAlign != null && HANDLE_IN_ROW,
    rowAlign === 'start' && HANDLE_IN_ROW_START,
    rowAlign === 'first-line' && HANDLE_IN_ROW_FIRST_LINE,
  );
}

/**
 * The list's own pseudo-element carries the insertion line: decoration with
 * no semantic role, so no element joins the list. The engine shows it with
 * `showReorderLine` and places it with the list's custom properties, which
 * set its top (`--astryx-reorder-line-y`, a compositor translate) and its
 * inline start and size, the dragged row's.
 */
export const listReorderLineClassName = tw(
  'after:absolute after:top-0 after:z-[2] after:pointer-events-none',
  'after:[inset-inline-start:var(--astryx-reorder-line-start,0px)]',
  'after:[inline-size:var(--astryx-reorder-line-size,0px)]',
  'after:[block-size:2px]',
  'after:[border-radius:1px]',
  'after:[background-color:var(--color-accent)]',
  'after:forced-colors:[background-color:Highlight]',
  'after:[forced-color-adjust:none]',
  'after:[translate:0_var(--astryx-reorder-line-y,0px)]',
);
