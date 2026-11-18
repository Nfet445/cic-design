// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scheduleClasses.ts
 * @input Nothing: every class is fixed
 * @output Tailwind class strings for the Schedule views and their parts
 * @position Used by `shared.tsx` and the five view files
 *
 * A measured placement rides on a private `--astryx-schedule-*` variable that
 * the view sets inline: a class cannot carry a running value, and the variable
 * keeps the arithmetic in one place.
 */

import {tw} from '../tw';

// The body face and primary text of every block, dot, and row label.
const baseText = 'font-sans text-primary';

const supportingText =
  'text-[length:var(--text-supporting-size)] leading-[var(--text-supporting-leading)]';

const cellBorder =
  'border-e border-b border-e-[color:var(--color-border)] border-b-[color:var(--color-border)]';

export const scheduleRootClassName = tw('flex flex-col min-w-0 min-h-0');

export const scheduleFrameClassName = tw(
  'flex-1 flex flex-col min-w-0 min-h-0',
  'border border-[color:var(--color-border)] rounded-lg bg-card overflow-hidden',
);

export const scheduleHeaderClassName = tw(
  'grid [grid-template-columns:minmax(0,1fr)_auto_minmax(0,1fr)] items-center',
  'gap-3 py-3 px-4',
  'border-b border-b-[color:var(--color-border)]',
);

export const scheduleHeaderControlsClassName = 'justify-self-start';

export const scheduleHeaderTitleClassName = tw(
  'justify-self-center text-center min-w-0',
);

export const scheduleHeaderTitleContentClassName = tw(
  'inline-flex items-center gap-2',
);

export const scheduleLoadingSpinnerClassName = 'inline-flex';

export const scheduleLoadingSpinnerHiddenClassName = 'invisible';

export const scheduleHeaderStatusClassName = 'justify-self-end min-w-0';

export const scheduleTitleEmphasisClassName = 'font-bold';

export const scheduleVisuallyHiddenClassName = tw(
  'absolute w-px h-px p-0 -m-px overflow-hidden',
  '[clip:rect(0_0_0_0)] whitespace-nowrap border-0',
);

export const scheduleWeekHeaderClassName = tw(
  'grid [grid-template-columns:repeat(7,minmax(0,1fr))]',
  'border-b border-b-[color:var(--color-border)]',
);

export const scheduleWeekdayLabelClassName = 'py-2 px-3 text-center';

export const scheduleWeekdayHeadingClassName = 'text-center';

export const scheduleMonthGridClassName = 'overflow-x-auto';

// The month surface isolates its paint order: chips rise above the cells and a
// focused "+N more" above the chips, and nothing outside the surface sees
// either value.
export const scheduleMonthGridSurfaceClassName = tw(
  'relative w-full min-w-[784px] isolate',
);

export const scheduleMonthCellGridClassName = tw(
  'grid [grid-template-columns:repeat(7,minmax(0,1fr))] [grid-auto-rows:128px]',
);

export const scheduleMonthGridRowClassName = 'contents';

export const scheduleMonthCellClassName = tw(
  '[&&:focus-visible]:[outline-offset:calc(-1*var(--focus-outline-width))]',
  'relative flex flex-col gap-1 min-w-0 p-0 bg-card',
  cellBorder,
);

export const scheduleMonthCellLastColumnClassName = 'border-e-0';

export const scheduleMonthCellLastRowClassName = 'border-b-0';

export const scheduleMonthCellOutsideClassName = 'bg-muted';

export const scheduleMonthDayNumberClassName = tw(
  'self-start inline-flex items-center justify-start w-6 h-6 m-0.5 ps-1 pe-0',
  'rounded-full text-secondary',
);

export const scheduleCurrentDayPillClassName = tw(
  'text-on-accent bg-accent-bg',
);

export const scheduleMonthEventStackClassName = tw(
  'flex flex-col gap-0.5 min-w-0',
);

// A chip starts a chip's inset into its first day's cell, paints across its
// days on its level, and rises above the cells it crosses inside the isolated
// surface (component:Schedule FR15, FR19). The span and the level reach it as
// inline variables.
export const scheduleMonthChipClassName = tw(
  'absolute start-0.5 min-w-0 z-1',
  '[inset-block-start:var(--astryx-schedule-chip-block-start)]',
  '[inline-size:var(--astryx-schedule-chip-inline-size)]',
);

