/**
 * Public API contract fixtures for `Snackbar` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 *
 * Covers both the presentational `<Snackbar>` component and the imperative
 * `showSnackbar()`/`ShowSnackbarOptions` API (`useSnackbar.tsx`) — the two
 * share `SnackbarVariant`/`SnackbarPosition`/`SnackbarActionConfig`, so both
 * surfaces are checked against the same source types.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import {
  Snackbar,
  showSnackbar,
  type SnackbarProps,
  type SnackbarVariant,
  type SnackbarPosition,
  type SnackbarActionConfig,
  type ShowSnackbarOptions,
} from '@/components/snackbar';

// --- Own props, checked exhaustively (§15.2 items 1–3) --------------------

expectTypeOf<SnackbarProps['variant']>().toEqualTypeOf<
  'info' | 'success' | 'warning' | 'error' | 'loading' | undefined
>();
// `title` is OPTIONAL since 2026-10-07 — most Figma snackbars are a message
// only (§15.2 item 3: required vs. optional asserted precisely).
expectTypeOf<SnackbarProps['title']>().toEqualTypeOf<string | undefined>();
expectTypeOf<SnackbarProps['progress']>().toEqualTypeOf<number | undefined>();
expectTypeOf<SnackbarProps['message']>().toEqualTypeOf<string | undefined>();
expectTypeOf<SnackbarProps['closable']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<SnackbarProps['duration']>().toEqualTypeOf<number | false | undefined>();
expectTypeOf<SnackbarProps['icon']>().not.toBeNever();
expectTypeOf<SnackbarProps['actions']>().toEqualTypeOf<SnackbarActionConfig[] | undefined>();
expectTypeOf<SnackbarProps['onClose']>().toEqualTypeOf<(() => void) | undefined>();

// Separately-exported public types get their own direct assertions (§15.2
// item 8), not just indirectly through `SnackbarProps`.
expectTypeOf<SnackbarVariant>().toEqualTypeOf<
  'info' | 'success' | 'warning' | 'error' | 'loading'
>();
expectTypeOf<SnackbarPosition>().toEqualTypeOf<
  'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
>();
expectTypeOf<SnackbarActionConfig>().toEqualTypeOf<{ label: string; onClick: () => void }>();

// Every variant (5 members — all exercised, each a different inverse
// StatusIcon per Snackbar.tsx's `statusByVariant` map).
() => <Snackbar variant="info" title="タイトル" />;
() => <Snackbar variant="success" title="タイトル" />;
() => <Snackbar variant="warning" message="メッセージ" />;
() => <Snackbar variant="error" title="タイトル" />;
() => <Snackbar variant="loading" message="アップロード中…" progress={40} />;
// Invalid: not a real SnackbarVariant.
// () => <Snackbar variant="danger" title="タイトル" />;
// Message only (no title) is valid.
() => <Snackbar message="メッセージ" />;

// `duration`: number, `false` (disables auto-dismiss), and default both valid.
() => <Snackbar title="x" duration={6000} />;
() => <Snackbar title="x" duration={false} />;

// `closable`, `actions`, `onClose`, custom `icon`.
() => <Snackbar title="x" closable={false} />;
() => (
  <Snackbar
    title="x"
    message="details"
    actions={[{ label: 'Undo', onClick: () => {} }]}
    onClose={() => {}}
    icon={<span>!</span>}
  />
);

// --- classNames slot API, checked key-by-key (§15.2 item 7) ---------------

expectTypeOf<SnackbarProps['classNames']>().toEqualTypeOf<
  { icon?: string; content?: string; actions?: string; closeButton?: string } | undefined
>();

() => <Snackbar title="x" classNames={{ icon: 'text-red-500' }} />;
() => <Snackbar title="x" classNames={{ content: 'gap-2' }} />;
() => <Snackbar title="x" classNames={{ actions: 'gap-1' }} />;
() => <Snackbar title="x" classNames={{ closeButton: 'text-icon-secondary' }} />;

// --- Native `<div>` passthrough, with `title` narrowed away (§15.2 item 4) -
// SnackbarProps = Omit<ComponentProps<'div'>, 'title'> & { title: string }
// — the native (HTMLAttributes) `title` (a plain tooltip string) is
// intentionally replaced by Snackbar's own required, semantically
// different `title` prop above; there is no separate native-`title` slot.

() => <Snackbar title="x" aria-live="polite" />;

// --- Imperative API: showSnackbar()/ShowSnackbarOptions -------------------

expectTypeOf<ShowSnackbarOptions['variant']>().toEqualTypeOf<SnackbarVariant | undefined>();
expectTypeOf<ShowSnackbarOptions['title']>().toEqualTypeOf<string | undefined>();
expectTypeOf<ShowSnackbarOptions['progress']>().toEqualTypeOf<number | undefined>();
expectTypeOf<ShowSnackbarOptions['id']>().toEqualTypeOf<string | number | undefined>();
expectTypeOf<ShowSnackbarOptions['message']>().toEqualTypeOf<string | undefined>();
expectTypeOf<ShowSnackbarOptions['closable']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<ShowSnackbarOptions['duration']>().toEqualTypeOf<number | false | undefined>();
expectTypeOf<ShowSnackbarOptions['position']>().toEqualTypeOf<SnackbarPosition | undefined>();
expectTypeOf<ShowSnackbarOptions['actions']>().toEqualTypeOf<SnackbarActionConfig[] | undefined>();

showSnackbar({ title: 'x' });
showSnackbar({ variant: 'success', title: 'x', message: 'y', duration: false });
showSnackbar({
  title: 'x',
  position: 'top-right',
  actions: [{ label: 'Undo', onClick: () => {} }],
});
// loading → success in place, reusing the returned id.
const uploadId = showSnackbar({ variant: 'loading', message: 'x', progress: 0 });
showSnackbar({ id: uploadId, variant: 'success', message: 'done' });
// Invalid: not a real SnackbarPosition.
// showSnackbar({ title: 'x', position: 'center' });

// --- Ref -------------------------------------------------------------------

expectTypeOf<ComponentRef<typeof Snackbar>>().toEqualTypeOf<HTMLDivElement>();
