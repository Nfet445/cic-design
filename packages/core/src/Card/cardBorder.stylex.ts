// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file cardBorder.stylex.ts
 * @input Reads the `--container-padding-*` variables `container()` publishes
 * @output One StyleX rule that insets the card padding by the border width
 * @position Exception inside Card: the one rule a Tailwind class cannot carry.
 *
 * `container()` sets `padding` from its variables as an unlayered StyleX rule.
 * An unlayered rule wins over every utility in `astryx-base`, so the
 * border-inset `calc()` stays here: a class would lose to the plain padding
 * container already set. Only the subtracted padding lives here; the border
 * itself is a class in `cardClasses.ts`.
 */

import * as stylex from '@stylexjs/stylex';
import {borderVars} from '../theme/tokens.stylex';

const styles = stylex.create({
  // The border is drawn inside the padding — its width is subtracted from each
  // side — so the total inset (border + padding) equals the padding token.
  padding: {
    paddingInlineStart: `calc(var(--container-padding-inline-start) - ${borderVars['--border-width']})`,
    paddingInlineEnd: `calc(var(--container-padding-inline-end) - ${borderVars['--border-width']})`,
    paddingBlockStart: `calc(var(--container-padding-block-start) - ${borderVars['--border-width']})`,
    paddingBlockEnd: `calc(var(--container-padding-block-end) - ${borderVars['--border-width']})`,
  },
});

export const cardBorderStyles = styles;
