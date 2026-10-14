import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useRef, StrictMode } from 'react';
import { ThemeProvider, useTheme } from './ThemeProvider';

/**
 * A minimal, controllable matchMedia mock. Supports two independent
 * queries (dark-mode + reduced-motion) with real addEventListener/
 * removeEventListener semantics and a `dispatch` helper that fires a real
 * 'change' event, exactly like a genuine OS-level preference change would.
 */
function installMatchMediaMock(initial: { dark?: boolean; reducedMotion?: boolean } = {}) {
  const state = { dark: initial.dark ?? false, reducedMotion: initial.reducedMotion ?? false };
  const listeners = new Map<string, Set<(e: MediaQueryListEvent) => void>>();

  const mql = (query: string) => {
    const matches = query.includes('reduce') ? state.reducedMotion : state.dark;
    return {
      matches,
      media: query,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        if (!listeners.has(query)) listeners.set(query, new Set());
        listeners.get(query)!.add(cb);
      },
      removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        listeners.get(query)?.delete(cb);
      },
    } as MediaQueryList;
  };

  window.matchMedia = vi.fn(mql) as unknown as typeof window.matchMedia;

  return {
    listenerCount: (query: string) => listeners.get(query)?.size ?? 0,
    dispatchDarkChange: (matches: boolean) => {
      state.dark = matches;
      const query = '(prefers-color-scheme: dark)';
      listeners.get(query)?.forEach((cb) => cb({ matches } as MediaQueryListEvent));
    },
  };
}

