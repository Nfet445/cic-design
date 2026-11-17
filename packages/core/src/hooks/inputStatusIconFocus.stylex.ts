// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputStatusIconFocus.stylex.ts
 * @input Nothing; one offset for the shared focus ring
 * @output The status button's focus-ring offset
 * @position Internal to hooks/useInputStatusIcon.tsx
 */

import * as stylex from '@stylexjs/stylex';

/**
 * The ring's own offset is unlayered StyleX, so this override has to be
 * unlayered too: a Tailwind utility would lose to it whatever the class order.
 *
 * Not the shared offset: this button sits inside the field, and measured at the
 * standard 3px its ring crosses the field border.
 */
export const inputStatusIconFocusStyles = stylex.create({
  offset: {
    outlineOffset: {default: null, ':focus-visible': '2px'},
  },
});
