// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file treeExpanderFocus.stylex.ts
 * @input focus-outline tokens
 * @output Exports the compact tree expander's inset ring offset
 * @position Table tree plugin; passed to focusOutlineProps.focusVisible
 */

import * as stylex from '@stylexjs/stylex';
import {focusVars} from '../../../theme/tokens.stylex';

/**
 * A compact row is shorter than the ring around the 24px toggle, and the cell
 * clips its overflow, so there the ring sits inside the toggle.
 *
 * This stays StyleX: the offset has to override the ring's own `:focus-visible`
 * outline-offset, and only a later style in the same `stylex.props` call
 * outranks it — a class could not.
 */
export const treeExpanderFocusStyles = stylex.create({
  expanderFocusInset: {
    outlineOffset: {
      default: null,
      ':focus-visible': `calc(-1 * ${focusVars['--focus-outline-width']})`,
    },
  },
});
