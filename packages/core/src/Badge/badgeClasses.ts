// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file badgeClasses.ts
 * @input Accepts the badge variant and whether the label renders
 * @output Tailwind utility class names for the badge pill and its label
 * @position Internal to Badge.
 *
 * One class per variant carries the fill and, for a semantic variant, the
 * forced-colors outline together. An augmented variant has no entry, so the
 * lookup is undefined and `tw` drops it.
 */

import {tw} from '../utils/tw';
import type {BadgeVariant} from './Badge';

/**
 * The pill: one line tall, sized by the theme's height token, and clipped
 * rather than allowed to escape its container. `min-w-0` matters as much as
 * `max-w-full`: as a flex item the automatic minimum size would otherwise hold
 * the badge at its full text width.
 */
export const badgeClassName = tw(
  'inline-flex items-center justify-center',
  'gap-[var(--spacing-1)]',
  'h-[var(--spacing-5)] py-0 px-[var(--spacing-2)]',
  'rounded-[var(--radius-full)]',
  '[font-family:inherit]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  '[font-weight:var(--font-weight-medium)]',
  'whitespace-nowrap',
  'max-w-full min-w-0',
);

/**
 * Never shorter than one line of its label, so the pill grows with the text
 * size instead of the label spilling out of it.
 */
export const badgeGrowsClassName = 'min-h-[1lh]';

/**
 * The label takes the ellipsis because `text-overflow` needs a block
 * container, and the badge itself has to stay `inline-flex` for the icon's
 * centring.
 */
export const badgeLabelClassName = tw(
  'overflow-hidden text-ellipsis min-w-0',
  '[unicode-bidi:isolate]',
);

/**
 * The forced-colors outline keeps a semantic fill's shape visible where the
 * system replaces it with Canvas.
 */
const forcedColorsOutlineClassName =
  'forced-colors:outline-[1px] forced-colors:outline-solid forced-colors:outline-[color:CanvasText] forced-colors:[outline-offset:-1px]';

/** Semantic variants paint a solid fill; the color variants paint a tint. */
export const badgeVariantClassName: Partial<Record<BadgeVariant, string>> = {
  neutral:
    'bg-[color:var(--color-neutral)] text-[color:var(--color-text-primary)]',
  info: tw(
    'bg-[color:var(--color-info)] text-[color:var(--color-on-info)]',
    forcedColorsOutlineClassName,
  ),
  success: tw(
    'bg-[color:var(--color-success)] text-[color:var(--color-on-success)]',
    forcedColorsOutlineClassName,
  ),
  warning: tw(
    'bg-[color:var(--color-warning)] text-[color:var(--color-on-warning)]',
    forcedColorsOutlineClassName,
  ),
  error: tw(
    'bg-[color:var(--color-error)] text-[color:var(--color-on-error)]',
    forcedColorsOutlineClassName,
  ),
  blue: 'bg-[color:var(--color-background-blue)] text-[color:var(--color-text-blue)]',
  cyan: 'bg-[color:var(--color-background-cyan)] text-[color:var(--color-text-cyan)]',
  green:
    'bg-[color:var(--color-background-green)] text-[color:var(--color-text-green)]',
  orange:
    'bg-[color:var(--color-background-orange)] text-[color:var(--color-text-orange)]',
  pink: 'bg-[color:var(--color-background-pink)] text-[color:var(--color-text-pink)]',
  purple:
    'bg-[color:var(--color-background-purple)] text-[color:var(--color-text-purple)]',
  red: 'bg-[color:var(--color-background-red)] text-[color:var(--color-text-red)]',
  teal: 'bg-[color:var(--color-background-teal)] text-[color:var(--color-text-teal)]',
  yellow:
    'bg-[color:var(--color-background-yellow)] text-[color:var(--color-text-yellow)]',
};
