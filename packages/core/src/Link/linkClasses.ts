// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file linkClasses.ts
 * @input Link color, decoration, standalone, disabled, truncating and
 *   clamped-text inputs
 * @output Utility class strings for the link root, its label and its external
 *   icon
 * @position Style primitives; scanned by the Tailwind build
 *
 * Every hover and press state is a variant over the same token the resting
 * state reads, so a theme restyles both at once and no class here repeats the
 * declarations of another. The focus ring and the pressed overlay stay StyleX
 * (`focusOutlineProps`, `interactionOverlay.stylex.ts`); this module carries
 * only what paints the link itself.
 */

import {tw} from '../utils/tw';
import type {TextColor} from '../theme/types';

/**
 * The root box. An inline-flex box is atomic, so a clamp cannot cut through
 * it; inside a clamp the root is `inline` and lets the clamp cut the lines.
 * The two are separate literals because Tailwind orders utilities, not the
 * order a string names them in.
 */
const linkDisplayClassName = {
  box: 'inline-flex',
  inClamp: 'inline',
};

/** The root box: one line of content whose label may shrink and wrap. */
const rootClassName = tw(
  'max-w-full items-center gap-0.5',
  '[font-family:inherit] [font-size:inherit] [font-weight:inherit] [line-height:inherit]',
  'cursor-pointer',
  `[&:is(:disabled,[aria-disabled=true])]:cursor-default`,
  'transition-[color,text-decoration]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  // A pointer underlines the label; a finger has no hover to show it.
  // The scanner reads whole literals only, so the enabled guard is spelled out
  // in each class rather than shared through interpolation.
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:underline',
);

/** A pressed link paints the system overlay instead of a decoration. */
export interface LinkClassNameOptions {
  /** Underline at rest, not only on hover. */
  hasUnderline: boolean;
  /** A disabled link keeps no pointer.
   */
  isDisabled: boolean;
  /** Render as a link-styled button rather than an anchor. */
  isButton: boolean;
  /** Join the line boxes of an enclosing clamped Text. */
  isInClampedText: boolean;
  /** Base font sizing for a link outside a text run. */
  isStandalone: boolean;
  /** May shrink below its label's length inside a flex row. */
  isTruncating: boolean;
}

/** The link root, minus its color. */
export function linkClassName({
  hasUnderline,
  isDisabled,
  isButton,
  isInClampedText,
  isStandalone,
  isTruncating,
}: LinkClassNameOptions): string {
  return tw(
    isInClampedText ? linkDisplayClassName.inClamp : linkDisplayClassName.box,
    rootClassName,
    isButton &&
      tw(
        'bg-transparent border-none p-0',
        // Browsers centre a button's text; a wrapped label lines up as an
        // anchor's does.
        '[text-align:inherit] pointer-events-auto relative',
      ),
    // An inline-flex box is atomic, so a clamp cannot cut through the link.
    // Inside one the clamp also clips at the line edges, so the ring sits
    // inside each line box.
    isInClampedText && '[outline-offset:calc(-1_*_var(--focus-outline-width))]',
    isStandalone &&
      '[font-size:var(--text-body-size)] [line-height:var(--text-body-leading)]',
    // One decoration class at rest, so the hover variant is the only one it
    // has to outrank.
    hasUnderline ? 'underline' : 'no-underline',
    isTruncating && 'min-w-0',
    isDisabled && 'opacity-50 pointer-events-none',
  );
}

/**
 * The label. A flex item's min-width defaults to its longest word; zero lets
 * the label shrink to the root, so its text wraps.
 */
export const linkLabelClassName = 'min-w-0';

/** The external icon inside a clamped Text, where it joins the text run. */
export const linkExternalIconInClampedTextClassName = 'ms-0.5 align-middle';

/**
 * The color the root paints, so the label, the underline, and the icon keep
 * one color at rest and on hover, whatever a theme sets on its text targets.
 * The hover tints the same token with the theme's hover tint.
 */
export const linkColorClassName: Record<TextColor, string> = {
  primary: tw(
    'text-[color:var(--color-text-primary)]',
    '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:text-[color:color-mix(in_srgb,var(--color-text-primary),var(--color-tint-hover)_15%)]',
  ),
  secondary: tw(
    'text-[color:var(--color-text-secondary)]',
    '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:text-[color:color-mix(in_srgb,var(--color-text-secondary),var(--color-tint-hover)_15%)]',
  ),
  disabled: 'text-[color:var(--color-text-disabled)]',
  placeholder: 'text-[color:var(--color-text-secondary)]',
  accent: tw(
    'text-[color:var(--color-text-accent)]',
    '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:text-[color:color-mix(in_srgb,var(--color-text-accent),var(--color-tint-hover)_15%)]',
  ),
  inherit: 'text-inherit',
};
