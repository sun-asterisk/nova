import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusIcon } from './StatusIcon';

describe('StatusIcon', () => {
  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<StatusIcon ref={ref} status="info" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it('is aria-hidden and has no role by default (decorative, paired with text)', () => {
    render(<StatusIcon status="info" data-testid="icon" />);
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).not.toHaveAttribute('role');
  });

  it('drops aria-hidden and exposes role="img" when aria-label is provided', () => {
    render(<StatusIcon status="danger" aria-label="Error" />);
    const icon = screen.getByRole('img', { name: 'Error' });
    expect(icon).not.toHaveAttribute('aria-hidden');
  });

  it('drops aria-hidden and exposes role="img" when aria-labelledby is provided', () => {
    render(
      <>
        <span id="label-id">Error occurred</span>
        <StatusIcon status="danger" aria-labelledby="label-id" />
      </>,
    );
    const icon = screen.getByRole('img', { name: 'Error occurred' });
    expect(icon).not.toHaveAttribute('aria-hidden');
  });

  it('renders the correct icon component for each non-loading status', () => {
    const { container, rerender } = render(<StatusIcon status="info" />);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<StatusIcon status="success" />);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<StatusIcon status="caution" />);
    expect(container.querySelector('svg')).toBeInTheDocument();

    rerender(<StatusIcon status="danger" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('applies the correct non-inverse color class per status', () => {
    const { container, rerender } = render(<StatusIcon status="info" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('text-sds-icon-info');

    rerender(<StatusIcon status="success" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain(
      'text-sds-icon-success',
    );

    rerender(<StatusIcon status="caution" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain(
      'text-sds-icon-caution',
    );

    rerender(<StatusIcon status="danger" />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain('text-sds-icon-danger');
  });

  it('applies the correct inverse color class per status', () => {
    const { container, rerender } = render(<StatusIcon status="info" inverse />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain(
      'text-sds-icon-info-inverse',
    );

    rerender(<StatusIcon status="danger" inverse />);
    expect(container.querySelector('svg')?.getAttribute('class')).toContain(
      'text-sds-icon-danger-inverse',
    );
  });

  it('renders Spinner for status="loading" instead of a static icon', () => {
    const { container } = render(<StatusIcon status="loading" />);
    // Spinner renders its own role="status" live region as a descendant.
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
  });

  it('passes inverse through to the loading Spinner', () => {
    const { container } = render(<StatusIcon status="loading" inverse />);
    // Spinner renders [track, arc] circles — the arc (second) carries the
    // `icon-primary`-based color; see Spinner.tsx.
    const arc = container.querySelectorAll('circle')[1];
    expect(arc.getAttribute('class')).toContain('stroke-sds-icon-primary-inverse');
  });

  it('merges a consumer className with the internal layout classes', () => {
    render(<StatusIcon status="info" className="my-custom-class" data-testid="icon" />);
    expect(screen.getByTestId('icon').className).toContain('my-custom-class');
  });
});
