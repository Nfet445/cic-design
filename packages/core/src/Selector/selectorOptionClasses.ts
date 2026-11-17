// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectorOptionClasses.ts
 * @input Uses the theme's spacing, radius, typography, type-scale, colour and
 *   focus variables, and the row's size and runtime state
 * @output The utility class strings an option row, its content box, its mark
 *   column and the SelectorOption primitive carry
 * @position Internal to Selector and MultiSelector; the Tailwind build scans it
 *   for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 *
 * A state that has to beat the base row cannot rely on sheet order inside one
 * layer, so the two properties the base also declares — the fill and the
 * outline style — are read from a private variable the state class sets.
 */

import {tw} from '../utils/tw';

export type SelectorOptionRowSize = 'sm' | 'md' | 'lg';

/**
 * Row padding is stated in full for every size, so no size class shares a
 * property with the base row and the sheet order never decides the inset.
 */
const ROW_PADDING_CLASS: Record<SelectorOptionRowSize, string> = {
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

/** The fill a highlighted row draws, over the base row's transparent one. */
export const SELECTOR_ROW_HIGHLIGHT_CLASS =
  '[--_selector-row-bg:var(--color-overlay-hover)]';

/**
 * The ring a keyboard-driven highlight adds. The fill alone measures about
 * 1.09:1 against the listbox, so the ring carries the state that has to reach
 * 3:1 (WCAG 2.2 1.4.11).
 */
export const SELECTOR_ROW_KEYBOARD_HIGHLIGHT_CLASS = tw(
  '[--_selector-row-outline-style:var(--focus-outline-style)]',
  '[outline-width:var(--focus-outline-width)]',
  '[outline-color:var(--focus-outline-color)]',
  '[outline-offset:calc(-1*var(--focus-outline-width))]',
);

/** A selected row states its choice in weight, beside the mark it draws. */
export const SELECTOR_ROW_SELECTED_CLASS =
  '[font-weight:var(--font-weight-medium)]';

/** An unavailable row dims and stops claiming a press target of its own. */
export const SELECTOR_ROW_DISABLED_CLASS = 'opacity-50';

/**
 * The option row a listbox paints: a full-width, borderless, transparent row on
 * the element radius, sized by its padding rather than a fixed height.
 *
 * `aria-disabled` keys the resting cursor, because the base row's
 * `cursor-pointer` sits in the same layer as any later plain class.
 */
export function selectorOptionRowClassName({
  isDisabled,
  isHighlighted,
  isKeyboardHighlighted,
  isSelected,
  size,
}: {
  isDisabled: boolean;
  isHighlighted: boolean;
  isKeyboardHighlighted: boolean;
  isSelected: boolean;
  size: SelectorOptionRowSize;
}): string {
  return tw(
    'box-border',
    'flex',
    'items-center',
    'justify-between',
    'gap-2',
    'w-full',
    'rounded-[var(--radius-element)]',
    '[font-family:var(--font-family-body)]',
    'text-[length:var(--text-label-size)]',
    'text-[color:var(--color-text-primary)]',
    'bg-[color:var(--_selector-row-bg,transparent)]',
    '[border-width:0]',
    '[border-style:none]',
    'cursor-pointer',
    'aria-disabled:cursor-default',
    'text-start',
    '[outline-style:var(--_selector-row-outline-style,none)]',
    ROW_PADDING_CLASS[size],
    isHighlighted && SELECTOR_ROW_HIGHLIGHT_CLASS,
    isKeyboardHighlighted && SELECTOR_ROW_KEYBOARD_HIGHLIGHT_CLASS,
    isSelected && SELECTOR_ROW_SELECTED_CLASS,
    isDisabled && SELECTOR_ROW_DISABLED_CLASS,
  );
}

/** The row's content box: takes the free inline size and clips its overflow. */
export const SELECTOR_ROW_CONTENT_CLASS = tw(
  'flex',
  'flex-1',
  'items-center',
  'gap-2',
  'min-w-0',
);

/**
 * The mark column keeps a visible mark at either logical position and removes
 * itself from layout when the resolved indicator draws nothing.
 */
export const SELECTOR_ROW_MARK_COLUMN_CLASS = tw(
  'inline-flex',
  'items-center',
  'justify-center',
  'shrink-0',
  '[min-width:1rem]',
  '[&:empty]:hidden',
);

/**
 * The SelectorOption primitive inside a host row: the host already carries the
 * inset, radius and flex item, so the primitive adds none of its own.
 */
export const SELECTOR_OPTION_EMBEDDED_CLASS = tw(
  '[padding-block:0]',
  '[padding-inline:0]',
  '[border-radius:0]',
  'min-w-0',
);

/** The shared small-screen sheet takes the width the bottom sheet offers it. */
export const SELECTOR_BOTTOM_SHEET_CONTENT_CLASS = 'w-full';

/** The sheet's own heading sits above the list, inset clear of its edge. */
export const SELECTOR_BOTTOM_SHEET_HEADING_CLASS = tw(
  '[margin-block-end:var(--spacing-2)]',
  '[margin-inline:var(--spacing-3)]',
);

/**
 * The single-line trigger's box per size: the token's floor, the text line and
 * the padding that centres it. The line box floors at the 20px clear control
 * and 1rem icons, and caps at what the size token's borders leave, so a
 * spacing scale taller than the token cannot push a one-line trigger past it.
 * It never goes below 1.5em of the trigger's own font, so label text too large
 * for the token keeps room instead of being clipped. Ghost and grouped
 * triggers keep the uncapped line box, so these classes sit beside the
 * trigger's own box rather than carry it.
 */
export const SELECTOR_TRIGGER_SIZE_CLASS: Record<
  SelectorOptionRowSize,
  string
> = {
  sm: tw(
    '[min-height:var(--size-element-sm)]',
    '[line-height:max(min(var(--spacing-5),max(var(--size-element-sm)-2*var(--border-width),1.5em)),20px,1rem)]',
    '[padding-block:calc((var(--size-element-sm)-max(min(var(--spacing-5),max(var(--size-element-sm)-2*var(--border-width),1.5em)),20px,1rem)-2*var(--border-width))/2)]',
  ),
  md: tw(
    '[min-height:var(--size-element-md)]',
    '[line-height:max(min(var(--spacing-5),max(var(--size-element-md)-2*var(--border-width),1.5em)),20px,1rem)]',
    '[padding-block:calc((var(--size-element-md)-max(min(var(--spacing-5),max(var(--size-element-md)-2*var(--border-width),1.5em)),20px,1rem)-2*var(--border-width))/2)]',
  ),
  lg: tw(
    '[min-height:var(--size-element-lg)]',
    '[line-height:max(min(var(--spacing-5),max(var(--size-element-lg)-2*var(--border-width),1.5em)),20px,1rem)]',
    '[padding-block:calc((var(--size-element-lg)-max(min(var(--spacing-5),max(var(--size-element-lg)-2*var(--border-width),1.5em)),20px,1rem)-2*var(--border-width))/2)]',
  ),
};
