// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file segmentedControlClasses.ts
 * @input The track's layout and disabled state, and a segment's size,
 *   selection, disabled, layout and touch state
 * @output Utility class strings for the control's track, its lens and its
 *   segments
 * @position Style primitives; scanned by the Tailwind build
 *
 * Keeps every class the control emits in one module so the build has one
 * place to find them. A property that a state changes is emitted by exactly
 * one branch, because two classes of the same property would be decided by
 * the sheet's order and not by the branch.
 */

import {tw} from '../utils/tw';
import type {SegmentedControlSize} from './SegmentedControlContext';

/**
 * The lens uses the radiogroup's own pseudo-elements, so it adds no element.
 * `::before` carries the selected surface. Under Reduce Motion, `::after` is
 * the old surface that fades out in place. Both are hidden at rest, and a
 * negative z-index keeps them under every segment's content, inside the
 * stacking context the track's `isolation` makes: a moving lens above the
 * segments could paint over their titles, and WebKit's overlap test can miss
 * what a moving layer covers.
 *
 * Every value is a copy of an already resolved surface, forced colors
 * included, so the UA must not remap it again. The selection motion writes the
 * variables from the segment's client rect, so the physical sides are
 * intentional in both directions.
 */
const LENS_BEFORE_CLASS = tw(
  "[&::before]:content-['']",
  '[&::before]:absolute',
  '[&::before]:[z-index:-1]',
  '[&::before]:[left:var(--_segmented-lens-left,0px)]',
  '[&::before]:[top:var(--_segmented-lens-top,0px)]',
  '[&::before]:[width:var(--_segmented-lens-width,0px)]',
  '[&::before]:[height:var(--_segmented-lens-height,0px)]',
  '[&::before]:box-border',
  // Scales around its center: the lens's position and size are separate.
  '[&::before]:[transform-origin:50%_50%]',
  '[&::before]:pointer-events-none',
  '[&::before]:[visibility:var(--_segmented-lens-visibility,hidden)]',
  '[&::before]:[will-change:var(--astryx-motion-will-change-before,auto)]',
  '[&::before]:[forced-color-adjust:none]',
  '[&::before]:[background-color:var(--_segmented-lens-background-color,transparent)]',
  '[&::before]:[background-image:var(--_segmented-lens-background-image,none)]',
  '[&::before]:[background-position:var(--_segmented-lens-background-position,0%_0%)]',
  '[&::before]:[background-size:var(--_segmented-lens-background-size,auto)]',
  '[&::before]:[background-repeat:var(--_segmented-lens-background-repeat,repeat)]',
  '[&::before]:[background-origin:var(--_segmented-lens-background-origin,padding-box)]',
  '[&::before]:[background-clip:var(--_segmented-lens-background-clip,border-box)]',
  '[&::before]:[box-shadow:var(--_segmented-lens-box-shadow,none)]',
  '[&::before]:[border-top-left-radius:var(--_segmented-lens-border-top-left-radius,0px)]',
  '[&::before]:[border-top-right-radius:var(--_segmented-lens-border-top-right-radius,0px)]',
  '[&::before]:[border-bottom-right-radius:var(--_segmented-lens-border-bottom-right-radius,0px)]',
  '[&::before]:[border-bottom-left-radius:var(--_segmented-lens-border-bottom-left-radius,0px)]',
  '[&::before]:[border-top-width:var(--_segmented-lens-border-top-width,0px)]',
  '[&::before]:[border-right-width:var(--_segmented-lens-border-right-width,0px)]',
  '[&::before]:[border-bottom-width:var(--_segmented-lens-border-bottom-width,0px)]',
  '[&::before]:[border-left-width:var(--_segmented-lens-border-left-width,0px)]',
  '[&::before]:[border-top-style:var(--_segmented-lens-border-top-style,none)]',
  '[&::before]:[border-right-style:var(--_segmented-lens-border-right-style,none)]',
  '[&::before]:[border-bottom-style:var(--_segmented-lens-border-bottom-style,none)]',
  '[&::before]:[border-left-style:var(--_segmented-lens-border-left-style,none)]',
  '[&::before]:[border-top-color:var(--_segmented-lens-border-top-color,currentcolor)]',
  '[&::before]:[border-right-color:var(--_segmented-lens-border-right-color,currentcolor)]',
  '[&::before]:[border-bottom-color:var(--_segmented-lens-border-bottom-color,currentcolor)]',
  '[&::before]:[border-left-color:var(--_segmented-lens-border-left-color,currentcolor)]',
  '[&::before]:[-webkit-backdrop-filter:var(--_segmented-lens-webkit-backdrop-filter,none)]',
  '[&::before]:[backdrop-filter:var(--_segmented-lens-backdrop-filter,none)]',
);

