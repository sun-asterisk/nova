/**
 * Public API contract fixtures for `Button` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 *
 * Valid usage must compile; a commented-out invalid usage documents what
 * must NOT compile (kept as a comment, since a real `// @ts-expect-error`
 * block would still execute type inference on discarded code and isn't
 * meaningfully different for documentation purposes — the goal here is a
 * living reference for reviewers, not exhaustive negative-type testing).
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from '@/components/button';

// --- Own props, checked exhaustively (§15.2 items 1–3) --------------------

expectTypeOf<ButtonProps['variant']>().toEqualTypeOf<
  'primary' | 'secondary' | 'emphasis' | 'plain' | 'danger' | undefined
>();
expectTypeOf<ButtonProps['size']>().toEqualTypeOf<'small' | 'medium' | 'large' | undefined>();
expectTypeOf<ButtonProps['asChild']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<ButtonProps['iconOnly']>().toEqualTypeOf<boolean | undefined>();

// Separately-exported public types get their own direct assertion (§15.2
// item 8), not just indirectly through `ButtonProps['variant']`.
expectTypeOf<ButtonVariant>().toEqualTypeOf<
  'primary' | 'secondary' | 'emphasis' | 'plain' | 'danger'
>();
expectTypeOf<ButtonSize>().toEqualTypeOf<'small' | 'medium' | 'large'>();

// Every variant, sampled (5 members — all appear in the type check above;
// every one also gets a JSX usage since each carries materially different
// visual/semantic meaning, per §15.2 item 2's "5+ members" guidance).
() => <Button variant="primary">Click</Button>;
() => <Button variant="secondary">Click</Button>;
() => <Button variant="emphasis">Click</Button>;
() => <Button variant="plain">Click</Button>;
() => <Button variant="danger">Click</Button>;
// Invalid: not a real ButtonVariant.
// () => <Button variant="notarealvariant">Click</Button>;

// Every size.
() => <Button size="small">Click</Button>;
() => <Button size="medium">Click</Button>;
() => <Button size="large">Click</Button>;
// Invalid: not a real ButtonSize.
// () => <Button size="huge">Click</Button>;

// --- asChild polymorphism ---------------------------------------------------

() => (
  <Button asChild>
    <a href="/x">Click</a>
  </Button>
);
// A non-asChild Button renders its own <button> — no child-element
// requirement, `children` may be any ReactNode.
() => <Button>Click</Button>;
// Invalid: `asChild` does not exempt the child requirement mid-migration —
// Radix's `Slot` throws at runtime (not a type error) if given zero or
// multiple children; this is documented here as a behavioral note, not a
// type-level check, since TypeScript cannot express "exactly one child."

// --- Native `<button>` passthrough (extends ComponentProps<'button'>) -----

// `type` defaults to 'button' at runtime (Button.tsx) but remains the full
// native union at the type level — every native value must still compile.
() => <Button type="button">Click</Button>;
() => <Button type="submit">Save</Button>;
() => <Button type="reset">Reset</Button>;
() => (
  <Button disabled onClick={(e) => void e}>
    Click
  </Button>
);
() => <Button aria-label="Add" />;

// --- Ref ---------------------------------------------------------------

expectTypeOf<ComponentRef<typeof Button>>().toEqualTypeOf<HTMLButtonElement>();

// --- iconOnly (Figma "Icon Button", 2026-10-05) ----------------------------

() => (
  <Button iconOnly aria-label="Add">
    <svg aria-hidden="true" />
  </Button>
);
() => (
  <Button iconOnly asChild>
    <a href="/x" aria-label="Home">
      <svg aria-hidden="true" />
    </a>
  </Button>
);
