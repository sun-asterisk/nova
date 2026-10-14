import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';

describe('Divider', () => {
  it('renders as a separator with no aria-orientation when horizontal (the default)', () => {
    render(<Divider />);
    const el = screen.getByRole('separator');
    expect(el).not.toHaveAttribute('aria-orientation');
  });

  it('announces aria-orientation="vertical" when vertical', () => {
    render(<Divider orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('forwards a ref to the underlying div', () => {
    let node: HTMLDivElement | null = null;
    render(
      <Divider
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLDivElement);
  });
});
