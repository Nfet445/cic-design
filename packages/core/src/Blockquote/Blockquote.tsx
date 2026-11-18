// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Blockquote.tsx
 * @input Uses React, the blockquote class map, and the xstyle adapter for the
 *   consumer's `xstyle`
 * @output Exports Blockquote component and BlockquoteProps
 * @position Blockquote component; renders styled quotations with optional attribution
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Blockquote/Blockquote.doc.mjs
 * - /packages/core/src/Blockquote/Blockquote.test.tsx
 * - /apps/storybook/stories/Blockquote.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Blockquote/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {
  blockquoteCiteClassName,
  blockquoteClassName,
} from './blockquoteClasses';
import {isRenderable, mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {xstyleProps} from '../utils/xstyle';

export interface BlockquoteProps extends BaseProps<HTMLQuoteElement> {
  /** Ref forwarded to the root <blockquote> element */
  ref?: React.Ref<HTMLQuoteElement>;
  /** Content of the blockquote */
  children: ReactNode;
  /**
   * Optional attribution for the quote. Rendered in a `<cite>` element after
   * the quoted content.
   */
  cite?: ReactNode;
}

/**
 * Blockquote component for displaying quoted content.
 *
 * Renders a semantic `<blockquote>` with an inline-start rule and secondary
 * text color, matching the Astryx visual language.
 *
 * @example
 * ```
 * <Blockquote>Design is not just what it looks like.</Blockquote>
 * ```
 */
export function Blockquote({
  children,
  cite,
  xstyle,
  className,
  style,
  ref,
  ...props
}: BlockquoteProps) {
  return (
    <blockquote
      ref={ref}
      {...mergeProps(
        themeProps('blockquote'),
        {
          className: tw(blockquoteClassName, xstyleProps(xstyle).className),
        },
        className,
        style,
      )}
      {...props}>
      {children}
      {/*
        A bare <cite>, never wrapped in <footer>: <blockquote> is a sectioning
        root, so a <footer> inside it maps to a contentinfo document landmark.
      */}
      {isRenderable(cite) && (
        <cite className={blockquoteCiteClassName}>{cite}</cite>
      )}
    </blockquote>
  );
}

Blockquote.displayName = 'Blockquote';
