// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Indicator.classes.test.tsx
 * @input Uses vitest, @testing-library/react, the three default indicators and
 *   the class assertions harness
 * @output Verifies the class set each indicator state paints — one class per
 *   property, the size step, the state colors, the disabled opacity — and that
 *   the hover tint still comes from the indicator marker scope
 * @position Unit layer of the styling contract (FR8); the built sheet asserts
 *   the declarations these classes carry
 *   (Layout/tailwindStylesheet.source-build.test.mjs)
 *
 * No per-instance value reaches an indicator: size and state come from a fixed
 * set, so every declaration is a literal class and no component sets an
 * `--astryx-*` variable.
 */

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {classesOf, expectClassSet} from '../__tests__/classNameAssertions';
import {CheckIndicator} from './CheckIndicator';
import {CheckboxIndicator} from './CheckboxIndicator';
import {RadioIndicator} from './RadioIndicator';
import {indicatorHoverProps} from './indicatorHover.stylex';

/** The chrome a checkbox box and a radio circle share. */
const BOX_CHROME = [
  'box-border',
  'flex',
  'items-center',
  'justify-center',
  'shrink-0',
  'border-[length:var(--border-width)]',
  'border-solid',
  'transition-[background-color,border-color]',
  'duration-[var(--duration-fast)]',
  'ease-[var(--ease-standard)]',
  'motion-reduce:duration-0',
];

/** The state colors, one class per property. */
const UNCHECKED_BORDER = 'border-[color:var(--color-border-emphasized)]';
const CHECKED_BORDER = 'border-[color:var(--color-accent)]';
const DISABLED_BORDER = 'border-[color:var(--color-border)]';
const UNCHECKED_FILL = 'bg-[var(--color-background-surface)]';
const CHECKED_FILL = 'bg-[var(--color-accent)]';
const DISABLED_UNCHECKED_FILL = 'bg-[var(--color-background-muted)]';

/** `<element>` as the harness reads it, or a failure naming what is missing. */
function elementOf(container: HTMLElement, selector: string): HTMLElement {
  const element = container.querySelector(selector);
  if (element == null) {
    throw new Error(`no element matches ${selector}`);
  }
  return element as HTMLElement;
}

/**
 * Every rule text in the document, nested ones included. jsdom drops the
 * `color-mix()` declaration itself, so a test can read a selector here but not
 * a value; the built sheet covers the values.
 */
