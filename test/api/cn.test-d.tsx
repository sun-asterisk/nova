/**
 * Public API contract fixture for the `cn` utility — the library's one
 * deliberate non-visual public export (Phase X Foundation Capability Audit
 * §9.1/P1.1). Type-only checks (never executed at runtime), run via
 * `pnpm test:api`. See docs/architecture/component-api-conventions.md §15
 * for the full rationale and the one-file-per-export convention this file
 * follows.
 *
 * Imports via the internal `@/utils` alias, matching every other
 * `test/api/*.test-d.tsx` fixture's convention (they check the source-level
 * type contract, not literal package-name resolution, which requires a
 * self-referencing node_modules symlink these fixtures don't set up).
 * That the published `./cn` subpath resolves in isolation (ESM + CJS, with
 * `Object.keys()` returning exactly `['cn']` — no accidental extra exports)
 * is separately verified against the real packed tarball; see the Phase X
 * Foundation Implementation Report for that evidence.
 */
import { expectTypeOf } from 'vitest';
import { cn } from '@/utils';

// --- Signature ---------------------------------------------------------------

expectTypeOf(cn).toBeFunction();
expectTypeOf(cn).returns.toEqualTypeOf<string>();

// --- Accepts every clsx ClassValue shape (§15.2 item 6: realistic usage) -----

cn('a');
cn('a', 'b', 'c');
cn(undefined);
cn(null);
cn(false);
cn('a', undefined, null, false, '');
cn({ a: true, b: false });
cn(['a', 'b']);
cn(['a', { b: true }, ['c', undefined]]);
cn();
