// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tooltipClasses.ts
 * @input The theme's colour, radius, typography and spacing variables
 * @output The utility class strings a tooltip wrapper, its surface and its
 *   content carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The surface is the same inverted one Toast paints, so the two match in every
 * theme. Long words wrap rather than widen the bubble past its 300px cap.
 */

import {tw} from '../utils/tw';

/**
 * The wrapper contributes no box: a tooltip wraps text, and its trigger has to
 * stay a direct child of whatever lays it out. `inline` keeps a standalone
 * trigger's own line box behaviour.
 */
export const tooltipWrapperClassName = {
  contents: 'contents',
  inline: 'inline',
};

/**
 * The trigger's own hint that a tooltip exists: a dashed underline in the
 * emphasised border colour, two pixels clear of the text.
 */
export const tooltipHoverIndicationClassName = tw(
  'underline decoration-dashed',
  '[text-decoration-color:var(--color-border-emphasized)]',
  '[text-underline-offset:2px]',
);

export const tooltipSurfaceClassName = tw(
  '[background-color:var(--color-background-inverted)]',
  '[color:var(--color-background-surface)]',
  'rounded-[var(--radius-container)]',
  '[font-family:var(--font-family-body)]',
  '[font-size:var(--text-body-size)]',
  '[line-height:var(--text-body-leading)]',
);

export const tooltipContentClassName = tw(
  '[padding-block-start:var(--spacing-2)]',
  '[padding-block-end:var(--spacing-2)]',
  'ps-[var(--spacing-2)]',
  'pe-[var(--spacing-2)]',
  'max-w-[300px]',
  '[word-break:break-word]',
);
