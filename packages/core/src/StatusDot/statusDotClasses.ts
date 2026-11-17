// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file statusDotClasses.ts
 * @input Accepts the status variant and whether the dot pulses
 * @output Tailwind utility class names for the dot, its icon field and its
 *   pulse
 * @position Internal to StatusDot.
 *
 * Each status class carries the plate and the ink together: a caller's `icon`
 * paints from `currentColor`, so the two can never drift out of contrast. The
 * three semantic statuses also carry the forced-colors outline, which keeps
 * the plate's shape where the system replaces the fill with Canvas.
 */

import {tw} from '../utils/tw';
import type {StatusDotVariant} from './StatusDot';

/** The plate: an eight-pixel field that does not shrink in a flex row. */
export const statusDotClassName = tw(
  'inline-flex items-center justify-center',
  'rounded-[50%] shrink-0',
  'w-[8px] h-[8px]',
);

/**
 * The pulse. The keyframes live in `tailwind/astryx.input.css` as
 * `@keyframes astryxStatusDotPulse`, because the build scans class maps and a
 * keyframe in a `.ts` file would never reach the sheet.
 */
export const statusDotPulsingClassName =
  'animate-[astryxStatusDotPulse_2s_ease-in-out_infinite] motion-reduce:animate-none';

/** A caller's icon fills the same eight-pixel field. */
export const statusDotIconClassName = tw(
  'flex items-center justify-center',
  '[line-height:0]',
  'w-[8px] h-[8px]',
);

const forcedColorsOutlineClassName =
  'forced-colors:outline-[1px] forced-colors:outline-solid forced-colors:outline-[color:CanvasText] forced-colors:[outline-offset:-1px]';

export const statusDotVariantClassName: Partial<
  Record<StatusDotVariant, string>
> = {
  success: tw(
    'bg-[color:var(--color-icon-success)] text-[color:var(--color-background-surface)]',
    forcedColorsOutlineClassName,
  ),
  warning: tw(
    'bg-[color:var(--color-icon-warning)] text-[color:var(--color-background-surface)]',
    forcedColorsOutlineClassName,
  ),
  error: tw(
    'bg-[color:var(--color-icon-error)] text-[color:var(--color-background-surface)]',
    forcedColorsOutlineClassName,
  ),
  accent: 'bg-[color:var(--color-accent)] text-[color:var(--color-on-accent)]',
  neutral:
    'bg-[color:var(--color-icon-secondary)] text-[color:var(--color-background-surface)]',
};
