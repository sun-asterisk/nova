/**
 * Public API contract fixtures for `TooltipProvider`/`Tooltip`/
 * `TooltipTrigger`/`TooltipContent` — type-only checks (never executed at
 * runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  type TooltipProviderProps,
  type TooltipProps,
  type TooltipTriggerProps,
  type TooltipContentProps,
} from '@/components/tooltip';

// Tooltip's own top-level open/onOpenChange/defaultOpen are all inherited
// directly from Radix's Root — asserted via the type itself, not just via
// JSX fixtures, so TooltipProps is a genuine, used import.
expectTypeOf<TooltipProps['open']>().toEqualTypeOf<boolean | undefined>();
expectTypeOf<TooltipProps['defaultOpen']>().toEqualTypeOf<boolean | undefined>();

// --- All 4 types are direct Radix aliases (no own fields beyond
// TooltipContent's `container`) — verified via the actual composition
// fixtures below, since there is nothing else to assert exhaustively. -----

// TooltipProvider: delayDuration/skipDelayDuration default in the
// component (500/0) but stay optional on the type.
expectTypeOf<TooltipProviderProps['delayDuration']>().toEqualTypeOf<number | undefined>();
expectTypeOf<TooltipProviderProps['skipDelayDuration']>().toEqualTypeOf<number | undefined>();

() => (
  <TooltipProvider>
    <div />
  </TooltipProvider>
);
() => (
  <TooltipProvider delayDuration={300} skipDelayDuration={100}>
    <div />
  </TooltipProvider>
);

// Tooltip: controlled + uncontrolled open state (2 genuinely valid shapes,
// §15.2 item 6).
() => (
  <Tooltip>
    <TooltipTrigger>
      <button>Hover</button>
    </TooltipTrigger>
    <TooltipContent>Text</TooltipContent>
  </Tooltip>
);
() => (
  <Tooltip open onOpenChange={(open) => void open}>
    <TooltipTrigger>
      <button>Hover</button>
    </TooltipTrigger>
    <TooltipContent>Text</TooltipContent>
  </Tooltip>
);

// TooltipTrigger: `asChild` defaults to `true` at the component level (a
// deliberate flip from Radix's own `false` default, per Tooltip.tsx's own
// JSDoc) but the TYPE itself still declares it as an optional boolean, same
// as Radix's own — the default-value behavior isn't type-checkable, only
// documented; asserted here so the prop itself isn't silently removed.
expectTypeOf<TooltipTriggerProps['asChild']>().toEqualTypeOf<boolean | undefined>();
() => (
  <TooltipTrigger asChild={false}>
    <span>text</span>
  </TooltipTrigger>
);

// TooltipContent: the one genuinely Sun-added field, `container` (Portal
// forwarding convention, component-api-conventions.md §9). Previously
// (Phase 14 P3-2, closed) `container` was only added inline in
// Tooltip.tsx's own `forwardRef<..., TooltipContentProps & {container}>`
// call and was NOT part of the separately-exported `TooltipContentProps`
// type — folded directly into the exported type so consumers can reference
// `TooltipContentProps['container']` without reaching for
// `ComponentProps<typeof TooltipContent>` instead.
expectTypeOf<TooltipContentProps['container']>().toEqualTypeOf<
  Element | DocumentFragment | null | undefined
>();
() => <TooltipContent container={document.body}>Text</TooltipContent>;

// `sideOffset` IS part of the exported `TooltipContentProps` (inherited
// directly from Radix's own Content, unlike `container` above).
expectTypeOf<TooltipContentProps['sideOffset']>().toEqualTypeOf<number | undefined>();
() => (
  <TooltipContent side="right" sideOffset={12}>
    Text
  </TooltipContent>
);

// --- Ref (2 forwardRef exports; TooltipProvider/Tooltip correctly have
// none — they're Root/Provider aliases with no DOM node of their own,
// component-api-conventions.md §7 — §15.2 item 5) --------------------------

expectTypeOf<ComponentRef<typeof TooltipTrigger>>().toEqualTypeOf<HTMLButtonElement>();
expectTypeOf<ComponentRef<typeof TooltipContent>>().toEqualTypeOf<HTMLDivElement>();
