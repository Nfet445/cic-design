// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ChatComposerDrawer.stylex.ts
 * @input Reads the toggle row's hover through the marker it carries
 * @output The hover tint of the drawer's collapsed label and of its bar handle
 * @position StyleX remainder of ChatComposerDrawer: the one ancestor marker
 *   read, which a utility cannot express
 *
 * The toggle row carries the default marker from the focus ring it composes,
 * and only that generated class name reaches the hover arm, so these two paints
 * stay on StyleX. Their repeated class selector outranks the rest colour the
 * class map sets, in any sheet order. `default: null` leaves the rest paint to
 * the class.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

export const chatComposerDrawerHoverStyles = stylex.create({
  label: {
    color: {
      default: null,
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': colorVars['--color-text-primary'],
      },
    },
  },
  handle: {
    backgroundColor: {
      default: null,
      [stylex.when.ancestor(':hover')]: {
        '@media (hover: hover)': colorVars['--color-icon-primary'],
      },
    },
  },
});
