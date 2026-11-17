// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file menuTouchAction.stylex.ts
 * @input Nothing; styles only
 * @output Exports menuTouchActionStyles: a menu's touch-action, by whether it
 *   scrolls
 * @position Shared by every menu that tracks a held pointer through
 *   useMenuPress (DropdownMenu and the nav, breadcrumb and tab menus)
 *
 * Scroll ownership by the browser's own signal. A menu whose rows fit keeps
 * every one-finger move, so a slide over its rows stays a slide. One that
 * scrolls lets the browser pan it vertically and cancel the press when it
 * does. Both leave a two-finger pinch to the browser, so the page stays
 * zoomable over an open menu; `pinch-zoom` admits no one-finger pan.
 *
 * Stays in StyleX, and the reason is ownership, not layering: the two values
 * face no unlayered rule, so the class form works. Each caller passes the pair
 * to `stylex.props()` beside its own state styles, and seven of the eight
 * callers are other components (`SideNav`, `TopNav`, `TabList`, `Breadcrumbs`,
 * `NavMenu`). Converting this module rewrites those components too, so it
 * belongs to one commit that owns all of them. The class strings already exist
 * in `dropdownMenuSubMenuClasses.ts` (`[touch-action:pinch-zoom]`,
 * `[touch-action:pan-y_pinch-zoom]` and `overscroll-contain`).
 */

import * as stylex from '@stylexjs/stylex';

/** The touch-action of an open menu, by whether its rows overflow. */
export const menuTouchActionStyles = stylex.create({
  fits: {
    touchAction: 'pinch-zoom',
  },
  scrolls: {
    touchAction: 'pan-y pinch-zoom',
    overscrollBehavior: 'contain',
  },
});