// The last column's cell has no end border, so the same chip is one border
// narrower than its padding box.
export const scheduleMonthChipInLastColumnClassName =
  '[inline-size:calc(100%_-_2*var(--spacing-0-5)_-_var(--border-width))]';

export const scheduleMonthChipFocusClassName = 'z-1 focus-visible:z-2';

export const scheduleMonthMoreButtonClassName = tw(
  'absolute start-0.5 end-[calc(var(--spacing-0-5)_+_var(--border-width))]',
  'flex items-center min-w-0 overflow-hidden border border-[color:transparent] rounded-xs',
  'py-0.5 px-1.5',
  baseText,
  supportingText,
  'font-medium text-secondary text-ellipsis whitespace-nowrap',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]',
  'focus-visible:z-2',
);

export const scheduleMonthMoreButtonPositionClassName =
  '[inset-block-start:var(--astryx-schedule-more-button-block-start)]';

// The day popover lists rows that ellipsize their titles, so its content has a
// cap for the titles to fit within.
export const scheduleMonthDayEventsClassName = tw(
  'flex flex-col gap-2 [max-inline-size:360px]',
);

// A row of a day's list that opens its event: the whole row is the button, with
// the list row's look and the shared focus ring. A past row is muted with the
// secondary text token, which the theme guarantees at AA (a faded row pulled
// its text to 2.35:1 on the light theme).
export const scheduleMonthDayEventButtonClassName = tw(
  'w-full rounded-xs',
  '[@media(hover:hover)]:[&:hover:where(:not(:disabled,[aria-disabled=true]))]:bg-[color:var(--color-overlay-hover)]',
);

export const scheduleMonthDayEventListClassName = tw(
  'flex flex-col gap-2 m-0 p-0 list-none',
);

export const scheduleEventPillClassName = tw(
  'flex items-center gap-1 min-w-0 border border-solid rounded-xs py-0.5 px-1.5',
  baseText,
  supportingText,
  'font-medium',
);

export const scheduleEventTitleClassName = tw(
  'overflow-hidden text-ellipsis whitespace-nowrap min-w-0',
);

export const scheduleEventTimeClassName = tw(
  'block shrink-0 opacity-80 overflow-hidden text-ellipsis whitespace-nowrap',
  '@max-[72px]:hidden',
);

// A chip that leads with its title is one line tall. Its title and time wrap as
// a flex row, so the time drops to a second, clipped line whenever both do not
// fit side by side: layout, not script, decides whether the time shows
// (component:Schedule FR18, PR5).
export const scheduleTitleFirstLineClassName = tw(
  'flex flex-wrap items-baseline gap-x-1 grow min-w-0 overflow-hidden',
  '[block-size:calc(var(--text-supporting-size)*var(--text-supporting-leading))]',
);

// Alone on the line, a long title shrinks and ellipsizes.
export const scheduleTitleFirstTitleClassName = tw(
  'min-w-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap',
);

export const scheduleTitleFirstTimeClassName = tw(
  'shrink-0 whitespace-nowrap opacity-80',
);

export const scheduleMoreEventsClassName = tw(
  baseText,
  'text-secondary',
  supportingText,
);

// The time grid is one scroll viewport. Its day header, all-day row, hour
// gutter, and day columns are items of a single grid inside it, pinned with
// position: sticky, so a scrollbar, a zoom level, or an inline scroll cannot
// separate header tracks from body tracks. Local z-index values order the
// pinned parts inside the isolated viewport only.
//
// A 640px flex basis, not a height: inside the frame's indefinite-height column
// a `height` with `flex: 1` resolves to content size, so the grid would grow to
// its full hours and the page, not the viewport, would scroll.
export const scheduleTimeGridFrameClassName = tw(
  'relative flex flex-col grow shrink basis-[640px] min-h-0 min-w-0',
);

// The viewport paints no focus outline of its own: the frame clips outside its
// border box, and an inset outline is painted under the viewport's pinned
// header and gutter. The adjacent overlay paints the ring above these parts.
export const scheduleTimeGridFocusRingClassName = 'astryx-schedule-focus-ring';
export const scheduleEventPopoverBodyClassName = 'astryx-schedule-popover-size';

