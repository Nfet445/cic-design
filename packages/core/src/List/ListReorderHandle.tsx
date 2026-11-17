// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ListReorderHandle.tsx
 * @input The List's reorder session (List/listReorderEngine.tsx, through
 *   ListContext's `reorder`), the translator and theme tokens
 * @output `ListReorderHandle`, `ListReorderRowName`, `reorderRowStyle` and
 *   `UNREAD_HANDLE_NAME`. The handle ends a reorderable List row. A finger
 *   held still on it drags it, and so does a pen where the primary pointer is
 *   coarse. A mouse, or a pen where it is fine, drags it at once. It is also a
 *   toggle (`aria-pressed`): a click, Space or Enter turns its row's reorder
 *   mode on and off. The row name serves a row without one, and the style a
 *   row that has one
 * @position Part of the reorder machinery that createReorderable carries.
 *   ListItem renders it, from the List's context, at the end of each row
 *   that can move
 *
 * UIKit's reorder control (iOS 26.2, measured) is three gray lines at the
 * trailing edge of a row in edit mode. A finger held still on it for the
 * scroll view's content-touch delay (150 ms) claims the drag. A flick that
 * starts on it scrolls the table instead. So until the claim, the handle
 * leaves the browser everything but double-tap zoom (`manipulation`). That
 * `touch-action` applies only where the primary pointer is coarse. Elsewhere
 * a finger gets the browser's defaults until the hold claims it. The handle is the one element the reorder
 * adds to a row. Its lines are a pseudo-element, and it listens to nothing
 * itself. The session's listeners take its drags. Its keys go through
 * React's.
 *
 * SYNC: When modified, update List/listReorderEngine.tsx and
 * List/ListItem.tsx.
 */

import {
  use,
  useRef,
  useSyncExternalStore,
  useId,
  type KeyboardEvent,
} from 'react';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {focusOutlineProps} from '../utils/focusOutline.stylex';
import {tw} from '../utils/tw';
import {
  ownRingContainerStyles,
  ownRingProps,
} from '../privateAttributes/ownRing.stylex';
import {listReorderHandleProps} from '../privateAttributes/listReorder.stylex';
import {reorderingHandleStyles} from '../privateAttributes/reordering.stylex';
import {useTouchHitArea} from '../utils/touchHitArea';
import {touchHitAreaStyles} from '../internal/touchHitArea.stylex';
import {
  registerEnglishFallback,
  useComponentTranslator,
} from '../i18n/useComponentTranslator';
import english from '../i18n/generated-english/List/ListReorderHandle.generated';
import {getNodeText} from '../utils/getNodeText';
import {ItemLabelContext} from '../Item/ItemLabelContext';
import {ListContext} from './ListContext';
import {listReorderHandleClassName} from './listReorderHandleClasses';
import type {
  ListReorderHandleProps,
  ListReorderRowNameProps,
} from './listReorderContext';
import type {
  ListReorderController,
  ListReorderHandleName,
} from './listReorderEngine';

registerEnglishFallback(english);

/**
 * The style of a row that ends with a handle, which ListItem applies. Its
 * ring on focus within stays off for the handle, which rings itself.
 */
export const reorderRowStyle = ownRingContainerStyles.focusWithin;

/** The insertion line's thickness, px (the engine centres it on a gap). */
export const INSERTION_LINE_THICKNESS = 2;

