// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ListItem.source-build.test.mjs
 * @input Uses the core Tailwind build and ListItem's divider class map
 * @output Verifies the divider and its last-row reset reach the shipped sheet
 * @position Regression test for the shipped ListItem stylesheet
 */

import {buildAstryxTailwindCss} from '../../scripts/build-css-tailwind.mjs';
import {stylesheetOf} from '../__tests__/classNameAssertions';
import {
  LIST_ITEM_DIVIDER_END_WIDTH,
  LIST_ITEM_DIVIDER_LAST_RESET,
} from './listItemClasses';

const sheet = stylesheetOf(await buildAstryxTailwindCss());

describe('ListItem divider stylesheet', () => {
  it('draws the divider on the row box and removes it after the last item', () => {
    // The divider is the row's block-end border, and the last row clears it.
    // Both are classes the row's map emits; a rule the shipped sheet drops
    // leaves the divider under the list's last row.
    expect(sheet.ruleFor(LIST_ITEM_DIVIDER_END_WIDTH)).toBe(
      'border-block-end-width:var(--border-width);',
    );
    expect(sheet.blockOf(LIST_ITEM_DIVIDER_LAST_RESET)).toBe(
      '&:last-child{border-block-end-width:0px;}',
    );
  });
});
