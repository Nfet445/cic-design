// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputStyles.stylex.ts
 * @input Uses theme tokens (color, spacing, radius, shadow, transition)
 * @output Exports the status hover shadow of an input wrapper, and the shared
 *   wrapper appearance a prototype still paints by StyleX
 * @position Shared styles consumed by TextInput, TextArea, NumberInput, DateInput,
 *   TimeInput, Selector, Typeahead, and Tokenizer
 *
 * A status border, its focus look and the field's own box are classes in
 * `Field/fieldClasses.ts`. This module keeps the hover shadow, whose selector
 * keys three states at once, and the wrapper map that the sandbox prototypes
 * still apply directly.
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  shadowVars,
  durationVars,
  easeVars,
  borderVars,
} from '../theme/tokens.stylex';

/**
 * Base wrapper styles shared by all input components.
 * Components apply these as a foundation and override specific properties
 * (e.g. padding, alignItems, gap) as needed.
 */
export const inputWrapperStyles = stylex.create({
  base: {
    boxSizing: 'border-box',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    // Forced colors drop the inset shadow below and repaint author border
    // colors in one system color, so the field-focus treatment would vanish
    // there. A focused field's border takes the system Highlight color instead
    // (`spec:AST-020` FR1).
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      ':focus-within': {
        default: colorVars['--color-accent'],
        '@media (forced-colors: active)': 'Highlight',
      },
    },
    '--_field-radius': radiusVars['--radius-element'],
    borderRadius: 'var(--_field-radius)',
    backgroundColor: colorVars['--color-background-surface'],
    transitionProperty: 'border-color, box-shadow',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    boxShadow: {
      default: 'none',
      ':hover:not(:focus-within):where(:not(:disabled,[aria-disabled="true"]))':
        {
          '@media (hover: hover)': `inset 0px 0px 0px 2px color-mix(in srgb, ${colorVars['--color-border-emphasized']} 30%, transparent)`,
        },
      ':focus-within': `inset 0px 0px 0px 2px ${colorVars['--color-accent-muted']}`,
    },
    outline: 'none',
  },
  disabled: {
    cursor: 'default',
    opacity: 0.5,
    borderColor: colorVars['--color-border-emphasized'],
    // Suppress the base hover ring — a disabled control must not react to hover.
    boxShadow: 'none',
  },
  // Text fields apply this after `base`. A tap on one raises the keyboard,
  // and a fade would repaint the field on each frame of that rise.
  textField: {
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
      '@media (pointer: coarse)': '0s',
    },
  },
});

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
