/**
 * Public API contract fixtures for `ProgressBar` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full rationale
 * and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { ProgressBar, type ProgressBarProps, type ProgressBarSize } from '@/components/progressBar';

// --- Own props, checked individually (§15.2 item 1) -------------------------

expectTypeOf<ProgressBarProps['value']>().toEqualTypeOf<number>();
expectTypeOf<ProgressBarProps['max']>().toEqualTypeOf<number | undefined>();
expectTypeOf<ProgressBarProps['size']>().toEqualTypeOf<ProgressBarSize | undefined>();
expectTypeOf<ProgressBarProps['inverse']>().toEqualTypeOf<boolean | undefined>();

// --- Union checked exhaustively — every member, not sampled (§15.2 item 2) --

expectTypeOf<ProgressBarSize>().toEqualTypeOf<'small' | 'medium' | 'large'>();

// --- Required-vs-optional asserted precisely (§15.2 item 3): `value` is the
// only required prop — a bare <ProgressBar /> must fail to typecheck -------

// @ts-expect-error `value` is required
() => <ProgressBar />;

// --- Removed/narrowed native prop (§15.2 item 4): `children` is withheld —
// ProgressBar has no content slot of its own ---------------------------------

expectTypeOf<ProgressBarProps>().not.toHaveProperty('children');

// --- Passed-through Radix prop retained (getValueLabel) ---------------------

expectTypeOf<ProgressBarProps['getValueLabel']>().toEqualTypeOf<
  ((value: number, max: number) => string) | undefined
>();

// --- Usage: every prop, every size value ------------------------------------

() => <ProgressBar value={0} />;
() => <ProgressBar value={50} max={200} />;
() => <ProgressBar value={50} size="small" />;
() => <ProgressBar value={50} size="medium" />;
() => <ProgressBar value={50} size="large" />;
() => <ProgressBar value={50} inverse />;
() => <ProgressBar value={50} inverse={false} />;
() => <ProgressBar value={18} max={40} getValueLabel={(v, m) => `${v} of ${m}`} />;
() => (
  <ProgressBar value={50} max={200} size="large" inverse className="opacity-80" data-testid="x" />
);

// --- Ref (§15.2 item 5) ------------------------------------------------------

expectTypeOf<ComponentRef<typeof ProgressBar>>().toEqualTypeOf<HTMLDivElement>();
