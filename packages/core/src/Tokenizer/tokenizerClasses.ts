// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokenizerClasses.ts
 * @input A tokenizer's size, presentation, disabled state and grouped scroll
 *   state
 * @output Utility class names for the field's size floor, the token row and
 *   its insets, the start icon, the end lane,
 *   the grouped track and its edge fades, the expanded layer and the bottom
 *   sheet's field, trigger and placeholder
 * @position Style primitives; scanned by the Tailwind build
 *
 * The input's own compact and at-max states stay on StyleX (`Tokenizer.tsx`):
 * they reach the input through `BaseTypeahead`'s `inputXStyle` prop, which
 * takes StyleX values only. They face the same tie against
 * `typeaheadInputClassName`'s own `flex` and `min-w` utilities inside the
 * layer, where the sheet's order — not the state — would decide.
 */

import {tw} from '../utils/tw';

/** The field's size floor, the same one the shared input box takes. */
export const tokenizerFieldSizeClassName: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'min-h-[var(--size-element-sm)]',
  md: 'min-h-[var(--size-element-md)]',
  lg: 'min-h-[var(--size-element-lg)]',
};

/**
 * The exact height a truncated row and the expanded layer's placeholder pin.
 * Truncation drops the size floor, so this height is the only one in play.
 */
export const tokenizerFixedHeightClassName: Record<'sm' | 'md' | 'lg', string> =
  {
    sm: 'h-[var(--size-element-sm)]',
    md: 'h-[var(--size-element-md)]',
    lg: 'h-[var(--size-element-lg)]',
  };

/**
 * The row's own box, on the same element as the shared input box.
 *
 * One wrap class per row, never both: two `flex-wrap` utilities are ordered by
 * the sheet, not by the row's state, and the sheet emits `flex-wrap` after
 * `flex-nowrap`. The gutter is the axis split of `gap` (`gap-x`/`gap-y`), whose
 * longhands outrank the box's own uniform `gap` whatever order the sheet emits.
 */
