// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableClasses.ts
 * @input Whether the table auto-lays its columns, and the size a windowed gap keeps
 * @output Class strings for the `<table>` element, its gap cells and the header
 *   label row, plus the inline variable a gap cell carries its size in
 * @position Style primitives; scanned by the Tailwind build
 *
 * A windowed table keeps the place of the rows or columns it unmounts with an
 * empty cell. The size of that cell is the one value no class can carry, so it
 * travels in an inline custom property and the class reads it.
 */
import {tw} from '../utils/tw';

/** The custom properties a gap cell carries its size in; the classes read them. */
export const tableGapVars = {
  blockSize: '--_table-gap-block-size',
  inlineSize: '--_table-gap-inline-size',
} as const;

type TableGapStyle = React.CSSProperties &
  Partial<Record<(typeof tableGapVars)[keyof typeof tableGapVars], string>>;

/**
 * A gap cell holds a row of unmounted rows, so its block size is set. It
 * carries no padding or border of its own: it scores the row height the
 * mounted rows use.
 */
export function tableGapCellClassName({isInline}: {isInline: boolean}): string {
  return tw(
    'p-0 border-0',
    isInline
      ? tw(
          '[inline-size:var(--_table-gap-inline-size)]',
          '[min-inline-size:var(--_table-gap-inline-size)]',
          '[max-inline-size:var(--_table-gap-inline-size)]',
        )
      : tw('leading-[0]', '[block-size:var(--_table-gap-block-size)]'),
  );
}

/** A gap size as the inline value its class reads; a number is pixels. */
export function tableGapStyle({
  blockSize,
  inlineSize,
}: {
  blockSize?: number;
  inlineSize?: number;
}): TableGapStyle {
  const style: TableGapStyle = {};
  if (inlineSize != null) {
    style[tableGapVars.inlineSize] = `${inlineSize}px`;
  }
  if (blockSize != null) {
    style[tableGapVars.blockSize] = `${blockSize}px`;
  }
  return style;
}

/**
 * The table element. `table-layout` is one property with two values, so the
 * layout arrives as one class rather than two that would collide: a table
 * driven by data sizes every column from the width it is given, while a table
 * the caller writes lays out from its content.
 */
export function tableClassName({
  isAutoLayout,
}: {
  isAutoLayout: boolean;
}): string {
  return tw(
    'w-full border-collapse [border-spacing:0]',
    isAutoLayout ? 'table-auto' : 'table-fixed',
    '[font-family:inherit] [color:var(--color-text-primary)]',
  );
}

/** A header label with a control after it keeps both on one line. */
export const TABLE_HEADER_LABEL_ROW_CLASS =
  'inline-flex items-center gap-1 min-w-0';

/**
 * The scroll region a table scrolls inside. It bleeds to its container's
 * edges, under a Card's border, so the table's columns reach the edge a card
 * clips; at the region's own first and last edges it takes the published
 * corner, so its ring and fills follow the curve.
 */
export const TABLE_SCROLL_WRAPPER_CLASS = tw(
  'overflow-x-auto [-webkit-overflow-scrolling:touch]',
  'ms-[calc(-1*var(--container-padding-inline-start,0px))]',
  'me-[calc(-1*var(--container-padding-inline-end,0px))]',
  'w-[calc(100%_+_var(--container-padding-inline-start,0px)_+_var(--container-padding-inline-end,0px))]',
  'first:mt-[calc(-1*var(--container-padding-block-start,0px))]',
  'last:mb-[calc(-1*var(--container-padding-block-end,0px))]',
  'first:rounded-ss-[var(--container-corner-start-start,0px)]',
  'first:rounded-se-[var(--container-corner-start-end,0px)]',
  'last:rounded-es-[var(--container-corner-end-start,0px)]',
  'last:rounded-ee-[var(--container-corner-end-end,0px)]',
);

/**
 * A windowed table scrolls inside the height its parent gives it. As its
 * container's first or last child, the region bleeds over that block edge's
 * padding, so its height adds that padding back and it ends at the same edge.
 */
export const TABLE_SCROLL_WRAPPER_BLOCK_VIEWPORT_CLASS = tw(
  'first:[--_table-bleed-block-start:var(--container-padding-block-start,0px)]',
  'last:[--_table-bleed-block-end:var(--container-padding-block-end,0px)]',
  'h-[calc(100%_+_var(--_table-bleed-block-start,0px)_+_var(--_table-bleed-block-end,0px))]',
  'min-h-0',
);

/**
 * The region bleeds to its container's edges, under a Card's border, and the
 * Card clips there, so its keyboard ring sits inside its own box, clear of
 * that border too.
 */
export const TABLE_SCROLL_WRAPPER_RING_INSET_CLASS =
  'focus-visible:[outline-offset:calc(-1_*_(var(--focus-outline-width)_+_var(--border-width)))]';
