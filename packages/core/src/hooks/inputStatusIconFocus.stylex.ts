// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputStatusIconFocus.stylex.ts
 * @input Nothing; one offset for the shared focus ring
 * @output The status button's focus-ring offset
 * @position Internal to hooks/useInputStatusIcon.tsx
 */

import * as stylex from '@stylexjs/stylex';

/**
 * The rule this loses to is `focusOutlineStyles.focusVisible`'s
 * `outlineOffset`, in utils/focusOutline.stylex.ts: the ring is still unlayered
 * StyleX, so this override has to be unlayered too, and the two resolve in one
 * `stylex.props` call (hooks/useInputStatusIcon.tsx), where the later block
 * wins per property. A Tailwind utility would lose to the ring whatever the
 * class order, so this module waits for the ring to become a class.
 *
 * Not the shared offset: this button sits inside the field, and measured at the
 * standard 3px its ring crosses the field border.
 */
export const inputStatusIconFocusStyles = stylex.create({
  offset: {
    outlineOffset: {default: null, ':focus-visible': '2px'},
  },
});
