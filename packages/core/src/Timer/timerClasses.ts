// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file timerClasses.ts
 * @input Nothing; Timer has one appearance
 * @output The Tailwind utility class name for the `<time>` element
 * @position Internal to Timer.
 *
 * A `<time>` is inline text that must read exactly like the text around it, so
 * every inherited property is spelled out; the tabular figures keep the
 * changing digits from shifting the layout.
 */

import {tw} from '../utils/tw';

export const timerClassName = tw(
  'inline text-inherit [font-family:inherit] [font-size:inherit]',
  '[font-style:normal] [font-variant-numeric:tabular-nums]',
  '[font-weight:inherit] [line-height:inherit]',
);
