// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file drawerContentSafeArea.stylex.ts
 * @input Reads `--container-padding-block-end` and the block-end safe area
 * @output One StyleX rule that keeps the last content row above the home
 *   indicator
 * @position Exception inside Drawer: the one rule a Tailwind class cannot carry
 *
 * The drawer's content area is its container, so its padding comes from the
 * layout container rules. Those rules are unlayered, and an unlayered
 * declaration beats any `@layer astryx-base` class, so the safe-area
 * composition that has to win on the block-end edge stays here beside them. The
 * panel, its scrim and its open transform are classes in `drawerClasses.ts`.
 */

import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  // Block-end inset of the content area = container padding + the home
  // indicator's safe area, so the last row of content stays clear of the
  // indicator in every padding mode. The published
  // --container-padding-block-end keeps the safe area OUT, so a bleed child
  // subtracts only the container inset and the safe area survives below it.
  contentSafeArea: {
    paddingBlockEnd:
      'calc(var(--container-padding-block-end, 0px) + env(safe-area-inset-bottom, 0px))',
  },
});

export const drawerContentSafeAreaStyles = styles;
