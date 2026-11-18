// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file multiSelectorOptionClasses.ts
 * @input Uses the theme's spacing, radius, typography, type-scale, colour and
 *   focus variables, and the row's kind, layout and runtime state
 * @output The utility class strings a MultiSelector row, its cells, its
 *   decorative checkbox and its label carry
 * @position Internal to MultiSelector; the Tailwind build scans it for class
 *   names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 *
 * The row reads its fill and its text colour from a private variable so a
 * state class beats the base declaration without depending on sheet order, and
 * every size states both padding longhands so no size class shares a property
 * with the base row.
 */

import {tw} from '../utils/tw';

export type MultiSelectorRowSize = 'sm' | 'md' | 'lg';

/** Row padding when the row is an option: the label sits on this inset. */
const ROW_PADDING_CLASS: Record<MultiSelectorRowSize, string> = {
  sm: tw(
    '[padding-block:var(--spacing-1)]',
    '[padding-inline:var(--spacing-1)]',
  ),
  md: tw(
    '[padding-block:var(--spacing-1-5)]',
    '[padding-inline:var(--spacing-2)]',
  ),
  lg: tw(
    '[padding-block:var(--spacing-2)]',
    '[padding-inline:var(--spacing-2)]',
  ),
};

/**
 * The Select All row holds a checkbox that already carries its own inline
 * inset, so the row gives it less room than an option row does.
 */
const SELECT_ALL_PADDING_CLASS: Record<MultiSelectorRowSize, string> = {
  sm: tw(
    '[padding-block:var(--spacing-0-5)]',
    '[padding-inline:var(--spacing-1)]',
  ),
  md: tw(
    '[padding-block:var(--spacing-1)]',
    '[padding-inline:var(--spacing-2)]',
  ),
  lg: tw(
    '[padding-block:var(--spacing-1)]',
    '[padding-inline:var(--spacing-2)]',
  ),
};

/** The fill a highlighted row draws over the base row's transparent one. */
export const MULTI_SELECTOR_ROW_HIGHLIGHT_CLASS =
  '[--_multi-selector-row-bg:var(--color-overlay-hover)]';

/** An unavailable row dims, greys its text and stops claiming a press target. */
export const MULTI_SELECTOR_ROW_DISABLED_CLASS = tw(
  'opacity-50',
  '[--_multi-selector-row-color:var(--color-text-disabled)]',
);

export const MULTI_SELECTOR_ROW_LABEL_CLASS = tw('min-w-0', 'truncate');

export const MULTI_SELECTOR_CHECKBOX_CLASS = tw(
  'pointer-events-none',
  'flex',
  'shrink-0',
);

/** The checkbox at the logical end sits against the far edge of the row. */
export const MULTI_SELECTOR_CHECKBOX_END_CLASS = 'ms-auto';

export const MULTI_SELECTOR_GRID_ROW_CLASS = tw(
  'flex',
  'items-center',
  'gap-2',
);

export const MULTI_SELECTOR_OPTION_CELL_CLASS = tw(
  'flex',
  'items-center',
  'gap-2',
  'grow',
  'shrink',
  'min-w-0',
  'self-stretch',
);

export const MULTI_SELECTOR_ACTION_CELL_CLASS = tw(
  'flex',
  'items-center',
  'shrink-0',
  'rounded-[var(--radius-element)]',
);

/**
 * The grid's action cell is a real cell, not a focusable element, so the
 * active-descendant ring is drawn from the focus tokens here.
 */
export const MULTI_SELECTOR_ACTION_CELL_ACTIVE_CLASS = tw(
  '[outline-width:var(--focus-outline-width)]',
  '[outline-style:var(--focus-outline-style)]',
  '[outline-color:var(--focus-outline-color)]',
  '[outline-offset:var(--focus-outline-offset)]',
);

/**
 * A MultiSelector row: a full-width, borderless, transparent row on the
 * element radius whose typography lives on the row itself, so a theme override
 * reaches both the fallback label and `renderOption` output.
 */
export function multiSelectorOptionRowClassName({
  isDisabled,
  isGrid,
  isHighlighted,
  isSelectAll,
  size,
}: {
  isDisabled: boolean;
  isGrid: boolean;
  isHighlighted: boolean;
  isSelectAll: boolean;
  size: MultiSelectorRowSize;
}): string {
  return tw(
    'box-border',
    'flex',
    'items-center',
    'gap-2',
    'w-full',
    'rounded-[var(--radius-element)]',
    'cursor-pointer',
    'aria-disabled:cursor-default',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-label-size)]',
    'font-medium',
    'text-[color:var(--_multi-selector-row-color,var(--color-text-primary))]',
    'bg-[color:var(--_multi-selector-row-bg,transparent)]',
    '[border-width:0]',
    '[border-style:none]',
    '[outline-style:none]',
    isSelectAll ? SELECT_ALL_PADDING_CLASS[size] : ROW_PADDING_CLASS[size],
    isHighlighted && MULTI_SELECTOR_ROW_HIGHLIGHT_CLASS,
    isDisabled && MULTI_SELECTOR_ROW_DISABLED_CLASS,
    isGrid && MULTI_SELECTOR_GRID_ROW_CLASS,
  );
}

/**
 * The trigger's height per size. Inside a group the group's row is the height,
 * so the component leaves this class off there for every variant that takes
 * `inputGroupMemberClassName`.
 */
export const MULTI_SELECTOR_TRIGGER_SIZE_CLASS: Record<
  MultiSelectorRowSize,
  string
> = {
  sm: '[height:var(--size-element-sm)]',
  md: '[height:var(--size-element-md)]',
  lg: '[height:var(--size-element-lg)]',
};
