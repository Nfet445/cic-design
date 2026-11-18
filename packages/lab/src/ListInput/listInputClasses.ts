// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listInputClasses.ts
 * @input The row shape ListInput resolves from its columns and reorder handle
 * @output The utility class strings the group, list, record rows, field cells
 *   and Add row carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * Tailwind scans literal class names, so the variable names in the bracket
 * values repeat `LIST_INPUT_COLUMNS_VAR`.
 */

import {tw} from '../tw';

/** The variable `listInputFieldsTemplateClassName` reads. */
export const LIST_INPUT_COLUMNS_VAR = '--astryx-list-input-columns';

/**
 * The group is its own inline-size container: every responsive arm below reads
 * the record width, not the page width.
 */
export const listInputGroupClassName = tw(
  'flex flex-col min-w-0 w-full',
  '[overflow-anchor:none]',
  '@container/list-input',
);

export const listInputListClassName = tw(
  'flex flex-col gap-2',
  '[@container_list-input_(max-width:640px)]:gap-8',
  'list-none m-0 p-0',
);

export const listInputItemClassName = tw('flex flex-col min-w-0 relative');

export const listInputRowClassName = tw(
  'grid items-end gap-x-1 gap-y-0 min-w-0',
  '[@container_list-input_(max-width:640px)]:gap-y-2',
  // Core's reorder handle reaches into a ListItem row's inline inset. A record
  // has no inset, so the handle and its focus ring end at its edge.
  '[--_item-inset-inline:0px]',
);

export const listInputRowFieldsOnlyClassName = 'grid-cols-[minmax(0,1fr)]';

export const listInputRowWithRemoveClassName =
  'grid-cols-[minmax(0,1fr)_var(--size-element-md)]';

/**
 * Fields, then Remove and the reorder handle in one cell at the row's end
 * (UIKit's reorder control is the trailing control of an editing row). The
 * cell's track is fixed, so the Add row, which has no controls, keeps the
 * fields' width.
 */
export const listInputRowWithRemoveAndHandleClassName =
  'grid-cols-[minmax(0,1fr)_calc(var(--size-element-md)_+_var(--spacing-1)_+_28px)]';

export const listInputFieldsClassName = tw(
  'grid items-end gap-1 min-w-0',
  '[@container_list-input_(max-width:640px)]:contents',
  '[@container_list-input_(max-width:640px)]:gap-2',
);

/**
 * The column template is per instance, so it travels as a private variable
 * with this class reading it. A class-level declaration, not an inline one,
 * so the narrow arm and a consumer's own CSS can both override it.
 */
export const listInputFieldsTemplateClassName = tw(
  '[grid-template-columns:var(--astryx-list-input-columns)]',
  '[@container_list-input_(max-width:640px)]:[grid-template-columns:minmax(0,1fr)]',
);

export const listInputFieldCellClassName = tw(
  'col-auto',
  '[@container_list-input_(max-width:640px)]:col-start-1',
);

export const listInputContentOnlyClassName = 'col-[1/-1]';

export const listInputContentBeforeOneControlClassName = 'col-[1/-2]';

export const listInputItemStatusClassName = tw(
  'min-w-0 mt-1 [grid-row:2]',
  '[@container_list-input_(max-width:640px)]:mt-0',
  '[@container_list-input_(max-width:640px)]:[grid-row:auto]',
);

export const listInputActionRowClassName = tw('grid items-center gap-x-1 mt-2');

export const listInputActionContentClassName = 'min-w-0';

export const listInputColumnLabelClassName = tw(
  'block mb-0.5',
  '[@container_list-input_(max-width:640px)]:mb-1',
  'text-primary',
  'text-[length:var(--text-label-size)]',
  'leading-[var(--text-label-leading)]',
  'font-medium',
);

export const listInputRepeatedColumnLabelClassName = tw(
  'hidden',
  '[@container_list-input_(max-width:640px)]:block',
);

export const listInputCellContentClassName = 'min-w-0';

export const listInputControlCellClassName = tw(
  'flex items-center self-end justify-start gap-x-1',
  'min-h-[var(--size-element-md)]',
);

export const listInputRemoveControlCellClassName = tw(
  '[@container_list-input_(max-width:640px)]:col-start-2',
  '[@container_list-input_(max-width:640px)]:row-start-1',
);

export const listInputEmptyItemClassName = 'w-full';
