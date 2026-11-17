// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file statClasses.ts
 * @input Accepts nothing: every class is fixed
 * @output The utility class strings the root, label, value row and its value,
 *   the delta and its glyph, the description, the media slot and the
 *   screen-reader text carry; plus the value size and delta sentiment maps
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

const supportingTextClassName = tw(
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
);

export const statRootClassName = 'flex flex-col items-start gap-1 min-w-0';

export const statLabelClassName = tw(
  supportingTextClassName,
  'font-medium text-secondary',
);

export const statValueRowClassName = 'flex items-baseline gap-2 min-w-0';

export const statValueClassName = tw(
  '[font-family:var(--font-family-heading)] font-semibold',
  'leading-[var(--text-heading-2-leading)] text-primary tabular-nums',
);

/** Value font size per `Stat` size variant. */
export const statSizeClassNames = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
} as const;

export const statDeltaClassName = tw(
  supportingTextClassName,
  'inline-flex items-center gap-1 font-medium tabular-nums whitespace-nowrap',
);

/** Delta colour per resolved sentiment. */
export const statSentimentClassNames = {
  positive: 'text-success',
  negative: 'text-error',
  neutral: 'text-secondary',
} as const;

export const statDeltaGlyphClassName = 'shrink-0';

export const statDescriptionClassName = tw(
  supportingTextClassName,
  'text-secondary',
);

export const statMediaClassName = 'mt-1 self-stretch min-w-0';

export const statScreenReaderTextClassName = 'sr-only';
