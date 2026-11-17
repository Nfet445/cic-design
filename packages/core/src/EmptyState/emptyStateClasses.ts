// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file emptyStateClasses.ts
 * @input Nothing; EmptyState has one appearance and a compact variant
 * @output Tailwind utility class names for the container, the text column,
 *   the title, the description and the action row
 * @position Internal to EmptyState.
 *
 * The compact arms override only what the compact layout changes, so they are
 * joined after the base class and must stay in that order.
 */

import {tw} from '../utils/tw';

/** The container: a centered column with the roomy padding. */
export const emptyStateClassName = tw(
  'flex flex-col items-center justify-center text-center',
  'gap-[var(--spacing-4)] py-[var(--spacing-8)] px-[var(--spacing-6)]',
);

/** The container in a constrained space. */
export const emptyStateCompactClassName = tw(
  'gap-[var(--spacing-2)] py-[var(--spacing-4)] px-[var(--spacing-4)]',
);

/** The title: large, semibold, primary text. */
export const emptyStateTitleClassName = tw(
  'm-0 [font-family:inherit]',
  'text-[length:var(--text-large-size)] leading-[var(--text-large-leading)] font-semibold',
  'text-[color:var(--color-text-primary)]',
);

export const emptyStateTitleCompactClassName =
  'text-[length:var(--text-label-size)]';

/** The description: body type in secondary text. */
export const emptyStateDescriptionClassName = tw(
  'm-0 [font-family:inherit]',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)] font-normal',
  'text-[color:var(--color-text-secondary)]',
);

export const emptyStateDescriptionCompactClassName =
  'text-[length:var(--text-supporting-size)]';

/** The text column under the icon. */
export const emptyStateTextGroupClassName =
  'flex flex-col items-center max-w-[360px]';

/** The action row, and its stacked compact arm. */
export const emptyStateActionsClassName = tw(
  'flex flex-row items-center',
  'gap-[var(--spacing-2)] mt-[var(--spacing-1)]',
);

export const emptyStateActionsCompactClassName = 'flex-col';
