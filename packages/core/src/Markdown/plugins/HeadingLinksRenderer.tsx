// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HeadingLinksRenderer.tsx
 * @input A built-in semantic heading and its module-owned identity projection
 * @output Inline heading-permalink copy composition with isolated control geometry
 * @position Internal renderer owned by module:Markdown/headingLinks
 */

import {useCallback} from 'react';
import type {MouseEvent, ReactElement} from 'react';
import {Button} from '../../Button/Button';
import {Icon} from '../../Icon';
import {useClipboard} from '../../hooks/useClipboard';
import {useContainerReveal} from '../../hooks/useContainerReveal';
import {mergeProps, rtlStyles} from '../../utils';
import {tw} from '../../utils/tw';
import {
  markdownCenterAlignClassName,
  markdownHeadingLinksControlSlotClassName,
  markdownHeadingLinksGlyphClassName,
  markdownHeadingLinksProbeClassName,
  markdownHeadingRowClassName,
  markdownProseWidthClassName,
  markdownProseWidthStyle,
} from '../markdownClasses';
import {markdownHeadingLinksCopyButtonStyles} from '../markdownChildOverrides.stylex';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../../i18n/useComponentTranslator';
import english from '../../i18n/generated-english/Markdown/plugins/HeadingLinksRenderer.generated';

registerEnglishFallback(english);

const COPY_FEEDBACK_MS = 1500;

interface HeadingLinksRendererProps {
  readonly children: ReactElement;
  readonly headingId: string;
  readonly headingLabel: string;
  readonly permalinkUrl: string;
  readonly contentWidth: string | null;
  readonly contentAlign: 'start' | 'center';
  readonly headingTextClassName: string;
  readonly blockSpacingClassName: string;
  /** The heading's own direction; the copy control follows its inline end. */
  readonly dir?: 'ltr' | 'rtl';
}

function isUnmodifiedPrimaryActivation(
  event: MouseEvent<HTMLButtonElement>,
): boolean {
  return (
    event.button === 0 &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

/** @internal Portable renderer composed by Markdown for built-in headings only. */
export function HeadingLinksRenderer({
  children,
  headingId,
  headingLabel,
  permalinkUrl,
  contentWidth,
  contentAlign,
  headingTextClassName,
  blockSpacingClassName,
  dir,
}: HeadingLinksRendererProps): ReactElement {
  const t = useComponentTranslator();
  const copiedLabel = t('@astryx.markdownHeadingLinks.copied');
  const copyLabel = t('@astryx.markdownHeadingLinks.copy', {
    heading: headingLabel || headingId,
  });
  const {copy, isCopied} = useClipboard({
    announce: copiedLabel,
    resetAfterMs: COPY_FEEDBACK_MS,
  });
  const {getContainerProps, getContentRevealProps} = useContainerReveal();
  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!isUnmodifiedPrimaryActivation(event)) {
        return;
      }
      // This is deliberately an honest copy button rather than an anchor: the
      // heading remains an incoming fragment target, while activating the #
      // never mutates location, scrolls, or implies open-in-new-tab semantics.
      void copy(new URL(permalinkUrl, window.location.href).href);
    },
    [copy, permalinkUrl],
  );

  return (
    <div
      dir={dir}
      {...mergeProps(getContainerProps(), {
        className: tw(
          markdownHeadingRowClassName,
          headingTextClassName,
          blockSpacingClassName,
          contentWidth != null && markdownProseWidthClassName,
          contentAlign === 'center' && markdownCenterAlignClassName,
        ),
        style:
          contentWidth != null
            ? markdownProseWidthStyle(contentWidth)
            : undefined,
      })}>
      {children}
      <span className={markdownHeadingLinksControlSlotClassName}>
        <span aria-hidden="true" className={markdownHeadingLinksProbeClassName}>
          #
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          label={isCopied ? copiedLabel : copyLabel}
          icon={
            <span
              aria-hidden="true"
              className={markdownHeadingLinksGlyphClassName}>
              {isCopied ? <Icon icon="check" size="sm" color="inherit" /> : '#'}
            </span>
          }
          isIconOnly
          onClick={handleClick}
          xstyle={[
            markdownHeadingLinksCopyButtonStyles.overrides,
            rtlStyles.centerInline('-50%'),
          ]}
          {...getContentRevealProps({isLayoutPreserved: true})}
        />
      </span>
    </div>
  );
}
