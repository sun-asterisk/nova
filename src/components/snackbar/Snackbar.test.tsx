import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Snackbar } from './Snackbar';

describe('Snackbar', () => {
  it('uses role="status" for non-error variants and role="alert" for error', () => {
    const { rerender } = render(<Snackbar title="Saved" variant="success" duration={false} />);
    expect(screen.getByRole('status')).toBeInTheDocument();

    rerender(<Snackbar title="Failed" variant="error" duration={false} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  // Regression for the missing idempotency guard fixed in Phase 8: onClose
  // could previously fire twice for the same snackbar instance (once from
  // the close button, once from the progress bar's auto-dismiss
  // completing around the same time) — the consumer's onClose should be
  // called exactly once no matter how many internal triggers fire.
  it('calls onClose exactly once even if the close button is triggered twice', () => {
    const onClose = vi.fn();
    render(<Snackbar title="Saved" duration={false} closable onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders no close button when closable is false', () => {
    render(<Snackbar title="Saved" duration={false} closable={false} />);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('renders provided actions and forwards their onClick', () => {
    const onClick = vi.fn();
    render(<Snackbar title="Saved" duration={false} actions={[{ label: 'Undo', onClick }]} />);
    fireEvent.click(screen.getByText('Undo'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('forwards the ref to the root <div>', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Snackbar ref={ref} title="Saved" duration={false} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders a custom icon instead of the variant default when provided', () => {
    render(
      <Snackbar
        title="Saved"
        duration={false}
        variant="success"
        icon={<span data-testid="custom-icon" />}
      />,
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('does not render a progress bar when duration is false', () => {
    const { container } = render(<Snackbar title="Saved" duration={false} />);
    // ProgressBar renders an inline `style="width: ..."` div — its absence
    // confirms `showProgress` correctly derived `false` for this case.
    expect(container.querySelector('div[style*="width"]')).not.toBeInTheDocument();
  });

  it('does not render a message element when message is omitted', () => {
    const { container } = render(<Snackbar title="Saved" duration={false} />);
    expect(container.querySelector('.typo-body-m')).not.toBeInTheDocument();

    const { container: withMessage } = render(
      <Snackbar title="Saved" duration={false} message="Details" />,
    );
    expect(withMessage.querySelector('.typo-body-m')).toBeInTheDocument();
  });

  it('applies classNames to the icon, content, actions, and closeButton parts', () => {
    render(
      <Snackbar
        title="Saved"
        duration={false}
        actions={[{ label: 'Undo', onClick: () => {} }]}
        classNames={{
          icon: 'icon-x',
          content: 'content-x',
          actions: 'actions-x',
          closeButton: 'close-x',
        }}
      />,
    );
    // `closest` (not `parentElement`): the title text sits in a span inside
    // its own 22px title box (2026-10-07), not directly in the content div.
    expect(screen.getByText('Saved').closest('.content-x')).not.toBeNull();
    expect(document.querySelector('.icon-x svg')).not.toBeNull();
    expect(screen.getByText('Undo').parentElement?.className).toContain('actions-x');
    expect(screen.getByRole('button', { name: /close/i }).className).toContain('close-x');
  });
});
