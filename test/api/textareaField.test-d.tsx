/**
 * Public API contract fixtures for `TextareaField` — type-only checks
 * (never executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import {
  TextareaField,
  type TextareaFieldProps,
  type TextareaFieldVariant,
} from '@/components/textareaField';

// --- Own props, checked exhaustively (§15.2 items 1–3) --------------------

expectTypeOf<TextareaFieldProps['variant']>().toEqualTypeOf<'default' | 'error' | undefined>();
expectTypeOf<TextareaFieldProps['label']>().toEqualTypeOf<string | undefined>();
expectTypeOf<TextareaFieldProps['error']>().toEqualTypeOf<string | undefined>();
expectTypeOf<TextareaFieldProps['supportText']>().toEqualTypeOf<string | undefined>();
expectTypeOf<TextareaFieldProps['required']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<TextareaFieldProps['maxLength']>().toEqualTypeOf<number | undefined>();
expectTypeOf<TextareaFieldProps['requiredText']>().toEqualTypeOf<string | undefined>();

// Separately-exported public type gets its own direct assertion (§15.2 item
// 8). `TextareaFieldVariant` is a type alias of `TextareaVariant` — checked
// against its literal shape, not `TextareaVariant` itself, so a divergence
// between the two aliases is caught.
expectTypeOf<TextareaFieldVariant>().toEqualTypeOf<'default' | 'error'>();

// Every variant (2 members — both exercised).
() => <TextareaField variant="default" label="Bio" />;
() => <TextareaField variant="error" label="Bio" />;
// Invalid: not a real TextareaFieldVariant.
// () => <TextareaField variant="warning" label="Bio" />;

// --- classNames slot API, checked key-by-key (§15.2 item 7) ---------------

expectTypeOf<TextareaFieldProps['classNames']>().toEqualTypeOf<
  { label?: string; supportText?: string; error?: string } | undefined
>();

() => <TextareaField classNames={{ label: 'text-sm' }} />;
() => <TextareaField classNames={{ supportText: 'italic' }} />;
() => <TextareaField classNames={{ error: 'font-bold' }} />;
() => (
  <TextareaField classNames={{ label: 'text-sm', supportText: 'italic', error: 'font-bold' }} />
);

// --- Native `<textarea>` passthrough, with the `size` omission asserted ----
// (§15.2 item 4 — TextareaFieldProps = Omit<ComponentProps<'textarea'>, 'size'>)

expectTypeOf<TextareaFieldProps>().not.toHaveProperty('size');
() => <TextareaField label="Message" required requiredText="Required" maxLength={500} />;
() => <TextareaField label="Comments" error="Comments are required" value="" onChange={() => {}} />;
() => <TextareaField label="Notes" rows={6} />;
// Invalid: `size` is not a real `<textarea>` attribute and was never part
// of this field's own API either.
// () => <TextareaField label="Bio" size={20} />;

// --- Ref -------------------------------------------------------------------

expectTypeOf<ComponentRef<typeof TextareaField>>().toEqualTypeOf<HTMLTextAreaElement>();