/** The surface the lens leaves behind while it moves under Reduced Motion. */
const LENS_AFTER_CLASS = tw(
  "[&::after]:content-['']",
  '[&::after]:absolute',
  '[&::after]:[z-index:-1]',
  '[&::after]:[left:var(--_segmented-after-left,0px)]',
  '[&::after]:[top:var(--_segmented-after-top,0px)]',
  '[&::after]:[width:var(--_segmented-after-width,0px)]',
  '[&::after]:[height:var(--_segmented-after-height,0px)]',
  '[&::after]:box-border',
  '[&::after]:[transform-origin:50%_50%]',
  '[&::after]:pointer-events-none',
  '[&::after]:[visibility:var(--_segmented-after-visibility,hidden)]',
  '[&::after]:[will-change:var(--astryx-motion-will-change-after,auto)]',
  '[&::after]:[forced-color-adjust:none]',
  '[&::after]:[background-color:var(--_segmented-after-background-color,transparent)]',
  '[&::after]:[background-image:var(--_segmented-after-background-image,none)]',
  '[&::after]:[background-position:var(--_segmented-after-background-position,0%_0%)]',
  '[&::after]:[background-size:var(--_segmented-after-background-size,auto)]',
  '[&::after]:[background-repeat:var(--_segmented-after-background-repeat,repeat)]',
  '[&::after]:[background-origin:var(--_segmented-after-background-origin,padding-box)]',
  '[&::after]:[background-clip:var(--_segmented-after-background-clip,border-box)]',
  '[&::after]:[box-shadow:var(--_segmented-after-box-shadow,none)]',
  '[&::after]:[border-top-left-radius:var(--_segmented-after-border-top-left-radius,0px)]',
  '[&::after]:[border-top-right-radius:var(--_segmented-after-border-top-right-radius,0px)]',
  '[&::after]:[border-bottom-right-radius:var(--_segmented-after-border-bottom-right-radius,0px)]',
  '[&::after]:[border-bottom-left-radius:var(--_segmented-after-border-bottom-left-radius,0px)]',
  '[&::after]:[border-top-width:var(--_segmented-after-border-top-width,0px)]',
  '[&::after]:[border-right-width:var(--_segmented-after-border-right-width,0px)]',
  '[&::after]:[border-bottom-width:var(--_segmented-after-border-bottom-width,0px)]',
  '[&::after]:[border-left-width:var(--_segmented-after-border-left-width,0px)]',
  '[&::after]:[border-top-style:var(--_segmented-after-border-top-style,none)]',
  '[&::after]:[border-right-style:var(--_segmented-after-border-right-style,none)]',
  '[&::after]:[border-bottom-style:var(--_segmented-after-border-bottom-style,none)]',
  '[&::after]:[border-left-style:var(--_segmented-after-border-left-style,none)]',
  '[&::after]:[border-top-color:var(--_segmented-after-border-top-color,currentcolor)]',
  '[&::after]:[border-right-color:var(--_segmented-after-border-right-color,currentcolor)]',
  '[&::after]:[border-bottom-color:var(--_segmented-after-border-bottom-color,currentcolor)]',
  '[&::after]:[border-left-color:var(--_segmented-after-border-left-color,currentcolor)]',
  '[&::after]:[-webkit-backdrop-filter:var(--_segmented-after-webkit-backdrop-filter,none)]',
  '[&::after]:[backdrop-filter:var(--_segmented-after-backdrop-filter,none)]',
);

