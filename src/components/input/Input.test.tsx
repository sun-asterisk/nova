import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

// Regression coverage for a previously-zero-coverage gap: Input had no
// `.test.tsx` at all despite real derived-state logic (disabled forcing the
// `disabled` visual variant regardless of an explicit `variant`, adornment
// presence toggling input padding, and a three-slot `classNames` API) that
// Storybook's own play()s don't exercise directly.
describe('Input', () => {
  it('forwards the ref to the native <input> element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('forces the disabled visual variant even when `variant="error"` is explicit', () => {
    render(<Input variant="error" disabled placeholder="Field" />);
    // Input derives its wrapper variant as `disabled ? 'disabled' : variant` —
    // an explicit `variant="error"` must not override a present `disabled`.
    const input = screen.getByPlaceholderText('Field');
    expect(input.parentElement?.className).toContain('cursor-not-allowed');
    expect(input.parentElement?.className).not.toMatch(/border-sds-border-danger/);
  });

  it('adds left/right padding to the input only when the matching adornment is present', () => {
    const { rerender } = render(<Input placeholder="Plain" />);
    expect(screen.getByPlaceholderText('Plain').className).not.toMatch(/pl-\[44px\]|pr-\[44px\]/);

    rerender(<Input placeholder="Plain" startAdornment={<span>icon</span>} />);
    expect(screen.getByPlaceholderText('Plain').className).toContain('pl-[44px]');
    expect(screen.getByPlaceholderText('Plain').className).not.toContain('pr-[44px]');

    rerender(<Input placeholder="Plain" endAdornment={<span>icon</span>} />);
    expect(screen.getByPlaceholderText('Plain').className).toContain('pr-[44px]');
    expect(screen.getByPlaceholderText('Plain').className).not.toContain('pl-[44px]');
  });

  it('renders the startAdornment non-interactively (pointer-events-none) and the endAdornment interactively', () => {
    render(
      <Input
        placeholder="Field"
        startAdornment={<span data-testid="start">s</span>}
        endAdornment={<span data-testid="end">e</span>}
      />,
    );
    expect(screen.getByTestId('start').parentElement?.className).toContain('pointer-events-none');
    expect(screen.getByTestId('end').parentElement?.className).not.toContain('pointer-events-none');
  });

  it('applies classNames to the wrapper, startAdornment, and endAdornment parts independently', () => {
    render(
      <Input
        placeholder="Field"
        startAdornment={<span data-testid="start">s</span>}
        endAdornment={<span data-testid="end">e</span>}
        classNames={{ wrapper: 'wrapper-x', startAdornment: 'start-x', endAdornment: 'end-x' }}
      />,
    );
    const input = screen.getByPlaceholderText('Field');
    expect(input.parentElement?.className).toContain('wrapper-x');
    expect(screen.getByTestId('start').parentElement?.className).toContain('start-x');
    expect(screen.getByTestId('end').parentElement?.className).toContain('end-x');
  });

  it('applies cursor-not-allowed to the wrapper, both adornments, and the input when disabled', () => {
    render(
      <Input
        placeholder="Field"
        disabled
        startAdornment={<span data-testid="start">s</span>}
        endAdornment={<span data-testid="end">e</span>}
      />,
    );
    const input = screen.getByPlaceholderText('Field');
    expect(input.className).toContain('cursor-not-allowed');
    expect(input.parentElement?.className).toContain('cursor-not-allowed');
    expect(screen.getByTestId('start').parentElement?.className).toContain('cursor-not-allowed');
    expect(screen.getByTestId('end').parentElement?.className).toContain('cursor-not-allowed');
  });

  it('defaults the placeholder to the Japanese fallback when none is provided', () => {
    render(<Input />);
    expect(screen.getByPlaceholderText('テキストを入力')).toBeInTheDocument();
  });

  it('uses an explicit placeholder over the default when provided', () => {
    render(<Input placeholder="Custom" />);
    expect(screen.queryByPlaceholderText('テキストを入力')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('Custom')).toBeInTheDocument();
  });

  it('passes through native input attributes unrelated to Input-specific props', () => {
    render(<Input placeholder="Field" name="email" type="email" maxLength={50} />);
    const input = screen.getByPlaceholderText('Field');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('maxlength', '50');
  });
});
