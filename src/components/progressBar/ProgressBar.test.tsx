import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ProgressBar ref={ref} value={50} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders a role="progressbar" with the correct ARIA value attributes', () => {
    render(<ProgressBar value={42} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuetext', '42%');
  });

  it('respects a custom max for the ARIA attributes', () => {
    render(<ProgressBar value={18} max={40} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '40');
    expect(bar).toHaveAttribute('aria-valuenow', '18');
    expect(bar).toHaveAttribute('aria-valuetext', '45%');
  });

  it('uses a custom getValueLabel for aria-valuetext when provided', () => {
    render(<ProgressBar value={18} max={40} getValueLabel={(v, m) => `${v} of ${m} images`} />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuetext', '18 of 40 images');
  });

  it('renders the indicator width as value/max as a percentage', () => {
    const { container } = render(<ProgressBar value={25} max={50} />);
    const indicator = container.querySelector('[style]') as HTMLElement;
    expect(indicator.style.width).toBe('50%');
  });

  it('clamps the rendered indicator width for an out-of-range value, without crashing', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<ProgressBar value={150} />);
    const indicator = container.querySelector('[style]') as HTMLElement;
    expect(indicator.style.width).toBe('100%');
    errorSpy.mockRestore();
  });

  it('clamps the rendered indicator width for a negative value, without crashing', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<ProgressBar value={-10} />);
    const indicator = container.querySelector('[style]') as HTMLElement;
    expect(indicator.style.width).toBe('0%');
    errorSpy.mockRestore();
  });

  it('clamps the value passed to Radix for value > max, so ARIA stays determinate (aria-valuenow=max) and no console error is logged', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ProgressBar value={150} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '100');
    expect(bar).toHaveAttribute('aria-valuetext', '100%');
    expect(bar).toHaveAttribute('data-state', 'complete');
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('clamps the value passed to Radix for a negative value, so ARIA stays determinate (aria-valuenow=0) and no console error is logged', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ProgressBar value={-10} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('data-state', 'loading');
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it.each([0, -5, Number.NaN])(
    "falls back to max=100 (Radix's own default) for an invalid max=%s — no NaN width, ARIA and width agree",
    (max) => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const { container } = render(<ProgressBar value={40} max={max} />);
      const bar = screen.getByRole('progressbar');
      const indicator = container.querySelector('[style]') as HTMLElement;
      expect(bar).toHaveAttribute('aria-valuemax', '100');
      expect(bar).toHaveAttribute('aria-valuenow', '40');
      expect(indicator.style.width).toBe('40%');
      expect(errorSpy).not.toHaveBeenCalled();
      errorSpy.mockRestore();
    },
  );

  it('keeps a null/undefined value (untyped JS consumer) indeterminate instead of coercing it to 0', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = render(<ProgressBar value={null as unknown as number} />);
    const bar = screen.getByRole('progressbar');
    const indicator = container.querySelector('[style]') as HTMLElement;
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-state', 'indeterminate');
    expect(indicator.style.width).toBe('0%');
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('applies each size variant class to the root', () => {
    const { rerender } = render(<ProgressBar value={50} size="small" data-testid="bar" />);
    expect(screen.getByTestId('bar').className).toContain('h-[4px]');

    rerender(<ProgressBar value={50} size="medium" data-testid="bar" />);
    expect(screen.getByTestId('bar').className).toContain('h-[6px]');

    rerender(<ProgressBar value={50} size="large" data-testid="bar" />);
    expect(screen.getByTestId('bar').className).toContain('h-[8px]');
  });

  it('applies the non-inverse track/fill color classes by default', () => {
    const { container } = render(<ProgressBar value={50} data-testid="bar" />);
    expect(screen.getByTestId('bar').className).toContain('bg-sds-surface-subtle');
    expect(screen.getByTestId('bar').className).not.toContain('bg-sds-surface-subtle-inverse');
    const indicator = container.querySelector('[style]') as HTMLElement;
    expect(indicator.className).toContain('bg-sds-icon-primary');
    expect(indicator.className).not.toContain('bg-sds-icon-primary-inverse');
  });

  it('applies the inverse track/fill color classes when inverse is true', () => {
    const { container } = render(<ProgressBar value={50} inverse data-testid="bar" />);
    expect(screen.getByTestId('bar').className).toContain('bg-sds-surface-subtle-inverse');
    const indicator = container.querySelector('[style]') as HTMLElement;
    expect(indicator.className).toContain('bg-sds-icon-primary-inverse');
  });

  it('merges a consumer className with the internal variant classes', () => {
    render(<ProgressBar value={50} className="my-custom-class" data-testid="bar" />);
    expect(screen.getByTestId('bar').className).toContain('my-custom-class');
  });
});
