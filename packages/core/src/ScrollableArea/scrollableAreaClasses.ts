// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scrollableAreaClasses.ts
 * @input The viewport sizing props and whether the viewport is full bleed
 * @output Utility class strings for the viewport and its content box
 * @position Style primitives; scanned by the Tailwind build
 *
 * Sizing rides the class-plus-inline-variable path (`--astryx-scrollable-area-*`),
 * so a consumer's `xstyle` still wins over a `width` prop.
 */

import {tw} from '../utils/tw';
import type {SizeValue} from '../utils/types';

/** The custom properties a sizing prop travels in; the classes read them. */
export const scrollableAreaSizeVars = {
  width: '--astryx-scrollable-area-width',
  height: '--astryx-scrollable-area-height',
  maxWidth: '--astryx-scrollable-area-max-width',
  minHeight: '--astryx-scrollable-area-min-height',
} as const;

/**
 * Touch screens keep the platform's own scroll indicator, which iOS shows only
 * while scrolling. A custom colour turns it into a faint bar that also shows in
 * the gap a pull opens.
 */
const VIEWPORT_CLASSES = tw(
  'box-border max-w-full max-h-full',
  '[scrollbar-color:var(--color-neutral)_transparent]',
  'pointer-coarse:[scrollbar-color:auto]',
  'forced-colors:[scrollbar-color:auto]',
  // Chromium can resolve CSS-only stuck/edge presentation for descendants.
  // Unsupported engines keep the hook state as the behavior source of truth.
  'supports-[container-type:scroll-state]:[container-type:scroll-state]',
);

const FULL_BLEED_CLASSES = tw(
  'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
  'me-[calc(-1*var(--container-padding-inline-end,0px))]',
  'max-w-[calc(100%+var(--container-padding-inline-start,0px)+var(--container-padding-inline-end,0px))]',
  'first:mt-[calc(-1*var(--container-padding-block-start,0px))]',
  'last:mb-[calc(-1*var(--container-padding-block-end,0px))]',
);

const CONTENT_CLASSES = 'box-border min-w-full min-h-full';

/** A content box whose inline axis carries the scroll. */
export const scrollableAreaContentWithInlineOverflowClassName = 'w-max';

export interface ScrollableAreaViewportClassNameOptions {
  isFullBleed: boolean;
  width?: SizeValue;
  height?: SizeValue;
  maxWidth?: SizeValue;
  minHeight?: SizeValue;
}

/** The viewport: its scrollbars, its scroll-state container, and its size. */
export function scrollableAreaViewportClassName({
  isFullBleed,
  width,
  height,
  maxWidth,
  minHeight,
}: ScrollableAreaViewportClassNameOptions): string {
  return tw(
    VIEWPORT_CLASSES,
    isFullBleed && FULL_BLEED_CLASSES,
    width != null && 'w-[var(--astryx-scrollable-area-width)]',
    height != null && 'h-[var(--astryx-scrollable-area-height)]',
    maxWidth != null && 'max-w-[var(--astryx-scrollable-area-max-width)]',
    minHeight != null && 'min-h-[var(--astryx-scrollable-area-min-height)]',
  );
}

/**
 * The viewport's own overflow on both axes. Each axis takes one of three
 * effective values from the hook's measurement, which a class cannot express,
 * so the hook writes the value inline and these declarations read it —
 * defaulting to `clip` while the viewport fits its content.
 */
export const scrollableAreaOverflowClassName =
  '[overflow-x:var(--astryx-scrollable-overflow-x,clip)] [overflow-y:var(--astryx-scrollable-overflow-y,clip)]';

/** The custom properties the hook's per-axis overflow value travels in. */
export const scrollableAreaOverflowVars = {
  x: '--astryx-scrollable-overflow-x',
  y: '--astryx-scrollable-overflow-y',
} as const;

/** The single block content box the viewport observes. */
export const scrollableAreaContentClassName = CONTENT_CLASSES;
