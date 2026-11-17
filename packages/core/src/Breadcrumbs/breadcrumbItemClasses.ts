// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file breadcrumbItemClasses.ts
 * @input The breadcrumb variant and whether an item is the current page
 * @output Utility class strings for the item row, its separator, its
 *   link-styled content and its start icon
 * @position Style primitives; scanned by the Tailwind build
 *
 * The only hover here is the underline a pointer adds; it reads the enabled
 * guard every pressable surface in the system uses.
 */

import {tw} from '../utils/tw';

export type BreadcrumbVariant = 'default' | 'supporting';

const itemClassName = tw(
  'flex items-center gap-0.5 m-0',
  // The first crumb has no separator before it.
  '[--separator-display:flex] [&:first-child]:[--separator-display:none]',
);

const sizeClassName: Record<BreadcrumbVariant, string> = {
  default:
    '[font-size:var(--text-body-size)] [line-height:var(--text-body-leading)]',
  supporting:
    '[font-size:var(--text-supporting-size)] [line-height:var(--text-supporting-leading)]',
};

const contentClassName = 'flex items-center gap-0.5';

const linkClassName = tw(
  'flex items-center gap-0.5 py-0.5 no-underline',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:underline',
);

/** An onClick-only crumb is a button that looks like the links beside it. */
const buttonResetClassName =
  'bg-transparent border-none px-0 m-0 [font:inherit]';

const linkColorClassName = 'text-[color:var(--color-text-secondary)]';

const currentClassName = tw(
  contentClassName,
  '[font-weight:var(--font-weight-semibold)]',
);

const currentColorClassName: Record<BreadcrumbVariant, string> = {
  default: 'text-[color:var(--color-text-primary)]',
  supporting: 'text-[color:var(--color-text-secondary)]',
};

const startIconClassName = 'flex items-center shrink-0';

/** The crumb separator, sized off the supporting text step. */
const separatorClassName = tw(
  'flex items-center py-0.5 select-none',
  'text-[color:var(--color-text-secondary)]',
  '[display:var(--separator-display)]',
);

/** The chevron that marks a crumb as opening a menu. */
const chevronClassName = tw(
  'flex items-center shrink-0',
  // The box tracks the supporting step, so a theme that retunes it keeps the
  // box and the glyph together.
  'size-[var(--text-supporting-size)] [font-size:var(--text-supporting-size)]',
);

export {
  buttonResetClassName as breadcrumbButtonResetClassName,
  chevronClassName as breadcrumbChevronClassName,
  contentClassName as breadcrumbContentClassName,
  currentClassName as breadcrumbCurrentClassName,
  currentColorClassName as breadcrumbCurrentColorClassName,
  itemClassName as breadcrumbItemClassName,
  linkClassName as breadcrumbLinkClassName,
  linkColorClassName as breadcrumbLinkColorClassName,
  separatorClassName as breadcrumbSeparatorClassName,
  sizeClassName as breadcrumbSizeClassName,
  startIconClassName as breadcrumbStartIconClassName,
};
