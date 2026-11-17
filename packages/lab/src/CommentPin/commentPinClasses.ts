// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentPinClasses.ts
 * @input Accepts nothing: every class is fixed. Per-instance paint is chosen by
 *   which of the three paint classes the button carries, never by stacking two
 *   of them
 * @output The utility class strings for the pin button and its parts
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * Paint is three complete classes — resting, selected, disabled-unselected —
 * because they all set `border-color`, `background-color`, `color` and
 * `box-shadow`, and the sheet, not the class attribute, orders classes that
 * set one property. Each keeps its forced-colors arms in the same string as
 * the value they override.
 *
 * The base paints no `background-image`: the shared press overlay adds one
 * from a StyleX state rule, and an unlayered `bg-none` here would beat it.
 */

import {tw} from '../tw';

/**
 * The button: a speech-bubble silhouette whose start-bottom corner is a fixed
 * 2px anchor cue, while the other three corners are half its height (see
 * `commentPinSizeClassNames`). The literal is intentional: no radius token is
 * 2px, and themes may change `--radius-inner`, which would soften the cue.
 * Logical longhands mirror the corner in RTL by construction.
 */
export const commentPinRootClassName = tw(
  'appearance-none box-border relative inline-flex items-center justify-center shrink-0',
  'align-middle m-0 cursor-pointer aria-disabled:cursor-default',
  'select-none whitespace-nowrap font-sans font-semibold',
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
  'border-[length:var(--border-width)] border-solid rounded-es-[2px]',
  '[transform-origin:left_bottom] rtl:[transform-origin:right_bottom]',
);

/** The count and the unread dot follow the faces, so the content starts left. */
export const commentPinWithCountClassName = 'justify-start gap-1';

/** Resting: the popover surface under the pin with its medium elevation. */
export const commentPinClassName = tw(
  'border-transparent bg-[var(--color-background-popover)]',
  'text-[color:var(--color-text-secondary)]',
  'shadow-[var(--shadow-med)]',
);

/**
 * Selected: the border stays transparent so the selection reads as exactly one
 * 2px accent outline, drawn outside the pin by the shadow ring, layered with
 * its resting elevation. Native buttons keep ButtonFace/ButtonText under forced
 * colors unless the selected state opts out of UA remapping; author both sides
 * together.
 */
export const commentPinSelectedClassName = tw(
  'forced-color-adjust-none',
  'border-transparent forced-colors:border-[color:Highlight]',
  'bg-[var(--color-background-popover)] forced-colors:bg-[color:Highlight]',
  'text-[color:var(--color-text-secondary)]',
  'forced-colors:text-[color:HighlightText]',
  '[box-shadow:0_0_0_2px_var(--color-accent),var(--shadow-med)]',
  'forced-colors:[box-shadow:none]',
);

/**
 * An aria-disabled button gets no system disabled paint in forced colors;
 * GrayText is the platform's disabled affordance there. Only unselected pins
 * take it — a selected disabled pin keeps its Highlight treatment.
 */
export const commentPinDisabledUnselectedClassName = tw(
  'border-transparent forced-colors:border-[color:GrayText]',
  'bg-[var(--color-background-popover)]',
  'text-[color:var(--color-text-secondary)]',
  'forced-colors:text-[color:GrayText]',
  'shadow-[var(--shadow-med)]',
);

/** Disabled outranks dimmed: both set `opacity`, so only one is applied. */
export const commentPinDisabledOpacityClassName =
  'opacity-[0.45] forced-colors:opacity-[1]';

export const commentPinDimmedOpacityClassName =
  'opacity-[0.4] forced-colors:opacity-[1]';

export const commentPinAvatarRailClassName =
  'inline-flex items-center shrink-0';

/**
 * AvatarGroup draws every face inside a 2px surface ring. Sitting the first
 * ring in the start padding keeps the faces themselves as far from the start
 * edge as from the top and bottom, as on a single pin.
 */
export const commentPinGroupedRailClassName = '-ms-[2px]';

/**
 * The thread total and then the unread dot follow the participants. The end
 * padding gives whichever comes last room before the pin's edge.
 */
export const commentPinTrailingClassName =
  'inline-flex items-center gap-1 pe-1';

export const commentPinCountClassName = 'text-inherit tabular-nums';

/**
 * StatusDot paints its plate with a background, which forced colors would
 * erase; there it takes the pin's own text color, so it shows in every state.
 */
export const commentPinUnreadDotClassName = tw(
  'forced-color-adjust-none',
  'text-[color:var(--color-on-accent)] forced-colors:text-[color:inherit]',
  'bg-[var(--color-accent)] forced-colors:bg-[color:currentColor]',
);

/**
 * Each size pairs an element-size height with a participant circle diameter
 * (see `AVATAR_SIZE`). The padding is the inset that centers that circle in the
 * height, applied on every side. The three round corners are half the height:
 * the 9999px full-radius token would make the browser scale every corner down
 * to fit the box and shrink the 2px anchor corner to nothing.
 */
export const commentPinSizeClassNames = {
  sm: tw(
    'min-w-[var(--size-element-sm)] h-[var(--size-element-sm)]',
    'p-[calc((var(--size-element-sm)_-_22px)_/_2_-_var(--border-width))]',
    'rounded-ss-[calc(var(--size-element-sm)/2)]',
    'rounded-se-[calc(var(--size-element-sm)/2)]',
    'rounded-ee-[calc(var(--size-element-sm)/2)]',
  ),
  md: tw(
    'min-w-[var(--size-element-md)] h-[var(--size-element-md)]',
    'p-[calc((var(--size-element-md)_-_24px)_/_2_-_var(--border-width))]',
    'rounded-ss-[calc(var(--size-element-md)/2)]',
    'rounded-se-[calc(var(--size-element-md)/2)]',
    'rounded-ee-[calc(var(--size-element-md)/2)]',
  ),
  lg: tw(
    'min-w-[var(--size-element-lg)] h-[var(--size-element-lg)]',
    'p-[calc((var(--size-element-lg)_-_28px)_/_2_-_var(--border-width))]',
    'rounded-ss-[calc(var(--size-element-lg)/2)]',
    'rounded-se-[calc(var(--size-element-lg)/2)]',
    'rounded-ee-[calc(var(--size-element-lg)/2)]',
  ),
} as const;
