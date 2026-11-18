// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file breadcrumbsClasses.ts
 * @input None
 * @output The literal Tailwind classes of the Breadcrumbs trail and of a
 *   breadcrumb item's overflow menu surface
 * @position Class map; Breadcrumbs.tsx joins these with the consumer's
 *   `className`
 *
 * The trail is a `<nav>` holding an `<ol>`: the frame is a block, the list is
 * a wrapping row of separators and items. Every arm is a literal string, so
 * the build's class scanner sees it.
 */

import {tw} from '../utils/tw';

/** The `<nav>` frame. */
export const breadcrumbsNavClassName = 'block';

/**
 * The `<ol>` row: items centre on one line and wrap when the trail is longer
 * than the container. `gap-1` is the spacing step's first value.
 */
export const breadcrumbsListClassName =
  'flex items-center flex-wrap list-none m-0 p-0 gap-1';

// The menu's own cap on the block axis, under the viewport one. The layer's
// gutter is flattened into the cap, and an engine that knows neither the
// dynamic viewport unit nor safe areas takes the `@supports` arm.
const MENU_BLOCK_CAP =
  '[max-block-size:min(300px,calc(100dvb_-_max(var(--spacing-4),env(safe-area-inset-top,0px))_-_var(--astryx-layer-inset-block-start,0px)_-_max(var(--spacing-4),env(safe-area-inset-bottom,0px))_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100dvb))]';
const MENU_BLOCK_CAP_FALLBACK =
  '[@supports_not_(block-size:100dvb)]:[max-block-size:min(300px,calc(100vh_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-start,0px)_-_var(--spacing-4)_-_var(--astryx-layer-inset-block-end,0px)),var(--_layer-keyboard-max-block-size,100vh))]';

/**
 * An item's overflow menu: the rows' column, the menu's radius and padding
 * handed to the rows it holds, and the block cap that keeps it inside the
 * layer. The layer paints the surface, so this box draws none.
 */
export const breadcrumbMenuClassName = tw(
  'box-border flex flex-col',
  'gap-[var(--spacing-0-5)]',
  MENU_BLOCK_CAP,
  MENU_BLOCK_CAP_FALLBACK,
  'overflow-y-auto',
  '[--_dropdown-menu-radius:var(--radius-container)]',
  '[--_dropdown-menu-padding:var(--spacing-1)]',
  'p-[var(--spacing-1)]',
  'rounded-[var(--_dropdown-menu-radius)]',
  'select-none',
);
