// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tabBarClasses.ts
 * @input Accepts nothing: every class is fixed; the per-instance geometry
 *   (inset, capsule size, column, box, label, lens offset, badge) arrives as
 *   private `--astryx-tab-bar-*` variables the markup sets inline
 * @output The utility class strings the bar, its capsule, an item, the lens,
 *   its copy and the badges carry
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * A tab's look is one of three complete colour classes. Two classes setting
 * `color` would be ordered by the sheet, not by the class attribute.
 */

import {tw} from '../tw';

export const tabBarRootClassName = tw(
  'fixed inset-x-0 bottom-0 isolate flex justify-center box-border',
  // No page-level stacking rank: the lens and the badges order inside the
  // bar's own stacking context.
  'pointer-events-none',
);

export const tabBarRootInsetClassName =
  '[padding-inline:var(--astryx-tab-bar-root-inset)] [padding-bottom:var(--astryx-tab-bar-root-inset)]';

export const tabBarCapsuleClassName = tw(
  'relative grow min-w-0 pointer-events-auto',
  '[container-type:inline-size]',
  'rounded-full',
  'bg-[color:color-mix(in_srgb,var(--color-background-popover)_78%,transparent)]',
  '[backdrop-filter:blur(16px)_saturate(180%)] shadow-md',
  '[touch-action:manipulation] [-webkit-tap-highlight-color:transparent]',
);

export const tabBarCapsuleSizeClassName = tw(
  'h-[var(--astryx-tab-bar-capsule-height)]',
  'max-w-[var(--astryx-tab-bar-capsule-max-width)]',
);

export const tabBarItemClassName = tw(
  'absolute inset-y-0 m-0 p-0 [border-width:0] bg-transparent',
  'text-[color:var(--color-text-primary)] font-[inherit]',
  'cursor-pointer disabled:cursor-default aria-disabled:cursor-default',
  'outline-none [-webkit-tap-highlight-color:transparent]',
);

/** The button spans to halfway to its neighbours, so a press finds it. */
export const tabBarColumnClassName = tw(
  '[inset-inline-start:var(--astryx-tab-bar-column-start)]',
  'w-[var(--astryx-tab-bar-column-width)]',
);

/** Keyboard focus on the button paints the ring around its item box. */
export const tabBarItemBoxClassName = tw(
  'absolute block rounded-full',
  'astryx-tab-feedback',
  '[outline-width:var(--focus-outline-width)]',
  '[outline-color:var(--focus-outline-color)]',
  '[outline-offset:var(--focus-outline-offset)]',
);

export const tabBarBoxClassName = tw(
  '[inset-inline-start:var(--astryx-tab-bar-box-start)]',
  'top-[var(--astryx-tab-bar-box-top)]',
  'w-[var(--astryx-tab-bar-box-width)]',
  'h-[var(--astryx-tab-bar-box-height)]',
);

export const tabBarIconClassName = 'absolute flex items-center justify-center';

export const tabBarLabelClassName = tw(
  'absolute inset-x-0 overflow-hidden text-center text-ellipsis whitespace-nowrap',
  'font-[family-name:var(--font-family-body)] font-medium',
);

export const tabBarLabelGeometryClassName = tw(
  'top-[var(--astryx-tab-bar-label-top)]',
  'h-[var(--astryx-tab-bar-label-height)]',
  'text-[length:var(--astryx-tab-bar-label-size)]',
  '[line-height:var(--astryx-tab-bar-label-height)]',
);

export const tabBarLabelSelectedClassName = 'font-semibold';

export const tabBarLensClassName = tw(
  'absolute pointer-events-none [transition-property:translate]',
  'duration-[var(--duration-medium)] ease-out',
  // Under a finger the animator moves it (useTabBarLens.ts); under Reduce
  // Motion a touch screen cross-fades it there and a mouse jumps.
  '[@media(pointer:coarse)]:duration-[0s]',
  '[@media(prefers-reduced-motion:reduce)_and_(pointer:coarse)]:duration-[0s]',
  '[@media(prefers-reduced-motion:reduce)_and_(not_(pointer:coarse))]:duration-[0s]',
);

/** At rest the lens is the pill under the selected item. */
export const tabBarLensUnderClassName = 'z-[-1]';

/** The lens's resting place, mirrored in a right-to-left layout. */
export const tabBarLensRestClassName = tw(
  '[translate:var(--astryx-tab-bar-lens-offset)_0]',
  'rtl:[translate:calc(-1*var(--astryx-tab-bar-lens-offset))_0]',
);

/**
 * The lifted lens's shadow and rim live in `::before`, outside the clip: the
 * animator fades them in.
 */
export const tabBarLensBodyClassName = tw(
  'absolute inset-0',
  "before:content-[''] before:absolute before:inset-0 before:rounded-full",
  'before:shadow-md before:opacity-0',
  'before:[will-change:var(--astryx-motion-will-change-before,auto)]',
);

export const tabBarLensClipClassName = tw(
  'absolute inset-0 overflow-hidden rounded-full',
  // Opaque: while it slides it hides the plain items under the copy.
  'bg-[color:color-mix(in_srgb,var(--color-text-primary)_9%,var(--color-background-popover))]',
  "before:content-[''] before:absolute before:inset-0 before:rounded-full",
  'before:bg-[color:var(--color-background-popover)]',
  'before:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-text-primary)_10%,transparent)]',
  'before:opacity-0',
  'before:[will-change:var(--astryx-motion-will-change-before,auto)]',
);

export const tabBarCopyInnerClassName = 'absolute inset-0';

/** Mounted only while the lens slides under a finger: no transition of its own. */
export const tabBarCopyOuterClassName = 'absolute w-[100cqw]';

export const tabBarCopyOuterGeometryClassName = tw(
  '[inset-inline-start:calc(-1*var(--astryx-tab-bar-inset))]',
  'top-[calc(-1*var(--astryx-tab-bar-inset))]',
  'h-[var(--astryx-tab-bar-capsule-height)]',
);

export const tabBarCopyRestClassName = tw(
  '[translate:calc(-1*var(--astryx-tab-bar-lens-offset))_0]',
  'rtl:[translate:var(--astryx-tab-bar-lens-offset)_0]',
);

export const tabBarCopyItemClassName =
  'absolute text-[color:var(--color-accent)]';

/** The selected tab's own look at rest: the copy's accent. */
export const tabBarItemSelectedLookClassName =
  'text-[color:var(--color-accent)]';

export const tabBarItemDisabledClassName =
  'text-[color:var(--color-text-disabled)]';

export const tabBarBadgesClassName = 'absolute inset-0 pointer-events-none';

export const tabBarBadgeClassName = tw(
  'absolute flex items-center justify-center box-border whitespace-nowrap',
  'font-[family-name:var(--font-family-body)] font-medium',
  '[font-variant-numeric:tabular-nums]',
  'bg-[color:var(--color-error)] text-[color:var(--color-on-error)]',
);

export const tabBarBadgeGeometryClassName = tw(
  '[inset-inline-start:var(--astryx-tab-bar-badge-start)]',
  'top-[var(--astryx-tab-bar-badge-top)]',
  'h-[var(--astryx-tab-bar-badge-height)]',
  'min-w-[var(--astryx-tab-bar-badge-height)]',
  '[padding-inline:var(--astryx-tab-bar-badge-padding-inline)]',
  'rounded-[calc(var(--astryx-tab-bar-badge-height)/2)]',
  'text-[length:var(--astryx-tab-bar-badge-font-size)]',
  '[line-height:var(--astryx-tab-bar-badge-height)]',
);
