// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file modalBackdrop.test.tsx
 * @input Dialog, Drawer, MobileNav and BottomSheet rendered open, and the
 *   literal class maps they render from
 * @output Every modal's `::backdrop` paints the theme's `--color-overlay` and
 *   none blurs the page, under any pointer. In forced colors, Dialog draws an
 *   edge, and Drawer and MobileNav keep their anchored-side border.
 * @position Cross-component regression test for the shared modal backdrop.
 *   jsdom has no top layer and drops `backdrop-filter`, so this test pins the
 *   classes those declarations come from; the built sheet proves each class
 *   has a rule, and a real browser resolves the colours in
 *   ModalBackdrop.a11y.browser.spec.ts.
 * SYNC: When a component gains a modal ::backdrop, add it here.
 */

import {readFileSync} from 'node:fs';
import {join} from 'node:path';

import {render} from '@testing-library/react';
import type {ReactElement} from 'react';
import {beforeAll, describe, expect, it} from 'vitest';

import {classesOf, stylesheetOf, type Stylesheet} from './classNameAssertions';

const {BottomSheet} = await import('../BottomSheet/BottomSheet');
const {Dialog} = await import('../Dialog/Dialog');
const {Drawer} = await import('../Drawer/Drawer');
const {MobileNav} = await import('../MobileNav/MobileNav');

const SHEET_PATH = join(__dirname, '../../dist/astryx-tailwind.css');

/** The built sheet, read once: the backdrop classes must have rules. */
function builtSheet(): Stylesheet {
  return stylesheetOf(readFileSync(SHEET_PATH, 'utf8'));
}

// jsdom does not implement showModal/close on <dialog>, and it applies
// `dialog:not([open]) {display: none}` to a dialog shown as a popover.
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
  const style = document.createElement('style');
  style.textContent = 'dialog:not([open]) {display: block}';
  document.head.appendChild(style);
});

/** Whether any class of `element` matches `pattern`. */
function anyClass(element: Element, pattern: RegExp): boolean {
  return classesOf(element).some(className => pattern.test(className));
}

/** The shorthand that would erase the focus ring's longhands. */
const OUTLINE_SHORTHAND = /^outline$|:outline$/;

const modals: ReadonlyArray<[string, () => ReactElement]> = [
  [
    'Dialog',
    () => (
      <Dialog isOpen onOpenChange={() => {}} aria-label="Title">
        Content
      </Dialog>
    ),
  ],
  [
    'Drawer',
    () => (
      <Drawer isOpen onOpenChange={() => {}} label="Details">
        Content
      </Drawer>
    ),
  ],
  [
    'MobileNav',
    () => (
      <MobileNav isOpen onOpenChange={() => {}}>
        Navigation
      </MobileNav>
    ),
  ],
  [
    'BottomSheet',
    () => (
      <BottomSheet isOpen onOpenChange={() => {}} label="Filters">
        Content
      </BottomSheet>
    ),
  ],
];

/** The modal's visible surface: the dialog, or MobileNav's drawer panel. */
function surfaceOf(name: string, dialog: Element): Element {
  // MobileNav's dialog is a transparent full-viewport container; its drawer
  // panel (the focus target, tabIndex -1) is what the person sees.
  return name === 'MobileNav'
    ? (dialog.querySelector('[tabindex="-1"]') ?? dialog)
    : dialog;
}

describe('modal backdrop', () => {
  it.each(modals)(
    '%s keeps the theme’s overlay colour under every pointer',
    (_name, element) => {
      render(element());
      const dialog = document.querySelector('dialog');
      expect(dialog).not.toBeNull();
      const sheet = builtSheet();
      expect(classesOf(dialog!)).toContain(
        'backdrop:bg-[var(--color-overlay)]',
      );
      expect(
        sheet.hasRule('backdrop:bg-[var(--color-overlay)]'),
        'the overlay class has no rule in the built sheet',
      ).toBe(true);
      // No colour change under a finger.
      expect(anyClass(dialog!, /pointer-coarse:.*backdrop:bg-/)).toBe(false);
    },
  );

  it.each(modals)(
    '%s does not blur the page under any pointer',
    (_name, element) => {
      render(element());
      const dialog = document.querySelector('dialog');
      expect(dialog).not.toBeNull();
      expect(anyClass(dialog!, /backdrop-filter/)).toBe(false);
    },
  );

  it('Dialog draws a border in forced colors, where no blur sets it apart', () => {
    const [, element] = modals.find(([name]) => name === 'Dialog')!;
    render(element());
    const dialog = document.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(classesOf(dialog!)).toContain('forced-colors:border');
    expect(classesOf(dialog!)).toContain(
      'forced-colors:[border-color:CanvasText]',
    );
    const sheet = builtSheet();
    for (const className of [
      'forced-colors:border',
      'forced-colors:[border-color:CanvasText]',
    ]) {
      expect(sheet.hasRule(className), className).toBe(true);
    }
    // Not an outline: the focus ring owns the outline longhands. An `outline`
    // shorthand would erase the ring.
    expect(anyClass(dialog!, OUTLINE_SHORTHAND)).toBe(false);
  });

  it('a full-screen Dialog covers the page and draws no edge in forced colors', () => {
    render(
      <Dialog
        isOpen
        onOpenChange={() => {}}
        aria-label="Title"
        variant="fullscreen">
        Body
      </Dialog>,
    );
    const dialog = document.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(anyClass(dialog!, /forced-colors:border/)).toBe(false);
    expect(classesOf(dialog!)).toContain('border-0');
  });

  it.each(modals.filter(([name]) => name === 'Drawer' || name === 'MobileNav'))(
    '%s keeps its anchored-side border as the forced-colors edge, with no outline added',
    (name, element) => {
      render(element());
      const dialog = document.querySelector('dialog');
      expect(dialog).not.toBeNull();
      const surface = surfaceOf(name, dialog!);
      // The panel's side facing the page has a solid border, which forced
      // colors paint CanvasText: one 1px edge already, so no outline.
      expect(
        anyClass(surface, /^\[border-inline-(start|end)-style:solid\]$/),
        JSON.stringify(classesOf(surface)),
      ).toBe(true);
      expect(anyClass(surface, OUTLINE_SHORTHAND)).toBe(false);
    },
  );
});
