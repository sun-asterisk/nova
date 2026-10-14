import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

describe('RadioGroup', () => {
  it('forwards the ref to the underlying Radix root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RadioGroup ref={ref} data-testid="group">
        <RadioGroupItem value="a" />
      </RadioGroup>,
    );
    expect(ref.current).toBe(screen.getByTestId('group'));
  });

  it('merges a custom className with the base grid layout classes', () => {
    render(
      <RadioGroup className="my-custom-class" data-testid="group">
        <RadioGroupItem value="a" />
      </RadioGroup>,
    );
    const el = screen.getByTestId('group');
    expect(el.className).toContain('my-custom-class');
    expect(el.className).toContain('grid');
  });

  // The exclusive-selection contract is RadioGroup's whole reason to
  // exist — selecting one item must deselect every other item in the
  // same group. Radix provides the mechanism; this asserts Sun's wrapper
  // doesn't break it (e.g. via a stray prop override).
  it('selecting one item deselects the previously selected item', () => {
    render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" data-testid="item-a" />
        <RadioGroupItem value="b" data-testid="item-b" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'checked');
    expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'unchecked');

    fireEvent.click(screen.getByTestId('item-b'));

    expect(screen.getByTestId('item-a')).toHaveAttribute('data-state', 'unchecked');
    expect(screen.getByTestId('item-b')).toHaveAttribute('data-state', 'checked');
  });
});

describe('RadioGroupItem', () => {
  it('forwards the ref to the underlying Radix item element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <RadioGroup>
        <RadioGroupItem ref={ref} value="a" data-testid="item" />
      </RadioGroup>,
    );
    expect(ref.current).toBe(screen.getByTestId('item'));
  });

  it('renders no indicator when unchecked', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="a" />
      </RadioGroup>,
    );
    expect(container.querySelector('[data-slot="radio-group-indicator"]')).not.toBeInTheDocument();
  });

  it('renders the indicator when checked', () => {
    const { container } = render(
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" />
      </RadioGroup>,
    );
    expect(container.querySelector('[data-slot="radio-group-indicator"]')).toBeInTheDocument();
  });

  // Regression coverage for `effectiveVariant = disabled ? 'disabled' :
  // variant` (RadioGroup.tsx) — disabled must always win over an explicit
  // `variant="error"`, not silently combine with it. Verified via real
  // compiled Tailwind classes (RadioGroup.styles.ts): `border-sds-border-disable`
  // only exists in the 'disabled' variant string, `border-sds-border-danger`
  // only in 'error'.
  it('disabled forces the disabled variant even when variant="error" is also passed', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" disabled variant="error" data-testid="item" />
      </RadioGroup>,
    );
    const el = screen.getByTestId('item');
    expect(el.className).toContain('border-sds-border-disable');
    expect(el.className).not.toContain('border-sds-border-danger');
  });

  it('merges a custom className with the generated variant classes', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" className="my-custom-class" data-testid="item" />
      </RadioGroup>,
    );
    const el = screen.getByTestId('item');
    expect(el.className).toContain('my-custom-class');
    expect(el.className).toContain('border-sds-border-strong');
  });

  it('disabled item has no press affordance (native disabled attribute)', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" disabled data-testid="item" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('item')).toBeDisabled();
  });

  // Phase X.1 — aria-invalid is derived from `variant`/`disabled`, never a
  // new prop. Mutation-tested: commenting out the `aria-invalid={...}` line
  // in RadioGroup.tsx makes the first two of these fail.
  it('sets aria-invalid="true" when variant="error"', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" variant="error" data-testid="item" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not set aria-invalid for the default variant', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" data-testid="item" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('item')).not.toHaveAttribute('aria-invalid');
  });

  it('disabled suppresses aria-invalid even when variant="error" is also passed', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" disabled variant="error" data-testid="item" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('item')).not.toHaveAttribute('aria-invalid');
  });

  it('an explicit aria-invalid prop always wins over the derived value', () => {
    render(
      <RadioGroup>
        <RadioGroupItem value="a" variant="error" aria-invalid={false} data-testid="item" />
      </RadioGroup>,
    );
    expect(screen.getByTestId('item')).toHaveAttribute('aria-invalid', 'false');
  });
});
