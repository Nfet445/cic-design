// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file clickableCardClasses.ts
 * @input The clickable card's variant and disabled state
 * @output The interactive surface, its hover and press layer, the two border
 *   states, the disabled dimming and the hidden control's reset
 * @position Internal to ClickableCard; the Tailwind build scans it for class
 *   names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 *
 * The bordered variant's border-inset padding stays in
 * `clickableCardBorder.stylex.ts`: `container()` also sets `padding`, as an
 * unlayered StyleX rule that outranks any class in `astryx-base`.
 */

import {tw} from '../utils/tw';

/**
 * The interactive surface. The card is a plain `<div>`: the hidden link or
 * button inside it carries the role and the focus ring, so this class paints
 * the pointer only.
 */
export const clickableCardInteractiveClassName = tw(
  'relative',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'no-underline text-inherit',
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
export const clickableCardOverlayClassName = tw(
  '[--_press-overlay:transparent]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:pointer-coarse:active:[--_press-overlay:transparent]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:active:[--_press-overlay:var(--color-overlay-pressed)]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:[@media(hover:hover)]:hover:[--_press-overlay:var(--color-overlay-hover)]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:[@media(hover:hover)]:active:[--_press-overlay:var(--color-overlay-pressed)]',
  'after:absolute after:inset-0 after:pointer-events-none after:content-[""]',
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

/**
 * Borderless variants (everything except `default`): drop the 1px border Card
 * would draw. The overlay is inset to the padding box — inside that border — so
 * a border strip stays untinted on hover and reads as a faint ring; with no
 * border the overlay covers the full box edge to edge.
 */
export const clickableCardBorderlessClassName = 'border-0';

/**
 * Bordered variant (`default`): the border rests at the subtle token and
 * emphasizes on hover, over the fast fade. Under reduced motion a fine pointer
 * gets no transition, and a touch screen's opacity fade, such as a disabled
 * card's dimming, takes 200 ms at most.
 *
 * The hover arm needs no StyleX exception: `:hover` outranks Card's own border
 * colour utility on specificity, whatever the sheet order.
 */
export const clickableCardBorderedClassName = tw(
  'border-[color:var(--color-border)]',
  'transition-[border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:pointer-fine:duration-0',
  'motion-reduce:pointer-coarse:transition-[opacity]',
  'motion-reduce:pointer-coarse:duration-[min(var(--duration-exit),200ms)]',
  'motion-reduce:pointer-coarse:ease-[var(--ease-exit)]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:[@media(hover:hover)]:hover:border-[color:var(--color-border-emphasized)]',
);

/** A disabled card is non-interactive and dimmed. */
export const clickableCardDisabledClassName = 'cursor-default opacity-50';

/** The control that carries the card's role, name and focus ring. */
export const clickableCardSrOnlyClassName = 'sr-only';
