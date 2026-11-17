// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file outlineClasses.ts
 * @input The row's density, a heading level and whether the row is active
 * @output Tailwind utility class names for the root, the track, the sliding
 *   indicator, the list and one complete class string per link state
 * @position Internal to Outline.
 *
 * The link's colour, weight, block padding, end padding and start indent
 * paint the same declarations as its active arm, so `outlineLinkClassName`
 * returns one complete string per state instead of two classes that race in
 * the sheet. The start indent reads the level; the indicator anchors to the
 * active link's `anchor-name`.
 */

import {tw} from '../utils/tw';

export const outlineRootClassName = tw(
  'relative flex w-full flex-row gap-[var(--spacing-0-5)]',
);

export const outlineTrackClassName =
  'relative order-[-1] w-[2px] shrink-0 [inset-block:0]';

export const outlineDividerClassName = tw(
  'pointer-events-none absolute inset-y-0 start-0 w-[2px]',
  'rounded-[var(--radius-full)] bg-[var(--color-border)]',
);

export const outlineIndicatorClassName = tw(
  'pointer-events-none absolute start-0 z-[1] w-[2px]',
  'rounded-[var(--radius-full)] bg-[var(--color-icon-primary)]',
  '[position-anchor:--outline-active]',
  '[top:anchor(--outline-active_top,0px)]',
  '[height:anchor-size(--outline-active_height,0px)]',
  'transition-[top,height] duration-[var(--duration-fast-min)] ease-[var(--ease-standard)]',
);

export const outlineActiveAnchorClassName = '[anchor-name:--outline-active]';

export const outlineListClassName = tw(
  'm-0 flex min-w-0 flex-1 list-none flex-col p-0',
  'gap-[var(--spacing-0-5)]',
);

export const outlineItemClassName = 'm-0 list-none p-0';

export const outlineLabelClassName =
  'overflow-hidden text-ellipsis whitespace-nowrap';

const outlineDensityClassName = {
  compact: 'py-[var(--spacing-1)] pe-[var(--spacing-2)]',
  default: 'py-[var(--spacing-2)] pe-[var(--spacing-2)]',
} as const;

const outlineIndentClassName = [
  'ps-[var(--spacing-3)]',
  'ps-[var(--spacing-7)]',
  'ps-[var(--spacing-11)]',
  'ps-[var(--spacing-12)]',
] as const;

/** One complete class string for the link's own state and depth. */
export function outlineLinkClassName(
  density: keyof typeof outlineDensityClassName,
  level: number,
  isActive: boolean,
): string {
  // Map heading levels 1-6 to visual indent levels 1-4: h1 and h2 share the
  // first indent, and deeper headings stop at the fourth.
  const indentLevel = Math.max(1, Math.min(4, level - 1 || 1));
  return tw(
    'relative box-border inline-flex w-full items-center text-start no-underline',
    'rounded-[var(--radius-element)]',
    'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
    'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
    'transition-[background-color,color]',
    'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:text-[color:var(--color-text-primary)]',
    isActive
      ? 'font-[var(--font-weight-semibold)] text-[color:var(--color-text-primary)]'
      : 'font-[var(--font-weight-normal)] text-[color:var(--color-text-secondary)]',
    isActive && outlineActiveAnchorClassName,
    outlineDensityClassName[density],
    outlineIndentClassName[indentLevel - 1],
  );
}
