// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Skeleton.tsx
 * @input Uses React, StyleX (consumer `xstyle` only) and Tailwind classes
 * @output Exports Skeleton component, SkeletonProps, SkeletonRadius types
 * @position Core implementation of skeleton loading placeholder
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Skeleton/Skeleton.doc.mjs
 * - /packages/core/src/Skeleton/index.ts
 * - /apps/storybook/stories/Skeleton.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Skeleton/ (showcase blocks)
 */

import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {xstyleProps} from '../utils/xstyle';
import {
  skeletonAnimateClassName,
  skeletonClassName,
  skeletonDelayClassName,
  skeletonDimensionsClassName,
  skeletonRadiusClassName,
} from './skeletonClasses';

// =============================================================================
// Animation Timing Constants
// =============================================================================

/**
 * Initial delay before animation starts (ms).
 * Prevents flash of animation for fast-loading content.
 */
const DELAY_TIME = 1000;

/**
 * Stagger increment between sequential skeleton elements (ms).
 * Creates a wave effect when multiple skeletons are used together.
 */
const STAGGER_TIME = 100;

// =============================================================================
// Types
// =============================================================================

export type SkeletonRadius = keyof typeof skeletonRadiusClassName;

// =============================================================================
// Component
// =============================================================================

export interface SkeletonProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Width of the skeleton.
   * Accepts a number (pixels) or string (any CSS value).
   * @default '100%'
   */
  width?: number | string;
  /**
   * Height of the skeleton.
   * Accepts a number (pixels) or string (any CSS value).
   * @default '100%'
   */
  height?: number | string;
  /**
   * Border radius of the skeleton, using design token scale.
   * - 'none': No border radius (sharp corners)
   * - 0: radius-0 token (0px)
   * - 1: radius-1 token (4px)
   * - 2: radius-2 token (8px)
   * - 3: radius-3 token (12px, default)
   * - 4: radius-container token (12px), the same as 3
   * - 'rounded': Fully rounded (for avatars, pills)
   * @default 3
   */
  radius?: SkeletonRadius;
  /**
   * Index for staggered animation timing.
   * Use sequential indices (0, 1, 2, ...) for multiple skeletons
   * to create a wave effect.
   * @default 0
   */
  index?: number;
  /**
   * Test ID for testing purposes.
   */
  'data-testid'?: string;
}

/**
 * A placeholder shape that indicates content is loading.
 * Renders a pulsing block with configurable width, height, and border radius.
 * Use the `index` prop to stagger animation timing across multiple skeletons.
 *
 * @example
 * ```
 * <Skeleton width={200} height={20} />
 * <Skeleton width={40} height={40} radius="rounded" />
 * <Skeleton width={300} height={16} index={0} />
 * <Skeleton width={280} height={16} index={1} />
 * ```
 */
export function Skeleton({
  width = '100%',
  height = '100%',
  radius: radiusProp = 3,
  index = 0,
  'data-testid': testId,
  xstyle,
  className,
  style,
  ref,
  ...props
}: SkeletonProps) {
  const cssLength = (value: number | string) =>
    typeof value === 'number' ? `${value}px` : value;
  return (
    <div
      ref={ref}
      // Purely decorative loading placeholder — hide from assistive tech so it
      // isn't announced as empty content. The surrounding region should convey
      // the loading/busy state (e.g. aria-busy) (complex-20). Consumers can
      // override via props if a specific skeleton must be exposed.
      aria-hidden="true"
      data-testid={testId}
      {...mergeProps(
        themeProps('skeleton'),
        {
          className: tw(
            skeletonClassName,
            skeletonAnimateClassName,
            skeletonRadiusClassName[radiusProp],
            skeletonDimensionsClassName,
            skeletonDelayClassName,
            xstyleProps(xstyle).className,
          ),
        },
        className,
        // A value the props compute reaches the stylesheet as a variable, so
        // every declaration stays in the class map above.
        {
          ['--_skeleton-width' as string]: cssLength(width),
          ['--_skeleton-height' as string]: cssLength(height),
          ['--_skeleton-delay' as string]: `${DELAY_TIME + STAGGER_TIME * index}ms`,
          ...style,
        },
      )}
      {...props}
    />
  );
}

Skeleton.displayName = 'Skeleton';
