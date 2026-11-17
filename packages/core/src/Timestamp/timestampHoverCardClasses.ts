// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file timestampHoverCardClasses.ts
 * @input Nothing; the card's classes depend on which columns it reserves
 * @output Tailwind utility class names for the card's list, its rows, cells
 *   and the four grid templates
 * @position Internal to TimestampHoverCard.
 *
 * The list is a grid so cells align down columns across rows; a row is
 * `contents`, which lets its `<dt>`/`<dd>` land in the list's tracks.
 */

import {tw} from '../utils/tw';

export const timestampHoverCardListClassName = tw(
  'grid items-center',
  'gap-x-[var(--spacing-4)] gap-y-[var(--spacing-2)]',
  'm-0 p-0',
);

export const timestampHoverCardRowClassName = 'contents';

/** A label: the supporting role in secondary text. */
export const timestampHoverCardLabelClassName = tw(
  'text-[color:var(--color-text-secondary)]',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  'font-normal m-0 p-0 whitespace-nowrap',
);

/** A value: the body role in primary text. */
export const timestampHoverCardValueClassName = tw(
  'text-[color:var(--color-text-primary)]',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  'font-normal m-0 p-0 whitespace-nowrap',
);

/**
 * A value carrying the action cell spans the value and action columns and
 * shares the card's tracks, so the copy buttons align. Without subgrid a flex
 * row keeps the button at the row's end.
 */
export const timestampHoverCardValueCellsClassName = tw(
  'col-span-2 items-center justify-between',
  'flex supports-[grid-template-columns:subgrid]:grid',
  '[grid-template-columns:subgrid]',
);

export const timestampHoverCardActionClassName =
  'flex justify-end items-center';

export const timestampHoverCardGridTemplateClassName = {
  labelValueAction: 'grid-cols-[auto_1fr_auto]',
  labelValue: 'grid-cols-[auto_1fr]',
  valueAction: 'grid-cols-[1fr_auto]',
  value: 'grid-cols-[1fr]',
} as const;
