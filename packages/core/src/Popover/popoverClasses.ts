// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file popoverClasses.ts
 * @input Whether the measured content overflows, and the layer runtime's
 *   viewport fit, which the runtime writes into the surface's size variables
 * @output Utility class strings for the anchor wrapper, the painted surface and
 *   its viewport fit, the content wrapper, the hidden fallback close wrappers
 *   and the layer's own sizing
 * @position Popover style primitives; scanned by the Tailwind build
 *
 * A size arrives as a custom property on the element the class styles
 * (`--astryx-popover-*`), because the caps derive from `layerViewportInset`'s
 * constants and a class literal cannot import one. A class reads the property,
 * so no declaration lands inline.
 */

import {tw} from '../utils/tw';

/** The largest inline size the painted surface may take. */
export const popoverMaxInlineSizeVar = '--astryx-popover-max-inline-size';
/** The largest block size the painted surface may take. */
export const popoverMaxBlockSizeVar = '--astryx-popover-max-block-size';
/** An explicit surface width. */
export const popoverWidthVar = '--astryx-popover-width';

/**
 * The trigger's stable anchor box: `inline-flex` generates a box for CSS anchor
 * positioning without affecting layout, so a pressed-state transform on the
 * trigger inside it never shifts the anchor.
 */
export const popoverAnchorWrapperClassName = 'inline-flex';

// Forced colors removes box-shadow, which is this surface's only edge. It is a
// border, not an outline: the focus ring owns the outline longhands.
const SURFACE = tw(
  'bg-[var(--color-background-popover)]',
  '[--_popover-radius:var(--radius-container)]',
  'rounded-[var(--_popover-radius)]',
  'shadow-[var(--shadow-low)]',
  'forced-colors:border',
  'forced-colors:[border-color:CanvasText]',
);

/** The painted popover surface: background, radius, shadow and edge. */
export const popoverSurfaceClassName = SURFACE;

/** The focus-trap container: the surface's own paint, positioned for its children. */
export const popoverContentWrapperClassName = 'relative';

// The painted surface is capped with the layer runtime's one definition: the
// layer box above it caps the block axis itself and leaves the inline axis to
// the surface, so a flip is still chosen when the surface does not fit beside
// the trigger.
const VIEWPORT_FIT = tw(
  'box-border',
  '[max-inline-size:min(var(--astryx-popover-max-inline-size),100%)]',
  '[max-block-size:var(--astryx-popover-max-block-size)]',
);

// The runtime hands the layer its keyboard state through this property; a
// scroll container starts at the commit that caps the layer, a frame before the
// overflow measure sees the shorter box.
const KEYBOARD_OVERFLOW = '[overflow:var(--_layer-keyboard-overflow,visible)]';

const SCROLLABLE = tw('overflow-auto', '[overscroll-behavior:contain]');

/**
 * The surface's viewport fit, plus its overflow: `auto` with contained
 * overscroll once the content does not fit, otherwise the runtime's keyboard
 * state.
 *
 * One class per state, never a base plus an override: both would sit in one
 * `@layer astryx-base`, where sheet order and not the class attribute decides
 * the winner.
 */
export function popoverViewportFitClassName({
  isScrollable,
}: {
  isScrollable: boolean;
}): string {
  return tw(VIEWPORT_FIT, isScrollable ? SCROLLABLE : KEYBOARD_OVERFLOW);
}

// An explicit width renders at its size up to the viewport cap, never shrunk to
// the room beside the trigger. Keywords cannot sit inside min(); the surface's
// own cap bounds them.
export const popoverExplicitWidthClassName =
  '[width:var(--astryx-popover-width)]';

// Without a width the surface prefers the trigger's minimum width, clamped by
// the runtime's cap because a CSS minimum beats a maximum. One arm replaces the
// `firstThatWorks` chain: an engine without anchor positioning parses this arm
// and its successors to nothing alike, leaving `min-width: auto`.
export const popoverMatchTriggerClassName =
  '[min-width:min(anchor-size(width),var(--astryx-popover-max-inline-size))]';

/**
 * The fallback close button's wrapper: sr-only until it is focused, then set
 * below the content with room for its focus ring.
 */
export const popoverCloseButtonWrapperClassName = tw(
  'absolute',
  'bottom-0',
  'z-[1]',
  'h-px',
  'w-px',
  'overflow-hidden',
  '[clip-path:inset(50%)]',
  'pointer-events-none',
  '[padding-block-start:0]',
  'focus-within:h-auto',
  'focus-within:w-auto',
  'focus-within:overflow-visible',
  'focus-within:[clip-path:none]',
  'focus-within:pointer-events-auto',
  'focus-within:[padding-block-start:var(--spacing-3)]',
);

/**
 * The sheet's fallback close control, on the Button itself rather than a
 * wrapper: taken out of flow and clipped at rest, it rejoins the flow when
 * focused.
 */
export const popoverSheetFallbackCloseClassName = tw(
  'absolute',
  '[clip-path:inset(50%)]',
  '[margin-block-start:0]',
  'focus:relative',
  'focus:flex',
  'focus:w-fit',
  'focus:[clip-path:none]',
  'focus:[margin-block-start:var(--spacing-3)]',
);
