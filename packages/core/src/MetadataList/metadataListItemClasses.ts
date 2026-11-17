// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file metadataListItemClasses.ts
 * @input Nothing; the parent list decides the stacked or inline arm
 * @output Tailwind utility class names for the label, the value, the stacked
 *   wrapper and the icon wrapper
 * @position Internal to MetadataList/MetadataListItem.
 */

import {tw} from '../utils/tw';

const labelTypeClassName = tw(
  'text-[color:var(--color-text-secondary)]',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)] font-[var(--font-weight-medium)]',
  'flex items-center gap-[var(--spacing-2)] m-0 p-0 break-words',
);

const valueTypeClassName = tw(
  'text-[color:var(--color-text-primary)]',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  'm-0 p-0 break-words',
);

/** The `dt` beside its value; the row's height keeps the rows on a rhythm. */
export const metadataListItemLabelClassName = tw(
  labelTypeClassName,
  'min-h-[24px]',
);

export const metadataListItemValueClassName = tw(
  valueTypeClassName,
  'min-h-[24px]',
);

/** The stacked item: the label above the value. */
export const metadataListItemStackedClassName =
  'flex flex-col gap-[var(--spacing-0-5)]';

export const metadataListItemStackedLabelClassName = labelTypeClassName;

export const metadataListItemStackedValueClassName = valueTypeClassName;

export const metadataListItemIconClassName =
  'inline-flex items-center shrink-0 text-[color:var(--color-text-secondary)]';
