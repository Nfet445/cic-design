// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chartTooltipClasses.ts
 * @input The theme's surface, border, radius, spacing and shadow variables
 * @output The utility class strings the tooltip card and its crosshair carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The card chrome lands on the Layer host, whose own stylesheet resets padding
 * through longhands; the card sets padding the same way, so its padding still
 * wins when the page loads both packages' sheets.
 */

import {tw} from './tw';

export const chartTooltipCardClassName = tw(
  '[background-color:var(--color-background-popover)]',
  '[border-width:1px]',
  'border-solid',
  '[border-color:var(--color-border)]',
  'rounded-[var(--radius-container)]',
  '[padding-block-start:var(--spacing-2)]',
  '[padding-block-end:var(--spacing-2)]',
  'ps-3',
  'pe-3',
  'shadow-[var(--shadow-med)]',
  'pointer-events-none',
  'whitespace-nowrap',
);

export const chartTooltipCrosshairClassName = tw(
  '[stroke:var(--color-text-primary)]',
  '[stroke-width:1]',
);
