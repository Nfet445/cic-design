// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sideNavItemClasses.ts
 * @input The theme's spacing, size, radius, duration and type-scale variables
 * @output The utility class strings a row, its label, its trailing slots, its
 *   children group and its popover carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The row appearance itself comes from `navItemStyles`, which SideNavItem
 * composes. These classes cover the wrapper around it and the parts of a row
 * that `navItemStyles` does not paint.
 */

import {tw} from '../utils/tw';

export const sideNavItemClassName = {
  /** The row plus its children group, stacked. */
  root: 'flex flex-col w-full',
  /** A collapsed rail row holds only its icon, centered. */
  collapsedItem: 'justify-center',
  label: tw(
    'flex-1 min-w-0',
    'overflow-hidden text-ellipsis whitespace-nowrap',
  ),
  endContent: 'shrink-0 flex items-center',
  // `pointer-events-auto`: a disabled row's `navItemStyles.disabled` turns
  // pointer events off on the wrapper, and each control in the slot owns its
  // own disabled state.
  actions: tw(
    'shrink-0 flex items-center',
    'gap-[var(--spacing-1)] pointer-events-auto',
  ),
  /** The group clips its rows only while the collapse animation runs. */
  childrenGroup: tw(
    'grid overflow-visible',
    '[transition-property:grid-template-rows,overflow]',
    '[transition-behavior:allow-discrete]',
    '[transition-duration:var(--duration-medium),0s]',
    '[transition-delay:0s,var(--duration-medium)]',
    '[transition-timing-function:var(--ease-standard)]',
    'motion-reduce:[transition-duration:0s,0s]',
    'motion-reduce:[transition-delay:0s,0s]',
  ),
  childrenGroupExpanded: '[grid-template-rows:1fr]',
  childrenGroupCollapsed: tw(
    '[grid-template-rows:0fr] overflow-hidden',
    '[transition-delay:0s,0s]',
  ),
  childrenInner: 'min-h-0',
  /** The chevron glyph's box, kept off Icon's own font-size. */
  chevron: tw(
    'inline-flex items-center justify-center shrink-0',
    'w-[var(--spacing-6)] h-[var(--spacing-6)]',
    '[font-size:inherit]',
    '[transition-property:transform]',
    '[transition-duration:var(--duration-fast)]',
    '[transition-timing-function:var(--ease-standard)]',
    'motion-reduce:[transition-duration:0s]',
  ),
  /** Inside a whole-row toggle the glyph sets no height of its own. */
  chevronInRow: 'h-auto',
  chevronExpanded: 'rotate-180',
  /** The standalone expand/collapse button, boxed like a `sm` icon button. */
  toggle: tw(
    'inline-flex items-center justify-center shrink-0',
    'w-[var(--size-element-sm)] h-[var(--size-element-sm)]',
    'p-0 m-0 border-0 bg-transparent text-inherit',
    'rounded-[var(--radius-element)]',
    'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
  ),
  /** The primary link or button inside a row that carries other controls. */
  splitAction: tw(
    'flex items-center self-stretch gap-[var(--spacing-2)] flex-1 min-w-0',
    'p-0 m-0 border-0 bg-transparent text-inherit no-underline text-start',
    '[font-family:inherit] [font-size:inherit] [font-weight:inherit] [line-height:inherit]',
    'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
  ),
  popoverSurface: tw(
    'rounded-[var(--radius-container)] min-w-[180px]',
    '[padding-block:var(--spacing-1)] [padding-inline:var(--spacing-1)]',
  ),
  /** The gap from the rail belongs on the layer, not on its content. */
  popoverGap: tw(
    '[margin-inline-start:var(--spacing-1)]',
    '[margin-inline-end:var(--spacing-1)]',
  ),
  popoverHeader: tw(
    '[padding-inline:var(--spacing-2)] [padding-block:var(--spacing-1)]',
    '[font-size:var(--text-supporting-size)]',
    '[font-weight:var(--font-weight-semibold)]',
    '[line-height:var(--text-supporting-leading)]',
    '[color:var(--color-text-secondary)]',
  ),
} as const;
