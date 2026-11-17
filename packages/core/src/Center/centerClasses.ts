// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file centerClasses.ts
 * @input Accepts the axis, inline mode and sizing values Center resolves
 * @output Tailwind utility class names for the centering container
 * @position Internal to Center.
 *
 * Sizing uses the same class-level declaration plus inline variable as the
 * contract Family: Layout Primitives gives dynamic track templates: an inline
 * `width` would beat every class a consumer passes.
 *
 * Tailwind scans literal class names, so the variable names in the bracket
 * values repeat `centerSizeVars`.
 */

import {tw} from '../utils/tw';
import type {CenterAxis} from './Center';

export const centerSizeVars = {
  width: '--astryx-center-width',
  height: '--astryx-center-height',
  maxWidth: '--astryx-center-max-width',
  minHeight: '--astryx-center-min-height',
} as const;

export interface CenterClassNameOptions {
  axis: CenterAxis;
  isInline: boolean;
}

export function centerClassName({
  axis,
  isInline,
}: CenterClassNameOptions): string {
  return tw(
    isInline ? 'inline-flex' : 'flex',
    (axis === 'both' || axis === 'vertical') && 'items-center',
    (axis === 'both' || axis === 'horizontal') && 'justify-center',
  );
}

export interface CenterSizingOptions {
  height?: number | string;
  maxWidth?: number | string;
  minHeight?: number | string;
  width?: number | string;
}

export function centerSizingClassName({
  height,
  maxWidth,
  minHeight,
  width,
}: CenterSizingOptions): string {
  return tw(
    width != null && 'w-[var(--astryx-center-width)]',
    height != null && 'h-[var(--astryx-center-height)]',
    maxWidth != null && 'max-w-[var(--astryx-center-max-width)]',
    minHeight != null && 'min-h-[var(--astryx-center-min-height)]',
  );
}
