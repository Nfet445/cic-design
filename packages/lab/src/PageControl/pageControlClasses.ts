// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pageControlClasses.ts
 * @input Accepts nothing: every class is fixed; the per-instance values they
 *   read are inline custom properties on the same element
 * @output The utility class strings the root, its cropped spelling, the held
 *   platter (both states), the strip, its resting offset and the indicator
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

/**
 * The focus ring lives on the root at rest and turns on at `:focus-visible`,
 * as every other Astryx control does.
 */
export const pageControlRootClassName = tw(
  'relative inline-block box-border shrink-0 align-middle cursor-default select-none',
  '[-webkit-tap-highlight-color:transparent]',
  'outline-none focus-visible:[outline-style:var(--focus-outline-style)]',
  '[outline-width:var(--focus-outline-width)]',
  '[outline-color:var(--focus-outline-color)]',
  '[outline-offset:var(--focus-outline-offset)]',
);

export const pageControlCroppedClassName = 'overflow-hidden';

/**
 * The held look has no element of its own: the root's `::before` paints it.
 * The state classes carry the opacity as a whole value, because two classes
 * setting `opacity` would be ordered by the sheet, not by the attribute.
 */
const platterClassName =
  "before:content-[''] before:absolute before:inset-0 before:rounded-full before:bg-[color:var(--color-overlay-pressed)] before:pointer-events-none before:[transition:var(--astryx-page-control-platter-transition,none)]";

export const pageControlPlatterHiddenClassName = tw(
  platterClassName,
  'before:opacity-0',
);

export const pageControlPlatterShownClassName = tw(
  platterClassName,
  'before:opacity-100',
);

export const pageControlStripClassName =
  'absolute inset-y-0 w-0 pointer-events-none';

/**
 * The resting offset and dot size the markup carries. The animator's inline
 * translate and scale override them.
 */
export const pageControlRestingStripClassName =
  '[translate:calc(-1*var(--astryx-page-control-rest,0px))_0] [&:is([dir="rtl"]_*)]:[translate:var(--astryx-page-control-rest,0px)_0]';

export const pageControlIndicatorClassName =
  'absolute rounded-full bg-[color:var(--color-text-primary)]';

export const pageControlRestingDotClassName =
  '[scale:var(--astryx-page-control-scale,1)]';
