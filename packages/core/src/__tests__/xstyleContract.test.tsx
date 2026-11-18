// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file xstyleContract.test.tsx
 * @input Consumer styling props on a public component
 * @output The classes and inline styles rendered on its root
 * @position Guards the public styling override contract
 */

import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Button} from '../Button/Button';

describe('xstyle consumer contract', () => {
  it('keeps the consumer class after component classes', () => {
    render(
      <Button
        label="Save"
        xstyle="consumer-override"
        className="consumer-class"
      />,
    );
    const classes = screen.getByRole('button').className.split(' ');
    expect(classes.indexOf('consumer-override')).toBeGreaterThan(0);
    expect(classes).toContain('consumer-class');
  });

  it('merges an xstyle object before the style prop', () => {
    render(
      <Button
        label="Save"
        xstyle={{color: 'red', backgroundColor: 'blue'}}
        style={{color: 'green'}}
      />,
    );
    const button = screen.getByRole('button');
    expect(button.style.color).toBe('green');
    expect(button.style.backgroundColor).toBe('blue');
  });
});
