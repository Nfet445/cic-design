// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file calendarClasses.ts
 * @input Accepts the day's range, preview and today state plus the two rounding flags
 * @output Tailwind utility class names for the calendar frame, the month grid and a day cell
 * @position Internal to Calendar.
 *
 * Two layout values stay literals on purpose: the band inset and the hit bleed
 * are derived from the two element size tokens, not from a spacing step, so
 * pinning them to a token desynchronises them (matcha sets that step to 3px,
 * which would overlap adjacent days' hit targets by 2px). Deriving both with
 * `calc()` from the size tokens needs its own measured change. Each class is
 * therefore written as a literal — the compiler reads class text, so a
 * template literal would emit no rule at all.
 */

import {tw} from '../utils/tw';

/** The calendar frame: a padded inline block that never shrinks below 220px. */
export const calendarClassName = tw(
  'inline-block',
  'p-[var(--spacing-3)]',
  'min-w-[220px]',
);

/** The month navigation row: chevron, label, chevron. */
export const calendarHeaderClassName = tw(
  'flex items-center justify-between',
  'mb-[var(--spacing-2)] gap-[var(--spacing-2)]',
);

/** The month and year between the chevrons, centred in the leftover space. */
export const calendarMonthYearLabelClassName = tw(
  'flex-1 text-center',
  '[font-weight:var(--font-weight-semibold)]',
  'text-[length:var(--text-label-size)]',
  'text-[color:var(--color-text-primary)]',
);

/**
 * The month wrapper before the month is known (server render, hydration):
 * the grids keep their space but stay invisible.
 */
export const calendarMonthsPendingClassName = 'invisible';

/**
 * The month wrapper. It wraps rather than overflowing: two months side by
 * side need about 488px, so an unwrapped row scrolls the document sideways
 * below that and puts the next-month button off-viewport (WCAG 1.4.10).
 */
export const calendarMonthsContainerClassName = tw(
  'flex flex-wrap',
  'gap-[var(--spacing-4)]',
);

/** The chevron wrapper; the call site adds the RTL mirror transform. */
export const calendarNavIconClassName = 'inline-flex';

/** One month's grid, sharing the row height evenly when two are shown. */
export const monthGridClassName = 'flex-[1_1_0]';

/** A weekday header cell, one element size tall plus the header gap. */
export const monthGridDayNameClassName = tw(
  'flex items-center justify-center',
  'w-[var(--size-element-md)]',
  'h-[calc(var(--size-element-md)+var(--spacing-1))]',
  'pb-[var(--spacing-1)]',
  'box-border',
  'text-[length:var(--text-supporting-size)]',
  '[font-weight:var(--font-weight-normal)]',
  'text-[color:var(--color-text-secondary)]',
);

/** The corner above the week-number column. */
export const monthGridWeekNumberHeaderClassName = 'w-[var(--size-element-md)]';

/** The APG grid that holds the header row and the week rows. */
export const monthGridDaysGridClassName = 'grid grid-cols-7';

/** The same grid with the week-number column in front of the seven days. */
export const monthGridDaysGridWithNumbersClassName =
  'grid-cols-[auto_repeat(7,1fr)]';

/** A week number cell. */
export const monthGridWeekNumberClassName = tw(
  'flex items-center justify-center',
  'w-[var(--size-element-md)] h-[var(--size-element-md)]',
  'text-[length:var(--text-supporting-size)]',
  'text-[color:var(--color-text-secondary)]',
);

/**
 * A row that contributes its cells to the grid instead of being a grid item
 * itself: `role="row"` needs an element, and `display: contents` keeps the
 * columns aligned.
 */
export const monthGridWeekRowClassName = 'contents';

/**
 * A day cell: a positioned flex box with a minimum size, so a row grows with
 * a larger text size and its days never reach into the next row. The padding
 * is the gap the day's hit bleed is sized for.
 */
export const dayCellClassName = tw(
  'relative flex items-center justify-center isolate',
  'min-h-[var(--size-element-md)]',
  'box-border',
  'p-[2px]',
);

/** The in-range band, spanning its cell and touching its neighbours. */
export const dayCellRangeBgClassName = tw(
  'absolute',
  'top-[2px] bottom-[2px]',
  'inset-x-0',
  'bg-[var(--color-accent-muted)]',
);

/** The same band, when the range starts in this cell. */
export const dayCellRangeBgRoundStartClassName = tw(
  'inset-s-[2px]',
  'rounded-ss-[var(--radius-full)] rounded-es-[var(--radius-full)]',
);

/** The same band, when the range ends in this cell. */
export const dayCellRangeBgRoundEndClassName = tw(
  'inset-e-[2px]',
  'rounded-se-[var(--radius-full)] rounded-ee-[var(--radius-full)]',
);

/** A one-day range start: the band pulls in at the start edge. */
export const dayCellRangeInsetStartClassName = 'inset-s-[2px]';

/** A one-day range end: the band pulls in at the end edge. */
export const dayCellRangeInsetEndClassName = 'inset-e-[2px]';

/** The hover preview band, drawn under the same rules as the range band. */
export const dayCellPreviewBgClassName = tw(
  'absolute',
  'top-[2px] bottom-[2px]',
  'inset-x-0',
  'bg-[var(--color-overlay-hover)]',
);

/** The preview band's rounded start. */
export const dayCellPreviewBgRoundStartClassName = tw(
  'inset-s-[2px]',
  'rounded-ss-[var(--radius-full)] rounded-es-[var(--radius-full)]',
);

/** The preview band's rounded end. */
export const dayCellPreviewBgRoundEndClassName = tw(
  'inset-e-[2px]',
  'rounded-se-[var(--radius-full)] rounded-ee-[var(--radius-full)]',
);

/** The preview starts here: it rounds and pulls in on that side. */
export const dayCellPreviewStartClassName = tw(
  'inset-s-[2px]',
  'rounded-ss-[var(--radius-full)] rounded-es-[var(--radius-full)]',
);

/** The preview ends here: it rounds and pulls in on that side. */
export const dayCellPreviewEndClassName = tw(
  'inset-e-[2px]',
  'rounded-se-[var(--radius-full)] rounded-ee-[var(--radius-full)]',
);

/**
 * What a day button paints. The arms are exclusive, not stacked: a day that is
 * outside, today, selected and disabled at once must resolve one colour, one
 * background and one opacity, because two classes for the same property inside
 * one layer are decided by sheet order, not by their order in the class list.
 */
export type DayButtonState = {
  isOutside: boolean;
  isTodayRing: boolean;
  isTodayInRangeRing: boolean;
  isSelected: boolean;
  isDisabled: boolean;
};

const DAY_BUTTON_FRAME = tw(
  'relative flex items-center justify-center',
  'min-w-[var(--size-element-sm)] min-h-[var(--size-element-sm)]',
  'rounded-[var(--radius-full)]',
  'border-0 p-0',
  'font-[inherit]',
  'text-[length:var(--text-body-size)]',
  'z-[1]',
  'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
  'transition-[background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:transition-none',
  "before:absolute before:content-[''] before:top-[-2px] before:bottom-[-2px] before:inset-x-[-2px]",
);

export function dayButtonClassName(state: DayButtonState): string {
  const color = state.isSelected
    ? tw(
        'text-[color:var(--color-on-accent)]',
        'forced-colors:text-[color:HighlightText]',
      )
    : state.isOutside
      ? 'text-[color:var(--color-text-secondary)]'
      : 'text-[color:var(--color-text-primary)]';

  const background = state.isSelected
    ? tw(
        'bg-[var(--color-accent)]',
        'forced-colors:bg-[color:Highlight]',
        '[forced-color-adjust:none]',
      )
    : 'bg-transparent';

  const opacity = state.isDisabled
    ? 'opacity-30'
    : state.isOutside
      ? 'opacity-50'
      : undefined;

  const ring = state.isTodayInRangeRing
    ? 'shadow-[inset_0_0_0_1px_var(--color-text-primary)]'
    : state.isTodayRing
      ? 'shadow-[inset_0_0_0_1px_var(--color-border-emphasized)]'
      : undefined;

  return tw(DAY_BUTTON_FRAME, color, background, opacity, ring);
}

/** An empty placeholder cell for a hidden neighbouring-month day. */
export const dayCellPlaceholderClassName = dayCellClassName;
