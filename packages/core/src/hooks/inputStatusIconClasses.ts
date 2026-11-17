// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file inputStatusIconClasses.ts
 * @input Nothing; the tooltip-variant status affordance has one look
 * @output The status button's chrome, stripped down to the shared focus ring
 * @position Internal to hooks/useInputStatusIcon.tsx; the Tailwind build scans
 *   it for class names
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * The tooltip-variant status affordance is a real button so it is keyboard
 * focusable and tappable: the native chrome is gone, and only the shared focus
 * ring is left. The button owns its pointer events, so hover opens the tooltip
 * in a non-interactive trailing slot; TextArea's end slot has
 * `pointer-events: none`, which would block this button's hover.
 */
export const inputStatusIconButtonClassName = tw(
  'inline-flex items-center justify-center',
  'm-0 border-0 bg-transparent p-0',
  'text-inherit',
  'cursor-pointer aria-disabled:cursor-default disabled:cursor-default',
  'pointer-events-auto',
  'rounded-[var(--radius-full)]',
);
