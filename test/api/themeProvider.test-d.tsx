/**
 * Public API contract fixtures for `ThemeProvider` — type-only checks
 * (never executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import {
  ThemeProvider,
  useTheme,
  type ThemeMode,
  type ThemeProviderProps,
} from '@/components/themeProvider';

// Controlled/uncontrolled, useTheme(), ref (Phase 13B).
expectTypeOf<ThemeProviderProps['mode']>().toEqualTypeOf<ThemeMode | undefined>();
expectTypeOf<ThemeProviderProps['defaultMode']>().toEqualTypeOf<ThemeMode | undefined>();
expectTypeOf<ReturnType<typeof useTheme>>().toEqualTypeOf<{
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}>();

// Uncontrolled.
() => <ThemeProvider defaultMode="dark">content</ThemeProvider>;
// Controlled — mode and onModeChange must be used together.
() => (
  <ThemeProvider mode="light" onModeChange={(m) => console.log(m)}>
    content
  </ThemeProvider>
);
// Scoped mode forwards a ref to the wrapper <div>.
() => (
  <ThemeProvider scoped ref={(el: HTMLDivElement | null) => void el}>
    content
  </ThemeProvider>
);
// Invalid: not a real ThemeMode.
// () => <ThemeProvider mode="blue">content</ThemeProvider>;

expectTypeOf<ComponentRef<typeof ThemeProvider>>().toEqualTypeOf<HTMLDivElement>();
