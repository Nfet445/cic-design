// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/travelling.stylex.ts
 * @input A List row that slides across other rows
 * @output markTravelling, which marks the row for the length of its slide
 * @position Owner module of the private travelling attribute: the only file
 *   that writes its name in script. List/listLayoutUpdates.ts marks a row, and
 *   ListItem composes the classes (privateAttributes/travellingClasses.ts). No
 *   package entry exports it.
 */

export {
  travellingRaisedSwipeRowClassName,
  travellingRowClassName,
} from './travellingClasses';

const TRAVELLING = 'data-astryx-travelling';

/**
 * Each row's latest mark, so the end of an earlier slide leaves a later
 * mark in place.
 */
const marks = new WeakMap<Element, object>();

/**
 * Marks `row` as sliding across rows that move the other way. Returns the
 * call that removes the mark when the slide ends. A later mark on the row
 * stays when that call runs.
 */
export function markTravelling(row: Element): () => void {
  const mark = {};
  marks.set(row, mark);
  row.setAttribute(TRAVELLING, '');
  return () => {
    if (marks.get(row) === mark) {
      marks.delete(row);
      row.removeAttribute(TRAVELLING);
    }
  };
}
