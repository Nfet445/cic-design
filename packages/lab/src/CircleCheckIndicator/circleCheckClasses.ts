// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file circleCheckClasses.ts
 * @input The indicator's size and state; `circleCheckConsts`, the build-time
 *   mirror of circleCheck.table.ts
 * @output The utility class strings the circle, its checkmark and its partial
 *   bar carry, and the consts the table test holds to UIKit's measurements
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * The ring is an inset shadow, not a border: engines snap a border to whole
 * device pixels, so 1.54px would draw at 1.33px on a 3× screen.
 *
 * The hover tint and the press read `data-astryx-indicator-scope`, which the
 * owning control puts on its row. Tailwind scans class text, so the attribute
 * name is spelled here; core's privateAttributes/indicatorScope.stylex.ts owns
 * it. The same holds for `data-astryx-indicator-press`, which marks a circle as
 * painting its own press.
 */

/* eslint-disable @astryx/no-raw-private-attribute -- the class text and the attribute are the only way to reach a row's scope from this package */

import {tw} from '../tw';

/**
 * `md` is UIKit's circle at the Large text size, and `sm` at xSmall. Two `sm`
 * values derive from their Large proportions: the check stroke and its offset.
 * The partial state's bar has no UIKit counterpart, so it takes the
 * checkmark's width and stroke.
 */
export const circleCheckConsts = {
  /** `circleCheckTable.large.diameter`. */
  mdDiameter: '21.8px',
  /** `circleCheckTable.large.stroke`. */
  mdStroke: '1.54px',
  /** `circleCheckTable.large.checkSize`. */
  mdCheckSize: '9px',
  /** `circleCheckTable.large.checkStroke`. */
  mdCheckStroke: '1.35px',
  /** `circleCheckTable.large.checkOffsetY`. */
  mdCheckOffsetY: '1px',
  /** `circleCheckTable.xSmall.diameter`. */
  smDiameter: '18px',
  /** `circleCheckTable.xSmall.stroke`. */
  smStroke: '1.27px',
  /** `circleCheckTable.xSmall.checkSize`. */
  smCheckSize: '8px',
  /** Derived: the Large check stroke, scaled by the check size (9 → 8). */
  smCheckStroke: '1.2px',
  /** Derived: the Large offset, scaled by the diameter (21.8 → 18). */
  smCheckOffsetY: '0.83px',
} as const;

export type CircleCheckSize = 'sm' | 'md';

/** Marks the circle as painting its own press, so the host leaves its off. */
export const circleCheckPressProps: Readonly<Record<string, string>> = {
  'data-astryx-indicator-press': '',
};

// The numbers repeat `circleCheckConsts` as class text: Tailwind reads
// literals, and a template would never emit. circleCheck.test.tsx holds the
// two together.
const circleSizeClasses: Record<CircleCheckSize, string> = {
  sm: 'w-[18px] h-[18px] [--_circle-stroke:1.27px]',
  md: 'w-[21.8px] h-[21.8px] [--_circle-stroke:1.54px]',
};

const checkSizeClasses: Record<CircleCheckSize, string> = {
  sm: 'w-2 h-2 [translate:0_0.83px]',
  md: 'w-[9px] h-[9px] [translate:0_1px]',
};

const barSizeClasses: Record<CircleCheckSize, string> = {
  sm: 'w-2 h-[1.2px]',
  md: 'w-[9px] h-[1.35px]',
};

const CIRCLE_CLASSNAME = tw(
  'box-border flex items-center justify-center shrink-0',
  'rounded-[var(--radius-full)]',
  'border-0 border-transparent',
  // Forced colors drops the inset-shadow ring, so a system-coloured border
  // draws it there.
  'forced-colors:[border-style:solid] forced-colors:[border-width:1px]',
  'forced-colors:[border-color:CanvasText]',
  'transition-[background-color,box-shadow]',
  'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
);

/**
 * The empty circle is a ring with a clear centre, as UIKit's is. A selected
 * edit-mode row keeps its background behind the mark.
 */
const UNCHECKED_CLASSNAME = tw(
  'bg-transparent',
  '[box-shadow:inset_0_0_0_var(--_circle-stroke)_var(--color-border-emphasized)]',
  '[@media(hover:hover)]:[[data-astryx-indicator-scope]:hover_&]:[box-shadow:inset_0_0_0_var(--_circle-stroke)_color-mix(in_srgb,var(--color-border-emphasized),var(--color-tint-hover)_20%)]',
);

/** An inherit-shade loading spinner reads this colour as currentColor. */
const CHECKED_CLASSNAME = tw(
  'bg-[var(--color-accent)]',
  'text-[var(--color-on-accent)]',
  '[box-shadow:none]',
  '[@media(hover:hover)]:[[data-astryx-indicator-scope]:hover_&]:bg-[color:color-mix(in_srgb,var(--color-accent),var(--color-tint-hover)_15%)]',
);

/**
 * The press paints on the circle itself: the host's rounded-square layer would
 * tint past a circle, so it leaves that layer off over a circle that marks
 * itself. A press the controller paints arrives as `--_indicator-press-image`,
 * which only a CheckboxInput row declares. While it paints, the row hands down
 * `--_indicator-active-press` as transparent, so a menu row's own press never
 * paints twice.
 */
const OWN_PRESS_CLASSNAME = tw(
  'relative',
  "after:content-[''] after:absolute after:inset-0 after:pointer-events-none",
  'after:rounded-[var(--radius-full)] after:bg-transparent',
  'pointer-fine:[[data-astryx-indicator-scope]:active_&]:after:bg-[color:var(--_indicator-active-press,var(--color-overlay-pressed))]',
  'after:[background-image:var(--_indicator-press-image,none)]',
);

export interface CircleClassNameOptions {
  size: CircleCheckSize;
  /** Checked and partial both fill the circle. */
  isFilled: boolean;
  isDisabled: boolean;
}

/** The circle: its size, its ring or fill, its press, and its disabled fade. */
export function circleClassName({
  size,
  isFilled,
  isDisabled,
}: CircleClassNameOptions): string {
  return tw(
    CIRCLE_CLASSNAME,
    circleSizeClasses[size],
    isFilled ? CHECKED_CLASSNAME : UNCHECKED_CLASSNAME,
    !isDisabled && OWN_PRESS_CLASSNAME,
    isDisabled && 'opacity-50',
  );
}

/**
 * The check glyph. Under forced colors the circle paints flat and the SVG
 * stroke stays on currentColor, which is that flat colour, so the stroke moves
 * to CanvasText — a check on a Canvas circle (WCAG 1.4.11).
 */
export function circleCheckmarkClassName({
  size,
  isVisible,
}: {
  size: CircleCheckSize;
  isVisible: boolean;
}): string {
  return tw(
    isVisible ? 'block' : 'hidden',
    'shrink-0 overflow-visible',
    checkSizeClasses[size],
    'text-[var(--color-on-accent)] forced-colors:text-[color:CanvasText]',
  );
}

/** The partial-state bar: the checkmark's width and its stroke. */
export function circleBarClassName({
  size,
  isVisible,
}: {
  size: CircleCheckSize;
  isVisible: boolean;
}): string {
  return tw(
    isVisible ? 'block' : 'hidden',
    'shrink-0',
    barSizeClasses[size],
    'rounded-[var(--radius-full)]',
    'bg-[var(--color-on-accent)] forced-colors:bg-[color:CanvasText]',
  );
}
