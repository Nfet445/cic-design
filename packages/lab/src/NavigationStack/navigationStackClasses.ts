// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file navigationStackClasses.ts
 * @input Accepts nothing: the bar, the cards and the veil have fixed shapes
 * @output Utility class strings for the stack, its bar, its cards and their
 *   dimming
 * @position Style primitives for NavigationStack.tsx; the Tailwind build
 *   scans it for class names
 *
 * The dimming's alpha is per frame, so `navigationStackDimColorClassName`
 * reads `--_navigation-dim-alpha`: NavigationStack sets it inline.
 */

export const navigationStackClassName =
  'relative h-full w-full overflow-hidden bg-[var(--color-background-body)]';

/** The bar overlays the screens, which scroll under it. */
export const navigationStackBarClassName =
  'absolute inset-x-0 top-0 isolate z-[1] h-11';

/**
 * The bar's own background and hairline, under every screen's bar layer. A
 * finger sees neither: the content shows through until the screen's scroll
 * edge effect veils it. A mouse keeps both.
 */
export const navigationStackBarBackgroundClassName =
  'absolute inset-0 z-[-2] border-b border-solid border-b-[color:var(--color-border)] bg-[var(--color-background-surface)] [@media(pointer:coarse)]:border-b-0 [@media(pointer:coarse)]:bg-transparent';

/** Each screen's bar moves with its screen, under the back button. */
export const navigationStackBarLayerClassName = 'absolute inset-0 z-[-1]';

export const navigationStackBarLayerCoveredClassName = 'pointer-events-none';

export const navigationStackBarClipClassName =
  'absolute inset-0 overflow-hidden';

export const navigationStackBarRowClassName =
  'absolute inset-0 grid grid-cols-[1fr_auto_1fr] items-center px-4';

export const navigationStackBarLayerBackgroundClassName =
  'absolute inset-x-0 top-0 bottom-px z-[-1] bg-[var(--color-background-surface)] [@media(pointer:coarse)]:bg-transparent';

export const navigationStackBarStartClassName = 'flex min-w-0 justify-start';

export const navigationStackBarTitleClassName =
  'm-0 min-w-0 truncate text-[length:var(--font-size-lg)] font-semibold';

export const navigationStackBarEndClassName = 'flex min-w-0 justify-end';

/**
 * The large title in the scroller. The scroller clips its sides, so the
 * focus ring draws inside the title.
 */
export const navigationStackLargeTitleClassName =
  'm-0 px-4 pt-1 pb-2 text-[length:var(--font-size-4xl)] font-bold leading-[var(--text-display-2-leading)] outline-offset-0 focus-visible:outline-offset-[calc(-1*var(--focus-outline-width))]';

export const navigationStackBackControlClassName =
  'absolute start-4 top-0 bottom-0 flex items-center';

/** A 44pt circle holding only the chevron; the previous title names it. */
export const navigationStackBackClassName =
  'inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-solid border-[color:var(--color-border)] bg-[var(--color-background-surface)] p-0 text-[color:var(--color-text-accent)] disabled:cursor-default aria-disabled:cursor-default';

export const navigationStackBackIconClassName = 'rtl:[transform:scaleX(-1)]';

export const navigationStackCardsClassName = 'absolute inset-0';

export const navigationStackCardClassName =
  'absolute inset-0 overflow-hidden bg-[var(--color-background-body)]';

export const navigationStackCardHiddenClassName = '[content-visibility:hidden]';

/**
 * The screen's scroll container. A sideways drag is the back swipe's; a
 * horizontal scroller inside the content keeps its own native scrolling.
 */
export const navigationStackScrollerClassName =
  'absolute inset-0 box-border pt-11 scroll-pt-11 [touch-action:pan-y_pinch-zoom] outline-offset-0 focus-visible:outline-offset-[calc(-1*var(--focus-outline-width))]';

/**
 * The scroll edge sentinel stays at its static position, just above the
 * content: the scroller is its containing block, so it scrolls with the
 * content and the screen's first element keeps :first-child.
 */
export const navigationStackEdgeSentinelStaticClassName = 'top-auto start-auto';

/**
 * On a large-title screen the sentinel follows the large title and ends
 * where the title ends, so the veil comes on as the bar's title takes over.
 * The margin is the sentinel's 10px height.
 */
export const navigationStackEdgeSentinelAfterLargeTitleClassName =
  'top-auto start-auto -mt-2.5';

export const navigationStackDimClassName =
  'absolute inset-0 pointer-events-none opacity-0';

/** A bar's dimming ends above its hairline, as its background does. */
export const navigationStackBarDimClassName = 'bottom-px';

/**
 * UIKit's parallax dimming is black at the table's measured alpha in every
 * appearance; it is not a theme colour.
 */
export const navigationStackDimColorClassName =
  // eslint-disable-next-line @astryx/no-raw-color -- See above: not a theme colour
  'bg-[rgba(0,0,0,var(--_navigation-dim-alpha))]';
