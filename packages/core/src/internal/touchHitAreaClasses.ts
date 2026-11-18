// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchHitAreaClasses.ts
 * @input The insets that utils/hitArea.ts writes on a host
 * @output `touchHitAreaLayerClassName`, a host's invisible hit band under a
 *   coarse pointer, and `touchHitAreaLayerBelowChildrenClassName`, the same
 *   band drawn below the host's children
 * @position Internal styling utility for Button (and so the input clear
 *   button), CheckboxInput, RadioListItem, List rows, InfoTip,
 *   SegmentedControl segments and the press-tracking groups. Each keeps its
 *   insets live with `useTouchHitArea` (utils/touchHitArea.ts).
 *
 * The band is the host's `::after`, grown past each edge by the measured
 * inset. A clip path cuts out the host's box, so its content keeps its taps.
 * A tap on the band lands on the host. Button draws the band on its content
 * wrapper instead, which leaves its own `::after` to callers. The insets then
 * reach the wrapper by inheritance, a tap on the band lands on that
 * descendant, and the watch has `ownsDescendantTouches` off. A host whose children fill its box,
 * such as a press-tracking group, takes the below-children band. That band is its
 * `::before`, so its positioned children paint over the clip path's edge, and
 * the pixels on their own edges stay theirs. SYNC: utils/hitArea.ts
 * HIT_INSET_PROPERTIES, utils/touchHitArea.ts and utils/touchHitArea.test.tsx.
 *
 * Nothing rivals the band: it owns the host's `::after`, or its `::before`
 * below its children, and no other class paints either on these hosts.
 */

import {tw} from '../utils/tw';

// The insets are measured in the viewport, so the sides are physical. The
// offsets start at the host's padding box while the insets start at its border
// box, so a host that draws a border declares its width on that side, 0 by
// default, on its own `::after`: content inside the host never inherits it.
export const touchHitAreaLayerClassName = tw(
  '[@media(pointer:coarse)]:after:content-[""]',
  '[@media(pointer:coarse)]:after:absolute',
  '[@media(pointer:coarse)]:after:[inset:calc((var(--astryx-hit-inset-top,0px)_+_var(--_hit-border-top,0px))_*_-1)_calc((var(--astryx-hit-inset-right,0px)_+_var(--_hit-border-right,0px))_*_-1)_calc((var(--astryx-hit-inset-bottom,0px)_+_var(--_hit-border-bottom,0px))_*_-1)_calc((var(--astryx-hit-inset-left,0px)_+_var(--_hit-border-left,0px))_*_-1)]',
  // The outer rectangle, then the host's box as an even-odd hole.
  '[@media(pointer:coarse)]:after:[clip-path:polygon(evenodd,0_0,100%_0,100%_100%,0_100%,0_0,var(--astryx-hit-inset-left,0px)_var(--astryx-hit-inset-top,0px),calc(100%_-_var(--astryx-hit-inset-right,0px))_var(--astryx-hit-inset-top,0px),calc(100%_-_var(--astryx-hit-inset-right,0px))_calc(100%_-_var(--astryx-hit-inset-bottom,0px)),var(--astryx-hit-inset-left,0px)_calc(100%_-_var(--astryx-hit-inset-bottom,0px)),var(--astryx-hit-inset-left,0px)_var(--astryx-hit-inset-top,0px))]',
);

export const touchHitAreaLayerBelowChildrenClassName = tw(
  '[@media(pointer:coarse)]:before:content-[""]',
  '[@media(pointer:coarse)]:before:absolute',
  '[@media(pointer:coarse)]:before:[inset:calc((var(--astryx-hit-inset-top,0px)_+_var(--_hit-border-top,0px))_*_-1)_calc((var(--astryx-hit-inset-right,0px)_+_var(--_hit-border-right,0px))_*_-1)_calc((var(--astryx-hit-inset-bottom,0px)_+_var(--_hit-border-bottom,0px))_*_-1)_calc((var(--astryx-hit-inset-left,0px)_+_var(--_hit-border-left,0px))_*_-1)]',
  '[@media(pointer:coarse)]:before:[clip-path:polygon(evenodd,0_0,100%_0,100%_100%,0_100%,0_0,var(--astryx-hit-inset-left,0px)_var(--astryx-hit-inset-top,0px),calc(100%_-_var(--astryx-hit-inset-right,0px))_var(--astryx-hit-inset-top,0px),calc(100%_-_var(--astryx-hit-inset-right,0px))_calc(100%_-_var(--astryx-hit-inset-bottom,0px)),var(--astryx-hit-inset-left,0px)_calc(100%_-_var(--astryx-hit-inset-bottom,0px)),var(--astryx-hit-inset-left,0px)_var(--astryx-hit-inset-top,0px))]',
);
