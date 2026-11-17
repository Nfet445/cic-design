// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateTimeInputClasses.ts
 * @input Uses the theme's spacing, element-size, type-scale, typography and
 *   colour variables and the touch day size
 * @output The utility class strings the date-time field's closed row, both
 *   segments, the typed controls and the touch sheet carry
 * @position Internal to DateTimeInput; the Tailwind build scans it for class
 *   names
 *
 * The arms that must beat the control's own class key off an attribute the
 * component already sets (`aria-disabled`), because two plain utilities in
 * `astryx-base` are ordered by the sheet, not by the class attribute. A colour
 * the old StyleX rule expressed as an extra rule is expressed once, as a
 * ternary: two colour utilities on one element are also sheet-ordered.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

export type DateTimeInputFieldSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<DateTimeInputFieldSize, string> = {
  sm: '[height:var(--size-element-sm)]',
  md: '[height:var(--size-element-md)]',
  lg: '[height:var(--size-element-lg)]',
};

/** The segment wrapper's height for a size, on both surfaces. */
export function dateTimeInputSizeClassName({
  size,
}: {
  size: DateTimeInputFieldSize;
}): string {
  return SIZE_CLASS[size];
}

/** The row that holds the date and the time segment. */
export const dateTimeInputRowClassName = tw(
  'flex',
  'flex-wrap',
  'gap-2',
  '[inline-size:100%]',
  '[min-inline-size:0]',
);

/**
 * A native-picker row keeps a closed-field floor, like `DateInput`'s. Without
 * one, WebKit reports almost no intrinsic width for an `appearance: none`
 * temporal input with an overlay.
 */
export const dateTimeInputNativeRowClassName = 'min-w-[180px]';

/**
 * One segment beside the other. Two 196px bases plus the 8px gap fit at
 * exactly 400px; below that, wrapping moves each growing segment onto its own
 * full-width row.
 */
export const dateTimeInputSegmentClassName = tw(
  'flex-1',
  '[min-inline-size:0]',
  '[flex-basis:196px]',
);

