// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file MobileNavEntryAnimation.test.tsx
 * @input Uses vitest, @testing-library/react, the TypeScript compiler API
 * @output Regression tests keeping the drawer's slide-in and scrim fade-in
 * @position Testing; guards the open path of MobileNav.tsx
 *
 * The drawer used to open with no animation at all while closing smoothly.
 *
 * The dialog is `display: none` until `isOpen`, so nothing inside it is
 * rendered while closed. React commits the open `display` and the open
 * `transform` in the same pass, which means the first frame the drawer is ever
 * rendered in already holds the open transform: a transition has no earlier
 * value to run from and the drawer simply appears. Closing looked fine because
 * both values exist by then — `display` stays in the transition with
 * `allow-discrete`, so the element is still rendered as the transform animates
 * out.
 *
 * `@starting-style` supplies that before-change style — the off-screen
 * transform for the drawer, transparent for the `::backdrop`.
 *
 * That alone is NOT enough, and the second half is the part that is easy to
 * undo by accident. The dialog used `overflow: hidden`, which makes it a
 * SCROLL CONTAINER. A scroll container in the top layer whose subtree holds
 * another scroller — here the drawer's own content area — does not paint a
 * `@starting-style` entry transition for its descendants in Chromium: the
 * transition ticks in the CSSOM (`getComputedStyle` interpolates perfectly)
 * while every painted frame shows the end value. Measuring the CSSOM says
 * "animating"; the screen says "snapped". `overflow: clip` clips the
 * off-screen drawer exactly as `hidden` did without creating a scroll
 * container, and the slide-in paints.
 *
 * Reproduced minimally: dialog `overflow: hidden` + a scrolling child inside
 * the drawer snaps; either one alone animates.
 *
 * Note on scope: jsdom has no top layer, no transitions, no `@starting-style`
 * evaluation and no compositor, so none of this is observable here. These
 * tests pin the three declarations the behaviour rests on. Verified in
 * Chromium by screencasting painted frames (not computed style) at both edges,
 * LTR and RTL: open and close each paint ~60-100 distinct intermediate
 * positions, and reduced motion collapses to a 10ms transition.
 */

import {describe, it, expect, beforeAll} from 'vitest';
import {render, screen} from '@testing-library/react';
import {classesOf} from '../__tests__/classNameAssertions';
import {MobileNav} from './MobileNav';

// jsdom doesn't implement showModal/close on <dialog>, so we mock them
beforeAll(() => {
  HTMLDialogElement.prototype.showModal =
    HTMLDialogElement.prototype.showModal ||
    function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    };
  HTMLDialogElement.prototype.close =
    HTMLDialogElement.prototype.close ||
    function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    };
});

function renderNav(isOpen: boolean, side?: 'start' | 'end') {
  render(
    <MobileNav
      isOpen={isOpen}
      onOpenChange={() => {}}
      side={side}
      data-testid="mobile-nav">
      <span>Nav content</span>
    </MobileNav>,
  );
  return screen.getByTestId('mobile-nav');
}

function drawerClasses(isOpen: boolean, side?: 'start' | 'end'): string[] {
  renderNav(isOpen, side);
  const drawer = screen
    .getByTestId('mobile-nav')
    .querySelector('[tabindex="-1"]');
  expect(drawer).not.toBeNull();
  return classesOf(drawer as Element);
}

describe('MobileNav scrim fades in', () => {
  it('gives the ::backdrop a transparent starting style', () => {
    // Without this the scrim is opaque in the frame the dialog enters the top
    // layer, so it has nothing to fade from and snaps in behind the drawer.
    expect(classesOf(renderNav(true))).toContain(
      '[@starting-style]:backdrop:opacity-0',
    );
  });
});

describe('MobileNav dialog does not become a scroll container', () => {
  it('clips the off-screen drawer with `clip`, not `hidden`', () => {
    // This is the half of the fix with no visible declaration of its own
    // purpose: `hidden` looks like a pure clipping choice and clips exactly as
    // well, so it is an easy "harmless tidy-up" to make. It is not harmless —
    // it makes the dialog a scroll container, and the entry animation then
    // ticks in the CSSOM without ever painting. See the file header.
    const classes = classesOf(renderNav(true));
    expect(classes).toContain('overflow-clip');
    expect(classes).not.toContain('overflow-hidden');
  });
});

describe.each([
  {
    side: 'start' as const,
    open: [
      '[transform:translateX(0)]',
      '[@starting-style]:[transform:translateX(-100%)]',
      '[@starting-style]:[&:dir(rtl)]:[transform:translateX(100%)]',
    ],
    closed: [
      '[transform:translateX(-100%)]',
      '[&:dir(rtl)]:[transform:translateX(100%)]',
    ],
  },
  {
    side: 'end' as const,
    open: [
      '[transform:translateX(0)]',
      '[@starting-style]:[transform:translateX(100%)]',
      '[@starting-style]:[&:dir(rtl)]:[transform:translateX(-100%)]',
    ],
    closed: [
      '[transform:translateX(100%)]',
      '[&:dir(rtl)]:[transform:translateX(-100%)]',
    ],
  },
])('MobileNav drawer slides in ($side)', ({side, open, closed}) => {
  it('opens to the on-screen transform', () => {
    expect(drawerClasses(true, side)).toContain('[transform:translateX(0)]');
  });

  it('starts off-screen so the open transform has something to run from', () => {
    // The whole point: the first rendered frame needs the closed transform.
    // Drop this and the drawer is simply there, fully open, on frame one —
    // while the close still animates, which is what made the bug look like a
    // missing entry animation rather than a missing starting style.
    const classes = drawerClasses(true, side);
    for (const className of open.slice(1)) {
      expect(classes).toContain(className);
    }
  });

  it('starts from the same edge the closed style parks it at', () => {
    const classes = drawerClasses(false, side);
    for (const className of closed) {
      expect(classes).toContain(className);
    }
  });
});
