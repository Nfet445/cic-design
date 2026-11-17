// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file citationClasses.ts
 * @input Citation's variant, its icon slot and whether it links out
 * @output Utility class strings for the label pill, the number badge, its icon
 *   circle and its text run
 * @position Style primitives; scanned by the Tailwind build
 *
 * A linked citation tints its own background and text on hover; both read the
 * token the resting state reads, so one theme value drives each pair.
 */

import {tw} from '../utils/tw';

/** The enabled guard every hover variant carries. */
const ENABLED = ':not(:disabled,[aria-disabled=true])';

const labelClassName = tw(
  'inline-flex items-center gap-1 align-baseline h-5 max-w-[15em] overflow-hidden',
  '[font-size:var(--text-supporting-size)] [font-weight:var(--text-supporting-weight)] [line-height:var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'rounded-[var(--radius-element)] border border-solid border-[color:var(--color-border)] [border-width:var(--border-width)]',
  'px-2 ms-0.5 no-underline',
  'transition-[background-color,border-color,color] duration-[var(--duration-fast-max)] ease-[var(--ease-standard)]',
);

const numberClassName = tw(
  'inline-flex items-center justify-center align-super',
  '[font-size:var(--text-supporting-size)] [font-weight:var(--font-weight-semibold)] [line-height:var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)] bg-[var(--color-accent-muted)]',
  'rounded-full min-w-5 h-5 px-1 no-underline',
  'transition-[background-color] duration-[var(--duration-fast-max)] ease-[var(--ease-standard)]',
);

const linkCursorClassName = tw(
  'cursor-pointer',
  `[&:is(:disabled,[aria-disabled=true])]:cursor-default`,
);

/** The hover tint, over the same tokens the resting state reads. */
const labelLinkClassName = tw(
  linkCursorClassName,
  `[@media(hover:hover)]:[&:hover:where(${ENABLED})]:bg-[var(--color-overlay-hover)]`,
  `[@media(hover:hover)]:[&:hover:where(${ENABLED})]:text-[color:var(--color-text-primary)]`,
);

const numberLinkClassName = tw(
  linkCursorClassName,
  `[@media(hover:hover)]:[&:hover:where(${ENABLED})]:bg-[var(--color-overlay-hover)]`,
);

/** A source icon narrows the pill's leading padding. */
const labelWithIconClassName = 'ps-0.5';

/** The label's text run, cut at the pill's edge. */
const labelTextClassName =
  'overflow-hidden text-ellipsis whitespace-nowrap min-w-0';

const iconWrapClassName = tw(
  'inline-flex items-center justify-center shrink-0 overflow-hidden',
  'size-4 rounded-full',
  'bg-[var(--color-background-surface)] border border-solid border-[color:var(--color-border)] [border-width:var(--border-width)]',
);

const iconClassName = 'size-3';

export interface CitationClassNameOptions {
  variant: 'label' | 'number';
  hasIcon: boolean;
  isLink: boolean;
}

/** The pill or badge the citation paints, without its inner slots. */
export function citationClassName({
  variant,
  hasIcon,
  isLink,
}: CitationClassNameOptions): string {
  if (variant === 'number') {
    return tw(numberClassName, isLink && numberLinkClassName);
  }
  return tw(
    labelClassName,
    hasIcon && labelWithIconClassName,
    isLink && labelLinkClassName,
  );
}

export {
  iconClassName as citationIconClassName,
  iconWrapClassName as citationIconWrapClassName,
  labelTextClassName as citationLabelTextClassName,
};
