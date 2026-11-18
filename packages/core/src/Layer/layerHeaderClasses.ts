// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerHeaderClasses.ts
 * @input Whether a slot carries a close action, and on which axes it is
 *   edge-compensated
 * @output Utility class strings for a layer header row, its title block, and
 *   its slots
 * @position Layer style primitives; scanned by the Tailwind build
 *
 * Both headers of a layer — the dialog's and the drawer's — lay out the same
 * row: a start slot, a title block that centres on the close button, and an end
 * slot. The title block's block margin centres it: the button's midpoint is
 * half a medium element, the title's is half its own line box, and the header
 * padding already moves both by one spacing step.
 */

import {tw} from '../utils/tw';

const CONTAINER = tw(
  'flex',
  'items-start',
  'justify-between',
  'gap-[var(--spacing-3)]',
);

const SLOT = tw('flex', 'items-center', 'gap-[var(--spacing-2)]', 'shrink-0');

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
export const layerHeaderContainerClassName = CONTAINER;

/** A slot of the header row that needs neither edge compensation. */
export const layerHeaderSlotClassName = SLOT;

/** The end slot, pulled back against the icon button's visual padding. */
export function layerHeaderActionsClassName({
  hasBlockCompensation,
  hasInlineCompensation,
}: {
  hasBlockCompensation: boolean;
  hasInlineCompensation: boolean;
}): string {
  return tw(
    SLOT,
    hasBlockCompensation && END_BLOCK_COMPENSATION,
    hasInlineCompensation && END_INLINE_COMPENSATION,
  );
}

/** The title block, which also holds the optional subtitle. */
export const layerHeaderTitleBlockClassName = TITLE_BLOCK;
