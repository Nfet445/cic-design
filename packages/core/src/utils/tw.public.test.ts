// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tw.public.test.ts
 * @input The package entry points (`index.ts`, `utils/index.ts`) and a caller
 *   that composes a published class map with its own utilities
 * @output Asserts `tw` is reachable from `@astryxdesign/core` and joins class
 *   values the way a caller expects, dropping the empty branch
 * @position Beside utils/tw.ts; the test imports the entries, never the module
 */

import {describe, expect, it} from 'vitest';
import * as core from '../index';
import * as utils from './index';

describe('tw, a caller’s class joiner', () => {
  it('is exported from @astryxdesign/core', () => {
    expect(typeof core.tw).toBe('function');
  });

  it('is exported from @astryxdesign/core/utils', () => {
    expect(utils.tw).toBe(core.tw);
  });

  it('joins the class values a caller composes', () => {
    expect(core.tw('flex flex-col', 'p-0')).toBe('flex flex-col p-0');
  });

  it('drops the false, null and undefined branches', () => {
    expect(core.tw('flex', false, null, undefined, 'p-0')).toBe('flex p-0');
  });

  it('returns an empty string when nothing is left to join', () => {
    expect(core.tw('', false, undefined)).toBe('');
  });
});
