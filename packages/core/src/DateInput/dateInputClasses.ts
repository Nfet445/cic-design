// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dateInputClasses.ts
 * @input Uses the theme's spacing variable plus the touch wheel geometry
 * @output The utility class strings the date picker's wheel and calendar
 *   surfaces carry, and the inline property that carries a box size no class
 *   can name
 * @position Internal to DateInput; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import type {CSSProperties} from 'react';
import {dateInputTouchGeometry} from './tokens.stylex';
import {tw} from '../utils/tw';

/**
 * One month pane is the wheels' and the scroller's block size, derived from
 * the day size and the weeks per pane. The classes that need it read a
 * variable, and the element writes the derived value inline, so the geometry
 * keeps one source.
 */
export type DateInputPaneStyle = CSSProperties &
  Partial<Record<'--astryx-date-pane-block-size', string>>;

export const dateInputPaneInlineStyle: DateInputPaneStyle = {
  '--astryx-date-pane-block-size': dateInputTouchGeometry.paneBlockSize,
};

/** The class that reads the pane size the element writes. */
export const dateInputPaneBlockSizeClassName =
  '[block-size:var(--astryx-date-pane-block-size)]';

/** The month wheel and the year wheel side by side, one pane tall. */
export const monthYearWheelsClassName = tw(
  'flex',
  'gap-2',
  dateInputPaneBlockSizeClassName,
);
