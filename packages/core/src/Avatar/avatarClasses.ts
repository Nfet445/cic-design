// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file avatarClasses.ts
 * @input The avatar's resolved pixel size and shape, whether it is interactive,
 *   grouped, and where its status slot sits
 * @output Utility class strings for the avatar box, its clipping content cell,
 *   its image and fallback, its interactive reset and its status slot
 * @position Style primitives; scanned by the Tailwind build
 *
 * The shape's radius and the group's ring and overlap stay StyleX
 * (`shapeStyles`, `avatarGroupRing.stylex.ts`): a theme reads the radius
 * variable there, and a group's step is a declaration AvatarGroup reads back.
 * The size, the initials and the status offset are per-instance numbers, so
 * they ride four inline custom properties that these classes read.
 */

import {tw} from '../utils/tw';

/** Names of the per-instance custom properties this component writes. */
export const avatarVars = {
  size: '--astryx-avatar-size',
  initialsSize: '--astryx-avatar-initials-size',
  initials: '--astryx-avatar-initials',
  statusInset: '--astryx-avatar-status-inset',
} as const;

/**
 * The avatar box. Its radius reads `--_avatar-radius`, which the shape variant
 * publishes, so the wrapper, the content cell and a grouped ring all take the
 * same corner from one property.
 */
export const avatarRootClassName = tw(
  'relative inline-flex shrink-0',
  'rounded-[var(--_avatar-radius)]',
  'size-[var(--astryx-avatar-size)]',
);

/**
 * Resets the intrinsic styling of the interactive element (`<a>`/`<button>`) to
 * a transparent wrapper around the avatar's visuals.
 */
export const avatarInteractiveClassName = tw(
  'appearance-none m-0 p-0 border-0 bg-transparent text-inherit',
  '[font:inherit] no-underline',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'rounded-[var(--_avatar-radius)]',
);

/**
 * The cell that clips the picture. A custom property cascades to descendants
 * and `border-radius` does not, so the cell reads the same radius again.
 */
export const avatarContentClassName = tw(
  'flex size-full items-center justify-center overflow-hidden select-none',
  'rounded-[var(--_avatar-radius)]',
);

export const avatarImageClassName = 'size-full object-cover';

/**
 * The fallback surface (initials and default icon). Font size comes from the
 * proportional `size × ratio` scale through the variable, so a theme's
 * `.astryx-avatar-fallback[data-size]` rule can still override it per tier.
 */
export const avatarFallbackClassName = tw(
  'flex size-full items-center justify-center',
  'bg-[var(--color-neutral)] text-[color:var(--color-text-primary)]',
  '[font-family:var(--font-family-body)] font-medium uppercase',
  '[font-size:var(--astryx-avatar-initials-size)]',
);

/**
 * A lone avatar's initials and icon take the colour around them in forced
 * colours, so a control that paints itself disabled or selected carries them
 * with it. A grouped face keeps the authored colour: its ring's opaque fill is
 * forced to Canvas, so only CanvasText is sure to read on it.
 */
export const avatarLoneFallbackClassName =
  'forced-colors:text-[color:currentColor]';

export const avatarStatusClassName = 'absolute';

/**
 * On a circle the status sits on the edge at 45°, so its offset is the size's
 * own corner-to-edge distance. `end` anchors to the right in LTR and the left
 * in RTL, so the outward push mirrors with it; the vertical push does not.
 */
export const avatarStatusCircleClassName = tw(
  'bottom-[var(--astryx-avatar-status-inset)] end-[var(--astryx-avatar-status-inset)]',
  '[transform:translate(50%,50%)] rtl:[transform:translate(-50%,50%)]',
);

export const avatarStatusCornerClassName = tw(
  'bottom-0 end-0',
  '[transform:translate(25%,25%)] rtl:[transform:translate(-25%,25%)]',
);

/**
 * The initials are generated content: part of the picture, not text of the
 * control. On a link or a button, visible text the name does not contain fails
 * Label in Name, so newer engines get empty alternative text and older engines
 * draw the plain string the aria-label already names.
 *
 * The content is a per-instance CSS string, so it rides the variable; the
 * build scans this literal, which is why the property is spelled here.
 */
export const avatarInitialsClassName = tw(
  'before:content-[var(--astryx-avatar-initials)]',
  "supports-[content:'a'/'']:before:content-[var(--astryx-avatar-initials)_/_'']",
);
