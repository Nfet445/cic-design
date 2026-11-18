// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sideNavItemClasses.ts
 * @input The theme's spacing, size, radius, duration and type-scale variables,
 *   and the row's size and nesting depth
 * @output The utility class strings a row, its collapsed square, its nesting
 *   indent, its label, its trailing slots, its children group and its popover
 *   carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The row appearance itself comes from `navItemClasses`, which SideNavItem
 * composes. These classes cover the wrapper around it, the parts of a row that
 * the shared row does not paint, and the two boxes that replace a declaration
 * it does: the collapsed square and the nesting indent. Both repeat the
 * element's `class` attribute, so each outranks the shared row by specificity
 * rather than by the sheet's order — and the indent repeats it twice, because
 * it also has to outrank the size arm's `padding-inline`.
 *
 * The indent's depth is unbounded, so it travels as an inline
 * `--astryx-side-nav-indent` count the class reads, never in a class name.
 */

import {tw} from '../utils/tw';
import type {NavItemSize} from '../NavItem/navItemClasses';

/** The custom property a nested row's depth travels in; the classes read it. */
export const SIDE_NAV_INDENT_VAR = '--astryx-side-nav-indent';

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
  // `pointer-events-auto`: a disabled row's `navItemDisabledClassName` turns
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

/**
 * The collapsed rail row: a square of the item's own size, with no inline
 * padding, because it holds only its icon.
 *
 * It carries `min-height` too, and the collapsed path does not compose the
 * size arm: the two tie on specificity, so one string states the whole box.
 */
const COLLAPSED_SQUARE_CLASS: Record<NavItemSize, string> = {
  sm: '[&[class]]:w-[var(--size-element-sm)] [&[class]]:h-[var(--size-element-sm)] [&[class]]:min-h-[var(--size-element-sm)] [&[class]]:px-0',
  md: '[&[class]]:w-[var(--size-element-md)] [&[class]]:h-[var(--size-element-md)] [&[class]]:min-h-[var(--size-element-md)] [&[class]]:px-0',
  lg: '[&[class]]:w-[var(--size-element-lg)] [&[class]]:h-[var(--size-element-lg)] [&[class]]:min-h-[var(--size-element-lg)] [&[class]]:px-0',
};

export function sideNavItemCollapsedSquareClassName(size: NavItemSize): string {
  return COLLAPSED_SQUARE_CLASS[size];
}

/**
 * The nesting indent on the row element itself, where the row is the link or
 * the button: the row's own inline-start padding plus one step per level.
 *
 * SYNC: the base padding matches `navItemSizeClassName`'s `sm` and `md`; the
 * `lg` row uses the `md` padding, as the shared row does.
 */
const INDENT_CLASS: Record<NavItemSize, string> = {
  sm: '[&[class][class]]:[padding-inline-start:calc(var(--spacing-1)+var(--astryx-side-nav-indent)*var(--spacing-6))]',
  md: '[&[class][class]]:[padding-inline-start:calc(var(--spacing-2)+var(--astryx-side-nav-indent)*var(--spacing-6))]',
  lg: '[&[class][class]]:[padding-inline-start:calc(var(--spacing-2)+var(--astryx-side-nav-indent)*var(--spacing-6))]',
};

/**
 * The split row's indent: the steps alone, on the primary link or button. The
 * row wrapper keeps its own base padding, so the whole indent is part of the
 * click target rather than dead space that still shows feedback.
 */
const PRIMARY_INDENT_CLASS =
  '[&[class]]:[padding-inline-start:calc(var(--astryx-side-nav-indent)*var(--spacing-6))]';

export function sideNavItemIndentClassName(size: NavItemSize): string {
  return INDENT_CLASS[size];
}

export function sideNavItemPrimaryIndentClassName(): string {
  return PRIMARY_INDENT_CLASS;
}
