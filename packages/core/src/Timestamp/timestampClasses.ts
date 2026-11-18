// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file timestampClasses.ts
 * @input Nothing; Timestamp has one appearance
 * @output The Tailwind utility class name for the `<time>` element
 * @position Internal to Timestamp.
 *
 * A `<time>` is inline text that has to read exactly like the text around it,
 * so every inherited property is spelled out: the UA sheet's own values would
 * otherwise show through.
 */

import {tw} from '../utils/tw';

export const timestampClassName = tw(
  'inline [font-family:inherit] [font-size:inherit]',
  '[font-style:normal] [font-weight:inherit] [line-height:inherit]',
  'text-inherit',
);
