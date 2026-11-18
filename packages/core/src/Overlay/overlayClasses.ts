// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Overlay/overlayClasses.ts
 * @input The scrim's position, alignment, tint, and what reveals it
 * @output Literal class strings for the overlay container and its scrim
 * @position Tailwind counterpart of the scrim map; read by OverlayScrim and
 *   Overlay
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * An overlay container holds its scrim's absolute box: the scrim fills it or
 * pins itself to one edge, and the clip keeps a sliding strip inside it.
 */
export const overlayContainerClassName = 'relative overflow-clip';

/**
 * The scrim's box: absolute, a column of content, and one transition for the
 * three properties its reveal moves.
 */
export const overlayScrimBaseClassName = tw(
  'absolute flex flex-col pointer-events-none',
  'gap-[var(--spacing-2)] p-[var(--spacing-3)]',
  'transition-[opacity,visibility,transform]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-[0s]',
);

export const overlayScrimPositionClassName = {
  fill: 'inset-0',
  bottom: 'inset-x-0 bottom-0',
  top: 'inset-x-0 top-0',
} as const;

export const overlayScrimAlignClassName = {
  start: 'items-start justify-start',
  center: 'items-center justify-center',
  end: 'items-end justify-start',
} as const;

/** The scrim's tint. A light scrim is a wash of white, not a theme token. */
export const overlayScrimTintClassName = {
  dark: 'bg-[var(--color-overlay)]',
  light: 'bg-[color:color-mix(in_srgb,white_60%,transparent)]',
} as const;

/** Where a strip rests while hidden, so it can slide in from its edge. */
const HIDDEN_SLIDE = {
  bottom: '[transform:translateY(100%)]',
  top: '[transform:translateY(-100%)]',
} as const;

/** The frame a strip animates from as it mounts. */
const STARTING_SLIDE = {
  bottom: 'starting:[transform:translateY(100%)]',
  top: 'starting:[transform:translateY(-100%)]',
} as const;

/**
 * The reveal the CSS drives. The container carries
 * `data-astryx-overlay-scope`, so these variants name an ancestor. The
 * attribute is written twice: one attribute would tie with the hidden state's
 * own utility on specificity, and inside one layer the sheet order would then
 * decide which of the two applies. Two attributes lift the revealed arm above
 * it whatever order the sheet prints.
 *
 * Every class is spelled out. Tailwind reads class text out of the source, so
 * a variant assembled at runtime is a variant it never emits.
 */
const SHOWN =
  'opacity-100 visible pointer-events-auto [transform:translateY(0)]';
const HIDDEN = 'opacity-0 invisible';

/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text, so the attribute has to be spelled here; privateAttributes/overlayScope.stylex.ts owns the name. */

const HOVER_OPACITY =
  '[@media(hover:hover)]:[&:is([data-astryx-overlay-scope][data-astryx-overlay-scope]:hover_*)]:opacity-100';
const HOVER_VISIBILITY =
  '[@media(hover:hover)]:[&:is([data-astryx-overlay-scope][data-astryx-overlay-scope]:hover_*)]:visible';
const HOVER_POINTER =
  '[@media(hover:hover)]:[&:is([data-astryx-overlay-scope][data-astryx-overlay-scope]:hover_*)]:pointer-events-auto';
const HOVER_SLIDE =
  '[@media(hover:hover)]:[&:is([data-astryx-overlay-scope][data-astryx-overlay-scope]:hover_*)]:[transform:translateY(0)]';

const FOCUS_OPACITY =
  '[&:is([data-astryx-overlay-scope][data-astryx-overlay-scope]:focus-within_*)]:opacity-100';
const FOCUS_VISIBILITY =
  '[&:is([data-astryx-overlay-scope][data-astryx-overlay-scope]:focus-within_*)]:visible';
const FOCUS_POINTER =
  '[&:is([data-astryx-overlay-scope][data-astryx-overlay-scope]:focus-within_*)]:pointer-events-auto';
const FOCUS_SLIDE =
  '[&:is([data-astryx-overlay-scope][data-astryx-overlay-scope]:focus-within_*)]:[transform:translateY(0)]';

/** A scrim that is open, or one that is always shown. */
export function overlayScrimShownClassName({
  position,
}: {
  position: 'fill' | 'bottom' | 'top';
}): string {
  return tw(
    SHOWN,
    'starting:opacity-0',
    position === 'bottom' && STARTING_SLIDE.bottom,
    position === 'top' && STARTING_SLIDE.top,
  );
}

/** A scrim that is closed: a strip rests off its edge, a fill only fades. */
export function overlayScrimHiddenClassName({
  position,
}: {
  position: 'fill' | 'bottom' | 'top';
}): string {
  return tw(
    HIDDEN,
    position === 'bottom' && HIDDEN_SLIDE.bottom,
    position === 'top' && HIDDEN_SLIDE.top,
  );
}

/** A scrim the container's hover or its focus inside reveals. */
export function overlayScrimHoverRevealClassName({
  position,
}: {
  position: 'fill' | 'bottom' | 'top';
}): string {
  return tw(
    HIDDEN,
    position === 'bottom' && HIDDEN_SLIDE.bottom,
    position === 'top' && HIDDEN_SLIDE.top,
    HOVER_OPACITY,
    HOVER_VISIBILITY,
    HOVER_POINTER,
    FOCUS_OPACITY,
    FOCUS_VISIBILITY,
    FOCUS_POINTER,
    position !== 'fill' && HOVER_SLIDE,
    position !== 'fill' && FOCUS_SLIDE,
  );
}

/** A scrim only a focus inside the container reveals. */
export function overlayScrimFocusRevealClassName({
  position,
}: {
  position: 'fill' | 'bottom' | 'top';
}): string {
  return tw(
    HIDDEN,
    position === 'bottom' && HIDDEN_SLIDE.bottom,
    position === 'top' && HIDDEN_SLIDE.top,
    FOCUS_OPACITY,
    FOCUS_VISIBILITY,
    FOCUS_POINTER,
    position !== 'fill' && FOCUS_SLIDE,
  );
}
/* eslint-enable @astryx/no-raw-private-attribute */
