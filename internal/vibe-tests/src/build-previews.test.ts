// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Guards the preview entry file a target renders through.
 * @input A component path, a browser target and a temporary directory.
 * @output A failing test when the `astryx` entry stops loading the built
 *   Tailwind sheet, or the CDN `astryx-tailwind` baseline picks it up.
 * @position internal/vibe-tests/src/build-previews.test.ts; companion to
 *   build-previews.ts.
 *
 * A migrated component carries class names only, so the preview is styled by
 * the sheet the entry imports. The `astryx-tailwind` baseline keeps its CDN
 * Tailwind, which is what that target measures.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterAll, describe, expect, it} from 'vitest';
import {createEntryFile} from './build-previews';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-preview-entry-'));

afterAll(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

function entryFor(target: string): string {
  return fs.readFileSync(
    createEntryFile('/results/id/tc-1/astryx.tsx', target, tmpDir),
    'utf8',
  );
}

describe('preview entry file', () => {
  it('loads the built Tailwind sheet after the reset for the astryx target', () => {
    const entry = entryFor('astryx');
    const reset = entry.indexOf("import '@astryxdesign/core/reset.css';");
    const sheet = entry.indexOf('packages/core/dist/astryx-tailwind.css');
    expect(reset).toBeGreaterThan(-1);
    expect(sheet).toBeGreaterThan(reset);
  });

  it('keeps the CDN astryx-tailwind baseline on its own theme sheet', () => {
    const entry = entryFor('astryx-tailwind');
    expect(entry).toContain('packages/core/src/tailwind-theme.css');
    expect(entry).not.toContain('astryx-tailwind.css');
  });
});
