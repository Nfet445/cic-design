// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file privateAttributes/overlayScope.stylex.ts
 * @input None
 * @output overlayScopeProps, the private attribute an overlay container puts on
 *   itself so a scrim can read the container's hover and focus
 * @position Owner module of the private overlay-scope attribute: the only file
 *   that writes its name. Overlay marks its container, and
 *   `Overlay/overlayClasses.ts` reads the mark in its class text. No package
 *   entry exports it.
 */

/**
 * The container an overlay's scrim watches. A scrim revealed by CSS names this
 * attribute in an ancestor variant, so one container drives the scrim of every
 * control inside it.
 */
export const overlayScopeProps: Readonly<Record<string, string>> = {
  'data-astryx-overlay-scope': '',
};
