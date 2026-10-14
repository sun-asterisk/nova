import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';

const customMock = vi.fn();
const dismissMock = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    custom: (...args: unknown[]) => customMock(...args),
    dismiss: (...args: unknown[]) => dismissMock(...args),
  },
}));

import { showSnackbar } from './useSnackbar';

type Renderer = (id: string | number) => ReactElement;

const lastCall = () => {
  const [renderer, options] = customMock.mock.calls.at(-1) as [Renderer, { duration: number }];
  return { renderer, options };
};

describe('showSnackbar', () => {
  beforeEach(() => {
    customMock.mockReset();
    dismissMock.mockReset();
  });

  // `SnackbarProps.duration` documents `0` as "disable auto-dismiss". sonner
  // treats a falsy `duration` as "use the default" (`toast.duration ||
  // durationFromToaster || TOAST_LIFETIME` in sonner 2.0.8), so forwarding
  // `0` verbatim silently auto-dismissed after 4000ms with no progress bar.
  it('never lets sonner auto-dismiss when duration is 0', () => {
    showSnackbar({ title: 'Saved', duration: 0 });
    expect(lastCall().options.duration).toBe(Infinity);
  });

  it('renders no progress bar when duration is 0', () => {
    showSnackbar({ title: 'Saved', duration: 0 });
    const { container } = render(lastCall().renderer('t1'));
    expect(container.querySelector('div[style*="width"]')).not.toBeInTheDocument();
  });

  // Single-timer ownership: the Snackbar's useAutoDismiss owns the countdown
  // (and pauses on hover / focus / hidden tab). If sonner were also given the
  // finite duration, the two timers would race and diverge. Figma draws no
  // countdown bar (2026-10-07), so an auto-dismissing snackbar has no bar.
  it('does not hand a finite duration to sonner when auto-dismiss is enabled', () => {
    showSnackbar({ title: 'Saved', duration: 4000 });
    expect(lastCall().options.duration).toBe(Infinity);

    const { container } = render(lastCall().renderer('t2'));
    expect(container.querySelector('[role="progressbar"]')).not.toBeInTheDocument();
  });

  // Figma guideline: snackbars sit at the bottom right by default.
  it('defaults to the bottom-right position', () => {
    showSnackbar({ message: 'Saved' });
    expect(lastCall().options).toMatchObject({ position: 'bottom-right' });
  });

  // loading → success in place: reusing the id replaces the same toast.
  it('forwards an id to sonner so a snackbar can be replaced in place', () => {
    showSnackbar({ id: 'upload', variant: 'loading', message: 'Uploading…', progress: 40 });
    expect(lastCall().options).toMatchObject({ id: 'upload' });
    const { getByRole } = render(lastCall().renderer('upload'));
    expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '40');

    showSnackbar({ message: 'No id' });
    expect(lastCall().options).not.toHaveProperty('id');
  });

  it('never lets sonner auto-dismiss when duration is false', () => {
    showSnackbar({ title: 'Saved', duration: false });
    expect(lastCall().options.duration).toBe(Infinity);
  });
});
