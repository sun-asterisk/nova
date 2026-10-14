import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('forwards a ref to the underlying textarea element', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} data-testid="textarea" />);
    expect(ref.current).toBe(screen.getByTestId('textarea'));
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('falls back to a generated id when none is provided', () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId('textarea').id).not.toBe('');
  });

  it('uses the explicitly provided id instead of the generated one', () => {
    render(<Textarea id="my-textarea" data-testid="textarea" />);
    expect(screen.getByTestId('textarea').id).toBe('my-textarea');
  });

  it('defaults the placeholder to the Japanese fallback text', () => {
    render(<Textarea data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('placeholder', 'テキストを入力');
  });

  it('respects an explicit placeholder over the default', () => {
    render(<Textarea placeholder="Custom placeholder" data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveAttribute('placeholder', 'Custom placeholder');
  });

  it('merges a custom className with the generated variant classes', () => {
    render(<Textarea className="my-custom-class" data-testid="textarea" />);
    const el = screen.getByTestId('textarea');
    expect(el.className).toContain('my-custom-class');
  });

  it('disabled textarea has the native disabled attribute', () => {
    render(<Textarea disabled data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toBeDisabled();
  });

  // Contract changed 2026-10-05 (/component TextArea, Figma Text Area 598:2713,
  // team decision): disabled no longer erases the error state — a disabled
  // textarea in error keeps the danger border. Computed-style coverage lives
  // in Textarea.figma.test.tsx; this keeps the class-level contract.
  it('disabled + variant="error" combines both (disabled background, danger border)', () => {
    render(<Textarea disabled variant="error" data-testid="textarea" />);
    const el = screen.getByTestId('textarea');
    expect(el.className).toContain('bg-sds-surface-disabled');
    expect(el.className).toContain('border-sds-border-danger');
  });

  it('a controlled value renders and responds to onChange', () => {
    render(<Textarea value="hello" onChange={() => {}} data-testid="textarea" />);
    expect(screen.getByTestId('textarea')).toHaveValue('hello');
  });
});
