// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {mergeProps} from './mergeProps';

/**
 * Type-level guard for `mergeProps`.
 *
 * The runtime drops anything past the fourth argument and cannot tell a class
 * string from a style object in the third slot, so the compiler has to refuse
 * both shapes instead of letting a caller pass one in silence.
 */
describe('mergeProps types', () => {
  it('refuses an argument past the fourth', () => {
    // @ts-expect-error — a fifth argument has no meaning and must not compile.
    const withFifth = mergeProps('astryx', {}, 'consumer', {}, {});

    expect(withFifth).toBeDefined();
  });

  it('refuses class keys in the style slot', () => {
    // @ts-expect-error — the style slot takes a style object, not class keys.
    const withClassKeys = mergeProps('astryx', {}, {className: 'consumer'});

    expect(withClassKeys).toBeDefined();
  });

  it('keeps both classes for the accepted shape', () => {
    expect(
      mergeProps('astryx', {className: 'stylex'}, 'consumer', {width: 10})
        .className,
    ).toBe('astryx stylex consumer');
  });
});
