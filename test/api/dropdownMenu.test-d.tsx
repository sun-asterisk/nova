/**
 * Public API contract fixtures for `DropdownMenu` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 *
 * DropdownMenu does not export named `*Props` types — every sub-part's own
 * props are inline `ComponentProps<typeof X> & {...}` shapes, so this file
 * extracts them via `ComponentProps<typeof DropdownMenuX>['field']` instead
 * of `XProps['field']`.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentProps, ComponentRef, ReactNode } from 'react';
import { Button } from '@/components/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/dropdownMenu';

// --- Own props, checked exhaustively (§15.2 items 1, 4) --------------------

// DropdownMenuItem's genuinely "own" props beyond Radix passthrough.
expectTypeOf<ComponentProps<typeof DropdownMenuItem>['destructive']>().toEqualTypeOf<
  boolean | undefined
>();
() => <DropdownMenuItem destructive>Delete</DropdownMenuItem>;
() => <DropdownMenuItem destructive={false}>Edit</DropdownMenuItem>;

// `description` (Figma's "Menu Item" `supportText` property) — present on
// Item, CheckboxItem, and RadioItem identically.
expectTypeOf<ComponentProps<typeof DropdownMenuItem>['description']>().toEqualTypeOf<
  ReactNode | undefined
>();
expectTypeOf<ComponentProps<typeof DropdownMenuCheckboxItem>['description']>().toEqualTypeOf<
  ReactNode | undefined
>();
expectTypeOf<ComponentProps<typeof DropdownMenuRadioItem>['description']>().toEqualTypeOf<
  ReactNode | undefined
>();
() => <DropdownMenuItem description="Never used, only for this account">Delete</DropdownMenuItem>;
() => (
  <DropdownMenuCheckboxItem checked description="Adds a byte-order mark">
    UTF-8 BOM
  </DropdownMenuCheckboxItem>
);
() => (
  <DropdownMenuRadioItem value="a" description="Sorts newest first">
    Date
  </DropdownMenuRadioItem>
);

// DropdownMenuContent's portal-redirect escape hatch (mirrors
// ModalContent/TooltipContent's own `container` prop — see §7/§10).
expectTypeOf<ComponentProps<typeof DropdownMenuContent>['container']>().toEqualTypeOf<
  Element | DocumentFragment | null | undefined
>();
() => <DropdownMenuContent container={document.body}>content</DropdownMenuContent>;

// `collisionPadding` defaults to 16 (Figma's exact "16px viewport margin"
// figure) but remains overridable — inherited straight from Radix's own
// `Content` prop, not re-declared, so it accepts every shape Radix does
// (a single number or a per-side padding object).
expectTypeOf<ComponentProps<typeof DropdownMenuContent>['collisionPadding']>().toEqualTypeOf<
  number | Partial<Record<'top' | 'right' | 'bottom' | 'left', number>> | undefined
>();
() => <DropdownMenuContent collisionPadding={24}>content</DropdownMenuContent>;

// --- Full realistic composition (§15.2 item 6) — every documented
// sub-part exercised together, not a 2-node fragment: Trigger, Content,
// plain Item, CheckboxItem, RadioGroup+RadioItem, Group, Label, Separator,
// Shortcut, and a nested Sub/SubTrigger/SubContent submenu.
() => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button>Open</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuLabel>My account</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem destructive>Delete account</DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuCheckboxItem checked>Option</DropdownMenuCheckboxItem>
      <DropdownMenuRadioGroup value="a">
        <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuCheckboxItem>Nested</DropdownMenuCheckboxItem>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuContent>
  </DropdownMenu>
);

// --- Ref, every forwardRef export (§15.2 item 5) ---------------------------

expectTypeOf<ComponentRef<typeof DropdownMenuContent>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof DropdownMenuItem>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof DropdownMenuCheckboxItem>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof DropdownMenuRadioItem>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof DropdownMenuSubTrigger>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof DropdownMenuSubContent>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof DropdownMenuSeparator>>().toEqualTypeOf<HTMLDivElement>();
expectTypeOf<ComponentRef<typeof DropdownMenuLabel>>().toEqualTypeOf<HTMLDivElement>();
