// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file buttonClasses.ts
 * @input Button variant, size, elevation, and state inputs
 * @output Utility class strings for the Button family
 * @position Style primitives; scanned by the Tailwind build
 *
 * Keeps every class the Button emits in one module so the build has one place
 * to find them. Values stay token references, never computed pixels.
 */

import {tw} from '../utils/tw';
import type {ButtonSize, ButtonVariant} from './index';

const ELEVATION_CLASS: Record<string, string> = {
  none: 'shadow-none',
  low: 'shadow-[var(--shadow-low)]',
  medium: 'shadow-[var(--shadow-med)]',
  high: 'shadow-[var(--shadow-high)]',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-[max(var(--size-element-sm),1lh)]',
  md: 'h-[max(var(--size-element-md),1lh)]',
  lg: 'h-[max(var(--size-element-lg),1lh)]',
};

const ICON_ONLY_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-[var(--size-element-sm)]',
  md: 'h-[var(--size-element-md)]',
  lg: 'h-[var(--size-element-lg)]',
};

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--color-accent)] text-[var(--color-on-accent)]',
  secondary: 'bg-[var(--color-neutral)] text-[var(--color-text-primary)]',
  ghost: 'bg-transparent text-[var(--color-text-primary)]',
  destructive: tw(
    'bg-[var(--color-error)] text-[var(--color-on-error)]',
    // Forced colors discards the fill, so the destructive surface keeps its
    // shape through an edge instead.
    'forced-colors:border-[color:CanvasText]',
    'focus-visible:[outline-color:var(--color-error)]',
  ),
};

/** The four variants whose surface is a fill, not the page itself. */
const SOLID_VARIANTS: ReadonlySet<ButtonVariant> = new Set([
  'primary',
  'secondary',
  'destructive',
]);

export function isSolidVariant(variant: ButtonVariant): boolean {
  return SOLID_VARIANTS.has(variant);
}

export type ButtonClassNameOptions = {
  variant: ButtonVariant;
  size: ButtonSize;
  elevation: string;
  isIconOnly: boolean;
  isInactive: boolean;
  isTrulyDisabled: boolean;
  isGrouped: boolean;
  orientation: 'horizontal' | 'vertical';
};

/** Base, size, icon-only, and press affordances of the button box. */
/* eslint-disable @astryx/no-raw-private-attribute -- Tailwind scans class text,
   so the press attribute has to appear literally in a class name; the owner
   module cannot supply it through interpolation. */
export function buttonClassName({
  variant,
  size,
  elevation,
  isIconOnly,
  isInactive,
  isTrulyDisabled,
  isGrouped,
  orientation,
}: ButtonClassNameOptions): string {
  return tw(
    'relative inline-flex items-center justify-center',
    'gap-[var(--spacing-2)] py-[var(--spacing-2)] px-[var(--spacing-3)]',
    // A theme may retune the ring distance on buttons specifically.
    '[--button-focus-offset:var(--focus-outline-offset)]',
    'outline-offset-0 focus-visible:[outline-offset:var(--button-focus-offset)]',
    'border-0 border-solid',
    'rounded-[var(--_button-radius,var(--radius-element))]',
    '[font-family:inherit]',
    'text-[length:var(--text-label-size)] leading-[var(--text-label-leading)]',
    '[font-weight:var(--font-weight-medium)]',
    'whitespace-nowrap min-w-0 max-w-full',
    'cursor-pointer',
    // The press scale goes at once as the popup opens.
    '[--button-transition-property:background-image,background-color,color,opacity,transform]',
    '[&[aria-expanded=true][aria-haspopup]:not([aria-haspopup=false])]:[--button-transition-property:background-image,background-color,color,opacity]',
    'transition-[var(--button-transition-property)]',
    'duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
    // Under reduced motion nothing scales; the overlay alone shows the press.
    'motion-reduce:duration-0 motion-reduce:[--button-press-scale:1]',
    'motion-reduce:[--button-tracked-press-scale:1]',
    isIconOnly ? ICON_ONLY_SIZE_CLASS[size] : SIZE_CLASS[size],
    isIconOnly &&
      tw(
        '[--button-icon-only-aspect:1/1] aspect-[var(--button-icon-only-aspect)]',
        'p-0 shrink-0 max-w-none',
      ),
    // Standalone floating buttons only — a grouped button's elevation belongs
    // to its group, so the surface lifts as one unit.
    !isGrouped && ELEVATION_CLASS[elevation],
    VARIANT_CLASS[variant],
    isGrouped &&
      (orientation === 'horizontal'
        ? groupedHorizontalClassName(variant)
        : groupedVerticalClassName(variant)),
    isInactive &&
      tw(
        'cursor-default [background-image:none] [transform:none]',
        '[&:active]:[transform:none]',
        '[&[data-astryx-press=on]]:[transform:none]',
        '[&:active]:[background-image:none]',
        '[&[data-astryx-press=on]]:[background-image:none]',
      ),
    isTrulyDisabled && 'opacity-50',
  );
}

/**
 * The press affordance. A pointer press paints on `:active`; a touch press is
 * written by the controller (or a group tracker) as the press attribute, which
 * survives a coarse pointer where `:active` is not a press.
 */
export function buttonPressClassName(): string {
  return tw(
    '[transform:scale(1)]',
    '[--button-press-scale:0.98]',
    'pointer-coarse:[--button-press-scale:1]',
    '[&:active:where(:not(:disabled,[aria-disabled=true],[aria-expanded=true][aria-haspopup]:not([aria-haspopup=false])))]:[transform:scale(var(--button-press-scale))]',
    '[&[data-astryx-press=on]:not([aria-expanded=true][aria-haspopup]:not([aria-haspopup=false]))]:[transform:scale(var(--button-press-scale))]',
  );
}

