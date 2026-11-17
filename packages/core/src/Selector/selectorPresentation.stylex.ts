// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file selectorPresentation.stylex.ts
 * @input Uses field border tokens
 * @output Shared focus-return styles for Selector and MultiSelector
 * @position Internal visual policy for selector presentation changes
 * @deprecated Internal visual seam: it is not a public API and it
 *   disappears when StyleX leaves the package.
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';

export const selectorPresentationStyles = stylex.create({
  pointerRestoredFocus: {
    borderColor: colorVars['--color-border-emphasized'],
    boxShadow: 'none',
    outlineWidth: '0',
    outlineStyle: 'none',
  },
});
