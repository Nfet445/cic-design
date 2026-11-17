// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file filterClasses.ts
 * @input Tailwind utilities, the `tw()` joiner, whether the column filters
 * @output Exports `filterTriggerClassName`, `FILTER_INLINE_SLOT_CLASS`,
 *   `FILTER_POPOVER_SLOT_CLASS`, `FILTER_POPOVER_CONTENT_CLASS`,
 *   `FILTER_POPOVER_ACTIONS_CLASS`, `FILTER_POPOVER_ACTIONS_SPACER_CLASS`,
 *   `filterPlaceholderClassName`
 * @position Table filtering plugin; read by useTableFiltering
 */

import {tw} from '../../../utils/tw';

/**
 * The funnel trigger beside the header label: a bare icon button that keeps its
 * 44px target on a coarse pointer, so a touch user does not have to hit the
 * glyph itself.
 */
export function filterTriggerClassName(hasValue: boolean): string {
  return tw(
    'inline-flex items-center justify-center shrink-0',
    'bg-transparent border-0 p-0',
    'cursor-pointer disabled:cursor-default',
    'rounded-[var(--radius-element)]',
    'pointer-coarse:[min-width:44px] pointer-coarse:[min-height:44px]',
    // An unused trigger stays quiet until the header is hovered or focused.
    hasValue
      ? 'opacity-100'
      : 'opacity-[0.35] [&:is(th:hover_*)]:opacity-100 focus-visible:opacity-100',
  );
}

/** The wrapper the funnel trigger sits in, after the header label row. */
export const FILTER_POPOVER_SLOT_CLASS = 'flex items-center shrink-0';

/** The wrapper the inline control sits in, below the header label row. */
export const FILTER_INLINE_SLOT_CLASS = 'flex flex-col gap-1 mt-1 min-w-0';

/** The popover's content column. */
export const FILTER_POPOVER_CONTENT_CLASS = 'w-60';

/** The popover's Reset / Apply row. */
export const FILTER_POPOVER_ACTIONS_CLASS = 'flex gap-2 mt-2';

/** Pushes Apply to the far end of the actions row. */
export const FILTER_POPOVER_ACTIONS_SPACER_CLASS = 'flex-1';

/**
 * Keeps the header row's height steady while the inline slot holds no control:
 * the space a control would take is reserved, compactly in a compact header.
 */
export function filterPlaceholderClassName(isCompact: boolean): string {
  return isCompact ? 'h-7' : 'h-8';
}
