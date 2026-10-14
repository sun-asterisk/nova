/**
 * Public API contract fixtures for `StatusIcon` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full rationale
 * and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { StatusIcon, type StatusIconProps, type StatusIconValue } from '@/components/statusIcon';

// --- Own props, checked individually (§15.2 item 1) -------------------------

expectTypeOf<StatusIconProps['status']>().toEqualTypeOf<StatusIconValue>();
expectTypeOf<StatusIconProps['inverse']>().toEqualTypeOf<boolean | undefined>();

// --- Union checked exhaustively — every member, not sampled (§15.2 item 2) --

expectTypeOf<StatusIconValue>().toEqualTypeOf<
  'info' | 'success' | 'caution' | 'danger' | 'loading'
>();

// --- Required-vs-optional asserted precisely (§15.2 item 3): `status` is the
// only required prop — a bare <StatusIcon /> must fail to typecheck --------

// @ts-expect-error `status` is required
() => <StatusIcon />;

// --- Removed/narrowed native prop (§15.2 item 4): `children` is withheld —
// StatusIcon has no content slot of its own ----------------------------------

expectTypeOf<StatusIconProps>().not.toHaveProperty('children');

// --- Usage: every status value, every prop, incl. a commented invalid-usage
// example under the discriminant `status` prop (§15.2 items 6, 9) -----------

() => <StatusIcon status="info" />;
() => <StatusIcon status="success" />;
() => <StatusIcon status="caution" />;
() => <StatusIcon status="danger" />;
() => <StatusIcon status="loading" />;
() => <StatusIcon status="info" inverse />;
() => <StatusIcon status="info" inverse={false} />;
() => <StatusIcon status="danger" aria-label="Error" />;
() => <StatusIcon status="info" className="opacity-80" data-testid="x" />;
// @ts-expect-error 'warning' is not a valid StatusIconValue
() => <StatusIcon status="warning" />;

// --- Ref (§15.2 item 5) ------------------------------------------------------

expectTypeOf<ComponentRef<typeof StatusIcon>>().toEqualTypeOf<HTMLSpanElement>();
