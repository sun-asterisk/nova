import { type ComponentProps, createRef, forwardRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Link } from './Link';

describe('Link', () => {
  it('renders as a real <a> element with href by default', () => {
    render(<Link href="/settings">Settings</Link>);
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('forwards the ref to the <a> element when enabled', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Link ref={ref} href="/settings">
        Settings
      </Link>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current).toBe(screen.getByRole('link', { name: 'Settings' }));
  });

  it('forwards the ref to the <span> element when disabled', () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Link ref={ref} href="/settings" disabled>
        Settings
      </Link>,
    );
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  // Regression coverage for the exact accessibility contract Figma specifies
  // for this component: disabled must render as non-interactive TEXT, not a
  // disabled <a> (anchors have no native `disabled` attribute at all).
  it('renders as a non-interactive <span> when disabled, not an <a>, and does not forward href/onClick', () => {
    const onClick = vi.fn();
    render(
      <Link href="/settings" onClick={onClick} disabled>
        Settings
      </Link>,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    const span = screen.getByText('Settings');
    expect(span.tagName).toBe('SPAN');
    expect(span).toHaveAttribute('aria-disabled', 'true');
    expect(span).not.toHaveAttribute('href');
    span.click();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not forward target/rel to the disabled <span> either', () => {
    render(
      <Link href="https://example.com" target="_blank" rel="noopener noreferrer" disabled>
        Example
      </Link>,
    );
    const span = screen.getByText('Example');
    expect(span).not.toHaveAttribute('target');
    expect(span).not.toHaveAttribute('rel');
  });

  it('still forwards non-interactive attributes (data-*, id) to the disabled <span>', () => {
    render(
      <Link href="/settings" disabled data-testid="disabled-link" id="my-link">
        Settings
      </Link>,
    );
    const span = screen.getByTestId('disabled-link');
    expect(span).toHaveAttribute('id', 'my-link');
  });

  it('renders startAdornment before and endAdornment after the label', () => {
    render(
      <Link
        href="/settings"
        startAdornment={<span data-testid="start">S</span>}
        endAdornment={<span data-testid="end">E</span>}
      >
        Settings
      </Link>,
    );
    const link = screen.getByRole('link');
    const children = Array.from(link.childNodes);
    const startIndex = children.findIndex((n) => (n as HTMLElement).dataset?.testid === 'start');
    const labelIndex = children.findIndex((n) => n.textContent === 'Settings');
    const endIndex = children.findIndex((n) => (n as HTMLElement).dataset?.testid === 'end');
    expect(startIndex).toBeLessThan(labelIndex);
    expect(labelIndex).toBeLessThan(endIndex);
  });

  it('applies each size variant class', () => {
    const { rerender } = render(
      <Link href="/settings" size="large">
        Settings
      </Link>,
    );
    expect(screen.getByRole('link').className).toContain('typo-body-l');

    rerender(
      <Link href="/settings" size="medium">
        Settings
      </Link>,
    );
    expect(screen.getByRole('link').className).toContain('typo-body-m');

    rerender(
      <Link href="/settings" size="small">
        Settings
      </Link>,
    );
    expect(screen.getByRole('link').className).not.toContain('typo-body-l');
    expect(screen.getByRole('link').className).not.toContain('typo-body-m');
  });

  it('merges a consumer className with the internal variant classes', () => {
    render(
      <Link href="/settings" className="my-custom-class">
        Settings
      </Link>,
    );
    expect(screen.getByRole('link').className).toContain('my-custom-class');
  });

  // RR-01 (2026-09-29): router links (React Router / Next.js) render their
  // own anchor, so Link must be able to style it instead of nesting <a>s.
  describe('asChild', () => {
    const RouterLink = forwardRef<HTMLAnchorElement, ComponentProps<'a'> & { to: string }>(
      ({ to, ...props }, ref) => <a ref={ref} href={to} data-router="true" {...props} />,
    );
    RouterLink.displayName = 'RouterLink';

    it('merges Link styling/props onto the child element instead of rendering its own <a>', () => {
      const { container } = render(
        <Link asChild size="small" className="extra" data-testid="lnk">
          <RouterLink to="/settings">Settings</RouterLink>
        </Link>,
      );
      const anchors = container.querySelectorAll('a');
      expect(anchors).toHaveLength(1);
      const anchor = anchors[0];
      expect(anchor).toHaveAttribute('data-router', 'true');
      expect(anchor).toHaveAttribute('href', '/settings');
      expect(anchor).toHaveAttribute('data-testid', 'lnk');
      expect(anchor.className).toContain('extra');
      expect(anchor.className).toContain('underline');
      expect(screen.getByRole('link', { name: 'Settings' })).toBe(anchor);
    });

    it('places adornments inside the child, around its label', () => {
      render(
        <Link
          asChild
          startAdornment={<span data-testid="start" />}
          endAdornment={<span data-testid="end" />}
        >
          <RouterLink to="/x">Label</RouterLink>
        </Link>,
      );
      const link = screen.getByRole('link', { name: 'Label' });
      expect(link.firstElementChild).toBe(screen.getByTestId('start'));
      expect(link.lastElementChild).toBe(screen.getByTestId('end'));
    });

    it('forwards the ref to the child element', () => {
      const ref = createRef<HTMLAnchorElement | HTMLSpanElement>();
      render(
        <Link asChild ref={ref}>
          <RouterLink to="/x">Label</RouterLink>
        </Link>,
      );
      expect(ref.current).toBe(screen.getByRole('link'));
    });

    it('with disabled, drops the child (no navigation) and renders its label as non-interactive text', () => {
      const { container } = render(
        <Link asChild disabled>
          <RouterLink to="/x">Label</RouterLink>
        </Link>,
      );
      expect(container.querySelector('a')).toBeNull();
      const span = screen.getByText('Label');
      expect(span.tagName).toBe('SPAN');
      expect(span).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
