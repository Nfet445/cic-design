// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NativeDateField.tsx
 * @input Uses React, Field, Icon, InputClearButton, Spinner, useCalendarConstraints, hasEditableDateSegments, useNativeDateRejection
 * @output Exports NativeDateField — the OS-picker touch surface
 * @position One of DateInput's three surfaces. `DateInput` picks the pointer
 *   field on a mouse and, on touch, either `TouchDateField` (the default) or
 *   this one when the consumer opts in with `nativePicker`.
 *
 * Hands date picking to the platform: a real `<input type="date">`, whose
 * picker the OS draws — the iOS wheel, the Android calendar dialog. The field
 * itself still looks like every other Astryx input, and DateInput paints its
 * text so `format` and `placeholder` keep applying.
 *
 * Everything unusual in here was measured on a real iOS device; the comments
 * say which behaviour forced which decision, because none of them are
 * reproducible in a desktop browser.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DateInput/DateInput.tsx (the `nativePicker` prop)
 * - /packages/core/src/DateInput/DateInput.doc.mjs (prop table)
 * - /packages/core/src/DateInput/nativeDateSegments.ts (the engine probe)
 * - /packages/core/src/DateInput/NativeDateField.test.tsx (tests)
 */

import {
  useCallback,
  useEffect,
  useId,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useCalendarConstraints} from '../Calendar';
import type {DateInputProps} from './DateInput';
import {
  dateInputSizeClassName,
  nativeDateFieldIconButtonClassName,
  nativeDateFieldInputClassName,
  nativeDateFieldOverlayClassName,
  nativeDateFieldOverlayPlaceholderClassName,
  nativeDateFieldOverlayValueClassName,
  nativeDateFieldSlotClassName,
  nativeDateFieldWrapperClassName,
} from './dateInputClasses';
import {hasEditableDateSegments} from './nativeDateSegments';
import {useNativeDateRejection} from './useTypedDate';
import {
  Field,
  InputClearButton,
  fieldInputWrapperClassName,
  fieldInputWrapperDisabledClassName,
} from '../Field';
import {useInputStatusIcon, useMergedRefs} from '../hooks';
import {useMediaQuery} from '../hooks/useMediaQuery';
import {useBusyAnnouncement} from '../hooks/useBusyAnnouncement';
import {useResolvedRequired} from '../hooks/useResolvedRequired';
import {Icon} from '../Icon';
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
  formatSharedDate,
  getInputARIA,
  mergeProps,
  parseDateInput,
  plainDateFromISO,
  plainDateToISO,
  themeProps,
  type ISODateString,
} from '../utils';
import {chainEventHandlers} from '../utils/chainEventHandlers';
import {tw} from '../utils/tw';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/DateInput/NativeDateField.generated';

registerEnglishFallback(english);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * The OS-picker surface. Takes `DateInput`'s props verbatim; see
 * {@link DateInput} for when it is chosen over the other two.
 */
