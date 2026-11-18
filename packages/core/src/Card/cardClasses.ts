// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file cardClasses.ts
 * @input Accepts the card variant, elevation, fixed-height flag and the sizing
 *   values Card resolves
 * @output Tailwind utility class names for the card surface
 * @position Internal to Card.
 *
 * Each state picks one class per property, so two classes here never paint the
 * same declaration and the sheet order never decides between them: overflow is
 * one class either way, and a variant owns only its background.
 *
 * Sizing and elevation go through a class that reads an inline custom
 * property, so a consumer class can still override them; an inline `width`
 * would beat every class a consumer passes.
 *
 * The border-inset padding doubles the card's own target class, so it outranks
 * the padding `container()` sets on the same element.
 */

import {tw} from '../utils/tw';
import type {Elevation} from '../utils/types';
import type {CardVariant} from './Card';

/** Names of the per-instance custom properties this component writes. */
export const cardSizeVars = {
  width: '--astryx-card-width',
  height: '--astryx-card-height',
  maxWidth: '--astryx-card-max-width',
  minHeight: '--astryx-card-min-height',
} as const;

/**
 * The card surface. A card in a flex row or a grid cell yields to its track
 * instead of holding it at its min-content width, and it clips rather than
 * scrolls: `overflow-x: auto` would make every card a scroll container, so
 * sticky descendants would stick to the card instead of the page.
 *
 * The shadow list reads `--_card-ring` as well, so a composing surface can
 * layer its own ring beside the elevation instead of clobbering the single
 * `box-shadow` property. Both variables fall back to a transparent no-op.
 */
export const cardClassName = tw(
  'rounded-[var(--radius-container)]',
  '[--_card-radius:var(--radius-container)]',
  'min-w-0',
  'shadow-[var(--_card-ring,0_0_transparent),var(--_card-elevation,0_0_transparent)]',
);

/** The outer radius a full-bleed child reaches under the border with. */
export const cardCornersClassName = tw(
  '[--_container-corner-block-start:var(--_card-radius)]',
  '[--_container-corner-block-end:var(--_card-radius)]',
);

/**
 * Background variant classes. A theme can add a variant; the record has no
 * entry for it, so the lookup is undefined, `tw` drops it, and the theme rule
 * paints over the base surface.
 */
export const cardVariantClassName: Partial<Record<CardVariant, string>> = {
  default: 'bg-[var(--color-background-card)]',
  transparent: 'bg-transparent',
  muted: 'bg-[var(--color-background-muted)]',
  blue: 'bg-[var(--color-background-blue)]',
  cyan: 'bg-[var(--color-background-cyan)]',
  gray: 'bg-[var(--color-background-gray)]',
  green: 'bg-[var(--color-background-green)]',
  orange: 'bg-[var(--color-background-orange)]',
  pink: 'bg-[var(--color-background-pink)]',
  purple: 'bg-[var(--color-background-purple)]',
  red: 'bg-[var(--color-background-red)]',
  teal: 'bg-[var(--color-background-teal)]',
  yellow: 'bg-[var(--color-background-yellow)]',
};

/**
 * Elevation sets the private `--_card-elevation` variable, not `box-shadow`, so
 * it composes with the ring in the base shadow list. `none` is a transparent
 * no-op: the CSS literal `none` is invalid inside a comma-separated shadow
 * list.
 */
export const cardElevationClassName: Record<Elevation, string> = {
  none: '[--_card-elevation:0_0_transparent]',
  low: '[--_card-elevation:var(--shadow-low)]',
  med: '[--_card-elevation:var(--shadow-med)]',
  high: '[--_card-elevation:var(--shadow-high)]',
};

/** The border a `default` card draws, inside the padding. */
export const cardBorderClassName = tw(
  'border-[length:var(--border-width)] border-solid',
  'border-[color:var(--color-border)]',
);

/**
 * The border drawn inside the padding: its width is subtracted from each side,
 * so the total inset (border + padding) equals the padding token. The target
 * class is doubled to outrank the padding `container()` sets on the same
 * element at the same layer.
 */
export const cardBorderPaddingClassName = tw(
  '[&.astryx-card]:[padding-inline-start:calc(var(--container-padding-inline-start)_-_var(--border-width))]',
  '[&.astryx-card]:[padding-inline-end:calc(var(--container-padding-inline-end)_-_var(--border-width))]',
  '[&.astryx-card]:[padding-block-start:calc(var(--container-padding-block-start)_-_var(--border-width))]',
  '[&.astryx-card]:[padding-block-end:calc(var(--container-padding-block-end)_-_var(--border-width))]',
);

/**
 * One overflow class per state: a fixed-height card scrolls its content, every
 * other card clips it.
 */
export function cardOverflowClassName({
  hasFixedHeight,
}: {
  hasFixedHeight: boolean;
}): string {
  return hasFixedHeight ? 'overflow-auto' : 'overflow-clip';
}

export interface CardSizingOptions {
  height?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  width?: number | string;
}

/** One class per size the caller set, each reading its inline variable. */
export function cardSizingClassName({
  height,
  maxWidth,
  minHeight,
  width,
}: CardSizingOptions): string {
  return tw(
    width != null && 'w-[var(--astryx-card-width)]',
    height != null && 'h-[var(--astryx-card-height)]',
    maxWidth != null && 'max-w-[var(--astryx-card-max-width)]',
    minHeight != null && 'min-h-[var(--astryx-card-min-height)]',
  );
}
