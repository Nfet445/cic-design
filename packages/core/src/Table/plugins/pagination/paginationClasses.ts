// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file paginationClasses.ts
 * @input The wrapper's side and alignment
 * @output Exports `tablePaginationWrapperClassName`
 * @position Table pagination plugin; read by useTablePagination
 */

import {tw} from '../../../utils/tw';

const ALIGN_CLASS: Record<'start' | 'center' | 'end', string> = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
};

/**
 * The nav's container: a gap of `spacing-2` (8px) on the table's side, and the
 * caller's alignment across it.
 */
export function tablePaginationWrapperClassName({
  side,
  align,
}: {
  side: 'above' | 'below';
  align: 'start' | 'center' | 'end';
}): string {
  return tw('flex', side === 'below' ? 'mt-2' : 'mb-2', ALIGN_CLASS[align]);
}
