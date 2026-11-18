// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file resizeHandleClasses.ts
 * @input A resize handle's direction, placement mode, pane length, pill side
 *   and interaction state
 * @output One class text for each of the handle's three elements — the
 *   separator, the grab zone and the pill — and the custom property a zone
 *   shortened to its pane reads
 * @position Style primitives; scanned by the Tailwind build
 *
 * Every arm here is a selection, not an addition: two utilities on the same
 * property are ordered by the sheet, so a state that loses its arm would keep
 * the other's value. Each function therefore returns exactly one class per
 * property, chosen in TypeScript where the state is known.
 *
 * SYNC: When modified, update
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

/**
 * How short the pane a zone protects is, as a length the `min()` in its width
 * reads. Absent, the zone takes the whole hit area.
 */
export const RESIZE_HANDLE_PANE_LENGTH_VAR =
  '--astryx-resize-handle-pane-length';

/** The separator: a divider line in flow, or a transparent zone over a panel. */
export interface ResizeHandleClassNameOptions {
  isHorizontal: boolean;
  isOverlay: boolean;
  /** An overlay zone over a measurable pane takes at most half of it. */
  isShortPane: boolean;
  hasDivider: boolean;
  isDragging: boolean;
  isDisabled: boolean;
}

export function resizeHandleClassName({
  isHorizontal,
  isOverlay,
  isShortPane,
  hasDivider,
  isDragging,
  isDisabled,
}: ResizeHandleClassNameOptions): string {
  const cursor = isDisabled
    ? 'cursor-default'
    : isHorizontal
      ? 'cursor-col-resize'
      : 'cursor-row-resize';
  const background =
    isOverlay || !hasDivider
      ? 'bg-transparent'
      : isDragging
        ? 'bg-[var(--color-border-emphasized)]'
        : // A hovered divider keeps the base border color, as it always has.
          'bg-[var(--color-border)]';

  const box = tw(
    'z-2 flex shrink-0 items-center justify-center',
    'transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    background,
    cursor,
    isDisabled && 'pointer-events-none',
  );

  if (isOverlay) {
    return tw(
      box,
      'absolute',
      isHorizontal
        ? tw(
            'end-0 top-0 bottom-0',
            isShortPane
              ? 'w-[min(var(--resize-handle-hit-area,16px),50%)]'
              : 'w-[var(--resize-handle-hit-area,16px)]',
          )
        : tw(
            'bottom-0 start-0 end-0',
            isShortPane
              ? 'h-[min(var(--resize-handle-hit-area,16px),50%)]'
              : 'h-[var(--resize-handle-hit-area,16px)]',
          ),
    );
  }

  return tw(
    box,
    'relative',
    isHorizontal
      ? tw('h-full', hasDivider ? 'w-px' : 'w-0')
      : tw('w-full', hasDivider ? 'h-px' : 'h-0'),
  );
}

/** The grab zone: the wider invisible target centred on the separator. */
export interface ResizeHandleHitAreaClassNameOptions {
  isHorizontal: boolean;
  isOverlay: boolean;
  /** With a pane length the zone stops at half the pane it protects. */
  hasPaneLength: boolean;
  isDisabled: boolean;
}

export function resizeHandleHitAreaClassName({
  isHorizontal,
  isOverlay,
  hasPaneLength,
  isDisabled,
}: ResizeHandleHitAreaClassNameOptions): string {
  const length = isOverlay
    ? isHorizontal
      ? 'w-[min(var(--spacing-4),100%)]'
      : 'h-[min(var(--spacing-4),100%)]'
    : hasPaneLength
      ? isHorizontal
        ? `w-[min(var(--spacing-4),var(${RESIZE_HANDLE_PANE_LENGTH_VAR}))]`
        : `h-[min(var(--spacing-4),var(${RESIZE_HANDLE_PANE_LENGTH_VAR}))]`
      : isHorizontal
        ? 'w-[var(--spacing-4)]'
        : 'h-[var(--spacing-4)]';

  return tw(
    'absolute z-1 touch-none select-none',
    length,
    isDisabled
      ? 'pointer-events-none cursor-default'
      : isHorizontal
        ? 'cursor-col-resize'
        : 'cursor-row-resize',
    // The zone centres on the handle's line, so half of it reaches into the
    // pane. The inline centering is the call site's, in both directions.
    isHorizontal
      ? 'top-0 bottom-0'
      : tw('start-0 end-0', 'top-1/2 -translate-y-1/2'),
  );
}

/** The pill grip: a themed bar shown on hover, at drag and by placement. */
export interface ResizeHandlePillClassNameOptions {
  isHorizontal: boolean;
  side: 'start' | 'end' | 'center';
  isAlwaysVisible: boolean;
  isInteracting: boolean;
  isDragging: boolean;
  isDisabled: boolean;
}

export function resizeHandlePillClassName({
  isHorizontal,
  side,
  isAlwaysVisible,
  isInteracting,
  isDragging,
  isDisabled,
}: ResizeHandlePillClassNameOptions): string {
  // A hidden pill paints nothing, so it takes no pointer either.
  const isShown = isAlwaysVisible || isInteracting || isDragging;
  // A pill shown away from the centre sits outside the grab zone, so it
  // carries an invisible extension toward the handle. The offset is a
  // physical translate, so the extension is physical too.
  const bridge =
    isAlwaysVisible || side === 'center'
      ? undefined
      : isHorizontal
        ? side === 'start'
          ? "before:content-[''] before:absolute before:inset-y-0 before:left-0 before:right-[calc(-1*var(--spacing-1)-1px)]"
          : "before:content-[''] before:absolute before:inset-y-0 before:left-[calc(-1*var(--spacing-1)-1px)] before:right-0"
        : side === 'start'
          ? "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:bottom-[calc(-1*var(--spacing-1)-1px)]"
          : "before:content-[''] before:absolute before:inset-x-0 before:top-[calc(-1*var(--spacing-1)-1px)] before:bottom-0";

  const offset =
    side === 'center'
      ? 'top-1/2'
      : isHorizontal
        ? `start-0 [transform:translate(calc(${side === 'start' ? -1 : 1}*(100%+var(--spacing-1))),-50%)]`
        : `top-0 [transform:translate(-50%,calc(${side === 'start' ? -1 : 1}*(100%+var(--spacing-1))))]`;

  return tw(
    'absolute z-2 touch-none select-none rounded-[var(--radius-full)]',
    'transition-[opacity,background-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    isHorizontal
      ? 'h-[var(--spacing-8)] w-[3px]'
      : 'w-[var(--spacing-8)] h-[3px]',
    offset,
    bridge,
    isDisabled
      ? 'pointer-events-none cursor-default'
      : isHorizontal
        ? 'cursor-col-resize'
        : 'cursor-row-resize',
    isShown ? 'opacity-100' : 'opacity-0 pointer-events-none',
    isDragging
      ? 'bg-[var(--color-border-emphasized)]'
      : 'bg-[var(--color-border)]',
  );
}
