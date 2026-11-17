// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/indicatorScope.stylex.ts
 * @input None
 * @output indicatorScopeProps, the private attribute an owning control puts on
 *   the row whose hover and focus reach its indicator
 * @position Owner module of the private indicator-scope attribute: the only
 *   file that writes its name. CheckboxInput and RadioListItem spread the
 *   props on their rows, and the indicator's hover classes read the attribute
 *   in their class text. No package entry exports it.
 */

/**
 * The hover tint of a box or circle reads this attribute off its row, the way
 * it reads `:hover` off that row, so one row drives a whole control.
 */
export const indicatorScopeProps: Readonly<Record<string, string>> = {
  'data-astryx-indicator-scope': '',
};
