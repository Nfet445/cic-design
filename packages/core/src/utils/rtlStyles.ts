// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rtlStyles.ts
 * @input A block offset in the block axis
 * @output Shared StyleX style that centers an element on the inline axis
 * @position Core utility; applied to centered overlays in Slider, Switch,
 *   Resizable, RadioList, Popover, CheckboxInput and Markdown
 *
 * SYNC: When modified, update:
 * - /packages/core/src/utils/index.ts
 */

// `centerInline` uses physical `left: 50%` and `translateX(-50%)` on purpose.
// Both use the same physical edge, so the element centers in LTR and RTL. A
// logical `insetInlineStart: 50%` flips the anchor in RTL but the translate
// does not, so the element is off by its own width. The lint suppression
// lives here once, and `@astryx/no-physical-properties` points offenders
// here. `blockOffset` is a translateY length: `'100%'` sits the element one
// height below its anchor, and `'-50%'` centers it on both axes.
//
// The RTL mirror of a directional glyph is `RTL_MIRROR_CLASS` in
// `utils/rtlClasses.ts`: a shared class, not a style, so a mirrored glyph can
// also carry a utility class of its own.

import * as stylex from '@stylexjs/stylex';

export const rtlStyles = stylex.create({
  centerInline: (blockOffset: string) => ({
    // eslint-disable-next-line @astryx/no-physical-properties -- intentional: physical left+translateX(-50%) is direction-symmetric and the correct way to center; a logical anchor would break RTL centering (see file header).
    left: '50%',
    transform: `translate(-50%, ${blockOffset})`,
  }),
});