/**
 * Hug sizes the track to its segments but never past its container: in a
 * narrow card or a phone row the segments shrink and their labels truncate
 * instead of the control running off the edge. The cap and the min-size reset
 * apply only when a segment has a visible label to truncate (icon-only
 * segments carry `aria-label` and keep their size): a track of icon-only
 * segments has nothing that can shrink, and squeezing it would leave segments
 * hanging outside it.
 */
const TRACK_BOX_CLASS = tw(
  'relative isolate items-center',
  'gap-[var(--spacing-0-5)] p-[var(--_segmented-control-padding)]',
  '[--_segmented-control-padding:var(--spacing-0-5)]',
  // The segments' concentric radius reads these two back.
  '[--_segmented-control-radius:var(--radius-element)] rounded-[var(--_segmented-control-radius)]',
  'bg-[var(--color-neutral)]',
  '[max-width:none] [min-width:auto]',
  '[&:has([role=radio]:not([aria-label]))]:[max-width:100%]',
  '[&:has([role=radio]:not([aria-label]))]:[min-width:0]',
);

/** A hugging track keeps its segments' width; a fill track uses the container's. */
const TRACK_LAYOUT_CLASS = {
  hug: 'inline-flex w-fit',
  fill: 'flex w-full',
};

export type SegmentedControlClassNameOptions = {
  isFill: boolean;
  isDisabled: boolean;
  showsLens: boolean;
};

/** The track: the track's own box, its layout, and the lens when it paints. */
export function segmentedControlClassName({
  isFill,
  isDisabled,
  showsLens,
}: SegmentedControlClassNameOptions): string {
  return tw(
    TRACK_BOX_CLASS,
    TRACK_LAYOUT_CLASS[isFill ? 'fill' : 'hug'],
    // Dimmed, with pointer events left on so a press can focus the segment
    // that holds the Tab stop and a reason tooltip can open on hover.
    isDisabled && 'opacity-50',
    showsLens && LENS_BEFORE_CLASS,
    showsLens && LENS_AFTER_CLASS,
  );
}

