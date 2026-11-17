// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file shared.tsx
 * @input Schedule events, dates, timezone IDs, provider locale and calendar,
 *   and display metadata
 * @output Shared rendering primitives, formatters, and styles for schedule views
 * @position Internal view utility module; consumed by Monthly, Weekly, Day, and List views
 */

import {type CSSProperties, type ReactNode} from 'react';
import {useScrollableArea} from '@astryxdesign/core/hooks';
import {getLocaleDirection, type Locale} from '@astryxdesign/core/i18n';
import {
  calendarMonthLabelDay,
  calendarMonthOf,
  formatCalendarDate,
  formatCalendarDateToParts,
  formatCalendarInstantRange,
  useCalendarSystem,
  type CalendarSystem,
} from '@astryxdesign/core/internal/calendar-system';
import {borderVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {Spinner} from '@astryxdesign/core/Spinner';
import {HStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import {
  plainDateFromInstant,
  plainDateIsEqual,
  plainDateIsBefore,
  plainDateToInstant,
  type PlainDate,
} from '@astryxdesign/core/utils';
import {isDayEvent} from './dateMath';
import {useScheduleContext} from './context';
import {tw} from '../tw';
import {
  scheduleAllDayCellClassName,
  scheduleEventButtonResetClassName,
  scheduleEventDotBlueClassName,
  scheduleEventDotCyanClassName,
  scheduleEventDotGrayClassName,
  scheduleEventDotGreenClassName,
  scheduleEventDotOrangeClassName,
  scheduleEventDotPinkClassName,
  scheduleEventDotPurpleClassName,
  scheduleEventDotRedClassName,
  scheduleEventDotTealClassName,
  scheduleEventDotYellowClassName,
  scheduleEventPastSurfaceBlueClassName,
  scheduleEventPastSurfaceCyanClassName,
  scheduleEventPastSurfaceGrayClassName,
  scheduleEventPastSurfaceGreenClassName,
  scheduleEventPastSurfaceOrangeClassName,
  scheduleEventPastSurfacePinkClassName,
  scheduleEventPastSurfacePurpleClassName,
  scheduleEventPastSurfaceRedClassName,
  scheduleEventPastSurfaceTealClassName,
  scheduleEventPastSurfaceYellowClassName,
  scheduleEventPillClassName,
  scheduleEventSurfaceBlueClassName,
  scheduleEventSurfaceCyanClassName,
  scheduleEventSurfaceGrayClassName,
  scheduleEventSurfaceGreenClassName,
  scheduleEventSurfaceOrangeClassName,
  scheduleEventSurfacePinkClassName,
  scheduleEventSurfacePurpleClassName,
  scheduleEventSurfaceRedClassName,
  scheduleEventSurfaceTealClassName,
  scheduleEventSurfaceYellowClassName,
  scheduleEventTimeClassName,
  scheduleEventTitleClassName,
  scheduleFrameClassName,
  scheduleHeaderClassName,
  scheduleHeaderControlsClassName,
  scheduleHeaderStatusClassName,
  scheduleHeaderTitleClassName,
  scheduleHeaderTitleContentClassName,
  scheduleListEventDotClassName,
  scheduleListEventDotPastClassName,
  scheduleListEventRowClassName,
  scheduleListEventTimeClassName,
  scheduleListEventTitleClassName,
  scheduleListEventTitlePastClassName,
  scheduleLoadingSpinnerClassName,
  scheduleLoadingSpinnerHiddenClassName,
  scheduleMoreEventsClassName,
  scheduleTitleEmphasisClassName,
  scheduleTitleFirstLineClassName,
  scheduleTitleFirstTimeClassName,
  scheduleTitleFirstTitleClassName,
  scheduleVisuallyHiddenClassName,
  scheduleWeekHeaderClassName,
  scheduleWeekdayHeadingClassName,
  scheduleWeekdayLabelClassName,
} from './scheduleClasses';
import {scheduleEventPopoverBodyStyles} from './scheduleOverrides.stylex';
import type {
  CalendarEvent,
  CalendarInstantEvent,
  Instant,
  ScheduleCategory,
  ScheduleHeaderContent,
  ScheduleEventColor,
} from './types';
import {useStatusAnnouncement} from '../useStatusAnnouncement';

const DEFAULT_EVENT_CATEGORY: ScheduleCategory = {
  label: 'Event',
  color: 'blue',
};

// Month week rows are 128px. A chip level starts below the day number and the
// next one a chip's height plus a gap further down, so three levels fit in a
// row in every shipped theme.
const MONTH_CHIP_TOP = 30;
const MONTH_LEVEL_PITCH = 29;

export function ScheduleFrame({
  title,
  titleLabel,
  isLoading,
  children,
}: {
  title: ReactNode;
  titleLabel: string;
  isLoading: boolean;
  children: ReactNode;
}) {
  const {plugins} = useScheduleContext();
  // The ring is silent; the Schedule announces its own busy start.
  useStatusAnnouncement(isLoading ? 'Loading events' : null, 'polite', {
    skipPageLoad: true,
  });
  const initialHeader: ScheduleHeaderContent = {
    startContent: null,
    centerContent: (
      <span className={tw(scheduleHeaderTitleContentClassName)}>
        <Heading level={2}>{title}</Heading>
        <span
          aria-hidden={!isLoading}
          className={tw(
            scheduleLoadingSpinnerClassName,
            !isLoading && scheduleLoadingSpinnerHiddenClassName,
          )}>
          <Spinner size="md" aria-label="Loading events" aria-hidden />
        </span>
      </span>
    ),
    endContent: null,
  };
  const header = plugins.reduce(
    (content, plugin) =>
      plugin.renderHeader?.(
        content.startContent,
        content.centerContent,
        content.endContent,
      ) ?? content,
    initialHeader,
  );

  return (
    <section className={tw(scheduleFrameClassName)} aria-label={titleLabel}>
      <div className={tw(scheduleHeaderClassName)}>
        <HStack
          gap={8}
          align="center"
          className={scheduleHeaderControlsClassName}>
          {header.startContent}
        </HStack>
        <HStack gap={8} align="center" className={scheduleHeaderTitleClassName}>
          {header.centerContent}
        </HStack>
        <HStack
          gap={8}
          align="center"
          justify="end"
          className={scheduleHeaderStatusClassName}>
          {header.endContent}
        </HStack>
      </div>
      {children}
    </section>
  );
}

/**
 * The calendar that Schedule writes its date labels in: the provider's
 * resolved calendar, as Core's date components resolve it. The views still lay
 * out and step Gregorian days, weeks, and months.
 */
export function useScheduleCalendar(): CalendarSystem {
  return useCalendarSystem(undefined, 'Schedule');
}

export function ScheduleMonthTitle({date}: {date: PlainDate}) {
  const {locale} = useScheduleContext();
  const calendar = useScheduleCalendar();
  return (
    <LocalizedMonthTitle date={date} locale={locale} calendar={calendar} />
  );
}

function LocalizedMonthTitle({
  date,
  locale,
  calendar,
}: {
  date: PlainDate;
  locale: Locale;
  calendar: CalendarSystem;
}) {
  const parts = formatCalendarDateToParts(
    calendar,
    monthLabelDate(date, calendar),
    {month: 'long', year: 'numeric'},
    locale,
  );

  return parts.map((part, index) =>
    part.type === 'month' ? (
      <span key={index} className={tw(scheduleTitleEmphasisClassName)}>
        {part.value}
      </span>
    ) : (
      part.value
    ),
  );
}

export function ScheduleRangeMonthTitle({
  start,
  end,
}: {
  start: PlainDate;
  end: PlainDate;
}) {
  const {locale} = useScheduleContext();
  const calendar = useScheduleCalendar();
  if (isSameCalendarMonth(start, end, calendar)) {
    return <ScheduleMonthTitle date={start} />;
  }

  const startMonth = formatWithPlainDate(
    monthLabelDate(start, calendar),
    {month: 'long'},
    locale,
    calendar,
  );
  const endMonthTitle = (
    <LocalizedMonthTitle date={end} locale={locale} calendar={calendar} />
  );
  return isSameCalendarYear(start, end, locale, calendar) ? (
    <>
      <span className={tw(scheduleTitleEmphasisClassName)}>{startMonth}</span> -{' '}
      {endMonthTitle}
    </>
  ) : (
    <>
      <LocalizedMonthTitle date={start} locale={locale} calendar={calendar} /> -{' '}
      {endMonthTitle}
    </>
  );
}

/**
 * A painted time or time range, isolated in the locale's direction: it lays
 * out as one unit whatever the layout direction, so "9:00 AM" never paints as
 * "AM 9:00" and a right-to-left locale's range still reads start first.
 */
export function ScheduleTime({children}: {children: ReactNode}) {
  const {locale} = useScheduleContext();
  return <bdi dir={getLocaleDirection(locale)}>{children}</bdi>;
}

/**
 * The content of a Schedule view's popover. Only the content scrolls, inside
 * the surface: the popover's hidden fallback close sits one pixel below the
 * surface, so a scroller around the whole popover would count that pixel as
 * overflow and paint a scrollbar on content that fits, and would clip the
 * surface's shadow. Taller content scrolls in a named group that joins the
 * tab order only while it overflows, so the keyboard reaches all of it; a
 * group, not a region, so no popover adds a landmark.
 */
export function SchedulePopoverBody({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const {getViewportProps, getContentProps} = useScrollableArea({
    axis: 'block',
    keyboardAccess: {owner: 'viewport', label},
  });
  return (
    <div
      {...getViewportProps<HTMLDivElement>({
        xstyle: scheduleEventPopoverBodyStyles.base,
      })}>
      <div {...getContentProps<HTMLDivElement>()}>{children}</div>
    </div>
  );
}

export function EventPill({
  event,
  day,
  timezoneID,
  isPast = false,
}: {
  event: CalendarEvent;
  day?: PlainDate;
  timezoneID?: string;
  isPast?: boolean;
}) {
  const {categories, locale} = useScheduleContext();
  const category = getEventCategory(event, categories);
  const timeLabel =
    day != null && timezoneID != null && !isDayEvent(event)
      ? formatEventTime(event, day, timezoneID, locale)
      : null;
  return (
    <span
      className={tw(
        scheduleEventPillClassName,
        isPast
          ? eventPastSurfaceClassName(category.color)
          : eventSurfaceClassName(category.color),
      )}>
      {timeLabel != null && (
        <Text
          type="supporting"
          color="inherit"
          className={scheduleEventTimeClassName}>
          <ScheduleTime>{timeLabel}</ScheduleTime>
        </Text>
      )}
      <Text
        type="supporting"
        color="inherit"
        weight="bold"
        className={scheduleEventTitleClassName}>
        {event.title}
      </Text>
    </span>
  );
}

export function MonthEventPill({
  event,
  timezoneID,
  isPast = false,
}: {
  event: CalendarEvent;
  timezoneID: string;
  isPast?: boolean;
}) {
  const {locale} = useScheduleContext();
  // A month chip shows its start time after the title (component:Schedule
  // FR18).
  return (
    <TitleFirstPill
      event={event}
      timeLabel={
        isDayEvent(event)
          ? null
          : formatEventStartTime(event, timezoneID, locale)
      }
      isPast={isPast}
    />
  );
}

/**
 * A pill that leads with the event's title; its time follows on the same
 * line only when the whole title and the time fit, and otherwise the title
 * shows alone, ellipsized.
 */
export function TitleFirstPill({
  event,
  timeLabel,
  isPast = false,
}: {
  event: CalendarEvent;
  timeLabel: string | null;
  isPast?: boolean;
}) {
  const {categories} = useScheduleContext();
  const category = getEventCategory(event, categories);
  return (
    <span
      className={tw(
        scheduleEventPillClassName,
        isPast
          ? eventPastSurfaceClassName(category.color)
          : eventSurfaceClassName(category.color),
      )}>
      <span className={tw(scheduleTitleFirstLineClassName)}>
        <Text
          type="supporting"
          color="inherit"
          weight="bold"
          className={scheduleTitleFirstTitleClassName}>
          {event.title}
        </Text>
        {timeLabel != null && (
          <Text
            type="supporting"
            color="inherit"
            className={scheduleTitleFirstTimeClassName}>
            <ScheduleTime>{timeLabel}</ScheduleTime>
          </Text>
        )}
      </span>
    </span>
  );
}

export function ListEventRow({
  event,
  timezoneID,
  isPast = false,
}: {
  event: CalendarEvent;
  timezoneID: string;
  isPast?: boolean;
}) {
  const {categories, locale} = useScheduleContext();
  const category = getEventCategory(event, categories);
  return (
    <div className={tw(scheduleListEventRowClassName)}>
      <span
        aria-hidden
        className={tw(
          scheduleListEventDotClassName,
          eventDotClassName(category.color),
          isPast && scheduleListEventDotPastClassName,
        )}
      />
      <span className={tw(scheduleListEventTimeClassName)}>
        <ScheduleTime>
          {isDayEvent(event)
            ? 'All day'
            : formatEventTimeRange(event, timezoneID, locale)}
        </ScheduleTime>
      </span>
      <span
        className={tw(
          scheduleListEventTitleClassName,
          isPast && scheduleListEventTitlePastClassName,
        )}>
        {event.title}
      </span>
    </div>
  );
}

export function getEventCategory(
  event: CalendarEvent,
  categories: ReadonlyArray<ScheduleCategory>,
): ScheduleCategory {
  return (
    categories.find(category => category.label === event.category) ??
    (event.category != null
      ? {label: event.category, color: DEFAULT_EVENT_CATEGORY.color}
      : DEFAULT_EVENT_CATEGORY)
  );
}

export function eventDotClassName(color: ScheduleEventColor | undefined) {
  switch (color) {
    case 'cyan':
      return scheduleEventDotCyanClassName;
    case 'gray':
      return scheduleEventDotGrayClassName;
    case 'green':
      return scheduleEventDotGreenClassName;
    case 'orange':
      return scheduleEventDotOrangeClassName;
    case 'pink':
      return scheduleEventDotPinkClassName;
    case 'purple':
      return scheduleEventDotPurpleClassName;
    case 'red':
      return scheduleEventDotRedClassName;
    case 'teal':
      return scheduleEventDotTealClassName;
    case 'yellow':
      return scheduleEventDotYellowClassName;
    case 'blue':
    default:
      return scheduleEventDotBlueClassName;
  }
}

export function eventSurfaceClassName(color: ScheduleEventColor | undefined) {
  switch (color) {
    case 'cyan':
      return scheduleEventSurfaceCyanClassName;
    case 'gray':
      return scheduleEventSurfaceGrayClassName;
    case 'green':
      return scheduleEventSurfaceGreenClassName;
    case 'orange':
      return scheduleEventSurfaceOrangeClassName;
    case 'pink':
      return scheduleEventSurfacePinkClassName;
    case 'purple':
      return scheduleEventSurfacePurpleClassName;
    case 'red':
      return scheduleEventSurfaceRedClassName;
    case 'teal':
      return scheduleEventSurfaceTealClassName;
    case 'yellow':
      return scheduleEventSurfaceYellowClassName;
    case 'blue':
    default:
      return scheduleEventSurfaceBlueClassName;
  }
}

export function eventPastSurfaceClassName(
  color: ScheduleEventColor | undefined,
) {
  switch (color) {
    case 'cyan':
      return scheduleEventPastSurfaceCyanClassName;
    case 'gray':
      return scheduleEventPastSurfaceGrayClassName;
    case 'green':
      return scheduleEventPastSurfaceGreenClassName;
    case 'orange':
      return scheduleEventPastSurfaceOrangeClassName;
    case 'pink':
      return scheduleEventPastSurfacePinkClassName;
    case 'purple':
      return scheduleEventPastSurfacePurpleClassName;
    case 'red':
      return scheduleEventPastSurfaceRedClassName;
    case 'teal':
      return scheduleEventPastSurfaceTealClassName;
    case 'yellow':
      return scheduleEventPastSurfaceYellowClassName;
    case 'blue':
    default:
      return scheduleEventPastSurfaceBlueClassName;
  }
}

export function formatWithPlainDate(
  date: PlainDate,
  options: Intl.DateTimeFormatOptions,
  locale: Locale,
  calendar: CalendarSystem,
): string {
  // Core's helper names the month and day that Calendar shows. Raw Intl can
  // start a month of the Chinese or Dangi calendar on another day.
  return formatCalendarDate(calendar, date, options, locale);
}

function monthLabelDate(date: PlainDate, calendar: CalendarSystem): PlainDate {
  return calendarMonthLabelDay(calendarMonthOf(calendar, date));
}

// A Gregorian month or year can span two months or years of another calendar,
// so ranges compare the calendar's own months and years.
function isSameCalendarMonth(
  a: PlainDate,
  b: PlainDate,
  calendar: CalendarSystem,
): boolean {
  return plainDateIsEqual(
    calendarMonthOf(calendar, a).start,
    calendarMonthOf(calendar, b).start,
  );
}

function isSameCalendarYear(
  a: PlainDate,
  b: PlainDate,
  locale: Locale,
  calendar: CalendarSystem,
): boolean {
  const options = {year: 'numeric'} as const;
  return (
    formatWithPlainDate(
      monthLabelDate(a, calendar),
      options,
      locale,
      calendar,
    ) ===
    formatWithPlainDate(monthLabelDate(b, calendar), options, locale, calendar)
  );
}

export function formatMonthTitle(
  date: PlainDate,
  locale: Locale,
  calendar: CalendarSystem,
): string {
  return formatWithPlainDate(
    monthLabelDate(date, calendar),
    {
      month: 'long',
      year: 'numeric',
    },
    locale,
    calendar,
  );
}

export function formatWeekTitle(
  start: PlainDate,
  end: PlainDate,
  locale: Locale,
  calendar: CalendarSystem,
): string {
  if (isSameCalendarMonth(start, end, calendar)) {
    return formatMonthTitle(start, locale, calendar);
  }
  const startMonth = formatWithPlainDate(
    monthLabelDate(start, calendar),
    {month: 'long'},
    locale,
    calendar,
  );
  const endMonthTitle = formatMonthTitle(end, locale, calendar);
  return isSameCalendarYear(start, end, locale, calendar)
    ? `${startMonth} - ${endMonthTitle}`
    : `${formatMonthTitle(start, locale, calendar)} - ${endMonthTitle}`;
}

export function formatFullDate(
  date: PlainDate,
  locale: Locale,
  calendar: CalendarSystem,
): string {
  return formatWithPlainDate(
    date,
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    },
    locale,
    calendar,
  );
}

/** A week row's dates, such as "May 10 – 16, 2026", for its row header. */
export function formatWeekRange(
  start: PlainDate,
  end: PlainDate,
  timezoneID: string,
  locale: Locale,
  calendar: CalendarSystem,
): string {
  return formatCalendarInstantRange(
    calendar,
    new Date(plainDateToInstant(start, timezoneID, 12)),
    new Date(plainDateToInstant(end, timezoneID, 12)),
    {month: 'long', day: 'numeric', year: 'numeric'},
    locale,
    timezoneID,
  );
}

export function formatWeekday(
  date: PlainDate,
  weekday: 'short' | 'long',
  locale: Locale,
  calendar: CalendarSystem,
): string {
  return formatWithPlainDate(date, {weekday}, locale, calendar);
}

export function formatDayNumber(
  date: PlainDate,
  locale: Locale,
  calendar: CalendarSystem,
): string {
  return formatWithPlainDate(date, {day: 'numeric'}, locale, calendar);
}

export function formatHour(hour: number, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 0, 1, hour)));
}

