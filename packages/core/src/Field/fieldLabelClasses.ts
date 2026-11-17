// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file fieldLabelClasses.ts
 * @input Uses the theme's spacing, typography and type-scale variables
 * @output The utility class strings FieldLabel's label group, label row,
 *   label, description and screen-reader-only spans carry
 * @position Internal to Field; the Tailwind build scans it for class names
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layout/tailwindStylesheet.source-build.test.mjs
 */

import {tw} from '../utils/tw';

const LABEL_TEXT_CLASS = tw(
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-label-size)]',
  '[line-height:var(--text-label-leading)]',
  '[font-weight:var(--font-weight-medium)]',
);

const SUPPORTING_TEXT_CLASS = tw(
  '[font-family:var(--font-family-body)]',
  'text-[length:var(--text-supporting-size)]',
  '[line-height:var(--text-supporting-leading)]',
  '[font-weight:var(--font-weight-normal)]',
  'text-[color:var(--color-text-secondary)]',
);

// A label, or a description that forwards clicks, reads as a hit target for the
// control beside it. Only a disabled control's own label stops reading so.
const POINTS_AT_CONTROL_CLASS = tw(
  'cursor-pointer',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

/** Takes no layout slot, so a caller's gap does not surround an empty box. */
const HIDDEN_GROUP_CLASS = 'contents';

/**
 * The label and its description read as one block. They need a wrapper of their
 * own: as bare siblings they pick up the column gap of whichever caller holds
 * them (Field, CheckboxInput, Switch).
 */
export function fieldLabelGroupClassName({
  isLabelHidden,
}: {
  isLabelHidden: boolean;
}): string {
  return tw('flex', 'flex-col', isLabelHidden && HIDDEN_GROUP_CLASS);
}

/**
 * One row of label and info button. A button inside a label also activates the
 * label's control, so the info button sits outside it, in this row.
 */
export function fieldLabelRowClassName({
  isLabelHidden,
}: {
  isLabelHidden: boolean;
}): string {
  return tw(
    'inline-flex',
    'items-center',
    // In a block label cell, keep the row's top on the cell's top, not on a
    // text baseline.
    'align-top',
    'gap-1',
    isLabelHidden && HIDDEN_GROUP_CLASS,
  );
}

export function fieldLabelClassName({
  isDisabled,
  isLabelHidden,
}: {
  isDisabled: boolean;
  isLabelHidden: boolean;
}): string {
  return tw(
    'flex',
    'items-center',
    'gap-1',
    LABEL_TEXT_CLASS,
    'text-[color:var(--color-text-secondary)]',
    !isDisabled && POINTS_AT_CONTROL_CLASS,
    isDisabled && 'text-[color:var(--color-text-disabled)]',
    isDisabled && 'cursor-default',
    isLabelHidden && fieldScreenReaderOnlyClassName,
  );
}

export const fieldScreenReaderOnlyClassName = tw(
  '[border-style:none]',
  '[clip:rect(0,0,0,0)]',
  '[height:1px]',
  '[width:1px]',
  '[margin:-1px]',
  '[inset-inline-start:0]',
  '[top:0]',
  'absolute',
  'overflow-hidden',
  '[padding:0]',
  'pointer-events-none',
  'select-none',
  'whitespace-nowrap',
);

export function fieldDescriptionClassName({
  forwardsClick,
  isLabelHidden,
}: {
  forwardsClick: boolean;
  isLabelHidden: boolean;
}): string {
  return tw(
    SUPPORTING_TEXT_CLASS,
    forwardsClick && POINTS_AT_CONTROL_CLASS,
    isLabelHidden && fieldScreenReaderOnlyClassName,
  );
}

/** The optional/required suffix beside the label text. */
export const fieldLabelStatusClassName = tw(
  '[font-weight:var(--font-weight-normal)]',
  'text-[length:var(--text-supporting-size)]',
  '[line-height:var(--text-supporting-leading)]',
  'text-[color:var(--color-text-secondary)]',
);
