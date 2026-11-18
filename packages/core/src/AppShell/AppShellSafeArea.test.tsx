// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file AppShellSafeArea.test.tsx
 * @input vitest (jsdom), React Testing Library, AppShell.
 * @output Checks the safe-area declarations. The header and the sidenav-only
 *   top bar pad their items by the top and side insets. Under a banner, the
 *   top bar takes only the sides. Main's block end is `contentPadding` plus
 *   the bottom inset.
 * @position Testing for AppShell.tsx. jsdom drops `env()` values, so the test
 *   reads the class text that states them.
 */

import {render, screen} from '@testing-library/react';
import {classesOf} from '../__tests__/classNameAssertions';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {AppShell} from './AppShell';
import {SideNav} from '../SideNav/SideNav';
import {SideNavItem} from '../SideNav/SideNavItem';
import {SideNavSection} from '../SideNav/SideNavSection';

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
    const mainClasses = classesOf(screen.getByRole('main'));
    // The padding reads the inset main publishes for `contentPadding`, so a
    // bleed child subtracts only the content padding, and adds the bottom
    // safe-area inset itself. The self-qualifier repeats LayoutContent's own
    // theme class, so this padding wins by specificity, not sheet order.
    expect(mainClasses).toContain(
      `[&.astryx-layout-content]:[padding-block-end:${MAIN_END}]`,
    );
  });

  it('adds the bottom inset to the content padding, and publishes the content padding alone', () => {
    render(
      <AppShell topNav={<div>Nav</div>} contentPadding={6}>
        <div>Content</div>
      </AppShell>,
    );
    const mainClasses = classesOf(screen.getByRole('main'));
    expect(mainClasses).toContain(
      `[&.astryx-layout-content]:[padding-block-end:${MAIN_END}]`,
    );
    // `contentPadding` reaches main as LayoutContent's own padding classes.
    expect(
      mainClasses.some(
        name =>
          name.startsWith('pb-6') || name.includes('padding-block-end:var('),
      ),
    ).toBe(true);
  });
});
