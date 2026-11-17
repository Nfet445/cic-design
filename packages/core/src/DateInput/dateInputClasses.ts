// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateInputClasses.ts
 * @input Uses the theme's spacing variable plus the touch wheel geometry
 * @output The utility class strings the date picker's wheel and calendar
 *   surfaces carry, and the inline property that carries a box size no class
 *   can name
 * @position Internal to DateInput; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {CSSProperties} from 'react';
import {dateInputTouchGeometry, dateInputTouchSizes} from './tokens.stylex';
import {tw} from '../utils/tw';

/**
 * One month pane is the wheels' and the scroller's block size, derived from
 * the day size and the weeks per pane. The classes that need it read a
 * variable, and the element writes the derived value inline, so the geometry
 * keeps one source.
 */
export type DateInputPaneStyle = CSSProperties &
  Partial<Record<'--astryx-date-pane-block-size', string>>;

export const dateInputPaneInlineStyle: DateInputPaneStyle = {
  '--astryx-date-pane-block-size': dateInputTouchGeometry.paneBlockSize,
};

/** The class that reads the pane size the element writes. */
export const dateInputPaneBlockSizeClassName =
  '[block-size:var(--astryx-date-pane-block-size)]';

/** The month wheel and the year wheel side by side, one pane tall. */
export const monthYearWheelsClassName = tw(
  'flex',
  'gap-2',
  dateInputPaneBlockSizeClassName,
);

/**
 * A wheel's row height and the vertical offset of one row. The height is a
 * geometry constant; the offset belongs to the row, so it rides the same
 * inline property object.
 */
export type DateInputWheelStyle = DateInputPaneStyle &
  Partial<
    Record<
      | '--astryx-date-wheel-item-size'
      | '--astryx-date-wheel-row-offset'
      | '--astryx-date-wheel-row-color'
      | '--astryx-date-wheel-row-weight',
      string
    >
  >;

export const dateInputWheelInlineStyle: DateInputWheelStyle = {
  '--astryx-date-pane-block-size': dateInputTouchGeometry.paneBlockSize,
  '--astryx-date-wheel-item-size': dateInputTouchSizes.wheelItemSize,
};

/**
 * The inline properties one row carries: its place along the strip and its
 * mark. The mark rides variables because the gesture painter moves it from row
 * to row while the strip travels, and a row's class cannot change mid-flight.
 */
export function dateInputWheelRowInlineStyle({
  isActive,
  isDisabled,
  offsetPx,
}: {
  isActive: boolean;
  isDisabled?: boolean;
  offsetPx: number;
}): DateInputWheelStyle {
  return {
    '--astryx-date-wheel-row-offset': `${offsetPx}px`,
    '--astryx-date-wheel-row-color': isDisabled
      ? 'var(--color-text-disabled)'
      : isActive
        ? 'var(--color-text-accent)'
        : 'var(--color-text-primary)',
    '--astryx-date-wheel-row-weight': isActive
      ? 'var(--font-weight-semibold)'
      : 'var(--font-weight-normal)',
  };
}

/** The inline properties the gesture painter writes on one row. */
export function dateInputWheelRowMarkStyle({
  isActive,
  isDisabled,
}: {
  isActive: boolean;
  isDisabled?: boolean;
}): DateInputWheelStyle {
  return {
    '--astryx-date-wheel-row-color': isDisabled
      ? 'var(--color-text-disabled)'
      : isActive
        ? 'var(--color-text-accent)'
        : 'var(--color-text-primary)',
    '--astryx-date-wheel-row-weight': isActive
      ? 'var(--font-weight-semibold)'
      : 'var(--font-weight-normal)',
  };
}

/**
 * A wheel column moved by the gesture system and the compositor instead of a
 * native scroller.
 */
export const pickerWheelColumnClassName = tw(
  'relative',
  'flex-auto',
  '[min-inline-size:0]',
  dateInputPaneBlockSizeClassName,
  'overflow-hidden',
  'outline-none',
  '[-webkit-tap-highlight-color:transparent]',
);

