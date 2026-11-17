// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file treeClasses.ts
 * @input Tailwind utilities
 * @output Exports the tree cell, indent variable, expander button, glyph,
 *   leaf spacer, header cell and clickable-row classes
 * @position Table tree plugin; read by useTableTreeData
 */

import {tw} from '../../../utils/tw';

/** The disclosure toggle's own box, matching IconButton ghost hover. */
export const TREE_EXPANDER_CLASS = tw(
  'inline-flex items-center justify-center size-6 shrink-0',
  'p-0 border-0 border-none bg-transparent rounded-[var(--radius-inner)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'text-[color:var(--color-icon-secondary)]',
  '[transition-property:color,background-color] [transition-duration:150ms]',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[var(--color-overlay-hover)]',
  '[&:hover:where(:not(:disabled,[aria-disabled=true]))]:text-[color:var(--color-icon-primary)]',
);

export const TREE_CHEVRON_GLYPH_CLASS =
  '[transition-property:transform] [transition-duration:150ms]';

/**
 * The RTL mirror is folded into each state's transform rather than living on
 * a parent span: both are `transform`, so on one element the later value
 * would win. Spelling out `scaleX(-1) rotate(...)` per state composes them
 * exactly as the nested elements did, while leaving a single element to carry
 * the glyph's theme target.
 */
export const TREE_CHEVRON_GLYPH_STATE_CLASS = {
  collapsed: tw(
    '[transform:rotate(0deg)]',
    'rtl:[transform:scaleX(-1)_rotate(0deg)]',
  ),
  expanded: tw(
    '[transform:rotate(90deg)]',
    'rtl:[transform:scaleX(-1)_rotate(90deg)]',
  ),
};

/** Keeps leaf content aligned with expandable siblings. */
export const TREE_LEAF_SPACER_CLASS = 'inline-block size-6 shrink-0';

export const TREE_CELL_CLASS = 'flex items-center gap-1';

/** The row depth, written inline per instance on {@link TREE_CELL_CLASS}. */
export const TREE_INDENT_VARIABLE = '--_table-tree-indent';

export const TREE_CELL_INDENT_CLASS = 'ps-[var(--_table-tree-indent)]';

/** Header expand-all toggle: same affordance as a row expander. */
export const TREE_HEADER_CELL_CLASS = 'inline-flex items-center gap-1 min-w-0';

/** Whole-row-click expansion: signal the row is interactive. */
export const TREE_CLICKABLE_ROW_CLASS =
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default';
