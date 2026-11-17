// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file skeletonClasses.ts
 * @input Nothing — literal Tailwind class strings
 * @output Skeleton's class map: root, pulse, radius, and the vars it reads
 * @position Static styling for Skeleton.tsx; scanned by
 *   `tailwind/astryx.input.css` to build `astryx-tailwind.css`
 */

export const skeletonClassName =
  'bg-[var(--color-skeleton)] opacity-[0.25] ' +
  'contrast-more:bg-[color-mix(in_srgb,var(--color-skeleton),var(--color-text-primary)_30%)] ' +
  'forced-colors:bg-[GrayText] forced-colors:opacity-[1]';

/**
 * The pulse. The keyframes live in `tailwind/astryx.input.css` (the build
 * reads only `*Classes.ts`), and a class spells the whole animation shorthand
 * literally — an interpolated one emits nothing.
 *
 * The duration reads the tempo var before a theme scales it; reduced motion
 * drops the pulse and leaves the static placeholder.
 */
export const skeletonAnimateClassName =
  'animate-[astryxSkeletonFade_var(--_astryx-pre-tempo-duration-medium-max,var(--duration-medium-max))_linear_infinite_alternate] ' +
  'motion-reduce:animate-none';

export const skeletonDelayClassName =
  '[animation-delay:var(--_skeleton-delay)]';

export const skeletonDimensionsClassName =
  'w-[var(--_skeleton-width)] h-[var(--_skeleton-height)]';

export const skeletonRadiusClassName = {
  // Numeric scale names (preferred)
  none: 'rounded-[0px]',
  0: 'rounded-[var(--radius-none)]',
  1: 'rounded-[var(--radius-inner)]',
  2: 'rounded-[var(--radius-element)]',
  3: 'rounded-[var(--radius-container)]',
  4: 'rounded-[var(--radius-container)]',
  rounded: 'rounded-[var(--radius-full)]',
} as const;
