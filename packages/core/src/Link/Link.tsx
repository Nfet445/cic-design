// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Link.tsx
 * @input Uses React, AnchorHTMLAttributes, ReactNode
 * @output Exports Link component, LinkProps
 * @position Core implementation; consumed by index.ts, tested by Link.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/Link.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Link/Link.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Link/index.ts (exports if types change)
 * - /apps/storybook/stories/Link.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Link/ (showcase blocks)
 */

import {use, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';

import {Icon} from '../Icon';
import {Tooltip} from '../Tooltip';
import {Text} from '../Text';
import {TextClampContext} from '../Text/textClampContext';
import {VisuallyHidden} from '../VisuallyHidden';
import type {
  TextType,
  TextSize,
  TextColor,
  TextWeight,
  TextDisplay,
} from '../theme/types';
import {useLinkComponent} from './useLinkComponent';
import type {LinkComponentType} from './types';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {
  linkClassName,
  linkColorClassName,
  linkExternalIconInClampedTextClassName,
  linkLabelClassName,
} from './linkClasses';
import {computeTargetAndRel} from './computeTargetAndRel';
import {useInteractiveRole} from '../hooks/useInteractiveRole';
import {themeDataAttributes, themeProps} from '../utils/themeProps';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {interactionOverlayPressedBackgroundColorClassName} from '../utils/interactionOverlayClasses';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {disabledInteractionProps} from '../utils/disabledInteraction';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/Link/Link.generated';

registerEnglishFallback(english);

export interface LinkProps extends BaseProps<
  HTMLAnchorElement | HTMLButtonElement
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLAnchorElement | HTMLButtonElement>;
  /**
   * Custom component to render instead of `<a>`.
   * Overrides the provider-level default set by LinkProvider.
   * Must accept href, className, style, and children props.
   * Only used when href is provided.
   */
  as?: LinkComponentType;
  /**
   * Accessible label for the link.
   * Used as aria-label when content is not self-descriptive
   * (e.g. icon-only links). When children are text, this is
   * unnecessary — the link text itself serves as the label.
   */
  label?: string;
  /**
   * Link destination URL.
   * When undefined, renders as a `<button>` with link styling
   * for semantic correctness and accessibility.
   */
  href?: string;
  /**
   * Whether the link should always display an underline.
   * When false, underline only appears on hover.
   * @default false
   */
  hasUnderline?: boolean;
  /**
   * Whether the link is disabled.
   * A disabled link cannot navigate or run onClick. With `href` and no
   * `onClick` it renders as a plain anchor without an href, target, or rel;
   * with `onClick` it renders as a link-styled button. It keeps a tab stop and
   * is announced as disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the link opens in a new tab with an external link icon.
   * When true, sets target="_blank" and rel="noopener noreferrer".
   * @default false
   */
  isExternalLink?: boolean;
  /**
   * Screen-reader text appended to an external link to announce that it opens
   * in a new tab (the visual icon is decorative). Override for localization.
   * @default '(opens in new tab)'
   */
  newTabLabel?: string;
  /**
   * Where to open the linked document.
   * Overridden to "_blank" when isExternalLink is true.
   */
  target?: string;
  /**
   * Link relationship (e.g. "noopener noreferrer").
   * Automatically includes "noopener noreferrer" when isExternalLink is true.
   */
  rel?: string;
  /**
   * Causes the browser to download the linked URL. A string value
   * specifies the suggested filename.
   */
  download?: string | boolean;
  /**
   * Referrer policy for the link.
   */
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  /**
   * Click handler. Fires before navigation (when href is set),
   * or as the primary action (when href is undefined).
   */
  onClick?: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  /**
   * Tooltip text to display on hover.
   */
  tooltip?: string;
  /**
   * Whether the link is standalone (not inline within text).
   * Applies base font sizing when true.
   * @default false
   */
  isStandalone?: boolean;
  /**
   * Semantic text type for Text. Determines base typography.
   *
   * Use `type="inherit"` for inline links inside an existing `Text` element so
   * the link adopts the surrounding text's size and line-height instead of
   * imposing its own (e.g. a link within a `large` paragraph).
   * @default 'body'
   */
  type?: TextType;
  /**
   * Explicit font size override. Forwarded to Text.
   */
  size?: TextSize;
  /**
   * Font weight override. Forwarded to Text.
   */
  weight?: TextWeight;
  /**
   * Text color. Forwarded to Text.
   * @default 'accent'
   */
  color?: TextColor;
  /**
   * Display type for Text. Forwarded to Text.
   * @default 'inline'
   */
  display?: TextDisplay;
  /**
   * Maximum lines before truncation. Forwarded to Text.
   * @default 0
   */
  maxLines?: number;
  /**
   * Link content (required).
   */
  children: ReactNode;
}

