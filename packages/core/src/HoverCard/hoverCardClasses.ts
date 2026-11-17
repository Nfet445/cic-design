// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file hoverCardClasses.ts
 * @input The theme's colour, shadow, radius and spacing variables
 * @output The utility class strings a hover card's wrapper, surface and
 *   content carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The radius stays behind `--_hovercard-radius` so a theme's component override
 * reaches it: the theme assigns the variable in an unlayered rule, which wins
 * over the default this class writes inside `@layer astryx-base`.
 */

import {tw} from '../utils/tw';

export const hoverCardWrapperClassName = {
  contents: 'contents',
  inline: 'inline',
};

export const hoverCardHoverIndicationClassName = tw(
  'underline decoration-dashed',
  '[text-decoration-color:var(--color-border-emphasized)]',
  '[text-underline-offset:2px]',
);

export const hoverCardSurfaceClassName = tw(
  '[background-color:var(--color-background-surface)]',
  '[--_hovercard-radius:var(--radius-container)]',
  '[border-radius:var(--_hovercard-radius)]',
  '[box-shadow:var(--shadow-med)]',
);

export const hoverCardContentClassName = tw(
  'block',
  'pt-[var(--spacing-3)]',
  'pb-[var(--spacing-3)]',
  'ps-[var(--spacing-3)]',
  'pe-[var(--spacing-3)]',
);
