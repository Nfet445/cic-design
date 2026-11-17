// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SideNav.slotPresence.test.tsx
 * @input SideNav, SideNavHeading, SideNavItem and SideNavSection slots
 * @output Proves each slot's presence follows the shared `isRenderable` check
 * @position Tests for `architecture:react-component-runtime` INV16 in SideNav
 *
 * An empty value (`null`, `false`, `''`) renders no slot wrapper, as an
 * omitted slot does. `0` is content: it renders inside the slot's wrapper,
 * never as a stray "0" beside it.
 */

import {beforeAll, describe, it, expect, vi} from 'vitest';
import {render} from '@testing-library/react';
import type {ReactNode} from 'react';
import {SideNav} from './SideNav';
import {SideNavHeading} from './SideNavHeading';
import {SideNavItem} from './SideNavItem';
import {SideNavSection} from './SideNavSection';
import {classesOf} from '../__tests__/classNameAssertions';
import {sideNavClassName} from './sideNavClasses';
import {sideNavHeadingClassName} from './sideNavHeadingClasses';
import {sideNavItemClassName} from './sideNavItemClasses';
import {SideNavCollapseContext} from './SideNavCollapseContext';
import {SideNavRenderContext} from './SideNavRenderContext';
import {AppShellMobileContext} from '../AppShell/AppShellMobileContext';

// jsdom does not implement showModal/close on <dialog>; the drawer uses them.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal ||= function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close ||= function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  };
});

const EMPTY_VALUES = [
  ['null', null],
  ['false', false],
  ['an empty string', ''],
] as const;

/** The element whose own text is exactly "0", if any. */
function zeroParent(root: Node): HTMLElement | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent === '0') {
      return node.parentElement;
    }
  }
  return null;
}

/** Whether an element carries every class of a class set. */
function carries(element: Element, classNames: string): boolean {
  const present = new Set(classesOf(element));
  return classNames.split(' ').every(name => present.has(name));
}

/** Whether the "0" sits inside an element carrying a class set. */
function zeroIsInside(classNames: string): boolean {
  for (let el = zeroParent(document.body); el; el = el.parentElement) {
    if (carries(el, classNames)) {
      return true;
    }
  }
  return false;
}

/** Every element carrying a class set. */
function slotsOf(classNames: string): Element[] {
  return Array.from(document.querySelectorAll('*')).filter(element =>
    carries(element, classNames),
  );
}

/** Whether the "0" itself carries every one of `tokens` as a whole class. */
function zeroCarries(...tokens: ReadonlyArray<string>): boolean {
  const parent = zeroParent(document.body);
  if (!parent) {
    return false;
  }
  const set = new Set(classesOf(parent));
  return tokens.every(token => set.has(token));
}

/** The class tokens of the section's end-content slot. */
const SECTION_END_CONTENT = ['shrink-0', 'flex', 'items-center'] as const;

const COLLAPSED = {isCollapsed: true, toggle: () => {}, isCollapsible: true};

const OPEN_MOBILE_NAV = {
  isMobile: true,
  isMobileNavOpen: true,
  toggleMobileNav: vi.fn(),
  openMobileNav: vi.fn(),
  closeMobileNav: vi.fn(),
  isMobileNavEnabled: true,
  hasAutoToggle: true,
};

function Collapsed({children}: {children: ReactNode}) {
  return (
    <SideNavCollapseContext value={COLLAPSED}>
      {children}
    </SideNavCollapseContext>
  );
}

function InDrawer({children}: {children: ReactNode}) {
  return (
    <AppShellMobileContext value={OPEN_MOBILE_NAV}>
      <SideNavRenderContext value="drawer">{children}</SideNavRenderContext>
    </AppShellMobileContext>
  );
}

