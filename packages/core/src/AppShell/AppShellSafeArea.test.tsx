// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AppShellSafeArea.test.tsx
 * @input vitest (jsdom), React Testing Library, AppShell, and the CSS rules
 *   that StyleX injects.
 * @output Checks the safe-area declarations. The header and the sidenav-only
 *   top bar pad their items by the top and side insets. Under a banner, the
 *   top bar takes only the sides. Main's block end is `contentPadding` plus
 *   the bottom inset.
 * @position Testing for AppShell.tsx. jsdom drops `env()` values, so the test
 *   reads the rules that StyleX passes to `insertRule`.
 */

import {render, screen} from '@testing-library/react';
import {classesOf} from '../__tests__/classNameAssertions';
import {beforeEach, describe, expect, it, vi} from 'vitest';

/** Every rule StyleX inserted, as the raw text it handed to `insertRule`. */
const rawRules: string[] = [];

const insertRule = CSSStyleSheet.prototype.insertRule;
CSSStyleSheet.prototype.insertRule = function (
  this: CSSStyleSheet,
  rule: string,
  index?: number,
) {
  rawRules.push(rule);
  return insertRule.call(this, rule, index);
};
// StyleX injects when the styles are created: load AppShell after the
// recorder is in place. The file loads them before any test runs, so no
// hook's time limit covers the load.
vi.resetModules();
const {AppShell} = await import('./AppShell');
const {SideNav} = await import('../SideNav/SideNav');
const {SideNavItem} = await import('../SideNav/SideNavItem');
const {SideNavSection} = await import('../SideNav/SideNavSection');

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => {
  stubMatchMedia(false);
});

/**
 * The declarations `el`'s classes make, by property. A StyleX class names a
 * raw inserted rule; a Tailwind arbitrary-property class names its own
 * declaration in its class text, because jsdom never loads the compiled
 * sheet. The layout content publishes its insets the second way.
 */
function rawDeclarations(el: Element, pseudo = ''): Map<string, string> {
  const declarations = new Map<string, string>();
  for (const className of Array.from(el.classList)) {
    const arbitrary = /^\[(--[\w-]+):(.+)\]$/.exec(className);
    if (arbitrary != null && pseudo === '') {
      declarations.set(arbitrary[1], arbitrary[2].replace(/_/g, ' '));
      continue;
    }
    if (className === 'box-border' && pseudo === '') {
      declarations.set('box-sizing', 'border-box');
      continue;
    }
    // A utility class is not a selector here: its `[` and `(` would become
    // regex syntax, and it never had a StyleX rule.
    if (className.includes('[')) {
      continue;
    }
    for (const rule of rawRules) {
      const match = new RegExp(
        `^\\.${className}(?::not\\(#\\\\#\\))*${pseudo}\\{([^}]*)\\}$`,
      ).exec(rule);
      if (match == null) {
        continue;
      }
      for (const declaration of match[1].split(';')) {
        const colon = declaration.indexOf(':');
        if (colon > 0) {
          // StyleX minifies values: compare without whitespace.
          declarations.set(
            declaration.slice(0, colon).trim(),
            declaration.slice(colon + 1).replace(/\s+/g, ''),
          );
        }
      }
    }
  }
  return declarations;
}