/**
 * The rows fade toward the column's edges. A static mask: nothing paints it
 * again as the strip moves. It sits inside the column, so it never clips the
 * column's focus ring.
 */
// The fade is a mask, not paint: its stops are alpha-only black, which no
// theme colour names, so the values are literal.
export const pickerWheelFadeClassName = tw(
  'absolute',
  'inset-0',
  'pointer-events-none',
  '[mask-image:linear-gradient(to_bottom,rgb(0_0_0_/_0.7),rgb(0_0_0)_50%,rgb(0_0_0_/_0.7))]',
);

/**
 * The selection band and the strip both centre a row on the scrollport, so
 * both read the same inset. Decorative: the committed value is announced by
 * `aria-selected`.
 */
export const pickerWheelBandClassName = tw(
  'absolute',
  'inset-x-0',
  '[inset-block-start:calc(50%__-_var(--astryx-date-wheel-item-size)_/_2)]',
  '[block-size:var(--astryx-date-wheel-item-size)]',
  'rounded-[var(--radius-element)]',
  'bg-[color:var(--color-neutral)]',
  'pointer-events-none',
);

/** The strip that holds the rows at their places along the wheel. */
export const pickerWheelStripClassName = tw(
  'absolute',
  'inset-x-0',
  '[inset-block-start:calc(50%__-_var(--astryx-date-wheel-item-size)_/_2)]',
  'pointer-events-none',
);

/**
 * One row at its place along the strip. It has no transition, unlike the
 * scrolling column's: a colour or weight that animates lays out and paints
 * every frame on the main thread, and a mark set as a drag lets go would do so
 * through the coast.
 */
export const pickerWheelRowClassName = tw(
  'absolute',
  'inset-x-0',
  '[inset-block-start:var(--astryx-date-wheel-row-offset)]',
  '[block-size:var(--astryx-date-wheel-item-size)]',
  'flex',
  'items-center',
  'justify-center',
  'px-2',
  'box-border',
  'text-[length:var(--text-large-size)]',
  'text-[color:var(--astryx-date-wheel-row-color,var(--color-text-primary))]',
  'font-[var(--astryx-date-wheel-row-weight,var(--font-weight-normal))]',
  'whitespace-nowrap',
  'overflow-hidden',
  'text-ellipsis',
  'select-none',
);

/**
 * The snap-scrolling picker column under a fine pointer. The row pitch and the
 * pane size mirror `dateInputTouchGeometry` as literals: a class assembled by
 * interpolation reaches the DOM with no rule behind it.
 */
export const scrollWheelColumnClassName = tw(
  'relative',
  'flex-1',
  '[min-inline-size:0]',
);

/**
 * The selection band: one row-height plate behind the options. Half the row,
 * measured off the column's centre.
 */
export const scrollWheelBandClassName = tw(
  'absolute',
  'inset-x-0',
  '[inset-block-start:calc(50%_-_14px)]',
  '[block-size:28px]',
  'rounded-[var(--radius-element)]',
  // `--color-neutral`, not `--color-background-muted`: muted is 4.7% alpha,
  // which puts the plate 17 units of colour from the sheet behind it, so the
  // wheels' fade had nothing to happen in.
  'bg-[color:var(--color-neutral)]',
  'pointer-events-none',
);

/**
 * The scrollport. `box-border` is load-bearing and stated rather than
 * inherited from the reset: with content-box the end padding would be added to
 * the scrollport instead of sitting inside it, and every snap position would be
 * wrong.
 */
export const scrollWheelScrollerClassName = tw(
  'box-border',
  // The pane of six day rows, and the room for the first and last rows to
  // reach the centre: `dateInputTouchGeometry.paneBlockSize` and its
  // `wheelEdgePadding`, spelled out.
  '[block-size:264px]',
  'overflow-y-auto',
  'overflow-x-hidden',
  '[scroll-snap-type:y_mandatory]',
  'overscroll-contain',
  '[padding-block:118px]',
  '[perspective:520px]',
  '[transform-style:preserve-3d]',
  '[scrollbar-width:none]',
  'outline-none',
  // Vertical pans scroll the wheel; a two-finger pinch stays the page's, so the
  // page can still zoom over an open picker (WCAG 1.4.4).
  '[touch-action:pan-y_pinch-zoom]',
);

