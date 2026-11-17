// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file topNavHeadingClasses.ts
 * @input The column track the heading needs and the mode its root is in
 * @output Tailwind utility class names for the heading root, its column
 *   tracks, its text lines and links, its chevron, and its popover
 * @position Style primitives; scanned by the Tailwind build
 *
 * The text track can shrink to zero, so the logo and the chevron row keep their
 * width while a long heading truncates.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 * - /packages/core/src/TopNav/TopNav.test.tsx
 */

import {tw} from '../utils/tw';

const ROOT_CLASSES = tw(
  'grid grid-flow-col justify-start items-center gap-2',
  'min-h-8 min-w-0 ps-2 pe-2 py-0 box-border',
  // A leading NavIcon already carries its own inline spacing.
  '[&:has(.astryx-nav-icon)]:ps-0',
  'no-underline text-[color:var(--color-text-primary)] cursor-default',
);

/**
 * The heading root's column tracks.
 *
 * Linked lines wrap, so a linked heading keeps its longest word: a link is
 * never clipped to nothing, and no hidden words grow the bar. The chevron
 * track stops at the chevron box plus the gap before it, so a crowded bar
 * cannot cover the chevron.
 */
export type TopNavHeadingColumns =
  | 'withLogo'
  | 'text'
  | 'withLogoAndLinks'
  | 'withLinks'
  | 'withLogoAndMenu'
  | 'withMenu';

const COLUMNS_CLASS: Record<TopNavHeadingColumns, string> = {
  withLogo: '[grid-template-columns:auto_minmax(0,1fr)]',
  text: '[grid-template-columns:minmax(0,1fr)]',
  withLogoAndLinks: '[grid-template-columns:auto_minmax(min-content,1fr)]',
  withLinks: '[grid-template-columns:minmax(min-content,1fr)]',
  withLogoAndMenu:
    '[grid-template-columns:auto_minmax(calc(var(--spacing-7)_+_var(--spacing-1)),1fr)]',
  withMenu:
    '[grid-template-columns:minmax(calc(var(--spacing-7)_+_var(--spacing-1)),1fr)]',
};

const CONTROL_CLASSES = tw(
  'rounded-[var(--radius-element)] border-0 border-none bg-transparent',
  '[font-family:inherit] [font-size:inherit]',
  '[font-weight:var(--font-weight-normal)] text-start cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

const INTERACTIVE_CLASSES = tw(
  CONTROL_CLASSES,
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]',
);

const LOGO_CLASSES = 'shrink-0 flex items-center justify-center';

const TEXT_CONTAINER_CLASSES = 'flex flex-col min-w-0';

const SUPPORTING_LINE_CLASSES = tw(
  '[font-size:var(--text-supporting-size)]',
  '[line-height:var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)] no-underline',
  'overflow-hidden text-ellipsis whitespace-nowrap',
);

const TITLE_CLASSES = tw(
  '[font-size:var(--text-large-size)] [line-height:var(--text-large-leading)]',
  '[font-weight:var(--font-weight-semibold)]',
  'text-[color:var(--color-text-primary)] no-underline',
  'overflow-hidden text-ellipsis whitespace-nowrap',
);

const TITLE_ROW_CLASSES = 'flex items-center gap-1';

const TITLE_LINK_CLASSES =
  'no-underline [color:inherit] overflow-hidden text-ellipsis whitespace-nowrap';

/**
 * Clip the link itself. The column stays overflow visible, so the link's own
 * focus ring is not cut off.
 */
const LINKED_LINE_CLASSES = 'min-w-0 max-w-full overflow-hidden';

const CHEVRON_CLASSES = tw(
  'shrink-0 flex items-center justify-center min-w-7 min-h-7',
  'text-[color:var(--color-icon-secondary)]',
);

/**
 * The registry chevron is a 1em SVG, so it has always rendered at the
 * heading's inherited font size. Icon's size box would repin it to a fixed rem
 * (the nearest, sm, is 1rem = 16px vs the 14px base here), so the glyph holds
 * the inherited em while the 28px chevron box above stays unchanged.
 */
const CHEVRON_GLYPH_CLASSES = 'w-[1em] h-[1em] [font-size:inherit]';

const END_CONTENT_CLASSES = 'shrink-0 flex items-center ms-auto';

