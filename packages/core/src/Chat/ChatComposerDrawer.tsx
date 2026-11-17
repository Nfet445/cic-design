// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatComposerDrawer.tsx
 * @input Uses React, StyleX, Tailwind classes from chatClasses
 * @output Exports ChatComposerDrawer component
 * @position Collapsible drawer panel for ChatComposer.
 *   Supports expanded (full content) and collapsed (default or caller-composed
 *   summary) states with fade animation and grid-template-rows height transition.
 *   The collapse toggle exposes aria-expanded + aria-controls linking it to
 *   the content region (disclosure pattern).
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/ChatComposerDrawer.test.tsx
 * - /packages/core/src/Chat/ChatComposerDrawer.doc.mjs
 * - /docs/specs/components/Chat/ChatComposerDrawer.spec.md
 * - /apps/storybook/stories/ChatComposerDrawer.stories.tsx
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/cli/assets/templates/blocks/components/ChatComposerDrawer/ (block examples)
 */

import {useId, useState, type ReactNode} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import * as stylex from '@stylexjs/stylex';
import {Badge} from '../Badge';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {
  chatComposerDrawerClassName,
  chatComposerDrawerContentClassName,
  chatComposerDrawerContentGridClassName,
  chatComposerDrawerHandleClassName,
  chatComposerDrawerLabelClassName,
  chatComposerDrawerToggleContentClassName,
  chatComposerDrawerToggleRowClassName,
} from './chatClasses';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Chat/ChatComposerDrawer.generated';

registerEnglishFallback(english);

export interface ChatComposerDrawerProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Content to render inside the drawer — attachments, context chips, previews, etc.
   */
  children: ReactNode;
  /**
   * Total item count — shown in the collapsed badge.
   * When omitted, the component doesn't support collapse.
   */
  count?: number;
  /**
   * Label shown next to the count in the default collapsed summary and used to
   * name the expand/collapse action.
   * @default 'Items'
   */
  label?: string;
  /**
   * Visual content for the canonical Collapsed summary anatomy part. Replaces
   * the complete default Badge and label when count enables collapse. The
   * component keeps this content presentation-only and owns disclosure
   * semantics and accessible naming.
   */
  collapsedSummary?: ReactNode;
  /**
   * Whether the drawer is collapsed.
   * Uncontrolled by default (internal toggle).
   */
  isCollapsed?: boolean;
  /**
   * Default collapsed state for uncontrolled usage.
   * @default false
   */
  defaultIsCollapsed?: boolean;
  /**
   * Callback when collapsed state changes.
   */
  onCollapsedChange?: (isCollapsed: boolean) => void;

  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   *
   * @example
   * ```
   * const styles = stylex.create({ wrapper: { marginTop: 8 } });
   * <ChatComposerDrawer xstyle={styles.wrapper}>
   *   <AttachmentThumbnail />
   * </ChatComposerDrawer>
   * ```
   */
  xstyle?: StyleXStyles;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

/**
 * Collapsible drawer panel for a chat composer.
 * Use for attachments, context chips, or any supplementary content above the input.
 *
 * @example
 * ```
 * <ChatComposerDrawer count={3}>
 *   <AttachmentThumbnail />
 *   <AttachmentThumbnail />
 * </ChatComposerDrawer>
 * ```
 */
export function ChatComposerDrawer({
  ref,
  children,
  count,
  label: labelFromProps,
  collapsedSummary,
  isCollapsed: controlledCollapsed,
  defaultIsCollapsed = false,
  onCollapsedChange,
  xstyle,
  className,
  style,
  'data-testid': testId,
  ...htmlProps
}: ChatComposerDrawerProps): React.ReactElement {
  const t = useComponentTranslator();
  const label = labelFromProps ?? t('@astryx.chat.composerDrawer.label');
  const [internalCollapsed, setInternalCollapsed] =
    useState(defaultIsCollapsed);
  const isControlled = controlledCollapsed !== undefined;
  const isCollapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const canCollapse = count != null;

  // Links the toggle to the region it shows/hides so assistive tech can move
  // from the button to its controlled content (disclosure pattern). The
  // content stays mounted while collapsed (hidden via the grid-row collapse),
  // so the reference always resolves.
  const contentId = useId();

  const toggle = () => {
    const next = !isCollapsed;
    if (!isControlled) {
      setInternalCollapsed(next);
    }
    onCollapsedChange?.(next);
  };

  return (
    <div
      ref={ref}
      data-testid={testId}
      {...mergeProps(
        themeProps('chat-composer-drawer', {
          collapsed: isCollapsed ? 'collapsed' : null,
        }),
        tw(
          chatComposerDrawerClassName,
          xstyle && stylex.props(xstyle).className,
        ),
        className,
        style,
      )}
      {...htmlProps}>
      {canCollapse && (
        <div
          {...mergeProps(
            chatComposerDrawerToggleRowClassName,
            focusOutlineProps.focusVisible(stylex.defaultMarker()),
          )}
          role="button"
          tabIndex={0}
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
          aria-label={
            isCollapsed
              ? t('@astryx.chatComposerDrawer.expand', {label})
              : t('@astryx.chatComposerDrawer.collapse', {label})
          }
          onClick={toggle}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggle();
            }
          }}>
          <div
            aria-hidden="true"
            inert
            className={chatComposerDrawerToggleContentClassName(!isCollapsed)}>
            {collapsedSummary === undefined ? (
              <>
                <Badge variant="neutral" label={count} />
                <span className={chatComposerDrawerLabelClassName}>
                  {label}
                </span>
              </>
            ) : (
              collapsedSummary
            )}
          </div>
          <div className={chatComposerDrawerHandleClassName(isCollapsed)} />
        </div>
      )}

      <div
        id={contentId}
        // The 0fr row keeps the collapse animation in place. `inert` also
        // removes visually hidden descendants from keyboard and assistive-
        // technology navigation until the drawer expands again.
        inert={canCollapse && isCollapsed ? true : undefined}
        className={chatComposerDrawerContentGridClassName(
          canCollapse && isCollapsed,
        )}>
        <div
          className={chatComposerDrawerContentClassName(
            canCollapse && isCollapsed,
          )}>
          {children}
        </div>
      </div>
    </div>
  );
}

ChatComposerDrawer.displayName = 'ChatComposerDrawer';
