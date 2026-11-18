// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Link.test.tsx
 * @input Uses vitest, @testing-library/react, Link component
 * @output Unit tests for Link component behavior
 * @position Testing; validates Link.tsx implementation
 *
 * SYNC: When Link.tsx changes, update tests to match new behavior
 */

import {describe, it, expect, vi} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {expectClassSet} from '../__tests__/classNameAssertions';
import {interactionOverlayPressedBackgroundColorClassName} from '../utils/interactionOverlayClasses';
import type {ReactNode} from 'react';
import {InteractiveRoleContext} from '../InteractiveRoleContext/InteractiveRoleContext';
import {LayerContentBoundary} from '../Layer/layerScopedContext';
import {Text} from '../Text/Text';
import {Link} from './Link';
import {LinkProvider} from './LinkProvider';

function CustomLink({
  children,
  ref,
  ...props
}: React.ComponentPropsWithRef<'a'>) {
  return (
    <a ref={ref} data-custom-link {...props}>
      {children}
    </a>
  );
}

describe('Link', () => {
  it('renders children as link text', () => {
    render(<Link href="/test">Click me</Link>);
    expect(screen.getByRole('link', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders with href attribute', () => {
    render(<Link href="/destination">Link</Link>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/destination');
  });

  it('renders as a button when href is undefined', () => {
    render(<Link>Action</Link>);
    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
  });

  it('renders as a button when href is explicitly undefined', () => {
    render(<Link href={undefined}>Action</Link>);
    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
  });

  it('button fallback fires onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Link onClick={handleClick}>Click me</Link>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('button fallback stays focusable and inert when isDisabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Link isDisabled onClick={onClick}>
        Disabled Action
      </Link>,
    );
    const button = screen.getByRole('button');
    expect(button).not.toHaveAttribute('disabled');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    const nativeClick = vi.fn();
    button.addEventListener('click', nativeClick);
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter} ');
    expect(nativeClick).not.toHaveBeenCalled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('button fallback has type="button"', () => {
    render(<Link>Action</Link>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('button fallback supports aria-label via label prop', () => {
    render(
      <Link label="Close dialog">
        <span aria-hidden="true">✕</span>
      </Link>,
    );
    expect(screen.getByRole('button')).toHaveAttribute(
      'aria-label',
      'Close dialog',
    );
  });

  it('does not render aria-label when label is omitted', () => {
    render(<Link href="/test">Visible text</Link>);
    expect(screen.getByRole('link')).not.toHaveAttribute('aria-label');
  });

  it('renders aria-label when label prop is provided', () => {
    render(
      <Link label="Accessible label" href="/test">
        <span aria-hidden="true">🏠</span>
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Accessible label',
    );
  });

  it('renders with different color values', () => {
    const {rerender} = render(
      <Link href="/test" color="accent">
        Accent
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <Link href="/test" color="secondary">
        Secondary
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();

    rerender(
      <Link href="/test" color="inherit">
        Inherit
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('defaults the inner text type to body', () => {
    render(<Link href="/test">Body link</Link>);
    expect(screen.getByText('Body link')).toHaveClass('astryx-text');
    expect(screen.getByText('Body link')).toHaveAttribute('data-type', 'body');
  });

  it('forwards type="inherit" so the link adopts the surrounding text type', () => {
    render(
      <Link href="/test" type="inherit">
        Inline link
      </Link>,
    );
    // The inner Text renders with the `inherit` type, so font-size/line-height
    // inherit from the surrounding text rather than imposing the body type.
    const text = screen.getByText('Inline link');
    expect(text).toHaveClass('astryx-text');
    expect(text).toHaveAttribute('data-type', 'inherit');
    expect(text).not.toHaveAttribute('data-type', 'body');
  });

  it('applies hasUnderline style when true', () => {
    render(
      <Link href="/test" hasUnderline>
        Underlined Link
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('applies isDisabled state correctly', () => {
    render(
      <Link href="/test" isDisabled>
        Disabled Link
      </Link>,
    );
    // The href-less anchor keeps a Tab stop and an explicit link role.
    const link = screen.getByRole('link', {name: 'Disabled Link'});
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabIndex', '0');
    // Visual classes are preserved in the disabled state.
    expect(link?.className).toContain('astryx-link');
  });

  it('disabled link has no href attribute', () => {
    render(
      <Link href="/test" isDisabled>
        Disabled Link
      </Link>,
    );
    const link = screen.getByText('Disabled Link').closest('a');
    expect(link).not.toBeNull();
    expect(link).not.toHaveAttribute('href');
  });

  it('clicking a disabled link cancels default navigation', () => {
    render(
      <Link href="/test" isDisabled>
        Disabled Link
      </Link>,
    );
    const link = screen.getByText('Disabled Link').closest('a');
    expect(link).not.toBeNull();
    // fireEvent bypasses pointer-events, simulating programmatic/AT
    // activation. It returns false when preventDefault was called, i.e.
    // any default navigation behavior is cancelled.
    const notCancelled = fireEvent.click(link as HTMLAnchorElement);
    expect(notCancelled).toBe(false);
  });

  it('disabled link with onClick fires neither navigation nor the consumer onClick', () => {
    const handleClick = vi.fn();
    const {container} = render(
      <Link href="/test" isDisabled onClick={handleClick}>
        Disabled Link
      </Link>,
    );
    // With onClick present, a disabled Link renders as a disabled <button>
    // (useInteractiveRole excludes a disabled href). Either way the rendered
    // root must carry no live href and never invoke the consumer handler.
    const el = container.firstElementChild as HTMLElement;
    expect(el).not.toHaveAttribute('href');
    fireEvent.click(el);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled link omits target and rel', () => {
    render(
      <Link href="https://example.com" isDisabled isExternalLink>
        Disabled External
      </Link>,
    );
    const link = screen.getByText('Disabled External').closest('a');
    expect(link).not.toBeNull();
    expect(link).not.toHaveAttribute('target');
    expect(link).not.toHaveAttribute('rel');
  });

  it('disabled link renders a plain anchor, not the custom LinkComponent', () => {
    render(
      <LinkProvider component={CustomLink}>
        <Link href="/custom" as={CustomLink} isDisabled>
          Disabled Custom
        </Link>
      </LinkProvider>,
    );
    const link = screen.getByText('Disabled Custom').closest('a');
    expect(link).not.toBeNull();
    expect(link).not.toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('href');
  });

  it('renders external link with icon and target="_blank"', () => {
    render(
      <Link href="https://example.com" isExternalLink>
        External Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  it('announces the new-tab context via screen-reader text (obs-4)', () => {
    render(
      <Link href="https://example.com" isExternalLink>
        Docs
      </Link>,
    );
    // The link's accessible name includes the new-tab hint (the icon is
    // decorative).
    expect(
      screen.getByRole('link', {name: 'Docs (opens in new tab)'}),
    ).toBeInTheDocument();
  });

  it('supports a custom newTabLabel for localization', () => {
    render(
      <Link
        href="https://example.com"
        isExternalLink
        newTabLabel="(new window)">
        Docs
      </Link>,
    );
    expect(
      screen.getByRole('link', {name: 'Docs (new window)'}),
    ).toBeInTheDocument();
  });

  it('does not add new-tab text to non-external links', () => {
    render(<Link href="/internal">Internal</Link>);
    expect(screen.getByRole('link', {name: 'Internal'})).toBeInTheDocument();
  });

  it('renders external link with existing rel merged', () => {
    render(
      <Link href="https://example.com" isExternalLink rel="sponsored">
        External Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('renders with custom target without isExternalLink', () => {
    render(
      <Link href="/test" target="_parent">
        Parent Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_parent');
  });

  it('adds safe rel tokens for explicit target="_blank"', () => {
    render(
      <Link href="/test" target="_blank">
        Blank Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('preserves existing rel tokens for explicit target="_blank"', () => {
    render(
      <Link href="/test" target="_blank" rel="sponsored noopener">
        Blank Link
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn((e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
    });
    render(
      <Link href="/test" onClick={handleClick}>
        Click me
      </Link>,
    );

    await user.click(screen.getByRole('link'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(
      <Link href="/test" ref={ref}>
        Test
      </Link>,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it('renders standalone link', () => {
    render(
      <Link href="/standalone" isStandalone>
        Standalone Link
      </Link>,
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders link with tooltip', () => {
    render(
      <Link href="/settings" tooltip="Configure settings">
        Settings
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toBeInTheDocument();
  });

  it('renders custom component when as is provided', () => {
    render(
      <Link href="/custom" as={CustomLink}>
        Custom Link
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Custom Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/custom');
  });

  it('renders custom component from LinkProvider', () => {
    render(
      <LinkProvider component={CustomLink}>
        <Link href="/provider">Provider Link</Link>
      </LinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Provider Link'});
    expect(link).toHaveAttribute('data-custom-link');
  });

  it('as prop overrides LinkProvider', () => {
    function AnotherLink({
      children,
      ref,
      ...props
    }: React.ComponentPropsWithRef<'a'>) {
      return (
        <a ref={ref} data-another-link {...props}>
          {children}
        </a>
      );
    }
    render(
      <LinkProvider component={AnotherLink}>
        <Link href="/override" as={CustomLink}>
          Override Link
        </Link>
      </LinkProvider>,
    );
    const link = screen.getByRole('link', {name: 'Override Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });

  it('renders astryx-* class names for theme targeting', () => {
    render(
      <Link href="/test" color="secondary">
        Themed Link
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Themed Link'});
    expect(link.className).toContain('astryx-link');
    expect(link).toHaveAttribute('data-color', 'secondary');
  });

  it('keeps the reflected data-color when a caller passes its own', () => {
    const callerProps = {'data-color': 'danger'};
    render(
      <>
        <Link href="/test" color="secondary" {...callerProps}>
          Anchor Link
        </Link>
        <Link color="secondary" onClick={() => {}} {...callerProps}>
          Button Link
        </Link>
        <Link href="/test" color="secondary" isDisabled {...callerProps}>
          Disabled Link
        </Link>
      </>,
    );
    expect(screen.getByRole('link', {name: 'Anchor Link'})).toHaveAttribute(
      'data-color',
      'secondary',
    );
    expect(screen.getByRole('button', {name: 'Button Link'})).toHaveAttribute(
      'data-color',
      'secondary',
    );
    expect(screen.getByRole('link', {name: 'Disabled Link'})).toHaveAttribute(
      'data-color',
      'secondary',
    );
  });
});

describe('pressed state', () => {
  it('paints the pressed overlay behind a link while it is pressed', () => {
    render(<Link href="/docs">Docs</Link>);
    expectClassSet(screen.getByRole('link', {name: 'Docs'}), {
      includes: interactionOverlayPressedBackgroundColorClassName.split(' '),
    });
  });

  it('paints it on the button form too', () => {
    render(<Link onClick={() => {}}>Open</Link>);
    expectClassSet(screen.getByRole('button', {name: 'Open'}), {
      includes: interactionOverlayPressedBackgroundColorClassName.split(' '),
    });
  });

  it('does not press a disabled link', () => {
    render(
      <Link href="/docs" isDisabled>
        Docs
      </Link>,
    );
    expectClassSet(screen.getByText('Docs').closest('a')!, {
      excludes: interactionOverlayPressedBackgroundColorClassName.split(' '),
    });
  });
});

// =============================================================================
// Display: inside a clamped Text the anchor joins the text's line boxes, so
// the clamp can truncate it. Everywhere else it keeps its inline-flex box.
// Link never reads its children to decide (Link AV1).
// =============================================================================

describe('Link display', () => {
  // The box is a utility class on the root: a string literal a consumer's
  // stylesheet carries, not a StyleX declaration a test has to read back out
  // of an injected sheet.
  const inClamp = (link: ReactNode) => (
    <Text maxLines={2} hasTruncateTooltip={false}>
      Lead text {link} tail text
    </Text>
  );

  it('keeps its inline-flex box outside a clamped Text', () => {
    const {container} = render(<Link href="/docs">Documentation</Link>);
    expectClassSet(container.querySelector('a')!, {
      includes: ['inline-flex'],
      excludes: ['inline'],
    });
  });

  it('keeps its inline-flex box inside a Text that does not clamp', () => {
    const {container} = render(
      <Text>
        <Link href="/docs">Documentation</Link>
      </Text>,
    );
    expectClassSet(container.querySelector('a')!, {
      includes: ['inline-flex'],
      excludes: ['inline'],
    });
  });

  it('is inline inside a clamped Text, so the clamp can truncate it', () => {
    const {container} = render(
      inClamp(<Link href="/docs">Documentation</Link>),
    );
    expectClassSet(container.querySelector('a')!, {
      includes: ['inline'],
      excludes: ['inline-flex'],
    });
  });

  it('decides from the clamp, not the children: composed content is inline too', () => {
    const {container} = render(
      inClamp(
        <Link href="/docs">
          <strong>Docs</strong> home
        </Link>,
      ),
    );
    expectClassSet(container.querySelector('a')!, {
      includes: ['inline'],
      excludes: ['inline-flex'],
    });
  });

  it('is inline inside a clamped Text for the external-link form', () => {
    const {container} = render(
      inClamp(
        <Link href="https://example.com" isExternalLink>
          External docs
        </Link>,
      ),
    );
    expectClassSet(container.querySelector('a')!, {
      includes: ['inline'],
      excludes: ['inline-flex'],
    });
  });

  it('keeps its own box inside a clamped Text when it sets display or maxLines', () => {
    const {container} = render(
      inClamp(
        <>
          <Link href="/block" display="block">
            Block
          </Link>
          <Link href="/self" maxLines={1}>
            Self clamped
          </Link>
        </>,
      ),
    );
    for (const anchor of Array.from(container.querySelectorAll('a'))) {
      expectClassSet(anchor, {excludes: ['inline']});
    }
  });

  it('keeps the button form as an inline-flex box inside a clamped Text', () => {
    const {container} = render(
      inClamp(
        <Link onClick={() => {}} role="button">
          Action
        </Link>,
      ),
    );
    expectClassSet(container.querySelector('button')!, {
      excludes: ['inline'],
    });
  });

  it('keeps its own box in a layer opened inside a clamped Text', () => {
    const {container} = render(
      inClamp(
        <LayerContentBoundary>
          <Link href="/docs">In a layer</Link>
        </LayerContentBoundary>,
      ),
    );
    expectClassSet(container.querySelector('a')!, {excludes: ['inline']});
  });
});

describe('Link label color', () => {
  it('lets the label inherit the root color, so a theme styles Link through the link target', () => {
    for (const color of ['accent', 'primary', 'secondary'] as const) {
      const {container, unmount} = render(
        <Link href="/docs" color={color}>
          Docs
        </Link>,
      );
      const anchor = container.querySelector('a')!;
      expect(anchor).toHaveAttribute('data-color', color);
      const label = anchor.querySelector('.astryx-text')!;
      expect(label).toHaveAttribute('data-color', 'inherit');
      unmount();
    }
  });
});

describe('Link disabled exposure', () => {
  it('keeps aria-disabled and the link role when a caller passes its own', () => {
    const callerProps = {'aria-disabled': false, role: 'button'} as const;
    render(
      <Link href="/billing" isDisabled {...callerProps}>
        Billing
      </Link>,
    );
    const link = screen.getByText('Billing').closest('a') as HTMLElement;
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('role', 'link');
    expect(link).toHaveAttribute('tabindex', '0');
  });

  it('keeps aria-disabled and the button role on the button form when a caller passes its own', () => {
    const callerProps = {'aria-disabled': false, role: 'link'} as const;
    render(
      <Link onClick={() => {}} isDisabled {...callerProps}>
        Retry
      </Link>,
    );
    const button = screen.getByText('Retry').closest('button') as HTMLElement;
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('role');
  });

  it('passes keys other than Enter and Space to the caller onKeyDown', () => {
    const onKeyDown = vi.fn();
    render(
      <Link href="/billing" isDisabled onKeyDown={onKeyDown}>
        Billing
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Billing'});
    fireEvent.keyDown(link, {key: 'Enter'});
    fireEvent.keyDown(link, {key: ' '});
    expect(onKeyDown).not.toHaveBeenCalled();
    fireEvent.keyDown(link, {key: 'Escape'});
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(onKeyDown.mock.calls[0][0].key).toBe('Escape');
  });
});

describe('Link inherited interactive role', () => {
  it('renders a button inside a button-role owner', () => {
    render(
      <InteractiveRoleContext value="button">
        <Link>Open menu</Link>
      </InteractiveRoleContext>,
    );
    const button = screen.getByRole('button', {name: 'Open menu'});
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders the link component inside a link-role owner', () => {
    render(
      <InteractiveRoleContext value="link">
        <Link as={CustomLink}>Profile</Link>
      </InteractiveRoleContext>,
    );
    expect(screen.getByText('Profile').closest('a')).toHaveAttribute(
      'data-custom-link',
    );
  });

  it('renders the disabled anchor for a disabled Link inside a link-role owner', () => {
    render(
      <InteractiveRoleContext value="link">
        <Link href="/profile" as={CustomLink} isDisabled>
          Profile
        </Link>
      </InteractiveRoleContext>,
    );
    const link = screen.getByRole('link', {name: 'Profile'});
    expect(link).not.toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('href');
    expect(link).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders a disabled button for a disabled Link with href inside a button-role owner', () => {
    render(
      <InteractiveRoleContext value="button">
        <Link href="/profile" isDisabled>
          Profile
        </Link>
      </InteractiveRoleContext>,
    );
    const button = screen.getByRole('button', {name: 'Profile'});
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});

describe('Link names and native attributes', () => {
  it('uses only the label as the name of an external link', () => {
    render(
      <Link href="https://example.com" isExternalLink label="Example site">
        Example
      </Link>,
    );
    expect(
      screen.getByRole('link', {name: 'Example site'}),
    ).toBeInTheDocument();
  });

  it('lets a caller aria-label replace the label', () => {
    render(
      <Link href="/docs" label="Documentation" aria-label="Product docs">
        Docs
      </Link>,
    );
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Product docs',
    );
  });

  it('passes referrerPolicy and download to the anchor', () => {
    render(
      <Link
        href="/report.csv"
        download="report.csv"
        referrerPolicy="no-referrer">
        Report
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Report'});
    expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
    expect(link).toHaveAttribute('download', 'report.csv');
  });

  it('adds caller className and style to the root and keeps the link target', () => {
    render(
      <Link href="/docs" className="caller-class" style={{marginInline: 4}}>
        Docs
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link.className).toContain('astryx-link');
    expect(link.className).toContain('caller-class');
    expect(link.style.marginInline).toBe('4px');
  });

  it('describes the link with its tooltip text', () => {
    render(
      <Link href="/settings" tooltip="Configure settings">
        Settings
      </Link>,
    );
    const link = screen.getByRole('link', {name: 'Settings'});
    const tooltip = screen.getByRole('tooltip', {hidden: true});
    expect(tooltip).toHaveTextContent('Configure settings');
    expect(link.getAttribute('aria-describedby')).toBe(tooltip.id);
  });
});
