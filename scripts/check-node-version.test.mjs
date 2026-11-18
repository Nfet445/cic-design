// Copyright (c) Meta Platforms, Inc. and affiliates.

import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {checkNodeVersion} from './check-node-version.mjs';

describe('repository Node version', () => {
  it('accepts the pinned version and rejects other versions', () => {
    expect(checkNodeVersion('v24.22.1\n', '24.22.1')).toBe(true);
    expect(checkNodeVersion('24.22.1', '26.13.1')).toBe(false);
    expect(() => checkNodeVersion('lts/*', '24.22.1')).toThrow();
  });

  it('reads the repository pin when run as a command', () => {
    const pin = readFileSync(
      new URL('../.nvmrc', import.meta.url),
      'utf8',
    ).trim();
    const result = spawnSync(
      process.execPath,
      ['scripts/check-node-version.mjs'],
      {
        cwd: new URL('..', import.meta.url),
        encoding: 'utf8',
      },
    );
    expect(result.status).toBe(
      process.versions.node === pin.replace(/^v/, '') ? 0 : 1,
    );
    if (result.status !== 0) expect(result.stderr).toContain(pin);
  });
});
