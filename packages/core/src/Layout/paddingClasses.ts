// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file paddingClasses.ts
 * @input Accepts a spacing step for one padding edge, or for a container
 *   variable that announces the padding it applies
 * @output Tailwind utility class names for that logical padding edge, the
 *   `--container-padding-*` variables, the Layout outer inset and Section
 *   padding propagation
 * @position Layout utility; used by Stack, Center, the Layout regions, Section
 *   and the container components
 *
 * Tailwind names inline start and end utilities (`ps-*`, `pe-*`) but has no
 * logical block utilities, so block-start and block-end use arbitrary
 * properties to keep the edges logical rather than physical.
 *
 * One class decides one property: a caller that a per-edge prop overrides
 * resolves the four edges itself and asks for one class per edge, so two
 * classes never set the same variable and stylesheet order never decides an
 * inset.
 *
 * SYNC: packages/core/src/Layout/padding.stylex.ts re-exports these for the
 * callers of that public subpath, and
 * packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs checks the
 * rules they print.
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

/** Uniform padding on all four edges. */
export function paddingClassName(padding: SpacingStep): string {
  return paddingEdgeClassName({
    paddingBlockEnd: padding,
    paddingBlockStart: padding,
    paddingInlineEnd: padding,
    paddingInlineStart: padding,
  });
}

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
/**
 * What a container announces as its inline-start padding. A descendant that
 * bleeds to that edge subtracts it.
 */
const containerInlineStartVarClasses: Record<SpacingStep, string> = {
  0: '[--container-padding-inline-start:var(--spacing-0)]',
  0.5: '[--container-padding-inline-start:var(--spacing-0-5)]',
  1: '[--container-padding-inline-start:var(--spacing-1)]',
  1.5: '[--container-padding-inline-start:var(--spacing-1-5)]',
  2: '[--container-padding-inline-start:var(--spacing-2)]',
  3: '[--container-padding-inline-start:var(--spacing-3)]',
  4: '[--container-padding-inline-start:var(--spacing-4)]',
  5: '[--container-padding-inline-start:var(--spacing-5)]',
  6: '[--container-padding-inline-start:var(--spacing-6)]',
  8: '[--container-padding-inline-start:var(--spacing-8)]',
  10: '[--container-padding-inline-start:var(--spacing-10)]',
};

/** The inline-end counterpart of {@link containerInlineStartVarClasses}. */
const containerInlineEndVarClasses: Record<SpacingStep, string> = {
  0: '[--container-padding-inline-end:var(--spacing-0)]',
  0.5: '[--container-padding-inline-end:var(--spacing-0-5)]',
  1: '[--container-padding-inline-end:var(--spacing-1)]',
  1.5: '[--container-padding-inline-end:var(--spacing-1-5)]',
  2: '[--container-padding-inline-end:var(--spacing-2)]',
  3: '[--container-padding-inline-end:var(--spacing-3)]',
  4: '[--container-padding-inline-end:var(--spacing-4)]',
  5: '[--container-padding-inline-end:var(--spacing-5)]',
  6: '[--container-padding-inline-end:var(--spacing-6)]',
  8: '[--container-padding-inline-end:var(--spacing-8)]',
  10: '[--container-padding-inline-end:var(--spacing-10)]',
};

/** The block-start counterpart of {@link containerInlineStartVarClasses}. */
const containerBlockStartVarClasses: Record<SpacingStep, string> = {
  0: '[--container-padding-block-start:var(--spacing-0)]',
  0.5: '[--container-padding-block-start:var(--spacing-0-5)]',
  1: '[--container-padding-block-start:var(--spacing-1)]',
  1.5: '[--container-padding-block-start:var(--spacing-1-5)]',
  2: '[--container-padding-block-start:var(--spacing-2)]',
  3: '[--container-padding-block-start:var(--spacing-3)]',
  4: '[--container-padding-block-start:var(--spacing-4)]',
  5: '[--container-padding-block-start:var(--spacing-5)]',
  6: '[--container-padding-block-start:var(--spacing-6)]',
  8: '[--container-padding-block-start:var(--spacing-8)]',
  10: '[--container-padding-block-start:var(--spacing-10)]',
};

/** The block-end counterpart of {@link containerInlineStartVarClasses}. */
const containerBlockEndVarClasses: Record<SpacingStep, string> = {
  0: '[--container-padding-block-end:var(--spacing-0)]',
  0.5: '[--container-padding-block-end:var(--spacing-0-5)]',
  1: '[--container-padding-block-end:var(--spacing-1)]',
  1.5: '[--container-padding-block-end:var(--spacing-1-5)]',
  2: '[--container-padding-block-end:var(--spacing-2)]',
  3: '[--container-padding-block-end:var(--spacing-3)]',
  4: '[--container-padding-block-end:var(--spacing-4)]',
  5: '[--container-padding-block-end:var(--spacing-5)]',
  6: '[--container-padding-block-end:var(--spacing-6)]',
  8: '[--container-padding-block-end:var(--spacing-8)]',
  10: '[--container-padding-block-end:var(--spacing-10)]',
};

