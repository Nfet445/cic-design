// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TouchDateField.tsx
 * @input Uses React, Field, BottomSheet, Button, Icon, Calendar hooks, the resolved calendar, MonthScroller, MonthYearWheels
 * @output Exports TouchDateField — the touch surface behind DateInput
 * @position Internal component; consumed by DateInput.tsx
 *
 * The touch half of `DateInput`, holding `DateInput`'s whole prop
 * contract so the two are interchangeable. Everything field-shaped —
 * `Field` wrapper, status treatment, optimistic `changeAction`, the
 * disabled-reason tooltip, `InputGroup` membership — behaves exactly as it
 * does on the desktop control; only the picker differs.
 *
 * ## The closed field is deliberately the same control
 *
 * It is a real `<input>`, not a button: same element, same `role="combobox"`,
 * same border, same clear button, so `ref` (typed `Ref<HTMLInputElement>` by
 * `DateInputProps`) is honestly a reference to an input, the label's `for`
 * names it natively, and the switch between surfaces moves nothing on screen.
 *
 * It just cannot be typed into: `readOnly` blocks entry, and `inputMode="none"`
 * stops the virtual keyboard from opening over the sheet. Text entry is the
 * one part of the desktop control that has no place here — the keyboard it
 * summons would cover the picker it is meant to fill in.
 *
 * ## Three ideas in the picker
 *
 * 1. One month per screen. Every pane is exactly the height of the scrollport
 *    and snaps to its start, so the picker is a fixed height and there is no
 *    resting position showing half of two months. See MonthScroller.
 * 2. Swiping is the month control, and the arrows are the backup. A flick
 *    reaches a neighbouring month in the direction you already think of it;
 *    the pair of arrows in the header's trailing corner is there for a
 *    deliberate single step, and for anyone not swiping at all.
 * 3. The title is the escape hatch. Tap it and the same box becomes a month
 *    wheel and a year wheel — a flick each to reach 2019 instead of forty.
 *
 * Reset is chrome, so it sits in the header beside the arrows rather than in
 * the footer: the footer is where the task ends, and an undo of equal weight
 * beside Save is a mis-tap that throws away the date just chosen.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateInput/DateInput.tsx
 * - /packages/core/src/DateInput/DateInput.doc.mjs
 * - /packages/core/src/DateInput/DateInputTouch.test.tsx
 */

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import {flushSync} from 'react-dom';
import {moveFocusLeftBehind, noteFocusWithin} from '../utils/focusReturn';
import * as stylex from '@stylexjs/stylex';
import {inputDisabledFocusStyles} from '../Field/inputDisabledFocus';
import {BottomSheet} from '../BottomSheet';
import {Button} from '../Button';
import {useCalendarConstraints} from '../Calendar';
import type {DateInputProps} from './DateInput';
import {
  Field,
  InputClearButton,
  fieldInputWrapperClassName,
  fieldInputWrapperDisabledClassName,
} from '../Field';
import {useInputStatusIcon, useMergedRefs} from '../hooks';
import {useResolvedRequired} from '../hooks/useResolvedRequired';
import {useToday} from '../hooks/useToday';
import {useBusyAnnouncement} from '../hooks/useBusyAnnouncement';
import {Icon} from '../Icon';
import {IconButton} from '../IconButton';
import {useLocale} from '../i18n';
import {useInputGroup} from '../InputGroup';
import {useFieldInputStyling} from '../Field/fieldParts';
import {joinAriaIDs} from '../utils/inputAria';
import {inputGroupItemProps} from '../InputGroup/groupStyles';
import {inputGroupMemberClassName} from '../InputGroup/inputGroupClasses';
import {useSize} from '../SizeContext';
import {Spinner} from '../Spinner';
import {useTooltip} from '../Tooltip';
import {VisuallyHidden} from '../VisuallyHidden';
import {
  focusOutlineStyles,
  getInputARIA,
  isImeKeyEvent,
  mergeProps,
  RTL_MIRROR_CLASS,
  themeProps,
  plainDateFromISO,
  plainDateIsEqual,
  plainDateToISO,
  plainDateToday,
  type ISODateString,
} from '../utils';
import {useCalendarSystem} from '../i18n/useCalendarSystem';
import {
  calendarDayOfMonth,
  formatCalendarMonthLabel,
} from '../utils/calendarSystem';
import {formatCalendarDateText} from '../utils/calendarDateParser';
import {chainEventHandlers} from '../utils/chainEventHandlers';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {normalizeDayOfWeek} from '../utils/dateTypes';
import {getWeekdayHeaders} from '../Calendar/getWeekdayHeaderNames';
import {useTouchPresentation} from '../utils/touchPresentation';
import {MonthScroller, type MonthScrollerHandle} from './MonthScroller';
import {MonthYearWheels} from './MonthYearWheels';
import {
  DEFAULT_MONTH_REACH,
  clampIndex,
  createMonthModel,
  dateInMonth,
} from './monthGeometry';
import {
  dateInputSizeClassName,
  touchDateBodyClassName,
  touchDateFieldIconButtonClassName,
  touchDateFieldInputClassName,
  touchDateFieldWrapperClassName,
  touchDateFooterActionClassName,
  touchDateFooterClassName,
  touchDateHeaderClassName,
  touchDateHeaderResetClassName,
  touchDateMonthArrowClassName,
  touchDateMonthArrowIconClassName,
  touchDateMonthArrowsClassName,
  touchDatePanelBeneathClassName,
  touchDatePanelClassName,
  touchDatePanelOverlayClassName,
  touchDateResetButtonClassName,
  touchDateSheetBodyClassName,
  touchDateSurfaceClassName,
  touchDateTitleChevronClassName,
  touchDateTitleClassName,
  touchDateTitleTextClassName,
  touchDateWeekdayClassName,
  touchDateWeekdaysClassName,
} from './dateInputClasses';
import {tw} from '../utils/tw';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/DateInput/TouchDateField.generated';