describe('SideNav slots follow isRenderable', () => {
  const renderModes: ReadonlyArray<[string, (node: ReactNode) => ReactNode]> = [
    ['the default sidebar', (node): ReactNode => node],
    ['the drawer', node => <InDrawer>{node}</InDrawer>],
    [
      'drawer content',
      node => (
        <SideNavRenderContext value="drawer-content">
          {node}
        </SideNavRenderContext>
      ),
    ],
  ];

  describe.each(renderModes)('footerIcons in %s', (_mode, wrap) => {
    it.each(EMPTY_VALUES)('renders no footer for %s', (_label, value) => {
      render(wrap(<SideNav footerIcons={value}>{null}</SideNav>));
      expect(slotsOf(sideNavClassName.drawerFooter)).toEqual([]);
      expect(slotsOf(sideNavClassName.stickyBottom)).toEqual([]);
      expect(zeroParent(document.body)).toBeNull();
    });

    it('renders 0 inside the footer', () => {
      render(wrap(<SideNav footerIcons={0}>{null}</SideNav>));
      expect(
        zeroIsInside(sideNavClassName.drawerFooterIcons) ||
          zeroIsInside(sideNavClassName.footerRow),
      ).toBe(true);
    });
  });

  it.each(EMPTY_VALUES)('renders no top content for %s', (_label, value) => {
    render(<SideNav topContent={value}>{null}</SideNav>);
    expect(slotsOf(sideNavClassName.stickyTop)).toEqual([]);
  });

  it('renders a topContent of 0 inside the top content', () => {
    render(<SideNav topContent={0}>{null}</SideNav>);
    // The sticky top's only child is the content itself, so nothing wraps it.
    expect(zeroIsInside(sideNavClassName.stickyTop)).toBe(true);
  });
});

describe('SideNavHeading slots follow isRenderable', () => {
  // Each props set reaches a different render path of the heading.
  const paths: ReadonlyArray<[string, Record<string, unknown>]> = [
    ['the static heading', {}],
    ['a whole-heading link', {headingHref: '/home'}],
    [
      'a whole-heading link with end content',
      {headingHref: '/home', headerEndContent: <span>End</span>},
    ],
    ['a whole-heading menu trigger', {menu: <span>Menu</span>}],
    [
      'a menu with a heading link',
      {headingHref: '/home', menu: <span>Menu</span>},
    ],
    [
      'a heading with independent links',
      {superheading: 'Suite', superheadingHref: '/suite'},
    ],
  ];

  describe.each(paths)('icon in %s', (_path, props) => {
    it.each(EMPTY_VALUES)('renders no icon for %s', (_label, value) => {
      render(<SideNavHeading heading="Product" icon={value} {...props} />);
      expect(document.querySelector('[class*="styles.icon"]')).toBeNull();
    });

    it('renders an icon of 0 inside the icon slot', () => {
      render(<SideNavHeading heading="Product" icon={0} {...props} />);
      expect(zeroIsInside(sideNavHeadingClassName.icon)).toBe(true);
    });
  });

  describe('icon in a collapsed rail', () => {
    it.each(EMPTY_VALUES)('renders nothing for %s', (_label, value) => {
      const {container} = render(
        <Collapsed>
          <SideNavHeading heading="Product" icon={value} />
        </Collapsed>,
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders an icon of 0 as the icon-only heading', () => {
      render(
        <Collapsed>
          <SideNavHeading heading="Product" icon={0} />
        </Collapsed>,
      );
      expect(zeroIsInside(sideNavHeadingClassName.icon)).toBe(true);
      // The expanded heading text does not render in the rail.
      expect(document.querySelector('[class*="textContainer"]')).toBeNull();
    });
  });

  it.each(EMPTY_VALUES)(
    'renders no header end content for %s',
    (_label, value) => {
      render(<SideNavHeading heading="Product" headerEndContent={value} />);
      expect(document.querySelector('[class*="headerEndContent"]')).toBeNull();
    },
  );

  it('renders a headerEndContent of 0 inside its slot', () => {
    render(<SideNavHeading heading="Product" headerEndContent={0} />);
    expect(zeroIsInside(sideNavHeadingClassName.headerEndContent)).toBe(true);
  });
});

describe('SideNavItem and SideNavSection endContent follow isRenderable', () => {
  it.each(EMPTY_VALUES)(
    'SideNavItem renders no end content for %s',
    (_l, v) => {
      render(<SideNavItem label="Inbox" href="/inbox" endContent={v} />);
      expect(slotsOf(sideNavItemClassName.endContent)).toHaveLength(0);
    },
  );

  it('SideNavItem renders an endContent of 0 inside its slot', () => {
    render(<SideNavItem label="Inbox" href="/inbox" endContent={0} />);
    expect(zeroIsInside(sideNavItemClassName.endContent)).toBe(true);
  });

  it.each(EMPTY_VALUES)(
    'SideNavSection renders no end content for %s',
    (_l, v) => {
      render(
        <SideNavSection title="Projects" endContent={v}>
          {null}
        </SideNavSection>,
      );
      const slot = document.querySelector<HTMLElement>('[class*="endContent"]');
      expect(slot).toBeNull();
    },
  );

  it('SideNavSection renders an endContent of 0 inside its slot', () => {
    render(
      <SideNavSection title="Projects" endContent={0}>
        {null}
      </SideNavSection>,
    );
    expect(zeroCarries(...SECTION_END_CONTENT)).toBe(true);
  });
});
