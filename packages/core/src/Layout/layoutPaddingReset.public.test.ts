// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layoutPaddingReset.public.test.ts
 * @input The Layout entry point (`index.ts`), the published padding boundary
 *   class, and the source of `overlayPaddingReset.stylex.ts`
 * @output Asserts `@astryxdesign/core/Layout` publishes the inner wrapper and
 *   the padding boundary, and that the boundary writes every property
 *   `overlayPaddingReset.reset` writes
 * @position Beside layoutClasses.ts; the test imports the entry, never the
 *   module, because the entry is the seam a consumer has
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {describe, expect, it} from 'vitest';
import {layoutInnerClassName, layoutPaddingResetClassName} from './index';

/** The custom properties `overlayPaddingReset.reset` writes, from its source. */
function resetProperties(): [string, string][] {
  const source = readFileSync(
    join(
      process.cwd(),
      'packages/core/src/Layout/overlayPaddingReset.stylex.ts',
    ),
    'utf8',
  );
  return [...source.matchAll(/'(--[a-z0-9-]+)':\s*'([^']+)'/g)].map(match => [
    match[1],
    match[2],
  ]);
}

describe('the published layout padding boundary', () => {
  it('writes every property the StyleX reset writes', () => {
    const properties = resetProperties();
    expect(properties.length).toBeGreaterThan(0);
    for (const [name, value] of properties) {
      expect(layoutPaddingResetClassName).toContain(`[${name}:${value}]`);
    }
  });

  it('publishes the inner wrapper of a layout alongside it', () => {
    expect(layoutInnerClassName).toContain('flex flex-col');
  });
});
