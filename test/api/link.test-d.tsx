/**
 * Public API contract fixtures for `Link` — type-only checks (never executed
 * at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full rationale
 * and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef, ReactNode } from 'react';
import { Link, type LinkProps, type LinkSize } from '@/components/link';

// --- Own props, checked individually (§15.2 item 1) -------------------------

expectTypeOf<LinkProps['size']>().toEqualTypeOf<LinkSize | undefined>();
expectTypeOf<LinkProps['disabled']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<LinkProps['startAdornment']>().toEqualTypeOf<ReactNode | undefined>();
expectTypeOf<LinkProps['endAdornment']>().toEqualTypeOf<ReactNode | undefined>();
// RR-01 (2026-09-29): polymorphism for router links (conventions §10).
expectTypeOf<LinkProps['asChild']>().toEqualTypeOf<boolean | undefined>();
() => (
  <Link asChild>
    <a href="/router-rendered">Settings</a>
  </Link>
);

// --- `LinkSize` union checked exhaustively — every member, not sampled
// (§15.2 item 2) ------------------------------------------------------------

expectTypeOf<LinkSize>().toEqualTypeOf<'large' | 'medium' | 'small'>();

// --- Native anchor passthrough (LinkProps extends ComponentProps<'a'>) -----
// `target`/`rel` are exercised via real usage below rather than an exact
// type-equality check — their React type (`HTMLAttributeAnchorTarget`, an
// alias, not literally `string`) isn't a meaningful "own prop" of this
// component's contract the way `size`/`disabled`/adornments are.

expectTypeOf<LinkProps['href']>().toEqualTypeOf<string | undefined>();

// --- Usage: every prop combination, including the discriminant `disabled`
// prop's real vs. invalid usage (§15.2 item 9) -------------------------------

() => <Link href="/settings">Settings</Link>;
() => <Link href="/settings" size="large" />;
() => <Link href="/settings" size="medium" />;
() => <Link href="/settings" size="small" />;
() => <Link href="/settings" disabled />;
() => <Link href="/settings" disabled={false} />;
() => <Link href="/settings" startAdornment={<span />} endAdornment={<span />} />;
() => (
  <Link href="https://example.com" target="_blank" rel="noopener noreferrer">
    External
  </Link>
);
// `disabled` does not narrow away href/onClick from the type — they remain
// valid to pass (the component drops them internally at runtime; see
// Link.tsx's own doc comment) — this is intentional, not a type gap: making
// them conditionally-typed-away would require a discriminated union just for
// this single prop, which the rest of this library's `disabled` props
// (Button, Checkbox, Switch, etc.) don't do either.
() => (
  <Link href="/settings" disabled onClick={() => {}}>
    Settings
  </Link>
);

// --- Ref (§15.2 item 5) ------------------------------------------------------
// Link forwards to `HTMLAnchorElement | HTMLSpanElement` since it can render
// as either depending on `disabled` — not a single concrete element type.

expectTypeOf<ComponentRef<typeof Link>>().toEqualTypeOf<HTMLAnchorElement | HTMLSpanElement>();
