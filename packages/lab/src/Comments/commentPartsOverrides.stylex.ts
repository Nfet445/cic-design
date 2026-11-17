// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentPartsOverrides.stylex.ts
 * @input Nothing: every rule is fixed
 * @output StyleX rules that paint a highlighted quote's rule and a running
 *   comment's shimmering label
 * @position Style exception; the parts pass them through `xstyle`
 *
 * Both rules carry four conditions on one property and need a stated order
 * between them: a highlight's rule color has to win over `Blockquote`'s own
 * rule color, and the shimmer's transparency has to hold only where the glyph
 * clip is supported, never under reduced motion or in forced colors. Layer
 * utilities would be ordered by the built sheet, not by the class attribute.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars} from '@astryxdesign/core/theme/tokens.stylex';
import type {CommentHighlightColor} from './types';

/* A highlighted passage's quote rule, in the border token of the host's
   highlight color. */
export const commentHighlightRuleStyles = stylex.create({
  blue: {borderInlineStartColor: colorVars['--color-border-blue']},
  cyan: {borderInlineStartColor: colorVars['--color-border-cyan']},
  gray: {borderInlineStartColor: colorVars['--color-border-gray']},
  green: {borderInlineStartColor: colorVars['--color-border-green']},
  orange: {borderInlineStartColor: colorVars['--color-border-orange']},
  pink: {borderInlineStartColor: colorVars['--color-border-pink']},
  purple: {borderInlineStartColor: colorVars['--color-border-purple']},
  red: {borderInlineStartColor: colorVars['--color-border-red']},
  teal: {borderInlineStartColor: colorVars['--color-border-teal']},
  yellow: {borderInlineStartColor: colorVars['--color-border-yellow']},
});

// Slides a gradient twice the label's width so its light band crosses the
// label left to right.
const progressShimmer = stylex.keyframes({
  from: {backgroundPosition: '100% 0'},
  to: {backgroundPosition: '0 0'},
});

export const commentPartsProgressLabelStyles = stylex.create({
  base: {
    // The text is painted by its background, clipped to the glyphs, so it never
    // drops below secondary-text contrast. Where the clip is unsupported, under
    // reduced motion, and in forced colors, the label is plain secondary text.
    color: {
      default: colorVars['--color-text-secondary'],
      '@supports (background-clip: text)': 'transparent',
      '@media (prefers-reduced-motion: reduce)':
        colorVars['--color-text-secondary'],
      '@media (forced-colors: active)': 'CanvasText',
    },
    backgroundImage: {
      default: 'none',
      '@supports (background-clip: text)': `linear-gradient(90deg, ${colorVars['--color-text-secondary']} 40%, ${colorVars['--color-text-primary']} 50%, ${colorVars['--color-text-secondary']} 60%)`,
      '@media (prefers-reduced-motion: reduce)': 'none',
      '@media (forced-colors: active)': 'none',
    },
    backgroundSize: '250% 100%',
    backgroundClip: 'text',
    animationName: {
      default: 'none',
      '@supports (background-clip: text)': progressShimmer,
      '@media (prefers-reduced-motion: reduce)': 'none',
      '@media (forced-colors: active)': 'none',
    },
    animationDuration: `calc(${durationVars['--duration-slow-max']} * 2)`,
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});

/** The rule color for one highlight color, or nothing for a neutral quote. */
export function commentHighlightRuleStyle(
  highlightColor: CommentHighlightColor | undefined,
) {
  return highlightColor == null
    ? undefined
    : commentHighlightRuleStyles[highlightColor];
}