/** A tracked action's press is written by its group's tracker alone. */
export function buttonTrackedPressClassName(): string {
  return buttonPressClassName();
}

/** A tracked action's own `:active` image paints nothing. */
export function buttonTrackedOverlayClassName(): string {
  return '[&:active:not([data-astryx-press=on])]:[background-size:0_0]';
}
/* eslint-enable @astryx/no-raw-private-attribute */

export function buttonWidthClassName(): string {
  return 'w-[var(--astryx-button-width)]';
}

export const buttonWidthVar = '--astryx-button-width';

export function buttonContentClassName(): string {
  return tw(
    'flex grow shrink basis-auto self-stretch min-w-0',
    '[flex-direction:inherit] [flex-wrap:inherit] [align-items:inherit]',
    '[justify-content:inherit] gap-[inherit]',
  );
}

export const buttonIconWrapperClassName =
  'inline-flex items-center justify-center shrink-0';

export const buttonEndContentClassName =
  'inline-flex items-center [color:inherit]';

export const buttonLabelClassName = 'overflow-hidden text-ellipsis min-w-0';

export const buttonLinkClassName = 'no-underline';

/**
 * A solid variant's edge in forced colors. The base already sets
 * `border-solid`, so a group member only needs the width and colour on the
 * sides that face its neighbours. These variants separate themselves
 * from the page with a fill alone and have no border; forced colors discards
 * the fill, so an edge keeps the shape visible.
 */
export function buttonForcedColorsEdgeClassName({
  isSolid,
  isGrouped,
  orientation,
  isError,
}: {
  isSolid: boolean;
  isGrouped: boolean;
  orientation: 'horizontal' | 'vertical';
  isError: boolean;
}): string {
  if (!isSolid) {
    return '';
  }
  // Each branch is a literal: Tailwind reads class text, so an interpolated
  // token would emit nothing. A group draws its edge on the sides that run
  // along it; a destructive member draws it in CanvasText, which a later
  // ButtonText longhand would override.
  if (!isGrouped) {
    return isError
      ? 'forced-colors:border-[1px] forced-colors:border-solid forced-colors:border-[color:CanvasText]'
      : 'forced-colors:border-[1px] forced-colors:border-solid forced-colors:border-[color:ButtonText]';
  }
  if (orientation === 'horizontal') {
    return isError
      ? 'forced-colors:border-t-[1px] forced-colors:border-b-[1px] forced-colors:border-t-[color:CanvasText] forced-colors:border-b-[color:CanvasText]'
      : 'forced-colors:border-t-[1px] forced-colors:border-b-[1px] forced-colors:border-t-[color:ButtonText] forced-colors:border-b-[color:ButtonText]';
  }
  return isError
    ? 'forced-colors:border-s-[1px] forced-colors:border-e-[1px] forced-colors:border-s-[color:CanvasText] forced-colors:border-e-[color:CanvasText]'
    : 'forced-colors:border-s-[1px] forced-colors:border-e-[1px] forced-colors:border-s-[color:ButtonText] forced-colors:border-e-[color:ButtonText]';
}

/** The leading edge of a group is square; the trailing edge keeps the radius. */
function groupedHorizontalClassName(variant: ButtonVariant): string {
  return tw(
    // Leading corners square by default, trailing corners square by default:
    // only the first member rounds its leading edge and only the last its
    // trailing one.
    'rounded-ss-none rounded-es-none rounded-se-none rounded-ee-none',
    'first:rounded-ss-[var(--radius-element)] first:rounded-es-[var(--radius-element)]',
    '[&:nth-last-child(1_of_:not([popover]):not(template):not(dialog))]:rounded-se-[var(--radius-element)]',
    '[&:nth-last-child(1_of_:not([popover]):not(template):not(dialog))]:rounded-ee-[var(--radius-element)]',
    'border-s-[length:var(--border-width)] first:border-s-0',
    variant === 'primary'
      ? 'border-s-[color:var(--color-on-accent)]'
      : variant === 'destructive'
        ? 'border-s-[color:var(--color-on-error)]'
        : 'border-s-[color:var(--color-border)]',
  );
}

function groupedVerticalClassName(variant: ButtonVariant): string {
  return tw(
    'rounded-ss-none rounded-es-none rounded-se-none rounded-ee-none',
    'first:rounded-ss-[var(--radius-element)] first:rounded-se-[var(--radius-element)]',
    '[&:nth-last-child(1_of_:not([popover]):not(template):not(dialog))]:rounded-es-[var(--radius-element)]',
    '[&:nth-last-child(1_of_:not([popover]):not(template):not(dialog))]:rounded-ee-[var(--radius-element)]',
    'border-t-[length:var(--border-width)] first:border-t-0',
    variant === 'primary'
      ? 'border-t-[color:var(--color-on-accent)]'
      : variant === 'destructive'
        ? 'border-t-[color:var(--color-on-error)]'
        : 'border-t-[color:var(--color-border)]',
  );
}

/** Loading: the spinner reveal and the content hide, both delayed. */
export const buttonSpinnerOverlayClassName =
  'absolute inset-x-0 top-0 bottom-0 grid place-items-center';

export function buttonSpinnerDelayedClassName(): string {
  return tw(
    'animate-[astryxButtonSpinnerReveal_var(--duration-fast)_backwards]',
    '[animation-delay:var(--duration-medium-min)]',
    'motion-reduce:[animation-delay:0s]',
  );
}

export const buttonHiddenContentClassName = 'text-transparent';

export function buttonHiddenContentDelayedClassName(): string {
  return tw(
    'animate-[astryxButtonContentHide_1ms_forwards]',
    '[animation-delay:var(--duration-medium-min)]',
    'motion-reduce:[animation-delay:0s]',
  );
}
