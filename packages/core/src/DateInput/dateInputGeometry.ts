// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateInputGeometry.ts
 * @input Two size numbers: a day row and a wheel row
 * @output The picker geometry as plain strings
 * @position Read by dateInputClasses.ts, wheelOptions.ts and the TimeInput touch
 *   field; a plain module, so no build step turns these into variables
 *
 * The picker's whole geometry derives from two numbers, which is what makes
 * the fixed height and the scroll snapping exact:
 *
 *   pane height = weeks x day size            (one month, always 6 rows)
 *   body height = pane height                 (calendar body AND wheel body)
 *   wheel pad   = (body height - item) / 2    (so row 0 can rest centered)
 *
 * Every month pane is the same height as the scrollport, so `scroll-snap-align:
 * start` produces a paged scroller with no partial rest positions, and the
 * wheel overlay swaps in without the component changing size.
 */

/**
 * Week rows per month pane. Fixed at 6 — the most any month needs — so every
 * pane is identical in height and no snap offset ever shifts. Not a themeable
 * variable: it is a fact about the Gregorian calendar, and `repeat()` cannot
 * take a custom property as its count.
 */
export const WEEKS_PER_PANE = 6;

/**
 * The picker's two size inputs. Both stay constants rather than variables: the
 * day size is an accessibility floor — 44px is the comfortable minimum tap
 * target on iOS and Android, and every other target in the sheet is held to it
 * — and the wheel row height is only meaningful against the day size, so
 * tuning one alone produces a picker whose panes no longer agree.
 */
export const dateInputTouchSizes = {
  /**
   * Height of one day row, and the minimum touch target of a day. 44px is the
   * comfortable minimum tap target on both iOS and Android.
   */
  daySize: '44px',
  /**
   * Height of one wheel option row, and so the spacing between options and
   * the height of the selection band.
   *
   * 28px against a day's 44px: a wheel row is scroll-first — a value is
   * chosen by bringing it under the band, and tapping one is a shortcut
   * rather than the mechanism — so it does not carry a day cell's tap-target
   * duty, and a mis-tap costs nothing, because the neighbouring rows are the
   * same control and the result is visible immediately.
   *
   * The row is deliberately close to the text it holds (17px), the way a
   * platform picker packs them: the list should read as one continuous
   * column of values, not as a stack of buttons with air between them. At
   * this height ~9 options are on screen.
   */
  wheelItemSize: '28px',
} as const;

/** Geometry derived from the sizes above, shared across the component. */
export const dateInputTouchGeometry = {
  /** One month pane — and therefore the scrollport, and the wheel body. */
  paneBlockSize: `calc(${WEEKS_PER_PANE} * ${dateInputTouchSizes.daySize})`,
  /** The six equal week rows inside a pane. */
  paneRows: `repeat(${WEEKS_PER_PANE}, 1fr)`,
  /**
   * Padding above the first and below the last wheel option, so either end
   * can come to rest under the centered selection band.
   */
  wheelEdgePadding: `calc((${WEEKS_PER_PANE} * ${dateInputTouchSizes.daySize} - ${dateInputTouchSizes.wheelItemSize}) / 2)`,
} as const;
