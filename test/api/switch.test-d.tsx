/**
 * Public API contract fixtures for `Switch` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Switch, type SwitchProps, type SwitchSize } from '@/components/switch';

// --- Own props, checked exhaustively (§15.2 items 1–3) --------------------

expectTypeOf<SwitchProps['size']>().toEqualTypeOf<'medium' | 'large' | undefined>();

// Separately-exported public type gets its own direct assertion (§15.2
// item 8), not just indirectly through `SwitchProps['size']`.
expectTypeOf<SwitchSize>().toEqualTypeOf<'medium' | 'large'>();

// Every size (2 members — both exercised).
() => <Switch size="medium" aria-label="Enable" />;
() => <Switch size="large" defaultChecked aria-label="Enable" />;
// Invalid: not a real SwitchSize.
// () => <Switch size="small" aria-label="Enable" />;

// --- classNames slot API, checked key-by-key (§15.2 item 7) ---------------

expectTypeOf<SwitchProps['classNames']>().toEqualTypeOf<
  { track?: string; thumb?: string } | undefined
>();

() => <Switch aria-label="x" classNames={{ track: 'ring-2' }} />;
() => <Switch aria-label="x" classNames={{ thumb: 'shadow-md' }} />;
() => <Switch aria-label="x" classNames={{ track: 'ring-2', thumb: 'shadow-md' }} />;

// --- Radix `SwitchPrimitive.Root` passthrough (controlled/uncontrolled) ----

() => <Switch aria-label="Enable" />;
// className targets the outer 44x44 tap-area wrapper, not the visible track
// (documented in Switch.tsx's own JSDoc — see `classNames.track` above for
// the visible part's own override).
() => <Switch className="ring-1" aria-label="Enable" />;
() => <Switch disabled aria-label="Enable" />;
// Controlled.
() => <Switch checked aria-label="Enable" onCheckedChange={(checked) => void checked} />;
// Uncontrolled.
() => <Switch defaultChecked aria-label="Enable" />;

// --- Ref -------------------------------------------------------------------

expectTypeOf<ComponentRef<typeof Switch>>().toEqualTypeOf<HTMLButtonElement>();
