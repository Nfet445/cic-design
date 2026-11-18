// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Switch.test.tsx
 * @input Uses vitest, @testing-library/react, Switch component
 * @output Unit tests for Switch's own contract: callbacks, form participation,
 *   composition, and styling
 * @position Testing; validates Switch.tsx implementation
 *
 * The shared switch-pattern outcomes — role, accessible name, exposed on/off
 * state, description, disabled exposure and inoperability, and keyboard and
 * pointer activation — are owned by the reusable accessibility contract in
 * __tests__/Switch.a11y.test.tsx (jsdom) and
 * __tests__/Switch.a11y.chromium.spec.ts (real Chromium, where the computed
 * accessibility tree and real focus can actually be observed). Assertions that
 * this file used to duplicate now live there and are not repeated here.
 *
 * What stays here is Switch's own contract: callback payloads, form data,
 * disabled-reason tooltip composition, the label theme target, forced-colors
 * CSS, RTL thumb travel, and rest forwarding.
 *
 * SYNC: When Switch.tsx changes, update tests to match new behavior
 */

import {StrictMode} from 'react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {act, render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Switch} from './Switch';
import {classesOf, expectClassSet} from '../__tests__/classNameAssertions';
import {__resetLiveRegionsForTest} from '../hooks/useAnnounce';
import {InternationalizationProvider} from '../i18n';
import {installPressFeedback} from '../utils/pressFeedback';

afterEach(() => {
  __resetLiveRegionsForTest();
});

// Mock showPopover/hidePopover (not implemented in jsdom) so the tooltip layer
// reflects its open state via a `popover-open` attribute the tests can assert.
beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('popover-open', '');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'open'});
    this.dispatchEvent(event);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('popover-open');
    const event = new Event('toggle', {bubbles: false});
    Object.defineProperty(event, 'newState', {value: 'closed'});
    this.dispatchEvent(event);
  });
  const originalMatches = HTMLElement.prototype.matches;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).matches = function (
    selector: string,
  ): boolean {
    if (selector === ':popover-open') {
      return this.hasAttribute('popover-open');
    }
    return originalMatches.call(this, selector);
  };
});

