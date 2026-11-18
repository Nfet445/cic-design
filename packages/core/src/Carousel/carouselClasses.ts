// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file carouselClasses.ts
 * @input The row's gap, inline padding, snap flag and edge-fade arm, plus each
 *   nav pill's edge and whether it is hidden
 * @output Tailwind utility class names for the root, the scroller, an item, the
 *   overlay and one complete class string per pill state
 * @position Internal to Carousel.
 *
 * The scroller and the fade arms both paint `mask-image`, so only one fade arm
 * is ever joined and the base class leaves the property alone. A hidden pill
 * paints `opacity` and `pointer-events` over the visible one, so the pill's
 * class is one string per state rather than two classes that race.
 */

import {tw} from '../utils/tw';

export const carouselRootClassName = tw(
  'relative flex max-w-full min-w-0 items-center overflow-clip',
  '[overflow-clip-margin:1px]',
);

const carouselScrollerBaseClassName = tw(
  'flex items-center overflow-x-auto overflow-y-hidden scroll-smooth',
  'motion-reduce:scroll-auto [overscroll-behavior-x:contain]',
  '[scrollbar-width:none]',
  // One extra pixel of scroll room keeps the tab indicator's bleed visible;
  // the negative margin takes the line back out of the layout.
  'pb-px -mb-px',
);

export const carouselFadeClassName = {
  start: tw(
    '[mask-image:linear-gradient(to_right,transparent_0%,black_var(--spacing-1))]',
    '[&:is([dir="rtl"]_*)]:[mask-image:linear-gradient(to_left,transparent_0%,black_var(--spacing-1))]',
  ),
  end: tw(
    '[mask-image:linear-gradient(to_left,transparent_0%,black_var(--spacing-1))]',
    '[&:is([dir="rtl"]_*)]:[mask-image:linear-gradient(to_right,transparent_0%,black_var(--spacing-1))]',
  ),
  both: '[mask-image:linear-gradient(to_right,transparent_0%,black_var(--spacing-1),black_calc(100%_-_var(--spacing-1)),transparent_100%)]',
} as const;

export const carouselSnapClassName = 'snap-x snap-mandatory';

export const carouselItemClassName = 'flex shrink-0 snap-start';

export const carouselOverlayClassName =
  'flex items-center justify-between pointer-events-none';

const carouselGapClassName = {
  0: 'gap-[var(--spacing-0)]',
  0.5: 'gap-[var(--spacing-0-5)]',
  1: 'gap-[var(--spacing-1)]',
  1.5: 'gap-[var(--spacing-1-5)]',
  2: 'gap-[var(--spacing-2)]',
  3: 'gap-[var(--spacing-3)]',
  4: 'gap-[var(--spacing-4)]',
} as const;

const carouselPaddingClassName = {
  0: 'px-[var(--spacing-0)] scroll-px-[var(--spacing-0)]',
  0.5: 'px-[var(--spacing-0-5)] scroll-px-[var(--spacing-0-5)]',
  1: 'px-[var(--spacing-1)] scroll-px-[var(--spacing-1)]',
  1.5: 'px-[var(--spacing-1-5)] scroll-px-[var(--spacing-1-5)]',
  2: 'px-[var(--spacing-2)] scroll-px-[var(--spacing-2)]',
  3: 'px-[var(--spacing-3)] scroll-px-[var(--spacing-3)]',
  4: 'px-[var(--spacing-4)] scroll-px-[var(--spacing-4)]',
  5: 'px-[var(--spacing-5)] scroll-px-[var(--spacing-5)]',
  6: 'px-[var(--spacing-6)] scroll-px-[var(--spacing-6)]',
  8: 'px-[var(--spacing-8)] scroll-px-[var(--spacing-8)]',
  10: 'px-[var(--spacing-10)] scroll-px-[var(--spacing-10)]',
} as const;

export interface CarouselScrollerClasses {
  gap: keyof typeof carouselGapClassName;
  padding?: keyof typeof carouselPaddingClassName;
  hasSnap: boolean;
  fade?: keyof typeof carouselFadeClassName;
}

/** One complete class string for the scroller's gap, padding and fade state. */
export function carouselScrollerClassName({
  gap,
  padding,
  hasSnap,
  fade,
}: CarouselScrollerClasses): string {
  return tw(
    carouselScrollerBaseClassName,
    carouselGapClassName[gap],
    padding != null && carouselPaddingClassName[padding],
    hasSnap && carouselSnapClassName,
    fade != null && carouselFadeClassName[fade],
  );
}

const carouselPillBaseClassName = tw(
  'flex items-center justify-center',
  'rounded-[var(--radius-full)] bg-[var(--color-background-popover)]',
  'shadow-[var(--shadow-med)]',
  'transition-opacity duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

/**
 * The pill inside the ring: the overlay sits on the top layer, above the
 * root's ring, so the pill clears the ring's offset and width.
 */
const carouselPillEdgeClassName = {
  start: 'ms-[calc(var(--focus-outline-offset)+var(--focus-outline-width))]',
  end: 'me-[calc(var(--focus-outline-offset)+var(--focus-outline-width))]',
} as const;

export function carouselPillClassName(
  edge: keyof typeof carouselPillEdgeClassName,
  isHidden: boolean,
): string {
  return tw(
    carouselPillBaseClassName,
    carouselPillEdgeClassName[edge],
    isHidden
      ? 'pointer-events-none opacity-0'
      : 'pointer-events-auto opacity-100',
  );
}
