'use client';
// Unlike every other component in this library, ThemeProvider is designed
// to wrap an application's root layout — which Next.js App Router treats as
// a Server Component by default, with no realistic way for the consumer's
// own file to already be a client boundary the way it can be for a leaf
// component. A real `next build` confirmed this crashes with
// `TypeError: createContext is not a function` without this directive. This directive
// must NOT spread to ThemeScript.ts (getThemeScript stays Server Component
// -safe by design) — see vite.config.ts's useClientBanner and preserveModules output
// for how the two are kept as separate build outputs.

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type Ref,
  type RefCallback,
} from 'react';

/**
 * A theme mode a consumer can choose. `'system'` follows the OS-level
 * `prefers-color-scheme` and stays live-updated while the app runs.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/** `mode` with `'system'` already resolved to a concrete value. */
export type ResolvedTheme = 'light' | 'dark';

/**
 * Persistence seam for the uncontrolled mode preference. Pass `null` to
 * `ThemeProvider`'s `storage` prop to disable persistence entirely.
 */
export interface ThemeStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ThemeProviderProps {
  children: ReactNode;
  /** Uncontrolled default mode, used only on first mount. @default 'system' */
  defaultMode?: ThemeMode;
  /** Controlled mode — omit this prop entirely for uncontrolled behavior. */
  mode?: ThemeMode;
  /** Fires whenever the mode changes, controlled or uncontrolled. */
  onModeChange?: (mode: ThemeMode) => void;
  /** Storage key for the persisted uncontrolled preference. @default 'sun-theme' */
  storageKey?: string;
  /**
   * Persistence implementation. Defaults to a safe `localStorage` wrapper
   * that never throws. Pass `null` to disable persistence entirely.
   * Ignored when `scoped` is true — scoped instances never persist
   * (see the `scoped` prop doc).
   */
  storage?: ThemeStorage | null;
  /** Disable the transition-suppression behavior on a mode change. @default false */
  disableTransitionOnChange?: boolean;
  /**
   * When true, `ThemeProvider` tracks the resolved theme for `useTheme()`
   * but never writes the `data-theme` attribute itself — for a consumer
   * whose own application shell already manages it (their own design
   * system, or their own `next-themes` instance), avoiding two independent
   * managers fighting over the same DOM attribute.
   * @default false
   */
  unmanaged?: boolean;
  /**
   * When true, applies `data-theme` to a wrapper `<div>` instead of
   * `document.documentElement`, creating an independent theme region
   * (e.g. an embedded widget forced to light mode inside an otherwise-dark
   * host page). Scoped instances never persist their preference,
   * regardless of `storage` — a scoped region's theme choice should not
   * leak into the host page's own storage namespace, and two scoped
   * regions sharing one `storageKey` would otherwise silently clobber each
   * other.
   *
   * Radix-portalled content (Modal, DropdownMenu, Tooltip) rendered from
   * inside a scoped region still portals to `document.body` by default,
   * **outside** the scoped wrapper's DOM subtree, and will not see its
   * overridden variables unless redirected — pass the scoped wrapper
   * element (available via `ref`) as that component's own `container`
   * prop.
   * @default false
   */
  scoped?: boolean;
  /** Applied to the wrapper element. Only meaningful when `scoped` is true. */
  className?: string;
}

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Reads the current theme mode/resolved theme and a setter. Must be used
 * within a `<ThemeProvider>`. Exposes only `mode`/`resolvedTheme`/`setMode`
 * — no CSS variable maps, no internal DOM nodes, no mutable theme object.
 * Existing components never need this hook to render correctly; it exists
 * for the rare, real case of a consumer reacting to theme in JS (e.g.
 * choosing a different image asset), not for styling.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used within a <ThemeProvider>.');
  }
  return ctx;
}

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

function safeLocalStorage(): ThemeStorage {
  return {
    getItem(key) {
      if (!isBrowser) return null;
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Unavailable (private browsing, disabled, embedded iframe policy) —
        // fall back to "nothing persisted" rather than throwing.
        return null;
      }
    },
    setItem(key, value) {
      if (!isBrowser) return;
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Same as above — a persistence failure must never crash the app.
      }
    },
  };
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

