// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file paginationClasses.ts
 * @input The pagination size and the state of a dot or a page button
 * @output Utility class strings for the pagination root, its controls row, its
 *   ellipsis, dots, page box and compact trims
 * @position Style primitives; scanned by the Tailwind build
 */

import {tw} from '../utils/tw';

/** Both rows wrap, so no control leaves the screen at a larger text size. */
const rootClassName = tw('flex flex-wrap items-center justify-between gap-4');

const controlsClassName = tw('flex flex-wrap items-center gap-0.5 min-w-0');

/** The compact variant trims the outer inset of its first and last control. */
const compactFirstClassName = '-me-0.5';
const compactLastClassName = '-ms-0.5';

const ellipsisClassName = tw(
  'inline-flex items-center justify-center select-none',
  'min-w-[var(--size-element-md)] min-h-[var(--size-element-md)]',
  'text-[color:var(--color-text-secondary)]',
  '[font-size:var(--text-label-size)]',
);

const ellipsisSmClassName = tw(
  'min-w-[var(--size-element-sm)] min-h-[var(--size-element-sm)]',
  '[font-size:var(--text-supporting-size)]',
);

const infoTextClassName = 'flex items-center whitespace-nowrap';

const dotsContainerClassName = 'flex items-center gap-0.5';

const dotClassName = tw(
  'size-2 p-0 border-none rounded-full bg-[var(--color-neutral)]',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[background-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

const dotSmClassName = 'size-1.5';

const dotActiveClassName = 'bg-[var(--color-accent)]';

const dotDisabledClassName = 'cursor-default opacity-50';

/** The current page reads as a filled, medium-weight button. */
const activePageClassName =
  'bg-[var(--color-neutral)] [font-weight:var(--font-weight-medium)]';

const inputGroupClassName =
  'inline-flex items-center gap-0.5 whitespace-nowrap';

const inputLabelClassName = tw(
  'select-none text-[color:var(--color-text-secondary)]',
  '[font-size:var(--text-label-size)]',
);

const inputLabelSmClassName = '[font-size:var(--text-supporting-size)]';

const inputTotalClassName = tw(
  'select-none text-[color:var(--color-text-secondary)]',
  '[font-size:var(--text-label-size)]',
);

const inputTotalSmClassName = '[font-size:var(--text-supporting-size)]';

const pageSizeSelectorClassName = 'flex items-center gap-2';

export {
  activePageClassName as paginationActivePageClassName,
  compactFirstClassName as paginationCompactFirstClassName,
  compactLastClassName as paginationCompactLastClassName,
  controlsClassName as paginationControlsClassName,
  dotActiveClassName as paginationDotActiveClassName,
  dotClassName as paginationDotClassName,
  dotDisabledClassName as paginationDotDisabledClassName,
  dotSmClassName as paginationDotSmClassName,
  dotsContainerClassName as paginationDotsContainerClassName,
  ellipsisClassName as paginationEllipsisClassName,
  ellipsisSmClassName as paginationEllipsisSmClassName,
  infoTextClassName as paginationInfoTextClassName,
  inputGroupClassName as paginationInputGroupClassName,
  inputLabelClassName as paginationInputLabelClassName,
  inputLabelSmClassName as paginationInputLabelSmClassName,
  inputTotalClassName as paginationInputTotalClassName,
  inputTotalSmClassName as paginationInputTotalSmClassName,
  pageSizeSelectorClassName as paginationPageSizeSelectorClassName,
  rootClassName as paginationRootClassName,
};
