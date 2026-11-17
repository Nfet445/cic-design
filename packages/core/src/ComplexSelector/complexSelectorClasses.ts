// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file complexSelectorClasses.ts
 * @input The selector size, and the popup content's own block-size cap
 * @output The class strings for the trigger button, its text and status slots,
 *   the chevron's rotation, and the popup content box
 * @position Style primitives; scanned by the Tailwind build. The component
 *   composes them with `tw` and keeps its container chrome on StyleX
 *
 * The trigger container is the same element as `inputWrapperStyles.base`,
 * whose unlayered `padding`, `gap`, `backgroundColor` and `boxShadow` outrank
 * every class in `astryx-base`; its chrome, the variant fills and the
 * disabled press reset stay StyleX in `ComplexSelector.tsx`. The popup's
 * `min-width: anchor-size(width)` stays there too, because `usePopover`
 * accepts only StyleX styles. Every class here styles a child element.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {ComplexSelectorSize} from './ComplexSelector';
import {tw} from '../utils/tw';

const HEIGHT_CLASS: Record<ComplexSelectorSize, string> = {
  sm: '[height:var(--size-element-sm)]',
  md: '[height:var(--size-element-md)]',
  lg: '[height:var(--size-element-lg)]',
};

/**
 * The container's height for a size. It sits on the shared field base's
 * element, whose unlayered rules set no height — only the box's padding, gap
 * and fill — so the class still governs the box, as
 * `SELECTOR_TRIGGER_SIZE_CLASS` does for `Selector`.
 */
export function complexSelectorHeightClassName({
  size,
}: {
  size: ComplexSelectorSize;
}): string {
  return HEIGHT_CLASS[size];
}

/**
 * The popup content box: it scrolls, and its own block-size cap sits under the
 * layer runtime's viewport cap, so the last rows never paint under a bar the
 * app declares through LayerProvider's `inset` (spec:AST-059 FR2, FR6).
 *
 * Two `max-height` declarations in cascade order, as `stylex.firstThatWorks`
 * wrote them: a browser without `dvb` drops the preferred one and keeps the
 * `vh` twin under a support query.
 */
export const COMPLEX_SELECTOR_CONTENT_CLASS = tw(
  'box-border',
  'overflow-auto',
  'p-[var(--spacing-3)]',
  '[max-height:min(480px,min(calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb)))]',
  '[@supports_not_(block-size:100dvb)]:[max-height:min(480px,min(calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh)))]',
);

/**
 * The trigger button: it fills the container and draws nothing of its own, so
 * the container's padding, border and focus ring are the whole visible box.
 * Its radius matches the element radius the container's ring follows.
 */
export const COMPLEX_SELECTOR_TRIGGER_CLASS = tw(
  'flex',
  'items-center',
  'justify-between',
  'gap-[var(--spacing-4)]',
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
  'cursor-pointer',
  'disabled:cursor-default',
  'aria-disabled:cursor-default',
  'outline-none',
  'rounded-[var(--radius-element)]',
);

/** The value or placeholder line: one line, ellipsized from the start edge. */
export const COMPLEX_SELECTOR_TRIGGER_TEXT_CLASS = tw(
  'grow',
  'min-w-0',
  'overflow-hidden',
  'text-ellipsis',
  'whitespace-nowrap',
  'text-start',
);

/** A status glyph or info-tip keeps its size when the trigger text is long. */
export const COMPLEX_SELECTOR_STATUS_TIP_CLASS = tw(
  'inline-flex',
  'items-center',
  'shrink-0',
);

/**
 * Only what Icon does not already provide: `size="sm"` gives the 16px box and
 * the secondary colour, but the glyph still must not shrink in the flex row.
 */
export const COMPLEX_SELECTOR_TRIGGER_ICON_CLASS = tw('shrink-0');

/**
 * The chevron turns in place, on the glyph itself, so its
 * `complex-selector-indicator-icon` theme target and the rotation sit on one
 * element. Under Reduce Motion it turns at once: an in-place state change
 * moves nothing (design:reduced-motion DR1–DR3).
 */
export const COMPLEX_SELECTOR_TRIGGER_ICON_ROTATION_CLASS = tw(
  'transition-[transform]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
  'origin-center',
  'motion-reduce:[transition-duration:0s]',
);

/**
 * The `rotate` property would not ride the transform transition, so the open
 * state writes the same `transform` the StyleX rule did.
 */
export const COMPLEX_SELECTOR_TRIGGER_ICON_OPEN_CLASS =
  '[transform:rotate(180deg)]';
