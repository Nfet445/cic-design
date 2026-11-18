// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file circularProgressClasses.ts
 * @input Accepts nothing: every class is fixed. The ring's geometry (diameter,
 *   stroke width, radius, dash lengths, viewBox, turn angles) stays on the SVG
 *   markup as attributes, and a turn is an inline `transform`
 * @output The utility class strings the root, the ring, its track, the
 *   determinate fill's layers and caps, the centered content, the label, the
 *   value label and the two stroke variants carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * A look that changes a colour is one complete class: two classes setting
 * `color` (or `stroke`) would be ordered by the sheet, not by the class
 * attribute. The track's base class sets only `fill`, so each track variant
 * adds the one `stroke` both read.
 *
 * The fill's `transition-property: none` is what ships: the component reads the
 * duration and easing back off the element and drives the change with Web
 * Animations, so nothing transitions on its own.
 */

import {tw} from '../tw';

export const circularProgressRootClassName = tw(
  'relative inline-flex shrink-0 items-center justify-center',
);

export const circularProgressRootWithLabelClassName = 'flex-col gap-1';

/** The determinate ring: an SVG drawn rotated so 0 starts at 12 o'clock. */
export const circularProgressRingClassName = tw(
  'block [transform:rotate(-90deg)]',
);

/** Indeterminate mode keeps the arc upright; the rotor turns it instead. */
export const circularProgressRingIndeterminateClassName = 'block';

export const circularProgressTrackClassName = 'fill-none';

/** One `stroke` each, so no two classes on the circle set it. */
export const circularProgressTrackClassNames = {
  accent: 'stroke-[color:var(--color-accent-muted)]',
  success: 'stroke-[color:var(--color-success-muted)]',
  warning: 'stroke-[color:var(--color-warning-muted)]',
  error: 'stroke-[color:var(--color-error-muted)]',
  neutral: 'stroke-[color:var(--color-track)]',
} as const;

export const circularProgressFillClassName = tw(
  'absolute inset-0 overflow-hidden pointer-events-none',
  'transition-none duration-[var(--duration-medium)] ease-[var(--ease-standard)]',
);

/** The stroke is also inherited from the theming target's own rule; these
 * classes carry the colour for a theme that paints none. */
export const circularProgressFillClassNames = {
  accent: 'stroke-[color:var(--color-accent)]',
  success: 'stroke-[color:var(--color-text-success)]',
  warning: 'stroke-[color:var(--color-text-warning)]',
  error: 'stroke-[color:var(--color-text-error)]',
  neutral: 'stroke-[color:var(--color-text-disabled)]',
  disabled: 'stroke-[color:var(--color-text-disabled)]',
} as const;

/** Each half of the box clips the layer turning inside it. */
export const circularProgressFillHalfClassName =
  'absolute top-0 h-full w-1/2 overflow-hidden';

export const circularProgressFillHalfRightClassName = 'left-1/2';

export const circularProgressFillHalfLeftClassName = 'left-0';

/** A layer the size of the ring inside its half, so it turns about the center. */
export const circularProgressFillTurnClassName = tw(
  'absolute top-0 h-full w-[200%]',
  'will-change-[transform,opacity]',
);

export const circularProgressFillTurnRightClassName = 'left-[-100%]';

export const circularProgressFillTurnLeftClassName = 'left-0';

export const circularProgressFillCapClassName = tw(
  'absolute inset-0',
  'will-change-[transform,opacity]',
);

/**
 * The drawing reaches past the ring's box so its antialiased outer edge is
 * drawn whole before the layer turns; `-m-[2px]` is `FILL_BLEED` in
 * `CircularProgress.tsx`, which the viewBox needs as a number.
 */
export const circularProgressFillShapeClassName = tw(
  'block fill-none -m-[2px]',
);

export const circularProgressFillCapShapeClassName = tw(
  'block fill-none [stroke-linecap:round]',
);

export const circularProgressFillIndeterminateClassName = tw(
  'fill-none [stroke-linecap:round]',
);

export const circularProgressChildrenClassName = tw(
  'absolute inset-0 flex items-center justify-center pointer-events-none',
);

/** A shown label, hidden while `isLabelHidden` keeps it for screen readers. */
export const circularProgressLabelClassName = tw(
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)] font-medium',
  'text-[color:var(--color-text-secondary)]',
);

export const circularProgressLabelDisabledClassName = tw(
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)] font-medium',
  'text-[color:var(--color-text-disabled)]',
);

export const circularProgressValueLabelClassName = tw(
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)] font-normal',
  'text-[color:var(--color-text-secondary)]',
);

export const circularProgressValueLabelDisabledClassName = tw(
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)] font-normal',
  'text-[color:var(--color-text-disabled)]',
);

export const circularProgressVisuallyHiddenClassName = tw(
  'absolute h-px w-px overflow-hidden p-0 -m-px',
  '[clip:rect(0,0,0,0)] whitespace-nowrap border-0',
);

export const circularProgressRingWrapperClassName = 'relative inline-flex';
