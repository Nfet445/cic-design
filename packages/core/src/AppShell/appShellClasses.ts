// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file appShellClasses.ts
 * @input The shell's variant (wash, surface, section, elevated) and height
 *   mode (fill, auto)
 * @output The class strings for the shell root, the header and phone top bar,
 *   the sticky side-nav wrapper, the elevated content frame and the skip link's
 *   hidden-by-default box
 * @position Style primitives; scanned by the Tailwind build. The component
 *   composes them with `tw`
 *
 * Every class here lands on a plain element the shell owns. The area fills
 * (`navAreaWash`, `contentBgSurface`, …) and the main focus-target keys stay
 * StyleX in `AppShell.tsx`: they travel through `LayoutPanel`'s and
 * `LayoutContent`'s `xstyle` prop, which takes StyleX styles only.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {AppShellVariant} from './AppShell';

type AppShellHeight = 'fill' | 'auto';
import {tw} from '../utils/tw';

const VARIANT_CLASS: Record<AppShellVariant, string> = {
  wash: 'bg-[var(--color-background-body)]',
  surface: 'bg-[var(--color-background-surface)]',
  section: 'bg-[var(--color-background-surface)]',
  elevated: 'bg-[var(--color-background-body)]',
};

/**
 * The shell's page fill. It draws on the same element as `layoutReset`, which
 * writes only custom properties, so nothing there competes with it.
 */
export function appShellVariantClassName({
  variant,
}: {
  variant: AppShellVariant;
}): string {
  return VARIANT_CLASS[variant];
}

const HEIGHT_CLASS: Record<AppShellHeight, string> = {
  fill: '[height:100dvh]',
  auto: '[min-height:100dvh]',
};

export function appShellHeightClassName({
  height,
}: {
  height: AppShellHeight;
}): string {
  return HEIGHT_CLASS[height];
}

/** The shell root: a column that never scrolls the page itself. */
export const APP_SHELL_ROOT_CLASS = tw(
  'flex',
  'flex-col',
  'relative',
  'overflow-clip',
);

/** No box of its own, so main's frame and the rail stay siblings in the flow. */
export const APP_SHELL_CONTENT_WRAPPER_CLASS = 'contents';

/** The elevated frame: a positioned flex column that main fills. */
export const APP_SHELL_ELEVATED_CONTENT_WRAPPER_CLASS = tw(
  'relative',
  'flex',
  'flex-1',
  'min-h-0',
  'h-full',
);

/**
 * The elevated surface behind main while it glides. It does not catch presses,
 * so the page keeps the pointer it had.
 */
export const APP_SHELL_ELEVATED_BACKDROP_CLASS = tw(
  'absolute',
  'inset-0',
  'bg-[var(--color-background-surface)]',
  'rounded-ss-[var(--radius-page)]',
  'pointer-events-none',
);

/** The banner slot takes its height from its content, never from the shell. */
export const APP_SHELL_BANNER_CLASS = 'shrink-0';

/** The phone top bar, shown when the shell has a side nav and no top nav. */
export const APP_SHELL_AUTO_MOBILE_TOP_BAR_CLASS = tw(
  'flex',
  'items-center',
  'h-[var(--spacing-12)]',
  'px-[var(--spacing-4)]',
);

/**
 * A sticky header for auto height mode keeps its local stacking level:
 * Field-owned input surfaces contain their own layers, so the header needs no
 * escalated page-level z-index to paint above scrolled content.
 */
export const APP_SHELL_HEADER_STICKY_CLASS = tw('sticky', 'top-0', 'z-[1]');

/**
 * The insets are zero unless the page sets `viewport-fit=cover`. The header
 * background then goes under the status bar.
 */
export const APP_SHELL_HEADER_SAFE_AREA_TOP_CLASS =
  'pt-[env(safe-area-inset-top,0px)]';

/**
 * The insets are physical sides, so a right-to-left context swaps them on the
 * inline sides.
 */
export const APP_SHELL_HEADER_SAFE_AREA_SIDES_CLASS = tw(
  'ps-[env(safe-area-inset-left,0px)]',
  'pe-[env(safe-area-inset-right,0px)]',
  'rtl:ps-[env(safe-area-inset-right,0px)]',
  'rtl:pe-[env(safe-area-inset-left,0px)]',
);

/**
 * In `auto`, the banner's wrapper and the phone top bar both stick. Below a
 * banner, the bar sticks under the top inset, so its items stay clear of the
 * status bar.
 */
export const APP_SHELL_HEADER_STICKY_BELOW_TOP_INSET_CLASS =
  'top-[env(safe-area-inset-top,0px)]';

/**
 * The sticky side-nav wrapper replaces the panel as the direct flex child of
 * the middle container, so it repeats the flex properties `LayoutPanel` would
 * state: it must not collapse, and it clips horizontally as the panel does.
 */
export const APP_SHELL_SIDE_NAV_STICKY_CLASS = tw(
  'shrink-0',
  'overflow-clip',
  'sticky',
  'top-[var(--_app-shell-header-height,0px)]',
  '[height:calc(100dvh_-_var(--_app-shell-header-height,0px))]',
  'flex',
  'flex-col',
);
