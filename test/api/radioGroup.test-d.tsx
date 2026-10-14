/**
 * Public API contract fixtures for `RadioGroup`/`RadioGroupItem` — type-only
 * checks (never executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupProps,
  type RadioGroupItemProps,
  type RadioGroupItemVariant,
} from '@/components/radioGroup';

// --- RadioGroup: no own props beyond Radix Root passthrough ----------------

() => (
  <RadioGroup defaultValue="a">
    <RadioGroupItem value="a" />
  </RadioGroup>
);
() => (
  <RadioGroup value="a" onValueChange={(value) => void value} disabled required name="plan">
    <RadioGroupItem value="a" />
  </RadioGroup>
);
() => (
  <RadioGroup orientation="horizontal" className="custom">
    <RadioGroupItem value="a" />
  </RadioGroup>
);

// --- RadioGroupItem: own props, checked exhaustively (§15.2 items 1–3) ----

expectTypeOf<RadioGroupItemProps['variant']>().toEqualTypeOf<'default' | 'error' | undefined>();

// Separately-exported public type gets its own direct assertion (§15.2
// item 8), not just indirectly through `RadioGroupItemProps['variant']`.
expectTypeOf<RadioGroupItemVariant>().toEqualTypeOf<'default' | 'error'>();

// Every variant (2 members — both exercised).
() => <RadioGroupItem value="a" variant="default" />;
() => <RadioGroupItem value="a" variant="error" />;
() => <RadioGroupItem value="a" />;
// Invalid: not a real RadioGroupItemVariant.
// () => <RadioGroupItem value="a" variant="warning" />;

// --- Radix `RadioGroupPrimitive.Item` passthrough ---------------------------

() => <RadioGroupItem value="a" disabled />;
() => <RadioGroupItem value="a" required />;
() => <RadioGroupItem value="a" className="custom" />;
() => <RadioGroupItem value="a" id="r1" />;
// aria-invalid derives internally from variant/disabled (Phase X.1) but
// stays a normal inherited native prop — a consumer can still override it.
() => <RadioGroupItem value="a" aria-invalid />;

// --- Ref (2 forwardRef exports, each checked — §15.2 item 5) --------------

expectTypeOf<ComponentRef<typeof RadioGroup>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof RadioGroupItem>>().toEqualTypeOf<HTMLButtonElement>();

// --- Prop bags exist and are exported (no assertions beyond ensuring the
// import above type-checks — these are structural Omit/passthrough types
// with no own fields beyond what's already checked above) ------------------

() => {
  const _p: RadioGroupProps = { children: null };
  return _p;
};
