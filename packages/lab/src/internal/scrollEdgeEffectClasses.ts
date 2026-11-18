// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file scrollEdgeEffectClasses.ts
 * @input Accepts nothing: the veil and the sentinel have one fixed shape
 * @output Utility class strings for the veil and for the sentinel that
 *   switches it
 * @position Style primitives for useScrollEdgeEffect; the Tailwind build
 *   scans it for class names
 *
 * The veil: one colour, never a blur. Its mask is
 * 0.95 × (1 − Φ((y - edge) / 18px)), half strength at `edge`, sampled every
 * 6px over ±3σ; useScrollEdgeEffect.test.tsx recomputes it. It is denser
 * than UIKit's 0.85, so a bar's title keeps 4.5:1 over bright content.
 *
 * The layer's absolute length is per instance, so it reads
 * `--_scroll-edge-bar-bottom` (the bar's bottom edge) and
 * `--_scroll-edge-color`: the hook sets both inline.
 */

/**
 * Composited only while a finger works the scroller. On iOS 26.2, a composited
 * layer under a sticky bar blanks the bar's items when the program scrolls
 * back to the top.
 */
export const scrollEdgeLayerClassName = [
  'hidden [@media(pointer:coarse)]:block',
  'absolute inset-x-0 top-0 pointer-events-none opacity-0',
  'will-change-[var(--_scroll-edge-will-change,auto)]',
  // The layer ends below the veil's edge at the soft extent; Reduce
  // Transparency ends it at the edge, the bar's bottom.
  'h-[calc(var(--_scroll-edge-bar-bottom)_+_54.8px)]',
  '[@media(prefers-reduced-transparency:reduce)]:h-[var(--_scroll-edge-bar-bottom)]',
  'bg-[var(--_scroll-edge-color)]',
].join(' ');

/** The mask of the veil, reduced to a hard edge under Reduce Transparency. */
export const scrollEdgeLayerMaskClassName =
  '[mask-image:linear-gradient(to_bottom,_rgb(0_0_0_/_0.950)_calc(100%_-_118.8px),_rgb(0_0_0_/_0.949)_calc(100%_-_112.8px),_rgb(0_0_0_/_0.948)_calc(100%_-_106.8px),_rgb(0_0_0_/_0.945)_calc(100%_-_100.8px),_rgb(0_0_0_/_0.938)_calc(100%_-_94.8px),_rgb(0_0_0_/_0.922)_calc(100%_-_88.8px),_rgb(0_0_0_/_0.893)_calc(100%_-_82.8px),_rgb(0_0_0_/_0.845)_calc(100%_-_76.8px),_rgb(0_0_0_/_0.772)_calc(100%_-_70.8px),_rgb(0_0_0_/_0.675)_calc(100%_-_64.8px),_rgb(0_0_0_/_0.559)_calc(100%_-_58.8px),_rgb(0_0_0_/_0.433)_calc(100%_-_52.8px),_rgb(0_0_0_/_0.312)_calc(100%_-_46.8px),_rgb(0_0_0_/_0.207)_calc(100%_-_40.8px),_rgb(0_0_0_/_0.127)_calc(100%_-_34.8px),_rgb(0_0_0_/_0.071)_calc(100%_-_28.8px),_rgb(0_0_0_/_0.036)_calc(100%_-_22.8px),_rgb(0_0_0_/_0.017)_calc(100%_-_16.8px),_rgb(0_0_0_/_0.007)_calc(100%_-_10.8px))] [@media(prefers-reduced-transparency:reduce)]:mask-none';

/**
 * The switch point (10px) tall, at the top of the content, hidden from the
 * accessibility tree and from paint.
 */
export const scrollEdgeSentinelClassName =
  'absolute top-0 start-0 w-px h-[10px] pointer-events-none invisible';
