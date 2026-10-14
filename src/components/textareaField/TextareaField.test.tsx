import { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextareaField } from './TextareaField';

describe('TextareaField', () => {
  it('counts characters as the user types (uncontrolled)', () => {
    render(<TextareaField label="Bio" maxLength={10} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abcde' } });
    expect(screen.getByText('5 / 10')).toBeInTheDocument();
  });

  // Regression for the stale-counter bug fixed in Phase 8: previously the
  // displayed length was derived via a useEffect keyed on `value`, so a
  // `value` change driven by something other than this field's own
  // onChange (e.g. a parent "Clear" button) painted the new text with the
  // OLD count for one frame. It's now derived directly from `value` at
  // render time, so it must be correct immediately, with no interaction
  // through this component's own onChange at all.
  it('reflects an externally-driven value change immediately (controlled)', () => {
    function Harness() {
      const [value, setValue] = useState('hello');
      return (
        <>
          <TextareaField
            label="Message"
            maxLength={20}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <button onClick={() => setValue('hello world')}>external-set</button>
        </>
      );
    }

    render(<Harness />);
    expect(screen.getByText('5 / 20')).toBeInTheDocument();

    fireEvent.click(screen.getByText('external-set'));

    expect(screen.getByText('11 / 20')).toBeInTheDocument();
    expect(screen.queryByText('5 / 20')).not.toBeInTheDocument();
  });

  it('shows the danger color once the count exceeds maxLength', () => {
    render(<TextareaField label="Bio" maxLength={5} defaultValue="123456789" />);
    const counter = screen.getByText('9 / 5');
    expect(counter.className).toContain('text-sds-text-danger');
  });

  it('wires aria-invalid and aria-describedby when an error is present', () => {
    render(<TextareaField label="Bio" error="Required" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(textarea.getAttribute('aria-describedby')).toContain('-error');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('the character counter is a live region', () => {
    render(<TextareaField label="Bio" maxLength={10} defaultValue="hi" />);
    expect(screen.getByText('2 / 10')).toHaveAttribute('aria-live', 'polite');
  });

  // Regression: `error` visually REPLACES `supportText` in the shared row
  // (see TextareaField.tsx's render), so when both are supplied together,
  // `aria-describedby` must not still reference the support-text id — that
  // id never mounts in this case, which would leave a dangling reference.
  it('does not dangle-reference the support-text id when both error and supportText are supplied', () => {
    render(<TextareaField label="Bio" error="Required" supportText="Optional detail" />);
    const textarea = screen.getByRole('textbox');
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.queryByText('Optional detail')).not.toBeInTheDocument();
    expect(textarea.getAttribute('aria-describedby')).toContain('-error');
    expect(textarea.getAttribute('aria-describedby')).not.toContain('-description');
  });

  it('forwards the ref to the native <textarea> element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<TextareaField ref={ref} label="Bio" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('forces error styling from the `error` prop even when `variant="default"` is explicit', () => {
    render(<TextareaField label="Bio" variant="default" error="Invalid" />);
    // TextareaField derives the underlying Textarea's `variant` as
    // `error ? 'error' : variant` — an explicit `variant="default"` must not
    // override a present `error`.
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies classNames to the label, supportText, and error parts', () => {
    const { rerender } = render(
      <TextareaField
        label="Bio"
        supportText="Hint"
        classNames={{ label: 'label-x', supportText: 'support-x' }}
      />,
    );
    expect(screen.getByText('Bio').className).toContain('label-x');
    expect(screen.getByText('Hint').className).toContain('support-x');

    rerender(<TextareaField label="Bio" error="Bad value" classNames={{ error: 'error-x' }} />);
    expect(screen.getByText('Bad value').parentElement?.className).toContain('error-x');
  });
});
