// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file thumbnailRemoveButtonOverrides.stylex.ts
 * @input The element and spacing radii and the overlay colours
 * @output The remove button's corner, size, scrim paint and touch hit inset
 * @position One named StyleX exception in Thumbnail; everything else is a
 *   Tailwind class
 *
 * The button it overrides paints its box, fill and text with `astryx-base`
 * utilities, and every declaration here names a property one of those classes
 * already sets. Two utilities on one property leave the sheet to decide, so a
 * same-property override has to be an unlayered StyleX rule, which outranks a
 * layered utility at any order. Kept as one map so the exception has one home
 * and a test can name it.
 *
 * Fixed colours instead of the luminance-adapting theme: a translucent scrim
 * (--color-overlay) plus an --color-on-dark icon reads on any image without
 * sampling pixel brightness.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars, spacingVars} from '../theme/tokens.stylex';

export const thumbnailRemoveButtonStyles = stylex.create({
  overrides: {
    '--_button-radius': `calc(${radiusVars['--radius-element']} - ${spacingVars['--spacing-1']})`,
    position: 'relative',
    height: 20,
    minWidth: 20,
    backgroundColor: colorVars['--color-overlay'],
    color: colorVars['--color-on-dark'],
    '--_thumbnail-hit-inset': {
      default: '0px',
      '@media (pointer: coarse)': '-2px',
    },
    '::after': {
      content: '""',
      position: 'absolute',
      inset: 'var(--_thumbnail-hit-inset)',
    },
  },
});