export const scheduleTimeGridViewportClassName = tw(
  'grow shrink basis-0 min-h-0 min-w-0',
  '[scrollbar-gutter:stable] isolate outline-none',
);

// The minimum width keeps the grid box as wide as its tracks when the viewport
// is narrower, so the pinned gutter has the whole scrolled extent as its sticky
// containing block instead of only the first viewport width.
export const scheduleTimeGridContentClassName = tw(
  'grid',
  '[grid-template-columns:60px_repeat(var(--astryx-schedule-column-count),minmax(140px,1fr))]',
  '[grid-template-rows:56px_auto_auto]',
  '[min-width:calc(60px_+_var(--astryx-schedule-column-count)*140px)]',
);

export const scheduleDayColumnPlacementClassName =
  '[grid-column:var(--astryx-schedule-day-column)]';

export const scheduleTimeGridCornerClassName = tw(
  '[grid-column:1] [grid-row:1] sticky top-0 start-0 z-3 bg-card',
  cellBorder,
);

export const scheduleTimeGridHeaderCellClassName = tw(
  '[grid-row:1] sticky top-0 z-2',
  'flex flex-col items-center justify-center gap-0.5 min-w-0 bg-card',
  cellBorder,
);

export const scheduleTimeGridHeaderCellLastClassName = 'border-e-0';

export const scheduleTimeGridHeaderHeadingClassName = 'text-center';

export const scheduleTimeGridHeaderHeadingContentClassName = tw(
  'inline-flex items-center justify-center gap-1',
);

export const scheduleTimeGridDayNumberClassName = tw(
  'inline-flex items-center justify-center rounded-full',
);

export const scheduleTimeGridCurrentDayPillClassName = tw(
  'min-w-[30px] h-[30px] leading-[30px] text-on-accent bg-accent-bg',
);

export const scheduleAllDayLabelClassName = tw(
  '[grid-column:1] [grid-row:2] sticky top-[56px] start-0 z-3',
  'flex items-center justify-end py-1 px-2 bg-card',
  cellBorder,
);

// A subgrid, so all-day cells and spans sit on the day columns' own tracks.
export const scheduleAllDayRowClassName = tw(
  '[grid-column:2/-1] [grid-row:2] grid [grid-template-columns:subgrid]',
  'sticky top-[56px] z-2 isolate min-w-0 bg-card',
  'min-h-[var(--astryx-schedule-allday-min-height)]',
  'border-b border-b-[color:var(--color-border)]',
);

export const scheduleAllDaySubgridPlacementClassName =
  '[grid-column:var(--astryx-schedule-subgrid-column)]';

export const scheduleAllDayCellClassName = tw(
  '[grid-row:1] min-w-0 border-e border-e-[color:var(--color-border)]',
);

export const scheduleAllDayCellLastClassName = 'border-e-0';

export const scheduleAllDayEventSpanClassName = tw(
  '[grid-row:1] [grid-column:var(--astryx-schedule-span-column)] self-start min-w-0',
  'ms-0.5 me-[calc(var(--spacing-0-5)_+_var(--border-width))]',
  '[margin-block-start:var(--astryx-schedule-span-block-start)]',
);

export const scheduleTimeLabelsClassName = tw(
  '[grid-column:1] [grid-row:3] sticky start-0 z-2 bg-card',
  'border-e border-e-[color:var(--color-border)]',
);

export const scheduleTimeLabelClassName = tw(
  baseText,
  'text-secondary',
  supportingText,
  'absolute inset-x-0 -translate-y-1/2 ps-1 pe-1 text-end',
);

export const scheduleTimeLabelPositionClassName =
  'top-[var(--astryx-schedule-time-label-top)]';

// Each day column isolates its own paint order: blocks, the now-line, and a
// raised focused block never rank against anything outside the column.
export const scheduleTimeColumnClassName = tw(
  '[grid-row:3] relative isolate grid min-w-0',
  'border-e border-e-[color:var(--color-border)]',
);

export const scheduleTimeColumnRowsClassName =
  '[grid-auto-rows:var(--astryx-schedule-hour-height)]';

export const scheduleTimeColumnLastClassName = 'border-e-0';

export const scheduleHourSlotClassName =
  'border-b border-b-[color:var(--color-border)]';

export const scheduleHourSlotLastClassName = 'border-b-0';