const POPOVER_CONTENT_CLASSES = 'p-1 overflow-hidden';

const POPOVER_HEADING_CLASSES = tw(
  'flex items-center gap-2 w-full min-h-8 ps-2 pe-2 py-0',
  'border-0 border-none bg-transparent',
  '[font-family:inherit] [font-size:inherit] [color:inherit] text-start',
  'mt-1 mb-2 mx-1',
  '[&:has(.astryx-nav-icon)]:ps-0',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

const POPOVER_CHEVRON_CLASSES = 'rotate-180';

/**
 * The panel covers the trigger's box and reaches past it on the inline end, so
 * the heading behind it is covered while the menu is open.
 */
const POPOVER_ANCHOR_CLASSES = tw(
  'min-w-[calc(anchor-size(width)+16px)]',
  '[margin-block-start:calc(-1*anchor-size(height)-8px)]',
  '-ms-2',
);

/** The heading root: an inline grid of logo, text and end slots. */
export function topNavHeadingClassName(): string {
  return ROOT_CLASSES;
}

/** The column tracks the heading's own content asks for. */
export function topNavHeadingColumnsClassName(
  columns: TopNavHeadingColumns,
): string {
  return COLUMNS_CLASS[columns];
}

/** A control that opens the product menu: no fill of its own. */
export function topNavHeadingMenuTriggerClassName(): string {
  return CONTROL_CLASSES;
}

/** A control with a pointer hover fill. */
export function topNavHeadingInteractiveClassName(): string {
  return INTERACTIVE_CLASSES;
}

/** The logo slot keeps its width whatever the text does. */
export function topNavHeadingLogoClassName(): string {
  return LOGO_CLASSES;
}

/** The text column stacks the supporting lines around the title. */
export function topNavHeadingTextContainerClassName(): string {
  return TEXT_CONTAINER_CLASSES;
}

/** A superheading or subheading line: one clipped, quiet line. */
export function topNavHeadingSupportingLineClassName(): string {
  return SUPPORTING_LINE_CLASSES;
}

/** The title line, which is the loudest text in the heading. */
export function topNavHeadingTitleClassName(): string {
  return TITLE_CLASSES;
}

/** The title and its chevron share one row. */
export function topNavHeadingTitleRowClassName(): string {
  return TITLE_ROW_CLASSES;
}

/** A linked title, clipped the way its plain-text sibling is. */
export function topNavHeadingTitleLinkClassName(): string {
  return TITLE_LINK_CLASSES;
}

/** A supporting line that is a link keeps the clip off its column. */
export function topNavHeadingLinkedLineClassName(): string {
  return LINKED_LINE_CLASSES;
}

/** The chevron box reserves the track the menu column keeps. */
export function topNavHeadingChevronClassName(): string {
  return CHEVRON_CLASSES;
}

/** The glyph itself stays on the inherited em. */
export function topNavHeadingChevronGlyphClassName(): string {
  return CHEVRON_GLYPH_CLASSES;
}

/** The end slot sits at the inline end of the heading row. */
export function topNavHeadingEndContentClassName(): string {
  return END_CONTENT_CLASSES;
}

/** The popover's own surface padding. */
export function topNavHeadingPopoverContentClassName(): string {
  return POPOVER_CONTENT_CLASSES;
}

/** The product identity row at the top of the menu. */
export function topNavHeadingPopoverHeadingClassName(): string {
  return POPOVER_HEADING_CLASSES;
}

/** The popover copy of the chevron points back at its trigger. */
export function topNavHeadingPopoverChevronClassName(): string {
  return POPOVER_CHEVRON_CLASSES;
}

/** The overlap that puts the panel over the heading it belongs to. */
export function topNavHeadingPopoverAnchorClassName(): string {
  return POPOVER_ANCHOR_CLASSES;
}

/** The chevron and its glyph together, for the trigger and the plain marker. */
export function topNavHeadingChevronWithGlyphClassName(): string {
  return tw(CHEVRON_CLASSES, CHEVRON_GLYPH_CLASSES);
}

/** The popover copy: the same chevron and glyph, flipped. */
export function topNavHeadingPopoverChevronWithGlyphClassName(): string {
  return tw(CHEVRON_CLASSES, CHEVRON_GLYPH_CLASSES, POPOVER_CHEVRON_CLASSES);
}
