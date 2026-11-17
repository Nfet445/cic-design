// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file NavIcon.tsx
 * @input Uses React, HTMLAttributes, ReactNode
 * @output Exports NavIcon component and NavIconProps
 * @position Shared circular icon container for navigation headers (TopNav, PageNav)
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/NavIcon/NavIcon.doc.mjs
 * - /packages/core/src/NavIcon/NavIcon.test.tsx
 * - /packages/core/src/NavIcon/index.ts
 * - /apps/storybook/stories/TopNav.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/NavIcon/NavIconShowcase.tsx
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {tw} from '../utils/tw';
import {navIconClassName} from './navIconClasses';

export interface NavIconProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * The icon element to render inside the circular background.
   * Should be an Icon or similar icon component.
   */
  icon: ReactNode;
}

/**
 * Circular icon container for navigation headers.
 *
 * Wraps an icon with a circular accent-colored background, suitable for
 * use as a logo in top navigation or side navigation title areas.
 *
 * @example
 * ```
 * import {HomeIcon} from '@heroicons/react/24/solid';
 * <TopNavHeading
 *   heading="Dashboard"
 *   logo={<NavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
 * />
 * <PageNavHeader
 *   icon={<NavIcon icon={<HomeIcon style={{width: 16, height: 16}} />} />}
 *   heading="My App"
 * />
 * ```
 */
export function NavIcon({
  icon,
  xstyle,
  className,
  style,
  ref,
  ...props
}: NavIconProps) {
  return (
    <span
      ref={ref}
      {...mergeProps(
        themeProps('nav-icon'),
        stylex.props(xstyle),
        tw(navIconClassName, className),
        style,
      )}
      {...props}>
      {icon}
    </span>
  );
}

NavIcon.displayName = 'NavIcon';
