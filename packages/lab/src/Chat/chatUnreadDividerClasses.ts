// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file chatUnreadDividerClasses.ts
 * @input Nothing: every class is fixed
 * @output The utility class strings the divider row, its rule and its label
 *   carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

import {tw} from '../tw';

export const chatUnreadDividerRootClassName = tw(
  'flex w-full items-center',
  'gap-2',
  'py-1',
);

export const chatUnreadDividerRuleClassName = tw(
  'grow',
  'h-px',
  'bg-[color:var(--color-error)]',
);

export const chatUnreadDividerLabelClassName = tw(
  'shrink-0',
  'font-sans',
  'text-[length:var(--text-supporting-size)]',
  'font-bold',
  'text-[color:var(--color-text-error)]',
  'leading-[var(--text-supporting-leading)]',
);
