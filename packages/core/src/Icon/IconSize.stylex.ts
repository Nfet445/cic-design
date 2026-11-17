// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file IconSize.stylex.ts
 * @input Reads the `icon` target's private `--_icon-width` /
 *   `--_icon-height` vars
 * @output The StyleX view of Icon sizing, plus the class map the icon box
 *   lookups moved to
 * @position Compatibility shim; Icon's own classes live in `./iconClasses` and
 *   the scale lives in `./IconSize`
 *
 * @deprecated Import `./iconClasses` for Icon's classes and `./IconSize` for
 * the scale. The styles below disappear with the last importer of the
 * subpath.
 *
 * SYNC: When the private vars change, update derivedVarRegistry.ts and the
 * `theming.vars` / `theming.derived` entries in Icon.doc.mjs.
 */

import * as stylex from '@stylexjs/stylex';

import {iconBoxClassName} from './iconBoxClasses';

export type {IconSize} from './IconSize';

/*
 * A theme writes `width`/`height` on the `icon` target's size selector
 * (`components.icon['size:sm']`), and the derived-var registry emits them as
 * `--_icon-width` / `--_icon-height` instead of as competing properties, so
 * `iconSizeStyles` reads those vars with each size's own rem value as the
 * fallback. `iconClasses.ts` reads the same vars for Icon itself.
 *
 * A `.stylex` module cannot import the scale in `./IconSize`, so the rem values
 * below repeat `iconSizeValues`; they go with this module.
 */

/** @deprecated Import `iconGlyphClassName` from `./iconClasses` instead. */
export const iconSizeStyles = stylex.create({
  xsm: {
    width: 'var(--_icon-width, 0.75rem)',
    height: 'var(--_icon-height, 0.75rem)',
  },
  sm: {
    width: 'var(--_icon-width, 1rem)',
    height: 'var(--_icon-height, 1rem)',
  },
  md: {
    width: 'var(--_icon-width, 1.25rem)',
    height: 'var(--_icon-height, 1.25rem)',
  },
  lg: {
    width: 'var(--_icon-width, 1.5rem)',
    height: 'var(--_icon-height, 1.5rem)',
  },
});

/**
 * The same lookup, now holding Tailwind class strings.
 *
 * @deprecated Pass `iconBoxClassName[size]` to `className` or `tw`. This name
 * stays so the subpath keeps resolving; it is not a StyleX style.
 */
export const iconBoxSizeStyles = iconBoxClassName;
