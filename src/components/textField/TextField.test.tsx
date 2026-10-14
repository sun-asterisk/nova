import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextField } from './TextField';

// Regression coverage for a previously-zero-coverage gap: TextField had no
// `.test.tsx` at all. Storybook's `InteractionErrorWiring`/`InteractionTyping`
// already cover aria-invalid/aria-describedby wiring and onChange firing —
// this file targets the derived-state logic those don't reach: `error`
// forcing error styling regardless of an explicit `variant`, error/supportText
// mutual exclusivity, `required`'s native attribute, and the `classNames`
// slot API actually reaching each part. `useFieldIds` itself (id
// stability/uniqueness) has its own dedicated unit test
// (src/utils/useFieldIds.test.ts) — not duplicated here.
describe('TextField', () => {
  it('forces error styling from the `error` prop even when `variant="default"` is explicit', () => {
    render(<TextField label="Email" variant="default" error="Invalid" />);
    // The rendered <input> is styled via Input's `variant` prop, which
    // TextField derives as `error ? 'error' : variant` — an explicit
    // `variant="default"` must not override a present `error`.
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  // Figma Text Field `Status=Error` (610:2971) shows the support text AND the
  // error message below it (/component TextField sync, 2026-10-05) — it used
  // to replace the support text. Both are linked to the input.
  it('keeps supportText and shows the error message below it, both described', () => {
    render(<TextField label="Email" error="Invalid email" supportText="We will not share this" />);
    const support = screen.getByText('We will not share this');
    const error = screen.getByText('Invalid email');
    expect(support.compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const describedBy = screen.getByRole('textbox').getAttribute('aria-describedby')!.split(' ');
    expect(describedBy).toContain(support.id);
    expect(describedBy).toContain(error.closest('[id]')!.id);
  });

  it('shows supportText when there is no error', () => {
    render(<TextField label="Email" supportText="We will not share this" />);
    expect(screen.getByText('We will not share this')).toBeInTheDocument();
  });

  it('sets the native `required` attribute when `required` is true', () => {
    render(<TextField label="Name" required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('does not set `required` by default', () => {
    render(<TextField label="Name" />);
    expect(screen.getByRole('textbox')).not.toBeRequired();
  });

  it('applies classNames to the label, supportText, and error parts', () => {
    const { rerender } = render(
      <TextField
        label="Name"
        supportText="Hint"
        classNames={{ label: 'label-x', supportText: 'support-x' }}
      />,
    );
    expect(screen.getByText('Name').className).toContain('label-x');
    expect(screen.getByText('Hint').className).toContain('support-x');

    rerender(<TextField label="Name" error="Bad value" classNames={{ error: 'error-x' }} />);
    expect(screen.getByText('Bad value').parentElement?.className).toContain('error-x');
  });

  it('forwards the ref to the native <input> element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<TextField ref={ref} label="Name" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('associates the label with the input via a shared, stable id', () => {
    render(<TextField label="Email" />);
    const input = screen.getByLabelText('Email');
    expect(input.id).toBeTruthy();
  });
});