describe('Switch', () => {
  it('renders with custom size prop (sm / md)', () => {
    const {rerender} = render(
      <Switch
        label="Small switch"
        value={false}
        size="sm"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).toBeInTheDocument();

    rerender(
      <Switch
        label="Medium switch"
        value={false}
        size="md"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('toggles nothing for a pen press that a window blur cancels, at its later lift or its click (spec:AST-094 FR44)', async () => {
    const onChange = vi.fn();
    render(<Switch label="Wi-Fi" value={false} onChange={onChange} />);
    const input = screen.getByRole('switch');
    const pen = (type: 'pointerdown' | 'pointerup', time: number) => {
      const event = new Event(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
      });
      Object.defineProperties(event, {
        pointerId: {value: 7},
        pointerType: {value: 'pen'},
        isPrimary: {value: true},
        clientX: {value: 10},
        clientY: {value: 10},
        button: {value: 0},
        buttons: {value: type === 'pointerup' ? 0 : 1},
        timeStamp: {value: time},
      });
      act(() => {
        input.dispatchEvent(event);
      });
    };
    pen('pointerdown', 1000);
    act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    // The microtask after the blur, where an armed press's page listeners go.
    await act(async () => {
      await Promise.resolve();
    });
    pen('pointerup', 1080);
    // The pen's own click: a pointer's, detail 1.
    fireEvent.click(input, {detail: 1});
    expect(onChange).not.toHaveBeenCalled();
    expect(input).not.toBeChecked();
  });

  it('toggles nothing for a pen press that a window blur cancels under a coarse primary pointer too (spec:AST-094 FR44)', () => {
    const original = window.matchMedia;
    window.matchMedia = (query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    });
    try {
      const onChange = vi.fn();
      render(<Switch label="Wi-Fi" value={false} onChange={onChange} />);
      const input = screen.getByRole('switch');
      const pen = (type: 'pointerdown' | 'pointerup', time: number) => {
        const event = new Event(type, {
          bubbles: true,
          cancelable: true,
          composed: true,
        });
        Object.defineProperties(event, {
          pointerId: {value: 7},
          pointerType: {value: 'pen'},
          isPrimary: {value: true},
          clientX: {value: 10},
          clientY: {value: 10},
          button: {value: 0},
          buttons: {value: type === 'pointerup' ? 0 : 1},
          timeStamp: {value: time},
        });
        act(() => {
          input.dispatchEvent(event);
        });
      };
      pen('pointerdown', 1000);
      act(() => {
        window.dispatchEvent(new Event('blur'));
      });
      pen('pointerup', 1080);
      fireEvent.click(input, {detail: 1});
      expect(onChange).not.toHaveBeenCalled();
      expect(input).not.toBeChecked();
    } finally {
      window.matchMedia = original;
    }
  });

  it('calls onChange with new checked state when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={handleChange}
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('calls onChange with false when turning off', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={true}
        onChange={handleChange}
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleChange).toHaveBeenCalledWith(false, expect.any(Object));
  });

  it('works when clicking on the label', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={handleChange}
      />,
    );

    const label = screen.getByText('Enable notifications');
    await user.click(label);
    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('renders description when provided', () => {
    render(
      <Switch
        label="Dark mode"
        description="Switch to a darker color scheme"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByText('Switch to a darker color scheme'),
    ).toBeInTheDocument();
  });

  it('toggles when clicking on the description', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Dark mode"
        description="Switch to a darker color scheme"
        value={false}
        onChange={handleChange}
      />,
    );
    await user.click(screen.getByText('Switch to a darker color scheme'));
    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('does not fold the description into the switch accessible name', () => {
    // Description stays a sibling of the <label>, so it must not become part
    // of the switch's accessible name — it belongs in the accessible
    // description (aria-describedby) only, to avoid double announcement.
    render(
      <Switch
        label="Dark mode"
        description="Switch to a darker color scheme"
        value={false}
        onChange={() => {}}
      />,
    );
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toHaveAccessibleName('Dark mode');
    expect(switchEl).toHaveAccessibleDescription(
      'Switch to a darker color scheme',
    );
  });

  it('does not call onChange when isDisabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={handleChange}
        isDisabled
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Switch
        ref={ref}
        label="Enable notifications"
        value={false}
        onChange={() => {}}
      />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('visually hides label when isLabelHidden is true', () => {
    render(
      <Switch
        label="Toggle row"
        isLabelHidden
        value={false}
        onChange={() => {}}
      />,
    );
    const label = screen.getByText('Toggle row');
    expect(label).toBeInTheDocument();
    // Label should still be accessible
    expect(screen.getByLabelText('Toggle row')).toBeInTheDocument();
  });

  it('drops the label gap when isLabelHidden so the row is only as wide as the track', () => {
    const {rerender} = render(
      <Switch
        label="Toggle row"
        isLabelHidden
        value={false}
        onChange={() => {}}
      />,
    );
    const row = screen.getByRole('switch').parentElement!.parentElement!;
    // The gap is a class: jsdom resolves no declaration from the built sheet.
    // `tw` keeps both gap classes when the row hides its label, and `gap-0`
    // prints after `gap-2`, so its presence is the hidden state.
    expect(classesOf(row)).toContain('gap-0');

    rerender(<Switch label="Toggle row" value={false} onChange={() => {}} />);
    expect(classesOf(row)).not.toContain('gap-0');
  });

  // Retained: the shared contract binds a hidden-label state and a described
  // state, but not a hidden label WITH a description, which is the combination
  // that used to drop the link.
  it('keeps description linked via aria-describedby when isLabelHidden', () => {
    render(
      <Switch
        label="Toggle row"
        isLabelHidden
        description="Enables sync for this row"
        value={false}
        onChange={() => {}}
      />,
    );
    const switchEl = screen.getByRole('switch');
    const description = screen.getByText('Enables sync for this row');
    expect(description.id).not.toBe('');
    expect(switchEl.getAttribute('aria-describedby')).toContain(description.id);
  });

  it('shows label visually by default', () => {
    render(
      <Switch label="Enable notifications" value={false} onChange={() => {}} />,
    );
    const label = screen.getByText('Enable notifications');
    expect(label).toBeVisible();
  });

  it('renders with labelPosition start (label before switch)', () => {
    const {container} = render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        labelPosition="start"
      />,
    );
    // The outer div wraps the container div which has the label and switch
    const outerDiv = container.firstChild as HTMLElement;
    const containerDiv = outerDiv.firstChild as HTMLElement;
    const children = Array.from(containerDiv.children);
    // First child should be label wrapper, second should be switch wrapper
    expect(children.length).toBe(2);
  });

  it('renders with labelPosition end (switch before label)', () => {
    const {container} = render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        labelPosition="end"
      />,
    );
    // The outer div wraps the container div which has the switch and label
    const outerDiv = container.firstChild as HTMLElement;
    const containerDiv = outerDiv.firstChild as HTMLElement;
    const children = Array.from(containerDiv.children);
    // First child should be switch wrapper, second should be label wrapper
    expect(children.length).toBe(2);
  });

  it('keeps its input when labelPosition changes, so what is attached to it stays attached', () => {
    const view = render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        labelPosition="start"
      />,
    );
    const input = screen.getByRole('switch');
    view.rerender(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        labelPosition="end"
      />,
    );
    expect(screen.getByRole('switch')).toBe(input);
  });

  // Retained on purpose: the shared switch contract encodes no busy expectation
  // — no current record adopts one — so this is the only thing gating it.
  it('sets aria-busy on input when loading', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        isLoading
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders status message when status prop is provided', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'error', message: 'Failed to save setting'}}
      />,
    );
    expect(screen.getByText('Failed to save setting')).toBeInTheDocument();
  });

  // Retained after review, not by oversight. The shared contract's
  // switch.invalid.exposed proves that a switch in error is REPORTED in error,
  // but the bound state is also `isRequired` and off, and Chromium derives an
  // invalid state from constraint validation alone — so that expectation would
  // still pass with this mapping deleted. Switch's own error-status-to-
  // aria-invalid mapping is gated here, together with its negative below.
  it('sets aria-invalid when status type is error', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'error', message: 'Error message'}}
      />,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid when status type is not error', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'warning', message: 'Warning message'}}
      />,
    );
    expect(screen.getByRole('switch')).not.toHaveAttribute('aria-invalid');
  });

  // Regression: the status is conditionally mounted, so it must be announced
  // through the persistent useAnnounce live region — a live region born
  // together with its content is not reliably announced.
  it('announces a status message that appears after mount', async () => {
    const {rerender} = render(
      <Switch label="Enable notifications" value={false} onChange={() => {}} />,
    );
    expect(
      document.querySelector('[data-astryx-live-region="assertive"]'),
    ).toBeNull();

    rerender(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        status={{type: 'error', message: 'Failed to save setting'}}
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-astryx-live-region="assertive"]'),
      ).toHaveTextContent('Failed to save setting');
    });
  });

  it('announces loading state through useAnnounce when busy', async () => {
    const {container, rerender} = render(
      <Switch label="Enable notifications" value={false} onChange={() => {}} />,
    );
    // Does not introduce a permanent live region DOM element per switch
    expect(
      container.querySelector('[role="status"][aria-live="polite"]'),
    ).toBeNull();

    rerender(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        isLoading
      />,
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-astryx-live-region="polite"]'),
      ).toHaveTextContent('Loading');
    });
  });

  it('announces one busy start once under StrictMode, from the switch alone', async () => {
    // Count every message the shared polite region is given. Each announce
    // writes its text in a later frame, so two announces add it twice.
    const written: string[] = [];
    const observer = new MutationObserver(records => {
      for (const record of records) {
        const target = record.target as Element;
        if (target.getAttribute?.('data-astryx-live-region') !== 'polite') {
          continue;
        }
        for (const node of record.addedNodes) {
          if (node.textContent) {
            written.push(node.textContent);
          }
        }
      }
    });
    observer.observe(document.body, {childList: true, subtree: true});

    const {container} = render(
      <StrictMode>
        <Switch
          label="Sync photos"
          value={false}
          onChange={() => {}}
          isLoading
        />
      </StrictMode>,
    );
    await waitFor(() => {
      expect(written).toContain('Loading');
    });
    await new Promise(resolve => setTimeout(resolve, 50));
    observer.disconnect();

    expect(written.filter(text => text === 'Loading')).toHaveLength(1);
    // The thumb's spinner is a silent indicator: no live role reaches
    // assistive technology from inside the switch.
    for (const status of container.querySelectorAll('[role="status"]')) {
      expect(status.closest('[aria-hidden="true"]')).not.toBeNull();
    }
    expect(container.querySelector('[aria-live]')).toBeNull();
  });

  it('announces again when the switch becomes busy again after settling', async () => {
    const polite = () =>
      document.querySelector('[data-astryx-live-region="polite"]');
    const props = {label: 'Sync photos', value: false, onChange: () => {}};
    const {rerender} = render(<Switch {...props} isLoading />);
    await waitFor(() => expect(polite()).toHaveTextContent('Loading'));

    rerender(<Switch {...props} />);
    polite()!.textContent = '';
    rerender(<Switch {...props} isLoading />);
    await waitFor(() => expect(polite()).toHaveTextContent('Loading'));
  });

  it('localizes the loading announcement through the i18n catalog', async () => {
    render(
      <InternationalizationProvider
        locale="fr"
        overrides={{fr: {'@astryx.switch.loading': 'Chargement'}}}>
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isLoading
        />
      </InternationalizationProvider>,
    );
    await waitFor(() => {
      expect(
        document.querySelector('[data-astryx-live-region="polite"]'),
      ).toHaveTextContent('Chargement');
    });
  });

  it('announces loading state while async changeAction is pending', async () => {
    let resolveAction!: () => void;
    const changeAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );

    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        changeAction={changeAction}
      />,
    );

    const switchEl = screen.getByRole('switch');
    fireEvent.click(switchEl);

    expect(changeAction).toHaveBeenCalled();
    await waitFor(() => {
      expect(
        document.querySelector('[data-astryx-live-region="polite"]'),
      ).toHaveTextContent('Loading');
    });

    resolveAction();
  });

  it('calls onFocus and onBlur callbacks', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />,
    );

    const switchEl = screen.getByRole('switch');
    await user.click(switchEl);
    expect(handleFocus).toHaveBeenCalled();

    await user.tab();
    expect(handleBlur).toHaveBeenCalled();
  });

  // Retained after review. The shared contract's switch.required.declared
  // accepts either the native attribute or aria-required, because a non-native
  // switch can only offer the latter. Switch sets aria-required from its own
  // `isRequired` only. This test pins `isRequired` to the NATIVE attribute,
  // which is what makes the browser block submission.
  it('sets required attribute when isRequired is true', () => {
    render(
      <Switch
        label="Enable notifications"
        value={false}
        onChange={() => {}}
        isRequired
      />,
    );
    expect(screen.getByRole('switch')).toBeRequired();
  });

  it('keeps a required switch valid until status shows an error', () => {
    const {rerender} = render(
      <Switch label="Accept" value={false} onChange={() => {}} isRequired />,
    );
    // Native required alone makes Chromium report the switch invalid.
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'false');
    rerender(
      <Switch
        label="Accept"
        value={false}
        onChange={() => {}}
        isRequired
        status={{type: 'error', message: 'Required'}}
      />,
    );
    expect(screen.getByRole('switch')).toHaveAttribute('aria-invalid', 'true');
  });

  describe('disabledMessage', () => {
    const h = {hidden: true} as const;

    function getRow(): HTMLElement {
      return screen.getByRole('switch', h).closest('div')!.parentElement!;
    }

    it('shows the reason tooltip on hover when disabled with a reason', async () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const tooltip = screen.getByRole('tooltip', h);
      expect(tooltip).toHaveTextContent(
        'Notifications are turned off org-wide',
      );
      fireEvent.mouseEnter(getRow());
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
      fireEvent.mouseLeave(getRow());
      await waitFor(() => expect(tooltip).not.toHaveAttribute('popover-open'));
    });

    it('shows the reason tooltip on keyboard focus', async () => {
      const user = userEvent.setup();
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const tooltip = screen.getByRole('tooltip', h);
      await user.tab();
      expect(screen.getByRole('switch', h)).toHaveFocus();
      await waitFor(() => expect(tooltip).toHaveAttribute('popover-open'));
    });

    it('does not render a tooltip when not disabled', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('does not render a tooltip when disabled without a reason', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
        />,
      );
      expect(screen.queryByRole('tooltip', h)).not.toBeInTheDocument();
    });

    it('keeps the switch focusable via aria-disabled when a reason is provided', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const control = screen.getByRole('switch', h);
      expect(control).not.toBeDisabled();
      expect(control).toHaveAttribute('aria-disabled', 'true');
    });

    it('links the reason tooltip via aria-describedby', () => {
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      const control = screen.getByRole('switch', h);
      const tooltip = screen.getByRole('tooltip', h);
      expect(control.getAttribute('aria-describedby')).toContain(tooltip.id);
    });

    // The shared switch contract owns whether a switch reported as unavailable
    // actually stays unchanged; what stays here is Switch's own promise that it
    // never calls back while blocked.
    it('does not call onChange while focusable-disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={onChange}
          isDisabled
          disabledMessage="Notifications are turned off org-wide"
        />,
      );
      await user.click(screen.getByRole('switch', h));
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not run caller key handlers while disabled', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      const onKeyUp = vi.fn();
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          isDisabled
        />,
      );
      await user.tab();
      expect(screen.getByRole('switch')).toHaveFocus();
      await user.keyboard('{Enter}');
      await user.keyboard(' ');
      expect(onKeyDown).not.toHaveBeenCalled();
      expect(onKeyUp).not.toHaveBeenCalled();
    });

    it('still runs caller key handlers on an enabled switch', async () => {
      const user = userEvent.setup();
      const onKeyDown = vi.fn();
      const onKeyUp = vi.fn();
      render(
        <Switch
          label="Enable notifications"
          value={false}
          onChange={() => {}}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        />,
      );
      await user.tab();
      // Releasing Tab lands a keyup on the newly focused switch; count only
      // the key pressed after it.
      onKeyDown.mockClear();
      onKeyUp.mockClear();
      await user.keyboard('{Enter}');
      expect(onKeyDown).toHaveBeenCalledTimes(1);
      expect(onKeyUp).toHaveBeenCalledTimes(1);
    });

    it('stays focusable via aria-disabled when disabled without a reason', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const onClick = vi.fn();
      render(
        <form>
          <Switch
            label="Enable notifications"
            value={false}
            onChange={onChange}
            onClick={onClick}
            htmlName="notifications"
            isRequired
            isDisabled
          />
        </form>,
      );
      const control = screen.getByRole('switch');
      expect(control).not.toHaveAttribute('disabled');
      expect(control).toHaveAttribute('aria-disabled', 'true');
      await user.tab();
      expect(control).toHaveFocus();
      await user.keyboard(' ');
      await user.click(control);
      await user.click(screen.getByText('Enable notifications'));
      expect(onChange).not.toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
      expect(control).not.toBeChecked();
      const form = control.closest('form')!;
      expect(form.checkValidity()).toBe(true);
      expect([...new FormData(form).keys()]).toEqual([]);
    });
  });
  describe('labelSpacing', () => {
    const getField = (container: HTMLElement) =>
      container.querySelector<HTMLElement>('.astryx-switch-field')!;

    it('omits the data attribute for the default hug spacing', () => {
      const {container} = render(
        <Switch label="Notify" value={false} onChange={() => {}} />,
      );
      expect(getField(container)).not.toHaveAttribute('data-label-spacing');
    });

    it('reflects spread spacing as a data attribute and variant class', () => {
      const {container} = render(
        <Switch
          label="Notify"
          value={false}
          onChange={() => {}}
          labelSpacing="spread"
        />,
      );
      expect(getField(container)).toHaveAttribute(
        'data-label-spacing',
        'spread',
      );
      expect(getField(container)).toHaveAttribute(
        'data-label-spacing',
        'spread',
      );
    });

    it('renders explicit hug the same as the default', () => {
      const {container: implicit} = render(
        <Switch label="Notify" value={false} onChange={() => {}} />,
      );
      const {container: explicit} = render(
        <Switch
          label="Notify"
          value={false}
          onChange={() => {}}
          labelSpacing="hug"
        />,
      );
      expect(getField(explicit)).not.toHaveAttribute('data-label-spacing');
      expect(getField(explicit).className).toBe(getField(implicit).className);
    });
  });
  describe('form participation', () => {
    it('submits under htmlName when on', () => {
      const {container} = render(
        <form>
          <Switch
            label="Notify"
            htmlName="notify"
            value={true}
            onChange={() => {}}
          />
        </form>,
      );
      const data = new FormData(container.querySelector('form')!);
      expect(data.get('notify')).toBe('on');
    });

    it('does not block form submission when required and disabled with a disabledMessage', () => {
      const {container} = render(
        <form>
          <Switch
            label="Notify"
            htmlName="notify"
            value={false}
            onChange={() => {}}
            isRequired
            isDisabled
            disabledMessage="Notifications are turned off org-wide"
          />
        </form>,
      );
      expect(container.querySelector('form')!.checkValidity()).toBe(true);
    });

    it('still blocks submission when required and off but enabled', () => {
      const {container} = render(
        <form>
          <Switch
            label="Notify"
            htmlName="notify"
            value={false}
            onChange={() => {}}
            isRequired
          />
        </form>,
      );
      expect(container.querySelector('form')!.checkValidity()).toBe(false);
    });

    it('is excluded from form data when disabled, even with a disabledMessage', () => {
      const {container} = render(
        <form>
          <Switch
            label="Notify"
            htmlName="notify"
            value={true}
            onChange={() => {}}
            isDisabled
            disabledMessage="Locked"
          />
        </form>,
      );
      expect([
        ...new FormData(container.querySelector('form')!).keys(),
      ]).toEqual([]);
    });

    it('submits nothing when off or when htmlName is omitted', () => {
      const {container} = render(
        <form>
          <Switch
            label="Off"
            htmlName="off"
            value={false}
            onChange={() => {}}
          />
          <Switch label="Unnamed" value={true} onChange={() => {}} />
        </form>,
      );
      const data = new FormData(container.querySelector('form')!);
      expect([...data.keys()]).toEqual([]);
    });
  });

  describe('RTL thumb travel direction', () => {
    // The travel is a class, not a computed transform: jsdom resolves neither
    // a `@media` arm nor a `[dir]` descendant selector, and the built sheet is
    // where the declaration is checked (tailwindStylesheet.source-build.test).
    it('applies a distinct thumb box when on vs off', () => {
      const on = render(<Switch label="On" value={true} onChange={() => {}} />);
      const off = render(
        <Switch label="Off" value={false} onChange={() => {}} />,
      );
      const onThumb = on.container.querySelector('.astryx-switch-thumb');
      const offThumb = off.container.querySelector('.astryx-switch-thumb');
      expect(onThumb).not.toBeNull();
      expect(offThumb).not.toBeNull();
      expect(classesOf(onThumb!)).not.toEqual(classesOf(offThumb!));
    });

    it('mirrors the on-state thumb travel under RTL', () => {
      const {container} = render(
        <Switch label="Toggle" value={true} onChange={() => {}} />,
      );
      // LTR on-travel moves the thumb toward the physical right. RTL mirrors
      // it: the on-thumb lands on the inline-end (physical left) side, so the
      // travel flips sign. A finger moves the thumb by its insets instead.
      expectClassSet(container.querySelector('.astryx-switch-thumb')!, {
        includes: [
          '[transform:translateX(14px)]',
          'rtl:[transform:translateX(-14px)]',
          'pointer-coarse:[transform:none]',
        ],
      });
    });
  });

  describe('rest forwarding', () => {
    it('forwards data-testid, id, and aria-* to the root element', () => {
      const {container} = render(
        <Switch
          label="Notifications"
          value={false}
          onChange={() => {}}
          data-testid="my-switch"
          id="switch-1"
          aria-label="Toggle notifications"
        />,
      );
      const root = container.querySelector('[data-testid="my-switch"]');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('id', 'switch-1');
      expect(root).toHaveAttribute('aria-label', 'Toggle notifications');
    });

    it('composes a caller aria-describedby onto the switch control', () => {
      const {container} = render(
        <>
          <p id="external-hint">Applies to every repository</p>
          <Switch
            label="Notifications"
            description="Sends a daily digest"
            value={false}
            onChange={() => {}}
            data-testid="my-switch"
            aria-describedby="external-hint"
          />
        </>,
      );
      const control = screen.getByRole('switch');
      const description = screen.getByText('Sends a daily digest');
      expect(control.getAttribute('aria-describedby')?.split(' ')).toEqual([
        'external-hint',
        description.id,
      ]);
      expect(control).toHaveAccessibleDescription(
        'Applies to every repository Sends a daily digest',
      );
      // The id reference lives on the control only, not on the field wrapper.
      const root = container.querySelector('[data-testid="my-switch"]');
      expect(root).not.toHaveAttribute('aria-describedby');
    });

    it('names the switch control from a caller aria-labelledby', () => {
      const {container} = render(
        <>
          <span id="row-title">Release notes</span>
          <Switch
            label="Pin Release notes"
            isLabelHidden
            value={false}
            onChange={() => {}}
            data-testid="my-switch"
            aria-labelledby="row-title"
          />
        </>,
      );
      const control = screen.getByRole('switch', {name: 'Release notes'});
      expect(control).toHaveAttribute('aria-labelledby', 'row-title');
      // The id reference lives on the control only, not on the field wrapper.
      const root = container.querySelector('[data-testid="my-switch"]');
      expect(root).not.toHaveAttribute('aria-labelledby');
    });
  });

  describe('pressed state', () => {
    it('paints the track and thumb while their own row is pressed', () => {
      render(
        <Switch label="Notifications" value={false} onChange={() => {}} />,
      );
      const input = screen.getByRole('switch');
      const track = input.nextElementSibling!;
      const thumb = track.firstElementChild!;
      expect(input.closest('[data-astryx-switch-scope]')).toHaveClass(
        'data-[astryx-press=fading]:pointer-coarse:[animation-name:none]!',
      );
      for (const part of [track, thumb]) {
        expect(part).toHaveClass('astryx-switch-press-layer');
      }
    });
  });

  describe('mouse look', () => {
    // The rest styles are classes, so these read the class set. jsdom applies
    // no `@media (pointer: coarse)` rule: the coarse arms are asserted where
    // their state is.
    const look = (container: HTMLElement) => {
      const track = container.querySelector<HTMLElement>('.astryx-switch');
      const thumb = container.querySelector<HTMLElement>(
        '.astryx-switch-thumb',
      );
      if (track == null || thumb == null) {
        throw new Error('the switch has no track or thumb');
      }
      return {track, thumb};
    };

    it('keeps the track fill and colour fade, and the thumb slide', () => {
      // A fine pointer: the desktop switch.
      expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
      const {container, rerender} = render(
        <Switch label="Wi-Fi" value={false} onChange={() => {}} />,
      );
      const off = look(container);
      expectClassSet(off.track, {
        includes: [
          'bg-[var(--color-background-gray)]',
          'transition-[background-color]',
          'duration-[var(--duration-fast)]',
          'p-1',
        ],
      });
      expectClassSet(off.thumb, {
        includes: [
          'h-4',
          'w-4',
          'transition-[transform,width,height]',
          'duration-[var(--duration-fast)]',
        ],
      });

      rerender(<Switch label="Wi-Fi" value onChange={() => {}} />);
      const on = look(container);
      expectClassSet(on.track, {includes: ['bg-[var(--color-accent)]']});
      expectClassSet(on.thumb, {
        includes: ['h-5', 'w-5', '[transform:translateX(14px)]'],
      });
    });

    it('adds no element: the thumb is the track’s only child, under a finger too', () => {
      const {container} = render(
        <Switch label="Wi-Fi" value={false} onChange={() => {}} />,
      );
      const track = container.querySelector('.astryx-switch');
      const thumb = container.querySelector('.astryx-switch-thumb');
      // architecture:component-style-authoring INV7: the touch presentation
      // styles the existing thumb (the fade layer is the track's ::before).
      expect(track?.children.length).toBe(1);
      expect(thumb?.parentElement).toBe(track);
    });

    it('keeps the small size’s padding and thumb', () => {
      expect(window.matchMedia('(pointer: coarse)').matches).toBe(false);
      const {container} = render(
        <Switch label="Wi-Fi" size="sm" value={false} onChange={() => {}} />,
      );
      const off = look(container);
      expectClassSet(off.track, {includes: ['p-0.5']});
      expectClassSet(off.thumb, {includes: ['h-3.5', 'w-3.5']});
    });
  });

  describe('coarse pointer and RTL hit-target positioning', () => {
    it.each([
      ['sm', 'ltr'],
      ['sm', 'rtl'],
      ['md', 'ltr'],
      ['md', 'rtl'],
    ] as const)('centers the native input (size: %s, dir: %s)', (size, dir) => {
      const {container} = render(
        <div dir={dir}>
          <Switch
            label="Dark mode"
            size={size}
            value={false}
            onChange={() => {}}
          />
        </div>,
      );

      const input = container.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement;
      expect(input).toBeInTheDocument();
      // The input's box owns the transform, so only the inline half of the
      // centering shows here.
      expectClassSet(input, {
        includes: ['left-1/2', '[transform:translate(-50%,-50%)]'],
      });
    });
  });
});

