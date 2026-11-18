// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SelectableCard.tsx
 * @input Uses Card, useClickableContainer, StyleX
 * @output Exports SelectableCard component and SelectableCardProps
 * @position Interactive card for toggle selection
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/SelectableCard/SelectableCard.doc.mjs (props table, features)
 * - /packages/core/src/SelectableCard/index.ts (exports if types change)
 * - /apps/storybook/stories/SelectableCard.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Card/SelectableCardShowcase.tsx (showcase block)
 * - /packages/cli/assets/templates/blocks/components/Card/SelectableCardMulti.tsx (block)
 * - /packages/cli/assets/templates/blocks/components/Card/SelectableCardElevated.tsx (block)
 *
 * Composes Card for all visual styling. Adds selection state with
 * an inset box-shadow (zero layout jitter) and useClickableContainer
 * for safe nested interactive elements.
 *
 * A hidden <input type="checkbox"> inside the card provides the accessible
 * role, label, and checked state — the card surface itself has no role/tabIndex.
 * Space toggles it natively; Enter is wired up as an additional toggle key.
 * Inside a single-choice group (Lab's SelectableCardGroup, through an internal
 * context) the input is a radio: the card selects and never deselects itself.
 *
 * For static display, use Card.
 * For navigation or action cards, use ClickableCard.
 */

import {
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
  useRef,
  useCallback,
  use,
  type Ref,
} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {Elevation, SizeValue, SpacingStep} from '../utils/types';
import {isImeKeyEvent, mergeProps} from '../utils';
import {chainEventHandlers} from '../utils/chainEventHandlers';
import {Card} from '../Card/Card';
import type {CardVariant} from '../Card/Card';
import {useClickableContainer} from '../hooks/useClickableContainer';
import {closestLayerRoot} from '../privateAttributes/layerRoot.stylex';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {focusOutlineWithinClassName} from '../utils/focusOutlineClasses';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {tw} from '../utils/tw';
import {
  selectableCardDisabledClassName,
  selectableCardInputClassName,
  selectableCardInteractiveClassName,
  selectableCardOverlayClassName,
  selectableCardRingClassName,
} from './selectableCardClasses';
import {selectableCardSelectionStyles} from './selectableCardSelection.stylex';

import {useMergedRefs} from '../hooks/useMergedRefs';
import {SelectableCardInputContext} from './selectableCardInput';
// =============================================================================
// Styles — selection + interaction; Card handles the rest
// =============================================================================

/**
 * A selected card shows an accent border and an inset accent ring, drawn
 * through the card's own border and shadow slots. The ring class reads one key
 * per built-in variant; a variant the theme added falls back to the unknown
 * entry, which paints with the lever the theme sets beside it.
 */
const selectedKeyForVariant = (variant: CardVariant): string => {
  switch (variant) {
    case 'default':
    case 'transparent':
    case 'muted':
      return 'accent';
    case 'blue':
    case 'cyan':
    case 'gray':
    case 'green':
    case 'orange':
    case 'pink':
    case 'purple':
    case 'red':
    case 'teal':
    case 'yellow':
      return variant;
    // CardVariant is open — a theme can add a variant this switch has never
    // seen, and it still has to look selected.
    default:
      return 'unknown';
  }
};

const selectedBorderColor: Record<string, string> = {
  accent: 'var(--color-accent)',
  blue: 'var(--color-border-blue)',
  cyan: 'var(--color-border-cyan)',
  gray: 'var(--color-border-gray)',
  green: 'var(--color-border-green)',
  orange: 'var(--color-border-orange)',
  pink: 'var(--color-border-pink)',
  purple: 'var(--color-border-purple)',
  red: 'var(--color-border-red)',
  teal: 'var(--color-border-teal)',
  yellow: 'var(--color-border-yellow)',
  unknown: 'var(--selectable-card-ring-color)',
};

// =============================================================================
// Props
// =============================================================================

export interface SelectableCardProps extends Omit<BaseProps, 'onChange'> {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;

  /**
   * Accessibility label for the card.
   * Used as `aria-label` — provides the accessible name for screen readers.
   */
  label: string;

  /**
   * Controlled selection state.
   * When true, the card shows an inset accent border indicating selection.
   */
  isSelected: boolean;

