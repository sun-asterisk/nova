import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Avatar ref={ref} initial="A" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('renders the initial fallback when no src is provided', () => {
    render(<Avatar initial="鈴" />);
    expect(screen.getByText('鈴')).toBeInTheDocument();
  });

  // Regression coverage for a real bug found while writing this file:
  // Radix's `Avatar.Fallback` applies `delayMs` unconditionally whenever the
  // prop is present, even with no `Image` mounted at all — passing a fixed
  // `delayMs={200}` regardless of `src` made the fallback (the common case:
  // no photo at all) delay for no reason. Fixed by only passing `delayMs`
  // when `src` is actually set.
  it('renders the default IconUser fallback when neither src nor initial are provided', () => {
    const { container } = render(<Avatar />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders a custom icon fallback when provided (and no initial)', () => {
    render(<Avatar icon={<span data-testid="custom-icon" />} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('prioritizes initial over a custom icon when both are provided (no src)', () => {
    render(<Avatar initial="A" icon={<span data-testid="custom-icon" />} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByTestId('custom-icon')).not.toBeInTheDocument();
  });

  it('applies the ring classes only when ring is true', () => {
    const { rerender } = render(<Avatar initial="A" data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).not.toContain('ring-2');

    rerender(<Avatar initial="A" ring data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('ring-2');
  });

  it('applies each size variant class', () => {
    const { rerender } = render(<Avatar initial="A" size="xsmall" data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('size-[24px]');

    rerender(<Avatar initial="A" size="xlarge" data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('size-[80px]');
  });

  it('renders a status dot with the correct color class for each status value', () => {
    const { container, rerender } = render(<Avatar initial="A" status="online" />);
    expect(container.querySelector('.bg-sds-icon-success')).toBeInTheDocument();

    rerender(<Avatar initial="A" status="away" />);
    expect(container.querySelector('.bg-sds-icon-caution')).toBeInTheDocument();

    rerender(<Avatar initial="A" status="busy" />);
    expect(container.querySelector('.bg-sds-icon-danger')).toBeInTheDocument();

    rerender(<Avatar initial="A" status="offline" />);
    expect(container.querySelector('.bg-sds-icon-disable')).toBeInTheDocument();
  });

  it('does not render a status dot at size="xsmall" even when status is set', () => {
    const { container } = render(<Avatar initial="A" size="xsmall" status="online" />);
    expect(container.querySelector('.bg-sds-icon-success')).not.toBeInTheDocument();
  });

  it('exposes a default, capitalized accessible status label when statusLabel is omitted', () => {
    render(<Avatar initial="A" status="busy" />);
    expect(screen.getByText('Busy')).toBeInTheDocument();
  });

  it('uses a custom statusLabel over the default when provided', () => {
    render(<Avatar initial="A" status="busy" statusLabel="取り込み中" />);
    expect(screen.getByText('取り込み中')).toBeInTheDocument();
    expect(screen.queryByText('Busy')).not.toBeInTheDocument();
  });

  it('does not render an <img> element when src is omitted', () => {
    const { container } = render(<Avatar initial="A" />);
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('merges a consumer className with the internal variant classes', () => {
    render(<Avatar initial="A" className="my-custom-class" data-testid="avatar" />);
    expect(screen.getByTestId('avatar').className).toContain('my-custom-class');
  });

  // NX-05 (2026-09-29): an initials/icon-only avatar had no accessible-name
  // path — Radix's Root is a role-less <span>, where aria-label is
  // prohibited. A named avatar is now one `role="img"` graphic.
  describe('accessible name', () => {
    it('names an initials-only avatar via alt, as a single role="img"', () => {
      render(<Avatar initial="鈴" alt="Suzuki Taro" />);
      const avatar = screen.getByRole('img', { name: 'Suzuki Taro' });
      expect(avatar).toHaveTextContent('鈴');
    });

    it('names an icon-only avatar via aria-label, with a valid role (no aria-prohibited-attr)', () => {
      render(<Avatar aria-label="Unknown user" />);
      const avatar = screen.getByRole('img', { name: 'Unknown user' });
      expect(avatar).toHaveAttribute('role', 'img');
    });

    it('supports aria-labelledby', () => {
      render(
        <>
          <span id="who">Jane Doe</span>
          <Avatar initial="J" aria-labelledby="who" />
        </>,
      );
      expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
    });

    it('folds the status label into the name when the avatar is named', () => {
      const { rerender } = render(<Avatar initial="J" alt="Jane Doe" status="online" />);
      expect(screen.getByRole('img', { name: 'Jane Doe, Online' })).toBeInTheDocument();
      rerender(
        <>
          <span id="who2">Jane Doe</span>
          <Avatar initial="J" aria-labelledby="who2" status="busy" statusLabel="取り込み中" />
        </>,
      );
      expect(screen.getByRole('img', { name: 'Jane Doe 取り込み中' })).toBeInTheDocument();
    });

    it('stays a role-less element when unnamed (name given by adjacent visible text)', () => {
      const { container } = render(<Avatar initial="J" />);
      expect(container.firstElementChild).not.toHaveAttribute('role');
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });
  });
});