type LinkKeyDownHandler = React.KeyboardEventHandler<
  HTMLAnchorElement | HTMLButtonElement
>;

// Spread these props after the caller's props, so a caller `aria-disabled` or
// `role` cannot replace them. A caller `tabIndex` still applies, so a disabled
// Link keeps the focus order it has when enabled.
function disabledAnchorProps(onKeyDown?: LinkKeyDownHandler) {
  return {
    ...disabledInteractionProps(onKeyDown),
    role: 'link',
    'aria-disabled': true,
  } as const;
}

// The native button keeps its own role.
function disabledButtonProps(onKeyDown?: LinkKeyDownHandler) {
  return {
    ...disabledInteractionProps(onKeyDown),
    role: undefined,
    'aria-disabled': true,
  } as const;
}

/**
 * A styled anchor link component.
 *
 * Uses Text internally for typography styling.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <Link href="/docs">Documentation</Link>
 * <Link href="https://github.com" isExternalLink>GitHub</Link>
 * <Link href="/settings" color="secondary">Settings</Link>
 * <Link href="/privacy" hasUnderline>Privacy Policy</Link>
 * <Link label="Close dialog" href="/home"><Icon icon="x" /></Link>
 * <Text type="large">
 *   Read our <Link href="/terms" type="inherit">terms</Link> first.
 * </Text>
 * ```
 */
