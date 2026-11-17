// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file treeListClasses.ts
 * @input The theme's spacing variables
 * @output The utility class strings the tree root, its header and its list
 *   carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The root publishes the two public levers a theme retunes: the indent step and
 * the inter-row gap. A theme target rule on `tree-list` sets the same variables
 * later in the cascade, so it still wins.
 */

export const treeListClassName = {
  root: 'relative isolate [--tree-list-indent:var(--spacing-4)] [--tree-list-row-gap:var(--spacing-0-5)]',
  list: 'm-0 p-0 list-none',
  header: '[margin-block-end:var(--spacing-2)]',
};