/** The text the row's label element shows, collapsed; empty without one. */
function labelTextOf(handle: HTMLElement | null, labelID: string | null) {
  const element =
    labelID == null
      ? null
      : (handle?.ownerDocument.getElementById(labelID) ?? null);
  return (element?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * The reorder handle of a List row. Renders nothing outside a reorderable
 * List.
 */
export function ListReorderHandle({
  label,
  itemKey,
  isDisabled = false,
  rowLabel,
  rowLabelledBy,
  rowAlign,
}: ListReorderHandleProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const t = useComponentTranslator();
  const controller = use(ListContext)?.reorder?.session as
    ListReorderController | undefined;
  // The row's label element, when the handle sits in an Item's slot.
  const labelID = use(ItemLabelContext);
  const verbID = useId();
  const text = getNodeText(label).replace(/\s+/g, ' ').trim();
  // Named "Reorder" followed by the row's name: the name
  // its caller gave the row. Else the elements that name the row (its
  // caller's `aria-labelledby`, or the label element Item renders), so a
  // label of any shape names it. Outside an Item, the label's text. A row
  // that shows no name is named after its place.
  const callerLabel = rowLabel?.trim() || null;
  const labelledBy =
    callerLabel != null ? undefined : (rowLabelledBy ?? labelID ?? undefined);
  const named = callerLabel != null || labelledBy != null || text !== '';
  const verb = t('@astryx.list.reorderHandleVerb');
  // Named by Item's label element only while it shows a name: a label of an
  // unnamed icon alone falls back to the place.
  const byLabel = labelID != null && labelledBy === labelID;
  // Syncs the handle into the reorder session, which lives outside React. The
  // session moves the row only with its handle recorded, and reports its
  // moves with the row's key.
  useIsomorphicLayoutEffect(
    () => controller?.registerHandle(ref.current, itemKey),
    [controller, itemKey],
  );
  // Syncs the row's name into the session, which announces the moves with
  // it. A new name keeps the handle recorded, so its row stays in reorder
  // mode. A component label's text is read from its element, rendered by now.
  // The session also reads, from the DOM, whether the label element names the
  // row and where the row sits, for the handle's name.
  useIsomorphicLayoutEffect(() => {
    const handle = ref.current;
    const spoken =
      callerLabel ??
      (text !== '' ? text : labelTextOf(handle, labelID ?? null));
    const unname = controller?.registerName(handle, spoken);
    const unlabel = controller?.registerHandleLabel(
      handle,
      byLabel ? (labelID ?? null) : null,
      named,
    );
    return () => {
      unname?.();
      unlabel?.();
    };
  }, [controller, callerLabel, text, labelID, byLabel, named]);
  const shown = useSyncExternalStore(
    controller?.subscribeHandleNames ?? subscribeNothing,
    () => controller?.handleNameOf(ref.current) ?? UNREAD_HANDLE_NAME,
    () => UNREAD_HANDLE_NAME,
  );
  const isPressed = useSyncExternalStore(
    controller?.subscribeMode ?? subscribeNothing,
    () => controller?.isInMode(ref.current) ?? false,
    () => false,
  );
  const isEnabled = controller != null && !isDisabled;
  // A finger's target: the shared touch hit area grows the handle's hit
  // layer where the primary pointer is coarse.
  const hitAreaRef = useTouchHitArea(true);
  const handleRef = useMergedRefs(ref, hitAreaRef);
  // A handle that stops taking gestures mid-drag sends a drag of its row
  // home, whichever pointer or key drives it. Its row may be disabled or no
  // longer reorderable, or the handle may be gone.
  useIsomorphicLayoutEffect(() => {
    const handle = ref.current;
    if (!isEnabled || controller == null) {
      return undefined;
    }
    return () => controller.release(handle);
  }, [controller, isEnabled]);
  if (controller == null) {
    return null;
  }
  // A label element that shows no name falls back to the row's place.
  const labelShowsName = byLabel && !shown.labelShowsNoName;
  const byPlace = byLabel ? !labelShowsName : !named;
  const shownLabelledBy = byLabel && !labelShowsName ? undefined : labelledBy;
  // Named through the label element. The handle's own `aria-label` is the
  // verb. It lists itself first in its `aria-labelledby`, which reads its
  // `aria-label` there: "Reorder", then the row's label.
  const name =
    byPlace && shown.position != null
      ? t('@astryx.list.reorderHandleAt', {position: shown.position})
      : callerLabel != null
        ? t('@astryx.list.reorderHandle', {label: callerLabel})
        : labelledBy != null
          ? verb
          : text !== ''
            ? t('@astryx.list.reorderHandle', {label: text})
            : undefined;
  return (
    <button
      ref={handleRef}
      id={shownLabelledBy == null ? undefined : verbID}
      type="button"
      {...listReorderHandleProps}
      // The handle takes its own press, so the row does not highlight under
      // it (it paints nothing itself).
      data-astryx-pressable=""
      // It rings itself: the row's focus-within ring stays off for it.
      {...ownRingProps}
      aria-label={name}
      aria-labelledby={
        shownLabelledBy == null ? undefined : `${verbID} ${shownLabelledBy}`
      }
      aria-describedby={controller.hintId}
      aria-disabled={isDisabled || undefined}
      aria-pressed={isPressed}
      // A click, Space or Enter: reorder mode, unless the press dragged.
      onClick={() => {
        if (!controller.takeDrag(ref.current) && !isDisabled) {
          controller.toggleMode(ref.current);
        }
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (!isDisabled) {
          controller.keyDown(ref.current, event);
        }
      }}
      onBlur={event => controller.blur(ref.current, event.relatedTarget)}
      // The row's own pointer handling (its swipe) never sees the handle's
      // presses: the list's listeners have them, before this.
      onPointerDown={event => event.stopPropagation()}
      // A hold on the handle picks the row up. Only a hold elsewhere on the
      // row opens the row's menu. A menu around the row never starts its long
      // press from the handle, and a finger's long press there sends it no
      // context request. A mouse's right click on the handle still reaches it.
      onTouchStart={event => event.stopPropagation()}
      onContextMenu={event => {
        if (
          (event.nativeEvent as Partial<PointerEvent>).pointerType === 'touch'
        ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      {...focusOutlineProps.focusVisible(
        reorderingHandleStyles.cursor,
        touchHitAreaStyles.layer,
      )}
      className={tw(listReorderHandleClassName({rowAlign}))}
    />
  );
}

ListReorderHandle.displayName = 'ListReorderHandle';

const subscribeNothing = () => () => {};

/**
 * A handle's name before the session reads it: its server snapshot, and the
 * session's answer for a handle it has not read. One object keeps the
 * snapshot through hydration and the first read.
 */
export const UNREAD_HANDLE_NAME: ListReorderHandleName = {
  position: null,
  labelShowsNoName: false,
};

/**
 * Names a reorderable List's row that has no handle, for the announcements
 * of the moves beside it. That is a row that stays, or one without an item
 * key. Renders nothing.
 */
export function ListReorderRowName({row, label}: ListReorderRowNameProps) {
  const controller = use(ListContext)?.reorder?.session as
    ListReorderController | undefined;
  const text = getNodeText(label).replace(/\s+/g, ' ').trim();
  // Syncs the row's name into the reorder session, which lives outside React.
  useIsomorphicLayoutEffect(
    () => controller?.registerName(row.current, text),
    [controller, row, text],
  );
  return null;
}

ListReorderRowName.displayName = 'ListReorderRowName';
