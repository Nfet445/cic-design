// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file padding.stylex.ts
 * @input The padding class builders in `paddingClasses.ts` and the overlay
 *   reset in `overlayPaddingReset.stylex.ts`
 * @output `spacingStepToToken` and the same builders this public subpath
 *   always published
 * @position Public subpath `@astryxdesign/core/Layout/padding.stylex`, kept so
 *   existing imports resolve.
 *
 * It carries no StyleX rule: every padding is a class string, so pass it to
 * `className` and not to `stylex.props`.
 */

export {
  containerPaddingByEdgeClassName,
  layoutPaddingClassName,
  paddingClassName,
  paddingEdgeClassName,
  sectionPaddingClassName,
  type PaddingEdges,
} from './paddingClasses';
export {overlayPaddingReset} from './overlayPaddingReset.stylex';

import type {SpacingStep} from '../utils/types';

/**
 * Maps numeric SpacingStep values to SpacingToken keys used by the container system.
 */
export const spacingStepToToken: Record<SpacingStep, string> = {
  0: 'spacing0',
  0.5: 'spacing0_5',
  1: 'spacing1',
  1.5: 'spacing1_5',
  2: 'spacing2',
  3: 'spacing3',
  4: 'spacing4',
  5: 'spacing5',
  6: 'spacing6',
  8: 'spacing8',
  10: 'spacing10',
};
