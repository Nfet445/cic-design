// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sectionClasses.ts
 * @input Section variant, dividers and the sizing props it resolves
 * @output Utility class strings for the outer escape wrapper and the inner
 *   painted region
 * @position Style primitives; scanned by the Tailwind build
 *
 * The outer wrapper pulls a nested Section out of its parent's container
 * padding and the inner wrapper resets the container variables it publishes,
 * so the pair stay separate: the margin classes read the parent's values, the
 * variable classes overwrite them for this section's own children.
 *
 * Sizing rides the class-plus-inline-variable path (`--astryx-section-*`), so a
 * consumer's `xstyle` still wins over a `width` prop.
 */

import {tw} from '../utils/tw';
import type {SizeValue} from '../utils/types';
import type {SectionVariant} from './Section';

/** The custom properties a sizing prop travels in; the classes read them. */
export const sectionSizeVars = {
  width: '--astryx-section-width',
  height: '--astryx-section-height',
  maxWidth: '--astryx-section-max-width',
  minHeight: '--astryx-section-min-height',
} as const;

const variantClasses: Record<SectionVariant, string> = {
  section: 'bg-[var(--color-background-surface)]',
  transparent: 'bg-transparent',
  muted: 'bg-[var(--color-background-muted)]',
};

/**
 * The dividers draw one border width, as they did before the move. A divider
 * is logical on the inline axis, so `start` and `end` follow direction.
 */
const dividerClasses = {
  top: '[border-top:1px_solid_var(--color-border)]',
  bottom: '[border-bottom:1px_solid_var(--color-border)]',
  start: '[border-inline-start:1px_solid_var(--color-border)]',
  end: '[border-inline-end:1px_solid_var(--color-border)]',
} as const;

export type SectionDividerSide = keyof typeof dividerClasses;

const NESTED_OUTER_CLASSES = tw(
  'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
  'me-[calc(-1*var(--container-padding-inline-end,0px))]',
  'first:mt-[calc(-1*var(--container-padding-block-start,0px))]',
  'last:mb-[calc(-1*var(--container-padding-block-end,0px))]',
);

const NESTED_INNER_CLASSES = tw(
  'h-full',
  '[--container-padding-inline-start:0px]',
  '[--container-padding-inline-end:0px]',
  '[--container-padding-block-start:0px]',
  '[--container-padding-block-end:0px]',
);

export interface SectionSizingOptions {
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
  width?: SizeValue;
}

/** The escape wrapper's margins plus whichever size the caller set. */
export function sectionOuterClassName({
  height,
  maxWidth,
  minHeight,
  width,
}: SectionSizingOptions): string {
  return tw(
    NESTED_OUTER_CLASSES,
    width != null && 'w-[var(--astryx-section-width)]',
    height != null && 'h-[var(--astryx-section-height)]',
    maxWidth != null && 'max-w-[var(--astryx-section-max-width)]',
    minHeight != null && 'min-h-[var(--astryx-section-min-height)]',
  );
}

export interface SectionInnerClassNameOptions {
  dividers?: ReadonlyArray<SectionDividerSide>;
  variant: SectionVariant;
}

/** The painted region: its variant surface and the dividers it draws. */
export function sectionInnerClassName({
  dividers,
  variant,
}: SectionInnerClassNameOptions): string {
  return tw(
    NESTED_INNER_CLASSES,
    variantClasses[variant],
    dividers?.includes('top') && dividerClasses.top,
    dividers?.includes('bottom') && dividerClasses.bottom,
    dividers?.includes('start') && dividerClasses.start,
    dividers?.includes('end') && dividerClasses.end,
  );
}
