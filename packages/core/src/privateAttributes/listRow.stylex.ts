// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/listRow.stylex.ts
 * @input The edge treatment a List gave its rows, and whether it draws
 *   dividers between them
 * @output listRowProps, which marks a row with both, and listRowEdgeOf, which
 *   reads the edge back
 * @position Owner module of the private list-row attributes: the only file
 *   that writes their names. ListItem marks its row from the List's context,
 *   and the row's classes key their declarations on the marks so they outrank
 *   Item's frame. No package entry exports it.
 */

import type {ListEdge} from '../List/ListContext';

const LIST_EDGE = 'data-astryx-list-edge';
const LIST_DIVIDED = 'data-astryx-list-divided';

/**
 * Spread on a List row: marks the edge treatment it answers to. A divided
 * list marks its rows too, so a row keeps square corners whatever radius the
 * frame would give it.
 */
export function listRowProps(
  edge: ListEdge,
  hasDividers: boolean,
): Readonly<Record<string, string>> {
  return hasDividers
    ? {[LIST_EDGE]: edge, [LIST_DIVIDED]: ''}
    : {[LIST_EDGE]: edge};
}

/** The edge treatment a row carries, or null for a row without one. */
export function listRowEdgeOf(row: Element): string | null {
  return row.getAttribute(LIST_EDGE);
}

/** Whether a row sits in a list that draws dividers between its rows. */
export function isDividedRow(row: Element): boolean {
  return row.hasAttribute(LIST_DIVIDED);
}
