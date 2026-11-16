// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stylesheetExportTypes.test.mjs
 * @input The package's export map and the declarations the CSS build writes
 * @output Verifies each built stylesheet resolves to the declaration beside
 *   the file a consumer imports
 * @position Package-contract test for the CSS subpaths (spec:AST-119 FR1)
 */

import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
  CSS_DECLARATIONS,
  writeCssDeclarations,
} from '../scripts/write-css-declarations.mjs';

const PACKAGE = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const manifest = JSON.parse(
  readFileSync(path.join(PACKAGE, 'package.json'), 'utf8'),
);

/** The subpaths whose import loads a stylesheet the CSS build writes to `dist`. */
const builtSheets = Object.entries(manifest.exports).filter(
  ([, entry]) =>
    typeof entry.default === 'string' &&
    entry.default.startsWith('./dist/') &&
    entry.default.endsWith('.css'),
);

const installed = realpathSync(
  mkdtempSync(path.join(tmpdir(), 'astryx-css-types-')),
);
const PACKAGE_DIR = path.join(
  installed,
  'node_modules',
  '@astryxdesign',
  'core',
);
const DIST = path.join(PACKAGE_DIR, 'dist');
const ENTRY = path.join(installed, 'consumer.ts');

const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  noEmit: true,
  skipLibCheck: true,
  types: [],
};

beforeAll(async () => {
  mkdirSync(DIST, {recursive: true});
  copyFileSync(
    path.join(PACKAGE, 'package.json'),
    path.join(PACKAGE_DIR, 'package.json'),
  );
  writeFileSync(
    ENTRY,
    builtSheets
      .map(([subpath]) => `import '@astryxdesign/core${subpath.slice(1)}';`)
      .join('\n'),
  );
  await writeCssDeclarations(DIST);
  for (const {stylesheet} of CSS_DECLARATIONS) {
    writeFileSync(path.join(DIST, stylesheet), '');
  }
});

afterAll(() => rmSync(installed, {recursive: true, force: true}));

/** The declaration a consumer's import of this stylesheet resolves to. */
function resolvedTypes(stylesheet) {
  return ts.resolveModuleName(
    `@astryxdesign/core/${stylesheet}`,
    ENTRY,
    options,
    ts.sys,
  ).resolvedModule?.resolvedFileName;
}

describe('stylesheet export types', () => {
  it('names the declaration beside the stylesheet each subpath imports', () => {
    expect(
      builtSheets.map(([subpath, entry]) => [subpath, entry.types]),
    ).toEqual(
      builtSheets.map(([subpath, entry]) => [subpath, `${entry.default}.d.ts`]),
    );
  });

  it('resolves each import to the declaration the build writes beside it', () => {
    for (const [subpath, entry] of builtSheets) {
      const stylesheet = path.basename(entry.default);
      expect(resolvedTypes(stylesheet), subpath).toBe(
        path.join(DIST, `${stylesheet}.d.ts`),
      );
    }
  });

  it('type-checks a consumer that imports both stylesheets', () => {
    const program = ts.createProgram([ENTRY], options);
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map(d => ts.flattenDiagnosticMessageText(d.messageText, ' ')),
    ).toEqual([]);
  });
});
