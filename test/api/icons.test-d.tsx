/**
 * Public API contract fixtures for `Icons` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 *
 * All 61 icons share one identical shape — `forwardRef<SVGSVGElement,
 * SVGProps<SVGSVGElement>>`, no icon-specific props, `aria-hidden="true"`
 * by default, `fill="currentColor"` on their paths — confirmed by reading
 * `IconHome.tsx`/`IconExclamationCircle.tsx` in full. Per-icon exhaustive
 * assertions would add no value (every icon is the same wrapper around a
 * different `<path>`); this file instead asserts the SHARED shape on 2
 * representative icons and exercises the full passthrough surface once.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentProps, ComponentRef } from 'react';
import {
  IconHome,
  IconExclamationCircle,
  IconSun,
  IconMoon,
  IconCloud,
  IconArrowUturnLeft,
  IconArrowUturnRight,
  IconArrowsUpDown,
} from '@/components/icons';

// --- Shared shape (§15.2 items 1, 8) ---------------------------------------
// No icon-specific own props exist — every icon is pure `SVGProps<SVGSVGElement>`
// passthrough (confirmed by reading IconHome.tsx/IconExclamationCircle.tsx in
// full), so there is nothing to assert per icon beyond confirming the two
// representative icons share the exact same prop shape as each other.
expectTypeOf<ComponentProps<typeof IconHome>>().toEqualTypeOf<
  ComponentProps<typeof IconExclamationCircle>
>();

// --- Full passthrough surface, exercised once (representative, not per-icon) —

() => <IconHome />;
() => <IconHome className="w-4 h-4" width={16} height={16} aria-hidden="false" />;
() => <IconHome aria-label="Home" role="img" />;
() => <IconExclamationCircle onClick={(e) => void e} style={{ color: 'red' }} />;

// --- Ref, checked on 2 representative icons (§15.2 item 5) -----------------

expectTypeOf<ComponentRef<typeof IconHome>>().toEqualTypeOf<SVGSVGElement>();
expectTypeOf<ComponentRef<typeof IconExclamationCircle>>().toEqualTypeOf<SVGSVGElement>();
() => <IconHome ref={(el: SVGSVGElement | null) => void el} />;

// --- Icons added 2026-10-06 (Figma Icon Master, created 2026-10-05) ----------
// Exported from ./icons with the same shared shape as every other icon.
expectTypeOf<ComponentProps<typeof IconSun>>().toEqualTypeOf<ComponentProps<typeof IconHome>>();
expectTypeOf<ComponentProps<typeof IconMoon>>().toEqualTypeOf<ComponentProps<typeof IconHome>>();
expectTypeOf<ComponentProps<typeof IconCloud>>().toEqualTypeOf<ComponentProps<typeof IconHome>>();
expectTypeOf<ComponentProps<typeof IconArrowUturnLeft>>().toEqualTypeOf<
  ComponentProps<typeof IconHome>
>();
expectTypeOf<ComponentProps<typeof IconArrowUturnRight>>().toEqualTypeOf<
  ComponentProps<typeof IconHome>
>();
expectTypeOf<ComponentProps<typeof IconArrowsUpDown>>().toEqualTypeOf<
  ComponentProps<typeof IconHome>
>();
expectTypeOf<ComponentRef<typeof IconSun>>().toEqualTypeOf<SVGSVGElement>();
