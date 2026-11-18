// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file no-invisible-class.test.mjs
 */

import {RuleTester} from 'eslint';
import tsParser from '@typescript-eslint/parser';
import rule from './no-invisible-class.js';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    parser: tsParser,
    parserOptions: {ecmaFeatures: {jsx: true}},
  },
});

const MAP = '/repo/packages/core/src/Resizable/resizeHandleClasses.ts';
const COMPONENT = '/repo/packages/core/src/Calendar/Calendar.tsx';

ruleTester.run('no-invisible-class', rule, {
  valid: [
    // A literal class in a class map.
    {
      filename: MAP,
      code: `export const x = 'w-[min(var(--spacing-4),var(--astryx-pane-length))]';`,
    },
    // A fragment that builds an inline custom property, not a class.
    {
      filename: MAP,
      code: 'const style = {[PANE_VAR]: `${size}px`};',
    },
    // A class map joining literals through tw().
    {
      filename: MAP,
      code: `export const x = tw('flex', isDisabled ? 'opacity-50' : 'opacity-100');`,
    },
    // Plain utility text outside a map is not class text this rule can judge.
    {
      filename: COMPONENT,
      code: `const className = 'flex items-center gap-2';`,
    },
    // Prose that happens to hold brackets.
    {
      filename: COMPONENT,
      code: `const message = 'expected [a, b] to deeply equal []';`,
    },
    // A template literal type is a type, not class text.
    {
      filename: '/repo/packages/core/src/BaseProps.ts',
      code: 'type Props = {[key: `data-${string}`]: string};',
    },
    // Test files ship no class text.
    {
      filename: '/repo/packages/core/src/Calendar/Calendar.test.tsx',
      code: `const mirror = 'rtl:[transform:scaleX(-1)]';`,
    },
    // A deprecated StyleX module's text is written by its own compiler.
    {
      filename: '/repo/packages/core/src/Text/text.stylex.ts',
      code: 'const x = `${base}:hover`;',
    },
  ],
  invalid: [
    // An interpolated arbitrary value: the scanner sees the fragment only.
    {
      filename: MAP,
      code: 'export const x = `w-[min(var(--spacing-4),var(${PANE_LENGTH_VAR}))]`;',
      errors: [{messageId: 'interpolation'}],
    },
    // An interpolated variant.
    {
      filename: MAP,
      code: 'const x = `${DISABLED_SELECTOR}:cursor-default`;',
      errors: [{messageId: 'interpolation'}],
    },
    // An interpolated class list in a binding that names class text.
    {
      filename: MAP,
      code: 'export const tourStepOverlayInteractiveClassName = `${tourStepOverlayClassName} pointer-events-auto`;',
      errors: [{messageId: 'interpolation'}],
    },
    // Class text in a component file, where the scanner never looks.
    {
      filename: COMPONENT,
      code: `const RTL_MIRROR = 'rtl:[transform:scaleX(-1)]';`,
      errors: [{messageId: 'outsideMap'}],
    },
    // The same shape as a JSX attribute.
    {
      filename: COMPONENT,
      code: `const view = <div className="[padding-block-start:var(--spacing-2)]" />;`,
      errors: [{messageId: 'outsideMap'}],
    },
  ],
});
