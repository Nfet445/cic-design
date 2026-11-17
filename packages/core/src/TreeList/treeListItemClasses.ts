// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file treeListItemClasses.ts
 * @input The theme's spacing, radius, duration and type-scale variables
 * @output The utility class strings a tree row, its wrapper, its indent, its
 *   chevron and its text slots carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * Every class is a literal so the build can scan it. The per-instance indent
 * distance is an inline `--_tree-indent` variable, not a class.
 */

import {tw} from '../utils/tw';

/** The 16px chevron column, sized in spacing tokens rather than rem. */
const CHEVRON_COLUMN =
  'w-[var(--spacing-4)] h-[var(--spacing-4)] [font-size:var(--spacing-4)]';

/** The spacing a focused row's ring needs to stay above the guides. */
const ROW_FOCUS_Z = 'z-[var(--_tree-focus-z,auto)]';

export const treeListItemClassName = {
  /** The treeitem box, which also publishes its own focus state. */
  wrapper: tw(
    'list-none m-0 p-0 relative w-full outline-none',
    // Every nested <li> redeclares the default, so a focused ancestor never
    // lifts its descendants' rows.
    '[--_tree-focus-z:auto] focus-visible:[--_tree-focus-z:2]',
  ),
  childGroup: 'm-0 p-0 list-none',
  treeBranches: 'ps-2',
  /** Half the inter-row gap above and half below, so it cannot collapse. */
  rowWrapper: 'relative [padding-block:calc(var(--tree-list-row-gap,0px)/2)]',
  /** The paintable row: the theme target, full width of the list. */
  contentWrapper: tw(
    'rounded-[var(--radius-element)] flex items-center gap-2 px-2',
    'overflow-hidden relative box-border text-start',
  ),
  /** Lift the row whose ring shows above the guide lines. */
  focusLift: tw(ROW_FOCUS_Z, 'has-[:focus-visible]:z-[2]'),
  /** The per-level indent, drawn inside the row box. */
  indentedContent: tw(
    'flex flex-1 min-w-0 [align-items:inherit] [gap:inherit]',
    'ps-[var(--_tree-indent,0px)]',
  ),
  interactive: tw(
    'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
    '[transition-property:background-image]',
    '[transition-duration:var(--duration-fast)]',
    '[transition-timing-function:var(--ease-standard)]',
  ),
  disabled: 'cursor-default opacity-50 pointer-events-none',
  selected: 'bg-[color:var(--color-accent-muted)]',
  invisibleButton: tw(
    '[font:inherit] text-inherit cursor-[inherit]',
    'flex flex-col flex-1 min-w-0 text-start outline-none',
    'disabled:cursor-default aria-disabled:cursor-default',
  ),
  invisibleAnchor: tw(
    '[font:inherit] text-inherit cursor-[inherit]',
    'flex flex-col flex-1 min-w-0 text-start no-underline outline-none',
    'disabled:cursor-default aria-disabled:cursor-default',
  ),
  /** A row without an action: the same column, on a plain element. */
  content: 'flex flex-col flex-1 min-w-0 text-start',
  label: 'text-[color:var(--color-text-primary)]',
  description: 'text-[color:var(--color-text-secondary)]',
  descriptionSize:
    '[font-size:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]',
  startContent: 'shrink-0 flex items-center',
  endContent: 'shrink-0 flex items-center ms-auto',
  /** The chevron box, shared by the toggle button and the plain marker. */
  chevronBox: tw(
    'shrink-0 flex items-center justify-center',
    CHEVRON_COLUMN,
    'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
    'text-[color:var(--color-icon-secondary)]',
    'rounded-[var(--radius-inner)]',
  ),
  chevronButton: tw(
    'shrink-0 flex items-center justify-center',
    CHEVRON_COLUMN,
    'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
    'text-[color:var(--color-icon-secondary)]',
    'rounded-[var(--radius-inner)]',
    'border-0 border-none bg-transparent p-0',
  ),
  chevronGlyph: tw(
    'flex',
    CHEVRON_COLUMN,
    '[transition-property:transform]',
    '[transition-duration:var(--duration-fast)]',
    '[transition-timing-function:var(--ease-standard)]',
  ),
  chevronExpanded: tw(
    '[transform:rotate(90deg)]',
    'rtl:[transform:scaleX(-1)_rotate(90deg)]',
  ),
  chevronCollapsed: tw(
    '[transform:rotate(0deg)]',
    'rtl:[transform:scaleX(-1)_rotate(0deg)]',
  ),
};

/** The row's vertical density, which also sets the label's type. */
export const treeListItemDensityClassName = {
  compact: tw(
    'py-1',
    '[font-size:var(--text-body-size)] leading-[var(--text-body-leading)]',
  ),
  balanced: tw(
    'py-2',
    '[font-size:var(--text-body-size)] leading-[var(--text-body-leading)]',
  ),
  spacious: tw(
    'py-3',
    '[font-size:var(--text-body-size)] leading-[var(--text-body-leading)]',
  ),
};
