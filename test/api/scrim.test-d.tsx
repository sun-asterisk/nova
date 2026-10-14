/**
 * Public API contract fixtures for `Scrim` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full rationale
 * and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentProps, ComponentRef } from 'react';
import { Scrim, type ScrimProps } from '@/components/scrim';

// No own props — a plain <div> minus `children` (§15.2 items 1, 4).
expectTypeOf<ScrimProps>().toEqualTypeOf<Omit<ComponentProps<'div'>, 'children'>>();
expectTypeOf<ComponentRef<typeof Scrim>>().toEqualTypeOf<HTMLDivElement>();

() => <Scrim />;
() => <Scrim onClick={() => {}} className="z-40" data-testid="scrim" />;
() => <Scrim ref={(el: HTMLDivElement | null) => void el} />;
// Invalid: a scrim is a backdrop, not a container.
// @ts-expect-error — no children
() => <Scrim>content</Scrim>;