describe('AppShell safe area', () => {
  it('pads the header by the top and side insets', () => {
    render(
      <AppShell topNav={<div>Nav</div>}>
        <div>Content</div>
      </AppShell>,
    );
    const classes = classesOf(screen.getByRole('banner'));
    expect(classes).toContain('pt-[env(safe-area-inset-top,0px)]');
    // Left-to-right here; a right-to-left context swaps the sides.
    expect(classes).toContain('ps-[env(safe-area-inset-left,0px)]');
    expect(classes).toContain('pe-[env(safe-area-inset-right,0px)]');
  });

  it('pads the sidenav-only phone top bar the same way', () => {
    stubMatchMedia(true);
    render(
      <AppShell
        sideNav={
          <SideNav>
            <SideNavSection title="Main" isHeaderHidden>
              <SideNavItem label="Home" />
            </SideNavSection>
          </SideNav>
        }>
        <div>Content</div>
      </AppShell>,
    );
    const bar = screen.getByRole('banner');
    expect(classesOf(bar)).toContain('pt-[env(safe-area-inset-top,0px)]');
  });

  it('pads a sidenav-only phone top bar under a banner by the sides only', () => {
    stubMatchMedia(true);
    render(
      <AppShell
        banner={<div>Banner</div>}
        sideNav={
          <SideNav>
            <SideNavSection title="Main" isHeaderHidden>
              <SideNavItem label="Home" />
            </SideNavSection>
          </SideNav>
        }>
        <div>Content</div>
      </AppShell>,
    );
    // The banner's wrapper pads the top inset once; the top bar below it
    // would otherwise add a second band of the same height.
    const banner = screen.getByRole('banner');
    expect(classesOf(banner)).toContain('pt-[env(safe-area-inset-top,0px)]');
    const topBar = screen
      .getAllByRole('navigation')
      .map(nav => nav.closest('.astryx-app-shell-header'))
      .find(el => el != null && el !== banner) as HTMLElement;
    expect(topBar).toBeTruthy();
    const topBarClasses = classesOf(topBar);
    expect(topBarClasses).not.toContain('pt-[env(safe-area-inset-top,0px)]');
    expect(topBarClasses).toContain('ps-[env(safe-area-inset-left,0px)]');
  });

  it('sticks a phone top bar under a banner below the top inset in auto', () => {
    stubMatchMedia(true);
    const sideNav = (
      <SideNav>
        <SideNavSection title="Main" isHeaderHidden>
          <SideNavItem label="Home" />
        </SideNavSection>
      </SideNav>
    );
    const withBanner = render(
      <AppShell height="auto" banner={<div>Banner</div>} sideNav={sideNav}>
        <div>Content</div>
      </AppShell>,
    );
    const banner = screen.getByRole('banner');
    const topBar = screen
      .getAllByRole('navigation')
      .map(nav => nav.closest('.astryx-app-shell-header'))
      .find(el => el != null && el !== banner) as HTMLElement;
    expect(topBar).toBeTruthy();
    expect(classesOf(topBar)).toContain('sticky');
    expect(classesOf(topBar)).toContain('top-[env(safe-area-inset-top,0px)]');
    withBanner.unmount();
    // With no banner, the top bar is the header itself. It pads the top inset
    // and sticks at the top edge.
    render(
      <AppShell height="auto" sideNav={sideNav}>
        <div>Content</div>
      </AppShell>,
    );
    const barClasses = classesOf(screen.getByRole('banner'));
    expect(barClasses).toContain('pt-[env(safe-area-inset-top,0px)]');
    expect(barClasses.some(name => name.startsWith('top-[env('))).toBe(false);
  });

  // Main's block-end padding: the inset it publishes for `contentPadding`
  // plus the bottom safe-area inset (FR4).
  const MAIN_END =
    'calc(var(--container-padding-block-end,0px)+env(safe-area-inset-bottom,0px))';

  it('grows the main region’s block-end padding by the bottom inset', () => {
    render(
      <AppShell topNav={<div>Nav</div>}>
        <div>Content</div>
      </AppShell>,
    );
    const main = screen.getByRole('main');
    const declarations = rawDeclarations(main);
    // No content padding: the published inset is the block-start padding's
    // zero, so the block-end padding is the bottom inset alone.
    const published = declarations.get('--container-padding-block-end');
    expect(published).toBeTruthy();
    // The inset main publishes is the block-start padding's value, so a bleed
    // child subtracts only the content padding.
    expect(published).toBe(declarations.get('--container-padding-block-start'));
    expect(published).not.toContain('env(');
    expect(declarations.get('padding-bottom')).toBe(MAIN_END);
    // Padding, not a spacer: main is border-box, so a child that fills it
    // ends above the inset instead of overflowing it.
    expect(declarations.get('box-sizing')).toBe('border-box');
    expect(rawDeclarations(main, '::after').has('height')).toBe(false);
  });

  it('adds the bottom inset to the content padding, and publishes the content padding alone', () => {
    render(
      <AppShell topNav={<div>Nav</div>} contentPadding={6}>
        <div>Content</div>
      </AppShell>,
    );
    const declarations = rawDeclarations(screen.getByRole('main'));
    expect(declarations.get('padding-bottom')).toBe(MAIN_END);
    // The published inset is `contentPadding` alone, the block-start
    // padding's value, so a bleed child subtracts only `contentPadding`.
    const published = declarations.get('--container-padding-block-end');
    expect(published).toBeTruthy();
    expect(published).toBe(declarations.get('--container-padding-block-start'));
    expect(published).not.toContain('env(');
  });
});
