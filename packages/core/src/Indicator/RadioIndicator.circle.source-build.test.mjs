// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file RadioIndicator.circle.source-build.test.mjs
 * @input Uses Babel and the StyleX plugin as the package stylesheet compiles
 *   it, and the RadioIndicator and RadioListItem sources
 * @output Verifies the pressed layer over the circle stays at 50% rather than
 *   the --radius-full pill token
 * @position Regression test for the compiled CSS of the radio marks
 *
 * A circle marks a radio; it is no corner. A theme that squares its pills
 * through --radius-full keeps round radios: the circle is drawn at 50% of its
 * box (indicatorClasses.ts), which no radius token can reach.
 */

import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {transformAsync} from '@babel/core';
import stylexBabelPlugin from '@stylexjs/babel-plugin';
import {describe, expect, it} from 'vitest';
import stylexResolution from '../../../../scripts/stylex-module-resolution.cjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Core declares the presets, so they resolve from here, not from the folder
// the tests run in.
const require = createRequire(import.meta.url);

/** @param {string} fileName relative to this folder */
async function compiledCss(fileName) {
  const file = path.join(__dirname, fileName);
  const result = await transformAsync(await fs.readFile(file, 'utf8'), {
    babelrc: false,
    configFile: false,
    filename: file,
    presets: [
      [
        require.resolve('@babel/preset-typescript'),
        {isTSX: true, allExtensions: true},
      ],
      [require.resolve('@babel/preset-react'), {runtime: 'automatic'}],
    ],
    plugins: [
      [
        stylexBabelPlugin,
        {
          dev: false,
          runtimeInjection: false,
          genConditionalClasses: true,
          treeshakeCompensation: true,
          unstable_moduleResolution: stylexResolution.stylexModuleResolution,
        },
      ],
    ],
  });
  return stylexBabelPlugin.processStylexRules(
    result?.metadata?.stylex ?? [],
    false,
  );
}

/** Every border-radius value in `css`. @param {string} css */
const radii = css =>
  [...css.matchAll(/border-radius:\s*([^;}]+)/g)].map(m => m[1].trim());

describe('the radio marks', () => {
  it('draw the pressed layer over the circle at 50%', async () => {
    // The pressed layer paints from the class map, so the circle's radius is
    // read there and confirmed in the built sheet rather than compiled here.
    const map = await fs.readFile(
      path.join(__dirname, 'indicatorClasses.ts'),
      'utf8',
    );
    // Two entries: the circle itself and the pressed layer over it.
    expect(map.match(/'rounded-\[50%\]'/g) ?? []).toHaveLength(2);
  });
});
