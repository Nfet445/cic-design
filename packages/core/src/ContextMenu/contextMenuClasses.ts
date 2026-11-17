// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contextMenuClasses.ts
 * @input The menu's presentation (cursor popover or touch sheet) and whether
 *   its rows overflow
 * @output The class maps for `ContextMenu`'s trigger wrapper, its cursor
 *   anchor, its popover surface and its sheet frame
 * @position Style primitives; scanned by the Tailwind build. The component
 *   composes these with `tw`
 */

import {tw} from '../utils/tw';

/** The popover's per-instance minimum width, written as an inline variable. */
export const contextMenuWidthVar = '--astryx-context-menu-min-inline-size';

/**
 * The trigger wrapper: the containing block for the cursor anchor, and no
 * browser held-press callout or text selection, so a long press opens this
 * menu instead of the native one.
 */
export const contextMenuTriggerClassName = tw(
  'relative',
  '[-webkit-touch-callout:none]',
  'select-none',
);

/**
 * The 1px anchor at the cursor point. It owns a box because WebKit counts an
 * empty anchor box as clipped, and the default `position-visibility:
 * anchors-visible` then hides the menu. Its offsets are runtime geometry and
 * stay inline.
 */
export const contextMenuCursorAnchorClassName = tw(
  'absolute',
  '[width:1px]',
  '[height:1px]',
  'pointer-events-none',
);

// The menu's own cap on the placement axis, under the viewport one. An engine
// that knows neither the dynamic viewport unit nor safe areas takes the
// `@supports` arm.
const MENU_BLOCK_CAP =
  '[max-block-size:min(300px,calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]';
const MENU_BLOCK_CAP_FALLBACK =
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(300px,calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]';

/**
 * The cursor popover's surface. Forced colors removes the shadow, which is
 * this surface's only edge, so a border takes over there.
 */
export const contextMenuPopoverClassName = tw(
  'box-border flex flex-col',
  'gap-[var(--spacing-0-5)]',
  MENU_BLOCK_CAP,
  MENU_BLOCK_CAP_FALLBACK,
  'overflow-y-auto',
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

/**
 * The popover's minimum width: the default, or the caller's `menuWidth` through
 * the inline variable. It sits on the layer container, which also carries the
 * anchor placement.
 */
export const contextMenuPopoverWidthClassName =
  'min-w-[var(--astryx-context-menu-min-inline-size,160px)]';

/** The gesture the rows keep under a finger: a two-finger pinch stays. */
export const contextMenuTouchPinchClassName = '[touch-action:pinch-zoom]';

/** A scrolling menu lets the browser pan it vertically and cancel the press. */
export const contextMenuTouchPanClassName = tw(
  '[touch-action:pan-y_pinch-zoom]',
  'overscroll-contain',
);

/** The menu's surface inside the sheet: the sheet paints the frame. */
export const contextMenuSheetMenuClassName = tw(
  'box-border flex flex-col',
  'gap-[var(--spacing-0-5)]',
  'w-full',
  '[--_dropdown-menu-radius:var(--radius-container)]',
  '[--_dropdown-menu-padding:var(--spacing-1)]',
  'p-[var(--spacing-1)]',
  'rounded-[var(--_dropdown-menu-radius)]',
  'bg-[var(--color-background-surface)]',
  'outline-none',
  'select-none',
);

/**
 * The menu's own inset inside the sheet content box: the 4px at the sides the
 * content box keeps plus the menu's 4px padding, and above the first row the
 * menu's 4px below the band the sheet keeps under its grab bar. Bleeding rows
 * read the padding this element applies.
 */
export const contextMenuSheetInsetClassName = tw(
  '[padding-block:var(--spacing-1)]',
  '[padding-inline:calc(var(--spacing-1)_+_var(--spacing-1))]',
  '[--container-padding-block-start:var(--spacing-1)]',
  '[--container-padding-block-end:var(--spacing-1)]',
  '[--container-padding-inline-start:calc(var(--spacing-1)_+_var(--spacing-1))]',
  '[--container-padding-inline-end:calc(var(--spacing-1)_+_var(--spacing-1))]',
);
