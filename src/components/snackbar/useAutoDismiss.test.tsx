import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Snackbar, type SnackbarProps } from './Snackbar';

// Auto-dismiss timer (useAutoDismiss, driven through <Snackbar>): fires after
// `duration`, pauses while hovered / focused / tab hidden and resumes with only
// the remaining time; `loading` and duration 0/false never auto-dismiss.
// Replaces the countdown-bar tests (the bar itself was removed 2026-10-07).
describe('Snackbar auto-dismiss', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
  });

  const setup = (props: Partial<SnackbarProps> = {}) => {
    const onClose = vi.fn();
    render(
      <Snackbar data-testid="sb" message="Saved" duration={1000} onClose={onClose} {...props} />,
    );
    return { onClose, root: screen.getByTestId('sb') };
  };
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

  it('closes once after the duration', () => {
    const { onClose } = setup();
    advance(999);
    expect(onClose).not.toHaveBeenCalled();
    advance(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    advance(5000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('pauses on hover and resumes with only the remaining time', () => {
    const { onClose, root } = setup();
    advance(400);
    fireEvent.pointerEnter(root);
    advance(5000); // time spent hovering must not count
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerLeave(root);
    advance(599);
    expect(onClose).not.toHaveBeenCalled();
    advance(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('pauses while focus is inside', () => {
    const { onClose, root } = setup();
    advance(250);
    fireEvent.focusIn(root);
    advance(5000);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.focusOut(root, { relatedTarget: document.body });
    advance(750);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('pauses while the tab is hidden', () => {
    const { onClose } = setup();
    advance(500);
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    fireEvent(document, new Event('visibilitychange'));
    advance(5000);
    expect(onClose).not.toHaveBeenCalled();
    Object.defineProperty(document, 'hidden', { configurable: true, value: false });
    fireEvent(document, new Event('visibilitychange'));
    advance(500);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['loading', { variant: 'loading' as const }],
    ['duration 0', { duration: 0 }],
    ['duration false', { duration: false as const }],
  ])('never auto-dismisses: %s', (_, props) => {
    const { onClose } = setup(props);
    advance(60_000);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('starts the timer when a loading snackbar is replaced by success', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Snackbar variant="loading" message="Uploading" duration={1000} onClose={onClose} />,
    );
    advance(10_000);
    expect(onClose).not.toHaveBeenCalled();
    rerender(<Snackbar variant="success" message="Done" duration={1000} onClose={onClose} />);
    advance(1000);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
