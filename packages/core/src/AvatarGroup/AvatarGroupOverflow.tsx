// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file AvatarGroupOverflow.tsx
 * @input Uses React, StyleX, AvatarGroupContext, i18n (useComponentTranslator)
 * @output Exports AvatarGroupOverflow for overflow indicator
 * @position Slot component used inside AvatarGroup
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AvatarGroup/AvatarGroup.doc.mjs
 * - /packages/core/src/AvatarGroup/index.ts
 * - /apps/storybook/stories/AvatarGroupOverflow.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/AvatarGroup/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {shapeStyles} from '../Avatar/Avatar';
import {mergeProps} from '../utils';
import {tw} from '../utils/tw';
import {resolveSize} from '../Avatar';
import {useAvatarGroup} from './AvatarGroupContext';
import {AVATAR_GROUP_OVERLAP_VAR} from './avatarGroupClasses';
import {avatarGroupOverflowClassName} from './avatarGroupOverflowClasses';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/AvatarGroup/AvatarGroupOverflow.generated';

registerEnglishFallback(english);

const BORDER_WIDTH = 2;
const OVERFLOW_FONT_RATIO = 0.35;

export interface AvatarGroupOverflowProps extends Omit<
  BaseProps<HTMLElement>,
  'onClick'
> {
  ref?: React.Ref<HTMLElement>;
  /**
   * The overflow count to display.
   */
  count: number;

  /**
   * Callback fired when the overflow indicator is clicked.
   * When provided, the indicator renders as a focusable button.
   */
  onClick?: () => void;

  /**
   * Custom content to render instead of the default "+N" label.
   */
  children?: ReactNode;
}

/**
 * Pin the height to the avatar's rendered size and enforce the same value as a
 * *minimum* width, so a short count (`+5`) renders a perfect circle while
 * longer content (`+4912`) grows into a stadium. The border is added to the
 * declared size, like the avatars' ring, to keep the chip the same overall size
 * as its siblings.
 *
 * The font size scales with the avatar but never falls below the
 * supporting-text token, the 12px legibility floor: at xsm the bare ratio
 * computes 7px, where the glyph stroke is thinner than a pixel and never
 * reaches its own text colour (measured 1.63:1 against a 4.5:1 requirement).
 */
function overflowBoxStyle(
  numericSize: number,
  overlap: number,
): React.CSSProperties {
  return {
    minWidth: numericSize + BORDER_WIDTH * 2,
    height: numericSize + BORDER_WIDTH * 2,
    fontSize: `max(var(--text-supporting-size), ${
      numericSize * OVERFLOW_FONT_RATIO
    }px)`,
    [AVATAR_GROUP_OVERLAP_VAR as string]: `${-overlap}px`,
  };
}

/**
 * Overflow indicator for AvatarGroup. Shows a "+N" count and
 * optionally handles clicks.
 *
 * @example
 * ```
 * <AvatarGroup size="lg">
 *   {users.slice(0, 3).map(u => (
 *     <Avatar key={u.id} src={u.src} name={u.name} />
 *   ))}
 *   <AvatarGroupOverflow count={users.length - 3} onClick={showAll} />
 * </AvatarGroup>
 * ```
 */
export function AvatarGroupOverflow({
  ref,
  count,
  onClick,
  children,
  xstyle,
  className,
  style,
  ...rest
}: AvatarGroupOverflowProps): ReactNode {
  const pressable = usePressFeedback();
  const t = useComponentTranslator();
  const group = useAvatarGroup();
  const size = group?.size ?? 'md';
  const shape = group?.shape ?? 'circle';
  const numericSize = group?.numericSize ?? resolveSize('md');
  const overlap = group?.overlap ?? 0;

  // count is a plain number, and the documented shape for it is
  // `total - visibleCount`, which goes negative whenever the list is shorter
  // than the slice. Clamping keeps that from rendering "+-3".
  const safeCount = Math.max(0, count);
  const label = t('@astryx.avatarGroup.overflow', {count: safeCount});
  const content = children ?? `+${safeCount}`;

  if (onClick) {
    const focusProps = focusOutlineProps.focusVisible();
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        {...rest}
        {...focusProps}
        aria-label={label}
        data-avatar-item=""
        {...pressable}
        {...mergeProps(
          themeProps('avatar-group-overflow', {size, shape}),
          stylex.props(
            // The press tint and the ring are the shared press and ring
            // machines: their unlayered arms must outrank a layer utility.
            interactionOverlayStyles.backgroundImageOnNeutral,
            shapeStyles[shape],
            xstyle,
          ),
          tw(
            avatarGroupOverflowClassName.base,
            avatarGroupOverflowClassName.button,
            avatarGroupOverflowClassName.overlap,
            focusProps.className,
            className,
          ),
          {...overflowBoxStyle(numericSize, overlap), ...style},
        )}>
        {content}
      </button>
    );
  }

  return (
    <span
      ref={ref}
      // Before the caller's props so a caller-supplied role still wins.
      role="img"
      {...rest}
      aria-label={label}
      {...mergeProps(
        themeProps('avatar-group-overflow', {size, shape}),
        stylex.props(shapeStyles[shape], xstyle),
        tw(
          avatarGroupOverflowClassName.base,
          avatarGroupOverflowClassName.overlap,
          className,
        ),
        {...overflowBoxStyle(numericSize, overlap), ...style},
      )}>
      {content}
    </span>
  );
}

AvatarGroupOverflow.displayName = 'AvatarGroupOverflow';