export function formatTimezoneAbbreviation(
  date: PlainDate,
  timezoneID: string,
  locale: Locale,
): string {
  const part = new Intl.DateTimeFormat(locale, {
    timeZone: timezoneID,
    timeZoneName: 'short',
  })
    .formatToParts(new Date(plainDateToInstant(date, timezoneID, 12)))
    .find(({type}) => type === 'timeZoneName');
  return part?.value ?? timezoneID;
}

export function formatEventTime(
  event: CalendarInstantEvent,
  day: PlainDate,
  timezoneID: string,
  locale: Locale,
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID,
  });
  return `${formatter.format(new Date(event.start))} - ${formatter.format(
    new Date(event.end),
  )}`;
}

export function formatEventTimeRange(
  event: CalendarInstantEvent,
  timezoneID: string,
  locale: Locale,
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID,
  });
  return `${formatter.format(new Date(event.start))} - ${formatter.format(
    new Date(event.end),
  )}`;
}

/**
 * An event's start and end with their dates, such as "May 11 at 9:00 AM – May
 * 13 at 9:00 AM" in en-US, for a timed span of a day or more
 * (component:Schedule AR2).
 */
export function formatEventDateTimeRange(
  event: CalendarInstantEvent,
  timezoneID: string,
  locale: Locale,
  calendar: CalendarSystem,
): string {
  return formatCalendarInstantRange(
    calendar,
    new Date(event.start),
    new Date(event.end),
    {month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'},
    locale,
    timezoneID,
  );
}

export function formatEventStartTime(
  event: CalendarInstantEvent,
  timezoneID: string,
  locale: Locale,
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezoneID,
  }).format(new Date(event.start));
}