export const scheduleTimedEventClassName = tw(
  baseText,
  supportingText,
  'font-medium',
  'absolute flex flex-col gap-0 min-h-6 min-w-0 overflow-hidden',
  '[container-type:inline-size]',
  'border border-[color:var(--color-border)] rounded-xs',
  'pt-0.5 pb-1 px-1',
);

// An event that opens the popover is a native button that keeps the block's own
// paint: the reset removes only what the user agent adds to a button. Block
// display lets an all-day pill fill the days its button spans; a timed block's
// own flex display wins over it. A button grid item would otherwise size to its
// content.
export const scheduleEventButtonResetClassName = tw(
  'appearance-none block justify-self-stretch m-0 p-0 border-0 [border-style:none]',
  'bg-transparent [color:inherit] [font:inherit] text-start',
  'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
);

// A focused block rises above its neighbours inside the isolated column so its
// ring is never clipped by a later sibling.
export const scheduleEventButtonFocusClassName = 'focus-visible:z-1';

export const scheduleListClassName = 'flex flex-col';

export const scheduleListDayClassName = tw(
  'grid [grid-template-columns:88px_minmax(0,1fr)] items-start gap-x-3 py-3 px-3',
  'border-b border-b-[color:var(--color-border)]',
);

export const scheduleListDayLastClassName = 'border-b-0';

export const scheduleListDayHeadingClassName = tw(
  '[grid-column:1] inline-flex items-center justify-start gap-x-2 -mt-1 -ms-1',
);

export const scheduleListDayNumberClassName = tw(
  'inline-flex items-center justify-end w-[30px] h-[30px] rounded-full',
);

export const scheduleListDayNumberTextClassName = 'font-bold';

export const scheduleListDayNumberCurrentClassName = tw(
  'justify-center text-on-accent bg-accent-bg',
);

export const scheduleListEventsClassName = tw(
  '[grid-column:2] flex flex-col gap-2 min-w-0',
);

export const scheduleListNowRowClassName = tw(
  'relative h-[10px] my-0.5',
  'before:absolute before:inset-x-0 before:top-1 before:border-t-2',
  'before:border-t-[color:var(--color-border-orange)] before:content-[""]',
  'after:absolute after:-start-px after:top-0 after:w-[10px] after:h-[10px]',
  'after:rounded-full after:bg-[color:var(--color-border-orange)] after:content-[""]',
);

export const scheduleListEventRowClassName = tw(
  'grid [grid-template-columns:12px_144px_minmax(0,1fr)] items-center gap-2 min-w-0',
);

export const scheduleListEventDotClassName = 'w-[10px] h-[10px] rounded-full';

export const scheduleListEventTimeClassName = tw(
  baseText,
  'text-secondary',
  supportingText,
  'whitespace-nowrap',
);

export const scheduleListEventTitleClassName = tw(
  baseText,
  'min-w-0 overflow-hidden text-ellipsis whitespace-nowrap',
  'text-[length:var(--text-body-size)] leading-[var(--text-body-leading)] font-medium',
);

export const scheduleListEventTitlePastClassName = 'text-secondary';

export const scheduleListEventDotPastClassName = 'opacity-50';

export const scheduleTimedEventPositionClassName = tw(
  '[top:calc(var(--astryx-schedule-event-block-start)_+_2px)]',
  '[height:calc(var(--astryx-schedule-event-block-size)_-_5px)]',
  '[inset-inline-start:calc(var(--astryx-schedule-event-inline-start)_+_var(--spacing-0-5))]',
  '[inline-size:calc(var(--astryx-schedule-event-inline-size)_-_var(--spacing-0-5)*2)]',
);

export const scheduleCurrentTimeLineClassName = tw(
  'absolute inset-x-0 [top:var(--astryx-schedule-now-top)]',
  'border-t-2 border-t-[color:var(--color-border-orange)]',
  'z-1 pointer-events-none',
  'before:absolute before:-start-1.5 before:-top-1.5 before:w-[10px] before:h-[10px]',
  'before:rounded-full before:bg-[color:var(--color-border-orange)] before:content-[""]',
);

export const scheduleEventBlueClassName =
  'text-blue-vivid bg-blue-subtle border-blue-ring';
export const scheduleEventCyanClassName =
  'text-cyan-vivid bg-cyan-subtle border-cyan-ring';
