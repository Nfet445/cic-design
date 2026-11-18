// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SwipeActionsLayer.tsx
 * @input The swipe entries per side, the behavior; useSwipeAction, the class
 *   map
 * @output Exports SwipeActionsLayer (default): the panels of a row's swipe
 *   actions and the gesture that uncovers them
 * @position Brought by createSwipe.ts, which hands it to a row the swipe
 *   serves; Item.tsx's deprecated path loads it with `import()`. Tested
 *   through Item.test.tsx and Item.source-build.test.mjs.
 *
 * SYNC: the property names are useSwipeAction.ts's.
 */

import {useEffect, useRef} from 'react';
import {mergeProps} from '../utils/mergeProps';
import {tw} from '../utils/tw';
import {themeProps} from '../utils/themeProps';
import {disabledInteractionProps} from '../utils/disabledInteraction';
import {focusOutlineFocusVisibleClassName} from '../utils/focusOutlineClasses';
import {isSwipeOpen, useSwipeAction, type SwipeSide} from './useSwipeAction';
import type {SwipeEntry, SwipeLayerProps} from './swipeHost';
import {
  swipeEntryClassName,
  swipeEntryCoveredClassName,
  swipeEntryDisabledClassName,
  swipeEntryVariantClassName,
  swipeOuterEntryClassName,
  swipeOuterEntryLeadingClassName,
  swipeOuterEntryTrailingClassName,
  swipePanelClassName,
  swipeTrackClassName,
  swipeTrackCoveredClassName,
  swipeTrackFillClassName,
  swipeTrackLeadingClassName,
  swipeTrackTrailingClassName,
} from './swipeActionsLayerClasses';

// =============================================================================
// Component
// =============================================================================

/** A row's actions as their ids, side by side: what tells a change of actions. */
function idsKeyOf(
  leading: ReadonlyArray<SwipeEntry>,
  trailing: ReadonlyArray<SwipeEntry>,
): string {
  const ids = (entries: ReadonlyArray<SwipeEntry>) =>
    entries.map(entry => entry.id ?? '').join('\u0000');
  return `${ids(leading)}\u0001${ids(trailing)}`;
}

/**
 * The swipe half of a row with swipe actions: both panels, rendered into the
 * root the row owns, and the gesture that drives that root.
 *
 * The row's root stays the row's: it takes the root style the swipe brings, and
 * forwards its key events into the bridge this layer fills. The gesture
 * attaches to the root itself, and the layer holds
 * the root's press while the row is open. This layer renders the two panels as
 * out-of-flow children of that root. So no element is added to the row for the
 * swipe.
 *
 * A panel is two boxes and the entries themselves. Transforms move all three,
 * reading the travel the gesture writes on the root (see useSwipeAction). The
 * window sits over the row's resting box, reads the travel's negation, and
 * clips to that box. The track inside it moves with the row, and clips the
 * entries to the space the row vacates. Each entry is translated back from the
 * side's pin. So the entries stay at the outer edge until the row has uncovered
 * them all, then ride the row. Past the open width the outermost entry's
 * colour, painted beside it, fills the rest out to that edge. On a confirmed
 * full swipe it slides to the row's edge. While an entry covers the panel, its
 * colour fills the track and the others hide. So no entry's colour shows behind
 * or between other entries. No wrapper holds the entries, and the colours are
 * pseudo-elements.
 */
