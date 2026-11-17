// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file typeaheadClasses.ts
 * @input Uses the theme's spacing, radius, typography, type-scale, colour and
 *   border variables, and the row's size and runtime state
 * @output The utility class strings a typeahead result row, its content slot
 *   and the default `TypeaheadItem` label, description and icon carry
 * @position Internal to BaseTypeahead and TypeaheadItem; the Tailwind build
 *   scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 *
 * A state class sets a private variable the base row reads, so the highlight
 * and the selected weight win without depending on sheet order. In forced
 * colours the highlight paints its outline the same way: the base row states
 * the outline with a fallback, and only the state class that sets the
 * variables inside the media query paints one.
 */

import {tw} from '../utils/tw';

export type TypeaheadRowSize = 'sm' | 'md' | 'lg';

/**
 * Row padding is stated in full for every size, so no size class shares a
 * property with the base row and the stylesheet order never decides the inset.
 */
const ROW_PADDING_CLASS: Record<TypeaheadRowSize, string> = {
  sm: tw(
    '[padding-block:var(--spacing-1)]',
    '[padding-inline:var(--spacing-2)]',
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

/** The fill a highlighted row draws over the base row's transparent one. */
export const TYPEAHEAD_ROW_HIGHLIGHT_CLASS =
  '[--_typeahead-row-bg:var(--color-overlay-hover)]';

/**
 * Windows High Contrast drops the fill, so a highlighted row draws a system
 * outline there instead. The three values ride private variables so nothing
 * competes with the base row's `outline-style` declaration.
 */
export const TYPEAHEAD_ROW_HIGHLIGHT_FORCED_COLORS_CLASS = tw(
  'forced-colors:[--_typeahead-row-outline-style:solid]',
  'forced-colors:[--_typeahead-row-outline-width:var(--border-width)]',
  'forced-colors:[--_typeahead-row-outline-color:Highlight]',
);

/** A selected row states its choice in weight, beside the check it draws. */
export const TYPEAHEAD_ROW_SELECTED_CLASS =
  '[font-weight:var(--font-weight-medium)]';

/** The row's content box: takes the free inline size and clips its overflow. */
export const TYPEAHEAD_ROW_CONTENT_CLASS = tw(
  'flex',
  'flex-1',
  'min-w-0',
  'overflow-hidden',
);

/** The default item fills the content slot so its label can ellipsize. */
export const TYPEAHEAD_DEFAULT_ITEM_CLASS = tw('min-w-0', 'w-full');

/**
 * A result row in the list: a full-width, borderless, transparent row on the
 * element radius, inset by the row's padding rather than a fixed height.
 */
export function typeaheadRowClassName({
  isHighlighted,
  isSelected,
  size,
}: {
  isHighlighted: boolean;
  isSelected: boolean;
  size: TypeaheadRowSize;
}): string {
  return tw(
    'box-border',
    'flex',
    'items-center',
    'w-full',
    'rounded-[var(--radius-element)]',
    'cursor-pointer',
    'aria-disabled:cursor-default',
    'text-start',
    'bg-[color:var(--_typeahead-row-bg,transparent)]',
    '[border-width:0]',
    '[border-style:none]',
    '[outline-style:var(--_typeahead-row-outline-style,none)]',
    '[outline-width:var(--_typeahead-row-outline-width,0)]',
    '[outline-color:var(--_typeahead-row-outline-color,currentColor)]',
    ROW_PADDING_CLASS[size],
    isHighlighted && TYPEAHEAD_ROW_HIGHLIGHT_CLASS,
    isHighlighted && TYPEAHEAD_ROW_HIGHLIGHT_FORCED_COLORS_CLASS,
    isSelected && TYPEAHEAD_ROW_SELECTED_CLASS,
  );
}

/** `TypeaheadItem`'s frame: the icon and the text stack, side by side. */
export const TYPEAHEAD_ITEM_FRAME_CLASS = tw(
  'flex',
  'items-center',
  'gap-2',
  '[min-height:0]',
);

export const TYPEAHEAD_ITEM_CONTENT_CLASS = tw(
  'flex',
  'flex-col',
  'flex-1',
  'min-w-0',
);

export const TYPEAHEAD_ITEM_LABEL_CLASS = tw(
  '[font-size:var(--text-label-size)]',
  '[line-height:var(--text-label-leading)]',
  'font-normal',
  'text-[color:var(--color-text-primary)]',
  'truncate',
);

export const TYPEAHEAD_ITEM_DESCRIPTION_CLASS = tw(
  '[font-size:var(--text-supporting-size)]',
  '[line-height:var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
  'truncate',
);

export const TYPEAHEAD_ITEM_DISABLED_CLASS = 'opacity-50';
