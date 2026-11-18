// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectorClasses.ts
 * @input The panel shape a selector presents its options in, and whether the
 *   list scrolls
 * @output The class strings for the option panel, its listbox, the search row's
 *   gutter, and the empty and heading slots
 * @position Style primitives; scanned by the Tailwind build. `Selector` and
 *   `MultiSelector` compose these with `tw`
 *
 * The trigger's own chrome stays on StyleX in `Selector.tsx`: it shares one
 * element with the shared field box class and sets the same `padding`, `gap`,
 * `backgroundColor` and `boxShadow` properties, which two classes in
 * `astryx-base` would order by the sheet rather than by `tw`.
 */

import {tw} from '../utils/tw';

/**
 * The search panel: a column of search row, divider and list, capped as a
 * whole so the list shrinks below its content instead of pushing the panel
 * past the layer's block-size cap.
 */
export const selectorSearchPanelClassName = tw(
  'flex',
  'flex-col',
  '[max-block-size:min(calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]',
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]',
);

/**
 * The listbox. Inside a capped search panel it shrinks below its content; on
 * its own it takes 300px at most, and never more than its layer leaves.
 */
export const selectorListboxClassName = tw(
  'box-border',
  'min-h-0',
  '[max-block-size:min(300px,calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]',
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(300px,calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]',
  'overflow-y-auto',
  'outline-none',
  'py-[var(--spacing-1)]',
  'px-[var(--spacing-1)]',
  // Under Reduce Motion the list appears at once on a fine pointer and takes
  // the shared cross-fade on a coarse one (`reducedMotionFadeConsts`).
  'transition-opacity',
  'duration-[var(--duration-fast)]',
  'ease-[ease]',
  '[@media_(prefers-reduced-motion:reduce)_and_(not_(pointer:coarse))]:[transition-duration:0s]',
  '[@media_(prefers-reduced-motion:reduce)_and_(pointer:coarse)]:[transition-duration:200ms]',
  '[@media_(prefers-reduced-motion:reduce)_and_(pointer:coarse)]:ease-[cubic-bezier(0.42,0,0.58,1)]',
);

/**
 * The input trigger's text inset includes its border; the menu mirrors that
 * extra pixel. The borderless secondary and ghost variants need no correction.
 */
export const selectorListboxInputInsetClassName = tw(
  'px-[calc(var(--spacing-1)_+_var(--border-width))]',
);

/** Same correction for the search row's gutter, so both share one left edge. */
export const selectorSearchRowInsetClassName = tw(
  'px-[calc(var(--spacing-1)_+_var(--border-width))]',
);

/**
 * Scroll ownership by the browser's own signal: a list whose options fit keeps
 * every one-finger move, so a slide over the options stays a slide; one that
 * scrolls lets the browser pan it vertically and cancel the press when it does.
 * Both leave a two-finger pinch to the browser.
 */
export const selectorListboxTouchClassName = tw('touch-pinch-zoom');

export const selectorListboxTouchScrollClassName = tw(
  'touch-pan-y',
  '[touch-action:pan-y_pinch-zoom]',
  'overscroll-contain',
);

/** A list that is measured before it is shown: no fade, so no first-frame jump. */
export const selectorListboxHiddenClassName = tw(
  'opacity-0',
  // A longhand: the shorthand would lose to the list's longhands.
  '[transition-property:none]',
);

export const selectorEmptyStateClassName = tw(
  'p-[var(--spacing-3)]',
  'text-center',
  'text-[color:var(--color-text-secondary)]',
  '[font-family:var(--font-family-body)]',
  '[font-size:var(--text-label-size)]',
);

/**
 * Plain secondary text, no rules: a labeled Divider (line–text–line) reads as a
 * separator, and next to the search row's own divider it stacked two rules a
 * few pixels apart.
 */
export const selectorSectionHeadingClassName = tw(
  'py-[var(--spacing-1)]',
  'px-[var(--spacing-2)]',
  '[font-family:var(--font-family-body)]',
  '[font-size:var(--text-supporting-size)]',
  '[line-height:var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'select-none',
);

export const selectorDividerClassName = tw('my-[var(--spacing-1)]');

/**
 * The trigger's inner button: it draws nothing of its own, so the container's
 * box is the whole visible control. Its cursor is one class or the other rather
 * than a base plus an override, because two utilities of one property are
 * ordered by the sheet, not by their order in `tw`.
 */
export function selectorTriggerButtonClassName({
  isReadOnly,
}: {
  isReadOnly: boolean;
}): string {
  return tw(
    'flex',
    'items-center',
    'justify-between',
    'gap-[var(--spacing-2)]',
    'grow',
    'shrink',
    'basis-0',
    'min-w-0',
    'p-0',
    'm-0',
    '[border-width:0]',
    '[border-style:none]',
    'bg-transparent',
    '[font-family:inherit]',
    '[font-size:inherit]',
    '[line-height:inherit]',
    '[color:inherit]',
    isReadOnly ? 'cursor-default' : 'cursor-pointer',
    'disabled:cursor-default',
    'aria-disabled:cursor-default',
    'outline-none',
  );
}

/** The single-line value, ellipsized rather than widening the trigger. */
export const SELECTOR_TRIGGER_LABEL_CLASS = tw(
  'grow',
  'min-w-0',
  'overflow-hidden',
  'text-ellipsis',
  'whitespace-nowrap',
  'text-start',
);

/** The `renderValue` box: it takes the free width and clips sideways. */
export const SELECTOR_TRIGGER_VALUE_CLASS = tw(
  'grow',
  'min-w-0',
  'overflow-hidden',
  'text-start',
);

/**
 * Inside an InputGroup the group's row is the height, so the button stretches
 * to it and the value box is cut off at the row's edge instead of bleeding
 * through the group's border.
 */
export const SELECTOR_TRIGGER_BUTTON_IN_GROUP_CLASS = 'self-stretch';

export const SELECTOR_TRIGGER_VALUE_IN_GROUP_CLASS = '[max-height:100%]';

/** Icon's `sm` box already sets the size and colour; only the flex item is ours. */
export const SELECTOR_TRIGGER_ICON_CLASS = 'shrink-0';

/**
 * The chevron turns on the glyph itself, so the `selector-indicator-icon` theme
 * target and the open/closed transform sit on one element.
 */
export const SELECTOR_TRIGGER_ICON_ROTATION_CLASS = tw(
  'transition-[transform]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
  'origin-center',
);

export const SELECTOR_TRIGGER_ICON_OPEN_CLASS = '[transform:rotate(180deg)]';

/**
 * The status glyph's button: the glyph inside it is the target, so the button
 * adds no padding or border and inherits the trigger's colour.
 */
export const SELECTOR_STATUS_BUTTON_CLASS = tw(
  'flex',
  'items-center',
  'justify-center',
  'p-0',
  'm-0',
  '[border-width:0]',
  '[border-style:none]',
  'bg-transparent',
  '[color:inherit]',
  'cursor-pointer',
  'disabled:cursor-default',
  'aria-disabled:cursor-default',
  'rounded-[var(--radius-element)]',
);
