// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file overlayPaddingReset.stylex.ts
 * @input The padding boundary class in `layoutClasses.ts`
 * @output `overlayPaddingReset.reset`: that class, under the name an overlay
 *   root already reads
 * @position Styles module; reachable through `@astryxdesign/core/Layout` and
 *   `@astryxdesign/core/Layout/padding.stylex`, kept so existing imports
 *   resolve.
 *
 * The reset is class text now, in `layoutClasses.ts` beside the other padding
 * seam: pass `reset` to `className`, not to `stylex.props`.
 */

import {layoutPaddingResetClassName} from './layoutClasses';

export const overlayPaddingReset = {
  reset: layoutPaddingResetClassName,
} as const;
