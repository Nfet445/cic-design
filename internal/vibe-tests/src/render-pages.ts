// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Renders a family check page to the HTML file beside its fixture.
 * @input A family page module (fixture, checks and page component) and the
 *   built Core stylesheets that carry the values it asserts.
 * @output `pages/<family>.html`, a page a reviewer opens to read and measure
 *   the values the family's checks record.
 * @position internal/vibe-tests/src/render-pages.ts; run with
 *   `pnpm -F @astryxdesign/vibe-tests pages:render [--check]`.
 *
 * The page inlines two built sheets: the token declarations of the StyleX
 * sheet, and the Tailwind sheet the build writes. Both come from
 * `packages/core/dist`, so the page shows what ships and not what the sources
 * would produce. Its own script measures each value in the browser; the test
 * in render-pages.test.ts reads the same values from those sheets.
 */

import {createElement} from 'react';
import type {ComponentType} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as buttons from '../environments/project-astryx-tailwind/pages/buttons';
import * as layoutPrimitives from '../environments/project-astryx-tailwind/pages/layout-primitives';
import {
  elementVariables,
  readBuiltValues,
  readElements,
  readTokenCss,
  resolveCheck,
} from './check-values';
import type {
  BuiltValues,
  Check,
  ElementState,
  ResolvedCheck,
} from './check-values';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../..',
);
const CORE_DIST = path.join(REPO_ROOT, 'packages/core/dist');
const CORE_SRC = path.join(REPO_ROOT, 'packages/core/src');
const PAGES_DIR = path.join(
  REPO_ROOT,
  'internal/vibe-tests/environments/project-astryx-tailwind/pages',
);

/** One family's page: the module it renders and the file it writes. */
export interface FamilyPageModule {
  family: string;
  checks: Check[];
  Fixture: ComponentType;
  FamilyPage: ComponentType<{rows: ResolvedCheck[]}>;
}

export const FAMILY_PAGES: FamilyPageModule[] = [layoutPrimitives, buttons];

/** A rendered page, its fixture markup, and the checks it resolved. */
export interface RenderedPage {
  family: string;
  /** The whole HTML file. */
  html: string;
  /** The page's markup, which carries every recorded value. */
  markup: string;
  rows: ResolvedCheck[];
}

/**
 * Render one family page.
 * @param page - The family's module.
 * @returns The HTML, the page markup and the resolved checks.
 */
export function renderFamilyPage(page: FamilyPageModule): RenderedPage {
  const styleXCss = readBuiltCss();
  const tailwindCss = readTailwindCss();
  const values = readBuiltValues(styleXCss, tailwindCss);
  const elements = readElements(
    renderToStaticMarkup(createElement(page.Fixture)),
  );
  const rows = page.checks.map(check =>
    resolveCheck(check, values, elementFor(check, elements, values)),
  );
  const markup = renderToStaticMarkup(createElement(page.FamilyPage, {rows}));
  return {
    family: page.family,
    html: buildHtml(page.family, styleXCss, tailwindCss, markup),
    rows,
    markup,
  };
}

/**
 * Write every family page, or with `--check`, report pages that are stale.
 */
function main(): void {
  const checkOnly = process.argv.includes('--check');
  const stale: string[] = [];
  for (const page of FAMILY_PAGES) {
    const rendered = renderFamilyPage(page);
    const file = path.join(PAGES_DIR, `${page.family}.html`);
    const failed = rendered.rows.filter(row => !row.ok);
    if (failed.length > 0) {
      for (const row of failed) {
        console.error(`${page.family}.html: ${row.check.id} — ${row.reason}`);
      }
      process.exitCode = 1;
      continue;
    }
    if (checkOnly) {
      const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
      if (!current.includes(rendered.markup)) {
        stale.push(`${page.family}.html`);
      }
      continue;
    }
    fs.writeFileSync(file, rendered.html);
    console.log(`${page.family}.html — ${rendered.rows.length} checks written`);
  }
  if (stale.length > 0) {
    console.error(
      `Stale pages: ${stale.join(', ')} — run \`pnpm -F @astryxdesign/vibe-tests pages:render\` (or regenerate before opening).`,
    );
    process.exitCode = 1;
  }
}

function elementFor(
  check: Check,
  elements: Map<string, ElementState>,
  values: BuiltValues,
): ElementState | undefined {
  const element = elements.get(check.element ?? check.id);
  return element === undefined ? undefined : elementVariables(element, values);
}

/** Read the built StyleX sheet, which carries the token declarations. */
function readBuiltCss(): string {
  return readDistFile(path.join(CORE_DIST, 'astryx.css'), 'token declarations');
}

