// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file svgIconClasses.ts
 * @input Accepts nothing: the weight bands and the layer ranges are fixed
 * @output Utility class strings for the SVG icon's probe and its weight layers
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * Reading the weight: the icon's probe element is `1ch` wide in the probe font,
 * so its width is (1000 + weight) / 1000 em. Container queries on that width
 * snap a weight between 300 and 700 onto the svg, and each layer's opacity
 * reads that value. Only container queries are needed, no length division.
 *
 * Showing a drawing: every layer computes the current weight itself through
 * the inherited `--astryx-icon-weight-snapped` token, so the rules work
 * unchanged inside `<use>` sprite instances, where page selectors cannot reach
 * through the instance boundary but inherited properties do.
 */

/**
 * The probe: a `1ch` box in the probe font that must not shrink to the icon
 * box, and the named inline-size container for the bands below.
 */
export const weightProbeClassName =
  '@container/astryx-icon-weight w-[1ch] h-full shrink-0';

/**
 * The svg publishes the snapped weight once, then the five width bands each
 * 100 weight units wide read the probe. Weights below 300 (1.0-1.25em) also
 * snap to 300. Fallback fonts (about 0.55em) stay below the band and keep 400.
 */
export const weightProbeSvgClassName =
  '[--astryx-icon-weight-snapped:clamp(300,round(var(--astryx-icon-weight,var(--astryx-icon-weight-read,400)),100),700)] [@container_astryx-icon-weight_(width>1em)_and_(width<1.35em)]:[--astryx-icon-weight-read:300] [@container_astryx-icon-weight_(width>=1.35em)_and_(width<1.45em)]:[--astryx-icon-weight-read:400] [@container_astryx-icon-weight_(width>=1.45em)_and_(width<1.55em)]:[--astryx-icon-weight-read:500] [@container_astryx-icon-weight_(width>=1.55em)_and_(width<1.65em)]:[--astryx-icon-weight-read:600] [@container_astryx-icon-weight_(width>=1.65em)_and_(width<2.1em)]:[--astryx-icon-weight-read:700]';

/**
 * A layer covering [from, to] is opaque when `from <= weight <= to`:
 * `clamp(0, min(snapped - (from - 100), (to + 100) - snapped) / 100, 1)`.
 * Weights are multiples of 100, so the result is exactly 0 or 1. These are
 * every contiguous range of the five weights. The text is literal because the
 * build reads class names from the source and never expands a template.
 */
export const weightRangeClassNames = {
  r300_300:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_200,400_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r300_400:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_200,500_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r300_500:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_200,600_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r300_600:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_200,700_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r300_700:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_200,800_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r400_400:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_300,500_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r400_500:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_300,600_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r400_600:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_300,700_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r400_700:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_300,800_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r500_500:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_400,600_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r500_600:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_400,700_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r500_700:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_400,800_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r600_600:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_500,700_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r600_700:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_500,800_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
  r700_700:
    '[opacity:clamp(0,min(var(--astryx-icon-weight-snapped)_-_600,800_-_var(--astryx-icon-weight-snapped))_/_100,1)]',
} as const;
