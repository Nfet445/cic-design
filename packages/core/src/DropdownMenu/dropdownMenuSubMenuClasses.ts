// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dropdownMenuSubMenuClasses.ts
 * @input The sub-menu row's size, open state and disabled state, and the shape
 *   of the flyout surface and of the drilled-in list
 * @output The class maps for `DropdownMenuSubMenu`'s trigger row, its flyout
 *   surface, the scroll gesture of its rows and its drill-in list
 * @position Style primitives; scanned by the Tailwind build. The component
 *   composes these with `tw`
 */

import {tw} from '../utils/tw';
import {dropdownMenuItemClassName} from './dropdownMenuClasses';

/**
 * The row that opens the sub-menu. It is a menu row with the extra paint of an
 * open branch, so the hover and press overlays it shares with every other row
 * stay on the shared rule; `dropdownMenuItemClassName` owns its geometry.
 */
export function dropdownMenuSubMenuTriggerClassName({
  isDisabled,
  size,
  isOpen,
}: {
  isDisabled: boolean;
  size: 'sm' | 'md' | 'lg';
  isOpen: boolean;
}): string {
  return tw(
    dropdownMenuItemClassName({isDestructive: false, isDisabled, size}),
    isOpen && 'bg-[var(--color-overlay-hover)]',
  );
}

// The layer's viewport gutter, flattened into the cap that reads it: each
// `env()`-less edge keeps a plain spacing fallback, and an engine that knows
// neither the dynamic viewport unit nor safe areas takes the `@supports` arm.
const FLYOUT_INLINE_CAP =
  '[max-inline-size:calc(100vi_-_max(var(--spacing-4),env(safe-area-inset-left,0px))_-_var(--astryx-layer-inset-inline-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-right,0px))_-_var(--astryx-layer-inset-inline-end,0px))]';
const FLYOUT_INLINE_CAP_FALLBACK =
  '[@supports_not_(inline-size:100vi)]:[max-inline-size:calc(100vw_-_var(--spacing-4)_-_var(--spacing-4)_-_var(--astryx-layer-inset-inline-start,0px)_-_var(--astryx-layer-inset-inline-end,0px))]';
// The flyout's own cap on the placement axis sits under the viewport one.
const FLYOUT_BLOCK_CAP =
  '[max-block-size:min(300px,calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]';
const FLYOUT_BLOCK_CAP_FALLBACK =
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(300px,calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]';

/**
 * The flyout surface: the rows' column, the menu's radius and padding handed
 * to the rows it holds, and the popover paint. Forced colors removes the
 * shadow, which is this surface's only edge, so a border takes over there.
 */
export const dropdownMenuSubMenuFlyoutClassName = tw(
  'box-border flex flex-col',
  'gap-[var(--spacing-0-5)]',
  FLYOUT_INLINE_CAP,
  FLYOUT_INLINE_CAP_FALLBACK,
  FLYOUT_BLOCK_CAP,
  FLYOUT_BLOCK_CAP_FALLBACK,
  '[--_dropdown-menu-radius:var(--radius-container)]',
  '[--_dropdown-menu-padding:var(--spacing-1)]',
  'p-[var(--spacing-1)]',
  'rounded-[var(--_dropdown-menu-radius)]',
  'bg-[var(--color-background-popover)]',
  'shadow-[var(--shadow-low)]',
  'border-0 border-none',
  'forced-colors:border forced-colors:border-solid forced-colors:[border-color:CanvasText]',
  'opacity-100',
  '[transition-property:opacity]',
  '[transition-duration:var(--duration-fast)]',
  '[transition-timing-function:var(--ease-standard)]',
  '[-webkit-touch-callout:none]',
  'select-none',
);

/** The rows' scroller when they overflow the flyout's cap. */
export const dropdownMenuSubMenuScrollClassName =
  'overflow-y-auto overflow-x-hidden';

/**
 * The gesture the rows keep under a finger: the highlight model reads the
 * pointer, so the browser must not claim the press for its own callout.
 */
