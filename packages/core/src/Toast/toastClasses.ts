// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toastClasses.ts
 * @input The toast type, whether it is entering or exiting, and the swipe
 *   variables the gesture writes
 * @output Tailwind utility class names for the card, its row, its body and its
 *   trailing controls
 * @position Internal to Toast; the card's classes are also the viewport's
 *   animation target.
 *
 * The card's opacity and transform change per state, so one function returns a
 * complete string per state instead of classes that race. The entry rule sits
 * in `@starting-style`, which applies once and never overrides the base pair.
 */

import {tw} from '../utils/tw';

const toastBaseClassName = tw(
  'box-border w-[400px] max-w-full',
  'rounded-[var(--radius-container)]',
  'px-[var(--spacing-4)] py-[var(--spacing-4)]',
  'shadow-[var(--shadow-med)]',
  'font-[family-name:var(--font-family-body)]',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)]',
  'transition-[opacity,transform]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-[0.01ms]',
);

const toastEntryClassName = tw(
  '[@starting-style]:opacity-0',
  '[@starting-style]:[transform:translateY(var(--_toast-slide-y,var(--spacing-2)))]',
);

/**
 * The exit pair lands after the base pair in one string, so the swipe's last
 * transform wins over the resting one.
 */
const toastExitClassName = tw(
  'opacity-0',
  '[transform:translateY(var(--_toast-swipe-exit-y,var(--_toast-swipe-y,var(--_toast-slide-y,var(--spacing-2)))))_scale(var(--_toast-swipe-scale,1))]',
);

const toastRestingClassName =
  '[opacity:var(--_toast-swipe-opacity,1)] [transform:translateY(var(--_toast-swipe-y,0px))_scale(var(--_toast-swipe-scale,1))]';

export interface ToastSurfaceClasses {
  isError: boolean;
  isEntering: boolean;
  isExiting: boolean;
}

/** One complete class string for the card in its current state. */
export function toastSurfaceClassName({
  isError,
  isEntering,
  isExiting,
}: ToastSurfaceClasses): string {
  return tw(
    toastBaseClassName,
    isError
      ? 'bg-[var(--color-background-error-inverted)]'
      : 'bg-[var(--color-background-inverted)]',
    isExiting ? toastExitClassName : toastRestingClassName,
    isEntering && toastEntryClassName,
  );
}

export const toastInnerClassName =
  'flex w-full flex-nowrap items-start gap-[var(--spacing-3)]';

export const toastContentClassName = tw(
  'min-w-0 flex-1',
  '[overflow-wrap:anywhere]',
  // Text inside keeps `anywhere` too.
  '[--_astryx-text-overflow-wrap:anywhere]',
);

/**
 * Keep every trailing control centered on the first body line, even when the
 * body wraps or a consumer supplies a control taller than the built-in dismiss
 * button.
 */
export const toastEndContentClassName = tw(
  'flex shrink-0 items-center gap-[var(--spacing-2)]',
  '[block-size:calc(var(--text-body-size)*var(--text-body-leading))]',
  '[margin-inline-end:calc(var(--spacing-1)*-1)]',
);
