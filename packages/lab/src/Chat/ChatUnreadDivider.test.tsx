// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';
import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatUnreadDivider} from './ChatUnreadDivider';
import {
  chatUnreadDividerLabelClassName,
  chatUnreadDividerRootClassName,
  chatUnreadDividerRuleClassName,
} from './chatUnreadDividerClasses';

const legacyStyles = stylex.create({root: {color: 'red'}});

describe('ChatUnreadDivider', () => {
  it('renders a separator', () => {
    render(<ChatUnreadDivider />);
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('shows the default label', () => {
    render(<ChatUnreadDivider />);
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.getByRole('separator').getAttribute('aria-label')).toBe(
      'New messages below',
    );
  });

  it('shows a custom label', () => {
    render(<ChatUnreadDivider label="Unread" />);
    expect(screen.getByText('Unread')).toBeTruthy();
    expect(screen.getByRole('separator').getAttribute('aria-label')).toBe(
      'Unread messages below',
    );
  });

  it('styles the row through its class map', () => {
    render(<ChatUnreadDivider data-testid="divider" />);
    // `themeProps` prefixes the theme's stable name, then the map follows.
    expect(screen.getByTestId('divider').className.split(' ')).toEqual([
      'astryx-chat-unread-divider',
      ...chatUnreadDividerRootClassName.split(' '),
    ]);
  });

  it('applies a consumer class and inline overrides', () => {
    const {rerender} = render(<ChatUnreadDivider xstyle="consumer-class" />);
    expect(screen.getByRole('separator')).toHaveClass('consumer-class');

    rerender(
      <ChatUnreadDivider
        xstyle={{color: 'red', padding: 4}}
        style={{color: 'blue'}}
      />,
    );
    expect(screen.getByRole('separator')).toHaveStyle({
      color: 'rgb(0, 0, 255)',
      padding: '4px',
    });

    rerender(<ChatUnreadDivider xstyle={legacyStyles.root} />);
    const legacyClass = stylex.props(legacyStyles.root).className;
    expect(screen.getByRole('separator').className).toContain(legacyClass);
  });

  it('styles the rule and the label apart', () => {
    render(<ChatUnreadDivider data-testid="divider" />);
    const [rule, label] = Array.from(
      screen.getByTestId('divider').children,
    ) as HTMLElement[];
    expect(rule.className).toBe(chatUnreadDividerRuleClassName);
    expect(label.className).toBe(chatUnreadDividerLabelClassName);
  });

  it('applies the stable class name', () => {
    render(<ChatUnreadDivider data-testid="divider" />);
    expect(screen.getByTestId('divider').className).toContain(
      'astryx-chat-unread-divider',
    );
  });
});
