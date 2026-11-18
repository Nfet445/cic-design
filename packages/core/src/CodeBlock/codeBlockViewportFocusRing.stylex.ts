// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file codeBlockViewportFocusRing.stylex.ts
 * @input Reads the `--focus-outline-width` variable; composes with
 *   `focusOutlineProps.focusVisible`
 * @output One StyleX rule that pulls the shared ring inside the clipped viewport
 * @position Exception inside CodeBlock: the one rule a Tailwind class cannot
 *   carry.
 *
 * The root clips its corners (`overflow: hidden`), so the viewport's keyboard
 * ring has to sit inside its own box. The ring is composed as StyleX atoms, and
 * an unlayered StyleX rule wins over every utility in `astryx-base`; a class
 * would lose to the ring's own `outline-offset: 0` default. Only the offset
 * lives here; every other viewport declaration is a class in
 * `codeBlockClasses.ts`.
 */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  viewportFocusRingInset: {
    outlineOffset: {
      default: null,
      ':focus-visible': `calc(-1 * var(--focus-outline-width))`,
    },
  },
});

export const codeBlockViewportFocusRingStyles = styles;
