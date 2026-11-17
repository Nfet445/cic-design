// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file bannerClasses.ts
 * @input Accepts the banner's status, container, elevation and the layout arms
 *   Banner resolves from its content
 * @output Tailwind utility class names for the banner frame, its header, the
 *   end area and the content area
 * @position Internal to Banner.
 *
 * The status fill and its forced-colors outline live in one class per status,
 * so a status paints its background and its boundary together. The built-in
 * controls carry a second class that only rewrites `--color-text-primary`, so
 * the Button reads the on-muted foreground while its sibling tooltip keeps the
 * ordinary text color.
 */

import {tw} from '../utils/tw';
import type {Elevation} from '../utils/types';
import type {BannerStatus} from './Banner';

/** The frame: a column, with the elevation painted over the whole banner. */
export const bannerClassName = 'flex flex-col [font-family:inherit]';

/** An elevated card banner rounds the frame so the shadow follows it. */
export const bannerElevatedCardClassName =
  'rounded-[var(--_banner-radius,var(--radius-container))]';

/** The status header: icon, text column and end area on one wrapping row. */
export const bannerHeaderClassName = tw(
  'flex items-start flex-wrap',
  'gap-x-[var(--spacing-2)] gap-y-[var(--spacing-3)]',
  'py-[var(--spacing-3)] px-[var(--spacing-4)]',
);

/** Centered when a title stands alone beside the actions. */
export const bannerHeaderCenteredClassName = 'items-center';

export const bannerHeaderCardStandaloneClassName =
  'rounded-[var(--_banner-radius,var(--radius-container))]';

/** A header that sits above content keeps its top corners only. */
export const bannerHeaderCardWithContentClassName =
  'rounded-t-[var(--_banner-radius,var(--radius-container))] rounded-b-none';

export const bannerHeaderContentClassName =
  'flex flex-col gap-0 flex-1 min-w-0';

/**
 * The wrap threshold: the end area moves to its own row once the text column
 * cannot hold this basis, in rem so it tracks the user's font size.
 */
export const bannerHeaderContentWithEndContentClassName = 'basis-[8rem]';

export const bannerTitleClassName = tw(
  'm-0',
  'text-[length:var(--text-label-size)] leading-[var(--text-label-leading)]',
  '[font-weight:var(--font-weight-semibold)] text-[color:var(--color-text-primary)]',
  // A single unbroken token would otherwise set the flex item's min-content
  // width and push the page into horizontal scrolling at 320px.
  '[overflow-wrap:anywhere] [--_astryx-text-overflow-wrap:anywhere]',
);

export const bannerDescriptionClassName = tw(
  'm-0',
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  '[font-weight:var(--font-weight-normal)] text-[color:var(--color-text-secondary)]',
  '[overflow-wrap:anywhere] [--_astryx-text-overflow-wrap:anywhere]',
);

/** Built-in text and icons take the header's on-muted foreground. */
export const bannerStatusForegroundClassName = 'text-[color:inherit]';

export const bannerIconWrapperClassName = 'flex items-center shrink-0';

export const bannerEndAreaClassName = tw(
  'flex items-center flex-wrap justify-end',
  'gap-[var(--spacing-2)] shrink-0 max-w-full ms-auto',
  'text-[color:var(--color-text-primary)]',
  // The block margin cancels the header's row gap, so a wrapped end area reads
  // as one step of spacing.
  'my-[calc(-1*(var(--spacing-3)-var(--spacing-2)))]',
);

export const bannerContentAreaClassName = tw(
  'bg-[color:var(--color-background-card)]',
  'py-[var(--spacing-3)] px-[var(--spacing-4)]',
  'border-s-[length:var(--border-width)] border-e-[length:var(--border-width)] border-b-[length:var(--border-width)]',
  'border-solid border-[color:var(--color-border)]',
);

export const bannerContentAreaCardClassName =
  'rounded-b-[var(--_banner-radius,var(--radius-container))]';

/** The disclosure chevron rotates on the icon itself, not on a wrapper. */
export const bannerChevronClassName = tw(
  'transition-transform',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-[0s]',
);

export const bannerChevronExpandedClassName = 'rotate-180';

/** Resting elevation of the whole banner. */
export const bannerElevationClassName: Record<Elevation, string> = {
  none: 'shadow-none',
  low: 'shadow-[var(--shadow-low)]',
  med: 'shadow-[var(--shadow-med)]',
  high: 'shadow-[var(--shadow-high)]',
};

/**
 * Status header fill. Forced colors replace the fill with Canvas, so the
 * outline keeps the header's shape visible there.
 */
export const bannerStatusClassName: Partial<Record<BannerStatus, string>> = {
  info: tw(
    'bg-[color:var(--color-info-muted)] text-[color:var(--color-on-info-muted)]',
    'forced-colors:outline-[1px] forced-colors:outline-solid forced-colors:outline-[color:CanvasText] forced-colors:[outline-offset:-1px]',
  ),
  warning: tw(
    'bg-[color:var(--color-warning-muted)] text-[color:var(--color-on-warning-muted)]',
    'forced-colors:outline-[1px] forced-colors:outline-solid forced-colors:outline-[color:CanvasText] forced-colors:[outline-offset:-1px]',
  ),
  error: tw(
    'bg-[color:var(--color-error-muted)] text-[color:var(--color-on-error-muted)]',
    'forced-colors:outline-[1px] forced-colors:outline-solid forced-colors:outline-[color:CanvasText] forced-colors:[outline-offset:-1px]',
  ),
  success: tw(
    'bg-[color:var(--color-success-muted)] text-[color:var(--color-on-success-muted)]',
    'forced-colors:outline-[1px] forced-colors:outline-solid forced-colors:outline-[color:CanvasText] forced-colors:[outline-offset:-1px]',
  ),
};

/**
 * The on-muted foreground for a built-in control only. A tooltip is a sibling
 * of its Button, so it keeps the theme's ordinary text color.
 */
export const bannerStatusControlClassName: Partial<
  Record<BannerStatus, string>
> = {
  info: '[--color-text-primary:var(--color-on-info-muted)]',
  warning: '[--color-text-primary:var(--color-on-warning-muted)]',
  error: '[--color-text-primary:var(--color-on-error-muted)]',
  success: '[--color-text-primary:var(--color-on-success-muted)]',
};
