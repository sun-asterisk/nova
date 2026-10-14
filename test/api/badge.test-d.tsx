/**
 * Public API contract fixtures for `Badge` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Badge, type BadgeProps } from '@/components/badge';

// Phase: 2026-09-07 Figma-fidelity audit.
expectTypeOf<BadgeProps['variant']>().toEqualTypeOf<
  'count' | 'dot' | 'label' | 'error' | undefined
>();

() => <Badge variant="count" label="99+" />;
() => <Badge variant="dot" aria-label="Unread notifications" />;
() => <Badge variant="label">New</Badge>;
() => <Badge variant="error" />;
// Invalid: not a real BadgeVariant.
// () => <Badge variant="notarealvariant" />;

expectTypeOf<BadgeProps['max']>().toEqualTypeOf<number | undefined>();
() => <Badge variant="count" label="150" max={99} />;

expectTypeOf<BadgeProps['position']>().toEqualTypeOf<
  'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | undefined
>();
() => <Badge variant="dot" aria-label="Online" position="top-right" />;
// Invalid: not a real BadgePosition.
// () => <Badge variant="dot" position="center" />;

expectTypeOf<ComponentRef<typeof Badge>>().toEqualTypeOf<HTMLSpanElement>();
