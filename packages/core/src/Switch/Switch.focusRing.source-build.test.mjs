// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.focusRing.source-build.test.mjs
 * @input The compiled core utility sheet and the switch track focus classes
 * @output Checks the track follows keyboard focus on its preceding input
 * @position Regression coverage for the shipped Switch selector
 */

import {expect, it} from 'vitest';
import {buildAstryxTailwindCss} from '../../scripts/build-css-tailwind.mjs';
import {stylesheetOf} from '../__tests__/classNameAssertions';
import {switchFocusRingClassName} from './switchClasses';

it('reads the preceding switch input for the track focus ring', async () => {
  const sheet = stylesheetOf(await buildAstryxTailwindCss());
  const focusArms = switchFocusRingClassName
    .split(' ')
    .filter(name => name.includes('focus-visible'));
  expect(focusArms).toHaveLength(2);
  for (const arm of focusArms) {
    expect(sheet.blockOf(arm)).toMatch(
      /\[role=['"]?switch['"]?\]:focus-visible\+&/,
    );
    expect(sheet.blockOf(arm)).not.toContain(':has(');
  }
});
