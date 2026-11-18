// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useScrollEdgeEffect.ts
 * @input React, StyleX, IntersectionObserver, Lab's motion engine, the veil's
 *   classes, and Core's gesture host, finger-scroll hook (with its end call),
 *   resize observer, touch presentation and colour tokens
 * @output useScrollEdgeEffect: props for a bar's scroll edge veil and for the
 *   sentinel that switches it, fading on the caller's springs
 * @position Lab's iOS 26 bar look under a finger, for NavigationStack. Lab's
 *   entry point does not export it. With a mouse it observes nothing.
 *
 * SYNC: When modified, update useScrollEdgeEffect.test.tsx and NavigationStack.
 * The veil's shape lives in scrollEdgeEffectClasses.ts.
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {useCallback, useEffect, useRef, type RefObject} from 'react';
import {
  getGestureHost,
  useFingerScroll,
  useTouchPresentation,
  type SpringDescription,
} from '@astryxdesign/core/internal/touch';
import {colorVarNames} from '@astryxdesign/core/theme';
import {observeResize} from '@astryxdesign/core/utils';
import {useMotionEngine} from './useMotionEngine';
import {
  scrollEdgeLayerClassName,
  scrollEdgeLayerMaskClassName,
  scrollEdgeSentinelClassName,
} from './scrollEdgeEffectClasses';
import {tw} from '../tw';

/** No scroller: nothing is watched (a mouse, or the effect is off). */
const NO_SCROLLER: RefObject<Element | null> = {current: null};

/**
 * The private custom property the layer's `will-change` reads: `opacity`
 * while a finger works the scroller, unset otherwise. Only this hook sets it,
 * inline; it is not theme data.
 */
export const SCROLL_EDGE_LAYER_PROMOTION = '--_scroll-edge-will-change';

export interface UseScrollEdgeEffectOptions {
  /**
   * Whether the effect runs. When false, and always with a mouse, the veil
   * stays transparent and nothing is observed.
   * @default true
   */
  readonly enabled?: boolean;
  /**
   * The scroll container whose content passes under the bar. Omit for a
   * page that scrolls (the viewport).
   */
  readonly root?: RefObject<Element | null>;
  /**
   * How far, in px, a bar overlays the top of `root` from its padding edge.
   * Under a 44px bar it is `44`: the content counts as under the bar once it
   * passes the bar's bottom edge.
   * @default 0
   */
  readonly rootInset?: number;
  /**
   * The bar's bottom edge, where the veil is half strength, from the top of
   * the layer's containing block. A CSS length without `calc()`: `100%`
   * inside the bar, `44px` under a 44px bar that overlays the screen.
   */
  readonly edge: string;
  /**
   * The veil's colour: the colour behind the bar's content.
   * @default the body background
   */
  readonly color?: string;
  /** Extra styles for the layer, e.g. its stacking order. */
  readonly layerXstyle?: StyleXStyles;
  /** Extra classes for the layer, e.g. its stacking order. */
  readonly layerClassName?: string;
  /**
   * Extra styles for the sentinel. Insets of `auto` leave it at its static
   * position, the top of the content, with no positioned wrapper.
   */
  readonly sentinelXstyle?: StyleXStyles;
  /**
   * Extra classes for the sentinel. In a caller that has left StyleX, its
   * insets of `auto` keep it at its static position.
   */
  readonly sentinelClassName?: string;
  /** The fades' springs: a bar's are `bars.scrollEdgeEffect`'s. */
  readonly springs: {
    readonly appear: SpringDescription;
    readonly disappear: SpringDescription;
  };
}

/** Props to spread on an element, ref included. */
interface ElementProps {
  readonly ref: (element: HTMLElement | null) => void;
  readonly 'aria-hidden': true;
  readonly className?: string;
  readonly style?: Readonly<Record<string, string | number>>;
}

