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
import * as chatVirtualizerClasses from './Chat/chatVirtualizerClasses';
import * as circularProgressClasses from './CircularProgress/circularProgressClasses';
import * as codeEditorClasses from './CodeEditor/codeEditorClasses';
import * as scrollEdgeEffectClasses from './internal/scrollEdgeEffectClasses';
import * as svgIconClasses from './SVGIcon/svgIconClasses';
import * as commentPinClasses from './CommentPin/commentPinClasses';
import * as commentActionsClasses from './Comments/commentActionsClasses';
import * as commentComposerClasses from './Comments/commentComposerClasses';
import * as commentMarkdownClasses from './Comments/commentMarkdownClasses';
import * as commentPartsClasses from './Comments/commentPartsClasses';
import * as commentRowClasses from './Comments/commentRowClasses';
import * as circleCheckClasses from './CircleCheckIndicator/circleCheckClasses';
import {
  circleBarClassName,
  circleCheckmarkClassName,
  circleClassName,
} from './CircleCheckIndicator/circleCheckClasses';
import * as commentsClasses from './Comments/commentsClasses';
import * as dialogHeroHeaderClasses from './DialogHeroHeader/dialogHeroHeaderClasses';
import * as diffViewerClasses from './DiffViewer/diffViewerClasses';
import * as emojiPickerClasses from './EmojiPicker/emojiPickerClasses';
import * as lineClampClasses from './LineClamp/lineClampClasses';
import * as listInputClasses from './ListInput/listInputClasses';
import * as loadingMessageClasses from './loadingMessageClasses';
import * as logStreamClasses from './LogStream/logStreamClasses';
import * as scheduleClasses from './Schedule/scheduleClasses';
import * as navigationStackClasses from './NavigationStack/navigationStackClasses';
import * as pageControlClasses from './PageControl/pageControlClasses';
import * as radialChartClasses from './Radial/radialChartClasses';
import * as selectableCardGroupClasses from './SelectableCardGroup/selectableCardGroupClasses';
import * as tabBarClasses from './TabBar/tabBarClasses';
import * as statClasses from './Stat/statClasses';
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
    chatVirtualizerClasses,
    circularProgressClasses,
    codeEditorClasses,
    commentActionsClasses,
    commentComposerClasses,
    commentMarkdownClasses,
    commentPartsClasses,
    commentPinClasses,
    commentRowClasses,
    circleCheckClasses,
    svgIconClasses,
    commentsClasses,
    dialogHeroHeaderClasses,
    diffViewerClasses,
    emojiPickerClasses,
    lineClampClasses,
    listInputClasses,
    loadingMessageClasses,
    logStreamClasses,
    navigationStackClasses,
    pageControlClasses,
    radialChartClasses,
    scheduleClasses,
    scrollEdgeEffectClasses,
    statClasses,
    tabBarClasses,
    transferListClasses,
  ]) {
    for (const [name, value] of Object.entries(map)) {
      // A factory takes its state as an argument; its arms are added below.
      if (typeof value === 'function') {
        continue;
      }
      if (name.endsWith('ClassName')) {
        add(value);
      } else if (name.endsWith('ClassNames')) {
        for (const variant of Object.values(value)) {
          add(variant);
        }
      }
    }
  }
  // The circle's maps are factories, so each state and size is named here.
  for (const size of ['sm', 'md']) {
    add(circleClassName({size, isFilled: true, isDisabled: false}));
    add(circleClassName({size, isFilled: false, isDisabled: false}));
    add(circleClassName({size, isFilled: false, isDisabled: true}));
    add(circleCheckmarkClassName({size, isVisible: true}));
    add(circleCheckmarkClassName({size, isVisible: false}));
    add(circleBarClassName({size, isVisible: true}));
    add(circleBarClassName({size, isVisible: false}));
  }
  return [...names];
}

// The baseline is the lab StyleX sheet as measured at f35022021 (12 514 B
// gzip), when 54 of its 58 `stylex.create` calls were still StyleX. The
// constant records that measurement, not a gate the sheet can reach: the
// StyleX sheet now holds only the rules that must outrank a utility or read a
// marker.
describeTailwindStylesheet({
  name: 'dist/lab-tailwind.css',
  css: sheet,
  classNames: labClassNames(),
  stylexGzipBaseline: 12514,
  stylexBaselineCommit: 'f35022021',
});