/**
 * The outer inset a Layout applies to its own regions. `own` wins over the
 * inherited `--layout-padding-outer-x` a padding container publishes, so one
 * Layout's padding never reaches a nested Layout's regions.
 */
const layoutOuterXVarClasses: Record<SpacingStep, string> = {
  0: '[--layout-padding-own-outer-x:var(--spacing-0)]',
  0.5: '[--layout-padding-own-outer-x:var(--spacing-0-5)]',
  1: '[--layout-padding-own-outer-x:var(--spacing-1)]',
  1.5: '[--layout-padding-own-outer-x:var(--spacing-1-5)]',
  2: '[--layout-padding-own-outer-x:var(--spacing-2)]',
  3: '[--layout-padding-own-outer-x:var(--spacing-3)]',
  4: '[--layout-padding-own-outer-x:var(--spacing-4)]',
  5: '[--layout-padding-own-outer-x:var(--spacing-5)]',
  6: '[--layout-padding-own-outer-x:var(--spacing-6)]',
  8: '[--layout-padding-own-outer-x:var(--spacing-8)]',
  10: '[--layout-padding-own-outer-x:var(--spacing-10)]',
};

/** The block-axis counterpart of {@link layoutOuterXVarClasses}. */
const layoutOuterYVarClasses: Record<SpacingStep, string> = {
  0: '[--layout-padding-own-outer-y:var(--spacing-0)]',
  0.5: '[--layout-padding-own-outer-y:var(--spacing-0-5)]',
  1: '[--layout-padding-own-outer-y:var(--spacing-1)]',
  1.5: '[--layout-padding-own-outer-y:var(--spacing-1-5)]',
  2: '[--layout-padding-own-outer-y:var(--spacing-2)]',
  3: '[--layout-padding-own-outer-y:var(--spacing-3)]',
  4: '[--layout-padding-own-outer-y:var(--spacing-4)]',
  5: '[--layout-padding-own-outer-y:var(--spacing-5)]',
  6: '[--layout-padding-own-outer-y:var(--spacing-6)]',
  8: '[--layout-padding-own-outer-y:var(--spacing-8)]',
  10: '[--layout-padding-own-outer-y:var(--spacing-10)]',
};

/**
 * Propagates one Section's explicit padding to nested Sections that use the
 * theme default. Deliberately not the public `--astryx-section-padding`: an
 * overlay drops this inherited value at its boundary
 * (`architecture:container-padding`), and must keep the theme's.
 */
const sectionPropagationClasses: Record<SpacingStep, string> = {
  0: '[--_section-padding-propagated:var(--spacing-0)]',
  0.5: '[--_section-padding-propagated:var(--spacing-0-5)]',
  1: '[--_section-padding-propagated:var(--spacing-1)]',
  1.5: '[--_section-padding-propagated:var(--spacing-1-5)]',
  2: '[--_section-padding-propagated:var(--spacing-2)]',
  3: '[--_section-padding-propagated:var(--spacing-3)]',
  4: '[--_section-padding-propagated:var(--spacing-4)]',
  5: '[--_section-padding-propagated:var(--spacing-5)]',
  6: '[--_section-padding-propagated:var(--spacing-6)]',
  8: '[--_section-padding-propagated:var(--spacing-8)]',
  10: '[--_section-padding-propagated:var(--spacing-10)]',
};
/**
 * The padding a container announces to its descendants, for every edge it
 * sets. A per-edge prop resolves into the same call, so an override moves the
 * variable with the padding: a bleed child compensates against the padding
 * actually applied, not the one asked for.
 */
export function containerPaddingByEdgeClassName({
  paddingBlockEnd,
  paddingBlockStart,
  paddingInlineEnd,
  paddingInlineStart,
}: PaddingEdges): string {
  return tw(
    paddingInlineStart != null &&
      containerInlineStartVarClasses[paddingInlineStart],
    paddingInlineEnd != null && containerInlineEndVarClasses[paddingInlineEnd],
    paddingBlockStart != null &&
      containerBlockStartVarClasses[paddingBlockStart],
    paddingBlockEnd != null && containerBlockEndVarClasses[paddingBlockEnd],
  );
}

/** The outer inset a Layout applies to its own regions. */
export function layoutPaddingClassName({
  paddingOuterX,
  paddingOuterY,
}: {
  paddingOuterX?: SpacingStep;
  paddingOuterY?: SpacingStep;
}): string {
  return tw(
    paddingOuterX != null && layoutOuterXVarClasses[paddingOuterX],
    paddingOuterY != null && layoutOuterYVarClasses[paddingOuterY],
  );
}
