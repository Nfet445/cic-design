// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file metadataListClasses.ts
 * @input Nothing; the grid arm is picked by the props in MetadataList.tsx
 * @output Tailwind utility class names for the list root, its title, the `dl`
 *   reset, each grid arm and the show-more toggle
 * @position Internal to MetadataList.
 *
 * The grid arms all paint `grid-template-columns`, so only one of them is
 * joined at a time. A fixed column count or a custom label width is a runtime
 * value: the `dl` reads it from the private `--_metadata-list-columns`
 * variable behind `metadataListColumnsClassName`.
 */

import {tw} from '../utils/tw';

export const metadataListClassName = 'flex flex-col';

export const metadataListTitleClassName = 'mb-[var(--spacing-3)]';

/** The `dl` reset, joined under every grid arm. */
export const metadataListResetClassName = 'm-0 p-0';

/** The grid template a runtime `columns`/label width resolves to. */
export const metadataListColumnsClassName =
  '[grid-template-columns:var(--_metadata-list-columns)]';

export const metadataListGridClassName = {
  // Side labels: one label track and one value track per item.
  single: tw(
    'grid [grid-template-columns:auto_minmax(0,1fr)]',
    'gap-x-[var(--spacing-4)] gap-y-[var(--spacing-2)] items-baseline',
  ),
  // Stacked labels: a whole item in one cell.
  stackedSingle: 'grid [grid-template-columns:1fr] gap-[var(--spacing-3)]',
  multi:
    'grid [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))] gap-[var(--spacing-4)]',
  horizontal: 'flex flex-row flex-wrap gap-[var(--spacing-4)]',
} as const;

export const metadataListToggleClassName = tw(
  'appearance-none bg-transparent border-0 py-[var(--spacing-2)] px-0',
  'cursor-pointer [&[aria-disabled="true"]]:cursor-default',
  'text-[color:var(--color-text-accent)] [font-family:inherit] text-start self-start',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)] font-[var(--font-weight-medium)]',
);