export default function SwipeActionsLayer({
  onBridge,
  leading,
  trailing,
  behavior,
  itemKey,
}: SwipeLayerProps) {
  // The hook keeps the newest of these callbacks, so each reads the entries
  // of the render it came from.
  const outermostOf = (side: SwipeSide) => {
    const entries = side === 'leading' ? leading : trailing;
    return entries[entries.length - 1];
  };
  const swipe = useSwipeAction({
    behavior,
    // A disabled outermost entry cannot fire, so a full swipe never confirms
    // toward it.
    canConfirm: side => {
      const entry = outermostOf(side);
      return entry != null && entry.isDisabled !== true;
    },
    fireOutermost: side => {
      const entry = outermostOf(side);
      if (entry == null || entry.isDisabled === true) {
        return false;
      }
      void entry.onActivate({id: entry.id ?? '', itemKey});
      return entry.hasRemoval === true;
    },
    sides: {
      leading: leading.length,
      trailing: trailing.length,
    },
  });
  const {onKeyDown} = swipe;
  // The Effect publishes the layer's key handler to the row's bridge and clears
  // it when the layer leaves. Both are stable, so it runs once per layer.
  useEffect(() => {
    onBridge?.({onKeyDown});
    return () => onBridge?.(null);
  }, [onBridge, onKeyDown]);
  // A new swipe value with the same ids keeps the row as it is. One with
  // other ids shows other actions, so an open row closes.
  const idsKey = idsKeyOf(leading, trailing);
  const idsRef = useRef(idsKey);
  const {close} = swipe;
  // The Effect settles the row's snap-point drag to rest when the actions'
  // ids change.
  useEffect(() => {
    if (idsRef.current !== idsKey) {
      idsRef.current = idsKey;
      close();
    }
  }, [close, idsKey]);
  // Open from the release that opens it (`isSwipeOpen`), as UIKit counts it:
  // an entry the finger can see while the row springs open is tappable.
  const isOpen = isSwipeOpen(swipe.state);

  // A side's panel: entries as real buttons under `reveal`, presentational
  // blocks under `commit`. It is out of the accessibility tree and the tab
  // order except while the row is open on its side. So the row keeps one tab
  // stop, and the other side's entries, out of sight behind the row, are never
  // reached. A mouse drag never opens it.
  const renderSwipePanel = (
    side: SwipeSide,
    entries: ReadonlyArray<SwipeEntry>,
  ) => {
    if (entries.length === 0) {
      return null;
    }
    const outer = entries[entries.length - 1];
    const isCommit = behavior === 'commit';
    const isLive = isOpen && swipe.state.side === side && !isCommit;
    const refs = swipe.panelRefs[side];
    const {cover} = swipe.state;
    const coverIndex =
      swipe.state.side === side && cover != null && cover < entries.length
        ? cover
        : null;
    const renderEntry = (entry: SwipeEntry, index: number) => {
      const variant = entry.variant ?? 'accent';
      const key = entry.id ?? entry.label;
      // The outermost entry is the full swipe's moving part itself.
      const isOuter = entry === outer;
      const ref = isOuter ? refs.outer : refs.entry(key);
      const content = (
        <>
          {entry.icon}
          <span>{entry.label}</span>
        </>
      );
      const entryClassName = tw(
        swipeEntryClassName,
        swipeEntryVariantClassName[variant],
        entry.isDisabled === true && swipeEntryDisabledClassName,
        coverIndex != null &&
          index !== coverIndex &&
          swipeEntryCoveredClassName,
        isOuter && swipeOuterEntryClassName,
        isOuter &&
          (side === 'leading'
            ? swipeOuterEntryLeadingClassName
            : swipeOuterEntryTrailingClassName),
      );
      if (isCommit) {
        return (
          <span
            key={key}
            ref={ref}
            {...mergeProps(themeProps('item-swipe-action', {variant}), {
              className: entryClassName,
            })}>
            {content}
          </span>
        );
      }
      return (
        <button
          key={key}
          ref={ref}
          type="button"
          aria-disabled={entry.isDisabled === true ? true : undefined}
          onClick={() =>
            swipe.activateEntry(
              () => {
                void entry.onActivate({id: entry.id ?? '', itemKey});
              },
              entry.hasRemoval === true,
              index,
            )
          }
          // A disabled entry stays focusable while the row rests open but is
          // inert: it runs no `onActivate` and its click does not reach the
          // row.
          {...(entry.isDisabled === true
            ? disabledInteractionProps<HTMLButtonElement>()
            : null)}
          {...mergeProps(
            themeProps('item-swipe-action', {variant}),
            tw(entryClassName, focusOutlineFocusVisibleClassName),
          )}>
          {content}
        </button>
      );
    };
    return (
      <div
        key={side}
        ref={refs.panel}
        data-swipe-panel={side}
        inert={isLive ? undefined : true}
        aria-hidden={isCommit ? true : undefined}
        className={swipePanelClassName}>
        <div
          {...mergeProps(themeProps('item-swipe-panel', {side}), {
            className: tw(
              swipeTrackClassName,
              side === 'leading'
                ? swipeTrackLeadingClassName
                : swipeTrackTrailingClassName,
              coverIndex != null && swipeTrackCoveredClassName,
              swipeTrackFillClassName[
                (coverIndex != null ? entries[coverIndex] : outer).variant ??
                  'accent'
              ],
            ),
          })}>
          {entries.map((entry, index) => renderEntry(entry, index))}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderSwipePanel('leading', leading)}
      {renderSwipePanel('trailing', trailing)}
    </>
  );
}

SwipeActionsLayer.displayName = 'SwipeActionsLayer';