/** The button that opens a picker from the closed field. */
export function dateTimeInputIconButtonClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return tw(
    'flex',
    'items-center',
    'justify-center',
    'p-0',
    'm-0',
    '[border-width:0]',
    '[border-style:none]',
    'bg-transparent',
    'cursor-pointer',
    'rounded-[var(--radius-element)]',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

/** The static clock glyph in front of the time control. */
export const dateTimeInputIconClassName = tw(
  'flex',
  'items-center',
  'justify-center',
  'shrink-0',
);

/**
 * The typed control fills the wrapper's content box and draws nothing of its
 * own: the wrapper owns the border, the padding and the ring.
 *
 * The 16px floor is iOS-only: iOS Safari zooms the page when a focused control
 * sits under 16px, and only iOS WebKit implements `-webkit-touch-callout` to
 * key the coarse-pointer floor to it.
 *
 * A rejected draft keeps the secondary colour, so the typed text reads as a
 * value the control did not accept.
 */
export function dateTimeInputControlClassName({
  isDisabled,
  isRejected,
}: {
  isDisabled: boolean;
  isRejected: boolean;
}): string {
  return tw(
    'block',
    'flex-1',
    '[min-inline-size:0]',
    '[border-width:0]',
    '[border-style:none]',
    'p-0',
    'font-[family-name:var(--font-family-body)]',
    'text-[length:var(--text-body-size)]',
    'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
    '[line-height:var(--text-body-leading)]',
    isRejected
      ? 'text-[color:var(--color-text-secondary)]'
      : 'text-[color:var(--color-text-primary)]',
    'bg-transparent',
    'outline-none',
    'placeholder:text-[color:var(--color-text-secondary)]',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

/** The touch segments take no caret: the sheet collects the value. */
export function dateTimeTouchInputClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return tw(
    'cursor-pointer',
    'caret-transparent',
    'select-none',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

/** The sheet body. The grab bar floats over the panel, so the top inset is 0. */
export const dateTimeTouchSheetBodyClassName = tw(
  'box-border',
  '[inline-size:100%]',
  '[min-inline-size:0]',
  'px-4',
  'pt-0',
  'pb-4',
);

/** The touch surface below the field: panel switch, then the panels. */
export const dateTimeTouchSurfaceClassName = tw(
  'flex',
  'flex-col',
  '[inline-size:100%]',
  '[min-inline-size:0]',
  'gap-3',
);

/** A stacking context that keeps the date and the wheel surface in one cell. */
export const dateTimeTouchStackClassName = tw(
  'grid',
  '[inline-size:100%]',
  '[min-inline-size:0]',
);

/** One stacked panel: the calendar surface or the wheels, in the same cell. */
export const dateTimeTouchPanelClassName = tw(
  'col-start-1',
  'row-start-1',
  'flex',
  'flex-col',
  '[inline-size:100%]',
  '[min-inline-size:0]',
  'gap-2',
);

/**
 * The panel that is not showing. It stays in the layer so both surfaces keep
 * their geometry, and drops out of the tab order and the pointer path.
 */
export const dateTimeTouchHiddenClassName = tw(
  'invisible',
  'opacity-0',
  'pointer-events-none',
);

/** The month heading row above the calendar. */
export const dateTimeTouchHeaderClassName = tw(
  'flex',
  'items-center',
  'gap-1',
  '[height:var(--size-element-lg)]',
);

/** The month-and-year button that swaps the calendar for the wheels. */
export const dateTimeTouchTitleClassName = tw(
  'flex',
  'items-center',
  'gap-1',
  '[min-inline-size:0]',
  'px-2',
  '[border-width:0]',
  '[border-style:none]',
  'rounded-[var(--radius-element)]',
  'bg-transparent',
  'text-[color:var(--color-text-primary)]',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-large-size)]',
  'font-semibold',
  'cursor-pointer',
  '[&[aria-disabled=true]]:cursor-default',
);

/** The month label truncates before the arrows give way. */
export const dateTimeTouchTitleTextClassName = tw(
  '[min-inline-size:0]',
  'overflow-hidden',
  'text-ellipsis',
  'whitespace-nowrap',
);

/** The month arrows and the reset button, pushed to the row's end. */
export const dateTimeTouchHeaderActionsClassName = tw(
  'flex',
  'items-center',
  'gap-0.5',
  'ml-auto',
);

/** A month arrow keeps the 44px touch target under a coarse pointer. */
export const dateTimeTouchArrowClassName = tw(
  'pointer-coarse:min-h-[44px]',
  'pointer-coarse:min-w-[44px]',
);

/** An arrow at the edge of the allowed range keeps its slot but not its ink. */
export const dateTimeTouchUnavailableClassName = 'invisible';

/** The chevron box the direction mirror rotates. */
export const dateTimeTouchArrowIconClassName = 'inline-flex';

/** The reset button keeps the same touch target as the arrows. */
export const dateTimeTouchResetButtonClassName = 'pointer-coarse:min-h-[44px]';

/** The weekday header: seven columns over one small element. */
export const dateTimeTouchWeekdaysClassName = tw(
  'grid',
  'grid-cols-7',
  '[height:var(--size-element-sm)]',
  'items-center',
);

/** One weekday name. */
export const dateTimeTouchWeekdayClassName = tw(
  'text-center',
  'text-[length:var(--text-supporting-size)]',
  'font-normal',
  'text-[color:var(--color-text-secondary)]',
);

/** Keeps the wheel surface's month column under the weekday header. */
export const dateTimeTouchWheelSpacerClassName =
  '[height:var(--size-element-sm)]';

/** The sheet's pinned confirm row, held to the bottom whatever is above it. */
export const dateTimeTouchFooterClassName = tw(
  'flex',
  '[margin-block-start:auto]',
  'pt-1',
);
