// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file write-css-declarations.mjs
 * @input Each prebuilt stylesheet the package exports, with the declaration
 *   authored beside the source that builds it.
 * @output Copies each declaration into `dist`, named after its stylesheet.
 * @position The last step of `build:css`, after both stylesheet builds.
 *
 * A consumer imports the built sheet, so its `types` condition must name the
 * declaration beside that file: `dist/astryx.css` and `dist/astryx.css.d.ts`.
 * The authored declaration stays beside its source, where a reader finds it,
 * and the build carries a copy to `dist`. The package `files` list publishes
 * `dist`, not `tailwind/`, so a declaration left in a build folder never
 * reaches a consumer.
 */

import {copyFile, mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(ROOT, 'dist');

/**
 * Every exported stylesheet, with the declaration authored beside its source.
 * `source` copies the sheet itself, for a sheet that is hand-generated into
 * `src` rather than written into `dist` by a build step.
 */
export const CSS_DECLARATIONS = [
  {stylesheet: 'astryx.css', declaration: 'src/astryx.css.d.ts'},
  {
    stylesheet: 'astryx-tailwind.css',
    declaration: 'tailwind/astryx-tailwind.css.d.ts',
  },
  {
    stylesheet: 'tokens.css',
    declaration: 'src/theme/tokens.css.d.ts',
    source: 'src/theme/tokens.css',
  },
];

/** Copy each stylesheet's declaration into `dist`, named after its stylesheet. */
export async function writeCssDeclarations(dist = DIST) {
  await mkdir(dist, {recursive: true});
  for (const {stylesheet, declaration, source} of CSS_DECLARATIONS) {
    await copyFile(
      path.resolve(ROOT, declaration),
      path.join(dist, `${stylesheet}.d.ts`),
    );
    if (source !== undefined) {
      await copyFile(path.resolve(ROOT, source), path.join(dist, stylesheet));
    }
  }
}

if (
  process.argv[1] != null &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await writeCssDeclarations();
  console.log(
    `Wrote ${CSS_DECLARATIONS.length} stylesheet declarations to dist/`,
  );
}