function ruleTexts(): string[] {
  const texts: string[] = [];
  const walk = (list: CSSRuleList) => {
    for (const rule of Array.from(list)) {
      texts.push(rule.cssText);
      if (rule instanceof CSSMediaRule) {
        walk(rule.cssRules);
      }
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    walk(sheet.cssRules);
  }
  return texts;
}

describe('CheckboxIndicator classes', () => {
  it('paints a checked box at the small size from the size step and the accents', () => {
    const {container} = render(<CheckboxIndicator state="checked" size="sm" />);
    expectClassSet(elementOf(container, '.astryx-checkbox-indicator'), {
      includes: [
        ...BOX_CHROME,
        'size-5',
        'rounded-[var(--radius-inner)]',
        'text-[var(--color-on-accent)]',
        CHECKED_BORDER,
        CHECKED_FILL,
      ],
      excludes: [
        'size-6',
        UNCHECKED_BORDER,
        UNCHECKED_FILL,
        DISABLED_BORDER,
        DISABLED_UNCHECKED_FILL,
        'opacity-50',
      ],
    });
  });

  it('paints an unchecked box at the middle size on the page surface', () => {
    const {container} = render(
      <CheckboxIndicator state="unchecked" size="md" />,
    );
    expectClassSet(elementOf(container, '.astryx-checkbox-indicator'), {
      includes: [
        'size-6',
        'text-[var(--color-accent)]',
        UNCHECKED_BORDER,
        UNCHECKED_FILL,
      ],
      excludes: ['size-5', CHECKED_BORDER, CHECKED_FILL, 'opacity-50'],
    });
  });

  it('paints the partial state as a checked box', () => {
    const {container} = render(<CheckboxIndicator state="indeterminate" />);
    expectClassSet(elementOf(container, '.astryx-checkbox-indicator'), {
      includes: ['text-[var(--color-on-accent)]', CHECKED_BORDER, CHECKED_FILL],
      excludes: [UNCHECKED_BORDER, UNCHECKED_FILL],
    });
  });

  it('dims a disabled box and moves it to the shared border and muted fill', () => {
    const {container} = render(
      <CheckboxIndicator state="unchecked" isDisabled />,
    );
    expectClassSet(elementOf(container, '.astryx-checkbox-indicator'), {
      includes: ['opacity-50', DISABLED_BORDER, DISABLED_UNCHECKED_FILL],
      excludes: [UNCHECKED_BORDER, UNCHECKED_FILL],
    });
  });

  it('keeps the accent fill of a disabled box that is checked', () => {
    const {container} = render(
      <CheckboxIndicator state="checked" isDisabled />,
    );
    expectClassSet(elementOf(container, '.astryx-checkbox-indicator'), {
      includes: ['opacity-50', DISABLED_BORDER, CHECKED_FILL],
      excludes: [DISABLED_UNCHECKED_FILL, UNCHECKED_FILL],
    });
  });

  it('draws the check glyph only when checked, at its own size', () => {
    const {container, rerender} = render(
      <CheckboxIndicator state="checked" size="sm" />,
    );
    const check = () => elementOf(container, '[data-size] svg');

    expectClassSet(check(), {
      includes: [
        'block',
        'size-3',
        'text-[var(--color-on-accent)]',
        // Windows High Contrast paints the box flat, so the stroke has to
        // leave currentColor for a color the forced palette keeps.
        'forced-colors:text-[color:CanvasText]',
      ],
      excludes: ['hidden', 'size-3.5'],
    });

    rerender(<CheckboxIndicator state="unchecked" size="sm" />);
    expectClassSet(check(), {includes: ['hidden'], excludes: ['block']});

    rerender(<CheckboxIndicator state="unchecked" size="md" />);
    expectClassSet(check(), {includes: ['size-3.5'], excludes: ['size-3']});
  });

  it('draws the indeterminate bar only in the partial state, at its own size', () => {
    const {container, rerender} = render(
      <CheckboxIndicator state="indeterminate" size="sm" />,
    );
    const bar = () => elementOf(container, '[data-size] span');

    expectClassSet(bar(), {
      includes: [
        'block',
        'w-2.5',
        'h-0.5',
        'rounded-[var(--radius-full)]',
        'bg-[var(--color-on-accent)]',
        'forced-colors:bg-[color:CanvasText]',
      ],
      excludes: ['hidden', 'w-3'],
    });

    rerender(<CheckboxIndicator state="checked" size="sm" />);
    expectClassSet(bar(), {includes: ['hidden'], excludes: ['block']});

    rerender(<CheckboxIndicator state="indeterminate" size="md" />);
    expectClassSet(bar(), {includes: ['w-3'], excludes: ['w-2.5']});
  });

  it('takes its hover tint from the indicator marker scope', () => {
    const {container} = render(<CheckboxIndicator state="checked" size="sm" />);
    const box = elementOf(container, '.astryx-checkbox-indicator');
    const hover = indicatorHoverProps({isChecked: true, isDisabled: false});
    // StyleX's dev build adds a readable debug name beside each class; the
    // harness drops those, so only the atomic ones are checked.
    const hoverClasses = (hover.className ?? '')
      .split(/\s+/)
      .filter(name => name !== '' && !name.includes('__'));

    // The resting border and fill are the class map's; the tint is the one
    // paint that reads the ancestor marker, so each of its classes carries the
    // hover rule under a hover-capable pointer, and the box applies them.
    expect(hoverClasses.length).toBeGreaterThan(0);
    expectClassSet(box, {includes: hoverClasses});
    for (const name of hoverClasses) {
      const selector = new RegExp(
        `\\.${name}\\.${name}\\.${name}:where\\([^)]*:hover \\*\\)`,
      );
      const rules = ruleTexts().filter(
        text => text.includes('(hover: hover)') && selector.test(text),
      );
      expect(rules, `no marker hover rule for ${name}`).toHaveLength(1);
    }
  });

  it('composes no hover tint while the box is disabled', () => {
    // The owner drops the indicator marker while disabled, so a disabled box
    // has nothing to tint and nothing to reset.
    expect(
      indicatorHoverProps({isChecked: false, isDisabled: true}).className,
    ).toBeUndefined();
  });
});

describe('RadioIndicator classes', () => {
  it('draws the circle at 50% of the size step, never the pill token', () => {
    const {container} = render(<RadioIndicator state="unchecked" size="sm" />);
    expectClassSet(elementOf(container, '.astryx-radio-indicator'), {
      includes: [
        ...BOX_CHROME,
        'size-5',
        'rounded-[50%]',
        UNCHECKED_BORDER,
        UNCHECKED_FILL,
      ],
      excludes: [
        'size-6',
        'rounded-[var(--radius-full)]',
        CHECKED_BORDER,
        CHECKED_FILL,
      ],
    });
  });

  it('leaves a radio with no text color of its own', () => {
    // The radio has no glyph to paint; its colors are the border and the fill.
    const {container} = render(<RadioIndicator state="unchecked" size="sm" />);
    expect(
      classesOf(elementOf(container, '.astryx-radio-indicator')).filter(name =>
        name.startsWith('text-'),
      ),
    ).toEqual([]);
  });

  it('paints a checked circle with the accent and shows the dot', () => {
    const {container} = render(<RadioIndicator state="checked" size="md" />);
    expectClassSet(elementOf(container, '.astryx-radio-indicator'), {
      includes: ['size-6', CHECKED_BORDER, CHECKED_FILL],
      excludes: [UNCHECKED_BORDER, UNCHECKED_FILL],
    });
    expectClassSet(elementOf(container, '.astryx-radio-indicator-dot'), {
      includes: [
        'size-2.5',
        'rounded-[50%]',
        'bg-[var(--color-on-accent)]',
        'forced-colors:bg-[color:CanvasText]',
      ],
      excludes: ['size-2'],
    });
  });

  it('draws no dot while the radio is unselected', () => {
    const {container} = render(<RadioIndicator state="unchecked" />);
    expect(
      container.querySelector('.astryx-radio-indicator-dot'),
    ).not.toBeInTheDocument();
  });

  it('dims a disabled circle and moves it to the shared border and muted fill', () => {
    const {container} = render(<RadioIndicator state="unchecked" isDisabled />);
    expectClassSet(elementOf(container, '.astryx-radio-indicator'), {
      includes: ['opacity-50', DISABLED_BORDER, DISABLED_UNCHECKED_FILL],
      excludes: [UNCHECKED_BORDER, UNCHECKED_FILL],
    });
  });
});

describe('CheckIndicator classes', () => {
  it('reserves the glyph box on the slot, in the accent it would paint', () => {
    const {container} = render(
      <CheckIndicator state="unchecked">
        <span data-testid="busy" />
      </CheckIndicator>,
    );
    expectClassSet(elementOf(container, '[aria-hidden]'), {
      includes: [
        'inline-flex',
        'items-center',
        'justify-center',
        'shrink-0',
        // 1rem is Icon's `sm` box, what `iconSizeForIndicator` resolves to at
        // both indicator sizes.
        'size-4',
        'text-[var(--color-accent)]',
      ],
      excludes: ['text-[var(--color-icon-disabled)]'],
    });
  });

  it('paints a disabled slot in the color the disabled glyph would use', () => {
    const {container} = render(
      <CheckIndicator state="unchecked" isDisabled>
        <span data-testid="busy" />
      </CheckIndicator>,
    );
    expectClassSet(elementOf(container, '[aria-hidden]'), {
      includes: ['text-[var(--color-icon-disabled)]'],
      excludes: ['text-[var(--color-accent)]'],
    });
  });
});
