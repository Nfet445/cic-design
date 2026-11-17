// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tw.ts
 * @input The utility class values a component computes, including the false
 *   and null branches of a conditional
 * @output The non-empty values joined into one class attribute value
 * @position Shared helper for this package's components, whose own styles are
 *   Tailwind utilities; `@astryxdesign/core/utils` exports no copy yet
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
