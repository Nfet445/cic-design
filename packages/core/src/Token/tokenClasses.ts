// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tokenClasses.ts
 * @input A token's size, color, disabled state and label visibility
 * @output Utility class strings for the token surface, its label, its
 *   invisible action control and its remove button
 * @position Style primitives; scanned by the Tailwind build
 *
 * The pressed background stays a StyleX input (`interactionOverlayStyles`):
 * it is the shared press machine, not this component's paint. Everything a
 * theme reads by name — surface, text, size — is a class here.
 */

import {tw} from '../utils/tw';

export type TokenColorName =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

export type TokenSizeName = 'sm' | 'md' | 'lg';

const baseClassName = tw(
  'inline-flex items-center gap-0.5 py-0 border-none max-w-full overflow-hidden',
  'rounded-[var(--radius-inner)]',
  '[font-family:inherit] [font-size:var(--text-supporting-size)] [line-height:var(--text-supporting-leading)] [font-weight:var(--font-weight-medium)]',
  'whitespace-nowrap no-underline',
);

const sizeClassName: Record<TokenSizeName, string> = {
  sm: tw(
    '[height:calc(var(--size-element-sm)_-_8px)] px-2',
    '[font-size:var(--text-supporting-size)]',
  ),
  md: '[height:calc(var(--size-element-md)_-_8px)] px-2',
  lg: '[height:calc(var(--size-element-lg)_-_8px)] px-2',
};

const colorClassName: Record<TokenColorName, string> = {
  default: 'bg-[var(--color-neutral)] text-[color:var(--color-text-primary)]',
  red: 'bg-[var(--color-background-red)] text-[color:var(--color-text-red)]',
  orange:
    'bg-[var(--color-background-orange)] text-[color:var(--color-text-orange)]',
  yellow:
    'bg-[var(--color-background-yellow)] text-[color:var(--color-text-yellow)]',
  green:
    'bg-[var(--color-background-green)] text-[color:var(--color-text-green)]',
  teal: 'bg-[var(--color-background-teal)] text-[color:var(--color-text-teal)]',
  cyan: 'bg-[var(--color-background-cyan)] text-[color:var(--color-text-cyan)]',
  blue: 'bg-[var(--color-background-blue)] text-[color:var(--color-text-blue)]',
  purple:
    'bg-[var(--color-background-purple)] text-[color:var(--color-text-purple)]',
  pink: 'bg-[var(--color-background-pink)] text-[color:var(--color-text-pink)]',
  gray: 'bg-[var(--color-background-gray)] text-[color:var(--color-text-gray)]',
};

const interactiveClassName = tw(
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'transition-[background-image] duration-[var(--duration-fast)] ease-[var(--ease-standard)]',
);

const disabledClassName = 'cursor-default opacity-50 pointer-events-none';

const labelClassName = tw(
  'overflow-hidden text-ellipsis whitespace-nowrap min-w-0',
  '[unicode-bidi:isolate]',
);

/** A label hidden from sight but still the control's name. */
const labelHiddenClassName = tw(
  'absolute size-px p-0 -m-px overflow-hidden border-0 whitespace-nowrap',
  '[clip-path:inset(50%)]',
);

/** The control that carries the token's action and its focus ring. */
const invisibleButtonClassName = tw(
  'cursor-[inherit] [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  'text-inherit outline-none overflow-hidden min-w-0',
);

const removeButtonClassName = tw(
  'inline-flex items-center justify-center relative',
  'p-0 -me-1 size-4 shrink-0 rounded-full text-inherit',
  'cursor-pointer [&:is(:disabled,[aria-disabled=true])]:cursor-default',
  // A 16px button is small for a finger; the pseudo-element widens the target
  // without changing the box.
  "after:absolute after:-inset-1 after:content-['']",
);

export interface TokenClassNameOptions {
  size: TokenSizeName;
  color: TokenColorName;
  isInteractive: boolean;
  isDisabled: boolean;
}

/** The token surface, without its pressed overlay or its focus ring. */
export function tokenClassName({
  size,
  color,
  isInteractive,
  isDisabled,
}: TokenClassNameOptions): string {
  return tw(
    baseClassName,
    sizeClassName[size],
    colorClassName[color],
    isInteractive && interactiveClassName,
    isDisabled && disabledClassName,
  );
}

export {
  invisibleButtonClassName as tokenInvisibleButtonClassName,
  labelClassName as tokenLabelClassName,
  labelHiddenClassName as tokenLabelHiddenClassName,
  removeButtonClassName as tokenRemoveButtonClassName,
};
