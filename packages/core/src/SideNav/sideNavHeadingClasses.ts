// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sideNavHeadingClasses.ts
 * @input The theme's spacing, type-scale, radius and colour variables
 * @output The utility class strings the heading row, its text lines, its
 *   chevron and its popover carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * Every class is a literal so the build can scan it. A zone that answers a
 * state adds the state's class beside its own, never a computed name.
 */

import {tw} from '../utils/tw';

/**
 * A control the heading's own links and triggers share: no fill, no border,
 * and the heading's inherited type.
 */
const CONTROL_CLASSES = tw(
  'rounded-[var(--radius-element)] border-0 border-none bg-transparent',
  '[font-family:inherit] [font-size:inherit]',
  '[font-weight:var(--font-weight-normal)] text-start cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

/**
 * The box both root states share. The expanded row adds its inline padding and
 * the collapsed one zeroes it, so no later class has to outrank an earlier one.
 */
const ROOT_FRAME = tw(
  'flex items-center gap-2 min-h-8 box-border',
  'no-underline [color:inherit] cursor-default',
);

export const sideNavHeadingClassName = {
  /** The expanded heading: icon, text track, chevron. */
  root: tw(ROOT_FRAME, 'ps-2 pe-2 py-0', '[&:has(.astryx-nav-icon)]:ps-0'),
  /** The collapsed rail row holds only its icon, centered. */
  collapsedRoot: tw(ROOT_FRAME, 'justify-center p-0'),
  /** A control with a pointer hover fill. */
  interactive: tw(
    CONTROL_CLASSES,
    '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]',
  ),
  /** The chevron trigger: a control with no hover fill of its own. */
  menuTrigger: CONTROL_CLASSES,
  icon: 'shrink-0 flex items-center justify-center',
  textContainer: 'flex flex-col flex-1 min-w-0',
  /** A superheading or subheading line: one clipped, quiet line. */
  supportingLine: tw(
    '[font-size:var(--text-supporting-size)]',
    '[line-height:var(--text-supporting-leading)]',
    'text-[color:var(--color-text-secondary)]',
    'no-underline overflow-hidden text-ellipsis whitespace-nowrap',
  ),
  /** The heading line, which is the loudest text in the row. */
  heading: tw(
    '[font-size:var(--text-large-size)] [line-height:var(--text-large-leading)]',
    '[font-weight:var(--font-weight-semibold)]',
    'text-[color:var(--color-text-primary)]',
    'no-underline overflow-hidden text-ellipsis whitespace-nowrap',
  ),
  /** The heading and the chevron beside it share one line. */
  headingRow: 'flex items-center gap-1',
  /** A linked heading, clipped the way its plain-text sibling is. */
  headingLink:
    'no-underline [color:inherit] overflow-hidden text-ellipsis whitespace-nowrap',
  /** The chevron box: a 28px hit area around a glyph that keeps its size. */
  chevron: tw(
    'shrink-0 flex items-center justify-center min-w-7 min-h-7',
    'text-[color:var(--color-icon-secondary)] [font-size:inherit]',
  ),
  /** The glyph inside a trigger that already owns the box and the color. */
  chevronGlyph: '[font-size:inherit]',
  /** The link half of a heading row that also carries end content. */
  linkBesideEndContent: tw(
    'flex items-center self-stretch gap-2 grow min-w-0',
    'no-underline [color:inherit]',
  ),
  headerEndContent: 'shrink-0 flex items-center ms-auto',
  popoverContent: 'p-1 overflow-hidden',
  /** The heading replica at the top of the menu, clickable to close it. */
  popoverHeading: tw(
    'flex items-center gap-2 w-full min-h-8 ps-2 pe-2 py-0',
    'border-0 border-none bg-transparent',
    '[font-family:inherit] [font-size:inherit] [color:inherit] text-start',
    'mt-1 mb-2 mx-1',
    '[&:has(.astryx-nav-icon)]:ps-0',
    'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  ),
  /** The popover copy of the chevron points back at its trigger. */
  popoverChevron: tw(
    'shrink-0 flex items-center justify-center min-w-7 min-h-7',
    'text-[color:var(--color-icon-secondary)] [font-size:inherit]',
    'rotate-180',
  ),
  /** The panel matches the heading's width, a step below it. */
  popover: '[min-width:anchor-size(width)] mt-1',
  /** The panel covers its trigger, so the heading appears in place. */
  popoverOverlap: tw(
    'min-w-[calc(anchor-size(width)+16px)]',
    '[margin-block-start:calc(-1*anchor-size(height)-8px)]',
    '-ms-2',
  ),
};
