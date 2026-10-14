import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot, type Root } from 'react-dom/client';
import { ThemeProvider, useTheme } from './ThemeProvider';

/**
 * SSR-01 (docs/components/theme-provider.md §14): a real server render
 * followed by a real `hydrateRoot`, with a stored preference that differs
 * from `defaultMode`. Before the fix, the uncontrolled mode was read from
 * storage inside a `useState` initializer, so the client's hydration render
 * produced different text than the server HTML → React #418 (reported via
 * `onRecoverableError`) and the whole root was client-re-rendered.
 *
 * The server HTML is produced with storage EMPTY (the server has no
 * `localStorage`; this browser-hosted test must simulate that explicitly,
 * since `renderToString` here runs in the same window), then the stored
 * value is written before hydrating — exactly what a real page sees.
 */

function Readout() {
  const { mode, resolvedTheme } = useTheme();
  return (
    <p>
      <span data-testid="mode">{mode}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
    </p>
  );
}

function App() {
  return (
    <ThemeProvider defaultMode="light">
      <Readout />
    </ThemeProvider>
  );
}

describe('ThemeProvider SSR hydration', () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    // Direct react-dom/client usage (not Testing Library) — opt in to act().
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = null;
    container.remove();
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  async function hydrate(onRecoverableError: (error: unknown) => void) {
    await act(async () => {
      root = hydrateRoot(container, <App />, { onRecoverableError });
    });
  }

  it('hydrates without a recoverable (hydration-mismatch) error when stored mode ≠ defaultMode, then shows the stored mode', async () => {
    container.innerHTML = renderToString(<App />);
    expect(container.querySelector('[data-testid="mode"]')?.textContent).toBe('light');

    localStorage.setItem('sun-theme', 'dark');
    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await hydrate(onRecoverableError);

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();

    // Post-hydration the stored preference wins, exactly as before.
    expect(container.querySelector('[data-testid="mode"]')?.textContent).toBe('dark');
    expect(container.querySelector('[data-testid="resolved"]')?.textContent).toBe('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    // The hydration pass (which renders defaultMode) must not overwrite the
    // user's stored preference with defaultMode.
    expect(localStorage.getItem('sun-theme')).toBe('dark');
  });

  it('never flips <html data-theme> away from the pre-hydration script value during hydration (no flash)', async () => {
    container.innerHTML = renderToString(<App />);
    localStorage.setItem('sun-theme', 'dark');
    // What getThemeScript() does before hydration.
    document.documentElement.setAttribute('data-theme', 'dark');

    // attributeOldValue: every record carries the value BEFORE that write,
    // so oldValues + the final value is the complete history, including
    // intermediate values that were overwritten before any callback ran.
    const records: MutationRecord[] = [];
    const observer = new MutationObserver((r) => records.push(...r));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
      attributeOldValue: true,
    });

    await hydrate(() => {});
    records.push(...observer.takeRecords());
    observer.disconnect();
    const seen = [
      ...records.map((r) => r.oldValue),
      document.documentElement.getAttribute('data-theme'),
    ];

    expect(seen).not.toContain('light');
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  // (10) A scoped region's data-theme used to be written in a layout effect,
  // so it was absent from SSR HTML and the region showed the ROOT theme until
  // hydration. It is now rendered as a real attribute on the wrapper.
  it('scoped: data-theme is present in the server-rendered markup', () => {
    const html = renderToString(
      <ThemeProvider scoped mode="dark">
        <span>widget</span>
      </ThemeProvider>,
    );
    expect(html).toMatch(/<div[^>]*data-slot="theme-provider-scope"[^>]*>/);
    expect(html).toMatch(/<div[^>]*data-theme="dark"[^>]*>/);

    const uncontrolled = renderToString(
      <ThemeProvider scoped defaultMode="light">
        <span>widget</span>
      </ThemeProvider>,
    );
    expect(uncontrolled).toMatch(/<div[^>]*data-theme="light"[^>]*>/);
  });

  it('scoped: hydrates without a mismatch and keeps the attribute; unmanaged scoped renders none', async () => {
    function Scoped() {
      return (
        <ThemeProvider scoped defaultMode="dark">
          <span>widget</span>
        </ThemeProvider>
      );
    }
    container.innerHTML = renderToString(<Scoped />);
    const onRecoverableError = vi.fn();
    await act(async () => {
      root = hydrateRoot(container, <Scoped />, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector('[data-slot="theme-provider-scope"]')).toHaveAttribute(
      'data-theme',
      'dark',
    );
    // Scoped never touches documentElement.
    expect(document.documentElement).not.toHaveAttribute('data-theme');

    expect(
      renderToString(
        <ThemeProvider scoped unmanaged mode="dark">
          <span />
        </ThemeProvider>,
      ),
    ).not.toContain('data-theme');
  });
});