// jsdom cannot emulate forced-colors rendering, so these assert that the
// compiled output includes the forced-colors rules; visual behavior needs
// manual verification under Windows High Contrast.
describe('touch listeners (spec:AST-094 FR24)', () => {
  const coarseMedia = (query: string) =>
    ({
      matches:
        query.includes('pointer: coarse') ||
        query.includes('any-pointer: coarse'),
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;

  // React's root delegates touch events too: count against a plain element.
  const listenersWhileRendering = (
    isDisabled: boolean | 'none' | 'busy',
  ): {touch: number; pointer: number; contextMenu: number; click: number} => {
    vi.spyOn(window, 'matchMedia').mockImplementation(coarseMedia);
    const types: string[] = [];
    const clickTargets: unknown[] = [];
    const record = function (this: unknown, type: string) {
      types.push(type);
      if (type === 'click') {
        clickTargets.push(this);
      }
    };
    const onDocument = vi
      .spyOn(document, 'addEventListener')
      .mockImplementation(record);
    const onElements = vi
      .spyOn(HTMLElement.prototype, 'addEventListener')
      .mockImplementation(record);
    const {container, unmount} = render(
      isDisabled === 'none' ? (
        <div />
      ) : (
        <Switch
          label="Notifications"
          value={false}
          onChange={() => {}}
          isDisabled={isDisabled === true}
          isLoading={isDisabled === 'busy'}
        />
      ),
    );
    onDocument.mockRestore();
    onElements.mockRestore();
    // On the switch's own elements, read while they are mounted: React's root
    // and the page's shared listeners are not the switch's.
    const ownClicks = clickTargets.filter(
      target =>
        target instanceof Node &&
        target !== container &&
        container.contains(target),
    ).length;
    unmount();
    vi.restoreAllMocks();
    return {
      touch: types.filter(type => type.startsWith('touch')).length,
      pointer: types.filter(type => type.startsWith('pointer')).length,
      contextMenu: types.filter(type => type === 'contextmenu').length,
      click: ownClicks,
    };
  };

  it('a switch under a coarse pointer attaches no touch or click listener, and a disabled one arms no press listener', () => {
    const baseline = listenersWhileRendering('none');
    const enabled = listenersWhileRendering(false);
    const disabled = listenersWhileRendering(true);
    const busy = listenersWhileRendering('busy');
    // No state adds a touch listener, so a scroll never waits on the switch.
    // Nor a context-menu one: the gesture host keeps a held switch's menu
    // closed. Nor a click one on its own elements: a lift's click wait
    // listens only while it waits (utils/browserClickWait.ts).
    for (const counts of [enabled, disabled, busy]) {
      expect(counts.touch).toBe(baseline.touch);
      expect(counts.contextMenu).toBe(baseline.contextMenu);
      expect(counts.click).toBe(0);
    }
    // The gesture host arms a press listener for an enabled switch only.
    expect(enabled.pointer).toBeGreaterThan(disabled.pointer);
    // Busy stays attached, so the change that made it busy keeps its motion.
    expect(busy.pointer).toBeGreaterThan(disabled.pointer);
  });

  it('under a fine pointer an enabled switch arms one passive pointerdown listener on its own element and adds no page listener until a press; a disabled one arms none (spec:AST-094 FR24, FR43)', () => {
    const fineMedia = (query: string) =>
      ({
        matches:
          query.includes('pointer: fine') || query.includes('hover: hover'),
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList;
    const listenersWhileRendering = (isDisabled: boolean) => {
      vi.spyOn(window, 'matchMedia').mockImplementation(fineMedia);
      // The one shared press controller is the allowed idle page listener. It
      // is installed before the render is measured, so a count is the
      // switch's own.
      const releasePressController = installPressFeedback();
      const onElements: {
        target: unknown;
        type: string;
        options: unknown;
      }[] = [];
      const onPage: string[] = [];
      const elementSpy = vi
        .spyOn(HTMLElement.prototype, 'addEventListener')
        .mockImplementation(function (
          this: unknown,
          type: string,
          _listener: unknown,
          options?: unknown,
        ) {
          onElements.push({target: this, type, options});
        });
      const recordPage = function (this: unknown, type: string) {
        onPage.push(type);
      };
      const documentSpy = vi
        .spyOn(document, 'addEventListener')
        .mockImplementation(recordPage);
      const windowSpy = vi
        .spyOn(window, 'addEventListener')
        .mockImplementation(recordPage);
      const {container, unmount} = render(
        <Switch
          label="Notifications"
          value={false}
          onChange={() => {}}
          isDisabled={isDisabled}
        />,
      );
      const surface = container.querySelector('[role="switch"]')?.parentElement;
      elementSpy.mockRestore();
      documentSpy.mockRestore();
      windowSpy.mockRestore();
      unmount();
      releasePressController();
      vi.restoreAllMocks();
      const armed = onElements.filter(({target, type, options}) => {
        const o = options as AddEventListenerOptions | undefined;
        return (
          target === surface &&
          type === 'pointerdown' &&
          o?.capture === true &&
          o?.passive === true
        );
      }).length;
      // The host's page listeners for a press: none at rest (FR24).
      const pressListeners = onPage.filter(type =>
        /^(pointermove|pointerup|pointercancel|touch)/.test(type),
      ).length;
      return {armed, pressListeners};
    };
    expect(listenersWhileRendering(false)).toEqual({
      armed: 1,
      pressListeners: 0,
    });
    expect(listenersWhileRendering(true)).toEqual({
      armed: 0,
      pressListeners: 0,
    });
  });

  it('runs no hit-area observer or window listener under a fine pointer, or while disabled under a coarse one', () => {
    const observersWhileRendering = (
      isCoarse: boolean,
      isDisabled: boolean,
    ): {observers: number; resize: number} => {
      vi.spyOn(window, 'matchMedia').mockImplementation(query => ({
        ...coarseMedia(query),
        matches: isCoarse && query.includes('pointer: coarse'),
      }));
      let observers = 0;
      vi.stubGlobal(
        'IntersectionObserver',
        class {
          constructor() {
            observers += 1;
          }
          observe() {}
          unobserve() {}
          disconnect() {}
        },
      );
      const onWindow = vi.spyOn(window, 'addEventListener');
      const {unmount} = render(
        <Switch
          label="Notifications"
          value={false}
          onChange={() => {}}
          isDisabled={isDisabled}
        />,
      );
      const resize = onWindow.mock.calls.filter(
        ([type]) => type === 'resize',
      ).length;
      unmount();
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
      return {observers, resize};
    };
    expect(observersWhileRendering(false, false)).toEqual({
      observers: 0,
      resize: 0,
    });
    expect(observersWhileRendering(true, true)).toEqual({
      observers: 0,
      resize: 0,
    });
    // Enabled under a coarse pointer it measures.
    expect(observersWhileRendering(true, false).observers).toBe(1);
  });
});

describe('hit area under a coarse pointer (Switch FR10)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('grows toward 44 × 44 px and stops halfway to a link beside it, so a tap nearer the link is the link’s', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query === '(pointer: coarse)',
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    let reveal: ((entries: IntersectionObserverEntry[]) => void) | null = null;
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
          reveal = callback;
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    const frames: (() => void)[] = [];
    vi.stubGlobal('requestAnimationFrame', (run: () => void) =>
      frames.push(run),
    );
    vi.stubGlobal('cancelAnimationFrame', () => {});
    const {container} = render(
      <div>
        <Switch
          label="Wi-Fi"
          isLabelHidden
          size="sm"
          value={false}
          onChange={() => {}}
        />
        <a href="#details">Details</a>
      </div>,
    );
    const input = screen.getByRole('switch');
    const surface = input.parentElement as HTMLElement;
    const link = container.querySelector('a') as HTMLElement;
    const box = (left: number, top: number, width: number, height: number) =>
      ({
        left,
        top,
        right: left + width,
        bottom: top + height,
        width,
        height,
        x: left,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;
    // A 32 × 20 (small) switch with the link 8 px to its right.
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function (this: HTMLElement) {
        if (this === surface) {
          return box(100, 100, 32, 20);
        }
        if (this === link) {
          return box(140, 100, 60, 20);
        }
        return box(0, 0, 0, 0);
      },
    );
    expect(surface.style.getPropertyValue('--astryx-hit-inset-right')).toBe('');
    reveal!([
      {
        target: surface,
        isIntersecting: true,
      } as unknown as IntersectionObserverEntry,
    ]);
    frames.splice(0).forEach(run => run());
    // Up and down 12 px (20 → 44); left 6 px (32 → 44); right stops at
    // 4 px, half the 8 px gap.
    expect(surface.style.getPropertyValue('--astryx-hit-inset-top')).toBe(
      '12px',
    );
    expect(surface.style.getPropertyValue('--astryx-hit-inset-left')).toBe(
      '6px',
    );
    expect(surface.style.getPropertyValue('--astryx-hit-inset-right')).toBe(
      '4px',
    );
  });
});

describe('forced colors (WCAG 1.4.11)', () => {
  it('carries a system-colour track and thumb per state, so on/off survives Windows High Contrast', () => {
    const {container, rerender} = render(
      <Switch label="Notifications" value={false} onChange={() => {}} />,
    );
    const track = () => container.querySelector('.astryx-switch') as Element;
    const thumb = () =>
      container.querySelector('.astryx-switch-thumb') as Element;
    // Backgrounds are stripped there; the border keeps the track's bounds
    // (WCAG 1.4.11), and the states keep their own system colours so the
    // thumb reads against the track it sits on.
    expectClassSet(track(), {
      includes: [
        'forced-colors:border',
        'forced-colors:border-[color:CanvasText]',
        'forced-colors:bg-[color:Canvas]',
      ],
    });
    expectClassSet(thumb(), {
      includes: ['forced-colors:bg-[color:CanvasText]'],
    });

    rerender(<Switch label="Notifications" value onChange={() => {}} />);
    expectClassSet(track(), {includes: ['forced-colors:bg-[color:Highlight]']});
    expectClassSet(thumb(), {
      includes: ['forced-colors:bg-[color:HighlightText]'],
    });

    rerender(
      <Switch label="Notifications" value isDisabled onChange={() => {}} />,
    );
    // Opacity dimming does not survive forced colors; GrayText is the
    // platform's disabled affordance there.
    expectClassSet(track(), {
      includes: ['opacity-50', 'forced-colors:border-[color:GrayText]'],
    });
  });

  it('gates the hover tint out of forced colors so the thumb stays visible on hover', () => {
    render(<Switch label="Notifications" value={true} onChange={() => {}} />);
    // The ancestor-hover tint is a non-system color-mix whose rule outranks the
    // plain forced-colors track rule. It is gated behind `forced-colors: none`
    // so it cannot reassert on hover and flatten the Highlight track to white
    // under the HighlightText thumb (white-on-white).
    expect(screen.getByRole('switch').nextElementSibling).toHaveClass(
      '[@media(hover:hover)_and_(forced-colors:none)]:[[data-astryx-switch-scope]:hover_&]:bg-[color:color-mix(in_srgb,var(--color-accent),var(--color-tint-hover)_15%)]',
    );
  });
});

describe('label theme target', () => {
  it('names its own label so a theme can style it apart from a field label', () => {
    // See CheckboxInput: the control names the label it owns.
    render(<Switch label="Wi-Fi" value={false} onChange={() => {}} />);
    const label = screen.getByText('Wi-Fi').closest('label');
    expect(label).toHaveClass('astryx-field-label');
    expect(label).toHaveClass('astryx-switch-label');
  });
});