export function tokenizerRowClassName(isNoWrap: boolean): string {
  return tw(
    isNoWrap ? 'flex-nowrap' : 'flex-wrap',
    'gap-x-1',
    'gap-y-1',
    'cursor-text',
    '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  );
}

/**
 * A row's inset when it holds tokens. Per-side utilities, not the shorthand:
 * each edge rule outranks the shared box's `px`/`py` whatever order the sheet
 * emits. 3px keeps a token's 4px radius concentric with the box's 8px one
 * (8 - 4 - 1). The end edge also carries the measured end lane's reserve, which
 * every row must stop short of because the lane is out of flow.
 */
export const tokenizerTokenRowClassName = tw(
  '[padding-block-start:calc(var(--spacing-1)_-_1px)]',
  '[padding-block-end:calc(var(--spacing-1)_-_1px)]',
  'ps-[calc(var(--spacing-1)_-_1px)]',
  'pe-[calc(var(--spacing-1)_-_1px_+_var(--astryx-tokenizer-end-lane-reserve,0px))]',
  // The row gap matches the block inset, so wrapped rows look evenly spaced.
  'gap-y-[calc(var(--spacing-1)_-_1px)]',
);

/** A truncated row keeps one line, so its overflow is clipped, not wrapped. */
export const tokenizerTruncatedRowClassName = 'overflow-hidden';

/** A token in the row, and the wrapper a `renderToken` pill renders into. */
export const tokenizerTokenClassName = tw(
  'flex shrink-0 max-w-full relative z-[1]',
);

/**
 * Restores the default 8px inline-start inset beside tokens, since the row
 * padding drops to 3px for border concentricity.
 */
export const tokenizerStartIconWithTokensClassName = tw(
  'relative z-[1]',
  'ms-[calc(var(--spacing-2)_-_var(--spacing-1)_+_1px)]',
);

/**
 * The lane pinned to the field's first row: the busy indicator, `endContent`
 * and the clear button.
 */
export const tokenizerEndLaneClassName = tw(
  'absolute end-2 z-[1] flex shrink-0 items-center gap-2',
);

const END_LANE_SIZE_CLASSES = {
  sm: 'top-[calc(var(--size-element-sm)/2_-_1px)] [transform:translateY(-50%)]',
  md: 'top-[calc(var(--size-element-md)/2_-_1px)] [transform:translateY(-50%)]',
  lg: 'top-[calc(var(--size-element-lg)/2_-_1px)] [transform:translateY(-50%)]',
};

/** Centres the lane on the field's first row. */
export function tokenizerEndLaneSizeClassName(
  size: 'sm' | 'md' | 'lg',
): string {
  return END_LANE_SIZE_CLASSES[size];
}

/**
 * In a grouped row the lane is a flex sibling, not a pinned box: the row never
 * wraps, so there is no first row to pin to and nothing to measure.
 */
export const tokenizerEndLaneInGroupClassName = tw(
  'static [transform:none] ms-[3px]',
);

/** Gives back the gap the track's bleed takes. */
export const tokenizerEndLaneInGroupWithTokensClassName =
  'me-[calc(var(--spacing-2)_-_3px)]';

/**
 * Keeps the idle Spinner's box — which a theme may paint — out of sight and
 * out of rendering, while it holds the lane's measured width.
 */
export const tokenizerIdleSpinnerClassName =
  'invisible [content-visibility:hidden]';

/**
 * The inset the measured end lane reserves, on the input and on the sheet's
 * trigger. A `padding-inline-end` utility, not a shorthand: the edge rule
 * outranks the uniform `p-0` those controls carry, whatever order the sheet
 * emits.
 */
export const tokenizerEndLaneReserveClassName =
  '[padding-inline-end:var(--astryx-tokenizer-end-lane-reserve,0px)]';

/** The collapsed row's "+N more" summary. */
export const tokenizerOverflowTextClassName = tw(
  'shrink-0 whitespace-nowrap px-1',
  '[font-size:var(--text-supporting-size)]',
  'text-[color:var(--color-text-secondary)]',
);

/**
 * The grouped row's scrollport. It bleeds out to the row's padding edge so a
 * token's focus ring keeps the room that padding gives it, and shows no
 * scrollbar: one would take most of a 28-32px row.
 */
export const tokenizerGroupedTrackClassName = tw(
  'flex items-center self-stretch flex-1 min-w-0',
  'm-[calc(1px_-_var(--spacing-1))] p-[calc(var(--spacing-1)_-_1px)]',
  '[scrollbar-width:none]',
  // Forced colors bring the platform scrollbar back.
  'forced-colors:[scrollbar-width:thin]',
  // Focus scrolling keeps a focused control clear of a faded edge.
  'scroll-px-[calc(var(--spacing-1)_-_1px_+_var(--spacing-6))]',
);

/** At least the track's width, so the input takes what the tokens leave. */
export const tokenizerGroupedTrackContentClassName = tw(
  'flex items-center gap-1 flex-none min-w-full',
);

/** The "+N more" summary measures this box, so it holds the track's width. */
export const tokenizerGroupedTrackContentTruncatedClassName = 'w-full';

// Each fade masks an edge that hides tokens. Forced colors drop the fades,
// since the native scrollbar is back there.

/** Tokens hide at the inline start of the track. */
export const tokenizerGroupedTrackFadeStartClassName = tw(
  '[mask-image:linear-gradient(to_right,transparent_calc(var(--spacing-1)_-_1px),black_calc(var(--spacing-1)_-_1px_+_var(--spacing-6)))]',
  '[&:dir(rtl)]:[mask-image:linear-gradient(to_left,transparent_calc(var(--spacing-1)_-_1px),black_calc(var(--spacing-1)_-_1px_+_var(--spacing-6)))]',
  'forced-colors:[mask-image:none]',
);

/** Tokens hide at the inline end of the track. */
export const tokenizerGroupedTrackFadeEndClassName = tw(
  '[mask-image:linear-gradient(to_left,transparent_calc(var(--spacing-1)_-_1px),black_calc(var(--spacing-1)_-_1px_+_var(--spacing-6)))]',
  '[&:dir(rtl)]:[mask-image:linear-gradient(to_right,transparent_calc(var(--spacing-1)_-_1px),black_calc(var(--spacing-1)_-_1px_+_var(--spacing-6)))]',
  'forced-colors:[mask-image:none]',
);

/** Tokens hide at both edges of the track. */
export const tokenizerGroupedTrackFadeBothClassName = tw(
  '[mask-image:linear-gradient(to_right,transparent_calc(var(--spacing-1)_-_1px),black_calc(var(--spacing-1)_-_1px_+_var(--spacing-6)),black_calc(100%_-_calc(var(--spacing-1)_-_1px_+_var(--spacing-6))),transparent_calc(100%_-_calc(var(--spacing-1)_-_1px)))]',
  'forced-colors:[mask-image:none]',
);

/** The expanded popover matches the anchor's width exactly. */
export const tokenizerLayerClassName = '[width:anchor-size(width)]';

/**
 * The bottom sheet's field: the inline field's own control box. A button
 * cannot contain controls, so the trigger, the tokens and the end lane are
 * siblings in this box.
 */
export function tokenizerSheetFieldClassName(isDisabled: boolean): string {
  // One cursor or the other, never both: two cursor classes are ordered by
  // the sheet, not by the field's state.
  return isDisabled ? 'w-full cursor-default' : 'w-full cursor-pointer';
}

/**
 * The only tab stop in the sheet's field. The box draws the focus ring, so the
 * button draws none.
 */
export const tokenizerSheetTriggerClassName = tw(
  'appearance-none grow self-stretch flex items-center min-w-0 p-0 m-0',
  'border-0 border-none bg-transparent outline-none',
  '[font-family:inherit] [font-size:inherit] [line-height:inherit] text-inherit',
  'text-start cursor-pointer [&:is([aria-disabled=true])]:cursor-default disabled:cursor-default',
);

/** Once a token is present the trigger covers the box beneath it. */
export const tokenizerSheetTriggerWithTokensClassName = 'absolute inset-0';

/**
 * An `aria-disabled` field gets no system disabled paint in forced colors, so
 * GrayText is the platform's disabled affordance there.
 */
export const tokenizerSheetFieldDisabledClassName = tw(
  '[border-color:var(--color-border-emphasized)]',
  'forced-colors:[border-color:GrayText]',
  'forced-colors:text-[color:GrayText]',
);

/** The placeholder sits where the typed query would, at the input's inset. */
export const tokenizerSheetTriggerPlaceholderClassName =
  'text-[color:var(--color-text-secondary)] px-1';

export const tokenizerSheetTriggerPlaceholderDisabledClassName =
  'forced-colors:text-[color:GrayText]';

/** The sheet's content column: the search row, the list and the footer. */
export const tokenizerSheetBodyClassName = tw(
  'flex h-full min-h-0 flex-col px-3 pt-2 pb-3',
);

// The sheet has no dedicated close button; it keeps the gesture, the scrim and
// Escape, and the footer's Done.
export const tokenizerSheetSearchRowClassName = 'pb-2';

/** The scrolling list, and the stable-order rows inside it. */
export const tokenizerSheetListClassName =
  'flex min-h-0 grow flex-col overflow-y-auto';

export const tokenizerSheetRowsClassName = 'flex flex-col';

/** A listitem that lets its row take part in the list's own layout. */
export const tokenizerSheetRowItemClassName = 'contents';

/** One checkbox row: the label and the indicator, on the sheet's own paint. */
export const tokenizerSheetRowClassName = tw(
  'flex w-full min-h-11 items-center justify-between gap-2 px-1 py-2',
  'border-0 rounded-[var(--radius-element)] bg-transparent text-start',
  '[font-family:inherit] text-[color:var(--color-text-primary)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

/**
 * An `aria-disabled` row gets no system disabled paint in forced colors, so
 * GrayText is the platform's disabled affordance there.
 */
export const tokenizerSheetRowDisabledClassName =
  'forced-colors:text-[color:GrayText]';

/** The row's label takes what the indicator leaves. */
export const tokenizerSheetRowLabelClassName = 'grow min-w-0';

/** The create row, and the label it takes the width with. */
export const tokenizerSheetCreateRowClassName =
  'flex w-full min-h-11 items-center gap-2 px-1 py-2';

export const tokenizerSheetCreateLabelClassName = 'grow min-w-0';

/** The footer stays at the sheet's end, in every list state. */
export const tokenizerSheetFooterClassName =
  'flex items-center gap-2 pt-3 mt-auto';

/** Hosts the empty state in the list's column without a box of its own. */
export const tokenizerSheetEmptyHostClassName = 'contents';

/** The empty state takes the list's remaining height. */
export const tokenizerSheetEmptyClassName = 'grow';

/** Holds the pending indicator's row at a row's height. */
export const tokenizerSheetPendingClassName =
  'flex min-h-11 items-center justify-center py-2';
