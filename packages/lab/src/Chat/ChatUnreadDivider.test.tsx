// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ChatUnreadDivider} from './ChatUnreadDivider';
import {
  chatUnreadDividerLabelClassName,
  chatUnreadDividerRootClassName,
  chatUnreadDividerRuleClassName,
} from './chatUnreadDividerClasses';

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