/** Read the built Tailwind sheet, which carries the utility classes. */
function readTailwindCss(): string {
  return readDistFile(
    path.join(CORE_DIST, 'astryx-tailwind.css'),
    'utility classes',
  );
}

function readDistFile(file: string, what: string): string {
  if (!fs.existsSync(file)) {
    throw new Error(
      `${path.relative(REPO_ROOT, file)} is missing, so the page cannot print its ${what}. Run \`pnpm -F @astryxdesign/core build\` first.`,
    );
  }
  return fs.readFileSync(file, 'utf8');
}

/** Assemble the page's stylesheets, in the order the environment loads them. */
function buildHtml(
  family: string,
  styleXCss: string,
  tailwindCss: string,
  markup: string,
): string {
  const css = [
    '@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;',
    fs.readFileSync(path.join(CORE_SRC, 'reset.css'), 'utf8'),
    readTokenCss(styleXCss),
    tailwindCss,
    PAGE_CHROME_CSS,
  ].join('\n\n');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>family:${family} — check page</title>
<!-- Generated by internal/vibe-tests/src/render-pages.ts. Do not edit. -->
<style>
${css}
</style>
</head>
<body>
<div id="page">${markup}</div>
${MEASURE_SCRIPT}
</body>
</html>
`;
}

/** Page chrome: the fixture shelf, its boxes, and the table. */
const PAGE_CHROME_CSS = `body{margin:0;padding:24px;background:#fff;color:#111;font:14px/1.5 system-ui,sans-serif}
main{max-width:1200px}
h1{font-size:18px;margin:0 0 8px}
h2{font-size:14px;margin:28px 0 8px;text-transform:uppercase;letter-spacing:.06em;color:#52525b}
.intro{max-width:76ch;margin:0 0 16px}
.fixture{border:1px dashed #a1a1aa;border-radius:6px;padding:16px;display:flex;flex-direction:column;gap:16px}
.shelf{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.box{width:24px;height:24px;border-radius:3px;background:#6366f1}
table{border-collapse:collapse;width:100%;font:12px/1.45 ui-monospace,SFMono-Regular,monospace}
th,td{border:1px solid #d4d4d8;padding:4px 8px;text-align:left;vertical-align:top}
th{background:#f4f4f5;font:600 11px/1.45 system-ui,sans-serif;text-transform:uppercase;letter-spacing:.05em}
code{font:inherit}
tr[data-static="fail"] td[data-cell="verdict"]{color:#b91c1c;font-weight:700}
tr[data-verdict="pass"] td[data-cell="verdict"]{color:#15803d;font-weight:700}
tr[data-verdict="fail"] td[data-cell="verdict"]{color:#b91c1c;font-weight:700}
#summary{font:12px/1.45 ui-monospace,SFMono-Regular,monospace;margin:0 0 8px;color:#52525b}
#summary[data-failed="true"]{color:#b91c1c;font-weight:700}
.notes{margin:16px 0 0;padding-left:20px;color:#3f3f46}
.notes li{margin:0 0 4px}
`;

/**
 * The page's measuring script: reads each value the table records and reports
 * whether the browser agrees. Values compare with their whitespace removed,
 * because a computed value respaces what a declaration wrote.
 */
const MEASURE_SCRIPT = `<script>
(function () {
  var rows = document.querySelectorAll('tr[data-check]');
  var failed = 0;
  for (var index = 0; index < rows.length; index++) {
    var row = rows[index];
    var property = row.getAttribute('data-property');
    var expected = row.getAttribute('data-expected');
    var elementId = row.getAttribute('data-element');
    var element = document.querySelector(
      '[data-astryx-value="' + elementId + '"]',
    );
    var measured = element
      ? getComputedStyle(element).getPropertyValue(property).trim()
      : 'element missing';
    var normalise = function (value) {
      return value.replace(/\\s+/g, '');
    };
    var agrees = normalise(measured) === normalise(expected);
    row.setAttribute('data-verdict', agrees ? 'pass' : 'fail');
    row.querySelector('[data-cell="measured"]').textContent = measured || 'none';
    row.querySelector('[data-cell="verdict"]').textContent = agrees
      ? 'measured ' + measured
      : 'measured ' + measured + ', recorded ' + expected;
    if (!agrees) failed++;
  }
  var summary = document.getElementById('summary');
  summary.setAttribute('data-failed', failed > 0 ? 'true' : 'false');
  summary.textContent = failed > 0
    ? failed + ' of ' + rows.length + ' measured values differ from the recorded ones.'
    : rows.length + ' of ' + rows.length + ' measured values match the recorded ones.';
})();
</script>`;

const isEntryPoint =
  process.argv[1] !== undefined &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isEntryPoint) {
  main();
}