export function formatEventAccessibilityLabel(
  event: CalendarEvent,
  day: PlainDate,
  timezoneID: string,
  categories: ReadonlyArray<ScheduleCategory>,
  locale: Locale,
): string {
  const category = getEventCategory(event, categories);
  const timeLabel = isDayEvent(event)
    ? 'all day'
    : formatEventTime(event, day, timezoneID, locale);
  return `${event.title}, ${category.label}, ${timeLabel}`;
}

export function getMinutesSinceStartOfDay(
  instant: number,
  timezoneID: string,
): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneID,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instant));
  const lookup = Object.fromEntries(
    parts
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, Number(part.value)]),
  );
  return lookup.hour * 60 + lookup.minute;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function isEventInPast(
  event: CalendarEvent,
  currentTime: Instant,
  timezoneID: string,
): boolean {
  if (isDayEvent(event)) {
    return plainDateIsBefore(
      event.end,
      plainDateFromInstant(currentTime, timezoneID),
    );
  }
  return event.end <= currentTime;
}

/**
 * A measured placement rides a private variable, so one class paints every chip,
 * block, and label and the view only supplies the numbers.
 */
export type ScheduleInstanceStyle = CSSProperties & {
  [key: `--astryx-schedule-${string}`]: string | number;
};

export function monthChipVars(
  span: number,
  level: number,
): ScheduleInstanceStyle {
  return {
    '--astryx-schedule-chip-block-start': `${MONTH_CHIP_TOP + level * MONTH_LEVEL_PITCH}px`,
    // One chip crosses its days' shared borders, so a span of n days is n widths
    // plus the borders it swallows, less the insets at both ends.
    '--astryx-schedule-chip-inline-size': `calc(${span} * 100% + ${span - 1} * ${borderVars['--border-width']} - 2 * ${spacingVars['--spacing-0-5']})`,
  };
}

