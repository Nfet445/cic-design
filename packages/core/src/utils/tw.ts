// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tw.ts
 * @input The class values you compose, including the false and null branches of
 *   a conditional
 * @output The non-empty values joined into one class attribute value
 * @position Public, exported from `@astryxdesign/core`: the joiner a caller
 *   uses to add its own utilities to a published class map
 */

/**
 * Joins class values into one `class` attribute value. A false, null or
 * undefined value is dropped, so a conditional arm needs no ternary of its
 * own.
 *
 * ```
 * <div className={tw(layoutInnerClassName, isFlush && 'p-0')} />
 * ```
 */
export function tw(...values: (string | false | null | undefined)[]): string {
  let joined = '';
  for (const value of values) {
    if (value) {
      joined = joined ? `${joined} ${value}` : value;
    }
  }
  return joined;
}
