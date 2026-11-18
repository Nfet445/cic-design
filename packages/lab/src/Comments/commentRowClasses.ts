// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentRowClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings a comment row and its header carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

export const commentRowThreadRowsClassName = tw('relative', 'isolate');

/** One avatar tall, so revealing the header actions never changes the row's height. */
export const commentRowHeaderClassName = tw(
  'h-[calc(var(--spacing-6)+var(--spacing-1))]',
  'min-h-[calc(var(--spacing-6)+var(--spacing-1))]',
);

/** The header's actions take whatever room the name and time leave. */
export const commentRowMetadataClassName = tw(
  'grow-0 shrink basis-auto',
  'min-w-0',
);

/** Leaves the more menu its button however long the name. */
export const commentRowMetadataBesideActionsClassName =
  'max-w-[calc(100%-var(--spacing-6)-var(--spacing-1))]';

export const commentRowAuthorNameClassName = tw('shrink', 'min-w-0');

export const commentRowAgentBadgeClassName = 'shrink-0';

export const commentRowActionsRevealClassName = tw(
  'grow shrink basis-0',
  'min-w-0',
);

export const commentRowTypingIndicatorClassName = 'w-full';

/**
 * Row controls carry one spacing step of inline padding. Pulling the row back
 * by that step puts their glyphs on the body text line, so only their hover
 * and pressed fills cross it.
 */
export const commentRowControlRowBleedClassName = '-ms-2';

/** A selectable surface takes the pointer; a disabled one drops it. */
export const commentRowSurfaceClassName =
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default';

/**
 * A selected thread keeps `Card`'s default variant and takes the muted fill.
 * The repeated attribute doubles the class's specificity, so the fill beats the
 * variant's own `bg-[var(--color-background-card)]` whatever order the two
 * rules print in.
 */
export const commentRowSelectedFillClassName =
  '[&[data-thread-surface=card][data-thread-surface=card]]:[background-color:var(--color-background-muted)]';

/**
 * Forced colors drops the muted fill, so a selected thread keeps a visible
 * outline there. The repeated attribute doubles the class's specificity, so the
 * outline beats `commentRowFocusRingClassName` whatever order the two rules
 * print in.
 */
export const commentRowSelectedForcedColorsClassName = tw(
  '[&[data-thread-surface][data-thread-surface]]:forced-colors:[outline-style:solid]',
  '[&[data-thread-surface][data-thread-surface]]:forced-colors:[outline-width:calc(var(--border-width)*2)]',
  '[&[data-thread-surface][data-thread-surface]]:forced-colors:[outline-color:Highlight]',
  '[&[data-thread-surface][data-thread-surface]]:forced-colors:[outline-offset:calc(var(--border-width)*-2)]',
);

/**
 * The system ring on the surface while the row's hidden toggle holds focus.
 * That toggle is clicked, not tabbed to, so `:focus-visible` never matches it
 * and the ring follows the row's own focus state instead.
 */
export const commentRowFocusRingClassName = tw(
  '[outline-style:var(--focus-outline-style)]',
  '[outline-width:var(--focus-outline-width)]',
  '[outline-color:var(--focus-outline-color)]',
  '[outline-offset:var(--focus-outline-offset)]',
);
