// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file indicatorScope.ts
 * @input None
 * @output indicatorScopeProps, the private attribute an owning control puts on
 *   the row whose hover and focus reach its indicator
 * @position Owner module of the private indicator-scope attribute: the only
 *   file that names it. CheckboxInput and RadioListItem mark their rows, and
 *   `indicatorClasses.ts` reads it. No package entry exports it.
 */

/**
 * The hover tint of a box or circle reads this attribute off its row, the way
 * it reads `:hover` off that row, so one row drives a whole control.
 */
export const indicatorScopeProps: Readonly<Record<string, string>> = {
  'data-astryx-indicator-scope': '',
};
