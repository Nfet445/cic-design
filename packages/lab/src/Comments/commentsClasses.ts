// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentsClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the panel root, its timeline, the edge
 *   bleed that takes the timeline to a card's edge, and the docked composer
 *   carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

export const commentsRootClassName = 'min-h-0 overflow-hidden';

export const commentsTimelineClassName = 'relative z-0 isolate';

/**
 * A card parent's Sections bleed to the panel's edges through the message
 * list's padding: one list padding step back on each inline side, and the
 * list's block start padding back above.
 */
export const commentsTimelineBleedCompactClassName = tw(
  'w-[calc(100%+var(--spacing-3)*2)]',
  '-mx-3 -mt-2',
);

export const commentsTimelineBleedBalancedClassName = tw(
  'w-[calc(100%+var(--spacing-4)*2)]',
  '-mx-4 -mt-4',
);

/**
 * ChatLayout's dock pads one spacing step less than ChatMessageList, so a
 * docked composer would stick out past the threads' edge. One step of inset
 * restores it.
 */
export const commentsComposerDockClassName = 'px-1';