/**
 * One row. Its disabled colour keys off `aria-disabled`: a plain colour beside
 * the active arm's accent would be ordered by the sheet, not by the caller.
 */
export const scrollWheelItemClassName = tw(
  'flex',
  'items-center',
  'justify-center',
  '[block-size:28px]',
  'px-2',
  '[scroll-snap-align:center]',
  '[border-width:0]',
  '[border-style:none]',
  'bg-transparent',
  'text-[length:var(--text-large-size)]',
  'font-normal',
  'text-[color:var(--color-text-primary)]',
  'whitespace-nowrap',
  'cursor-pointer',
  'disabled:cursor-default',
  '[&[aria-disabled=true]]:cursor-default',
  '[&[aria-disabled=true]]:text-[color:var(--color-text-disabled)]',
  'select-none',
  '[transition-property:color,font-weight]',
  '[transition-duration:var(--duration-fast)]',
);

/**
 * The colour fade, on the row and not the tipped inner element: colour does not
 * move a snap area. An animated colour outranks the selected and disabled
 * colours, so those rows do not take this class.
 */
export const scrollWheelItemFadeClassName = tw(
  // Without the guard a browser that cannot drive an animation from a scroll
  // timeline plays these frames once, on the document timeline.
  '[@supports(animation-timeline:view())]:[animation-name:astryxWheelFade]',
  '[animation-timeline:view(y)]',
  '[animation-range:cover_0%_cover_100%]',
  '[animation-fill-mode:both]',
  '[animation-duration:auto]',
  '[animation-timing-function:linear]',
);

/** The row under the band. */
export const scrollWheelItemActiveClassName = tw(
  'text-[color:var(--color-text-accent)]',
  'font-semibold',
);

/**
 * The tip rides an inner element, never the row itself: a snap area is the
 * element's transformed border box, so animating the row would move the very
 * positions the scroller snaps to.
 */
export const scrollWheelItemInnerClassName = tw(
  'flex',
  'items-center',
  'justify-center',
  'size-full',
  'overflow-hidden',
  'text-ellipsis',
  '[backface-visibility:hidden]',
  '[animation-timeline:view(y)]',
  '[animation-range:cover_0%_cover_100%]',
  '[animation-fill-mode:both]',
  '[animation-duration:auto]',
  '[animation-timing-function:linear]',
);

/**
 * The frames the inner element plays. Keyed to `motion-safe` so the reduced
 * arm never fights this one for the same property: an enabled row keeps only
 * the row's colour fade, a disabled one still dims.
 */
export function scrollWheelItemInnerTipClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return isDisabled
    ? tw(
        '[@supports(animation-timeline:view())]:motion-safe:[animation-name:astryxWheelTipAndDim]',
        '[@supports(animation-timeline:view())]:motion-reduce:[animation-name:astryxWheelDim]',
      )
    : '[@supports(animation-timeline:view())]:motion-safe:[animation-name:astryxWheelTip]';
}

/**
 * The month scroller's measured geometry: the spacer's full inline size, and
 * one pane's place and width along it. The scroller measures its own box, so
 * every value is per instance and rides a variable the element writes.
 */
export type DateInputMonthScrollerStyle = CSSProperties &
  Partial<
    Record<
      | '--astryx-date-pane-inline-start'
      | '--astryx-date-pane-inline-size'
      | '--astryx-date-spacer-inline-size',
      string
    >
  >;

/** The variable the spacer reads to hold every pane at once. */
export function dateInputMonthSpacerStyle(
  inlineSize: number,
): DateInputMonthScrollerStyle {
  return {'--astryx-date-spacer-inline-size': `${inlineSize}px`};
}