export function Link({
  as,
  label,
  href,
  hasUnderline = false,
  isDisabled = false,
  isExternalLink = false,
  newTabLabel: newTabLabelFromProps,
  target: targetFromProps,
  onClick,
  tooltip,
  isStandalone = false,
  type = 'body',
  size,
  weight,
  color = 'accent',
  display = 'inline',
  maxLines = 0,
  children,
  rel: relFromProps,
  xstyle,
  className,
  style,
  ref,
  ...props
}: LinkProps) {
  // Constant marker props; the hook's only effect is installing the shared
  // document controller once, so the link's output stays a pure function of
  // its props.
  const pressable = usePressFeedback();
  const t = useComponentTranslator();
  const newTabLabel = newTabLabelFromProps ?? t('@astryx.link.newTab');
  const LinkComponent = useLinkComponent(as);
  const role = useInteractiveRole({href, onClick, isDisabled});
  // Determine target and rel based on isExternalLink
  const {target, rel} = computeTargetAndRel(
    isExternalLink ? '_blank' : targetFromProps,
    relFromProps,
  );

  // When role resolves to 'button' (no href, or context-provided),
  // render as a <button> with link styling for semantic correctness.
  const renderAsButton =
    role === 'button' || (role === 'inert' && href == null);
  const isExternalWithIcon = isExternalLink && !renderAsButton;
  // Link reads the enclosing Text's clamp, never its own children (AV1). A
  // Link with its own display or clamp keeps its own box.
  const isInClampedText =
    use(TextClampContext) && display === 'inline' && maxLines === 0;

  // The reflected theme attributes win over a caller's same-named `data-*`, so
  // theme targeting always sees the real value (public-component-api INV5).
  const reflectedAttributes = themeDataAttributes({color});
  // For a color the root paints, the label inherits it, so the label, the
  // underline, and the icon keep one color at rest and on hover, whatever a
  // theme sets on its text targets.
  const labelColor: TextColor = color in linkColorClassName ? 'inherit' : color;

  // The link's own paint, kept before the caller's className so a consumer
  // rule still merges last.
  const rootClassName = tw(
    linkClassName({
      hasUnderline,
      isButton: renderAsButton,
      isDisabled,
      // A button is its own box: a clamp never cuts a control's own content,
      // so it keeps the inline-flex form.
      isInClampedText: isInClampedText && !renderAsButton,
      isStandalone,
      isTruncating: maxLines > 0,
    }),
    linkColorClassName[color],
  );

  const sharedContent = (
    <>
      <Text
        type={type}
        size={size}
        weight={weight}
        color={labelColor}
        display={display}
        maxLines={maxLines}
        className={linkLabelClassName}>
        {children}
      </Text>
      {isExternalWithIcon && (
        <>
          <Icon
            icon="externalLink"
            size="xsm"
            color="inherit"
            className={
              isInClampedText
                ? linkExternalIconInClampedTextClassName
                : undefined
            }
          />
          {/* The label and the hint are adjacent inline boxes, so the hint
              needs a word boundary of its own: without it a screen reader
              reads `Docs(opens in new tab)`. */}{' '}
          <VisuallyHidden>{newTabLabel}</VisuallyHidden>
        </>
      )}
    </>
  );

  let linkElement: React.ReactElement;

  if (renderAsButton) {
    linkElement = (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        {...(isDisabled ? undefined : pressable)}
        aria-label={label || undefined}
        {...mergeProps(
          themeProps('link', {color}),
          stylex.props(
            // The strength and the release; the press paint is a class below.
            !isDisabled && interactionOverlayStyles.pressedAlpha,
            xstyle,
          ),
          tw(
            rootClassName,
            className,
            // The system's pressed overlay behind the text; the hover stays
            // the colour change above, so a press is the one background it
            // paints.
            !isDisabled && interactionOverlayPressedBackgroundColorClassName,
            focusOutlineFocusVisibleClassName,
          ),
          style,
        )}
        {...props}
        {...reflectedAttributes}
        {...(isDisabled ? disabledButtonProps(props.onKeyDown) : null)}>
        {sharedContent}
      </button>
    );
  } else if (isDisabled) {
    // A disabled link renders as an <a> with no href, so nothing can navigate
    // and the consumer onClick never fires. It keeps a Tab stop and the link
    // role so keyboard and screen-reader users still find it. The router
    // LinkComponent is deliberately skipped — a disabled link performs no
    // navigation, and custom router links may require a live href. target/rel
    // are omitted with the href.
    linkElement = (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        aria-label={label || undefined}
        tabIndex={0}
        {...mergeProps(
          themeProps('link', {color}),
          stylex.props(xstyle),
          tw(rootClassName, className, focusOutlineFocusVisibleClassName),
          style,
        )}
        {...props}
        {...reflectedAttributes}
        {...disabledAnchorProps(props.onKeyDown)}>
        {sharedContent}
      </a>
    );
  } else {
    linkElement = (
      <LinkComponent
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        {...(isDisabled ? undefined : pressable)}
        aria-label={label || undefined}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        {...mergeProps(
          themeProps('link', {color}),
          stylex.props(
            // The strength and the release; the press paint is a class below.
            !isDisabled && interactionOverlayStyles.pressedAlpha,
            xstyle,
          ),
          tw(
            rootClassName,
            className,
            !isDisabled && interactionOverlayPressedBackgroundColorClassName,
            focusOutlineFocusVisibleClassName,
          ),
          style,
        )}
        {...props}
        {...reflectedAttributes}>
        {sharedContent}
      </LinkComponent>
    );
  }

  // Wrap with tooltip if provided
  if (tooltip) {
    return (
      <Tooltip content={tooltip} placement="above">
        {linkElement}
      </Tooltip>
    );
  }

  return linkElement;
}

Link.displayName = 'Link';
