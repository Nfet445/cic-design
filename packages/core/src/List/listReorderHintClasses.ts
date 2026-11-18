// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file listReorderHintClasses.ts
 * @input Accepts whether the hint's button shows text
 * @output Utility class strings for the buttons of reorder mode's hint
 * @position Internal to List's reorder machinery; scanned by the Tailwind build
 *
 * A hint button is a glyph or Done: the hint's own text, with nothing of a
 * button's box, and the same size under every pointer. A finger's 44 px target
 * is the shared touch hit layer, which stops short of a neighbouring target.
 */

import {tw} from '../utils/tw';

const HINT_BUTTON = tw(
  'relative inline-flex items-center justify-center m-0 p-0 border-0',
  'rounded-[4px] bg-transparent text-inherit cursor-pointer',
  '[font-family:inherit] [font-size:inherit] [line-height:inherit]',
  '[&:is(:disabled,[aria-disabled=true])]:cursor-default',
);

/** Done sits in its own box, so its padding is the only room it takes. */
const HINT_DONE = '[padding-inline:var(--spacing-1)]';

export function listReorderHintButtonClassName({
  isText,
}: {
  readonly isText: boolean;
}): string {
  return tw(HINT_BUTTON, isText && HINT_DONE);
}
