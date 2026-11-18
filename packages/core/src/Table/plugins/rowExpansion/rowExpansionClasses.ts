// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rowExpansionClasses.ts
 * @input Tailwind utilities
 * @output Exports the chevron button and offset, the glyph box and rotation,
 *   the panel cell and its indent, and the clickable-row classes
 * @position Table row-expansion plugin; read by useTableRowExpansion
 */

import {tw} from '../../../utils/tw';

/**
 * The button is a plain hit target. Colour only: the rotation belongs to the
 * glyph, because turning this would swing the rounded rectangle and its hover
 * chip around with the arrow.
 */
export const ROW_EXPANSION_CHEVRON_BUTTON_CLASS = tw(
  'inline-flex items-center justify-center',
  // The chevron button: the spacing step, never wider than its column.
  'size-[min(var(--spacing-6),40px)]',
  'p-0 border-0 border-none bg-transparent rounded-[var(--radius-inner)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'text-[color:var(--color-icon-secondary)]',
  '[transition-property:color] [transition-duration:var(--duration-fast)] [transition-timing-function:var(--ease-standard)]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[var(--color-overlay-hover)]',
  '[&:hover:where(:not(:disabled,[aria-disabled=true]))]:text-[color:var(--color-icon-primary)]',
);

/**
 * The chevron sits centred in its column, as the selection checkbox does. The
 * column is a fixed pixel width, but the cells' insets follow the spacing
 * scale, so the button cancels the trigger's padding (the same density step
 * the panel indent uses) and centres itself.
 */
const CHEVRON_OFFSET_CLASS: Record<
  'compact' | 'balanced' | 'spacious',
  string
> = {
  compact:
    'ms-[calc((40px_-_min(var(--spacing-6),40px))_/_2_-_var(--spacing-2))]',
  balanced:
    'ms-[calc((40px_-_min(var(--spacing-6),40px))_/_2_-_var(--spacing-3))]',
  spacious:
    'ms-[calc((40px_-_min(var(--spacing-6),40px))_/_2_-_var(--spacing-4))]',
};

export function rowExpansionChevronOffsetClassName(
  density: 'compact' | 'balanced' | 'spacious',
): string {
  return CHEVRON_OFFSET_CLASS[density];
}

/**
 * The button takes its baseline from this fixed box. A theme's glyph size or a
 * hidden glyph then keeps the row height. The box is the toggle's first child,
 * which the glide gives its spring, so it carries the turn.
 */
export const ROW_EXPANSION_GLYPH_BOX_CLASS = 'inline-block relative shrink-0';

export const ROW_EXPANSION_GLYPH_CENTER_CLASS =
  'absolute inset-0 flex items-center justify-center';

export const ROW_EXPANSION_GLYPH_CLASS =
  '[transition-property:transform] [transition-duration:var(--duration-fast)] [transition-timing-function:var(--ease-standard)]';

/** The RTL mirror is folded into each state, as TreeListItem does. */
export const ROW_EXPANSION_GLYPH_STATE_CLASS = {
  expanded: tw(
    '[transform:rotate(90deg)]',
    'rtl:[transform:scaleX(-1)_rotate(90deg)]',
  ),
  collapsed: tw(
    '[transform:rotate(0deg)]',
    'rtl:[transform:scaleX(-1)_rotate(0deg)]',
  ),
};

export const ROW_EXPANSION_PANEL_CLASS = 'py-4 pe-5';

/**
 * The wash goes on the panel's cell, not on its row. A row that paints its own
 * box plays in under a clip that moves with its edge; on iOS that clip can
 * trail the rows that glide below it. The cell slides in with the panel's
 * content.
 */
export const ROW_EXPANSION_PANEL_MUTED_CLASS =
  'bg-[var(--color-background-muted)]';

/**
 * Start inset for the detail panel, one per density: the chevron column's
 * fixed width plus the inline padding a cell of that density gives its own
 * content, so the panel lines up with the first real column.
 */
const PANEL_INDENT_CLASS: Record<'compact' | 'balanced' | 'spacious', string> =
  {
    compact: 'ps-[calc(40px_+_var(--spacing-2))]',
    balanced: 'ps-[calc(40px_+_var(--spacing-3))]',
    spacious: 'ps-[calc(40px_+_var(--spacing-4))]',
  };

export function rowExpansionPanelIndentClassName(
  density: 'compact' | 'balanced' | 'spacious',
): string {
  return PANEL_INDENT_CLASS[density];
}

/** Whole-row-click expansion: signal the row is interactive. */
export const ROW_EXPANSION_CLICKABLE_ROW_CLASS =
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default';

export const rowExpansionChevronCellClassName = '[&&&]:ps-0';
export const rowExpansionChevronHeaderClassName = '[&&&]:ps-0 [&&&]:pe-0';
export const rowExpansionExpandedCellClassName =
  '[&&]:[--_table-row-divider-width:0px] [&&]:border-b-0';

export const rowExpansionPanelDividerClassName = tw(
  '[--_table-row-divider-width:var(--_table-panel-divider-width,var(--border-width))]',
  '[border-bottom-width:var(--_table-panel-divider-width,var(--border-width))]',
  '[border-bottom-style:var(--_table-panel-divider-style,solid)]',
  '[border-bottom-color:var(--_table-panel-divider-color,var(--color-border))]',
  '[[data-expansion-panel]:last-child_>_&]:border-b-0',
  '[[data-expansion-panel]:last-child_>_&]:[--_table-row-divider-width:0px]',
);
