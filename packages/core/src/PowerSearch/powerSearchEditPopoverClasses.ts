// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file powerSearchEditPopoverClasses.ts
 * @input The edit popover's container, content, chip rows, footer and the
 *   nested editor's tree rows
 * @output Utility class names for those surfaces
 * @position Style primitives; scanned by the Tailwind build
 *
 * A container query, not a viewport one, collapses the chip rows below the
 * popover layer's 400px floor: the rows track the width the popover actually
 * got. Without inline-size containment on the root, no `@container` condition
 * can match and the rows would never wrap.
 */

export const powerSearchEditPopoverContainerClassName =
  'overflow-hidden [container-type:inline-size]';

export const powerSearchEditPopoverContentClassName = 'p-4';

export const powerSearchEditPopoverChipRowClassName =
  'flex-nowrap @max-[399px]:flex-wrap';

export const powerSearchEditPopoverChipRowWrappedClassName = 'flex-wrap';

export const powerSearchEditPopoverFooterClassName = 'p-3 pt-0';

export const powerSearchEditPopoverFieldSelectorClassName =
  'grow shrink min-w-0';

/*
 * Long translated operator labels truncate in the Selector trigger instead of
 * pushing the row wider than the popover.
 */
export const powerSearchEditPopoverOperatorSelectorClassName =
  'grow shrink-0 max-w-full';

export const powerSearchEditPopoverValueEditorClassName = 'grow-[2] min-w-0';

export const powerSearchEditPopoverValueEditorFullWidthClassName = 'basis-full';

export const powerSearchEditPopoverNestedRootLabelClassName =
  'text-[length:var(--text-label-size)]';

export const powerSearchEditPopoverNestedFieldSelectorClassName =
  'shrink-0 w-[200px] max-w-full';

export const powerSearchEditPopoverNestedOperatorSelectorClassName =
  'shrink-0 w-[180px] max-w-full';

export const powerSearchEditPopoverNestedRowClassName = 'w-full';

export const powerSearchEditPopoverNestedRowValueEditorClassName =
  'grow-[2] shrink min-w-0';
