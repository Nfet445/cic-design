// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file richTextToolbarClasses.ts
 * @input Uses Tailwind utilities and Astryx design tokens
 * @output Exports the rich text toolbar's literal class strings
 * @position Read by RichTextEditorToolbar.tsx for the link anchor, the group
 *   separators, the glyphs, and the scrolling row of controls
 */

import {tw} from './tw';

// The link popover's anchor: a box around the Link button that takes no space
// of its own.
export const toolbarLinkAnchorClassName = tw('inline-flex', 'flex-shrink-0');

// A vertical Divider's default 100% height needs a definite parent height.
// Toolbar slots are sized by their controls instead, so these group separators
// stretch across the slot's resolved height.
export const toolbarDividerClassName = tw(
  '[align-self:stretch]',
  '[height:auto]',
);

// A transform needs a box, so the wrapper is inline-flex and the mirror
// applies.
export const toolbarGlyphDirectionalClassName = tw('inline-flex');

export const toolbarGlyphTextClassName = tw(
  '[font-size:var(--text-supporting-size)]',
  '[font-weight:var(--font-weight-bold)]',
  '[font-variant-numeric:tabular-nums]',
);

// Core Toolbar owns an 8px block inset. This transparent RichText-only
// surface overlaps 4px of that inset at each block edge, so its controls and
// the editor body below keep a 4px visual gutter.
export const toolbarCompactClassName = tw(
  '[--astryx-section-padding-inline-start:var(--spacing-1)]',
  '[--astryx-section-padding-inline-end:var(--spacing-1)]',
  '[margin-block-start:calc(-1_*_var(--spacing-1))]',
  '[margin-block-end:calc(-1_*_var(--spacing-1))]',
);

// The row scrolls when it runs out of room, so a control keeps its own width.
export const toolbarFixedSlotClassName = tw('flex', 'flex-shrink-0');

// A Selector's field may shrink, which squeezes its label to a sliver, so it
// sits in a slot that may not.
export const toolbarActionsClassName = tw(
  '[flex:1_1_0%]',
  'w-0',
  'max-w-full',
  'min-w-0',
  'overflow-x-auto',
  'overflow-y-hidden',
  '[overscroll-behavior-x:contain]',
  '[scrollbar-width:thin]',
);
