// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectableCardClasses.ts
 * @input The card's variant, selection, and pointer capabilities
 * @output The interactive surface, its hover and press layer, the selection
 *   ring and border, the disabled dimming, and the hidden checkbox
 * @position Internal to SelectableCard; the Tailwind build scans it for class
 *   names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.ts
 */

import {tw} from '../utils/tw';

/**
 * The interactive surface. Declared on the element that carries the
 * `astryx-selectable-card` target, so a theme has something to override — the
 * ring for a variant only the theme knows about reads it.
 *
 * The transition covers the selection's ring and border. Under reduced motion a
 * selection changes at once on a fine pointer; a touch screen may still fade a
 * disabled card's dimming, within 200 ms.
 */
export const selectableCardInteractiveClassName = tw(
  '[--selectable-card-ring-color:var(--color-accent)]',
  'relative',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[box-shadow,border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:pointer-fine:duration-0',
  'motion-reduce:pointer-coarse:transition-[opacity]',
  'motion-reduce:pointer-coarse:duration-[min(var(--duration-exit),200ms)]',
  'motion-reduce:pointer-coarse:ease-[var(--ease-exit)]',
);

/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the press attribute has to appear literally in a class name; the owner
   module cannot supply it through interpolation. */
/**
 * Hover and pressed overlay. The `::after` layer paints the hover and mouse
 * states as its colour, `--_press-overlay`, which their arms set on the
 * element itself. Hover is guarded by `@media (hover: hover)`, so touch devices
 * show no stuck hover state; under a coarse pointer the mouse `:active` colour
 * is dropped, because the press controller paints instead.
 *
 * The press the controller paints (a finger's, and on a touch-first device a
 * mouse's or a key's) is the same layer's image, keyed on the
 * `data-astryx-press` attribute the controller writes. Every arm of that press
 * is a plain property of the `::after`, which outranks the layer's own defaults
 * in a layered stylesheet and a flat one alike. A custom property's attribute
 * arm does not: a layered build emits the property's default outside the
 * priority layers its attribute arms land in, and the default wins. That is why
 * the press changes the layer's own colour and image rather than the property
 * the arms would otherwise set.
 */
export const selectableCardOverlayClassName = tw(
  '[--_press-overlay:transparent]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:pointer-coarse:active:[--_press-overlay:transparent]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:active:[--_press-overlay:var(--color-overlay-pressed)]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:[@media(hover:hover)]:hover:where(:not(:disabled,[aria-disabled=true])):[--_press-overlay:var(--color-overlay-hover)]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:[@media(hover:hover)]:active:[--_press-overlay:var(--color-overlay-pressed)]',
  'after:absolute after:inset-0 after:pointer-events-none after:content-[""]',
  'after:rounded-[inherit]',
  'after:bg-[var(--_press-overlay)]',
  // A press the controller paints shows on its first frame and fades on its
  // strength's own animation, so the colour it replaces drops out at once
  // rather than crossfading: no transition while it paints. The mouse states
  // keep the fast fade. Under reduced motion only opacity may still fade, and
  // only on a touch screen.
  'after:transition-[background-color] after:duration-[var(--duration-fast)] after:ease-[var(--ease-standard)]',
  'after:motion-reduce:pointer-fine:duration-0',
  'after:motion-reduce:pointer-coarse:transition-[opacity]',
  'after:motion-reduce:pointer-coarse:duration-[min(var(--duration-exit),200ms)]',
  'after:motion-reduce:pointer-coarse:ease-[var(--ease-exit)]',
  // While the controller paints, the colour yields to the image: a touchscreen
  // beside a fine pointer still matches `:active` under a finger, and the press
  // would otherwise paint twice.
  '[&[data-astryx-press=on]]:after:transition-none',
  '[&[data-astryx-press=fading]]:after:transition-none',
  '[&[data-astryx-press=on]]:after:bg-transparent',
  '[&[data-astryx-press=fading]]:after:bg-transparent',
  '[&[data-astryx-press=on]]:after:[background-image:var(--_press-paint-image)]',
  '[&[data-astryx-press=fading]]:after:[background-image:var(--_press-paint-image)]',
);
/* eslint-enable @astryx/no-raw-private-attribute */

/** A disabled card is non-interactive and dimmed. */
export const selectableCardDisabledClassName = 'cursor-default opacity-50';

/** The checkbox that carries the card's role, name, and checked state. */
export const selectableCardInputClassName = 'sr-only';

/**
 * The selection ring, drawn through the card's `--_card-ring` shadow slot so it
 * composes with the card's elevation instead of replacing it. A theme-added
 * variant paints with colours the component cannot know and no token is
 * guaranteed to contrast with it, so it reads a lever beside it that defaults
 * to the accent and keeps every built-in unchanged.
 */
export const selectableCardRingClassName: Record<string, string> = {
  accent: '[--_card-ring:inset_0_0_0_2px_var(--color-accent)]',
  blue: '[--_card-ring:inset_0_0_0_2px_var(--color-border-blue)]',
  cyan: '[--_card-ring:inset_0_0_0_2px_var(--color-border-cyan)]',
  gray: '[--_card-ring:inset_0_0_0_2px_var(--color-border-gray)]',
  green: '[--_card-ring:inset_0_0_0_2px_var(--color-border-green)]',
  orange: '[--_card-ring:inset_0_0_0_2px_var(--color-border-orange)]',
  pink: '[--_card-ring:inset_0_0_0_2px_var(--color-border-pink)]',
  purple: '[--_card-ring:inset_0_0_0_2px_var(--color-border-purple)]',
  red: '[--_card-ring:inset_0_0_0_2px_var(--color-border-red)]',
  teal: '[--_card-ring:inset_0_0_0_2px_var(--color-border-teal)]',
  yellow: '[--_card-ring:inset_0_0_0_2px_var(--color-border-yellow)]',
  unknown: '[--_card-ring:inset_0_0_0_2px_var(--selectable-card-ring-color)]',
};

/**
 * The selected card's border colour. The card draws it with its own
 * `border-[color:…]` utility in `astryx-base`, so the class names
 * `astryx-selectable-card` twice and wins on specificity, not on sheet order.
 */
export const selectableCardSelectedBorderClassName: Record<string, string> = {
  accent: '[&.astryx-selectable-card]:[border-color:var(--color-accent)]',
  blue: '[&.astryx-selectable-card]:[border-color:var(--color-border-blue)]',
  cyan: '[&.astryx-selectable-card]:[border-color:var(--color-border-cyan)]',
  gray: '[&.astryx-selectable-card]:[border-color:var(--color-border-gray)]',
  green: '[&.astryx-selectable-card]:[border-color:var(--color-border-green)]',
  orange:
    '[&.astryx-selectable-card]:[border-color:var(--color-border-orange)]',
  pink: '[&.astryx-selectable-card]:[border-color:var(--color-border-pink)]',
  purple:
    '[&.astryx-selectable-card]:[border-color:var(--color-border-purple)]',
  red: '[&.astryx-selectable-card]:[border-color:var(--color-border-red)]',
  teal: '[&.astryx-selectable-card]:[border-color:var(--color-border-teal)]',
  yellow:
    '[&.astryx-selectable-card]:[border-color:var(--color-border-yellow)]',
  unknown:
    '[&.astryx-selectable-card]:[border-color:var(--selectable-card-ring-color)]',
};
