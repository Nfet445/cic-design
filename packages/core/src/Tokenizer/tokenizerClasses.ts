// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokenizerClasses.ts
 * @input A tokenizer's size, presentation, disabled state and grouped scroll
 *   state
 * @output Utility class names for the token row, the start icon, the end lane,
 *   the grouped track and its edge fades, the expanded layer and the bottom
 *   sheet's field, trigger and placeholder
 * @position Style primitives; scanned by the Tailwind build
 *
 * The field's own box stays on StyleX (`Tokenizer.tsx`): its wrapper is the
 * same element as `inputWrapperStyles.base`, whose unlayered `padding`, `gap`
 * and `backgroundColor` win over these layered classes, and the input shares
 * `typeaheadInputClassName`'s own `flex` and `min-w` utilities inside the
 * layer, where the sheet's order — not the state — would decide.
 */

import {tw} from '../utils/tw';

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
