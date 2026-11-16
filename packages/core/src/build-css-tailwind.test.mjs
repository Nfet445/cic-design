// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-css-tailwind.test.mjs
 * @input The Tailwind stylesheet build, pointed at a cache directory of its
 *   own, and the script's own command line
 * @output Verifies the build reuses a cached sheet for unchanged sources,
 *   rescans only the class map whose entry went stale, and reports the counts
 *   once per build
 * @position Cases for the build cache;
 *   `Layout/tailwindStylesheet.source-build.test.mjs` asserts the declarations
 *   the same build produces
 */

import {buildAstryxTailwindCss} from '../scripts/build-css-tailwind.mjs';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const CORE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = path.join(CORE, 'scripts/build-css-tailwind.mjs');

/**
 * Fixture caches live under the repository's `node_modules/.cache`, never the
 * system temp directory: the build must read the sources beside the package.
 */
const CACHE_ROOT = path.resolve(
  CORE,
  '../../node_modules/.cache/astryx-tailwind-css-test',
);

async function tempCacheDir() {
  await fs.mkdir(CACHE_ROOT, {recursive: true});
  return fs.mkdtemp(path.join(CACHE_ROOT, 'run-'));
}

/** One build against `cacheDir`, with the reports it made. */
async function build(cacheDir) {
  const reports = [];
  const css = await buildAstryxTailwindCss({
    cacheDir,
    onCacheReport: report => reports.push(report),
  });
  return {css, reports};
}

describe('the Tailwind stylesheet build cache', () => {
  it('reuses the cached sheet when no source changed', async () => {
    const cacheDir = await tempCacheDir();

    const first = await build(cacheDir);
    const second = await build(cacheDir);

    // One report per build, so the command line prints its counts once.
    expect(first.reports).toHaveLength(1);
    expect(second.reports).toHaveLength(1);

    const [cold] = first.reports;
    const [warm] = second.reports;
    expect(cold.reused).toBe(false);
    expect(cold.hits).toBe(0);
    expect(cold.misses).toBeGreaterThan(0);
    expect(warm.reused).toBe(true);
    expect(warm.misses).toBe(0);
    // Every module the cold build scanned is a hit for the warm one.
    expect(warm.hits).toBe(cold.hits + cold.misses);
    // The cached sheet is the uncached build's sheet, byte for byte.
    expect(second.css).toBe(first.css);
  });

  it('rescans only the class map whose entry went stale', async () => {
    const cacheDir = await tempCacheDir();
    const first = await build(cacheDir);

    const manifestPath = path.join(cacheDir, 'manifest.json');
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const [stale, ...unchanged] = Object.keys(manifest.modules).sort();
    expect(unchanged.length).toBeGreaterThan(0);

    // Stand in for a class map that changed: its entry no longer describes
    // the file. No case edits a source file, because another worker may be
    // building the sheet from it at the same time.
    manifest.modules[stale] = {stamp: 'stale', hash: 'stale'};
    await fs.writeFile(manifestPath, JSON.stringify(manifest));

    const second = await build(cacheDir);
    expect(second.reports[0].misses).toBe(1);
    expect(second.reports[0].hits).toBe(unchanged.length);
    // The re-read map holds the bytes its entry recorded, so the key still
    // names the cached sheet and the sheet is not compiled again.
    expect(second.reports[0].reused).toBe(true);
    expect(second.css).toBe(first.css);

    // The entry the build rewrote is a hit on the next run.
    const third = await build(cacheDir);
    expect(third.reports[0].misses).toBe(0);
    expect(third.reports[0].reused).toBe(true);
  });
});

describe('the Tailwind stylesheet build command', () => {
  const runBuild = () =>
    spawnSync(process.execPath, [SCRIPT], {
      cwd: CORE,
      encoding: 'utf8',
      timeout: 120_000,
      env: {...process.env, FORCE_COLOR: '0'},
    });

  /** The cache summary lines the build printed. */
  const summaries = stdout =>
    stdout.split('\n').filter(line => line.startsWith('Cache: '));

  it('prints the counts once, and reuses the sheet next time', () => {
    const first = runBuild();
    const second = runBuild();

    expect(first.error).toBeUndefined();
    expect(first.status).toBe(0);
    expect(second.error).toBeUndefined();
    expect(second.status).toBe(0);

    expect(summaries(first.stdout)).toEqual([
      expect.stringMatching(
        /^Cache: \d+ hits?, \d+ miss(es)?, (reused|rebuilt) the sheet$/,
      ),
    ]);
    // The first run left a sheet for these sources in the cache.
    expect(summaries(second.stdout)).toEqual([
      expect.stringMatching(/^Cache: \d+ hits?, 0 misses, reused the sheet$/),
    ]);
    expect(second.stdout).toMatch(
      /Wrote dist\/astryx-tailwind\.css \(\d+\.\d kB\)/,
    );
  });
});