function ModeReadout() {
  const { mode, resolvedTheme, setMode } = useTheme();
  return (
    <div>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setMode('dark')}>go-dark</button>
      <button onClick={() => setMode('light')}>go-light</button>
      <button onClick={() => setMode('system')}>go-system</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalMatchMedia = window.matchMedia;
    document.documentElement.removeAttribute('data-theme');
    localStorage.clear();
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    document.documentElement.removeAttribute('data-theme');
    document.querySelectorAll('style').forEach((s) => {
      if (s.textContent?.includes('transition:none')) s.remove();
    });
  });

  it('uncontrolled: defaultMode="light" applies data-theme="light" to documentElement', async () => {
    installMatchMediaMock();
    render(
      <ThemeProvider defaultMode="light">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });

  it('uncontrolled: defaultMode="dark" applies data-theme="dark"', async () => {
    installMatchMediaMock();
    render(
      <ThemeProvider defaultMode="dark">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
  });

  it('system mode resolves from the OS preference at mount', async () => {
    installMatchMediaMock({ dark: true });
    render(
      <ThemeProvider defaultMode="system">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
  });

  // Regression target: Section 9's most easily, silently unimplemented
  // requirement — a one-time matchMedia read at mount would still pass
  // every test above. This is the one that actually proves live tracking.
  it('system mode tracks a live OS preference change while the app is running', async () => {
    const mm = installMatchMediaMock({ dark: false });
    render(
      <ThemeProvider defaultMode="system">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    mm.dispatchDarkChange(true);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));

    mm.dispatchDarkChange(false);
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
  });

  it('explicit dark → system re-syncs immediately to the current OS value, not a stale one', async () => {
    const mm = installMatchMediaMock({ dark: true });
    render(
      <ThemeProvider defaultMode="light">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    screen.getByText('go-system').click();
    // OS is currently dark — switching to "system" must resolve to dark
    // immediately, not wait for a future change event.
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    void mm;
  });

  it('system → explicit dark detaches the live subscription (no further OS changes affect the resolved theme)', async () => {
    const mm = installMatchMediaMock({ dark: false });
    render(
      <ThemeProvider defaultMode="system">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    screen.getByText('go-dark').click();
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));

    // OS flips to light while we're explicitly pinned to dark — must have no effect.
    mm.dispatchDarkChange(true);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it('controlled mode is driven entirely by the `mode` prop, and onModeChange fires on user-initiated change', async () => {
    installMatchMediaMock();
    const onModeChange = vi.fn();
    const { rerender } = render(
      <ThemeProvider mode="light" onModeChange={onModeChange}>
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    screen.getByText('go-dark').click();
    expect(onModeChange).toHaveBeenCalledWith('dark');
    // Controlled: the DOM must NOT change until the consumer feeds the new value back in.
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    rerender(
      <ThemeProvider mode="dark" onModeChange={onModeChange}>
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
  });

  it('rapid repeated switches settle on a stable final state with no stray transition-suppression stylesheet left behind', async () => {
    installMatchMediaMock();
    render(
      <ThemeProvider defaultMode="light">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    screen.getByText('go-dark').click();
    screen.getByText('go-light').click();
    screen.getByText('go-dark').click();
    screen.getByText('go-light').click();
    screen.getByText('go-dark').click();

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));

    // Give any pending requestAnimationFrame cleanup a chance to run.
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const leftoverStyles = Array.from(document.querySelectorAll('style')).filter((s) =>
      s.textContent?.includes('transition:none'),
    );
    expect(leftoverStyles).toHaveLength(0);
  });

  it('reduced motion: no transition-suppression stylesheet is ever injected', async () => {
    installMatchMediaMock({ reducedMotion: true });
    render(
      <ThemeProvider defaultMode="light">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));

    screen.getByText('go-dark').click();
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));

    const suppressionStyles = Array.from(document.querySelectorAll('style')).filter((s) =>
      s.textContent?.includes('transition:none'),
    );
    expect(suppressionStyles).toHaveLength(0);
  });

  it('StrictMode double-invocation does not create duplicate matchMedia listeners', async () => {
    const mm = installMatchMediaMock({ dark: false });
    render(
      <StrictMode>
        <ThemeProvider defaultMode="system">
          <ModeReadout />
        </ThemeProvider>
      </StrictMode>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    expect(mm.listenerCount('(prefers-color-scheme: dark)')).toBe(1);
  });

  it('unmount cleans up the matchMedia listener', async () => {
    const mm = installMatchMediaMock({ dark: false });
    const { unmount } = render(
      <ThemeProvider defaultMode="system">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    expect(mm.listenerCount('(prefers-color-scheme: dark)')).toBe(1);

    unmount();
    expect(mm.listenerCount('(prefers-color-scheme: dark)')).toBe(0);
  });

  it('nested un-scoped ThemeProvider is an inert passthrough sharing the ancestor context', async () => {
    installMatchMediaMock();
    function Inner() {
      const { resolvedTheme } = useTheme();
      return <span data-testid="inner-resolved">{resolvedTheme}</span>;
    }
    render(
      <ThemeProvider defaultMode="dark">
        <ThemeProvider>
          <Inner />
        </ThemeProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(screen.getByTestId('inner-resolved')).toHaveTextContent('dark');
  });

  it('a nested passthrough provider never writes storage (only the persistence-owning root does)', async () => {
    installMatchMediaMock();
    const setItem = vi.fn();
    render(
      <ThemeProvider mode="light">
        <ThemeProvider defaultMode="dark" storage={{ getItem: () => null, setItem }}>
          <span>child</span>
        </ThemeProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    expect(setItem).not.toHaveBeenCalled();
  });

  it('a nested passthrough under a controlled root does not persist its defaultMode to the default localStorage key', async () => {
    installMatchMediaMock();
    render(
      <ThemeProvider mode="light">
        <ThemeProvider defaultMode="dark">
          <span>child</span>
        </ThemeProvider>
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    expect(localStorage.getItem('sun-theme')).toBeNull();
  });

  it('two independent (sibling) root instances both mounted warns in dev, per the documented unsupported-configuration rule', async () => {
    installMatchMediaMock();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <ThemeProvider defaultMode="light">
          <span>a</span>
        </ThemeProvider>
        <ThemeProvider defaultMode="dark">
          <span>b</span>
        </ThemeProvider>
      </>,
    );
    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('More than one root-level')),
    );
    warnSpy.mockRestore();
  });

  it('scoped mode applies data-theme to its own wrapper element, never to documentElement, and never persists', async () => {
    installMatchMediaMock();
    const setItem = vi.fn();
    function Wrapper() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <ThemeProvider scoped mode="dark" ref={ref} storage={{ getItem: () => null, setItem }}>
          <span data-testid="scoped-child">child</span>
        </ThemeProvider>
      );
    }
    render(<Wrapper />);
    const child = await screen.findByTestId('scoped-child');
    const wrapper = child.parentElement!;
    await waitFor(() => expect(wrapper).toHaveAttribute('data-theme', 'dark'));
    expect(document.documentElement).not.toHaveAttribute('data-theme');
    expect(setItem).not.toHaveBeenCalled();
  });

  it('unmanaged mode tracks resolvedTheme via useTheme() but never writes the DOM attribute itself', async () => {
    installMatchMediaMock({ dark: true });
    render(
      <ThemeProvider unmanaged defaultMode="system">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent('dark'));
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('a storage read failure falls back to defaultMode instead of crashing', async () => {
    installMatchMediaMock();
    const throwingStorage = {
      getItem: () => {
        throw new Error('storage disabled');
      },
      setItem: () => {},
    };
    expect(() =>
      render(
        <ThemeProvider defaultMode="light" storage={throwingStorage}>
          <ModeReadout />
        </ThemeProvider>,
      ),
    ).not.toThrow();
  });

  it('a malformed stored value falls back to defaultMode', async () => {
    localStorage.setItem('sun-theme', 'not-a-real-mode');
    installMatchMediaMock();
    render(
      <ThemeProvider defaultMode="light">
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('mode')).toHaveTextContent('light'));
  });

  it('matchMedia unavailable falls back to light instead of throwing', async () => {
    // @ts-expect-error deliberately simulating an environment without matchMedia
    delete window.matchMedia;
    expect(() =>
      render(
        <ThemeProvider defaultMode="system">
          <ModeReadout />
        </ThemeProvider>,
      ),
    ).not.toThrow();
    await waitFor(() => expect(screen.getByTestId('resolved')).toHaveTextContent('light'));
  });

  it('storage={null} disables persistence entirely', async () => {
    installMatchMediaMock();
    render(
      <ThemeProvider defaultMode="dark" storage={null}>
        <ModeReadout />
      </ThemeProvider>,
    );
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    expect(localStorage.getItem('sun-theme')).toBeNull();
  });

  it('useTheme() throws a clear error outside a ThemeProvider', () => {
    function Naked() {
      useTheme();
      return null;
    }
    expect(() => render(<Naked />)).toThrow(/must be used within a <ThemeProvider>/);
  });

  it('forwards the ref to the scoped wrapper <div>', async () => {
    installMatchMediaMock();
    const ref = { current: null as HTMLDivElement | null };
    render(
      <ThemeProvider scoped mode="light" ref={ref}>
        <span data-testid="scoped-child">child</span>
      </ThemeProvider>,
    );
    const child = await screen.findByTestId('scoped-child');
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toBe(child.parentElement);
  });

  it('client-only mount applies a stored preference on first render, and an explicit setMode() is persisted', async () => {
    localStorage.setItem('sun-theme', 'dark');
    installMatchMediaMock();
    const { unmount } = render(
      <ThemeProvider defaultMode="light">
        <ModeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    screen.getByText('go-light').click();
    await waitFor(() => expect(localStorage.getItem('sun-theme')).toBe('light'));
    unmount();
    render(
      <ThemeProvider defaultMode="dark">
        <ModeReadout />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
  });
});
