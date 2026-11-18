// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {PanelSearchInput} from './PanelSearchInput';

describe('PanelSearchInput field styling', () => {
  it('applies classes and style objects to the field box', () => {
    const props = {
      label: 'Search',
      clearLabel: 'Clear',
      value: '',
      onValueChange: () => {},
    };
    const {rerender} = render(
      <PanelSearchInput {...props} fieldXstyle="consumer-field" />,
    );
    const field = screen.getByRole('textbox', {name: 'Search'})
      .parentElement as HTMLElement;
    expect(field).toHaveClass('consumer-field');
    rerender(
      <PanelSearchInput {...props} fieldXstyle={{backgroundColor: 'red'}} />,
    );
    expect(field.style.backgroundColor).toBe('red');
  });
});
