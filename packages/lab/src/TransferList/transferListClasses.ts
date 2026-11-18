// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file transferListClasses.ts
 * @input Accepts nothing: every class is fixed
 * @output The utility class strings the root, panels, panel headers and
 *   bodies, empty states and grouped heading carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The `40rem` arms read the root's unnamed inline-size container, so a panel
 * stacks by its own width, not the page's.
 */

import {tw} from '../tw';

/**
 * Core List's reorder handle is a small control, 28 px for every pointer,
 * overlapping the row's end padding by 8 px. A finger's 44 px target is its
 * invisible hit layer. A row without one keeps its end content clear of it, so
 * every Remove sits in one column.
 */
export const transferListClearsHandleClassName = 'me-5';

export const transferListRootClassName = tw(
  'flex flex-col gap-0 min-w-0',
  '@container',
);

export const transferListHeadingClassName = tw('flex flex-col gap-1 px-3');

export const transferListControlsClassName = tw(
  'flex items-end gap-2 min-w-0 p-3',
);

export const transferListSearchClassName = 'flex-1 min-w-0';

export const transferListPanelsClassName = tw(
  'grid gap-0 min-w-0',
  'grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
  '[@container_(max-width:40rem)]:grid-cols-[minmax(0,1fr)]',
);

/**
 * In the phone layout the body does not scroll, so the panel does not clip. On
 * iOS, that clip around the list's own clip draws the row at its edge one point
 * off while rows glide.
 */
export const transferListPanelClassName = tw(
  'flex flex-col min-w-0 overflow-hidden',
  '[@container_(max-width:40rem)]:overflow-visible',
  // Inset, not the shared offset: the panel's own edge is the container
  // boundary, so an outset ring would fall outside the component.
  'outline-offset-0 focus-visible:outline-offset-[-2px]',
);

export const transferListPanelDividerClassName = tw(
  '[border-inline-start-width:var(--border-width)]',
  '[border-inline-start-style:solid]',
  '[border-inline-start-color:var(--color-border)]',
  '[border-block-start-width:0px]',
  '[@container_(max-width:40rem)]:[border-inline-start-width:0px]',
  '[@container_(max-width:40rem)]:[border-block-start-width:var(--border-width)]',
);

export const transferListPanelHeaderClassName = tw(
  'flex items-center justify-between gap-2 py-2 px-3',
  'bg-transparent',
  '[@container_(max-width:40rem)]:bg-body',
  '[border-block-end-width:var(--border-width)]',
  '[border-block-end-style:solid]',
  '[border-block-end-color:var(--color-border)]',
);

export const transferListPanelBodyClassName = tw(
  'p-0',
  '[min-height:var(--transfer-list-panel-min-block-size,12rem)]',
  '[max-height:var(--transfer-list-panel-max-block-size,20rem)]',
  'overflow-y-auto overscroll-contain [scrollbar-gutter:stable]',
  '[@container_(max-width:40rem)]:min-h-0',
  '[@container_(max-width:40rem)]:max-h-none',
  '[@container_(max-width:40rem)]:overflow-y-visible',
  '[@container_(max-width:40rem)]:overscroll-auto',
  '[@container_(max-width:40rem)]:[scrollbar-gutter:auto]',
);

export const transferListGroupHeadingClassName = tw(
  'py-1 px-3 mt-1 first:mt-0',
);

export const transferListItemClassName = 'min-w-0 px-3';

export const transferListEmptyClassName = tw(
  'flex items-center justify-center p-4 text-center',
  '[min-height:var(--transfer-list-panel-min-block-size,12rem)]',
  '[@container_(max-width:40rem)]:min-h-0',
);

export const transferListSelectorSurfaceClassName = tw(
  'flex flex-col min-w-0 min-h-0',
  'max-h-[inherit]',
);

/**
 * The selector's popup box. The width tracks the `width` prop through a
 * private variable the selector writes inline, so the field and its popup are
 * one measurement rather than two that can disagree.
 */
export const transferListSelectorContentClassName = tw(
  '[width:var(--_transfer-list-selector-width)]',
  '[max-width:var(--_transfer-list-selector-width)]',
  'max-h-[calc(100vh_-_32px)] p-0 overflow-hidden rounded-[inherit]',
);

export const transferListSelectorFieldsetClassName = tw(
  'grow shrink basis-auto min-w-0 min-h-0 m-0 p-0 border-0',
  'overflow-y-auto overscroll-contain',
);

export const transferListSelectorFieldsetBusyClassName =
  'cursor-progress [&:is(:disabled,[aria-disabled=true])]:cursor-default';

export const transferListSelectorFooterClassName = tw(
  'shrink-0 bg-[var(--color-background-surface)]',
  '[border-block-start-width:var(--border-width)]',
  '[border-block-start-style:solid]',
  '[border-block-start-color:var(--color-border)]',
);
