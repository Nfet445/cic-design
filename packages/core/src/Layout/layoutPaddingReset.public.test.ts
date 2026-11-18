// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layoutPaddingReset.public.test.ts
 * @input The Layout entry point (`index.ts`)
 * @output Asserts `@astryxdesign/core/Layout` publishes the inner wrapper and
 *   the padding boundary, and that the boundary is the reset an overlay root
 *   reads
 * @position Beside layoutClasses.ts; the test imports the entry, never the
 *   module, because the entry is the seam a consumer has
 */

import {describe, expect, it} from 'vitest';
import {
  layoutInnerClassName,
  layoutPaddingResetClassName,
  overlayPaddingReset,
} from './index';

describe('the published layout padding boundary', () => {
  it('is the reset an overlay root reads', () => {
    expect(overlayPaddingReset.reset).toBe(layoutPaddingResetClassName);
    expect(layoutPaddingResetClassName).toContain(
      '[--container-padding-inline-start:0px]',
    );
  });

  it('publishes the inner wrapper of a layout alongside it', () => {
    expect(layoutInnerClassName).toContain('flex flex-col');
  });
});
