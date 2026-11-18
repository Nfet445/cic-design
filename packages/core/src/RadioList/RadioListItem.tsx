// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RadioListItem.tsx
 * @input Uses React use, useId, useRef, RadioListContext, Item
 * @output Exports RadioListItem component, RadioListItemProps
 * @position Core implementation; consumed by index.ts, tested by RadioList.test.tsx
 *
 * Composes Item for the shared start content + label + description + end content layout.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/RadioList.doc.mjs
 * - /packages/core/src/RadioList/RadioList.test.tsx
 * - /packages/core/src/RadioList/index.ts
 * - /apps/storybook/stories/RadioList.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/RadioList/ (showcase blocks)
 */

import React, {use, useId, useRef, type ReactNode} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {RadioListContext} from './RadioList';
import {RadioListReasonContext} from './RadioListReasonContext';
import {joinAriaIDs} from '../utils/inputAria';
import {isRenderable} from '../utils/isRenderable';
import {mergeProps} from '../utils/mergeProps';
import {tw} from '../utils/tw';
import {
  rtlCenterInlineBlockOffsetClassName,
  rtlCenterInlineClassName,
} from '../utils/rtlClasses';
import {indicatorScopeProps} from '../privateAttributes/indicatorScope.stylex';
import {useIndicatorFocusRing} from '../hooks/useIndicatorFocusRing';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useTouchHitArea} from '../utils/touchHitArea';
import {pressBoxProps} from '../privateAttributes/pressBox.stylex';
import {registerBoxHold} from '../utils/boxHold';
import {touchHitAreaStyles} from '../internal/touchHitArea.stylex';
import {useIndicator} from '../Indicator/useIndicator';
import {Item, type ItemAlign} from '../Item/Item';
import {themeProps} from '../utils/themeProps';
import {
  rowPressLayerStyles,
  rowPressPaintRadioRowClassName,
} from '../privateAttributes/press.stylex';
import {indicatorPressImageClassName} from '../Indicator/indicatorClasses';
import {
  radioListItemIndicatorSlotClassName,
  radioListItemInputClassName,
  radioListItemPressOverlayClassName,
  radioListItemRowClassName,
  radioListItemWrapperClassName,
} from './radioListItemClasses';

// Registered here, not in the press controller, so a page with no box carries
// none of its code.
registerBoxHold();
// The paint of a press the controller does not paint is declared on the row
// (`rowPressPaintRadioRowClassName`) and inherited by the layer over the circle
// (`radioListItemPressOverlayClassName`). Internal: not a theme hook.

export interface RadioListItemProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Vertical alignment of the start and end content against the label,
   * forwarded to Item. Use `first-line` to keep the radio level with the
   * first line of a wrapped label.
   * @default 'center'
   */
  align?: ItemAlign;
  /**
   * Primary label for the radio item.
   *
   * Accepts a plain string or a ReactNode for rich content. Links and buttons
   * in the label keep their own behavior; only non-interactive row clicks
   * delegate to the radio. The radio points at the rendered label for its
   * accessible name, so a rich label still names it from its own text. Pass
   * `aria-label` when that text is absent. When visible text is present, the
   * override must retain every visible word so speech-input users can say what
   * they see.
   */
  label: ReactNode;
  /**
   * Plain-text accessible name for the radio, applied to the control rather
   * than the row. It replaces the name the label would otherwise supply. Use
   * it when a rich label has no visible text; otherwise the value must retain
   * every visible word.
   *
   * @example
   * ```
   * <RadioListItem
   *   label={<span>Pro plan <Badge label="Recommended" /></span>}
   *   aria-label="Pro plan Recommended option"
   *   value="pro"
   * />
   * ```
   */
  'aria-label'?: string;
  /**
   * Value of this radio item.
   */
  value: string;
  /**
   * Secondary content displayed below the label. Accepts a plain string or a
   * ReactNode. Links and buttons anywhere in the row keep their own click
   * behaviour — the row only delegates clicks from its non-interactive
   * surface to the radio.
   */
  description?: ReactNode;
  /**
   * Whether this individual radio item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Content to render before the radio circle.
   */
  startContent?: ReactNode;
  /**
   * Content to render after the label.
   */
  endContent?: ReactNode;
}

