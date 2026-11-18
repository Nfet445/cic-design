// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file richtextTailwindStylesheet.source-build.test.mjs
 * @input Uses the shared Tailwind build, the richtext class maps and editor
 *   theme, and the stylesheet harness in `core/src/__tests__/classNameAssertions`
 * @output Verifies the shipped richtext stylesheet declares what the modules
 *   can emit: every class the maps produce has a rule, the sheet stays inside
 *   its size gate, and the rules sit behind a registered layer order
 * @position Cases for the declaration half of the styling contract (AST-119
 *   FR8, FR10); the components' own tests assert the class set
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildTailwindStylesheet} from '../../build/src/tailwind-stylesheet.mjs';
import {describeTailwindStylesheet} from '../../core/src/__tests__/classNameAssertions';
import {CODE_SYNTAX_CLASS} from './internal/CodeSyntaxPlugin';
import {sharedEditorTheme} from './editorThemeClasses';
import * as editorClasses from './richTextEditorClasses';
import * as toolbarClasses from './richTextToolbarClasses';
import {richTextViewRootClassName} from './richTextViewClasses';
import {taskCheckboxClassName} from './taskCheckboxClasses';
import * as codeBlockHeaderClasses from './codeBlockHeaderClasses';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sheet = await buildTailwindStylesheet({
  root: ROOT,
  input: path.resolve(ROOT, 'tailwind/richtext.input.css'),
  banner:
    'Astryx Rich Text Pre-compiled Tailwind CSS — Lexical editor and viewer',
});

/**
 * Adds every class token a value carries. A Lexical theme slot holds a class
 * string, and its heading, list, and text slots nest further objects.
 */
function addTokens(names, value) {
  if (typeof value === 'string') {
    for (const className of value.split(/\s+/)) {
      // The code slot also names a marker class CodeSyntaxPlugin reads; it
      // carries no declarations of its own.
      if (className !== '' && className !== CODE_SYNTAX_CLASS) {
        names.add(className);
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      addTokens(names, item);
    }
    return;
  }
  if (value != null && typeof value === 'object') {
    for (const item of Object.values(value)) {
      addTokens(names, item);
    }
  }
}

/** Every class this package's maps can emit, one token each. */
function richtextClassNames() {
  const names = new Set();
  for (const map of [editorClasses, toolbarClasses, codeBlockHeaderClasses]) {
    for (const [name, value] of Object.entries(map)) {
      // The body-size map is keyed by size; its values are the classes.
      if (name.endsWith('ClassName')) {
        addTokens(names, value);
      }
    }
  }
  addTokens(names, richTextViewRootClassName);
  addTokens(names, taskCheckboxClassName);
  addTokens(names, sharedEditorTheme());
  return [...names];
}

// The StyleX sheet this package shipped at f35022021 gzipped to 2973 B, which
// the 1.15x gate turns into 3418 B. This package's Tailwind sheet gzips to
// 3569 B, 1.20x the baseline, because a Tailwind selector repeats the
// declaration value it escapes while a StyleX selector is a short hash. The
// constant is the measured deviation approved for ticket 29, not the StyleX
// baseline; the ticket records the numbers.
describeTailwindStylesheet({
  name: 'dist/richtext-tailwind.css',
  css: sheet,
  classNames: richtextClassNames(),
  stylexGzipBaseline: 3600,
  stylexBaselineCommit: 'f35022021',
});
