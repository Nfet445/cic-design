// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatReasoningClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the reasoning row, its header, label,
 *   preview, chevron and expanding content carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * A state that replaces a value has its own class rather than a second class
 * beside the first: the sheet, not the attribute, orders two rules that set
 * the same property.
 */

import {tw} from '../tw';

export const chatReasoningRootClassName = tw('flex flex-col', 'mt-2');

export const chatReasoningHeaderClassName = tw(
  'flex items-center',
  'gap-1.5',
  'cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'select-none',
  'min-h-6',
  'py-0.5',
);

export const chatReasoningIconClassName = tw(
  'inline-flex items-center justify-center shrink-0',
  'w-4 h-4',
  'text-[color:var(--color-text-secondary)]',
);

export const chatReasoningLabelRowClassName = tw(
  'flex items-center',
  'gap-1',
  'min-w-0',
  'overflow-hidden',
);

/** Typography both the plain label and its streaming form share. */
const labelTextClassName = tw(
  'font-sans',
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
  'whitespace-nowrap',
  'shrink-0',
);

export const chatReasoningLabelClassName = tw(
  labelTextClassName,
  'font-medium',
  'text-[color:var(--color-text-secondary)]',
);

/** The shimmer is an `astryx*` keyframe in `tailwind/lab.input.css`. */
export const chatReasoningStreamingLabelClassName = tw(
  labelTextClassName,
  'font-medium',
  'bg-[linear-gradient(90deg,var(--color-text-secondary)_0%,var(--color-text-disabled)_50%,var(--color-text-secondary)_100%)]',
  '[background-size:200%_100%]',
  'bg-clip-text',
  'text-transparent',
  'animate-[astryxChatReasoningShimmer_4s_linear_infinite]',
);

export const chatReasoningSeparatorClassName = tw(
  'text-[length:var(--text-supporting-size)]',
  'text-[color:var(--color-text-disabled)]',
  'shrink-0',
);

export const chatReasoningDurationClassName = tw(
  labelTextClassName,
  'text-[color:var(--color-text-disabled)]',
);

export const chatReasoningPreviewClassName = tw(
  labelTextClassName,
  'text-[color:var(--color-text-disabled)]',
  'overflow-hidden',
  'text-ellipsis',
  'min-w-0',
);

export const chatReasoningChevronClassName = tw(
  'inline-flex items-center justify-center shrink-0',
  'w-3.5 h-3.5',
  'text-[color:var(--color-text-disabled)]',
  'transition-[transform]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
);

export const chatReasoningChevronExpandedClassName = 'rotate-180';

export const chatReasoningContentClassName = tw(
  'grid',
  'transition-[grid-template-rows]',
  'duration-[var(--duration-medium)]',
  'ease-[var(--ease-standard)]',
);

export const chatReasoningContentCollapsedClassName = 'grid-rows-[0fr]';

export const chatReasoningContentExpandedClassName = 'grid-rows-[1fr]';

export const chatReasoningContentInnerClassName = tw(
  'overflow-hidden',
  'min-h-0',
);

/** The text starts past the 16px icon and its gap. */
export const chatReasoningContentPaddingClassName = tw(
  'pt-2',
  'ps-[calc(16px_+_var(--spacing-1.5))]',
  'font-sans',
  'text-[length:var(--text-supporting-size)]',
  'leading-[var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);