  /**
   * Selection change handler.
   * Called with the new selection state when the card is toggled.
   */
  onChange: (isSelected: boolean) => void;

  /**
   * Set to true to disable the card.
   * Disabled cards remain focusable (tabIndex 0) with aria-disabled
   * so screen reader users can discover them.
   */
  isDisabled?: boolean;

  /** Content to render inside the card. */
  children?: ReactNode;

  /**
   * Internal padding of the card using the spacing scale.
   * @default 4 (16px)
   */
  padding?: SpacingStep;

  /**
   * Background color variant.
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Resting elevation — the shadow depth the card sits at.
   * The selection ring composes on top, so a selected card keeps its shadow.
   * @default 'none'
   */
  elevation?: Elevation;

  /** Width of the card. */
  width?: SizeValue;

  /** Height of the card. */
  height?: SizeValue;

  /** Maximum width of the card. */
  maxWidth?: SizeValue;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Call a caller's click handler during capture, before the layer's own
 * handlers, without letting it change what those handlers see. Its
 * stopPropagation() would keep the press from the control inside the layer,
 * so it does nothing here. Its preventDefault() would mark the event handled
 * for those controls (a Button skips its clickAction), so it is applied to
 * the native event only after the press has bubbled to the document, where it
 * still cancels the browser's default action.
 */
function callBeforeLayerHandlers(
  handler: (event: MouseEvent<HTMLElement>) => void,
  event: MouseEvent<HTMLElement>,
): void {
  const {stopPropagation, preventDefault} = event;
  let isDefaultPreventedByCaller = false;
  event.stopPropagation = () => {};
  event.preventDefault = () => {
    isDefaultPreventedByCaller = true;
  };
  try {
    handler(event);
  } finally {
    event.stopPropagation = stopPropagation;
    event.preventDefault = preventDefault;
  }
  if (isDefaultPreventedByCaller) {
    const nativeEvent = event.nativeEvent;
    const doc = event.currentTarget.ownerDocument;
    const cancelDefault = (bubbled: Event) => {
      doc.removeEventListener(nativeEvent.type, cancelDefault);
      if (bubbled === nativeEvent) {
        nativeEvent.preventDefault();
      }
    };
    doc.addEventListener(nativeEvent.type, cancelDefault);
  }
}

/**
 * A card that toggles between selected and unselected states.
 *
 * Composes Card for visual styling and adds selection state with
 * an inset box-shadow (zero layout jitter vs plain Card). Supports
 * hover, pressed, focus, and disabled states.
 *
 * A visually-hidden <input type="checkbox"> inside the card provides
 * the accessible role, label, and checked state. The card surface
 * is a plain <div> — no role or tabIndex on the container.
 *
 * @compositionHint Use for multi-select card groups, managing selection
 * state externally in a Set. Not for single-select: each card is a
 * checkbox, so assistive technology announces a multi-select group.
 * For navigation/action cards, use ClickableCard instead.
 *
 * @example
 * ```
 * <SelectableCard
 *   label="Option A"
 *   isSelected={selected.has('a')}
 *   onChange={isSelected => toggle('a', isSelected)}>
 *   <Text type="body" weight="bold">Option A</Text>
 * </SelectableCard>
 * ```
 */
export function SelectableCard({
  label,
  isSelected,
  onChange,
  onClick: onClickProp,
  onMouseUp: onMouseUpProp,
  onPointerDown: onPointerDownProp,
  isDisabled = false,
  children,
  padding,
  variant = 'default',
  elevation = 'none',
  width,
  height,
  maxWidth,
  ref,
  xstyle: xstyleProp,
  className: classNameProp,
  style,
  ...props
}: SelectableCardProps) {
  const pressable = usePressFeedback();
  const selectedKey = selectedKeyForVariant(variant);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const interactiveRef = useRef<HTMLInputElement | null>(null);

  // A group can make the input a radio. A radio only selects: a native radio
  // stays checked when it is clicked again.
  const groupInput = use(SelectableCardInputContext);
  const isRadio = groupInput?.type === 'radio';
  const requestChange = useCallback(() => {
    if (!isRadio) {
      onChange(!isSelected);
    } else if (!isSelected) {
      onChange(true);
    }
  }, [isRadio, isSelected, onChange]);

  const handleClick = useCallback(
    (_event: MouseEvent<HTMLElement>) => {
      if (!isDisabled) {
        requestChange();
      }
    },
    [isDisabled, requestChange],
  );

  // A native checkbox or radio reacts to Space but not to Enter. This handler
  // adds Enter. Space is not handled here, because it would act twice.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (isImeKeyEvent(event.nativeEvent)) {
        return;
      }
      if (isDisabled) {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
        }
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        requestChange();
      }
    },
    [isDisabled, requestChange],
  );

  const {onClick, onMouseUp, onPointerDown} = useClickableContainer({
    containerRef,
    interactiveRef,
    onClick: handleClick,
    disabled: isDisabled,
  });

  const composedOnClick = onClickProp
    ? (e: MouseEvent<HTMLElement>) => {
        onClick(e);
        onClickProp(e);
      }
    : onClick;

  // Until the next minor, a click inside an open layer within the card still
  // reaches the caller's onClick. The layer root stops that click before the
  // bubble phase, so it is delivered here, during capture. It never toggles.
  // Remove at the next minor, when that click stops reaching onClick.
  const handleLayerClickCapture = onClickProp
    ? (e: MouseEvent<HTMLElement>) => {
        const target = e.target;
        if (!(target instanceof Element)) {
          return;
        }
        const layerRoot = closestLayerRoot(target);
        if (layerRoot == null || layerRoot.contains(e.currentTarget)) {
          return;
        }
        callBeforeLayerHandlers(onClickProp, e);
      }
    : undefined;

  const composedOnMouseUp = onMouseUpProp
    ? (e: MouseEvent<HTMLElement>) => {
        onMouseUp(e);
        onMouseUpProp(e);
      }
    : onMouseUp;

  return (
    <Card
      ref={useMergedRefs(ref, containerRef)}
      {...(isDisabled ? undefined : pressable)}
      width={width}
      height={height}
      maxWidth={maxWidth}
      padding={padding}
      variant={variant}
      elevation={elevation}
      {...mergeProps(
        themeProps('selectable-card', {
          variant,
          selected: isSelected ? 'true' : 'false',
        }),
        classNameProp,
        style,
      )}
      className={tw(
        selectableCardInteractiveClassName,
        isSelected && selectableCardRingClassName[selectedKey],
        !isDisabled && selectableCardOverlayClassName,
        isDisabled && selectableCardDisabledClassName,
        focusOutlineWithinClassName,
        classNameProp,
      )}
      xstyle={[
        isSelected &&
          selectableCardSelectionStyles.selected(
            selectedBorderColor[selectedKey],
          ),
        // The touch press's strength and release, on the element the
        // controller writes to; the `::after` above paints off it.
        !isDisabled && interactionOverlayStyles.pressedAlpha,
        xstyleProp,
      ]}
      onClick={!isDisabled ? composedOnClick : undefined}
      onMouseUp={!isDisabled ? composedOnMouseUp : undefined}
      onPointerDown={
        !isDisabled
          ? chainEventHandlers(onPointerDown, onPointerDownProp)
          : onPointerDownProp
      }
      {...props}
      onClickCapture={
        !isDisabled && handleLayerClickCapture
          ? (e: MouseEvent<HTMLDivElement>) => {
              handleLayerClickCapture(e);
              props.onClickCapture?.(e);
            }
          : props.onClickCapture
      }>
      <input
        ref={interactiveRef}
        type={isRadio ? 'radio' : 'checkbox'}
        name={groupInput?.name}
        value={groupInput?.value}
        // Radios group by name and form owner, so every radio card leaves
        // the form together and the group stays one tab stop. The group
        // submits its choice itself. A disabled checkbox card submits
        // nothing, so it leaves the form too.
        form={
          groupInput != null && (groupInput.type === 'radio' || isDisabled)
            ? ''
            : undefined
        }
        checked={isSelected}
        aria-label={label}
        aria-disabled={isDisabled ? 'true' : undefined}
        onChange={() => {
          if (isDisabled) {
            return;
          }
          requestChange();
        }}
        onKeyDown={handleKeyDown}
        className={selectableCardInputClassName}
      />
      {children}
    </Card>
  );
}

SelectableCard.displayName = 'SelectableCard';
