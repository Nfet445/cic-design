// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file labTailwindStylesheet.source-build.test.mjs
 * @input Uses the shared Tailwind build and the stylesheet harness in
 *   `core/src/__tests__/classNameAssertions`
 * @output Verifies the shipped lab stylesheet declares what the components can
 *   emit: every class the maps produce has a rule, the sheet stays inside its
 *   size gate, and the rules sit behind a registered layer order
 * @position Cases for the declaration half of the styling contract (AST-119
 *   FR8, FR10); the components' own tests assert the class set
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {buildTailwindStylesheet} from '../../build/src/tailwind-stylesheet.mjs';
import {describeTailwindStylesheet} from '../../core/src/__tests__/classNameAssertions';
import * as chatEmojiPickerClasses from './Chat/chatEmojiPickerClasses';
import * as chatReactionBarClasses from './Chat/chatReactionBarClasses';
import * as chatReasoningClasses from './ChatReasoning/chatReasoningClasses';
import * as chatTypingIndicatorClasses from './Chat/chatTypingIndicatorClasses';
import * as chatUnreadDividerClasses from './Chat/chatUnreadDividerClasses';
import * as diffViewerClasses from './DiffViewer/diffViewerClasses';
import * as listInputClasses from './ListInput/listInputClasses';
import * as loadingMessageClasses from './loadingMessageClasses';
import * as transferListClasses from './TransferList/transferListClasses';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const sheet = await buildTailwindStylesheet({
  root: ROOT,
  input: path.resolve(ROOT, 'tailwind/lab.input.css'),
  banner: 'Astryx Lab Pre-compiled Tailwind CSS — experimental components',
});

/** Every class this package's migrated maps can emit, one token each. */
function labClassNames() {
  const names = new Set();
  const add = value => {
    for (const className of value.split(/\s+/)) {
      if (className !== '') {
        names.add(className);
      }
    }
  };
  for (const map of [
    chatEmojiPickerClasses,
    chatReactionBarClasses,
    chatReasoningClasses,
    chatTypingIndicatorClasses,
    chatUnreadDividerClasses,
    diffViewerClasses,
    listInputClasses,
    loadingMessageClasses,
    transferListClasses,
  ]) {
    for (const [name, value] of Object.entries(map)) {
      if (name.endsWith('ClassName')) {
        add(value);
      }
    }
  }
  return [...names];
}

// Lab's StyleX sheet still carries most of the package: 12 514 B gzip when
// measured, because 54 of its 58 `stylex.create` calls have not moved. The
// Tailwind sheet holds only the migrated components, so it stays far inside
// 1.15 × that baseline; the constant records the measured StyleX number rather
// than a gate the sheet can reach.
describeTailwindStylesheet({
  name: 'dist/lab-tailwind.css',
  css: sheet,
  classNames: labClassNames(),
  stylexGzipBaseline: 12514,
  stylexBaselineCommit: 'f35022021',
});
