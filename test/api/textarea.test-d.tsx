/**
 * Public API contract fixtures for `Textarea` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import { Textarea, type TextareaProps, type TextareaVariant } from '@/components/textarea';

// --- Own props, checked exhaustively (§15.2 items 1–3) --------------------

expectTypeOf<TextareaProps['variant']>().toEqualTypeOf<'default' | 'error' | undefined>();
expectTypeOf<TextareaProps['id']>().toEqualTypeOf<string | undefined>();

// Separately-exported public type gets its own direct assertion (§15.2
// item 8), not just indirectly through `TextareaProps['variant']`.
expectTypeOf<TextareaVariant>().toEqualTypeOf<'default' | 'error'>();

// Every variant (2 members — both exercised).
() => <Textarea variant="default" />;
() => <Textarea variant="error" />;
() => <Textarea />;
// Invalid: not a real TextareaVariant.
// () => <Textarea variant="warning" />;

// --- Native `<textarea>` passthrough (no `Omit` — unlike TextField, no
// clashing native attribute exists for a plain <textarea>) -----------------

() => <Textarea placeholder="Enter text" />;
() => <Textarea disabled />;
() => <Textarea required />;
() => <Textarea rows={4} />;
() => <Textarea value="controlled" onChange={() => {}} />;
() => <Textarea defaultValue="uncontrolled" />;
() => <Textarea className="custom" />;

// --- Ref -------------------------------------------------------------------

expectTypeOf<ComponentRef<typeof Textarea>>().toEqualTypeOf<HTMLTextAreaElement>();
