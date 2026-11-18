// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file treeListBranchesClasses.ts
 * @input The theme's spacing and border-colour variables, and the per-row
 *   branch offset the row publishes as `--astryx-tree-list-branch-offset`
 * @output The utility class strings a guide column and its connector segment
 *   carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * A guide column starts where its level's indent puts it, which only the row
 * knows, so the offset arrives as an inline variable and the class reads it.
 * The column is 20px wide and centers a 1px line, so the line keeps its
 * hairline width and the column keeps the row's alignment.
 */

import {tw} from '../utils/tw';

export const treeListBranchesClassName = {
  container: tw(
    'absolute h-full',
    'z-[1] pointer-events-none',
    'w-[var(--spacing-5)]',
    '[inset-block-start:0]',
    '[inset-inline-start:var(--astryx-tree-list-branch-offset)]',
  ),
  verticalLine: tw(
    'absolute',
    'w-[1px] m-auto',
    'rounded-[1px]',
    '[inset-inline-start:0] [inset-inline-end:0]',
    '[background-color:var(--color-border-emphasized)]',
  ),
  verticalFull: 'h-[calc(100%+1px)]',
  verticalLast: 'h-[calc(100%_-_var(--tree-list-row-gap,_0px)_/_2)]',
};
