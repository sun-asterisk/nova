/**
 * Public API contract fixtures for `Input` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef, ReactNode } from 'react';
import { Input, type InputProps, type InputVariant } from '@/components/input';

// --- Own props, checked exhaustively (§15.2 items 1–3) --------------------

expectTypeOf<InputProps['variant']>().toEqualTypeOf<'default' | 'error' | undefined>();
expectTypeOf<InputProps['startAdornment']>().toEqualTypeOf<ReactNode | undefined>();
expectTypeOf<InputProps['endAdornment']>().toEqualTypeOf<ReactNode | undefined>();

// Separately-exported public type gets its own direct assertion (§15.2 item
// 8). `InputVariant` is deliberately just `'default' | 'error'` — Input.tsx
// internally computes a THIRD value, `'disabled'` (`effectiveVariant =
// disabled ? 'disabled' : variant`), purely to select styling when the
// native `disabled` attribute is set. That internal-only value must never
// leak into this public type — the exact class of bug this whole test
// layer exists to catch (a prop silently widened by an internal
// implementation detail).
expectTypeOf<InputVariant>().toEqualTypeOf<'default' | 'error'>();

// Every variant (2 members — both exercised).
() => <Input variant="default" placeholder="Enter text" />;
() => <Input variant="error" placeholder="Fix this field" />;
// Invalid: not a real InputVariant — in particular, the internal
// `effectiveVariant`'s `'disabled'` value must not be settable directly.
// () => <Input variant="disabled" />;
// () => <Input variant="warning" />;

// --- classNames slot API, checked key-by-key (§15.2 item 7) ---------------

expectTypeOf<InputProps['classNames']>().toEqualTypeOf<
  { wrapper?: string; startAdornment?: string; endAdornment?: string } | undefined
>();

() => <Input classNames={{ wrapper: 'h-12 rounded-200' }} />;
() => <Input classNames={{ startAdornment: 'text-icon-secondary' }} />;
() => <Input classNames={{ endAdornment: 'text-icon-secondary' }} />;
() => <Input classNames={{ wrapper: 'h-12', startAdornment: 'px-1', endAdornment: 'px-1' }} />;

// --- Native `<input>` passthrough ------------------------------------------

() => (
  <Input
    placeholder="Search..."
    startAdornment={<span>@</span>}
    endAdornment={<span>x</span>}
    disabled
    type="password"
    name="q"
    value="x"
    onChange={(e) => void e}
  />
);

// --- Ref -------------------------------------------------------------------

expectTypeOf<ComponentRef<typeof Input>>().toEqualTypeOf<HTMLInputElement>();
