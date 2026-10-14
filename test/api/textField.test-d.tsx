/**
 * Public API contract fixtures for `TextField` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef, ReactNode } from 'react';
import { TextField, type TextFieldProps, type TextFieldVariant } from '@/components/textField';

// --- Own props, checked exhaustively (§15.2 items 1–3) --------------------

expectTypeOf<TextFieldProps['variant']>().toEqualTypeOf<'default' | 'error' | undefined>();
expectTypeOf<TextFieldProps['label']>().toEqualTypeOf<string | undefined>();
expectTypeOf<TextFieldProps['error']>().toEqualTypeOf<string | undefined>();
expectTypeOf<TextFieldProps['supportText']>().toEqualTypeOf<string | undefined>();
expectTypeOf<TextFieldProps['required']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<TextFieldProps['startAdornment']>().toEqualTypeOf<ReactNode | undefined>();
expectTypeOf<TextFieldProps['endAdornment']>().toEqualTypeOf<ReactNode | undefined>();
expectTypeOf<TextFieldProps['requiredText']>().toEqualTypeOf<string | undefined>();

// Separately-exported public type gets its own direct assertion (§15.2 item
// 8), not just indirectly through `TextFieldProps['variant']`. `TextFieldVariant`
// is a type alias of `InputVariant` — checked against its literal shape, not
// `InputVariant` itself, so a divergence between the two aliases is caught.
expectTypeOf<TextFieldVariant>().toEqualTypeOf<'default' | 'error'>();

// Every variant (2 members — both exercised).
() => <TextField variant="default" label="Name" />;
() => <TextField variant="error" label="Name" />;
// Invalid: not a real TextFieldVariant.
// () => <TextField variant="warning" label="Name" />;

// --- classNames slot API, checked key-by-key (§15.2 item 7) ---------------

expectTypeOf<TextFieldProps['classNames']>().toEqualTypeOf<
  { label?: string; supportText?: string; error?: string } | undefined
>();

() => <TextField classNames={{ label: 'text-sm' }} />;
() => <TextField classNames={{ supportText: 'italic' }} />;
() => <TextField classNames={{ error: 'font-bold' }} />;
() => <TextField classNames={{ label: 'text-sm', supportText: 'italic', error: 'font-bold' }} />;

// --- Native `<input>` passthrough, with the `size` omission asserted -------
// (§15.2 item 4 — TextFieldProps = Omit<ComponentProps<'input'>, 'size'>)

expectTypeOf<TextFieldProps>().not.toHaveProperty('size');
() => <TextField label="Name" placeholder="Enter name" name="name" value="x" disabled />;
() => <TextField label="Name" required requiredText="Required" />;
() => <TextField label="Email" error="Invalid email" />;
() => <TextField label="Bio" supportText="Optional" />;
// Invalid: `size` was intentionally removed from the native `<input>`
// passthrough (TextField has no visual size axis of its own yet).
// () => <TextField label="Name" size={20} />;

// --- Ref -------------------------------------------------------------------

expectTypeOf<ComponentRef<typeof TextField>>().toEqualTypeOf<HTMLInputElement>();