export function monthMoreButtonPositionVars(
  level: number,
): ScheduleInstanceStyle {
  return {
    '--astryx-schedule-more-button-block-start': `${MONTH_CHIP_TOP + level * MONTH_LEVEL_PITCH}px`,
  };
}

export function timeGridContentVars(
  columnCount: number,
): ScheduleInstanceStyle {
  return {'--astryx-schedule-column-count': Math.max(1, columnCount)};
}

export function dayColumnPlacementVars(index: number): ScheduleInstanceStyle {
  return {'--astryx-schedule-day-column': index + 2};
}

export function allDayRowVars(levelCount: number): ScheduleInstanceStyle {
  return {
    '--astryx-schedule-allday-min-height':
      levelCount > 0 ? `${3 + levelCount * 27}px` : '26px',
  };
}

export function allDaySubgridPlacementVars(
  index: number,
): ScheduleInstanceStyle {
  return {'--astryx-schedule-subgrid-column': index + 1};
}

export function allDayEventSpanVars(
  columnStart: number,
  columnEnd: number,
  level: number,
): ScheduleInstanceStyle {
  return {
    '--astryx-schedule-span-column': `${columnStart + 1} / ${columnEnd + 2}`,
    '--astryx-schedule-span-block-start': `${2 + level * 27}px`,
  };
}

export function timeLabelPositionVars(
  index: number,
  hourHeight: number,
): ScheduleInstanceStyle {
  return {'--astryx-schedule-time-label-top': `${index * hourHeight - 1}px`};
}

export function timeColumnRowsVars(hourHeight: number): ScheduleInstanceStyle {
  return {'--astryx-schedule-hour-height': `${hourHeight}px`};
}

// Blocks in one overlap cluster split the column into equal tracks and never
// overlap, so they carry no z-index of their own; the 2px insets keep the same
// gutter a lone block has at the column's edges.
export function timedEventPositionVars(
  top: number,
  height: number,
  inlineStart: number,
  inlineSize: number,
): ScheduleInstanceStyle {
  return {
    '--astryx-schedule-event-block-start': `${top}%`,
    '--astryx-schedule-event-block-size': `${height}%`,
    '--astryx-schedule-event-inline-start': `${inlineStart}%`,
    '--astryx-schedule-event-inline-size': `${inlineSize}%`,
  };
}

export function currentTimeLineVars(top: number): ScheduleInstanceStyle {
  return {'--astryx-schedule-now-top': `calc(${top}% + 2px)`};
}
