// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file breadcrumbsClasses.ts
 * @input None
 * @output The literal Tailwind classes of the Breadcrumbs trail
 * @position Class map; Breadcrumbs.tsx joins these with the consumer's
 *   `className`
 *
 * The trail is a `<nav>` holding an `<ol>`: the frame is a block, the list is
 * a wrapping row of separators and items. Every arm is a literal string, so
 * the build's class scanner sees it.
 */

/** The `<nav>` frame. */
export const breadcrumbsNavClassName = 'block';

/**
 * The `<ol>` row: items centre on one line and wrap when the trail is longer
 * than the container. `gap-1` is the spacing step's first value.
 */
export const breadcrumbsListClassName =
  'flex items-center flex-wrap list-none m-0 p-0 gap-1';
