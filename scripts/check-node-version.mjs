// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';

export function checkNodeVersion(pin, actual) {
  const expected = pin.trim().replace(/^v/, '');
  if (!/^\d+\.\d+\.\d+$/.test(expected)) {
    throw new Error('The .nvmrc file must contain an exact Node version.');
  }
  return expected === actual;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  const pin = readFileSync(
    new URL('../.nvmrc', import.meta.url),
    'utf8',
  ).trim();
  if (!checkNodeVersion(pin, process.versions.node)) {
    console.error(
      `Node ${process.versions.node} does not match .nvmrc (${pin}). Run nvm install && nvm use.`,
    );
    process.exitCode = 1;
  }
}