const SEGMENT_BOX_CLASS = tw(
  'relative inline-flex items-center justify-center min-w-0',
  'gap-[var(--spacing-1)]',
  'border-0 [border-style:none] [font-family:inherit]',
  'leading-[var(--text-label-leading)] whitespace-nowrap',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

/** The label's ellipsis can engage in both layouts when the track is capped. */
const CONCENTRIC_RADIUS_CLASS =
  'rounded-[max(0px,calc(var(--_segmented-control-radius)_-_var(--_segmented-control-padding)))]';

const SEGMENT_SIZE_CLASS: Record<SegmentedControlSize, string> = {
  sm: 'h-[calc(var(--size-element-sm)_-_4px)] px-[var(--spacing-2)] text-[length:var(--text-supporting-size)]',
  md: 'h-[calc(var(--size-element-md)_-_4px)] px-[var(--spacing-3)] text-[length:var(--text-label-size)]',
  lg: 'h-[calc(var(--size-element-lg)_-_4px)] px-[var(--spacing-3)] text-[length:var(--text-label-size)]',
};

/** A hugging segment keeps its label's width; a fill segment shares the track. */
const SEGMENT_LAYOUT_CLASS = {
  hug: '',
  fill: 'flex-1',
};

const SEGMENT_COLOR_CLASS = {
  selected: 'text-[color:var(--color-text-primary)]',
  unselected: 'text-[color:var(--color-text-secondary)]',
  disabled: 'text-[color:var(--color-text-disabled)]',
};

const SEGMENT_SURFACE_CLASS = {
  selected: 'bg-[var(--color-background-surface)]',
  unselected: 'bg-transparent',
};

const SEGMENT_WEIGHT_CLASS = {
  selected: '[font-weight:var(--font-weight-semibold)]',
  unselected: '[font-weight:var(--font-weight-medium)]',
};

/**
 * Forced colors (Windows High Contrast) strips the painted surface fill and
 * box shadow, which would leave the selected segment with no state indication
 * beyond font weight. Highlight/HighlightText is the platform convention for a
 * selected item (WCAG 1.4.11).
 *
 * `forced-color-adjust` must be `none` here: the segment is a `<button>`, and
 * the UA keeps native form-control colours (ButtonFace surface) for it under
 * forced colors, ignoring the authored Highlight fill — the label kept its
 * HighlightText colour, giving white text on a white surface. Opting the
 * selected segment out of UA remapping makes both the Highlight surface and
 * the HighlightText label render as authored, restoring figure-ground.
 *
 * The arms key off `aria-checked` rather than off a state branch so they
 * outrank the segment's own surface and colour inside the same layer, where
 * specificity decides and the class attribute order does not. A disabled
 * segment drops them: its colour arm has to win, and a Highlight fill under a
 * disabled colour reads as an active selection.
 */
const SEGMENT_SELECTED_FORCED_COLORS_CLASS = tw(
  '[forced-color-adjust:none]',
  'aria-checked:forced-colors:bg-[color:Highlight]',
  'aria-checked:forced-colors:text-[color:HighlightText]',
);

/** The surface transition a click animates; a finger's slide replaces it. */
const SEGMENT_TRANSITION_CLASS = tw(
  'transition-[color,background-color,box-shadow]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

/**
 * A finger's selection change is scripted, because the surface slides. A CSS
 * transition would run a second, main-thread version of the same change.
 */
const SEGMENT_TOUCH_PRESENTATION_CLASS = 'transition-none';

export type SegmentedItemClassNameOptions = {
  size: SegmentedControlSize;
  isSelected: boolean;
  isDisabled: boolean;
  isFill: boolean;
  isLabelHidden: boolean;
  isTouchPresentation: boolean;
};

/** One segment: its box, then the state and layout arms that change it. */
export function segmentedItemClassName({
  size,
  isSelected,
  isDisabled,
  isFill,
  isLabelHidden,
  isTouchPresentation,
}: SegmentedItemClassNameOptions): string {
  const state = isSelected ? 'selected' : 'unselected';
  return tw(
    SEGMENT_BOX_CLASS,
    SEGMENT_SIZE_CLASS[size],
    CONCENTRIC_RADIUS_CLASS,
    isSelected && SEGMENT_SURFACE_CLASS.selected,
    !isSelected && SEGMENT_SURFACE_CLASS.unselected,
    isSelected && '[box-shadow:var(--shadow-low)]',
    SEGMENT_COLOR_CLASS[isDisabled ? 'disabled' : state],
    SEGMENT_WEIGHT_CLASS[state],
    SEGMENT_LAYOUT_CLASS[isFill ? 'fill' : 'hug'],
    // An icon-only segment has no label to truncate, so it keeps its size.
    isLabelHidden && 'shrink-0',
    isSelected && !isDisabled && SEGMENT_SELECTED_FORCED_COLORS_CLASS,
    isTouchPresentation
      ? SEGMENT_TOUCH_PRESENTATION_CLASS
      : SEGMENT_TRANSITION_CLASS,
  );
}

export const SEGMENT_ICON_CLASS =
  'inline-flex items-center justify-center shrink-0';

const SEGMENT_ICON_SIZE_CLASS: Record<SegmentedControlSize, string> = {
  sm: 'w-[14px] h-[14px]',
  md: 'w-[16px] h-[16px]',
  lg: 'w-[18px] h-[18px]',
};

export function segmentedItemIconSizeClassName(
  size: SegmentedControlSize,
): string {
  return SEGMENT_ICON_SIZE_CLASS[size];
}

export const SEGMENT_LABEL_CLASS = 'overflow-hidden text-ellipsis min-w-0';