export const dropdownMenuSubMenuTouchClassName = tw(
  '[touch-action:pan-y_pinch-zoom]',
  'overscroll-contain',
);

/** A list that fits its cap keeps pinch-zoom only. */
export const dropdownMenuSubMenuTouchPinchClassName =
  '[touch-action:pinch-zoom]';

/** The rows of a drilled-in list, which sit inside the root's surface. */
export const dropdownMenuSubMenuDrillInClassName = tw(
  // A view that waits for a deeper one is `hidden`; the attribute alone would
  // lose to the display this class sets, so the display waits for its absence.
  '[&:not([hidden])]:flex',
  'flex-col',
  'gap-[var(--spacing-0-5)]',
  'outline-none',
  '[-webkit-touch-callout:none]',
  'select-none',
);

// The flyout's minimum width when the caller states none: it prefers the
// content's own size, clamped by the runtime's inline cap.
const FLYOUT_MIN_WIDTH =
  '[min-width:min(160px,calc(100vi_-_max(var(--spacing-4),env(safe-area-inset-left,0px))_-_var(--astryx-layer-inset-inline-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-right,0px))_-_var(--astryx-layer-inset-inline-end,0px)))]';
const FLYOUT_MIN_WIDTH_FALLBACK =
  '[@supports_not_(inline-size:100vi)]:[min-width:min(160px,calc(100vw_-_var(--spacing-4)_-_var(--spacing-4)_-_var(--astryx-layer-inset-inline-start,0px)_-_var(--astryx-layer-inset-inline-end,0px)))]';

/** The layer box's minimum width with no explicit `menuWidth`. */
export const dropdownMenuSubMenuFlyoutMinWidthClassName = tw(
  FLYOUT_MIN_WIDTH,
  FLYOUT_MIN_WIDTH_FALLBACK,
);

/**
 * The layer box: the same block cap the flyout paints. Keeping the cap on the
 * menu surface above stops Chromium from choosing `flip-inline` for the
 * anchor-positioned box, which would shift the flyout back across its parent.
 */
export const dropdownMenuSubMenuFlyoutViewportClassName = tw(
  'box-border',
  FLYOUT_BLOCK_CAP,
  FLYOUT_BLOCK_CAP_FALLBACK,
);

/**
 * The frame a sub-menu with a header or footer renders in: the regions and the
 * menu in one column, the menu's radius and padding handed to its rows. The
 * block cap is its own class, because a drilled-in view caps where the root
 * menu does.
 */
export const dropdownMenuSubMenuRegionsFrameClassName = tw(
  'box-border flex flex-col',
  '[--_dropdown-menu-radius:var(--radius-container)]',
  '[--_dropdown-menu-padding:var(--spacing-1)]',
  'rounded-[var(--_dropdown-menu-radius)]',
);

/** The frame's own block cap: the flyout's, beside the root menu. */
export const dropdownMenuSubMenuRegionsFrameCapClassName = tw(
  FLYOUT_BLOCK_CAP,
  FLYOUT_BLOCK_CAP_FALLBACK,
);

/** The flyout's frame paints the surface; a drilled-in view sits inside the
 * root's. */
export const dropdownMenuSubMenuRegionsSurfaceClassName = tw(
  FLYOUT_INLINE_CAP,
  FLYOUT_INLINE_CAP_FALLBACK,
  'bg-[var(--color-background-popover)]',
  'shadow-[var(--shadow-low)]',
  'opacity-100',
  '[transition-property:opacity]',
  '[transition-duration:var(--duration-fast)]',
  '[transition-timing-function:var(--ease-standard)]',
);

/** The menu between the frame's regions: it takes the room and may shrink to
 * none, and it scrolls. */
export const dropdownMenuSubMenuFrameMenuClassName = tw(
  'box-border flex flex-col',
  'gap-[var(--spacing-0-5)]',
  'grow shrink',
  '[min-block-size:0]',
  'p-[var(--spacing-1)]',
  'outline-none',
  '[-webkit-touch-callout:none]',
  'select-none',
);
