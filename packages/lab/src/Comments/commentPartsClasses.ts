// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file commentPartsClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the parts of a comment row carry: the
 *   avatar column, the thread rail, the clamped body, the quote and the row
 *   edges
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

/**
 * Avatars sit on an opaque card-surface disc in every state, including a
 * selected thread's translucent fill, so nothing shows through them.
 */
export const commentPartsAvatarFrameClassName = tw(
  'size-[calc(var(--spacing-6)+var(--spacing-1))] min-w-[calc(var(--spacing-6)+var(--spacing-1))]',
  'relative z-1 overflow-hidden',
  'bg-[color:var(--color-background-card)]',
);

export const commentPartsAvatarFramePersonClassName = 'rounded-full';

export const commentPartsAvatarFrameAgentClassName = 'rounded-md';

export const commentPartsAvatarSpacerClassName = tw(
  'w-[calc(var(--spacing-6)+var(--spacing-1))]',
  'min-w-[calc(var(--spacing-6)+var(--spacing-1))]',
);

export const commentPartsAgentLogoClassName =
  'size-[calc(var(--spacing-6)+var(--spacing-1))] min-w-[calc(var(--spacing-6)+var(--spacing-1))]';

export const commentPartsNoWrapClassName = 'whitespace-nowrap';

export const commentPartsBodyClampedClassName = 'line-clamp-3';

/**
 * Holds for five seconds, then fades over the slow motion token. The badge
 * removes itself when the animation ends so header actions reclaim the
 * trailing edge; the fade's own last frame keeps it out of the accessibility
 * tree meanwhile.
 */
export const commentPartsUnreadBadgeClassName = tw(
  '[animation-name:astryxCommentUnreadBadgeFade]',
  '[animation-delay:5s]',
  '[animation-duration:var(--duration-slow-max)] motion-reduce:[animation-duration:1ms]',
  '[animation-timing-function:var(--ease-standard)]',
  '[animation-fill-mode:forwards]',
);

export const commentPartsQuoteTextClassName = 'italic';

/**
 * A highlighted passage's quote rule. The repeated class name doubles the
 * class's specificity, so it beats Blockquote's own
 * `border-s-[color:var(--color-border-emphasized)]` whatever order the two
 * rules print in. The passage writes the highlight's border token into the
 * variable.
 */
export const commentPartsQuoteRuleClassName =
  '[&.astryx-blockquote]:[border-inline-start-color:var(--_comment-quote-rule,var(--color-border-emphasized))]';

/**
 * A running comment's label: its text is painted by a gradient clipped to the
 * glyphs, so it never drops below secondary-text contrast. The clip arms need
 * `astryx-text` a second time to outrank `Text`'s own secondary color, and the
 * forced-colors arms name it twice more so they outrank the clip arms: there
 * the label is plain system text, with no gradient and no motion.
 */
export const commentPartsProgressLabelClassName = tw(
  '[background-size:250%_100%]',
  'bg-clip-text',
  'supports-[background-clip:text]:motion-safe:[&.astryx-text]:[color:transparent]',
  'supports-[background-clip:text]:motion-safe:[&.astryx-text]:[background-image:linear-gradient(90deg,var(--color-text-secondary)_40%,var(--color-text-primary)_50%,var(--color-text-secondary)_60%)]',
  'supports-[background-clip:text]:motion-safe:[&.astryx-text]:animate-[astryxCommentProgressShimmer_calc(var(--duration-slow-max)_*_2)_linear_infinite]',
  'forced-colors:[&.astryx-text.astryx-text]:[color:CanvasText]',
  'forced-colors:[&.astryx-text.astryx-text]:[background-image:none]',
  'forced-colors:[&.astryx-text.astryx-text]:[animation-name:none]',
);

/**
 * Doubles the comment column's gap around the quote so it reads as its own
 * block between the author line and the body.
 */
export const commentPartsThreadQuoteClassName = 'py-0.5';

export const commentPartsRailRowClassName = 'relative';

export const commentPartsRailClassName = tw(
  'absolute',
  'start-[calc(var(--spacing-3)+var(--border-width))]',
  'w-0.5',
  'bg-[color:var(--color-border-emphasized)]',
  'pointer-events-none',
);

/*
 * Where a stretch starts: below its row's avatar, or at the top of a row
 * without one; and where it ends: short of the next row's avatar, or at the
 * top of a next row without one, which carries the rail on.
 */
export const commentPartsRailFromAvatarClassName =
  'top-[calc(var(--spacing-6)+2*var(--spacing-1))]';

export const commentPartsRailFromRowClassName = 'top-0';

export const commentPartsRailToAvatarClassName =
  'bottom-[calc(var(--spacing-1)-var(--spacing-2))]';

export const commentPartsRailToRowClassName =
  'bottom-[calc(-1*var(--spacing-2))]';

/**
 * A collapsed thread's rail fades out over the whole comment, down to its View
 * replies link, so the hidden replies read as part of it.
 */
export const commentPartsRailCollapsedClassName = tw(
  'absolute',
  'top-[calc(var(--spacing-6)+2*var(--spacing-1))] bottom-0',
  'start-[calc(var(--spacing-3)+var(--border-width))]',
  'w-0.5',
  'bg-[linear-gradient(to_bottom,var(--color-border-emphasized),transparent)]',
  'pointer-events-none',
  'z-[-1]',
);

export const commentPartsEventRowClassName = 'ps-3';

export const commentPartsLoadingComposerClassName = 'rounded-lg';

export const commentPartsFullWidthClassName = 'w-full';

/**
 * Neighboring Sections each draw a top and a bottom divider. Overlapping them
 * by one border width leaves a single 1px line between threads.
 */
export const commentPartsSectionDividerOverlapClassName =
  'mt-[calc(-1*var(--border-width))] first:mt-0';
