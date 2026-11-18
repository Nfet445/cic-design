// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pre-commit-checks.mjs
 * @description Runs the checks a commit must not skip: the typecheck of the
 * packages the staged files touch, and the tests colocated with them.
 *
 * `lint-staged` formats and lints what is staged, and `check:repo` covers the
 * repository invariants, but neither compiles a type or runs a test. A commit
 * could therefore reach the branch with a suite that never loaded it.
 *
 * The tests are the ones beside the changed file, not every suite that imports
 * it: `vitest related` on a shared module such as `utils/tw.ts` selects most of
 * the repository and takes minutes, which a pre-commit cannot afford. The whole
 * suite runs in CI and in `pnpm test`.
 *
 * A commit that touches no source file exits at once, so documentation and
 * ticket edits stay fast. `SKIP_HEAVY_CHECKS=1` skips both steps for a commit
 * that knowingly breaks them, and says what it skipped.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = /\.(?:ts|tsx)$/;
const SKIPPED =
  /(?:\.test\.tsx?|\.testing\.tsx?|\.doc\.mjs|\.stylex\.tsx?|\.d\.ts)$/;
const IGNORED = /^(?:docs|\.scratch|\.changeset|\.github)\//;
/** Above this many directories the typecheck carries the commit alone. */
const MAX_TEST_DIRECTORIES = 8;

/**
 * Suites that fail on this machine for a reason the commit did not cause: the
 * ICU and Temporal data Node 26 ships. `.scratch/tailwind-migration/README.md`
 * records them (14 tests) and every full run must leave that count unchanged,
 * so a pre-commit must not block on them.
 */
const KNOWN_RED = [
  'calendarDateParser.roundtrip.test.ts',
  'calendarSystem.test.ts',
  'plainDate.test.ts',
  'Calendar.calendarSystems.test.tsx',
  'PowerSearch.calendarSystems.test.tsx',
  'postinstall.test.mjs',
];
const knownRed = file =>
  KNOWN_RED.some(name => file.endsWith(name)) ||
  /\/Timestamp[^/]*\.test\.tsx?$/.test(file);

function stagedFiles() {
  const out = execFileSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
    {
      cwd: ROOT,
      encoding: 'utf8',
    },
  );
  return out.split('\n').filter(Boolean);
}

/** The workspace package a path belongs to, by its `packages/<name>/package.json`. */
function packageOf(file) {
  const segments = file.split('/');
  if (!['packages', 'apps', 'internal'].includes(segments[0])) {
    return null;
  }
  const manifest = path.join(ROOT, segments[0], segments[1], 'package.json');
  if (!fs.existsSync(manifest)) {
    return null;
  }
  const {name} = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  return typeof name === 'string' ? name : null;
}

const files = stagedFiles();
const sources = files.filter(
  file => SOURCE.test(file) && !SKIPPED.test(file) && !IGNORED.test(file),
);

if (sources.length === 0) {
  process.exit(0);
}

if (process.env.SKIP_HEAVY_CHECKS === '1') {
  console.log(
    'SKIP_HEAVY_CHECKS=1: skipped the colocated tests and typecheck.',
  );
  process.exit(0);
}

/** The test files the JSON reporter marked as failed. */
function readFailedFiles(report) {
  if (!fs.existsSync(report)) {
    return [];
  }
  const parsed = JSON.parse(fs.readFileSync(report, 'utf8'));
  return (parsed.testResults ?? [])
    .filter(result => result.status === 'failed')
    .map(result => result.name ?? '');
}

const failures = [];

function run(label, args) {
  process.stdout.write(`\n▸ ${label}\n`);
  try {
    execFileSync('pnpm', args, {cwd: ROOT, stdio: 'inherit'});
  } catch {
    failures.push(label);
  }
}

const directories = [
  ...new Set(sources.map(file => path.dirname(file))),
].sort();
if (directories.length > MAX_TEST_DIRECTORIES) {
  console.log(
    `${directories.length} directories changed: the colocated tests are skipped, the typecheck still runs.`,
  );
} else {
  const report = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'pre-commit-')),
    'report.json',
  );
  const label = `tests beside ${directories.length} directory(ies)`;
  process.stdout.write(`\n▸ ${label}\n`);
  try {
    execFileSync(
      'pnpm',
      [
        'exec',
        'vitest',
        'run',
        '--reporter=dot',
        '--reporter=json',
        `--outputFile=${report}`,
        '--passWithNoTests',
        ...directories,
      ],
      {cwd: ROOT, stdio: 'inherit'},
    );
  } catch {
    // A red suite blocks the commit unless every failing file is one the
    // machine, not the change, breaks.
    const failed = readFailedFiles(report).filter(file => !knownRed(file));
    if (failed.length > 0) {
      failures.push(
        `${label}: ${failed.map(file => path.relative(ROOT, file)).join(', ')}`,
      );
    } else {
      console.log(
        `Only the documented ICU/Temporal suites failed; they do not block.`,
      );
    }
  }
}

for (const name of [
  ...new Set(sources.map(packageOf).filter(Boolean)),
].sort()) {
  run(`typecheck ${name}`, ['-F', name, 'typecheck']);
}

if (failures.length > 0) {
  console.error(
    `\nFailed: ${failures.join(', ')}.\nFix it, or commit with SKIP_HEAVY_CHECKS=1 when the failure predates your change.`,
  );
  process.exit(1);
}
