// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file bottomSheetPanelPadding.stylex.ts
 * @input Reads the published container padding and the grab bar height
 * @output Two StyleX rules for the content box's block-start padding
 * @position Exception inside BottomSheetPanel: the rules a Tailwind class
 *   cannot carry
 *
 * The content box is a layout container, so Layout's own rules publish and
 * apply its padding. Those rules are unlayered, and an unlayered declaration
 * beats any @layer astryx-base class, so the inset this panel publishes past
 * the grab bar's band, and the band it applies on top, stay here.
 */

import * as stylex from '@stylexjs/stylex';

const HANDLE_BAR_HEIGHT = 'var(--spacing-6)';

// An explicit padding publishes only the part past the grab bar's band, so a
// lone Section that escapes the published padding still starts below the bar.
// clearsGrabBar applies the band on top.
export const bottomSheetPastGrabBarStyles = stylex.create({
  0: {
    '--container-padding-block-start': `max(calc(var(--spacing-0) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  0.5: {
    '--container-padding-block-start': `max(calc(var(--spacing-0-5) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  1: {
    '--container-padding-block-start': `max(calc(var(--spacing-1) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  1.5: {
    '--container-padding-block-start': `max(calc(var(--spacing-1-5) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  2: {
    '--container-padding-block-start': `max(calc(var(--spacing-2) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  3: {
    '--container-padding-block-start': `max(calc(var(--spacing-3) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  4: {
    '--container-padding-block-start': `max(calc(var(--spacing-4) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  5: {
    '--container-padding-block-start': `max(calc(var(--spacing-5) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  6: {
    '--container-padding-block-start': `max(calc(var(--spacing-6) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  8: {
    '--container-padding-block-start': `max(calc(var(--spacing-8) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
  10: {
    '--container-padding-block-start': `max(calc(var(--spacing-10) - ${HANDLE_BAR_HEIGHT}), 0px)`,
  },
});

// max(padding, the bar) on top of the published inset.
export const bottomSheetClearsGrabBarStyles = stylex.create({
  clearsGrabBar: {
    paddingBlockStart: `calc(var(--container-padding-block-start, 0px) + ${HANDLE_BAR_HEIGHT})`,
  },
});
