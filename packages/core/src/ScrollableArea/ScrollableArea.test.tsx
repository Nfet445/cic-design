// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readFileSync} from 'node:fs';
import {act, render, screen} from '@testing-library/react';
import {
  beforeAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  expectVariable,
  stylesheetOf,
  type Stylesheet,
} from '../__tests__/classNameAssertions';
import {buildAstryxTailwindCss} from '../../scripts/build-css-tailwind.mjs';
import {
  containerPaddingByEdgeClassName,
  paddingEdgeClassName,
} from '../Layout/paddingClasses';
import {ScrollableArea} from './ScrollableArea';

function setGeometry(
  element: HTMLElement,
  values: Partial<
    Pick<
      HTMLElement,
      'clientWidth' | 'clientHeight' | 'scrollWidth' | 'scrollHeight'
    >
  >,
) {
  for (const [key, value] of Object.entries(values)) {
    Object.defineProperty(element, key, {
      configurable: true,
      value,
      writable: true,
    });
  }
}

describe('ScrollableArea', () => {
  let frames: FrameRequestCallback[];
  // The viewport's own paint is a class map now, so what it declares is read
  // from the built sheet, not from an injected StyleX rule.
  let sheet: Stylesheet;

  beforeAll(async () => {
    sheet = stylesheetOf(await buildAstryxTailwindCss());
  });
  beforeEach(() => {
    frames = [];
    vi.stubGlobal(
      'requestAnimationFrame',
      vi.fn((callback: FrameRequestCallback) => {
        frames.push(callback);
        return frames.length;
      }),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal(
      'ResizeObserver',
      vi.fn(function () {
        return {observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn()};
      }),
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  function flushFrame() {
    void act(() => {
      const pending = frames.splice(0);
      pending.forEach(callback => callback(performance.now()));
    });
  }

  it('renders one native viewport and one real content box', () => {
    render(
      <ScrollableArea label="Messages" data-testid="viewport">
        <p>Message history</p>
      </ScrollableArea>,
    );

    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveAccessibleName('Messages');
    expect(viewport).toHaveAttribute('role', 'group');
    expect(viewport).toHaveAttribute('data-scroll-axis', 'block');
    expect(viewport).not.toHaveAttribute('tabindex');
    expect(viewport.children).toHaveLength(1);
    expect(viewport.firstElementChild).toHaveAttribute('data-scroll-content');
    expect(viewport).toHaveTextContent('Message history');
  });

  it('becomes keyboard reachable only when the requested axis is effective', () => {
    render(
      <ScrollableArea
        axis="block"
        label="Messages"
        data-testid="viewport"
        style={{height: 100}}>
        <p>Message history</p>
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    // jsdom does not resolve StyleX's dynamic CSS variables. Mirror the
    // generated class values so this integration test can exercise measurement.
    viewport.style.overflowX = 'hidden';
    viewport.style.overflowY = 'auto';
    setGeometry(viewport, {
      clientWidth: 100,
      clientHeight: 100,
      scrollWidth: 100,
      scrollHeight: 180,
    });

    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(viewport).toHaveAttribute('tabindex', '0');
    expect(viewport).toHaveAttribute('data-scrollable-block', 'true');

    setGeometry(viewport, {scrollHeight: 100});
    void act(() => viewport.focus());
    void act(() => viewport.dispatchEvent(new Event('scroll')));
    flushFrame();
    expect(viewport).toHaveAttribute('tabindex', '-1');
    expect(document.activeElement).toBe(viewport);
  });

  it('keeps viewport props, styles, class names, events, and refs', () => {
    const onClick = vi.fn();
    const ref = vi.fn();
    render(
      <ScrollableArea
        label="Results"
        role="region"
        ref={ref}
        onClick={onClick}
        className="consumer-class"
        style={{maxHeight: 200}}
        data-testid="viewport">
        Results
      </ScrollableArea>,
    );

    const viewport = screen.getByTestId('viewport');
    viewport.click();
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(viewport);
    expect(viewport).toHaveClass('astryx-scrollable-area', 'consumer-class');
    expect(viewport.style.maxHeight).toBe('200px');
    expect(viewport).toHaveAttribute('role', 'region');
  });

  it('reflects logical axis and chaining intent without containing a fitting area', () => {
    render(
      <ScrollableArea
        axis="both"
        label="Canvas"
        overscroll="contain"
        data-testid="viewport">
        Canvas
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveAttribute('data-axis', 'both');
    expect(viewport).toHaveAttribute('data-scroll-axis', 'both');
    expect(viewport.style.overscrollBehaviorX).toBe('auto');
    expect(viewport.style.overscrollBehaviorY).toBe('auto');
  });

  it('keeps logical overflow and content sizing for writing-mode changes', () => {
    const {rerender} = render(
      <ScrollableArea axis="inline" label="Timeline" data-testid="viewport">
        Timeline
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    const content = viewport.firstElementChild as HTMLElement;
    expect(viewport).toHaveAttribute('data-axis', 'inline');
    expect(viewport.style.overflowInline).toBe('');
    expect(viewport.style.overflowBlock).toBe('');
    const inlineContentClass = content.className;
    expect(content.style.inlineSize).toBe('');
    expect(content.style.minInlineSize).toBe('');

    rerender(
      <ScrollableArea axis="block" label="Timeline" data-testid="viewport">
        Timeline
      </ScrollableArea>,
    );
    expect(viewport).toHaveAttribute('data-axis', 'block');
    expect(viewport.style.overflowInline).toBe('');
    expect(viewport.style.overflowBlock).toBe('');
    expect(content.className).not.toBe(inlineContentClass);
    expect(content.style.inlineSize).toBe('');
    const source = stylesSource();
    expect(source).not.toContain('dynamicStyles.overflow(');
    expect(source).not.toContain('logicalOverflowStyle');
    expect(hookSource()).toContain('scrollableAreaOverflowClassName');
    const classes = classesSource();
    expect(classes).toContain('min-w-full');
    expect(classes).toContain('min-h-full');
    expect(classes).toContain(
      "scrollableAreaContentWithInlineOverflowClassName = 'w-max'",
    );
  });

  it('uses clip while fitting and makes fitting Sticky containment explicit', () => {
    const {rerender} = render(
      <ScrollableArea label="Messages" data-testid="viewport">
        Messages
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    expect(viewport.getAttribute('style')).toContain('clip');
    expect(viewport).not.toHaveAttribute('tabindex');

    rerender(
      <ScrollableArea
        label="Messages"
        stickyContainment="always"
        data-testid="viewport">
        Messages
      </ScrollableArea>,
    );
    expect(viewport.getAttribute('style')).toContain(
      '--astryx-scrollable-overflow-x: hidden',
    );
    expect(viewport.getAttribute('style')).toContain(
      '--astryx-scrollable-overflow-y: auto',
    );
    expect(viewport).not.toHaveAttribute('tabindex');
  });

  it('accepts standard container sizing props on the viewport', () => {
    render(
      <ScrollableArea
        label="Messages"
        width={320}
        height="50vh"
        maxWidth="100%"
        minHeight={120}
        data-testid="viewport">
        Messages
      </ScrollableArea>,
    );

    expect(screen.getByTestId('viewport'));
    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveClass('w-[var(--astryx-scrollable-area-width)]');
    expect(viewport).toHaveClass('h-[var(--astryx-scrollable-area-height)]');
    expect(viewport).toHaveClass(
      'max-w-[var(--astryx-scrollable-area-max-width)]',
    );
    expect(viewport).toHaveClass(
      'min-h-[var(--astryx-scrollable-area-min-height)]',
    );
    expectVariable(viewport, '--astryx-scrollable-area-width', '320px');
    expectVariable(viewport, '--astryx-scrollable-area-height', '50vh');
    expectVariable(viewport, '--astryx-scrollable-area-min-height', '120px');
  });

  it('publishes content padding without changing the viewport default', () => {
    const {rerender} = render(
      <ScrollableArea label="Messages" data-testid="viewport">
        Messages
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    const content = viewport.firstElementChild as HTMLElement;
    const defaultViewportClass = viewport.className;
    const defaultContentClass = content.className;

    rerender(
      <ScrollableArea
        label="Messages"
        padding={4}
        paddingInlineEnd={2}
        data-testid="viewport">
        Messages
      </ScrollableArea>,
    );

    expect(viewport.className).toBe(defaultViewportClass);
    expect(content.className).not.toBe(defaultContentClass);
    const source = stylesSource();
    expect(source).toContain(
      'paddingInlineEnd: paddingInlineEnd ?? paddingInline ?? padding',
    );
    expect(source).toContain(
      'containerPaddingByEdgeClassName(contentPaddingEdges)',
    );
  });

  it.each([
    {name: 'zero on every edge by default', props: {}, edges: [0, 0, 0, 0]},
    {
      name: 'uniform padding on every edge',
      props: {padding: 4},
      edges: [4, 4, 4, 4],
    },
    {
      name: 'zero axis values over uniform',
      props: {padding: 4, paddingInline: 0, paddingBlock: 0},
      edges: [0, 0, 0, 0],
    },
    {
      name: 'start edges over axis over uniform',
      props: {
        padding: 4,
        paddingInline: 3,
        paddingBlock: 2,
        paddingInlineStart: 0,
        paddingBlockStart: 0,
      },
      edges: [0, 3, 0, 2],
    },
    {
      name: 'end edges over axis over uniform',
      props: {
        padding: 4,
        paddingInline: 3,
        paddingBlock: 2,
        paddingInlineEnd: 0,
        paddingBlockEnd: 0,
      },
      edges: [3, 0, 2, 0],
    },
  ] as const)('applies and publishes $name', ({props, edges}) => {
    render(
      <ScrollableArea label="Messages" data-testid="viewport" {...props}>
        Messages
      </ScrollableArea>,
    );
    const content = screen.getByTestId('viewport')
      .firstElementChild as HTMLElement;
    const contentClasses = new Set(content.className.split(' '));

    // One class decides one property, so the winner's class is present and no
    // other step's class competes with it.
    const resolved = {
      paddingInlineStart: edges[0],
      paddingInlineEnd: edges[1],
      paddingBlockStart: edges[2],
      paddingBlockEnd: edges[3],
    };
    for (const classText of [
      paddingEdgeClassName(resolved),
      containerPaddingByEdgeClassName(resolved),
    ]) {
      const classes = classText.split(' ');
      expect(classes).toHaveLength(4);
      for (const token of classes) {
        expect(contentClasses).toContain(token);
      }
    }
  });

  it('keeps inherited container bleed opt-in on the viewport', () => {
    const {rerender} = render(
      <ScrollableArea label="Messages" data-testid="viewport">
        Messages
      </ScrollableArea>,
    );
    const viewport = screen.getByTestId('viewport');
    const containedClass = viewport.className;

    rerender(
      <ScrollableArea label="Messages" isFullBleed data-testid="viewport">
        Messages
      </ScrollableArea>,
    );

    expect(viewport.className).not.toBe(containedClass);
    expect(stylesSource()).not.toContain('styles.fullBleed');
    expect(stylesSource()).not.toContain('stylex.create');
    const classes = classesSource();
    expect(classes).toContain('var(--container-padding-inline-start,0px)');
    expect(classes).toContain('isFullBleed && FULL_BLEED_CLASSES');
  });

  it('uses the neutral token for native scrollbar color with a transparent track', () => {
    expect(
      sheet.blockOf('[scrollbar-color:var(--color-neutral)_transparent]'),
    ).toBeDefined();
    expect(sheet.compact).toContain(
      'scrollbar-color:var(--color-neutral)transparent',
    );
  });

  it("keeps the platform's own scroll indicator on touch screens", () => {
    expect(classesSource()).toContain('pointer-coarse:[scrollbar-color:auto]');
    expect(classesSource()).toContain('forced-colors:[scrollbar-color:auto]');
  });

  it('guards scroll-state query containment as a progressive enhancement', () => {
    const block = sheet.blockOf(
      'supports-[container-type:scroll-state]:[container-type:scroll-state]',
    );
    expect(block).toContain('container-type:scroll-state');
  });
});

function hookSource(): string {
  return readFileSync('packages/core/src/hooks/useScrollableArea.ts', 'utf8');
}

function classesSource(): string {
  return readFileSync(
    'packages/core/src/ScrollableArea/scrollableAreaClasses.ts',
    'utf8',
  );
}

function stylesSource(): string {
  // This focused source assertion complements the built-CSS browser probe: it
  // keeps the capability guard and token reference reviewable at unit-test speed.
  return readFileSync(
    'packages/core/src/ScrollableArea/ScrollableArea.tsx',
    'utf8',
  );
}