export const scheduleEventGrayClassName =
  'text-gray-vivid bg-gray-subtle border-gray-ring';
export const scheduleEventGreenClassName =
  'text-green-vivid bg-green-subtle border-green-ring';
export const scheduleEventOrangeClassName =
  'text-orange-vivid bg-orange-subtle border-orange-ring';
export const scheduleEventPinkClassName =
  'text-pink-vivid bg-pink-subtle border-pink-ring';
export const scheduleEventPurpleClassName =
  'text-purple-vivid bg-purple-subtle border-purple-ring';
export const scheduleEventRedClassName =
  'text-red-vivid bg-red-subtle border-red-ring';
export const scheduleEventTealClassName =
  'text-teal-vivid bg-teal-subtle border-teal-ring';
export const scheduleEventYellowClassName =
  'text-yellow-vivid bg-yellow-subtle border-yellow-ring';

export const scheduleEventDotBlueClassName = 'bg-blue-ring';
export const scheduleEventDotCyanClassName = 'bg-cyan-ring';
export const scheduleEventDotGrayClassName =
  'bg-[color:var(--color-text-secondary)]';
export const scheduleEventDotGreenClassName = 'bg-green-ring';
export const scheduleEventDotOrangeClassName = 'bg-orange-ring';
export const scheduleEventDotPinkClassName = 'bg-pink-ring';
export const scheduleEventDotPurpleClassName = 'bg-purple-ring';
export const scheduleEventDotRedClassName = 'bg-red-ring';
export const scheduleEventDotTealClassName = 'bg-teal-ring';
export const scheduleEventDotYellowClassName = 'bg-yellow-ring';

export const scheduleEventSurfaceBlueClassName = tw(
  'text-blue-vivid border-blue-ring',
  'bg-[color-mix(in_srgb,var(--color-blue-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfaceCyanClassName = tw(
  'text-cyan-vivid border-cyan-ring',
  'bg-[color-mix(in_srgb,var(--color-cyan-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfaceGrayClassName = tw(
  'text-gray-vivid border-gray-ring',
  'bg-[color-mix(in_srgb,var(--color-gray-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfaceGreenClassName = tw(
  'text-green-vivid border-green-ring',
  'bg-[color-mix(in_srgb,var(--color-green-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfaceOrangeClassName = tw(
  'text-orange-vivid border-orange-ring',
  'bg-[color-mix(in_srgb,var(--color-orange-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfacePinkClassName = tw(
  'text-pink-vivid border-pink-ring',
  'bg-[color-mix(in_srgb,var(--color-pink-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfacePurpleClassName = tw(
  'text-purple-vivid border-purple-ring',
  'bg-[color-mix(in_srgb,var(--color-purple-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfaceRedClassName = tw(
  'text-red-vivid border-red-ring',
  'bg-[color-mix(in_srgb,var(--color-red-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfaceTealClassName = tw(
  'text-teal-vivid border-teal-ring',
  'bg-[color-mix(in_srgb,var(--color-teal-ring)_20%,var(--color-card))]',
);
export const scheduleEventSurfaceYellowClassName = tw(
  'text-yellow-vivid border-yellow-ring',
  'bg-[color-mix(in_srgb,var(--color-yellow-ring)_20%,var(--color-card))]',
);

export const scheduleEventPastSurfaceBlueClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-blue-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-blue-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-blue-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfaceCyanClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-cyan-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-cyan-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-cyan-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfaceGrayClassName = tw(
  'text-secondary border-[color:var(--color-border)]',
  'bg-[color:color-mix(in_srgb,var(--color-gray-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfaceGreenClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-green-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-green-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-green-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfaceOrangeClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-orange-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-orange-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-orange-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfacePinkClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-pink-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-pink-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-pink-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfacePurpleClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-purple-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-purple-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-purple-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfaceRedClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-red-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-red-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-red-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfaceTealClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-teal-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-teal-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-teal-ring)_10%,var(--color-card))]',
);
export const scheduleEventPastSurfaceYellowClassName = tw(
  'text-[color:color-mix(in_srgb,var(--color-yellow-vivid)_52%,var(--color-text-secondary))]',
  'border-[color:color-mix(in_srgb,var(--color-yellow-ring)_48%,var(--color-border))]',
  'bg-[color:color-mix(in_srgb,var(--color-yellow-ring)_10%,var(--color-card))]',
);
