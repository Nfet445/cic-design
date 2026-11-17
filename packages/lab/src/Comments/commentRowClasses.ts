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
