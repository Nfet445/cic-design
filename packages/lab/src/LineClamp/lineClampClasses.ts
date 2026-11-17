// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file lineClampClasses.ts
 * @input Accepts nothing: every class is fixed
 * @output The utility class string the clamped box carries
 * @position Style primitives; the Tailwind build scans it for class names
 *
 * `clip`, not `hidden`: both clip the same way visually, but `hidden` makes
 * the box a scroll container, so a browser bringing a focused descendant into
 * view scrolls it, which, against a clamped box, means focusing a clipped link
 * replaces the visible line with the hidden one out from under the reader.
 * `clip` clips without becoming scrollable, so that scroll-into-view path never
 * triggers.
 */

export const lineClampClassName =
  '[display:-webkit-box] [-webkit-box-orient:vertical] overflow-clip break-words [word-break:break-word]';
