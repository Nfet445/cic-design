// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file A package with no StyleX rule still writes a stylesheet. The token
 * sheets and the reset come from the package, not from its StyleX pass, so a
 * package that moved every style to Tailwind keeps shipping them.
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';
import {
  ASTRYX_LAYER_ORDER,
  collectStyleXCSS,
  writePackageStylesheet,
} from './build-css.mjs';

const temporaryRoots = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map(root => fs.rm(root, {recursive: true, force: true})),
  );
});

const SHEET_BANNER =
  '/* Probe generated sheet */\n/* Auto-generated. Do not edit manually. */\n\n';

/** A package whose every source file builds and whose components keep no StyleX rule. */
async function fixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'astryx-zero-rules-'));
  temporaryRoots.push(root);
  const src = path.join(root, 'src');
  const dist = path.join(root, 'dist');
  await fs.mkdir(src, {recursive: true});
  await fs.writeFile(
    path.join(src, 'Component.ts'),
    'export const label = "Probe";\n',
  );
  await fs.writeFile(
    path.join(src, 'tokens.css'),
    `${SHEET_BANNER}:root {\n  --color-probe: red;\n}\n`,
  );
  await fs.writeFile(
    path.join(src, 'reset.css'),
    `${SHEET_BANNER}:where(*) {\n  box-sizing: border-box;\n  margin: 0;\n}\n`,
  );
  return {
    src,
    dist,
    target: {
      src,
      dist,
      outFile: 'probe.css',
      banner: 'Probe Pre-compiled StyleX CSS',
      aliases: {},
      extraCss: [path.join(src, 'tokens.css'), path.join(src, 'reset.css')],
    },
  };
}

describe('a package with no StyleX rule', () => {
  it('writes the layer order, the token block and the reset', async () => {
    const {dist, target} = await fixture();
    expect(await collectStyleXCSS(target)).toEqual([]);

    const css = await writePackageStylesheet(target);

    // The banner comments come first, then the layer order every Astryx sheet
    // registers before its own rules.
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').trimStart();
    expect(rules.startsWith(`${ASTRYX_LAYER_ORDER}\n`)).toBe(true);
    expect(rules).toContain('@layer astryx-base {');
    expect(css).toMatch(/:root \{\n\s+--color-probe: red;/);
    expect(css).toMatch(/box-sizing: border-box;/);
    expect(css.indexOf('--color-probe')).toBeLessThan(
      css.indexOf('box-sizing: border-box'),
    );
    expect(await fs.readFile(path.join(dist, target.outFile), 'utf8')).toBe(
      css,
    );
  });
});
