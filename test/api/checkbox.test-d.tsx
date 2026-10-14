/**
 * Public API contract fixtures for `Checkbox` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Checkbox, type CheckboxProps, type CheckboxVariant } from '@/components/checkbox';

// --- Own props, checked exhaustively (§15.2 items 1–3) --------------------

expectTypeOf<CheckboxProps['variant']>().toEqualTypeOf<'default' | 'error' | undefined>();

// Separately-exported public type gets its own direct assertion (§15.2
// item 8), not just indirectly through `CheckboxProps['variant']`.
expectTypeOf<CheckboxVariant>().toEqualTypeOf<'default' | 'error'>();

// Every variant (2 members — both exercised).
() => <Checkbox variant="default" />;
() => <Checkbox variant="error" />;
() => <Checkbox />;
// Invalid: not a real CheckboxVariant.
// () => <Checkbox variant="warning" />;

// --- Every native/inherited prop the component removes is asserted, not
// just implied (§15.2 item 4) — `children` and `asChild` are both `Omit`'d
// since Checkbox.Root always renders its own Indicator as its only child. --

expectTypeOf<CheckboxProps>().not.toHaveProperty('children');
expectTypeOf<CheckboxProps>().not.toHaveProperty('asChild');
// Invalid: children is intentionally omitted — Checkbox always renders its
// own Indicator as its only child.
// () => <Checkbox>content</Checkbox>;
// Invalid: asChild is intentionally omitted — see Checkbox.tsx's own JSDoc.
// () => <Checkbox asChild />;

// --- Radix `CheckboxPrimitive.Root` passthrough (controlled/uncontrolled,
// tri-state) ----------------------------------------------------------------

() => <Checkbox aria-label="Accept terms" />;
() => <Checkbox disabled aria-label="Accept terms" />;
() => <Checkbox required aria-label="Accept terms" />;
() => <Checkbox className="custom" aria-label="Accept terms" />;
// Controlled, all 3 real checked states.
() => <Checkbox checked aria-label="x" onCheckedChange={(checked) => void checked} />;
() => <Checkbox checked={false} aria-label="x" onCheckedChange={(checked) => void checked} />;
() => (
  <Checkbox checked="indeterminate" aria-label="x" onCheckedChange={(checked) => void checked} />
);
// Uncontrolled.
() => <Checkbox defaultChecked aria-label="x" />;
// aria-invalid derives internally from variant/disabled (Phase X.1) but
// stays a normal inherited native prop — a consumer can still override it.
() => <Checkbox aria-invalid aria-label="x" />;

// --- Ref -------------------------------------------------------------------

expectTypeOf<ComponentRef<typeof Checkbox>>().toEqualTypeOf<HTMLButtonElement>();