/** The variables one pane reads: where it starts, and how wide it is. */
export function dateInputMonthPaneStyle({
  insetInlineStart,
  inlineSize,
}: {
  insetInlineStart: number;
  inlineSize: number;
}): DateInputMonthScrollerStyle {
  return {
    '--astryx-date-pane-inline-start': `${insetInlineStart}px`,
    '--astryx-date-pane-inline-size': `${inlineSize}px`,
  };
}

/**
 * The month scrollport. `box-sizing` is stated rather than inherited from the
 * reset: the pane size, the snap offsets and the virtualization all key off
 * the measured box.
 *
 * `pan-x` splits the gesture by axis — horizontal pans stay with the calendar
 * and vertical ones reach the sheet as swipe-to-dismiss.
 */
export const monthScrollerClassName = tw(
  'relative',
  'box-border',
  '[block-size:var(--astryx-date-pane-block-size)]',
  'overflow-x-auto',
  'overflow-y-hidden',
  '[scroll-snap-type:x_mandatory]',
  'overscroll-contain',
  '[scrollbar-width:none]',
  '[touch-action:pan-x]',
);

/** The spacer that holds every month's pane, so no pane is ever unmounted. */
export const monthScrollerSpacerClassName = tw(
  'relative',
  'block',
  'h-full',
  '[inline-size:var(--astryx-date-spacer-inline-size)]',
);

/**
 * One month, as a six-row grid, placed into the spacer. No
 * `scroll-snap-stop: always`: a fling may carry past several months.
 */
export const monthPaneClassName = tw(
  'absolute',
  'inset-y-0',
  '[block-size:var(--astryx-date-pane-block-size)]',
  '[inset-inline-start:var(--astryx-date-pane-inline-start)]',
  '[inline-size:var(--astryx-date-pane-inline-size)]',
  '[scroll-snap-align:start]',
  'grid',
  'grid-cols-7',
  'grid-rows-6',
);

/** A week lays its cells straight into the pane's grid. */
export const monthRowClassName = 'contents';

/** One grid cell, which centres the day's tap target. */
export const monthCellClassName = tw(
  'relative',
  'flex',
  'items-center',
  'justify-center',
);

/**
 * A day's tap target: the full cell, floored at the touch target size, and no
 * browser chrome of its own. A tap must not also select the number inside it.
 */
export const monthDayClassName = tw(
  'flex',
  'items-center',
  'justify-center',
  'w-full',
  'h-full',
  'min-w-[44px]',
  'min-h-[44px]',
  'p-0',
  'm-0',
  '[border-width:0]',
  '[border-style:none]',
  'bg-transparent',
  'text-[color:var(--color-text-primary)]',
  'text-[length:var(--text-body-size)]',
  'font-normal',
  'cursor-pointer',
  'disabled:cursor-default',
  'select-none',
  '[-webkit-tap-highlight-color:transparent]',
  '[&[aria-disabled=true]]:cursor-default',
);

/**
 * A day from the month either side. Muted exactly as the desktop calendar mutes
 * it: the secondary colour and half opacity together are what make it read as
 * context rather than as a dimmer choice.
 */
export const monthDayOutsideClassName = tw(
  'text-[color:var(--color-text-secondary)]',
  'opacity-50',
);

/**
 * A day the range rules out. It fades whatever colour the day already had
 * instead of recolouring it, so a spilled day stays a step apart from an
 * in-month one and both land lighter than an enabled spill day.
 *
 * The opacity keys off `aria-disabled`, not a plain utility: the outside arm's
 * `opacity-50` is a plain utility too, and two plain utilities are ordered by
 * the sheet rather than by the class attribute.
 */
export const monthDayDisabledClassName = tw(
  '[&[aria-disabled=true]]:opacity-30',
  'cursor-default',
);

/**
 * The circular puck inside the tap target. Sizing the puck rather than the
 * button keeps the target at the full cell while the visual stays a circle.
 */
