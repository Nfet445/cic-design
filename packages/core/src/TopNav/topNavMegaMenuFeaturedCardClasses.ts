// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavMegaMenuFeaturedCardClasses.ts
 * @input The slots the featured card renders
 * @output Tailwind utility class names for the card, its image, body and CTA
 * @position Style primitives; scanned by the Tailwind build
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/TopNav/TopNav.test.tsx
 */

const CARD_CLASSES = 'flex flex-col';
const IMAGE_CLASSES = 'w-full h-[140px] object-cover block';
const BODY_CLASSES = 'flex flex-col gap-2 p-4';
const TITLE_CLASSES =
  'text-[color:var(--color-text-primary)] text-[length:var(--text-label-size)] leading-[var(--text-label-leading)] [font-weight:var(--font-weight-semibold)]';
const DESCRIPTION_CLASSES =
  'text-[color:var(--color-text-secondary)] text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]';
const LINK_CLASSES =
  'text-[color:var(--color-text-accent)] text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)] [font-weight:var(--font-weight-semibold)] no-underline';

/** The card column that holds the image above the body. */
export function topNavFeaturedCardClassName(): string {
  return CARD_CLASSES;
}

/** The image fills the card's inline size and keeps a fixed block size. */
export function topNavFeaturedCardImageClassName(): string {
  return IMAGE_CLASSES;
}

/** The text column under the image. */
export function topNavFeaturedCardBodyClassName(): string {
  return BODY_CLASSES;
}

/** The card title. */
export function topNavFeaturedCardTitleClassName(): string {
  return TITLE_CLASSES;
}

/** The card description. */
export function topNavFeaturedCardDescriptionClassName(): string {
  return DESCRIPTION_CLASSES;
}

/** The call-to-action link. */
export function topNavFeaturedCardLinkClassName(): string {
  return LINK_CLASSES;
}

/** The arrow needs a box of its own so a transform can mirror it. */
export function topNavFeaturedCardLinkArrowClassName(): string {
  return 'inline-block';
}
