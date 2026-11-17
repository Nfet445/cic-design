// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file avatarStatusDotClasses.ts
 * @input The status dot variant
 * @output Utility class strings for the dot plate and its icon box
 * @position Style primitives; scanned by the Tailwind build
 *
 * The dot's size and border width depend on the avatar's size, so they ride
 * two inline custom properties (`--astryx-status-dot-size`,
 * `--astryx-status-dot-border`) that the classes read. The variant colour is
 * a class: the plate and the ink it draws move together, so a glyph painted
 * in `currentColor` can never fall out of contrast with its plate.
 */

import {tw} from '../utils/tw';

/** Names of the per-instance custom properties this component writes. */
export const STATUS_DOT_SIZE_VARIABLE = '--astryx-status-dot-size';
export const STATUS_DOT_BORDER_VARIABLE = '--astryx-status-dot-border';
export const STATUS_DOT_ICON_VARIABLE = '--astryx-status-dot-icon-size';

const dotClassName = tw(
  'flex items-center justify-center box-border rounded-full border-solid',
  'border-[color:var(--color-background-surface)]',
  'size-[var(--astryx-status-dot-size)] border-[length:var(--astryx-status-dot-border)]',
);

const variantClassName: Record<string, string> = {
  success: 'bg-[var(--color-success)] text-[color:var(--color-on-success)]',
  // A hollow shape only reads as hollow if its interior is not the variant
  // colour, so the plate is surface and the colour moves to the stroke.
  neutral:
    'bg-[var(--color-background-surface)] text-[color:var(--color-text-secondary)]',
  error: 'bg-[var(--color-error)] text-[color:var(--color-on-error)]',
};

const iconClassName =
  'flex items-center justify-center leading-none size-[var(--astryx-status-dot-icon-size)]';

export {
  dotClassName as avatarStatusDotClassName,
  iconClassName as avatarStatusDotIconClassName,
  variantClassName as avatarStatusDotVariantClassName,
};
