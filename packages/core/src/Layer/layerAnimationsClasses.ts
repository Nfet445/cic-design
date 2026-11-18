// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerAnimationsClasses.ts
 * @input The LayerPlacement a layer landed on, the private entrance variables
 *   the layer runtime writes, and the entrance keyframes the Tailwind sheet
 *   carries
 * @output Tailwind utility class strings for a layer's entry animation
 * @position Shared animation primitives; consumed by DropdownMenu, Popover,
 *   HoverCard, Tooltip, Selector, and any component using useLayer
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/layerEntranceSide.ts
 * - /packages/core/tailwind/astryx.input.css (the same keyframe names)
 *
 * Apply one class to the element that fills the layer (its surface), not to
 * the layer. Chromium lays an anchored layer out again on each frame that its
 * own style animates. An anchored layer's entrance slides from, and scales
 * about, the side the layer lands on after any flip (layerEntranceSide.ts).
 *
 * @example
 * ```
 * import {layerAnimations} from '../Layer/layerAnimations.stylex';
 *
 * // Direction-aware (for components that know placement):
 * layer.render(<div className={layerAnimations[placement]}>…</div>);
 *
 * // usePopover's surface takes the hook's `className`:
 * const popover = usePopover({className: layerAnimations.below});
 * ```
 */

import {tw} from '../utils/tw';
import type {LayerPlacement} from './useLayer';

// The runtime writes the side a shown anchored layer landed on: a step toward
// the trigger on each axis (-1, 0 or 1), the scale's origin, and the room to
// the trigger, which caps the step. Each keyframe fallback is the placement's
// own side, used when nothing is written.
//
// Reduce Motion splits by pointer. A coarse pointer fades in: a touch
// presentation substitutes a cross-fade for motion, never a jump. Any other
// pointer shows the layer at once. The two arms cannot both match, and the
// coarser one prints later in the sheet, so its fade follows the instant arm.
// The fade carries its own curve, so the published timing function stays the
// theme ease's.
// The arm names its keyframe through `--_astryx-layer-enter-animation`, and the
// reading direction only swaps that value. A direct RTL `animation-name` would
// print after the Reduce Motion arms and win over them, because the sheet sorts
// a direction variant after a media variant.
const ANIMATION_BASE = tw(
  '[animation-duration:var(--duration-fast-max)]',
  '[animation-timing-function:var(--ease-standard)]',
  '[animation-fill-mode:backwards]',
  '[animation-name:var(--_astryx-layer-enter-animation)]',
  '[transform-origin:var(--_astryx-layer-enter-origin,50%_50%)]',
  '[--_astryx-layer-enter-step:min(var(--spacing-2),var(--_astryx-layer-enter-gap,var(--spacing-2)))]',
  'motion-reduce:[animation-name:none]',
  'motion-reduce:pointer-coarse:[animation-name:astryxLayerFadeIn]',
  'motion-reduce:pointer-coarse:[animation-duration:200ms]',
);

/**
 * Shared entry animation classes for layer-based components, keyed by
 * LayerPlacement for easy lookup: `layerAnimations[placement]`.
 *
 * An inline-end or inline-start layer mirrors its horizontal fallback under
 * RTL, because that fallback is a physical translateX: the layer then slides
 * in from the physical side that follows the reading flow. The vertical
 * fallbacks are direction-neutral, and the side the runtime writes is physical
 * already.
 */
export const layerAnimations: Record<LayerPlacement, string> = {
  below: tw(
    ANIMATION_BASE,
    '[--_astryx-layer-enter-animation:astryxLayerEnterBelow]',
  ),
  above: tw(
    ANIMATION_BASE,
    '[--_astryx-layer-enter-animation:astryxLayerEnterAbove]',
  ),
  end: tw(
    ANIMATION_BASE,
    '[--_astryx-layer-enter-animation:astryxLayerEnterEnd]',
    'rtl:[--_astryx-layer-enter-animation:astryxLayerEnterEndRtl]',
  ),
  start: tw(
    ANIMATION_BASE,
    '[--_astryx-layer-enter-animation:astryxLayerEnterStart]',
    'rtl:[--_astryx-layer-enter-animation:astryxLayerEnterStartRtl]',
  ),
};
