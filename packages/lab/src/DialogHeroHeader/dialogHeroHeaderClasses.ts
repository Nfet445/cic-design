// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file dialogHeroHeaderClasses.ts
 * @input Accepts nothing: every class is fixed
 * @output The utility class strings the media slot, the floating close button,
 *   the title row, its start content, the heading and the custom-title slot
 *   carry
 * @position Style primitives; the Tailwind build scans it for class names
 */

/**
 * A layout-only wrapper. The negative margins cancel LayoutHeader's padding
 * (published as `--container-padding-*`) so the media bleeds to the dialog's
 * edges — the same compensation contract Section uses.
 */
export const dialogHeroHeaderMediaAreaClassName =
  'relative flex items-center justify-center [margin-inline-start:calc(-1*var(--container-padding-inline-start,0px))] [margin-inline-end:calc(-1*var(--container-padding-inline-end,0px))] [margin-block-start:calc(-1*var(--container-padding-block-start,0px))]';

/** Logical properties keep the button trailing under RTL, as Drawer's do. */
export const dialogHeroHeaderCloseButtonClassName =
  'absolute top-2 end-2 z-[1]';

export const dialogHeroHeaderTitleRowClassName = 'flex items-center gap-3 mt-4';

export const dialogHeroHeaderStartContentClassName =
  'flex items-center shrink-0';

/** The heading must shrink and truncate inside the flex row. */
export const dialogHeroHeaderTitleClassName = 'min-w-0 outline-none';

export const dialogHeroHeaderCustomTitleSlotClassName = 'min-w-0';
