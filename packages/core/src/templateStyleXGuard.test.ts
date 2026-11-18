// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file templateStyleXGuard.test.ts
 * @input Every file under the CLI's shipped templates
 * @output Invariant that a template imports no StyleX runtime and writes no
 *   `xstyle` prop, so a scaffolded project needs neither the compiler nor the
 *   runtime
 * @position Family-wide source test in the source-reading style of
 *   inputFontFloor.test.ts; a template is not compiled here, it is read
 *
 * A template's class text is not scanned by this package's Tailwind build, so a
 * template reaches a class only through a published class map or a literal
 * utility the stylesheet already carries. A StyleX prop would need the compiler
 * at the consumer's build time, which is what this guard keeps out.
 */

import {readFileSync, readdirSync} from 'node:fs';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

const TEMPLATE_ROOT = path.resolve(__dirname, '../../cli/assets/templates');

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

/** Every template source under `dir`, recursively. */
function templateSources(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...templateSources(full));
    } else if (SOURCE_EXTENSIONS.some(ext => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

/** What a template must not name, and the reason it must not. */
const FORBIDDEN = [
  {text: '@stylexjs/stylex', reason: 'imports the StyleX runtime'},
  {text: 'xstyle', reason: 'passes a StyleX style to a component'},
  {text: 'tokens.stylex', reason: 'reads a StyleX theme module'},
];

describe('the shipped templates', () => {
  it('names neither the StyleX runtime nor the xstyle prop', () => {
    const sources = templateSources(TEMPLATE_ROOT);
    // Guards the walk against an empty directory: the templates are a shipped
    // asset, and a moved root would otherwise pass this test.
    expect(sources.length).toBeGreaterThan(100);

    const offenders = sources
      .map(file => ({file, source: readFileSync(file, 'utf8')}))
      .flatMap(({file, source}) =>
        FORBIDDEN.filter(({text}) => source.includes(text)).map(
          ({text, reason}) =>
            `${path.relative(TEMPLATE_ROOT, file)} ${reason}: ${text}`,
        ),
      );

    expect(offenders).toEqual([]);
  });
});
