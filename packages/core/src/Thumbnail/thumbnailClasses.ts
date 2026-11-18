// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file thumbnailClasses.ts
 * @input Nothing — literal Tailwind class strings
 * @output Thumbnail's class map: the root, the image frame, the image, the
 *   inset border, the placeholder, the interactive frame with its hover and
 *   press layer, the remove slot and button, the disabled dimming and the
 *   upload overlay
 * @position Static styling for Thumbnail.tsx; scanned by
 *   `tailwind/astryx.input.css` to build `astryx-tailwind.css`
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

export const thumbnailRootClassName =
  'relative inline-flex flex-col w-16 shrink-0 isolate';

export const thumbnailImageContainerClassName = tw(
  'relative w-full aspect-square overflow-hidden',
  'rounded-[var(--radius-element)]',
  'bg-[var(--color-neutral)]',
);

export const thumbnailImageClassName = 'block w-full h-full object-cover';

export const thumbnailInsetBorderClassName = tw(
  'absolute inset-0 pointer-events-none',
  'rounded-[inherit]',
  'shadow-[inset_0_0_0_1px_var(--color-border)]',
);

export const thumbnailPlaceholderClassName = tw(
  'flex items-center justify-center w-full h-full',
  'text-[var(--color-icon-secondary)]',
);

export const thumbnailInteractiveClassName =
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default';

export const thumbnailInteractiveButtonClassName = tw(
  'block w-full h-full overflow-hidden',
  'rounded-[var(--radius-element)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the press attribute has to appear literally in a class name; the owner
   module cannot supply it through interpolation. */
/**
 * Hover and pressed overlay — the exact same treatment as ClickableCard and
 * SelectableCard. The `::after` layer paints the hover and mouse states as its
 * colour, `--_press-overlay`, which their arms set on the element itself.
 * Hover is guarded by `@media (hover: hover)`, so touch devices show no stuck
 * hover state; under a coarse pointer the mouse `:active` colour is dropped,
 * because the press controller paints instead.
 *
 * The press the controller paints is the same layer's image, keyed on the
 * `data-astryx-press` attribute the controller writes. Every arm of that press
 * is a plain property of the `::after`, which outranks the layer's own defaults
 * in a layered stylesheet and a flat one alike. A custom property's attribute
 * arm does not, so the press changes the layer's own colour and image rather
 * than the property the arms would otherwise set.
 */
export const thumbnailOverlayClassName = tw(
  '[--_press-overlay:transparent]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:pointer-coarse:active:[--_press-overlay:transparent]',
  '[&:where(:not(:disabled,[aria-disabled=true]))]:active:[--_press-overlay:var(--color-overlay-pressed)]',
  // The media arm comes first and the enabled guard sits inside it, so a
  // hovered enabled thumbnail is the only match. `[&:hover:where(...)]` is the
  // spelling the scanner emits; splitting it into `:hover` followed by
  // `:where(...)` emits no rule.
  '[@media(hover:hover)]:[&:where(:not(:disabled,[aria-disabled=true]))]:hover:[--_press-overlay:var(--color-overlay-hover)]',
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

export const thumbnailRemoveSlotClassName = tw(
  'absolute z-[1] leading-[0]',
  'top-[var(--spacing-1)] end-[var(--spacing-1)]',
);

/**
 * The remove button's corner, size and scrim paint. Button paints the same
 * properties with its own utilities, so each class names `astryx-button` a
 * second time and wins by specificity rather than sheet order.
 *
 * Fixed colours instead of the luminance-adapting theme: a translucent scrim
 * (--color-overlay) plus an --color-on-dark icon reads on any image without
 * sampling pixel brightness. The `::after` is the coarse pointer's hit area.
 */
export const thumbnailRemoveButtonClassName = tw(
  '[&.astryx-button]:[--_button-radius:calc(var(--radius-element)-var(--spacing-1))]',
  '[&.astryx-button]:relative',
  '[&.astryx-button]:h-5',
  '[&.astryx-button]:min-w-5',
  '[&.astryx-button]:bg-[var(--color-overlay)]',
  '[&.astryx-button]:text-[color:var(--color-on-dark)]',
  '[--_thumbnail-hit-inset:0px] pointer-coarse:[--_thumbnail-hit-inset:-2px]',
  'after:content-[""] after:absolute after:inset-[var(--_thumbnail-hit-inset)]',
);

export const thumbnailDisabledClassName = 'opacity-50 pointer-events-none';

export const thumbnailUploadOverlayClassName = tw(
  'absolute inset-0 z-[1] flex items-center justify-center',
  'rounded-[inherit] leading-[0]',
  'bg-[var(--color-overlay)]',
);
