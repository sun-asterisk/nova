import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Spinner ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders a role="status" live region', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('announces a default "Loading" label when none is provided', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });

  it('announces a custom label when provided', () => {
    render(<Spinner label="読み込んでいます" />);
    expect(screen.getByRole('status')).toHaveTextContent('読み込んでいます');
  });

  it('hides the decorative svg from assistive technology', () => {
    const { container } = render(<Spinner />);
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies each size variant with its own box dimensions and stroke width', () => {
    const { container, rerender } = render(<Spinner size="small" data-testid="spinner" />);
    expect(screen.getByTestId('spinner').className).toContain('size-[16px]');
    expect(container.querySelector('circle')).toHaveAttribute('stroke-width', '1.5');

    rerender(<Spinner size="medium" data-testid="spinner" />);
    expect(screen.getByTestId('spinner').className).toContain('size-[24px]');
    expect(container.querySelector('circle')).toHaveAttribute('stroke-width', '2');

    rerender(<Spinner size="large" data-testid="spinner" />);
    expect(screen.getByTestId('spinner').className).toContain('size-[40px]');
    expect(container.querySelector('circle')).toHaveAttribute('stroke-width', '3');
  });

  it('renders the arc as 33% of the circle circumference, the remainder as the gap', () => {
    const { container } = render(<Spinner size="small" />);
    const arc = container.querySelectorAll('circle')[1];
    const radius = (16 - 1.5) / 2;
    const circumference = 2 * Math.PI * radius;
    const expectedArcLength = circumference * 0.33;
    const [dash, gap] = arc.getAttribute('stroke-dasharray')!.split(' ').map(Number);
    expect(dash).toBeCloseTo(expectedArcLength, 5);
    expect(gap).toBeCloseTo(circumference, 5);
  });

  it('applies the non-inverse track/arc color classes by default', () => {
    const { container } = render(<Spinner />);
    const [track, arc] = container.querySelectorAll('circle');
    expect(track.getAttribute('class')).toContain('stroke-sds-surface-subtle');
    expect(track.getAttribute('class')).not.toContain('stroke-sds-surface-subtle-inverse');
    expect(arc.getAttribute('class')).toContain('stroke-sds-icon-primary');
    expect(arc.getAttribute('class')).not.toContain('stroke-sds-icon-primary-inverse');
  });

  it('applies the inverse track/arc color classes when inverse is true', () => {
    const { container } = render(<Spinner inverse />);
    const [track, arc] = container.querySelectorAll('circle');
    expect(track.getAttribute('class')).toContain('stroke-sds-surface-subtle-inverse');
    expect(arc.getAttribute('class')).toContain('stroke-sds-icon-primary-inverse');
  });

  it('respects prefers-reduced-motion by pairing the spin animation with a motion-reduce override', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('class')).toContain('animate-spinner-rotate');
    expect(svg?.getAttribute('class')).toContain('motion-reduce:animate-none');
  });

  it('merges a consumer className with the internal variant classes', () => {
    render(<Spinner className="my-custom-class" data-testid="spinner" />);
    expect(screen.getByTestId('spinner').className).toContain('my-custom-class');
  });
});