export function NativeDateField({
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
  // The control takes no typed text, so it never reports a rejection. With
  // the callback, the caller's error status words a refused date.
  onEntryErrorChange,
  statusVariant = 'attached',
  labelTooltip,
  hasClear = false,
  // The OS draws the picker, so neither reaches it: both describe a calendar
  // grid it does not have. Accepted (the prop types are shared) and ignored.
  numberOfMonths: _numberOfMonths,
  weekStartsOn: _weekStartsOn,
  format = 'date_long',
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
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    onKeyDown: onKeyDownProp,
    ...controlProps
  } = rest;
  const t = useComponentTranslator();
  const locale = useLocale();
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});
  const placeholder =
    placeholderFromProps ?? t('@astryx.dateInput.placeholder');
  const size = useSize(sizeProp, 'md');
  // Only breaks a tie the engine probe cannot: see ./nativeDateSegments.
  const isTouchPointer = useMediaQuery('(pointer: coarse)');

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
  // The busy Spinner is decorative; this control announces its busy start
  // (spec:AST-086 FR8).
  useBusyAnnouncement(isBusy, t('@astryx.spinner.loading'), inputRef);
  // Keep the OS picker mounted and focusable while its own Action is pending.
  // Native TimeInput follows the same pattern: commit guards block duplicates,
  // while aria-busy and the Spinner communicate the save without detaching the
  // platform picker from its input.
  const isEffectivelyDisabled = isDisabled || isLoading;

  // Same contract as the other two surfaces: a disabled field never renders
  // native `disabled` (spec:AST-085 FR1); the input stays focusable via
  // aria-disabled and readOnly. The disabled-reason tooltip's listeners
  // attach to the wrapper.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  const {isDateDisabled} = useCalendarConstraints({min, max, dateConstraints});

  const rejection = useNativeDateRejection({
    source: 'DateInput',
    format,
    min,
    max,
    isDateDisabled,
    value,
    isLocked: isEffectivelyDisabled || isBusy,
    status,
    hasEntryErrorCallback: onEntryErrorChange != null,
    isStatusAnnounced: !inputGroup,
  });
  const {fieldStatus} = rejection;
  const isInputValid = rejection.message == null;

  const {statusIcon, describedBy: statusTooltipDescribedBy} =
    useInputStatusIcon({
      status: fieldStatus,
      statusVariant,
      isInGroup: !!inputGroup,
    });

  const {ariaLabelledBy, ariaDescribedBy} = getInputARIA(
    inputLabelID,
    [
      description ? descriptionID : null,
      statusVariant !== 'tooltip' && fieldStatus?.message
        ? statusMessageID
        : null,
      statusTooltipDescribedBy,
      showsDisabledMessage ? disabledMessageTooltip.describedBy : null,
      ariaDescribedByProp,
    ],
    inputGroup,
  );

  // Whether the control has focus — which, on a touch device, means its
  // picker is open.
  const [isFocused, setIsFocused] = useState(false);
  // Whether the engine draws this control as editable segments rather than a
  // picker-only run. Latched on focus rather than read during render: the
  // probe touches the DOM, and unfocused the answer changes nothing.
  const [isSegmentEditable, setIsSegmentEditable] = useState(false);
  // The raw value the control last reported and we acted on, so the same edit
  // arriving through both commit paths only fires one change. Each entry
  // belongs to the commit epoch it was made in.
  const lastCommitRef = useRef<{text: string; epoch: number} | null>(null);

  // The value as last rendered, and an epoch that a value change moves on,
  // retiring the last commit. Both are state: refs written here would keep a
  // value from a render React discards.
  const [prevValue, setPrevValue] = useState(value);
  const [commitEpoch, setCommitEpoch] = useState(0);
  if (value !== prevValue) {
    setPrevValue(value);
    setCommitEpoch(epoch => epoch + 1);
  }

  // The control's own value is always ISO — the only form it accepts, and
  // what the picker reads and writes. `format` rides on the overlay instead.
  const nativeValue =
    optimisticValue && ISO_DATE.test(optimisticValue) ? optimisticValue : '';

  const formatValue = useCallback(
    (iso: ISODateString): string =>
      typeof format === 'function'
        ? format(iso)
        : formatSharedDate(plainDateFromISO(iso), format, locale),
    [format, locale],
  );

  // This field paints the closed control's text itself, which is what keeps
  // `format` and `placeholder` applying: a picker-only control has no
  // segments to edit, so our text holds even while the picker is open, and
  // tracks it live. An editable control is the opposite case — its text IS
  // the edit surface, and it reports no `value` until every segment is
  // filled, so the overlay has nothing to paint mid-edit — so step aside for
  // as long as it has focus. See ./nativeDateSegments.
  const overlayText = nativeValue ? formatValue(nativeValue) : placeholder;
  const showsOverlay = !!overlayText && !(isFocused && isSegmentEditable);

  const fireChange = useCallback(
    (newValue: ISODateString | undefined) => {
      if (isBusy) {
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
    [isBusy, onChange, changeAction, startTransition, setOptimisticValue],
  );

  const commitValue = useCallback(
    (newValue: string) => {
      if (isEffectivelyDisabled || isBusy) {
        return;
      }
      // The same edit can arrive twice — React's synthetic change and the
      // native listener below both report it — so act on a raw value once.
      const last = lastCommitRef.current;
      if (
        last !== null &&
        last.epoch === commitEpoch &&
        last.text === newValue
      ) {
        return;
      }
      lastCommitRef.current = {text: newValue, epoch: commitEpoch};

      if (!newValue) {
        rejection.clear();
        if (value !== undefined) {
          fireChange(undefined);
        }
        return;
      }

      const parsed = parseDateInput(newValue, locale);
      if (!parsed) {
        return;
      }
      if (isDateDisabled(parsed)) {
        // iOS does not enforce min/max in its picker — those attributes are
        // constraint-validation flags, not clamps, and the sheet lets the
        // user land on any date. Refuse it here; the sync effect snaps the
        // control back at blur.
        rejection.refuse(parsed);
        return;
      }

      rejection.clear();
      const parsedISO = plainDateToISO(parsed);
      if (parsedISO !== value) {
        fireChange(parsedISO);
      }
    },
    [
      value,
      commitEpoch,
      fireChange,
      isDateDisabled,
      isEffectivelyDisabled,
      isBusy,
      locale,
      rejection,
    ],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      commitValue(e.target.value);
    },
    [commitValue],
  );

  // React's synthetic change system does not reliably observe the iOS
  // picker's edits. Measured on an iPhone: picking a date fired a native
  // `input` event carrying the new date while React's `onChange` never ran —
  // so React re-rendered and wrote its own stale value straight back over the
  // picker's, and the user's pick (and their Reset) silently reverted. A
  // native listener reads what the control actually holds, whatever React's
  // synthetic layer made of it.
  const commitRef = useRef(commitValue);
  useEffect(() => {
    commitRef.current = commitValue;
  });
  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return;
    }
    const handleNative = () => commitRef.current(input.value);
    input.addEventListener('input', handleNative);
    input.addEventListener('change', handleNative);
    return () => {
      input.removeEventListener('input', handleNative);
      input.removeEventListener('change', handleNative);
    };
  }, []);

  // The value the control mounts with. Deliberately captured once: React
  // writes to the element whenever a `value` OR `defaultValue` prop changes,
  // and on iOS ANY write while the picker sheet is open detaches the sheet
  // from the field — the wheel and Reset keep moving the sheet's own
  // highlight, but nothing they do reaches the input and no event fires, so
  // the user's pick appears to do nothing. Holding this constant means React
  // touches the element exactly once, at mount; the effect below owns every
  // later update and only writes while the field is unfocused.
  const initialValueRef = useRef<string | null>(null);
  if (initialValueRef.current === null) {
    initialValueRef.current = nativeValue;
  }

  // Push an externally-changed value in — but never while the control has
  // focus, for the reason above. Blur flips `isFocused`, so this doubles as
  // the reconcile once the picker closes. (Self-heals a stale
  // `initialValueRef` too, on the commit right after a remount.)
  useEffect(() => {
    if (isFocused) {
      return;
    }
    const input = inputRef.current;
    if (input && input.value !== nativeValue) {
      input.value = nativeValue;
    }
  }, [isFocused, nativeValue]);

  const handleFocus = useCallback(() => {
    setIsSegmentEditable(hasEditableDateSegments(isTouchPointer));
    setIsFocused(true);
  }, [isTouchPointer]);

  const handleBlur = useCallback(() => {
    const domValue = inputRef.current?.value;
    setIsFocused(false);
    if (domValue !== undefined && domValue !== nativeValue) {
      commitValue(domValue);
    }
    // The sync effect restores the committed date once focus leaves. The
    // rejection stays shown, so the restore is never silent.
    rejection.commit();
  }, [commitValue, nativeValue, rejection]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        rejection.commit();
      }
    },
    [rejection],
  );

  // Focusing a date control is what raises the OS picker, so the usual
  // focus-restore after a clear would pop the picker the tap just dismissed —
  // and on iOS that reads as the clear having done nothing.
  const handleClear = useCallback(() => {
    fireChange(undefined);
  }, [fireChange]);

  const openPicker = useCallback(() => {
    if (isEffectivelyDisabled) {
      return;
    }
    const input = inputRef.current;
    if (!input) {
      return;
    }
    // Focus first: on touch browsers focusing the control is itself what
    // raises the picker, and iOS implements no `showPicker()` for type=date
    // (WebKit bug 261703), so focus is the whole mechanism there.
    input.focus();
    if (typeof input.showPicker === 'function') {
      try {
        input.showPicker();
      } catch {
        // showPicker throws without transient user activation and inside a
        // cross-origin iframe. The focus above is the fallback.
      }
    }
  }, [isEffectivelyDisabled]);

  const inputWrapper = (
    <div
      ref={el => {
        disabledMessageTooltip.ref(el);
      }}
      {...(inputGroup ? inputGroupItemProps : undefined)}
      {...mergeProps(
        themeProps('date-input', {
          size,
          status: fieldStatus?.type ?? null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        stylex.props(
          // Disabled paint belongs to the disabled state only; a busy field
          // keeps its ordinary paint and shows the Spinner (spec:AST-085
          // FR6, family:buttons FR4).
          fieldStatus && !isEffectivelyDisabled && controlXstyle,
        ),
        tw(
          inputGroup && inputGroupMemberClassName,
          fieldInputWrapperClassName({status: fieldStatus?.type}),
          isDisabled && fieldInputWrapperDisabledClassName,
          dateInputSizeClassName({size}),
          nativeDateFieldWrapperClassName,
          controlClassName,
        ),
        controlStyle,
      )}>
      {inputGroup && <VisuallyHidden id={inputLabelID}>{label}</VisuallyHidden>}
      <button
        type="button"
        onClick={openPicker}
        aria-disabled={isEffectivelyDisabled || undefined}
        aria-label={t('@astryx.dateInput.openCalendar')}
        tabIndex={-1}
        {...mergeProps(
          stylex.props(focusOutlineStyles.focusVisible),
          nativeDateFieldIconButtonClassName,
        )}>
        <Icon
          icon="calendar"
          size="sm"
          color="secondary"
          {...themeProps('date-input-toggle-icon', {state: 'collapsed'})}
        />
      </button>
      <span className={nativeDateFieldSlotClassName}>
        <input
          {...controlProps}
          onClick={isEffectivelyDisabled ? undefined : controlProps.onClick}
          ref={mergedInputRef}
          id={id}
          type="date"
          // UNCONTROLLED on purpose, with a value React never rewrites after
          // mount — see `initialValueRef` and the sync effect above.
          defaultValue={initialValueRef.current ?? ''}
          onChange={handleChange}
          onFocus={chainEventHandlers(handleFocus, onFocusProp)}
          onBlur={chainEventHandlers(handleBlur, onBlurProp)}
          onKeyDown={chainEventHandlers(handleKeyDown, onKeyDownProp)}
          min={min}
          max={max}
          aria-disabled={isEffectivelyDisabled ? 'true' : undefined}
          readOnly={isEffectivelyDisabled || undefined}
          aria-labelledby={
            ariaLabelledByProp != null
              ? joinAriaIDs(ariaLabelledBy ?? fieldLabelID, ariaLabelledByProp)
              : ariaLabelledBy
          }
          aria-describedby={ariaDescribedBy}
          aria-required={isEffectivelyRequired ? 'true' : undefined}
          aria-invalid={
            fieldStatus?.type === 'error' || !isInputValid ? 'true' : undefined
          }
          aria-busy={isBusy || undefined}
          className={nativeDateFieldInputClassName({
            isDisabled: isEffectivelyDisabled,
            isHidden: showsOverlay,
            isInvalid: !isInputValid,
          })}
        />
        {showsOverlay && (
          <span
            aria-hidden="true"
            className={tw(
              nativeDateFieldOverlayClassName,
              nativeValue && isInputValid
                ? nativeDateFieldOverlayValueClassName
                : nativeDateFieldOverlayPlaceholderClassName,
            )}>
            {overlayText}
          </span>
        )}
      </span>
      {/*
          Announces the rejection message that the field status does not
          announce. The field status announces the rest.
        */}
      <VisuallyHidden as="div" role="alert" aria-live="assertive">
        {rejection.alertMessage}
      </VisuallyHidden>
      {hasClear && value !== undefined && !isEffectivelyDisabled && !isBusy && (
        <InputClearButton
          label={t('@astryx.dateInput.clear', {label})}
          onClick={handleClear}
        />
      )}
      {isBusy && <Spinner size="sm" aria-hidden="true" />}
      {statusIcon}
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
        fieldStatus
          ? {
              type: fieldStatus.type,
              message: fieldStatus.message,
              messageID: fieldStatus.message ? statusMessageID : undefined,
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

NativeDateField.displayName = 'NativeDateField';
