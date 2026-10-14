/**
 * Public API contract fixtures for `Tabs`/`TabsList`/`TabsTrigger`/
 * `TabsContent` — type-only checks (never executed at runtime), run via
 * `pnpm test:api`. See docs/architecture/component-api-conventions.md §15
 * for the full rationale and the one-file-per-component convention this
 * file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef, ReactNode } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  type TabsProps,
  type TabsListProps,
  type TabsTriggerProps,
  type TabsContentProps,
} from '@/components/tab';

// --- Required vs. optional asserted precisely (§15.2 item 3) — `children`
// is required (not `| undefined`) on all 4 parts; `defaultValue`/
// `className` are optional on the parts that declare them. -----------------

expectTypeOf<TabsProps['children']>().toEqualTypeOf<ReactNode>();
expectTypeOf<TabsProps['defaultValue']>().toEqualTypeOf<string | undefined>();
expectTypeOf<TabsProps['onValueChange']>().toEqualTypeOf<((value: string) => void) | undefined>();
expectTypeOf<TabsProps['className']>().toEqualTypeOf<string | undefined>();

expectTypeOf<TabsListProps['children']>().toEqualTypeOf<ReactNode>();
expectTypeOf<TabsListProps['className']>().toEqualTypeOf<string | undefined>();

expectTypeOf<TabsTriggerProps['children']>().toEqualTypeOf<ReactNode>();
expectTypeOf<TabsTriggerProps['className']>().toEqualTypeOf<string | undefined>();

expectTypeOf<TabsContentProps['children']>().toEqualTypeOf<ReactNode>();
expectTypeOf<TabsContentProps['className']>().toEqualTypeOf<string | undefined>();

// `badgeLabel`/`icon` are NOT real props (component-capability-matrix.md's
// documented JSDoc-vs-type drift finding) — composition via children is the
// only working pattern. Asserted explicitly so a future accidental
// reintroduction of the documented-but-fake props is caught.
expectTypeOf<TabsTriggerProps>().not.toHaveProperty('badgeLabel');
expectTypeOf<TabsTriggerProps>().not.toHaveProperty('icon');

// --- Realistic full composition (compound API, §15.2 item 6) --------------

() => (
  <Tabs defaultValue="tab1">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2" disabled>
        Tab 2
      </TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
    <TabsContent value="tab2">Content 2</TabsContent>
  </Tabs>
);

// Controlled shape (a second genuinely valid composition, §15.2 item 6).
() => (
  <Tabs value="tab1" onValueChange={(value) => void value}>
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Content 1</TabsContent>
  </Tabs>
);

// --- Ref (4 forwardRef exports, each checked — §15.2 item 5) --------------

expectTypeOf<ComponentRef<typeof Tabs>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof TabsList>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof TabsTrigger>>().toEqualTypeOf<HTMLButtonElement>();
expectTypeOf<ComponentRef<typeof TabsContent>>().toEqualTypeOf<HTMLDivElement>();
