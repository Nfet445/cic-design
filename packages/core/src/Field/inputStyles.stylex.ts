// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputStyles.stylex.ts
 * @input Uses the theme's inset shadow tokens
 * @output Exports the status hover shadow of an input wrapper
 * @position Shared styles consumed by TextInput, TextArea, NumberInput, DateInput,
 *   TimeInput, Selector, Typeahead, and Tokenizer
 *
 * A status border, its focus look and the field's own box are classes in
 * `Field/fieldClasses.ts`. This module keeps the hover shadow, whose selector
 * keys three states at once.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import * as stylex from '@stylexjs/stylex';
import {shadowVars} from '../theme/tokens.stylex';

/**
 * Status hover shadow styles for input wrappers.
 * Keyed by InputStatusType.
 */
export const inputStatusHoverShadowStyles = stylex.create({
  warning: {
    boxShadow: {
      default: 'none',
      ':hover:not(:focus-within):where(:not(:disabled,[aria-disabled="true"]))':
        {
          '@media (hover: hover)': shadowVars['--shadow-inset-warning'],
        },
    },
  },
  error: {
    boxShadow: {
      default: 'none',
      ':hover:not(:focus-within):where(:not(:disabled,[aria-disabled="true"]))':
        {
          '@media (hover: hover)': shadowVars['--shadow-inset-error'],
        },
    },
  },
  success: {
    boxShadow: {
      default: 'none',
      ':hover:not(:focus-within):where(:not(:disabled,[aria-disabled="true"]))':
        {
          '@media (hover: hover)': shadowVars['--shadow-inset-success'],
        },
    },
  },
});
