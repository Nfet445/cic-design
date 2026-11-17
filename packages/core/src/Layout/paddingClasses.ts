// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file paddingClasses.ts
 * @input Accepts a spacing step for one padding edge
 * @output Tailwind utility class names for that logical padding edge
 * @position Layout utility; used by Stack, Center and other padded containers
 *
 * Tailwind names inline start and end utilities (`ps-*`, `pe-*`) but has no
 * logical block utilities, so block-start and block-end use arbitrary
 * properties to keep the edges logical rather than physical.
 *
 * SYNC: packages/core/src/Layout/padding.stylex.ts holds the StyleX rules for
 * the components that still use them.
 */

import {tw} from '../utils/tw';
import type {SpacingStep} from '../utils/types';

const inlineStartClasses: Record<SpacingStep, string> = {
  0: 'ps-0',
  0.5: 'ps-0.5',
  1: 'ps-1',
  1.5: 'ps-1.5',
  2: 'ps-2',
  3: 'ps-3',
  4: 'ps-4',
  5: 'ps-5',
  6: 'ps-6',
  8: 'ps-8',
  10: 'ps-10',
};

const inlineEndClasses: Record<SpacingStep, string> = {
  0: 'pe-0',
  0.5: 'pe-0.5',
  1: 'pe-1',
  1.5: 'pe-1.5',
  2: 'pe-2',
  3: 'pe-3',
  4: 'pe-4',
  5: 'pe-5',
  6: 'pe-6',
  8: 'pe-8',
  10: 'pe-10',
};

const blockStartClasses: Record<SpacingStep, string> = {
  0: '[padding-block-start:var(--spacing-0)]',
  0.5: '[padding-block-start:var(--spacing-0-5)]',
  1: '[padding-block-start:var(--spacing-1)]',
  1.5: '[padding-block-start:var(--spacing-1-5)]',
  2: '[padding-block-start:var(--spacing-2)]',
  3: '[padding-block-start:var(--spacing-3)]',
  4: '[padding-block-start:var(--spacing-4)]',
  5: '[padding-block-start:var(--spacing-5)]',
  6: '[padding-block-start:var(--spacing-6)]',
  8: '[padding-block-start:var(--spacing-8)]',
  10: '[padding-block-start:var(--spacing-10)]',
};

const blockEndClasses: Record<SpacingStep, string> = {
  0: '[padding-block-end:var(--spacing-0)]',
  0.5: '[padding-block-end:var(--spacing-0-5)]',
  1: '[padding-block-end:var(--spacing-1)]',
  1.5: '[padding-block-end:var(--spacing-1-5)]',
  2: '[padding-block-end:var(--spacing-2)]',
  3: '[padding-block-end:var(--spacing-3)]',
  4: '[padding-block-end:var(--spacing-4)]',
  5: '[padding-block-end:var(--spacing-5)]',
  6: '[padding-block-end:var(--spacing-6)]',
  8: '[padding-block-end:var(--spacing-8)]',
  10: '[padding-block-end:var(--spacing-10)]',
};

export interface PaddingEdges {
  paddingBlockEnd?: SpacingStep;
  paddingBlockStart?: SpacingStep;
  paddingInlineEnd?: SpacingStep;
  paddingInlineStart?: SpacingStep;
}

/** The utility classes for every padding edge a component sets. */
export function paddingEdgeClassName({
  paddingBlockEnd,
  paddingBlockStart,
  paddingInlineEnd,
  paddingInlineStart,
}: PaddingEdges): string {
  return tw(
    paddingInlineStart != null && inlineStartClasses[paddingInlineStart],
    paddingInlineEnd != null && inlineEndClasses[paddingInlineEnd],
    paddingBlockStart != null && blockStartClasses[paddingBlockStart],
    paddingBlockEnd != null && blockEndClasses[paddingBlockEnd],
  );
}
