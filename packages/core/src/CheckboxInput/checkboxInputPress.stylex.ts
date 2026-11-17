// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file checkboxInputPress.stylex.ts
 * @input The indicator press-scope marker
 * @output The press overlay's `content`, on by default and off over an
 *   indicator that paints its own press
 * @position StyleX survivor beside CheckboxInput
 *
 * The arm reads the marker's generated class name, which no utility can
 * restate. Its repeated class selector also outranks `after:content-['']` from
 * `checkboxInputClasses.ts` in any sheet order.
 */

import * as stylex from '@stylexjs/stylex';
import {indicatorPressScope} from '../internal/indicatorPress.stylex';

export const pressOverlayStyles = stylex.create({
  // `when.descendant` takes a pseudo-class; `:is(*)` matches any marked
  // indicator.
  content: {
    '::after': {
      content: {
        default: '""',
        [stylex.when.descendant(':is(*)', indicatorPressScope)]: 'none',
      },
    },
  },
});
