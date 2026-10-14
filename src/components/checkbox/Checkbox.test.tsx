import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('forwards the ref to the underlying Radix root element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Checkbox ref={ref} data-testid="checkbox" />);
    expect(ref.current).toBe(screen.getByTestId('checkbox'));
  });

  it('renders no indicator icon when unchecked', () => {
    const { container } = render(<Checkbox checked={false} />);
    expect(container.querySelector('[data-slot="checkbox-indicator"]')).not.toBeInTheDocument();
  });

  // Which icon is VISIBLE (check vs. minus) is decided by CSS on the
  // Indicator's data-state, so it's covered with the real stylesheet loaded
  // in Checkbox.indicator.test.tsx — both icons are always in the DOM, so a
  // DOM-only path check here can't tell them apart.

  // Regression coverage for `effectiveVariant = disabled ? 'disabled' :
  // variant` (Checkbox.tsx) — disabled must always win over an explicit
  // `variant="error"`, not silently combine with it. Verified via real
  // compiled Tailwind classes (Checkbox.styles.ts), not source inspection:
  // `bg-sds-surface-disabled` only exists in the 'disabled' variant string,
  // `bg-sds-surface-danger`/`border-sds-border-danger` only in 'error'.
  it('disabled forces the disabled variant even when variant="error" is also passed', () => {
    render(<Checkbox disabled variant="error" data-testid="checkbox" />);
    const el = screen.getByTestId('checkbox');
    expect(el.className).toContain('bg-sds-surface-disabled');
    expect(el.className).not.toContain('border-sds-border-danger');
  });

  it('merges a custom className with the generated variant classes', () => {
    render(<Checkbox className="my-custom-class" data-testid="checkbox" />);
    const el = screen.getByTestId('checkbox');
    expect(el.className).toContain('my-custom-class');
    expect(el.className).toContain('border-sds-border-strong');
  });

  it('disabled checkbox has no press affordance (native disabled attribute)', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toBeDisabled();
  });

  // Phase X.1 — aria-invalid is derived from `variant`/`disabled`, never a
  // new prop. Mutation-tested: commenting out the `aria-invalid={...}` line
  // in Checkbox.tsx makes the first two of these fail (both assert a real
  // ARIA attribute value, not just "renders without crashing").
  it('sets aria-invalid="true" when variant="error"', () => {
    render(<Checkbox variant="error" data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid for the default variant', () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).not.toHaveAttribute('aria-invalid');
  });

  it('disabled suppresses aria-invalid even when variant="error" is also passed', () => {
    render(<Checkbox disabled variant="error" data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).not.toHaveAttribute('aria-invalid');
  });

  it('an explicit aria-invalid prop always wins over the derived value', () => {
    render(<Checkbox variant="error" aria-invalid={false} data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-invalid', 'false');
  });
});
