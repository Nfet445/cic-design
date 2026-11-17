// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dialogHeaderClasses.ts
 * @input Whether the end slot carries a close action, and on which axes it is
 *   edge-compensated
 * @output Utility class strings for the dialog header row, its title block, and
 *   its end slot
 * @position Dialog style primitives; scanned by the Tailwind build
 *
 * The title block's block margin centres the title on the close button: the
 * button's midpoint is half a medium element, the title's is half its own line
 * box, and the header padding already moves both by one spacing step.
 */

import {tw} from '../utils/tw';

const CONTAINER = tw(
  'flex',
  'items-start',
  'justify-between',
  'gap-[var(--spacing-3)]',
);

const ACTIONS = tw(
  'flex',
  'items-center',
  'gap-[var(--spacing-2)]',
  'shrink-0',
);

/** Pulls the end slot back against the icon button's visual padding. */
const END_BLOCK_COMPENSATION = '[margin-block:calc(-1*var(--spacing-2))]';

/** Pulls the end slot back against the icon button's visual padding. */
const END_INLINE_COMPENSATION = '[margin-inline-end:calc(-1*var(--spacing-2))]';

const TITLE_BLOCK = tw(
  'flex',
  'flex-1',
  'min-w-0',
  'flex-col',
  '[gap:var(--spacing-0)]',
  '[margin-block:calc(var(--size-element-md)/2_-_var(--spacing-2)_-_var(--text-heading-2-size)*var(--text-heading-2-leading)/2)]',
);

/** The header row. */
export const dialogHeaderContainerClassName = CONTAINER;

/** A start or end slot of the header row. */
export function dialogHeaderActionsClassName({
  hasBlockCompensation,
  hasInlineCompensation,
}: {
  hasBlockCompensation: boolean;
  hasInlineCompensation: boolean;
}): string {
  return tw(
    ACTIONS,
    hasBlockCompensation && END_BLOCK_COMPENSATION,
    hasInlineCompensation && END_INLINE_COMPENSATION,
  );
}

/** The title block, which also holds the optional subtitle. */
export const dialogHeaderTitleBlockClassName = TITLE_BLOCK;

/** The class set of a header slot that is neither edge-compensated nor a title. */
export const dialogHeaderSlotClassName = ACTIONS;
