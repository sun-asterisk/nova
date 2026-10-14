/**
 * Public API contract fixtures for `Scrollbar` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Scrollbar, ScrollBarArea, type ScrollbarProps } from '@/components/scrollbar';

// Phase: 2026-09-08 Figma-fidelity audit.
expectTypeOf<ScrollbarProps['showVertical']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<ScrollbarProps['showHorizontal']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<ScrollbarProps['viewportClassName']>().toEqualTypeOf<string | undefined>();
expectTypeOf<ScrollbarProps['scrollbarClassName']>().toEqualTypeOf<string | undefined>();
expectTypeOf<ScrollbarProps['thumbClassName']>().toEqualTypeOf<string | undefined>();

() => (
  <Scrollbar showHorizontal={false} viewportClassName="p-4" thumbClassName="bg-border-strong">
    content
  </Scrollbar>
);
() => <ScrollBarArea orientation="horizontal" thumbClassName="bg-border-strong" />;

expectTypeOf<ComponentRef<typeof Scrollbar>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof ScrollBarArea>>().toEqualTypeOf<HTMLDivElement>();
