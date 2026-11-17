// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sideNavClasses.ts
 * @input None
 * @output The class names SideNav's zones carry
 * @position Style layer of SideNav; read by SideNav.tsx, its tests and the
 *   package stylesheet test
 *
 * Every class is a literal so the stylesheet build can scan it. A zone that
 * answers a state adds the state's class beside its own, never a computed
 * name.
 */

import {tw} from '../utils/tw';

export const sideNavClassName = {
  /** The rail: a column that owns its own height and never scrolls. */
  root: tw(
    'flex flex-col',
    'w-[260px] h-full',
    'bg-inherit box-border overflow-hidden',
  ),
  rootCollapsed: 'w-[var(--spacing-12)]',
  /** Header and topContent, pinned above the scrolling children. */
  stickyTop: tw(
    'flex flex-col shrink-0 sticky top-0 z-[1] bg-inherit',
    '[padding-block:var(--spacing-2)] [padding-inline:var(--spacing-2)]',
    'gap-[var(--spacing-2)]',
  ),
  stickyTopCollapsed: 'items-center',
  /** The scrolling children zone. */
  scrollable: tw(
    'flex-1',
    'overflow-y-auto overflow-x-hidden',
    '[padding-inline:var(--spacing-2)]',
  ),
  scrollableCollapsed: 'flex flex-col items-center',
  scrollableNoTop: '[padding-block-start:var(--spacing-2)]',
  scrollableWithTop: '[padding-block-start:var(--spacing-1)]',
  scrollableNoBottom: '[padding-block-end:var(--spacing-2)]',
  scrollableWithBottom: '[padding-block-end:var(--spacing-1)]',
  /** Footer and footerIcons, pinned below the scrolling children. */
  stickyBottom: tw(
    'flex flex-col shrink-0 mt-auto sticky bottom-0 bg-inherit',
    'gap-[var(--spacing-2)] [padding-inline:var(--spacing-2)]',
    '[padding-block-start:var(--spacing-1)]',
    '[padding-block-end:var(--spacing-2)]',
  ),
  stickyBottomCollapsed: '[padding-block-start:0] items-center',
  /** The collapse button and the footer icons, side by side on one row. */
  footerRow: 'flex items-center gap-[var(--spacing-1)]',
  footerRowCollapsed: 'flex-col-reverse',
  footerIcons: 'flex items-center gap-[var(--spacing-1)]',
  footerIconsCollapsed: 'flex flex-col items-center',
  /** The mobile drawer's footer, pushed to the end of its content. */
  drawerFooter: tw(
    'flex flex-col mt-auto',
    'gap-[var(--spacing-2)] [padding-block-start:var(--spacing-2)]',
  ),
  drawerFooterIcons: 'flex items-center gap-[var(--spacing-1)]',
  /** The rail and its drag handle, clipped as one box. */
  resizableContainer: 'relative flex shrink-0 h-full overflow-clip',
  /** The mobile top bar, where the rail turns horizontal. */
  topbar: tw(
    'flex flex-row items-center justify-between',
    'h-[48px] w-full',
    'bg-inherit box-border overflow-hidden',
  ),
  topbarIcons: 'flex items-center gap-[var(--spacing-1)] ms-auto',
} as const;
