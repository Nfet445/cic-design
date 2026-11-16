// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconClasses.ts
 * @input Takes the color Icon resolves and, for a registry glyph, the wrapper
 * @output Tailwind utility class names for an icon glyph, the inline custom
 *   property that carries its size step, and the IconColor names
 * @position Style primitives; scanned by the Tailwind build
 *
 * The size step reaches the glyph as an inline custom property, so a consumer
 * class can still set the dimensions and a theme's `--_icon-width` /
 * `--_icon-height` still win: an inline `width` would beat both. Tailwind scans
 * literal class names, so the bracket values repeat the variable names.
 */

import {tw} from '../utils/tw';

/** The inline custom property that carries a size step's rem dimension. */
export const iconSizeVar = '--astryx-icon-size';

/**
 * The glyph box. A theme writes `width` and `height` on the `icon` target's
 * size selector, and the derived-var registry emits them as the private vars
 * below; a size the theme leaves alone keeps the step's own rem value.
 */
const ICON_BOX_CLASS = tw(
  '[width:var(--_icon-width,var(--astryx-icon-size))]',
  '[height:var(--_icon-height,var(--astryx-icon-size))]',
);

/**
 * Registry artwork is 1em-based, so the font size is the box's smaller side,
 * which fits square artwork into a non-square box the way an SVG viewBox does.
 */
const ICON_ARTWORK_CLASS = tw(
  ICON_BOX_CLASS,
  '[font-size:min(var(--_icon-width,var(--astryx-icon-size)),var(--_icon-height,var(--astryx-icon-size)))]',
);

/** Every color name an icon accepts, and the token class that paints it. */
export const iconColorClassName = {
  primary: 'text-[var(--color-icon-primary)]',
  secondary: 'text-[var(--color-icon-secondary)]',
  tertiary: 'text-[var(--color-icon-secondary)]',
  disabled: 'text-[var(--color-icon-disabled)]',
  accent: 'text-[var(--color-accent)]',
  info: 'text-[var(--color-icon-info)]',
  success: 'text-[var(--color-icon-success)]',
  error: 'text-[var(--color-icon-error)]',
  warning: 'text-[var(--color-icon-warning)]',
  inherit: 'text-inherit',
  // Non-semantic colors
  blue: 'text-[var(--color-icon-blue)]',
  red: 'text-[var(--color-icon-red)]',
  green: 'text-[var(--color-icon-green)]',
  gray: 'text-[var(--color-icon-gray)]',
  cyan: 'text-[var(--color-icon-cyan)]',
  teal: 'text-[var(--color-icon-teal)]',
  yellow: 'text-[var(--color-icon-yellow)]',
  orange: 'text-[var(--color-icon-orange)]',
  pink: 'text-[var(--color-icon-pink)]',
  purple: 'text-[var(--color-icon-purple)]',
} as const;

export type IconColor = keyof typeof iconColorClassName;

/** Classes for a direct SVG icon component. */
export function iconGlyphClassName(color: IconColor): string {
  return tw('shrink-0', ICON_BOX_CLASS, iconColorClassName[color]);
}

/** Classes for the span that wraps a glyph the registry resolved. */
export function iconRegistryClassName(color: IconColor): string {
  return tw(
    'inline-flex items-center justify-center shrink-0',
    ICON_ARTWORK_CLASS,
    iconColorClassName[color],
  );
}
