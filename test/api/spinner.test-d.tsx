/**
 * Public API contract fixtures for `Spinner` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full rationale
 * and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Spinner, type SpinnerProps, type SpinnerSize } from '@/components/spinner';

// --- Own props, checked individually (§15.2 item 1) -------------------------

expectTypeOf<SpinnerProps['size']>().toEqualTypeOf<SpinnerSize | undefined>();
expectTypeOf<SpinnerProps['inverse']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<SpinnerProps['label']>().toEqualTypeOf<string | undefined>();

// --- Union checked exhaustively — every member, not sampled (§15.2 item 2) --

expectTypeOf<SpinnerSize>().toEqualTypeOf<'small' | 'medium' | 'large'>();

// --- Removed/narrowed native prop (§15.2 item 4): `children` is withheld —
// Spinner has no content slot of its own, only the `label` prop -----------

expectTypeOf<SpinnerProps>().not.toHaveProperty('children');

// --- Usage: every prop, every size value ------------------------------------

() => <Spinner />;
() => <Spinner size="small" />;
() => <Spinner size="medium" />;
() => <Spinner size="large" />;
() => <Spinner inverse />;
() => <Spinner inverse={false} />;
() => <Spinner label="Loading dashboard" />;
() => (
  <Spinner size="large" inverse label="Loading dashboard" className="opacity-80" data-testid="x" />
);

// --- Ref (§15.2 item 5) ------------------------------------------------------

expectTypeOf<ComponentRef<typeof Spinner>>().toEqualTypeOf<HTMLDivElement>();
