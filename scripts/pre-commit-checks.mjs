// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pre-commit-checks.mjs
 * @description Runs the checks a commit must not skip: the tests related to the
 * staged files and the typecheck of the packages they touch.
 *
 * `lint-staged` formats and lints what is staged, and `check:repo` covers the
 * repository invariants, but neither compiles a type or runs a test. A worker
 * can therefore commit a change that no suite has ever loaded.
 *
 * A commit that touches no source file exits at once, so documentation and
 * ticket edits stay fast. `SKIP_HEAVY_CHECKS=1` skips both steps for a commit
 * that knowingly breaks them, and prints what it skipped.
 */

import {execFileSync} from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SOURCE = /\.(?:ts|tsx)$/;
const SKIPPED = /(?:\.test\.tsx?|\.testing\.tsx?|\.doc\.mjs|\.stylex\.tsx?|\.d\.ts)$/;
const IGNORED = /^(?:docs|\.scratch|\.changeset|\.github)\//;

function stagedFiles() {
  const out = execFileSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  return out.split('\n').filter(Boolean);
}

/** The workspace package a path belongs to, by its nearest `package.json`. */
function packageOf(file) {
  const segments = file.split('/');
  if (segments[0] !== 'packages' && segments[0] !== 'apps' && segments[0] !== 'internal') {
    return null;
  }
  const candidate = segments.slice(0, 2).join('/');
  return candidate;
}

const files = stagedFiles();
const sources = files.filter(
  file => SOURCE.test(file) && !SKIPPED.test(file) && !IGNORED.test(file),
);

if (sources.length === 0) {
  process.exit(0);
}

if (process.env.SKIP_HEAVY_CHECKS === '1') {
  console.log('SKIP_HEAVY_CHECKS=1: skipped the related tests and typecheck.');
  process.exit(0);
}

let failed = false;

function run(label, command, args) {
  process.stdout.write(`\n▸ ${label}\n`);
  try {
    execFileSync(command, args, {cwd: ROOT, stdio: 'inherit'});
  } catch {
    failed = true;
  }
}

// The tests that load one of the staged files, and their own suite.
run(`related tests for ${sources.length} file(s)`, 'pnpm', [
  'exec',
  'vitest',
  'related',
  '--run',
  '--passWithNoTests',
  ...sources,
]);

const packages = [...new Set(sources.map(packageOf).filter(Boolean))]
  .filter(name => !name.endsWith('/cli'))
  .sort();
for (const name of packages) {
  run(`typecheck ${name}`, 'pnpm', ['-F', name, 'typecheck']);
}

if (failed) {
  console.error(
    '\nA check above failed. Fix it, or commit with SKIP_HEAVY_CHECKS=1 if the breakage is intended.',
  );
  process.exit(1);
}
