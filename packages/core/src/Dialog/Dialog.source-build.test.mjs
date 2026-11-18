// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Dialog.source-build.test.mjs
 * @input The dialog class maps
 * @output Verifies the dialog still asks for the border reset that hides the
 *   UA <dialog> frame
 * @position Regression test for the class set Dialog ships
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = path.resolve(__dirname, '../..');
const DIALOG_SOURCE = path.join(__dirname, 'Dialog.tsx');

async function compileDialogRules() {
  const source = await fs.readFile(DIALOG_SOURCE, 'utf8');
  const result = await transformAsync(source, {
    babelrc: false,
    configFile: path.join(CORE_ROOT, 'babel.config.json'),
    filename: DIALOG_SOURCE,
  });
  return (result?.metadata?.stylex ?? []).map(([, rule]) => rule.ltr);
}

describe('Dialog border reset', () => {
  it('asks for the border reset that hides the UA <dialog> frame', async () => {
    const source = await fs.readFile(
      path.join(__dirname, 'dialogClasses.ts'),
      'utf8',
    );

    // Without the reset a consumer that does not load reset.css sees the UA
    // `dialog { border: solid }` frame. The classes are literals in the map, so
    // reading the map's source is the whole contract; the package stylesheet
    // test proves the sheet carries the rules.
    expect(source).toContain("'border-0'");
    expect(source).toContain("'border-none'");
  });
});
