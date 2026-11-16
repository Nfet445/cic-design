// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file gridClasses.ts
 * @input Accepts the grid options Grid resolves from its own props
 * @output Tailwind utility class names for the grid container
 * @position Internal to Grid.
 *
 * Grid sets its track template through a CSS variable rather than an inline
 * declaration, so a consumer rule — including one inside a media query — can
 * still override it. Tailwind scans literal class names, so the variable name
 * in the bracket value repeats `gridTrackVars`.
 */

import {tw} from '../utils/tw';
import type {SpacingStep} from '../utils/types';
import type {GridAlignment} from './Grid';

export const gridTrackVars = {
  templateColumns: '--astryx-grid-template-columns',
  autoRows: '--astryx-grid-auto-rows',
} as const;

export const gridTemplateColumnsClass =
  'grid-cols-[var(--astryx-grid-template-columns)]';

export const gridAutoRowsClass = 'auto-rows-[var(--astryx-grid-auto-rows)]';

const alignClasses: Record<GridAlignment, string> = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses: Record<GridAlignment, string> = {
  start: 'justify-items-start',
  center: 'justify-items-center',
  end: 'justify-items-end',
  stretch: 'justify-items-stretch',
};

const gapClasses: Record<SpacingStep, string> = {
  0: 'gap-0',
  0.5: 'gap-0.5',
  1: 'gap-1',
  1.5: 'gap-1.5',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  8: 'gap-8',
  10: 'gap-10',
};

const rowGapClasses: Record<SpacingStep, string> = {
  0: 'gap-y-0',
  0.5: 'gap-y-0.5',
  1: 'gap-y-1',
  1.5: 'gap-y-1.5',
  2: 'gap-y-2',
  3: 'gap-y-3',
  4: 'gap-y-4',
  5: 'gap-y-5',
  6: 'gap-y-6',
  8: 'gap-y-8',
  10: 'gap-y-10',
};

const columnGapClasses: Record<SpacingStep, string> = {
  0: 'gap-x-0',
  0.5: 'gap-x-0.5',
  1: 'gap-x-1',
  1.5: 'gap-x-1.5',
  2: 'gap-x-2',
  3: 'gap-x-3',
  4: 'gap-x-4',
  5: 'gap-x-5',
  6: 'gap-x-6',
  8: 'gap-x-8',
  10: 'gap-x-10',
};

export interface GridClassNameOptions {
  align?: GridAlignment;
  columnGap?: SpacingStep;
  gap?: SpacingStep;
  justify?: GridAlignment;
  rowGap?: SpacingStep;
}

export function gridClassName({
  align,
  columnGap,
  gap,
  justify,
  rowGap,
}: GridClassNameOptions): string {
  // `rowGap` and `columnGap` narrow `gap` to the axis they leave alone, so the
  // class list never holds two values for one property.
  const uniformGap =
    gap != null && rowGap == null && columnGap == null ? gapClasses[gap] : null;
  const gapFromRows =
    gap != null && rowGap != null && columnGap == null
      ? columnGapClasses[gap]
      : null;
  const gapFromColumns =
    gap != null && columnGap != null && rowGap == null
      ? rowGapClasses[gap]
      : null;

  return tw(
    'grid',
    align != null && alignClasses[align],
    justify != null && justifyClasses[justify],
    uniformGap,
    gapFromRows,
    gapFromColumns,
    rowGap != null && rowGapClasses[rowGap],
    columnGap != null && columnGapClasses[columnGap],
  );
}