export const monthDayPuckClassName = tw(
  'flex',
  'items-center',
  'justify-center',
  'size-[36px]',
  'rounded-full',
  '[border-width:var(--border-width)]',
  'border-solid',
  'border-transparent',
  'bg-transparent',
  '[transition-property:background-color,_color,_border-color]',
  '[transition-duration:var(--duration-fast)]',
);

/**
 * The hover tint, guarded twice: a touch screen must not keep it on the last
 * tapped day, and a disabled day must not take it either.
 */
export const monthDayPuckHoverableClassName =
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[var(--color-overlay-hover)]';

/** Today, marked on the puck rather than on the day's text. */
export const monthDayPuckTodayClassName = tw(
  'border-[color:var(--color-border-emphasized)]',
  'font-semibold',
);

/** The selection puck. The caller does not apply the hover tint beside it. */
export const monthDayPuckSelectedClassName = tw(
  'bg-[color:var(--color-accent)]',
  'border-[color:var(--color-accent)]',
  'text-[color:var(--color-on-accent)]',
  'font-semibold',
);

/** The calendar toggle beside the typed date: a glyph, no box of its own. */
// The toggle keeps its focus ring in StyleX (`focusOutlineStyles`), a shared
// rule the class map does not own; the ring is not a property this map sets.
export function dateInputToggleClassName({
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
    // A disabled toggle still takes the tab stop that carries its reason, so
    // the default cursor keys off the attribute rather than `disabled`.
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

/** The closed field's row: the calendar toggle, the control and the overlay. */
export const nativeDateFieldWrapperClassName = 'gap-2';

/**
 * The calendar toggle beside the native control. Its disabled cursor keys off
 * the attribute: the field never renders native `disabled`.
 */
export const nativeDateFieldIconButtonClassName = tw(
  'flex',
  'items-center',
  'justify-center',
  'p-0',
  'm-0',
  'border-0',
  'bg-transparent',
  'cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'rounded-[var(--radius-element)]',
);

/** The placeholder the empty overlay draws. */
export const nativeDateFieldOverlayPlaceholderClassName =
  'text-[color:var(--color-text-secondary)]';

/** A rejected value: the secondary colour, the same one a placeholder reads. */
export const nativeDateFieldInvalidTextClassName =
  'text-[color:var(--color-text-secondary)]';

/** The value the overlay draws. */
export const nativeDateFieldOverlayValueClassName =
  'text-[color:var(--color-text-primary)]';

/**
 * The native date control. It carries no border, padding or background of its
 * own: the field wrapper draws those.
 *
 * Below 16px iOS zooms the page when the control takes focus. Only iOS WebKit
 * implements `-webkit-touch-callout`, so the coarse-pointer floor is keyed to
 * iOS alone.
 *
 * A native date control sizes from its internal edit fields, not from
 * `line-height`, so the box is pinned to one text line. `1lh` tracks the font
 * for free; a browser without it falls back to the same calculation.
 *
 * A rejected value reads as secondary text, so the typed date reads as one the
 * control did not accept.
 */
export function nativeDateFieldInputClassName({
  isDisabled,
  isHidden,
  isInvalid,
}: {
  isDisabled: boolean;
  isHidden: boolean;
  isInvalid: boolean;
}): string {
  return tw(
    'block',
    'flex-1',
    'min-w-0',
    'border-0',
    'p-0',
    'font-[family-name:var(--font-family-body)]',
    'text-[length:var(--text-body-size)]',
    'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
    'leading-[var(--text-body-leading)]',
    // The colour is stated once, not layered as two utilities of one property:
    // the sheet orders those, not the class attribute.
    isInvalid
      ? nativeDateFieldInvalidTextClassName
      : 'text-[color:var(--color-text-primary)]',
    'bg-transparent',
    'outline-none',
    '[height:1lh]',
    '[@supports_not_(height:1lh)]:[height:calc(var(--text-body-size)_*_var(--text-body-leading))]',
    'pointer-coarse:[@supports(-webkit-touch-callout:none)]:[height:calc(max(1rem,var(--text-body-size))_*_var(--text-body-leading))]',
    'appearance-none',
    // Chromium paints a second calendar glyph inside the control; this surface
    // ships a toggle of its own. iOS gives the control its own chrome, which
    // no reset of ours reaches.
    '[&::-webkit-calendar-picker-indicator]:hidden',
    '[&::-webkit-date-and-time-value]:[text-align:start]',
    '[&::-webkit-date-and-time-value]:m-0',
    '[&::-webkit-date-and-time-value]:p-0',
    '[&::-webkit-date-and-time-value]:leading-[inherit]',
    '[&::-webkit-date-and-time-value]:min-h-0',
    '[&::-webkit-datetime-edit]:p-0',
    '[&::-webkit-datetime-edit]:leading-[inherit]',
    // WebKit paints the value into one run the UA stylesheet gives no colour,
    // so the overlay's own text takes that space.
    isHidden && 'text-transparent [-webkit-text-fill-color:transparent]',
    isDisabled && 'cursor-default',
  );
}

/** The box the control and its overlay share. */
export const nativeDateFieldSlotClassName = tw(
  'relative',
  'flex',
  'items-center',
  'flex-1',
  '[min-inline-size:0]',
);

/**
 * The formatted value over the native control. It repeats the control's font
 * so the two baselines match, and takes no pointer events: a tap has to reach
 * the control underneath, which is what raises the OS picker.
 *
 * Both insets bound it to the slot; an end inset less block would let a long
 * date paint over the clear button.
 */
export const nativeDateFieldOverlayClassName = tw(
  'absolute',
  'inset-0',
  'block',
  'text-[length:var(--text-body-size)]',
  'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
  'leading-[var(--text-body-leading)]',
  'pointer-events-none',
  'overflow-hidden',
  'whitespace-nowrap',
  'text-ellipsis',
);

export type DateInputSize = 'sm' | 'md' | 'lg';

/** The wrapper's block size for a size, and the narrowest it may render. */
export function dateInputSizeClassName({size}: {size: DateInputSize}): string {
  return tw(SIZE_CLASS[size], 'min-w-[180px]');
}

const SIZE_CLASS: Record<DateInputSize, string> = {
  sm: '[height:var(--size-element-sm)]',
  md: '[height:var(--size-element-md)]',
  lg: '[height:var(--size-element-lg)]',
};

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
export function dateInputControlClassName({
  isDisabled,
  isInvalid,
}: {
  isDisabled: boolean;
  isInvalid: boolean;
}): string {
  return tw(
    'block',
    'flex-1',
    'min-w-0',
    '[border-width:0]',
    '[border-style:none]',
    'p-0',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-body-size)]',
    'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
    '[line-height:var(--text-body-leading)]',
    'text-[color:var(--color-text-primary)]',
    'bg-transparent',
    'outline-none',
    'placeholder:text-[color:var(--color-text-secondary)]',
    isInvalid &&
      '[&[aria-invalid=true]]:text-[color:var(--color-text-secondary)]',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

// ---------------------------------------------------------------------------
// The touch field's sheet
// ---------------------------------------------------------------------------

/**
 * Every transition in the surface swap reads one duration, `--duration-fast`,
 * so the header, both panels and the chevron land together. The reduced-motion
 * arm keeps the transition's shape and drops its travel to a frame.
 */
const SWAP_TRANSITION =
  'motion-reduce:[transition-duration:0.01s] [transition-duration:var(--duration-fast)]';

/** Gone, but still laid out: the corner keeps its size while it fades. */
const HIDDEN_CHROME = 'invisible opacity-0 pointer-events-none';

/** The closed touch field's row: the toggle, the control and the overlay. */
export const touchDateFieldWrapperClassName = 'gap-2';

/**
 * The calendar toggle beside the read-only input. The field never renders
 * native `disabled`, so the default cursor keys off the attribute.
 */
export function touchDateFieldIconButtonClassName({
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

/**
 * The read-only input that opens the sheet. The picker is the input method
 * here, so text entry has no place: the caret stays invisible even though the
 * control takes focus, and the text cannot be selected.
 */
export function touchDateFieldInputClassName({
  isDisabled,
}: {
  isDisabled: boolean;
}): string {
  return tw(
    'block',
    'flex-1',
    '[min-inline-size:0]',
    '[border-width:0]',
    '[border-style:none]',
    'p-0',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-body-size)]',
    'pointer-coarse:[@supports(-webkit-touch-callout:none)]:text-[length:max(1rem,var(--text-body-size))]',
    '[line-height:var(--text-body-leading)]',
    'text-[color:var(--color-text-primary)]',
    'bg-transparent',
    'outline-none',
    '[caret-color:transparent]',
    'cursor-pointer',
    'select-none',
    'placeholder:text-[color:var(--color-text-secondary)]',
    isDisabled && '[&[aria-disabled=true]]:cursor-default',
  );
}

/** The sheet's surface: a column the picker fills. */
export const touchDateSurfaceClassName = tw(
  'flex',
  'flex-col',
  '[inline-size:100%]',
);

/**
 * The header carries no inline padding of its own: the content box owns the
 * inset, and any extra here would push the arrows off the line the day grid
 * sits on.
 */
export const touchDateHeaderClassName = tw(
  'flex',
  'items-center',
  'justify-between',
  'gap-2',
  '[block-size:var(--size-element-lg)]',
);

/**
 * Both arrows together at the trailing corner. The plate starts below the
 * header, so the arrows are what the wheels' layer cannot cover: they fade on
 * that layer's timing instead of blinking out a beat early.
 */
export function touchDateMonthArrowsClassName({
  isHidden,
}: {
  isHidden: boolean;
}): string {
  return tw(
    'flex',
    'items-center',
    'gap-0.5',
    '[margin-inline-start:auto]',
    '[transition-property:opacity,visibility]',
    SWAP_TRANSITION,
    '[transition-timing-function:linear]',
    isHidden && HIDDEN_CHROME,
  );
}

/**
 * An arrow that steps a month, floored at the 44px touch target on a coarse
 * pointer — `Button` tops out at 36px. An arrow with nowhere to go keeps its
 * box, so the remaining one does not slide sideways at the edge of the range.
 */
export function touchDateMonthArrowClassName({
  isUnavailable,
}: {
  isUnavailable: boolean;
}): string {
  return tw(
    'pointer-coarse:min-h-[44px]',
    'pointer-coarse:min-w-[44px]',
    isUnavailable && 'invisible',
  );
}

/**
 * A bare inline wrapper puts the glyph on the text baseline, a few px above
 * the button's optical centre. Core's Calendar carries the same rule.
 */
export const touchDateMonthArrowIconClassName = 'inline-flex';

/** Reset, past the arrows, and gone with them on the wheels. */
export function touchDateHeaderResetClassName({
  isHidden,
}: {
  isHidden: boolean;
}): string {
  return tw(
    'flex',
    'items-center',
    '[transition-property:opacity,visibility]',
    SWAP_TRANSITION,
    '[transition-timing-function:linear]',
    isHidden && HIDDEN_CHROME,
  );
}

/** The same 44px floor the arrows take; `Button`'s `sm` is 32px. */
export const touchDateResetButtonClassName = 'pointer-coarse:min-h-[44px]';

/**
 * The month and year, and the toggle into the wheels: leading, so it reads
 * first and sits on the day grid's line. It is the part that gives on a narrow
 * screen, so the corner cannot be pushed off-viewport.
 */
export const touchDateTitleClassName = tw(
  'flex',
  'items-center',
  'gap-1',
  '[block-size:100%]',
  'px-2',
  // Pulls the text back onto the grid's line: the button's own padding would
  // otherwise inset the label past it.
  '[margin-inline-start:calc(var(--spacing-2)*-1)]',
  '[border-width:0]',
  '[border-style:none]',
  'rounded-[var(--radius-element)]',
  'bg-transparent',
  'text-[color:var(--color-text-primary)]',
  'text-[length:var(--text-large-size)]',
  'font-semibold',
  'cursor-pointer',
  '[&[aria-disabled=true]]:cursor-default',
  'whitespace-nowrap',
  '[min-inline-size:0]',
  'overflow-hidden',
);

/** The month and year, ellipsed rather than pushing the corner off-screen. */
export const touchDateTitleTextClassName = tw(
  '[min-inline-size:0]',
  'overflow-hidden',
  'text-ellipsis',
);

/**
 * The one part of the swap that keeps `--ease-standard`, because it is the one
 * part that travels: a rotation has a distance to cover, and fast-out-slow-in
 * is what that curve is for.
 */
export function touchDateTitleChevronClassName({
  isOpen,
}: {
  isOpen: boolean;
}): string {
  return tw(
    'inline-flex',
    'shrink-0',
    '[transition-property:transform]',
    SWAP_TRANSITION,
    '[transition-timing-function:var(--ease-standard)]',
    isOpen && 'rotate-180',
  );
}

/**
 * The weekday row sits above the plate's reach, so it fades on the layer's
 * timing. Hidden rather than unmounted: the surface still owes it its height,
 * or opening the wheels would make the picker shorter.
 */
export function touchDateWeekdaysClassName({
  isHidden,
}: {
  isHidden: boolean;
}): string {
  return tw(
    'grid',
    'grid-cols-7',
    '[block-size:var(--size-element-sm)]',
    'items-center',
    '[transition-property:opacity,visibility]',
    SWAP_TRANSITION,
    '[transition-timing-function:linear]',
    isHidden && 'invisible opacity-0',
  );
}

/** One weekday name: decorative, so the muted app support reads it. */
export const touchDateWeekdayClassName = tw(
  'text-center',
  'text-[length:var(--text-supporting-size)]',
  'font-normal',
  'text-[color:var(--color-text-secondary)]',
);

/**
 * The two panels share one grid cell, one month pane tall. The size is a
 * geometry constant spelled out, because a class assembled by interpolation
 * reaches the DOM with no rule behind it; it mirrors
 * `dateInputTouchGeometry.paneBlockSize`.
 */
export const touchDateBodyClassName = tw(
  'grid',
  '[block-size:264px]',
  'relative',
);

/** One panel in the shared cell. */
export const touchDatePanelClassName = tw('[grid-area:1/1]', 'min-w-0');

/**
 * The layer underneath — the calendar and its footer action. It never fades:
 * `visibility` alone moves, so the layer is covered and uncovered rather than
 * seen changing, and it still leaves the accessibility tree at the end.
 */
export function touchDatePanelBeneathClassName({
  isHidden,
}: {
  isHidden: boolean;
}): string {
  return tw(
    '[transition-property:visibility]',
    SWAP_TRANSITION,
    isHidden && 'invisible pointer-events-none',
  );
}

/**
 * The month and year, as one opaque layer that fades in and out on top. The
 * background is what makes the fade uniform, and `isolate` is what makes the
 * plate actually cover: backgrounds paint before text across siblings, so
 * without a stacking context the calendar's numbers show through an opaque
 * plate at the two ends of the fade.
 */
export function touchDatePanelOverlayClassName({
  isHidden,
}: {
  isHidden: boolean;
}): string {
  return tw(
    'bg-[color:var(--color-background-surface)]',
    'isolate',
    '[transition-property:opacity,visibility]',
    SWAP_TRANSITION,
    '[transition-timing-function:linear]',
    isHidden && HIDDEN_CHROME,
  );
}

/** The footer takes the content box's inline inset, like the header. */
export const touchDateFooterClassName = tw(
  '[padding-block-start:var(--spacing-2)]',
  'grid',
  'grid-cols-1',
);

/** One footer action per surface, both in the same cell. */
export const touchDateFooterActionClassName = tw('[grid-area:1/1]', 'flex');

/**
 * One inset on every edge but the top: BottomSheet keeps the band under its
 * grab bar, which reads as the same inset because the bar sits in it.
 */
export const touchDateSheetBodyClassName = tw(
  'px-4',
  '[padding-block-start:0]',
  '[padding-block-end:var(--spacing-4)]',
);