/**
 * An individual radio item within an RadioList.
 *
 * @example
 * ```
 * <RadioListItem label="Email" value="email" />
 * <RadioListItem
 *   label="SMS"
 *   value="sms"
 *   description="Standard messaging rates apply"
 * />
 * ```
 */
export function RadioListItem({
  ref,
  label,
  'aria-label': ariaLabel,
  value,
  description,
  isDisabled: isItemDisabled = false,
  startContent,
  endContent,
  align,
  xstyle,
  className,
  style,
  onClick,
  ...rest
}: RadioListItemProps) {
  // Item marks itself as a pressable surface (the row delegates to the radio,
  // so it is interactive); naming the row here as well keeps the overlay's
  // pressed arm, which reads the row's scope marker, verifiably reachable by
  // the touch press controller (pressableCoverage.test.ts).
  const pressable = usePressFeedback();
  const context = use(RadioListContext);
  const disabledReasonID = use(RadioListReasonContext);
  if (!context) {
    throw new Error('RadioListItem must be used within an RadioList');
  }

  const id = useId();
  const labelID = useId();
  const descriptionID = useId();
  const isDisabled = context.isDisabled || isItemDisabled;
  // When the whole group is disabled with a disabledMessage, radios stay
  // focusable via aria-disabled (instead of native `disabled`) so the group's
  // reason tooltip is keyboard-discoverable. Per-item disabling is unaffected
  // and always uses the native disabled attribute.
  const keepsFocusableForMessage =
    context.hasDisabledMessage && !isItemDisabled;
  const isChecked = context.value === value;
  // One predicate for both the rendered element and the aria-describedby that
  // points at it. A ReactNode description can be `false` or `''`, which render
  // nothing — a `!= null` check would leave the link dangling.
  const hasDescription = isRenderable(description);
  const size = context.size;
  // The radio visual is an indicator: a theme can restyle it through the
  // `radio-indicator` / `radio-indicator-dot` targets or replace the component
  // outright.
  const RadioControl = useIndicator('radio');
  // See CheckboxInput: the ring goes on the indicator's own element, because
  // the native input is visually hidden and only the indicator knows its shape.
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const {focusProps} = useIndicatorFocusRing(indicatorRef, isDisabled);

  // The radio is the row's single keyboard control and action. The row is an
  // enlarged click/tap target that delegates surface clicks — the description
  // and the empty hover area, not just the control and its label — to the
  // input via Item's `interactiveRef` (useClickableContainer). This matches
  // CheckboxListItem so the whole row is clickable, and keeps one tab stop per
  // option (WCAG 4.1.2). The radio carries its accessible name via `aria-label`
  // since the visible label is now a plain (non-`<label>`) text node — a real
  // `<label htmlFor>` would double-fire under delegation.
  const radioRef = useRef<HTMLInputElement>(null);

  // Under a coarse pointer an option's row grows toward 44 px through an
  // invisible band, and the row keeps its size. A tap on the band lands on
  // the row, which hands it to the radio. The band's insets stay live while
  // the row takes taps, and clear when it stops.
  const watchRowHitArea = useTouchHitArea(!isDisabled);
  const mergedRowRef = useMergedRefs(ref, watchRowHitArea);

  const radioCircle = (
    <div
      // iOS answers a long hold on the circle with a text selection and no
      // click. The press controller holds the row's selection for a press on
      // the marked circle, and picks the option if no click comes.
      {...(isDisabled ? undefined : pressBoxProps)}
      {...mergeProps(
        tw(
          radioListItemWrapperClassName({size}),
          !isDisabled && radioListItemPressOverlayClassName,
          // The circle reads the controller's press off the row, as the
          // checkbox's layer does.
          !isDisabled && indicatorPressImageClassName,
        ),
      )}
      {...focusProps}>
      <input
        ref={radioRef}
        id={id}
        type="radio"
        name={context.name}
        value={value}
        checked={isChecked}
        disabled={isDisabled && !keepsFocusableForMessage}
        aria-disabled={keepsFocusableForMessage ? 'true' : undefined}
        // A focusable-disabled radio is not natively disabled, so detach it
        // from the form instead: it keeps its name (grouping) but is excluded
        // from submission, matching a natively disabled control.
        form={keepsFocusableForMessage ? '' : undefined}
        required={context.isRequired}
        // Chromium reports an unanswered native-required radio invalid before
        // any interaction; the invalid state follows the group's status
        // instead (RadioList FR6).
        aria-invalid={
          context.isRequired ? context.status?.type === 'error' : undefined
        }
        onChange={() => {
          if (isDisabled) {
            return;
          }
          context.onChange(value);
        }}
        // A consumer onClick rides on the radio input itself, so it fires for
        // both direct control clicks and row-surface clicks the row delegates
        // to the input — the same routing CheckboxListItem uses. A disabled
        // radio that stays focusable (`aria-disabled`, not native `disabled`)
        // is not silenced by the browser, so drop the handler here
        // (`spec:AST-085` FR2), as CheckboxInput does.
        onClick={isDisabled ? undefined : onClick}
        // The radio names itself from the visible label element, which works
        // for a rich label as well as a plain string. `aria-label` replaces
        // that name rather than adding to it, so the two are mutually
        // exclusive — aria-labelledby would otherwise win over it.
        aria-label={ariaLabel}
        aria-labelledby={ariaLabel == null ? labelID : undefined}
        // The item's own description, then the group's disabled reason
        // (RadioList's disabledMessage), which describes each radio (FR5).
        aria-describedby={joinAriaIDs(
          hasDescription ? descriptionID : undefined,
          disabledReasonID,
        )}
        {...mergeProps(radioListItemInputClassName({size}), {
          className: tw(
            rtlCenterInlineClassName,
            rtlCenterInlineBlockOffsetClassName.half,
          ),
        })}
      />
      <span ref={indicatorRef} className={radioListItemIndicatorSlotClassName}>
        <RadioControl
          state={isChecked ? 'checked' : 'unchecked'}
          size={size}
          isDisabled={isDisabled}
        />
      </span>
    </div>
  );

  const mediaContent = isRenderable(startContent) ? (
    <>
      {radioCircle}
      {startContent}
    </>
  ) : (
    radioCircle
  );

  return (
    <Item
      ref={mergedRowRef}
      {...(isDisabled ? undefined : pressable)}
      {...(isDisabled ? undefined : indicatorScopeProps)}
      startContent={mediaContent}
      // Delegate row-surface clicks (label text, description, and the empty
      // hover area) to the radio input. The input stays the option's sole
      // focusable control, so the row adds no second tab stop.
      interactiveRef={radioRef}
      isDisabled={isDisabled}
      label={<span id={labelID}>{label}</span>}
      description={
        hasDescription ? (
          <span id={descriptionID}>{description}</span>
        ) : undefined
      }
      endContent={endContent}
      align={align}
      xstyle={
        [
          // Hover reaches the radio visual through the row's scope attribute
          // rather than props, so hovering the row tints the control.
          // The row keeps no press paint of its own: the circle paints, and
          // reads the strength whose release the row keeps.
          rowPressLayerStyles.cellWithoutLayer,
          !isDisabled && touchHitAreaStyles.layer,
          xstyle,
        ] as StyleXStyles
      }
      {...mergeProps(
        // One target for every row, carrying its size and runtime state so a
        // theme can express "selected option at large" or restyle disabled
        // rows without reaching for structural selectors. It lands on the
        // element Item paints — the row surface — so a theme styling
        // `radio-list-item`'s background/padding/borderRadius (and its
        // `:hover`) actually takes effect from the `astryx-theme` layer, even
        // though the component zeroes those by default. Converges with how
        // ListItem lands `list-item` on the same element as `astryx-item`.
        themeProps('radio-list-item', {
          size,
          selected: isChecked ? 'selected' : null,
          disabled: isDisabled ? 'disabled' : null,
        }),
        {
          className: tw(
            // Restore the bare default look: zero Item's padding/radius and
            // its interactive hover/press background. Each class names the row
            // twice, so it wins within the base layer; a `radio-list-item`
            // theme still overrides it from the higher `astryx-theme` layer.
            radioListItemRowClassName,
            !isDisabled && rowPressPaintRadioRowClassName,
            className,
          ),
          style,
        },
      )}
      {...rest}
    />
  );
}

RadioListItem.displayName = 'RadioListItem';
