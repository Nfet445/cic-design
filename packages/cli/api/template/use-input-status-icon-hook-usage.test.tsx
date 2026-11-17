// Copyright (c) Meta Platforms, Inc. and affiliates.
// @vitest-environment jsdom

/**
 * The useInputStatusIcon example draws its field with Core's published field
 * box. So a field copied from it carries the text field timing — it shows the
 * focus look at once under a coarse pointer, as Core's text fields do — and it
 * lets the wrapper own the border: the status colour follows the input's
 * status, and the input itself draws none.
 */

import {act} from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {
  fieldInputWrapperClassName,
  fieldStatusBorderClassName,
} from '@astryxdesign/core/Field';
import UseInputStatusIconHookUsage from '../../assets/templates/blocks/components/Hooks/useInputStatusIconHookUsage';

// The node project does not compile StyleX, and the components around the
// example still use it. The fixture makes their props calls harmless so the
// example renders; the field's own classes come from the published map.
vi.mock('@stylexjs/stylex', async importOriginal => ({
  ...(await importOriginal<object>()),
  create: <T,>(styles: T) => styles,
  props: () => ({}),
}));

(globalThis as {IS_REACT_ACT_ENVIRONMENT?: boolean}).IS_REACT_ACT_ENVIRONMENT =
  true;

let root: Root | null = null;
let container: HTMLElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
});

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  container.remove();
});

function renderExample(): HTMLInputElement {
  act(() => {
    root = createRoot(container);
    root.render(<UseInputStatusIconHookUsage />);
  });
  const input = container.querySelector<HTMLInputElement>('input');
  if (input == null) {
    throw new Error('no text input rendered');
  }
  return input;
}

/** The classes of the box the example wraps its input in. */
function wrapperClasses(input: HTMLInputElement): string[] {
  return (input.parentElement?.className ?? '').split(' ');
}

function type(input: HTMLInputElement, text: string): void {
  const setValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )?.set;
  act(() => {
    setValue?.call(input, text);
    input.dispatchEvent(new Event('input', {bubbles: true}));
  });
}

it('draws the published field box, so the field keeps the text field timing', () => {
  const input = renderExample();
  const classes = wrapperClasses(input);
  // Every box class but the border colour, which the status test below owns.
  const boxClasses = fieldInputWrapperClassName()
    .split(' ')
    .filter(boxClass => !boxClass.startsWith('border-[color:'));
  expect(boxClasses.length).toBeGreaterThan(20);
  for (const boxClass of boxClasses) {
    expect(classes).toContain(boxClass);
  }
  expect(classes).toContain('pointer-coarse:duration-0');
  expect(classes).toContain('motion-reduce:duration-0');
});

it('lets the wrapper own the border and follow the status', () => {
  const input = renderExample();
  // The example opens on a code that is not valid, so the status is an error.
  expect(wrapperClasses(input)).toContain(fieldStatusBorderClassName.error);

  type(input, 'SAVE20');
  expect(wrapperClasses(input)).toContain(fieldStatusBorderClassName.success);
  expect(wrapperClasses(input)).not.toContain(fieldStatusBorderClassName.error);

  type(input, '');
  expect(wrapperClasses(input)).toContain(
    'border-[color:var(--color-border-emphasized)]',
  );
  expect(wrapperClasses(input)).not.toContain(fieldStatusBorderClassName.error);

  expect(input.className.split(' ')).toContain('border-none');
});
