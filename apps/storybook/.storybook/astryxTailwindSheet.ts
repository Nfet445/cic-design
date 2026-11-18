// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Serve the prebuilt Tailwind sheet to Storybook as a virtual CSS module.
 *
 * Stories render from source through the aliases in `main.ts`, so a component
 * whose styles are Tailwind classes carries only class names. The sheet those
 * names resolve against is compiled here from the same class maps the package
 * build reads, which keeps a story current without a `dist` build and without
 * a second stylesheet to keep in step.
 *
 * HMR: a class map edit invalidates the module, so the next request recompiles.
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import type {Plugin} from 'vite';

const MODULE_ID = 'virtual:astryx-tailwind-sheet.css';
const RESOLVED_ID = `\0${MODULE_ID}`;

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const CLASS_MAP_PATTERN = /(?:Classes|classes)\.ts$/;

export function astryxTailwindSheet(): Plugin {
  let sheet: Promise<string> | undefined;

  function compile(): Promise<string> {
    sheet ??= import(
      path.join(rootDir, 'packages/core/scripts/build-css-tailwind.mjs')
    ).then((module: {buildAstryxTailwindCss: () => Promise<string>}) =>
      module.buildAstryxTailwindCss(),
    );
    return sheet;
  }

  return {
    name: 'astryx-tailwind-sheet',

    resolveId(id) {
      return id === MODULE_ID ? RESOLVED_ID : undefined;
    },

    async load(id) {
      if (id !== RESOLVED_ID) {
        return undefined;
      }
      return compile();
    },

    hotUpdate({file}) {
      if (CLASS_MAP_PATTERN.test(file)) {
        const stale = sheet;
        sheet = undefined;
        stale?.catch(() => {});
        const module = this.environment.moduleGraph.getModuleById(RESOLVED_ID);
        if (module) {
          this.environment.moduleGraph.invalidateModule(module);
        }
      }
    },
  };
}