export interface UseScrollEdgeEffectResult {
  /**
   * The veil: spread on an empty element at the top of the bar's containing
   * block, above the content and below the bar's items.
   */
  readonly layerProps: ElementProps;
  /**
   * The sentinel: spread on an empty element at the top of the scrolled
   * content. With static insets, the scroll container must be its containing
   * block, so that it scrolls with the content.
   */
  readonly sentinelProps: ElementProps;
}

/**
 * The iOS 26 scroll edge effect of a bar, under a finger. A veil fades in once
 * the content has moved more than 10px under the bar, and out when it comes
 * back. It is a switch with a timed fade, not a ramp that follows the scroll.
 *
 * @example
 * ```
 * const edge = useScrollEdgeEffect({
 *   root: scrollerRef,
 *   rootInset: 44,
 *   edge: '44px',
 *   springs: bars.scrollEdgeEffect,
 * });
 * <div {...edge.layerProps} />
 * <div ref={scrollerRef}><div><div {...edge.sentinelProps} /></div>…</div>
 * ```
 */
export function useScrollEdgeEffect({
  enabled = true,
  root,
  rootInset = 0,
  edge,
  color = colorVarNames['--color-background-body'],
  layerXstyle,
  layerClassName,
  sentinelXstyle,
  sentinelClassName,
  springs,
}: UseScrollEdgeEffectOptions): UseScrollEdgeEffectResult {
  const {isTouch} = useTouchPresentation();
  const isOn = enabled && isTouch;
  const {ref: layerRef, animator} = useMotionEngine({
    initial: {opacity: 0},
  });
  // The running effect's promotion check. The finger-scroll hook calls it
  // when a finger's scroll ends; the effect sets it and clears it.
  const updatePromotionRef = useRef<(() => void) | null>(null);
  // Watched only while the effect runs, so a mouse costs nothing. A page's
  // scroll is the document's; a container scrolls itself.
  const isFingerScroll = useFingerScroll(
    !isOn
      ? NO_SCROLLER
      : (root ?? (typeof document === 'undefined' ? NO_SCROLLER : document)),
    {onEnd: () => updatePromotionRef.current?.()},
  );
  // The callback ref owns the sentinel, never React state. It moves the
  // running observer to a replacement node.
  const sentinelElementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback((element: HTMLElement | null) => {
    const observer = observerRef.current;
    if (observer != null && sentinelElementRef.current != null) {
      observer.unobserve(sentinelElementRef.current);
    }
    sentinelElementRef.current = element;
    if (observer != null && element != null) {
      observer.observe(element);
    }
  }, []);

  // Synchronizes with an IntersectionObserver on the sentinel and with the
  // gesture host's fingers, which decide the layer's promotion. While the
  // scroller has no layout, it also waits on Core's shared resize observer.
  useEffect(() => {
    if (!isOn || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const sentinel = sentinelElementRef.current;
    const doc = sentinel?.ownerDocument ?? document;
    const container = root?.current ?? null;
    let isShown: boolean | null = null;
    // Engines disagree on a scroll container's root rectangle: Chromium
    // takes its padding box, WebKit its content box. The first report
    // measures the difference; a page has no padding edge.
    let rootOffset: number | null = container == null ? 0 : null;
    let observer: IntersectionObserver;
    let stopWaiting: (() => void) | null = null;
    const report = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[entries.length - 1];
      if (entry == null) {
        return;
      }
      if (rootOffset == null && container != null) {
        const bounds = entry.rootBounds;
        // A scroller with no layout (a stack in a hidden panel) gives nothing
        // to measure. Wait until it has a size, then observe again: a new
        // observer reports at once. The resize observer calls back once as
        // it subscribes; the scroller has no size yet, so that call returns.
        if (container.clientHeight <= 0) {
          stopWaiting ??= observeResize(container, () => {
            if (container.clientHeight <= 0) {
              return;
            }
            stopWaiting?.();
            stopWaiting = null;
            observer.disconnect();
            observe();
          });
          return;
        }
        const paddingEdge =
          container.getBoundingClientRect().top + container.clientTop;
        const offset =
          bounds == null ? 0 : Math.round(bounds.top - rootInset - paddingEdge);
        rootOffset = offset;
        if (offset !== 0) {
          // WebKit measured this report from the content box: observe
          // again from the padding edge.
          observer.disconnect();
          observe();
          return;
        }
      }
      // The sentinel's bottom passes the root's top when the content has
      // moved more than 10px under the bar. A box that only touches it
      // still intersects: 10px is off, 10.25px is on, as measured.
      const next = !entry.isIntersecting;
      if (next === isShown) {
        return;
      }
      // A busy page can run the report after the finger's scroll ended: read
      // the scroll at the time the observer recorded the crossing.
      if (isShown != null && isFingerScroll(entry.time)) {
        // Under Reduce Motion the animator plays its own opacity
        // cross-fade on a coarse pointer.
        animator.animate(
          {opacity: next ? 1 : 0},
          {spring: next ? springs.appear : springs.disappear},
        );
      } else {
        // The first report, or the program's scroll: at once, with no
        // compositing layer (the WebKit blank on the layer style above).
        animator.set({opacity: next ? 1 : 0}, {promote: false});
      }
      isShown = next;
    };
    const observe = () => {
      observer = new IntersectionObserver(report, {
        // The sentinel's own document: inside a frame, the implicit root is
        // the top-level viewport.
        root: container ?? doc,
        rootMargin: `${(rootOffset ?? 0) - rootInset}px 0px 0px 0px`,
        threshold: 0,
      });
      observerRef.current = observer;
      const current = sentinelElementRef.current;
      if (current != null) {
        observer.observe(current);
      }
    };
    observe();
    // The layer is promoted from a finger's landing until its scroll ends,
    // momentum included. A fade that starts mid-drag then finds its layer.
    // Drop this once iOS no longer blanks a sticky bar when the program
    // scrolls over a composited layer.
    const scroller: Node = container ?? doc;
    const host = getGestureHost(doc);
    const releaseHost = host.retain();
    let isPromoted = false;
    const updatePromotion = () => {
      const layer = animator.element;
      const next = host.isFingerDownIn(scroller) || isFingerScroll();
      if (layer == null || next === isPromoted) {
        return;
      }
      isPromoted = next;
      if (next) {
        layer.style.setProperty(SCROLL_EDGE_LAYER_PROMOTION, 'opacity');
      } else {
        layer.style.removeProperty(SCROLL_EDGE_LAYER_PROMOTION);
      }
    };
    const unsubscribeFingers = host.onFingersChange(updatePromotion);
    // The finger-scroll hook says when the finger's scroll has ended, its
    // momentum included, so the layer drops with no listener or timer here.
    updatePromotionRef.current = updatePromotion;
    return () => {
      observerRef.current = null;
      observer.disconnect();
      unsubscribeFingers();
      updatePromotionRef.current = null;
      stopWaiting?.();
      releaseHost();
      animator.element?.style.removeProperty(SCROLL_EDGE_LAYER_PROMOTION);
      animator.set({opacity: 0}, {promote: false});
    };
  }, [isOn, root, rootInset, animator, isFingerScroll, springs]);

  return {
    layerProps: {
      ref: layerRef,
      'aria-hidden': true,
      className: tw(
        scrollEdgeLayerClassName,
        scrollEdgeLayerMaskClassName,
        layerClassName,
        layerXstyle != null && stylex.props(layerXstyle).className,
      ),
      style: {
        ...stylex.props(layerXstyle).style,
        // Both are lengths a caller chooses, so they travel as properties the
        // classes read, not as classes the build cannot name.
        '--_scroll-edge-bar-bottom': edge,
        '--_scroll-edge-color': color,
      },
    },
    sentinelProps: {
      ref: sentinelRef,
      'aria-hidden': true,
      className: tw(
        scrollEdgeSentinelClassName,
        sentinelClassName,
        sentinelXstyle != null && stylex.props(sentinelXstyle).className,
      ),
    },
  };
}
