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
 * element with `inputWrapperStyles.base`, whose unlayered `padding`, `gap`,
 * `backgroundColor` and `boxShadow` would win over these layered classes.
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
