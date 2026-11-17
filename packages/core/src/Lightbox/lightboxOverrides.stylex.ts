// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file lightboxOverrides.stylex.ts
 * @input Reads the `--focus-outline-width` and `--color-on-dark` tokens;
 *   composes with `focusOutlineProps.focusVisible`
 * @output Two StyleX rules that outrank the utility a child component carries
 * @position Exception inside Lightbox: the rules a Tailwind class cannot carry.
 *
 * `zoomButtonFocusInset`: the zoom button's box clips, so its keyboard ring has
 * to sit inside its own edge. The ring is composed as StyleX atoms, and an
 * unlayered StyleX rule wins over every utility in `astryx-base`; a class would
 * lose to the ring's own `outline-offset: 0` default. Only the offset lives
 * here; every other zoom-button declaration is a class in `lightboxClasses.ts`.
 *
 * `onDarkChrome`: with zoom, a photo can lie under the controls, so the icon
 * and the counter keep the on-dark colour whatever a theme does to the Button
 * or to Text. Both children author `color` themselves (`text-inherit`), and two
 * utilities for one property in one layer settle by sheet order, not by the
 * order of the class attribute. An unlayered rule is the only override that
 * holds.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars, focusVars} from '../theme/tokens.stylex';

const styles = stylex.create({
  zoomButtonFocusInset: {
    outlineOffset: {
      default: null,
      ':focus-visible': `calc(-1 * ${focusVars['--focus-outline-width']})`,
    },
  },
  onDarkChrome: {
    color: colorVars['--color-on-dark'],
  },
});

export const lightboxOverrideStyles = styles;
