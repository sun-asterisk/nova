/**
 * Public API contract fixtures for `Divider` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Divider, type DividerProps, type DividerOrientation } from '@/components/divider';

// --- Own props, checked exhaustively (§15.2 items 1–4) --------------------

expectTypeOf<DividerProps['orientation']>().toEqualTypeOf<'horizontal' | 'vertical' | undefined>();
expectTypeOf<DividerProps['flexItem']>().toEqualTypeOf<boolean | undefined>();
// `children` is intentionally removed (Divider never renders it — a pure
// visual separator), not just left un-typed — asserted explicitly rather
// than relying on a reader noticing the `Omit` in source.
expectTypeOf<DividerProps>().not.toHaveProperty('children');

// Separately-exported public type gets its own direct assertion (§15.2
// item 8), not just indirectly through `DividerProps['orientation']`.
expectTypeOf<DividerOrientation>().toEqualTypeOf<'horizontal' | 'vertical'>();

// Every orientation (2 members — both exercised).
() => <Divider orientation="horizontal" />;
() => <Divider orientation="vertical" flexItem />;
() => <Divider />;
// Invalid: not a real DividerOrientation.
// () => <Divider orientation="diagonal" />;
// Invalid: children is intentionally omitted — Divider never renders it.
// () => <Divider>content</Divider>;

// --- Ref -------------------------------------------------------------------

expectTypeOf<ComponentRef<typeof Divider>>().toEqualTypeOf<HTMLDivElement>();
