import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// @testing-library/react's automatic afterEach(cleanup) only registers
// itself when it detects `afterEach` as a global (e.g. via `test.globals:
// true`). This project deliberately does not enable Vitest globals (so
// `expect`/`vi`/etc. must be imported explicitly, consistent with the rest
// of the repo's Storybook tests using `storybook/test`), so cleanup is
// wired explicitly here instead — otherwise DOM nodes from one test leak
// into the next within the same file.
afterEach(() => {
  cleanup();
});

// Suppresses one specific, already-expected console.warn: Radix's
// useControllableState hook (Switch.test.tsx's controlled -> uncontrolled
// regression tests, see the comments there) warns "Switch is changing from
// controlled to uncontrolled..." — real, harmless, and already documented
// as Radix's own behavior, not a Sun bug.
//
// CORRECTION: two earlier attempts at this fix patched `console.error`
// instead — confirmed via real CI runs to NOT intercept this call, either
// per-test (`vi.spyOn(console, 'error')`) or here in this same setup file.
// Both attempts were chasing the wrong method: the actual call, read
// directly from Radix's own source
// (@radix-ui/react-use-controllable-state/dist/index.mjs), is
// `console.warn(...)`, not `console.error` — Vitest's browser-mode reporter
// labels BOTH under a "stderr" section header in its transcript, which is
// what made this easy to misdiagnose from the CI log alone rather than the
// real source.
//
// This is patched HERE (a setup file, loaded before any test file's own
// imports) rather than per-test, so it's in place before any component
// module (including Radix's) is ever imported.
//
// Suspected consequence of leaving this unsuppressed: a confirmed,
// reproducible Vitest+Playwright browser-mode hang (5/26 files complete,
// then the whole run stalls until the wrapper's hard ceiling) that
// consistently occurs right after this exact file's console output in
// every observed CI run (PR #42). vitest-dev/vitest#9941 ("Playwright:
// logs causes timeouts across parallel tests and across browsers", still
// open upstream) documents console output during browser-mode tests
// stalling the whole worker pool, not just the noisy file — matching this
// repo's own symptom exactly.
//
// Only this one, specific, already-known message is filtered — anything
// else still reaches the real console.warn unchanged, so a genuinely new
// warning in any test is never silently hidden.
const KNOWN_EXPECTED_CONSOLE_WARNINGS = [/changing from controlled to uncontrolled/];
const originalConsoleWarn = console.warn;
console.warn = (...args: Parameters<typeof console.warn>) => {
  const [first] = args;
  if (typeof first === 'string' && KNOWN_EXPECTED_CONSOLE_WARNINGS.some((re) => re.test(first))) {
    return;
  }
  originalConsoleWarn(...args);
};
