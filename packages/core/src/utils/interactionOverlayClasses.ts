// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file interactionOverlayClasses.ts
 * @input The theme's overlay colours and, when a StyleX consumer composes it, the
 *   press controller's `--_press-paint-image`
 * @output The class arm of the system's hover and press overlay, beside
 *   `interactionOverlayStyles.backgroundImage`
 * @position Published from `@astryxdesign/core/utils` for a composer that draws
 *   the overlay on its own surface without StyleX; the Tailwind build scans it
 *   for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 *
 * The press arrives as the `data-astryx-press` attribute the controller writes
 * (`on` while the press is held, `fading` through the release); its strength
 * `--astryx-press-alpha` belongs to `interactionOverlayStyles.pressedAlpha`, so
 * this class reads the image that arm paints and falls back to the pressed
 * token at full strength.
 *
 * shortcut: a page that loads this class without the StyleX strength shows the
 * release without its fade; upgrade when the press controller owns a class-era
 * strength.
 */

import {tw} from './tw';

/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the press attribute has to appear literally in a class name; the owner
   module cannot supply it through interpolation. Doubling the attribute raises
   the arm above the hover and `:active` arms, whose pseudo-classes carry the
   same weight as one attribute. */
/**
 * The hover and press overlay as a `background-image` on the surface itself:
 * the hover token under a fine pointer, the pressed token on `:active`, and the
 * controller's paint while it holds the press attribute.
 *
 * A coarse pointer drops the `:active` paint: a finger raises it through the
 * controller's attribute instead, and a touch surface would otherwise paint
 * both. Disabled and `aria-disabled` surfaces paint nothing.
 */
export const interactionOverlayBackgroundImageClassName = tw(
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:[background-image:linear-gradient(var(--color-overlay-hover),var(--color-overlay-hover))]',
  '[@media(hover:hover)]:[&:active:where(:not(:disabled,[aria-disabled=true]))]:[background-image:linear-gradient(var(--color-overlay-pressed),var(--color-overlay-pressed))]',
  '[&:active:where(:not(:disabled,[aria-disabled=true]))]:[background-image:linear-gradient(var(--color-overlay-pressed),var(--color-overlay-pressed))]',
  '[&:active:where(:not(:disabled,[aria-disabled=true]))]:pointer-coarse:[background-image:none]',
  '[&[data-astryx-press=on][data-astryx-press=on]]:[background-image:var(--_press-paint-image,linear-gradient(var(--color-overlay-pressed),var(--color-overlay-pressed)))]',
  '[&[data-astryx-press=fading][data-astryx-press=fading]]:[background-image:var(--_press-paint-image,linear-gradient(var(--color-overlay-pressed),var(--color-overlay-pressed)))]',
);
/* eslint-enable @astryx/no-raw-private-attribute */
