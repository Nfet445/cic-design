// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file fieldInputWrapper.public.test.ts
 * @input The Field entry point (`Field/index.ts`), the package root, and the
 *   in-house input box Field draws from the same values
 * @output Asserts a consumer reaches the input box classes from
 *   `@astryxdesign/core/Field` and that one class, never two, owns the border
 *   colour of the box
 * @position Beside Field/fieldClasses.ts; the test imports the entries, never
 *   the module
 */

import {describe, expect, it} from 'vitest';
import * as core from '../index';
import * as field from './index';

const STATUSES = ['warning', 'error', 'success'] as const;

describe('fieldInputWrapperClassName, an input box a caller paints', () => {
  it('is exported from @astryxdesign/core/Field', () => {
    expect(typeof field.fieldInputWrapperClassName).toBe('function');
    expect(field.fieldStatusBorderClassName).toBeTruthy();
  });

  it('is exported from @astryxdesign/core', () => {
    expect(core.fieldInputWrapperClassName).toBe(
      field.fieldInputWrapperClassName,
    );
    expect(core.fieldStatusBorderClassName).toBe(
      field.fieldStatusBorderClassName,
    );
  });

  it('draws the box Field draws', () => {
    const classes = field.fieldInputWrapperClassName().split(' ');
    expect(classes).toEqual(
      expect.arrayContaining([
        'box-border',
        'flex',
        'items-center',
        'border-solid',
        'border-[length:var(--border-width)]',
        'bg-[var(--color-background-surface)]',
      ]),
    );
  });

  it('raises the border colour on focus, and a status replaces it', () => {
    const resting = field.fieldInputWrapperClassName();
    expect(resting).toContain('border-[color:var(--color-border-emphasized)]');
    expect(resting).toContain(
      'focus-within:border-[color:var(--color-accent)]',
    );

    for (const status of STATUSES) {
      const withStatus = field.fieldInputWrapperClassName({status});
      expect(withStatus).not.toContain(
        'border-[color:var(--color-border-emphasized)]',
      );
      expect(withStatus).toContain(field.fieldStatusBorderClassName[status]);
    }
  });

  it('publishes one border class per status', () => {
    expect(Object.keys(field.fieldStatusBorderClassName)).toEqual([
      ...STATUSES,
    ]);
    for (const status of STATUSES) {
      expect(field.fieldStatusBorderClassName[status]).toBe(
        `border-[color:var(--color-border-${status})]`,
      );
    }
  });
});