// A consumer-supplied `storage` implementation (§13 of the proposal — the
// persistence seam) is not guaranteed to be as defensive as
// safeLocalStorage()'s own internal try/catch. Every call site wraps the
// call itself, so a throwing custom implementation degrades to "nothing
// persisted" instead of crashing the app, regardless of which
// implementation is in use.
function readStorageSafely(storage: ThemeStorage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageSafely(storage: ThemeStorage, key: string, value: string): void {
  try {
    storage.setItem(key, value);
  } catch {
    // A persistence failure must never crash the app.
  }
}

// --- System preference: useSyncExternalStore-based (tearing-safe, the
// correct primitive for an external mutable source, StrictMode-safe by
// construction since React itself owns the subscribe/unsubscribe pairing).

const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';

function subscribeToSystemPreference(onChange: () => void): () => void {
  if (!isBrowser || typeof window.matchMedia !== 'function') {
    return () => {};
  }
  const mql = window.matchMedia(DARK_MEDIA_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

function getSystemThemeSnapshot(): ResolvedTheme {
  if (!isBrowser || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia(DARK_MEDIA_QUERY).matches ? 'dark' : 'light';
}

function getSystemThemeServerSnapshot(): ResolvedTheme {
  // The server cannot know the client's OS preference. This intentionally
  // matches the value scripts/global.css's own light block represents —
  // ThemeScript (see ThemeScript.ts) is what prevents this from being
  // visible as a flash on a real page load.
  return 'light';
}

function useSystemTheme(): ResolvedTheme {
  return useSyncExternalStore(
    subscribeToSystemPreference,
    getSystemThemeSnapshot,
    getSystemThemeServerSnapshot,
  );
}

// Snapshot helpers for the stored-preference / hydration stores. No
// subscription: the stored value only changes through this provider's own
// setMode (tracked in state) — cross-tab `storage` events are deliberately
// not followed (unchanged behavior; not part of the documented contract).
function subscribeToNothing(): () => void {
  return () => {};
}
function getNullServerSnapshot(): null {
  return null;
}
function getTrueSnapshot(): boolean {
  return true;
}
function getFalseServerSnapshot(): boolean {
  return false;
}

function prefersReducedMotion(): boolean {
  if (!isBrowser || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// --- Transition suppression (the next-themes-pioneered technique): inject a temporary
// stylesheet forcing every transition off, force a reflow, remove it on
// the next frame — so a mode switch doesn't animate every transitioning
// element in the app at once.

function suppressTransitionsMomentarily(target: Element): void {
  if (prefersReducedMotion()) {
    // Nothing to suppress: no transition was going to play anyway, and a
    // reduced-motion user should never see this machinery run at all.
    return;
  }
  const style = document.createElement('style');
  style.textContent = '*,*::before,*::after{transition:none!important}';
  document.head.appendChild(style);
  // Force a reflow so the browser commits the rule before we let anything
  // else run — without this, removing the style on the next frame could
  // race ahead of the attribute change actually taking visual effect.
  void (target as HTMLElement).getBoundingClientRect();
  // Self-scheduled, deliberately NOT tied to the calling effect's own
  // cleanup lifecycle: an earlier version returned a cleanup function
  // instead, which meant the style was only ever removed when the effect
  // ran AGAIN (a subsequent switch) or on unmount — a single switch
  // followed by no further activity left it in the DOM indefinitely. A
  // raw requestAnimationFrame callback keeps running even if the React
  // component that scheduled it unmounts in the meantime, so this is safe
  // without any additional cleanup wiring.
  requestAnimationFrame(() => {
    style.remove();
  });
}

// --- Multiple-root-instance detection (dev-only). Effects only ever run
// client-side, so this module-level counter is safe across SSR requests
// (no effect runs during server rendering) and resets cleanly per browser
// tab load.

let activeRootInstances = 0;

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

/**
 * Turns Sun's already-working `[data-theme="dark"]` CSS mechanism
 * (`scripts/global.css`) into a supported, SSR-safe, zero-flash JavaScript
 * API. Does not introduce a JS theme object — every existing component
 * continues to resolve its own colors through the CSS cascade exactly as
 * it does today, with or without this provider present.
 *
 * @example
 * ```tsx
 * // Uncontrolled, root-scoped, system default — the common case.
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example
 * ```tsx
 * // Controlled from your own settings UI.
 * const [mode, setMode] = useState<ThemeMode>('light');
 * <ThemeProvider mode={mode} onModeChange={setMode}>
 *   <App />
 * </ThemeProvider>
 * ```
 *
 * @example
 * ```tsx
 * // An independent theme region (e.g. an embedded widget). Radix portals
 * // rendered from inside must be redirected via `container`.
 * const wrapperRef = useRef<HTMLDivElement>(null);
 * <ThemeProvider scoped mode="light" ref={wrapperRef}>
 *   <Modal>
 *     <ModalContent container={wrapperRef.current}>...</ModalContent>
 *   </Modal>
 * </ThemeProvider>
 * ```
 */
export const ThemeProvider = forwardRef<HTMLDivElement, ThemeProviderProps>(
  (
    {
      children,
      defaultMode = 'system',
      mode: controlledMode,
      onModeChange,
      storageKey = 'sun-theme',
      storage,
      disableTransitionOnChange = false,
      unmanaged = false,
      scoped = false,
      className,
    },
    ref,
  ) => {
    const parentContext = useContext(ThemeContext);
    // A nested, non-scoped provider is an inert passthrough: it must not
    // create a second matchMedia subscription or a second DOM-writing
    // effect alongside its ancestor's.
    const isNestedPassthrough = parentContext !== null && !scoped;

    const resolvedStorage: ThemeStorage | null =
      scoped || storage === null ? null : (storage ?? safeLocalStorage());

    // The stored preference is external, client-only state, so it is read
    // through useSyncExternalStore with a server snapshot of `null`
    // (→ `defaultMode`), exactly like useSystemTheme() below. Reading it in
    // a useState initializer (the previous implementation) made the
    // client's hydration render differ from the server HTML whenever the
    // stored mode ≠ defaultMode — React #418, whole root client-re-rendered
    // (SSR-01, docs/components/theme-provider.md §14). React renders the
    // server snapshot during hydration, then re-renders with the stored
    // value immediately after; client-only renders read it on the first
    // render, as before.
    const readStoredMode = useCallback((): ThemeMode | null => {
      if (!resolvedStorage) return null;
      const stored = readStorageSafely(resolvedStorage, storageKey);
      return isThemeMode(stored) ? stored : null;
      // resolvedStorage is a fresh wrapper object each render when the
      // default localStorage wrapper is in use; key on the consumer's own
      // `storage` prop identity instead.
    }, [storage, scoped, storageKey]);
    const storedMode = useSyncExternalStore(
      subscribeToNothing,
      readStoredMode,
      getNullServerSnapshot,
    );
    // An explicit setMode() call in this session. Takes precedence over the
    // stored value, and is the only thing ever persisted (see below).
    const [selectedMode, setSelectedMode] = useState<ThemeMode | null>(null);
    const uncontrolledMode: ThemeMode = selectedMode ?? storedMode ?? defaultMode;
    // false only during the hydration render (server snapshot), true on
    // every client render after it — and on the very first render of a
    // client-only (createRoot) mount.
    const isHydrated = useSyncExternalStore(
      subscribeToNothing,
      getTrueSnapshot,
      getFalseServerSnapshot,
    );

    const mode = controlledMode ?? uncontrolledMode;
    const systemTheme = useSystemTheme();
    const resolvedTheme: ResolvedTheme = mode === 'system' ? systemTheme : mode;

    const setMode = useCallback(
      (next: ThemeMode) => {
        if (controlledMode === undefined) {
          setSelectedMode(next);
        }
        onModeChange?.(next);
      },
      [controlledMode, onModeChange],
    );

    const wrapperRef = useRef<HTMLDivElement>(null);

    // Warning (unconditional — not gated behind NODE_ENV, since a
    // published library cannot reliably assume any particular bundler
    // replaces `process.env.NODE_ENV`, and this check is cheap and the
    // condition rare): two independent (non-nested, non-scoped) root
    // instances both targeting documentElement is an unsupported
    // configuration — they would race. Use `scoped` on the second one.
    useEffect(() => {
      if (isNestedPassthrough || unmanaged || scoped) return;
      activeRootInstances += 1;
      if (activeRootInstances > 1) {
        console.warn(
          '[Sun ThemeProvider] More than one root-level <ThemeProvider> is mounted at once. ' +
            'Two independent instances both writing document.documentElement will race with ' +
            'each other. Use the `scoped` prop on the second instance instead.',
        );
      }
      return () => {
        activeRootInstances -= 1;
      };
    }, [isNestedPassthrough, unmanaged, scoped]);

    // DOM application. Skipped for a nested passthrough (the ancestor
    // already owns this) and for `unmanaged` (the consumer's own code
    // owns this). useLayoutEffect, not useEffect, so a runtime switch
    // paints correctly on the very next frame rather than flashing the
    // previous theme for one frame first.
    const previousResolvedRef = useRef<ResolvedTheme | null>(null);
    useLayoutEffect(() => {
      if (isNestedPassthrough || unmanaged) return;
      const target: Element | null = scoped ? wrapperRef.current : document.documentElement;
      if (!target) return;
      // A scoped wrapper's attribute is rendered by React itself (see the
      // JSX below), so it is already correct in SSR HTML and after every
      // commit — only transition suppression is done here.
      const reactOwnsAttribute = scoped;
      // During the hydration render `resolvedTheme` comes from the server
      // snapshots (defaultMode / light OS), not the real stored/OS value —
      // writing it would overwrite getThemeScript()'s correct pre-hydration
      // attribute for one frame (a flash). React re-renders with the real
      // value right after hydration; only fill the attribute in now if
      // nothing (no pre-hydration script) has set it yet.
      if (!isHydrated) {
        if (!reactOwnsAttribute && !target.hasAttribute('data-theme')) {
          target.setAttribute('data-theme', resolvedTheme);
        }
        return;
      }

      const changed =
        previousResolvedRef.current !== null && previousResolvedRef.current !== resolvedTheme;
      previousResolvedRef.current = resolvedTheme;

      if (changed && !disableTransitionOnChange) {
        suppressTransitionsMomentarily(target);
      }

      if (!reactOwnsAttribute) target.setAttribute('data-theme', resolvedTheme);
    }, [
      resolvedTheme,
      isHydrated,
      isNestedPassthrough,
      unmanaged,
      scoped,
      disableTransitionOnChange,
    ]);

    // (A scoped wrapper's data-theme is a rendered attribute — React removes
    // it together with the wrapper, so no unmount cleanup is needed.)

    // Persistence is owned by the root (the same provider that owns the DOM
    // write above). A nested passthrough's own `mode` is never exposed — its
    // context value IS the ancestor's — so writing it would persist a value
    // nothing on the page reflects: e.g. a nested `defaultMode="dark"`
    // under a controlled light root wrote `dark` to `sun-theme`, which
    // getThemeScript then applied before hydration on the next load.
    //
    // Only an explicit setMode() choice is written — never the mount-time
    // value. The mount-time value is either already what storage holds, or
    // defaultMode (which getThemeScript() falls back to on its own), and
    // during hydration it is the *server snapshot*: writing it there would
    // overwrite the user's real stored preference with defaultMode before
    // the post-hydration re-render could read it.
    useEffect(() => {
      if (isNestedPassthrough || !resolvedStorage || controlledMode !== undefined) return;
      if (selectedMode === null) return;
      writeStorageSafely(resolvedStorage, storageKey, selectedMode);
      // resolvedStorage is re-created each render; keyed on `storage`/`scoped` (see readStoredMode).
    }, [isNestedPassthrough, storage, scoped, controlledMode, selectedMode, storageKey]);

    const contextValue = useMemo<ThemeContextValue>(
      () => (isNestedPassthrough ? parentContext! : { mode, resolvedTheme, setMode }),
      [isNestedPassthrough, parentContext, mode, resolvedTheme, setMode],
    );

    if (scoped) {
      return (
        <div
          ref={mergeRefs(ref, wrapperRef)}
          className={className}
          data-slot="theme-provider-scope"
          // Rendered (not effect-applied) so the scoped region is themed in
          // SSR HTML before hydration; `unmanaged` leaves it to the consumer.
          data-theme={unmanaged ? undefined : resolvedTheme}
        >
          <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
        </div>
      );
    }

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
  },
);

ThemeProvider.displayName = 'ThemeProvider';
