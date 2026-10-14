import type { ThemeMode } from './ThemeProvider';

export interface ThemeScriptOptions {
  /** Must match the `storageKey` passed to `<ThemeProvider>`. @default 'sun-theme' */
  storageKey?: string;
  /** Must match the `defaultMode` passed to `<ThemeProvider>`. @default 'system' */
  defaultMode?: ThemeMode;
}

/**
 * Returns the literal source of the pre-hydration theme script, as a
 * plain string — deliberately **not** a React component. Every mature
 * library surveyed for this feature (MUI's `InitColorSchemeScript`,
 * Mantine's `ColorSchemeScript`, next-themes' inline script) treats this
 * as a separate, explicitly-placed artifact from the stateful provider
 * itself, and this stays consistent with that precedent for a
 * Sun-specific reason: tying the script's placement to wherever a
 * consumer happens to mount `<ThemeProvider>` is fragile — a consumer who
 * wraps only part of their tree (a legitimate pattern; see
 * `docs/components/theme-provider.md` §4/§14) still needs the FOUC-
 * prevention script to run at the true document root, regardless of where
 * the React-level provider sits. `ThemeProvider`'s own React lifecycle
 * does not need to execute for this to work — that is the entire point.
 *
 * Embed it yourself, as high in your document `<head>` as your framework
 * allows, before hydration:
 *
 * ```tsx
 * <script
 *   suppressHydrationWarning
 *   dangerouslySetInnerHTML={{ __html: getThemeScript({ storageKey: 'sun-theme', defaultMode: 'system' }) }}
 * />
 * ```
 *
 * `suppressHydrationWarning` on whatever element this script mutates
 * (typically `<html>`) is required — React did not render that attribute,
 * so without the flag it will warn about a mismatch it did not cause,
 * exactly as other theme libraries (e.g. next-themes) document for their own
 * equivalent script.
 *
 * See `docs/components/theme-provider.md`'s Next.js section for the
 * `next/script` `strategy="beforeInteractive"` placement, which avoids
 * React 19's generic "Encountered a script tag" warning for this
 * otherwise-legitimate use — a known, accepted, library-wide limitation
 * when this exact string is rendered as plain JSX instead.
 */
export function getThemeScript(options: ThemeScriptOptions = {}): string {
  const storageKey = options.storageKey ?? 'sun-theme';
  const defaultMode = options.defaultMode ?? 'system';

  // A defensive IIFE: every DOM API touched here is wrapped so that a
  // consumer's unusual environment (storage disabled, no matchMedia) can
  // never turn this into a page-breaking error — the worst outcome on
  // failure is falling back to no attribute at all (light mode, per
  // scripts/global.css's own default block).
  return (
    '(function(){try{' +
    `var k=${JSON.stringify(storageKey)};` +
    `var d=${JSON.stringify(defaultMode)};` +
    'var m=localStorage.getItem(k);' +
    "if(m!=='light'&&m!=='dark'&&m!=='system')m=d;" +
    "var t=m==='system'" +
    "?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')" +
    ':m;' +
    "document.documentElement.setAttribute('data-theme',t);" +
    '}catch(e){}})();'
  );
}
