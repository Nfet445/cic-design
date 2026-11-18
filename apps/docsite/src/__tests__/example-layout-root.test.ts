// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Docsite example root follows Layout's reset (component:Layout FR8).
 *
 * The example root in ExampleBlock cannot import Core's internal
 * `layoutReset` (Core's `./internal/*` is reserved for Core and Lab), so it
 * composes the public `overlayPaddingReset` and mirrors the rest. This test
 * fails when the mirror and Layout's reset differ, so Layout stays the one
 * owner and the docs examples follow it.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {describe, expect, it} from 'vitest';

const REPO = path.resolve(__dirname, '../../../..');
const read = (file: string) => fs.readFileSync(path.join(REPO, file), 'utf8');

/** The custom properties each class in the block after `marker` declares. */
function declarations(source: string, marker: string): Record<string, string> {
  const start = source.indexOf(marker);
  expect(start, marker).toBeGreaterThanOrEqual(0);
  const body = source.slice(start, source.indexOf(');', start));
  return Object.fromEntries(
    Array.from(body.matchAll(/'\[(--[\w-]+):([^\]]*)\]'/g), m => [m[1], m[2]]),
  );
}

describe('docsite example root (component:Layout FR8)', () => {
  const layoutClasses = read('packages/core/src/Layout/layoutClasses.ts');
  const exampleBlock = read(
    'apps/docsite/src/components/component-detail/ExampleBlock.tsx',
  );

  it('composes the same public reset that Layout composes', () => {
    expect(exampleBlock).toMatch(/overlayPaddingReset\.reset,/);
  });

  it('mirrors the rest of Layout reset, name for name and value for value', () => {
    const owner = declarations(
      layoutClasses,
      'export const layoutResetClassName',
    );
    const mirror = declarations(
      exampleBlock,
      'const exampleRootResetClassName',
    );
    expect(Object.keys(owner).length).toBeGreaterThan(0);
    expect(mirror).toEqual(owner);
  });
});
