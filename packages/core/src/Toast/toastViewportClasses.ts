// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file toastViewportClasses.ts
 * @input The placement, whether any toast is shown, the stack direction and
 *   the row's entry, exit and settled state
 * @output Tailwind utility class names for the viewport, a toast row and the
 *   row's inner clip box
 * @position Internal to ToastViewport.
 *
 * The viewport's `display` picks one value, and a row's `overflow` does too, so
 * each state returns one string instead of two classes that race in the sheet.
 */

import type {ToastPosition} from './types';
import {tw} from '../utils/tw';

/**
 * A popover carries UA styles for its own surface; the viewport resets them
 * because it spans the inline axis and places its toasts inside itself.
 */
const viewportBaseClassName =
  'fixed z-[500] box-border pointer-events-none [inset:unset] m-0 w-auto [border-width:0] [border-style:none] bg-transparent overflow-visible [padding-block-start:max(var(--spacing-4),env(safe-area-inset-top,0px))] [padding-block-end:calc(var(--spacing-4)_+_env(safe-area-inset-bottom,0px))] [@media(pointer:coarse)]:[padding-block-end:calc(var(--spacing-4)_+_max(env(safe-area-inset-bottom,0px),34px))] [padding-inline-start:max(var(--spacing-4),env(safe-area-inset-left,0px))] [padding-inline-end:max(var(--spacing-4),env(safe-area-inset-right,0px))] [&:is([dir="rtl"]_*)]:[padding-inline-start:max(var(--spacing-4),env(safe-area-inset-right,0px))] [&:is([dir="rtl"]_*)]:[padding-inline-end:max(var(--spacing-4),env(safe-area-inset-left,0px))]';

/**
 * The viewport sits at the inset the app declared on LayerProvider for a bar
 * floating over that edge; unset, each reads 0px. A toast-only `inset` prop
 * writes the same edges inline and wins.
 */
export const toastViewportSpanClassName =
  '[inset-inline-start:var(--astryx-layer-inset-inline-start,0px)] [inset-inline-end:var(--astryx-layer-inset-inline-end,0px)]';

const viewportPositionClassName = {
  bottomEnd:
    'bottom-[var(--astryx-layer-inset-block-end,0px)] flex-col items-end',
  bottomStart:
    'bottom-[var(--astryx-layer-inset-block-end,0px)] flex-col items-start',
  topEnd:
    'top-[var(--astryx-layer-inset-block-start,0px)] flex-col-reverse items-end',
  topStart:
    'top-[var(--astryx-layer-inset-block-start,0px)] flex-col-reverse items-start',
} as const;

export interface ToastViewportClasses {
  position: ToastPosition;
  hasToasts: boolean;
}

/** One complete class string for the viewport's placement and shown state. */
export function toastViewportClassName({
  position,
  hasToasts,
}: ToastViewportClasses): string {
  // iOS Safari colors its toolbar from a fixed element at the bottom edge. A
  // toast that a swipe sends through that edge gives the viewport its color,
  // and Safari keeps that color while the viewport has a box.
  return tw(
    viewportBaseClassName,
    hasToasts ? 'flex' : 'hidden',
    viewportPositionClassName[position],
  );
}

const wrapperBaseClassName =
  'grid w-full max-w-[400px] min-w-0 grid-rows-[1fr] pointer-events-auto transition-[grid-template-rows,padding] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:duration-[0.01ms]';

// The inter-toast gap is padding on each wrapper so it collapses with the grid
// track. The wrapper nearest the viewport edge drops that padding; the child
// flips because top stacks use column-reverse.
const wrapperGapClassName = {
  first: 'pb-[var(--spacing-2)] first:pb-0',
  last: 'pb-[var(--spacing-2)] last:pb-0',
} as const;

export interface ToastWrapperClasses {
  isReversed: boolean;
  isEntering: boolean;
  isExiting: boolean;
}

/** One complete class string for a toast row in its current state. */
export function toastWrapperClassName({
  isReversed,
  isEntering,
  isExiting,
}: ToastWrapperClasses): string {
  return tw(
    wrapperBaseClassName,
    // The card enters from its own edge: the drift direction follows the stack.
    isReversed
      ? '[--_toast-slide-y:calc(-1*var(--spacing-2))]'
      : '[--_toast-slide-y:var(--spacing-2)]',
    isExiting
      ? 'grid-rows-[0fr] pb-0'
      : wrapperGapClassName[isReversed ? 'first' : 'last'],
    // A row opens from a closed track only when it first renders. A move to
    // another modal outlet renders it again, and it must not open again.
    isEntering && '[@starting-style]:grid-rows-[0fr] [@starting-style]:pb-0',
  );
}

/**
 * Clip while the grid row opens and closes so the toast reads as folding into
 * the stack. Once the entry transition settles, release the clip so the card's
 * shadow can paint.
 */
export function toastWrapperInnerClassName(isSettled: boolean): string {
  return tw(
    'w-full max-w-full min-w-0 min-h-0',
    isSettled ? 'overflow-visible' : 'overflow-hidden',
  );
}

export const toastOutletClassName = 'contents';