// The month math needs a date before today is known (server render,
// hydration). The sheet's content, which shows the month, waits for today.
const UNKNOWN_TODAY_STAND_IN = plainDateFromISO('1970-01-01');

registerEnglishFallback(english);

/**
 * The touch surface. Takes `DateInput`'s props verbatim; see
 * {@link DateInput} for when it is chosen over the desktop control.
 */
export function TouchDateField({
  label,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  disabledMessage,
  value,
  onChange,
  changeAction,
  isLoading = false,
  min,
  max,
  dateConstraints,
  placeholder: placeholderFromProps,
  size: sizeProp,
  status,
  statusVariant = 'attached',
  labelTooltip,
  hasClear = false,
  // Desktop-only: the scroller is a single continuously paged column, so a
  // second month would be the month already one flick away. Accepted (the
  // prop types are shared) and ignored.
  numberOfMonths: _numberOfMonths,
  weekStartsOn: weekStartsOnProp = 0,
  format = 'date_long',
  calendar: calendarProp,
  width,
  containerXstyle,
  containerClassName,
  containerStyle,
  controlXstyle,
  controlClassName,
  controlStyle,
  ref,
  ...restProps
}: DateInputProps) {
  const {rest, container} = useFieldInputStyling('DateInput', restProps, {
    containerXstyle,
    containerClassName,
    containerStyle,
  });
  const {
    id: idProp,
    'aria-describedby': ariaDescribedByProp,
    'aria-labelledby': ariaLabelledByProp,
    onClick: onClickProp,
    onKeyDown: onKeyDownProp,
    ...controlProps
  } = rest;
  const pressable = usePressFeedback();
  const t = useComponentTranslator();
  const locale = useLocale();
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});
  const placeholder =
    placeholderFromProps ?? t('@astryx.dateInput.placeholder');
  const size = useSize(sizeProp, 'md');
  const weekStartsOn = normalizeDayOfWeek(weekStartsOnProp);
  const calendar = useCalendarSystem(calendarProp, 'DateInput');
  const monthModel = useMemo(() => createMonthModel(calendar), [calendar]);

  const generatedID = useId();
  const id = idProp ?? generatedID;
  const fieldLabelID = useId();
  const inputLabelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mergedInputRef = useMergedRefs(ref, inputRef);
  const inputGroup = useInputGroup();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const isEffectivelyDisabled = isDisabled || isBusy;

  // Same contract as DateInput: a disabled or busy field never renders native
  // `disabled` (spec:AST-085 FR1); the input stays focusable via
  // aria-disabled. The disabled-reason tooltip's listeners attach to the
  // wrapper. Only the persistent disabled state surfaces a reason, never the
  // transient busy one.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  const {isDateDisabled} = useCalendarConstraints({min, max, dateConstraints});

  const {statusIcon, describedBy: statusTooltipDescribedBy} =
    useInputStatusIcon({
      status,
      statusVariant,
      isInGroup: !!inputGroup,
    });

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelID,
    [
      description ? descriptionID : null,
      statusVariant !== 'tooltip' && status?.message ? statusMessageID : null,
      statusTooltipDescribedBy,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
      ariaDescribedByProp,
    ],
    inputGroup,
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const sheetBodyRef = useRef<HTMLDivElement | null>(null);
  // The busy Spinner is decorative; this control announces its busy start
  // (spec:AST-086 FR8). A date picked under a pending changeAction starts it
  // while the modal sheet is open, so it is announced from inside the sheet.
  useBusyAnnouncement(
    isBusy,
    t('@astryx.spinner.loading'),
    isSheetOpen ? sheetBodyRef : inputRef,
  );
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const scrollerHandleRef = useRef<MonthScrollerHandle | null>(null);
  const previousArrowRef = useRef<HTMLButtonElement | null>(null);
  const nextArrowRef = useRef<HTMLButtonElement | null>(null);
  const monthYearButtonRef = useRef<HTMLButtonElement | null>(null);
  // Pending focus handoff from the clear button; see handleClear.
  const clearFocusTimerRef = useRef<number | null>(null);
  // Releases the focus timer on unmount.
  useEffect(
    () => () => {
      if (clearFocusTimerRef.current != null) {
        clearTimeout(clearFocusTimerRef.current);
      }
    },
    [],
  );

  // Unknown on the server and while hydrating. The sheet's content waits for
  // it, so hydration matches the server markup.
  const today = useToday();
  const selectedDate = useMemo(
    () =>
      optimisticValue != null && /^\d{4}-\d{2}-\d{2}$/.test(optimisticValue)
        ? plainDateFromISO(optimisticValue)
        : null,
    [optimisticValue],
  );

  // The reachable range. Explicit bounds win; otherwise the scroller reaches a
  // century in each direction from wherever it opened. It is anchored once:
  // recomputing it as the selection moves would shift every pane's scroll
  // offset under the user mid-gesture.
  // Indexes belong to the calendar, so DateInput remounts this surface when
  // the calendar changes.
  // Without a value, the sheet opens on today's month. A hydrated sheet stores
  // that month in the first render that knows today. Then a later render after
  // a month-end midnight does not move an open sheet.
  const [anchoredMonthIndex, setAnchoredMonthIndex] = useState<number | null>(
    () => {
      const opening =
        value != null && /^\d{4}-\d{2}-\d{2}$/.test(value)
          ? plainDateFromISO(value)
          : today;
      return opening == null ? null : monthModel.indexOf(opening);
    },
  );
  if (anchoredMonthIndex == null && today != null) {
    setAnchoredMonthIndex(monthModel.indexOf(today));
  }
  const anchorMonthIndex =
    anchoredMonthIndex ?? monthModel.indexOf(today ?? UNKNOWN_TODAY_STAND_IN);
  const minMonthIndex =
    min != null
      ? monthModel.indexOf(plainDateFromISO(min))
      : anchorMonthIndex - DEFAULT_MONTH_REACH;
  const maxMonthIndex =
    max != null
      ? monthModel.indexOf(plainDateFromISO(max))
      : anchorMonthIndex + DEFAULT_MONTH_REACH;

  // Set once the person moves the month; until then the opening month.
  const [chosenMonthIndex, setMonthIndex] = useState<number | null>(() =>
    anchoredMonthIndex == null
      ? null
      : clampIndex(anchoredMonthIndex, minMonthIndex, maxMonthIndex),
  );
  const monthIndex =
    chosenMonthIndex ??
    clampIndex(anchorMonthIndex, minMonthIndex, maxMonthIndex);

  const weekdayHeaders = useMemo(
    () => getWeekdayHeaders(locale, weekStartsOn),
    [locale, weekStartsOn],
  );
  // The day the picker keeps: the selected date's day of its month. A month
  // with an era change takes its heading era from this day.
  const keptDay =
    selectedDate == null ? 1 : calendarDayOfMonth(calendar, selectedDate);
  const monthYearLabel = formatCalendarMonthLabel(
    calendar,
    monthModel.monthAt(monthIndex),
    locale,
    keptDay,
  );

  // Formats the committed value only. A function format is called with the ISO
  // value; a named one writes the date in the calendar exactly as the desktop
  // control commits it.
  const displayValue =
    optimisticValue != null && /^\d{4}-\d{2}-\d{2}$/.test(optimisticValue)
      ? typeof format === 'function'
        ? format(optimisticValue)
        : formatCalendarDateText(
            plainDateFromISO(optimisticValue),
            format,
            locale,
            calendar,
          )
      : '';

  const fireChange = useCallback(
    (newValue: ISODateString | undefined) => {
      if (isEffectivelyDisabled) {
        return;
      }
      onChange?.(newValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await changeAction(newValue);
        });
      }
    },
    [
      isEffectivelyDisabled,
      onChange,
      changeAction,
      startTransition,
      setOptimisticValue,
    ],
  );

  const openSheet = useCallback(() => {
    if (!isEffectivelyDisabled) {
      // Always onto the calendar, whatever was showing last time. The wheels
      // are a detour taken to reach a far month, not a mode to be left in:
      // reopening into them would answer a question the user has not asked
      // yet, and hide the dates they came back for behind another tap.
      setIsWheelOpen(false);
      setIsSheetOpen(true);
    }
  }, [isEffectivelyDisabled]);

  const handleClear = useCallback(() => {
    fireChange(undefined);
    // Focus goes back to the field on the NEXT task, not synchronously.
    //
    // Clearing unmounts this button (it only renders while there is a value),
    // and focusing another element in the same task as that unmount makes iOS
    // Safari scroll the whole document to the top — the user is thrown from
    // wherever the field sat to the start of the page. Measured on the iOS 26
    // simulator against the live docsite, field at scrollY 2055: synchronous
    // focus lands at 0, deferred focus stays at 2055.
    //
    // `preventScroll` alone does NOT fix it (verified: still 0) — this is not
    // the browser's ordinary scroll-the-focused-element-into-view step, so the
    // deferral is the load-bearing half. It is kept because the reveal scroll
    // is real too, and unwanted for the same reason: the field the user just
    // tapped is already on screen (+12px on a plain page without it).
    //
    // Skipping the focus entirely would also stop the scroll, but then focus
    // dies with the unmounting button and lands on <body>.
    const field = inputRef.current;
    if (field == null) {
      return;
    }
    clearFocusTimerRef.current = window.setTimeout(() => {
      clearFocusTimerRef.current = null;
      field.focus({preventScroll: true});
    }, 0);
  }, [fireChange]);

  /**
   * Put the picker back to how it opens: no date, current month.
   *
   * Two things, because clearing a date and then being left staring at the
   * month of the date you just cleared is a half-finished action — the
   * calendar should look the way it does before anything is chosen.
   *
   * "If possible" is load-bearing: a range can exclude the current month
   * entirely (a booking window starting next quarter), and there is no
   * honest place to go in that case. `clampIndex` would silently land on the
   * nearest edge, which is a different month presented as if it were today's,
   * so the move is skipped instead and the calendar stays where it is. The
   * value is still cleared either way — that half never depends on the range.
   */
  const handleResetInSheet = useCallback(() => {
    // Disabled: reject the entire reset without closing or moving focus.
    // Busy-only fields keep month navigation; fireChange blocks the clear.
    if (isDisabled) {
      return;
    }
    fireChange(undefined);
    const currentMonth = monthModel.indexOf(plainDateToday());
    if (currentMonth < minMonthIndex || currentMonth > maxMonthIndex) {
      return;
    }
    if (currentMonth === monthIndex) {
      return;
    }
    setMonthIndex(currentMonth);
    scrollerHandleRef.current?.scrollToMonth(currentMonth, 'smooth');
  }, [
    isDisabled,
    fireChange,
    monthModel,
    monthIndex,
    minMonthIndex,
    maxMonthIndex,
  ]);

  // Selection commits on the tap and leaves the sheet up, so a mistake can be
  // corrected in place and a nearby date reconsidered without reopening.
  // Dismissal is the footer's Done (and the handle, the scrim, Escape) — none
  // of which commit anything, because this already has.
  const handleSelect = useCallback(
    (next: ISODateString) => {
      fireChange(next);
    },
    [fireChange],
  );

  // Whether there is anywhere to step. An arrow with nowhere to go is hidden
  // rather than disabled: a disabled control still says "this is a thing you
  // could do", and at the end of a range it is not — the range is the whole
  // truth, and there is no state the user can reach where it becomes
  // available. A greyed chevron sitting there permanently reads as broken.
  const canStepBack = monthIndex > minMonthIndex;
  const canStepForward = monthIndex < maxMonthIndex;

  // One month either way, clamped to the reachable range. Goes through the
  // same scrollToMonth the swipe settles on, so the arrows and the gesture
  // cannot disagree about where a month rests.
  const stepMonth = useCallback(
    (delta: number) => {
      const target = clampIndex(
        monthIndex + delta,
        minMonthIndex,
        maxMonthIndex,
      );
      if (target === monthIndex) {
        return;
      }
      setMonthIndex(target);
      scrollerHandleRef.current?.scrollToMonth(target, 'smooth');
    },
    [monthIndex, minMonthIndex, maxMonthIndex],
  );

  // An arrow at the range end hides, and a hidden element loses focus. So
  // when a move to `target` hides the focused arrow, focus moves to the other
  // arrow, or to the month-and-year button when both hide. The move renders
  // first, because in a two-month range the other arrow is hidden until then.
  const moveMonth = useCallback(
    (target: number, move: () => void) => {
      const previousHides = target <= minMonthIndex;
      const nextHides = target >= maxMonthIndex;
      const previousArrow = previousArrowRef.current;
      const nextArrow = nextArrowRef.current;
      const focusOnPrevious = previousHides
        ? noteFocusWithin(previousArrow)
        : null;
      const focusOnNext = nextHides ? noteFocusWithin(nextArrow) : null;
      const focusOnArrow = focusOnPrevious ?? focusOnNext;
      if (focusOnArrow == null) {
        move();
        return;
      }
      // eslint-disable-next-line @eslint-react/dom-no-flush-sync -- the other arrow must be shown before it can take focus
      flushSync(move);
      const isOnPrevious = focusOnPrevious != null;
      const otherArrowHides = isOnPrevious ? nextHides : previousHides;
      const destination = otherArrowHides
        ? monthYearButtonRef.current
        : isOnPrevious
          ? nextArrowRef.current
          : previousArrowRef.current;
      moveFocusLeftBehind(
        focusOnArrow,
        destination,
        isOnPrevious ? previousArrow : nextArrow,
      );
    },
    [minMonthIndex, maxMonthIndex],
  );

  const stepMonthFromArrow = useCallback(
    (delta: -1 | 1) => {
      const target = clampIndex(
        monthIndex + delta,
        minMonthIndex,
        maxMonthIndex,
      );
      moveMonth(target, () => stepMonth(delta));
    },
    [monthIndex, minMonthIndex, maxMonthIndex, moveMonth, stepMonth],
  );

  // A wheel commit steers the scroller immediately, even though it is behind
  // the wheels: it keeps its layout box while hidden, so by the time the
  // wheels close it is already resting on the new month. Under a finger,
  // UIDatePicker moves a chosen date with these wheels
  // (datePicker.calendar.monthYearWheels.changesDate).
  const {isTouch} = useTouchPresentation();
  const handleWheelChange = useCallback(
    (next: number) => {
      setMonthIndex(next);
      scrollerHandleRef.current?.scrollToMonth(next, 'auto');
      if (!isTouch || selectedDate == null) {
        return;
      }
      const moved = dateInMonth(
        monthModel,
        selectedDate,
        next,
        min != null ? plainDateFromISO(min) : null,
        max != null ? plainDateFromISO(max) : null,
      );
      if (!plainDateIsEqual(moved, selectedDate) && !isDateDisabled(moved)) {
        fireChange(plainDateToISO(moved));
      }
    },
    [isTouch, selectedDate, monthModel, min, max, isDateDisabled, fireChange],
  );

  /**
   * The calendar reports the month it has scrolled to — but only while it is
   * the surface being scrolled.
   *
   * While the wheels are up the wheels are the source of truth, and the
   * calendar is being STEERED by them: a wheel commit calls `scrollToMonth`
   * above, the calendar scrolls, and it would report that month straight back
   * here. That closes a cycle — wheel commits, calendar echoes, the echo moves
   * the wheel's selected row, the wheel is repositioned onto it, and the
   * resulting scroll reads as another commit.
   *
   * Whether that cycle converges depends on how precisely a browser reports
   * "scrolling stopped", which is not something to rely on. With `scrollend`
   * (Chrome) it settles at once; on iOS below Safari 26 there is no
   * `scrollend` and momentum runs on for a second or more after the finger
   * lifts, so each lap committed the next month along and the value climbed
   * on its own. Ignoring the echo removes the cycle instead of damping it.
   */
  const handleVisibleMonthChange = useCallback(
    (next: number) => {
      if (isWheelOpen) {
        return;
      }
      // A swipe to the range end hides an arrow, as a press does.
      moveMonth(next, () => setMonthIndex(next));
    },
    [isWheelOpen, moveMonth],
  );

  /**
   * Put the calendar back where it belongs when the wheels close.
   *
   * The wheels steer it while it is hidden, and a hidden scroller is not a
   * reliable place to leave a scroll position: `visibility: hidden` keeps the
   * layout box, but iOS re-snaps the scroller when it becomes visible again,
   * and it does not necessarily re-snap to the pane we put it on. That fires
   * a scroll at the exact moment reports start being trusted again — which is
   * why the month drifted on the way back to the dates.
   *
   * Re-asserting is cheap when nothing moved (the scroller is already there,
   * so nothing scrolls) and exactly right when something did. `scrollToMonth`
   * marks the target as steered, so this correction does not report itself
   * back either.
   */
  // Read through a ref so this effect depends on the surface change alone.
  // Listing `monthIndex` would re-run it on every month the user swipes to,
  // yanking the scroller back mid-gesture.
  const monthIndexRef = useRef(monthIndex);
  monthIndexRef.current = monthIndex;
  useEffect(() => {
    if (isWheelOpen) {
      return;
    }
    scrollerHandleRef.current?.scrollToMonth(monthIndexRef.current, 'auto');
  }, [isWheelOpen]);

  // APG combobox keys. The field takes no text, so every printable key is
  // free — but only the documented openers are wired, so a stray keystroke
  // does not pop a sheet.
  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      // Same guard core's pointer surface carries. This field is readOnly and
      // takes no composition of its own, but an IME sitting over it still
      // sends its committing Enter here first — and opening a date sheet on
      // the keystroke that finishes a Korean syllable is the same wrong
      // answer. See utils/ime.ts.
      if (isImeKeyEvent(event.nativeEvent)) {
        return;
      }
      if (
        event.key === 'ArrowDown' ||
        event.key === 'Enter' ||
        event.key === ' ' ||
        event.key === 'Spacebar'
      ) {
        event.preventDefault();
        openSheet();
      }
    },
    [openSheet],
  );

  const surface = (
    <div className={touchDateSurfaceClassName}>
      <div className={touchDateHeaderClassName}>
        <button
          ref={monthYearButtonRef}
          type="button"
          onClick={() => setIsWheelOpen(open => !open)}
          aria-expanded={isWheelOpen}
          // One string, not a template: the comma and the word order are
          // the translator's to choose, not English's.
          aria-label={t('@astryx.dateInput.chooseMonthYear', {
            monthYear: monthYearLabel,
          })}
          // A `data-` hook rather than a theme target. `themeProps` would
          // publish `astryx-date-input-touch-title` as a themeable selector,
          // and this is internal structure of the sheet — the field and its
          // toggle icon are the documented targets, and nothing has asked to
          // restyle the header button. Adding a target later is additive;
          // withdrawing one is not.
          data-title="month-year"
          {...pressable}
          {...mergeProps(
            stylex.props(
              interactionOverlayStyles.backgroundColor,
              focusOutlineStyles.focusVisible,
            ),
            touchDateTitleClassName,
          )}>
          <span className={touchDateTitleTextClassName}>{monthYearLabel}</span>
          <Icon
            icon="chevronDown"
            size="sm"
            color="secondary"
            // The transform rides on the Icon itself, not a wrapper span, so
            // the element a theme can target is the element that moves.
            className={touchDateTitleChevronClassName({isOpen: isWheelOpen})}
          />
        </button>
        {/* Both arrows at the trailing corner, as a pair — and only while the
            calendar is the surface they step. `IconButton` gives them
            Button's optical centring, focus ring, disabled treatment and hit
            area; the hand-rolled version had the glyph off-centre.

            Mirrored under RTL by the shared helper: "previous" is the earlier
            month, which sits on the right when the inline axis runs that way,
            and the panes mirror with it. */}
        <span
          data-arrows="months"
          // `inert` as well as the hidden styling: the fade keeps them
          // `visible` until it finishes, and a control that is on its way out
          // should not answer a click or a Tab in the meantime.
          inert={isWheelOpen ? true : undefined}
          className={touchDateMonthArrowsClassName({isHidden: isWheelOpen})}>
          <IconButton
            variant="ghost"
            size="sm"
            className={touchDateMonthArrowClassName({
              isUnavailable: !canStepBack,
            })}
            ref={previousArrowRef}
            isDisabled={!canStepBack}
            onClick={() => stepMonthFromArrow(-1)}
            label={t('@astryx.calendar.previousMonth')}
            icon={
              <span
                className={tw(
                  RTL_MIRROR_CLASS,
                  touchDateMonthArrowIconClassName,
                )}>
                <Icon icon="chevronLeft" size="sm" color="inherit" />
              </span>
            }
          />
          <IconButton
            variant="ghost"
            size="sm"
            className={touchDateMonthArrowClassName({
              isUnavailable: !canStepForward,
            })}
            ref={nextArrowRef}
            isDisabled={!canStepForward}
            onClick={() => stepMonthFromArrow(1)}
            label={t('@astryx.calendar.nextMonth')}
            icon={
              <span
                className={tw(
                  RTL_MIRROR_CLASS,
                  touchDateMonthArrowIconClassName,
                )}>
                <Icon icon="chevronRight" size="sm" color="inherit" />
              </span>
            }
          />
        </span>
        {/* Reset, past the arrows, and gone with them on the wheels: the
            wheels choose a month, and there is no date there to put back.
            Hidden rather than unmounted, for the arrows' reason — the corner
            keeps its size, so the header cannot change height mid-swap. */}
        <span
          data-action="reset"
          inert={isWheelOpen ? true : undefined}
          className={touchDateHeaderResetClassName({isHidden: isWheelOpen})}>
          <Button
            // ghost: a filled button up here would outrank the Save that
            // finishes the task.
            variant="ghost"
            size="sm"
            className={touchDateResetButtonClassName}
            label={t('@astryx.dateInput.resetPicking')}
            onClick={handleResetInSheet}
          />
        </span>
      </div>

      {/* Decorative: each day carries its weekday in its accessible name, so
          this row is not a header row for assistive technology — and it must
          live outside the scroller, or it would scroll away with the month. */}
      <div
        aria-hidden="true"
        className={touchDateWeekdaysClassName({isHidden: isWheelOpen})}>
        {weekdayHeaders.map(({dayOfWeek, name}) => (
          <div key={dayOfWeek} className={touchDateWeekdayClassName}>
            {name}
          </div>
        ))}
      </div>

      <div className={touchDateBodyClassName}>
        <div
          data-panel="calendar"
          // `inert` as well as the hidden styling: the panel keeps its layout
          // box (so the scroller holds its position and the wheels can steer
          // it), which means without this it would still be tabbable behind
          // the layer on top.
          inert={isWheelOpen ? true : undefined}
          className={tw(
            touchDatePanelClassName,
            touchDatePanelBeneathClassName({isHidden: isWheelOpen}),
          )}>
          <MonthScroller
            key={`${minMonthIndex}:${maxMonthIndex}`}
            handleRef={scrollerHandleRef}
            monthModel={monthModel}
            minMonthIndex={minMonthIndex}
            maxMonthIndex={maxMonthIndex}
            initialMonthIndex={monthIndex}
            onVisibleMonthChange={handleVisibleMonthChange}
            selectedDate={selectedDate}
            today={today}
            isDateDisabled={isDateDisabled}
            weekStartsOn={weekStartsOn}
            onSelect={handleSelect}
          />
        </div>
        <div
          data-panel="wheels"
          inert={isWheelOpen ? undefined : true}
          className={tw(
            touchDatePanelClassName,
            touchDatePanelOverlayClassName({isHidden: !isWheelOpen}),
          )}>
          <MonthYearWheels
            monthModel={monthModel}
            monthIndex={monthIndex}
            keptDay={keptDay}
            minMonthIndex={minMonthIndex}
            maxMonthIndex={maxMonthIndex}
            onChange={handleWheelChange}
            monthLabel={t('@astryx.dateInput.monthWheel')}
            yearLabel={t('@astryx.dateInput.yearWheel')}
            isActive={isWheelOpen}
          />
        </div>
      </div>

      {/* Done does NOT commit: a tap on a day has already fired onChange by
          the time it is reachable. It is a close button, exactly equivalent
          to the grab handle, the scrim and Escape — which is why it is safe
          for those to remain, and why there is no Cancel to pair it with.

          It sits alone. A "Today" button was here and only moved the calendar
          to the current month WITHOUT selecting it, which read as broken: the
          one thing a button called Today should obviously do is the thing it
          did not. Navigating and selecting are two different intents and it
          conflated them, so it is gone until it can be one or the other on
          purpose. Reaching today by scrolling still works. */}
      {/* No `inert` here: the two cells below take turns, so the footer as a
          whole is always live. It carried one while the footer was hidden
          entirely on the wheels, and leaving it behind made the wheels' own
          Done button unreachable — an inert ancestor disables everything
          inside it. */}
      <div className={touchDateFooterClassName}>
        {/* Both actions share one grid cell, the same way the panels above
            them do, and follow the same base/overlay rule — so the footer
            never changes height and the two never read as superimposed. Each
            belongs to a surface: Save finishes on the calendar, Done finishes
            the detour through the wheels. */}
        <div
          inert={isWheelOpen ? true : undefined}
          className={tw(
            touchDateFooterActionClassName,
            touchDatePanelBeneathClassName({isHidden: isWheelOpen}),
          )}>
          <Button
            variant="primary"
            // md, not sm: it is the action a thumb reaches for, so it gets
            // the comfortable size rather than the compact one the header's
            // ghost buttons use.
            size="md"
            width="100%"
            label={t('@astryx.dateInput.savePicking')}
            onClick={() => setIsSheetOpen(false)}
          />
        </div>
        <div
          inert={isWheelOpen ? undefined : true}
          className={tw(
            touchDateFooterActionClassName,
            touchDatePanelOverlayClassName({isHidden: !isWheelOpen}),
          )}>
          <Button
            // secondary, not primary: this one does not finish the task, it
            // finishes a step. Giving both surfaces a primary button would
            // say the wheels are somewhere you can complete from.
            variant="secondary"
            size="md"
            width="100%"
            label={t('@astryx.dateInput.doneChoosingMonth')}
            onClick={() => setIsWheelOpen(false)}
          />
        </div>
      </div>
    </div>
  );

  const inputWrapper = (
    <div
      ref={el => {
        // Anchor + hover/focus listeners for the disabled-message tooltip.
        // Gated internally by isEnabled, so attaching unconditionally is safe.
        disabledMessageTooltip.ref(el);
      }}
      {...(inputGroup ? inputGroupItemProps : undefined)}
      {...mergeProps(
        themeProps('date-input', {
          size,
          status: status?.type ?? null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        stylex.props(
          // Disabled paint belongs to the disabled state only; a busy field
          // keeps its ordinary paint and shows the Spinner (spec:AST-085
          // FR6, family:buttons FR4).
          isEffectivelyDisabled && inputDisabledFocusStyles.inputFocusRing,
          status && !isEffectivelyDisabled && controlXstyle,
        ),
        tw(
          inputGroup && inputGroupMemberClassName,
          fieldInputWrapperClassName({status: status?.type}),
          isDisabled && fieldInputWrapperDisabledClassName,
          dateInputSizeClassName({size}),
          touchDateFieldWrapperClassName,
          controlClassName,
        ),
        controlStyle,
      )}>
      {inputGroup && <VisuallyHidden id={inputLabelID}>{label}</VisuallyHidden>}
      <button
        type="button"
        onClick={openSheet}
        aria-disabled={isEffectivelyDisabled || undefined}
        aria-label={t('@astryx.dateInput.openCalendar')}
        tabIndex={-1}
        {...mergeProps(
          stylex.props(focusOutlineStyles.focusVisible),
          touchDateFieldIconButtonClassName({
            isDisabled: isEffectivelyDisabled,
          }),
        )}>
        <Icon
          icon="calendar"
          size="sm"
          color="secondary"
          {...themeProps('date-input-toggle-icon', {
            state: isSheetOpen ? 'expanded' : 'collapsed',
          })}
        />
      </button>
      <input
        {...controlProps}
        ref={mergedInputRef}
        id={id}
        type="text"
        role="combobox"
        value={displayValue}
        // No typing on this surface: the picker is the input method, and the
        // virtual keyboard would cover the sheet it is meant to fill in.
        // readOnly blocks entry; inputMode="none" is what actually keeps the
        // keyboard down when the field takes focus.
        readOnly
        inputMode="none"
        onChange={() => {}}
        onClick={
          isEffectivelyDisabled
            ? undefined
            : chainEventHandlers(openSheet, onClickProp)
        }
        onKeyDown={chainEventHandlers(handleInputKeyDown, onKeyDownProp)}
        placeholder={placeholder}
        aria-disabled={isEffectivelyDisabled ? 'true' : undefined}
        aria-labelledby={
          ariaLabelledByProp != null
            ? joinAriaIDs(ariaLabelledBy ?? fieldLabelID, ariaLabelledByProp)
            : ariaLabelledBy
        }
        aria-describedby={ariaDescribedBy}
        aria-required={isEffectivelyRequired ? 'true' : undefined}
        aria-invalid={status?.type === 'error' ? 'true' : undefined}
        aria-busy={isBusy || undefined}
        aria-expanded={isSheetOpen}
        aria-haspopup="dialog"
        aria-autocomplete="none"
        autoComplete="off"
        className={touchDateFieldInputClassName({
          isDisabled: isEffectivelyDisabled,
        })}
      />
      {hasClear && value !== undefined && !isEffectivelyDisabled && (
        <InputClearButton
          label={t('@astryx.dateInput.clear', {label})}
          onClick={handleClear}
        />
      )}
      {isBusy && <Spinner size="sm" aria-hidden="true" />}
      {statusIcon}
      <BottomSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        label={t('@astryx.dateInput.dialogLabel')}
        // The picker is a fixed height by construction, so the sheet should be
        // exactly as tall as it is rather than claiming a viewport budget.
        height="hug"
        // sheetBody owns the inset; the sheet keeps the band under its grab
        // bar.
        padding={0}>
        <div ref={sheetBodyRef} className={touchDateSheetBodyClassName}>
          {today != null && surface}
        </div>
      </BottomSheet>
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </div>
  );

  if (inputGroup) {
    return inputWrapper;
  }

  return (
    <Field
      {...container}
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      labelID={ariaLabelledByProp != null ? fieldLabelID : undefined}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      statusVariant={statusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {inputWrapper}
    </Field>
  );
}

TouchDateField.displayName = 'TouchDateField';
