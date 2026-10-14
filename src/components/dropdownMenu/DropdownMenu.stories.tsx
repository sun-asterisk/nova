import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
} from './DropdownMenu';

const meta = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A compound menu built on Radix DropdownMenu — Trigger, Content, Item, CheckboxItem, RadioItem, and a nested Sub/SubTrigger/SubContent for submenus. Full keyboard navigation (Arrow keys, Enter, Escape, type-ahead) and roving focus come from Radix; this library only supplies styling and the `destructive` item variant.',
      },
    },
  },
  tags: ['autodocs'],
  // Every story below drives DropdownMenu via a custom `render` (its
  // interesting behavior — compound composition, submenus, portal
  // redirects — isn't expressible as flat args), so this table is for API
  // documentation in the autodocs panel only; it does not drive a live
  // controls-panel re-render.
  argTypes: {
    open: {
      description: 'Controlled open state — omit for uncontrolled behavior',
      control: false,
      table: { type: { summary: 'boolean' } },
    },
    defaultOpen: {
      description: 'Uncontrolled default open state, used only on first mount',
      control: false,
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    onOpenChange: {
      description: 'Fires whenever the open state changes, controlled or uncontrolled',
      control: false,
      table: { type: { summary: '(open: boolean) => void' } },
    },
    modal: {
      description:
        'Whether interaction with outside elements is disabled while the menu is open (focus trap, scroll lock)',
      control: false,
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'true' } },
    },
    dir: {
      description: 'Reading direction of the menu',
      control: false,
      table: { type: { summary: "'ltr' | 'rtl'" } },
    },
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic menu with a trigger and three plain action items. */
export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** `DropdownMenuShortcut` renders a right-aligned keyboard-shortcut hint inside an item. */
export const WithShortcuts: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          New file
          <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Save
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** `DropdownMenuLabel` groups items under a heading, separated by `DropdownMenuSeparator`. */
export const WithLabelAndSeparator: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Billing</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** `disabled` on an item suppresses pointer/keyboard activation and is skipped by roving focus. */
export const DisabledItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem disabled>Duplicate (unavailable)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** `destructive` switches to danger text styling; regular items keep the primary text color. */
export const DestructiveItem: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive>Delete account</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const editItem = await body.findByRole('menuitem', { name: 'Edit' });
    const deleteItem = body.getByRole('menuitem', { name: 'Delete account' });

    expect(editItem.className).toContain('text-sds-text-primary');
    expect(deleteItem.className).toContain('text-sds-text-danger');

    await userEvent.keyboard('{Escape}');
    // Wait for Radix's async focus-guard cleanup so the axe scan doesn't
    // catch a transient mid-close frame (same reasoning as
    // InteractionOpenAndSelect below).
    await waitFor(() => expect(trigger.closest('[aria-hidden="true"]')).toBeNull());
  },
};

/**
 * `description` renders a secondary line below the label (Figma's "Menu
 * Item" `supportText` property) — available on `DropdownMenuItem`,
 * `DropdownMenuCheckboxItem`, and `DropdownMenuRadioItem` identically.
 */
export const WithDescription: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem description="Removes this account permanently" destructive>
          Delete account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem checked description="Adds a byte-order mark to the file">
          UTF-8 BOM
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="newest">
          <DropdownMenuRadioItem value="newest" description="Sorts by creation date, newest first">
            Newest
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

/** With enough items, `DropdownMenuContent` caps its height and scrolls instead of overflowing the viewport. */
export const InteractionScrollableOverflow: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open long menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Array.from({ length: 40 }, (_, i) => (
          <DropdownMenuItem key={i}>Item {i + 1}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open long menu' });
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const menu = await body.findByRole('menu');
    await waitFor(() => expect(menu).toBeVisible());

    // 40 items at min-h-[36px] each would be >1400px tall — the content
    // must not actually grow anywhere near that; it should cap well within
    // the viewport and let overflow-y-auto handle the rest.
    const rect = menu.getBoundingClientRect();
    expect(rect.height).toBeLessThan(canvasElement.ownerDocument.documentElement.clientHeight);
    expect(getComputedStyle(menu).overflowY).toBe('auto');

    // The last item must exist in the DOM (scrollable, not truncated/dropped)
    // even though it isn't currently visible in the viewport.
    expect(body.getByRole('menuitem', { name: 'Item 40' })).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger.closest('[aria-hidden="true"]')).toBeNull());
  },
};

/** Clicking the trigger opens the menu; clicking an item selects it and closes the menu. */
export const InteractionOpenAndSelect: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });

    // Menu is closed until the trigger is activated.
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const item = await body.findByRole('menuitem', { name: 'Profile' });
    await waitFor(() => expect(item).toBeVisible());

    await userEvent.click(item);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Radix un-hides background content asynchronously as the menu closes —
    // wait for that cleanup so the a11y scan doesn't catch a transient
    // moment where the (now-focused) trigger is still inside an
    // aria-hidden ancestor.
    await waitFor(() => expect(trigger.closest('[aria-hidden="true"]')).toBeNull());
  },
};

/**
 * Regression coverage (component-api-conventions.md §17): real keyboard
 * navigation — ArrowDown moves the roving highlight between items, Enter
 * activates the highlighted item — not just a mouse click flow.
 */
export const InteractionKeyboardNavigation: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });

    // Real keyboard activation (not a click) — Enter on the trigger opens
    // the menu and Radix moves focus onto the first item automatically.
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const body = within(canvasElement.ownerDocument.body);
    const profile = await body.findByRole('menuitem', { name: 'Profile' });
    await waitFor(() => expect(profile).toHaveFocus());

    // ArrowDown moves the roving highlight to the next item.
    await userEvent.keyboard('{ArrowDown}');
    const settings = body.getByRole('menuitem', { name: 'Settings' });
    await waitFor(() => expect(settings).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    const logout = body.getByRole('menuitem', { name: 'Log out' });
    await waitFor(() => expect(logout).toHaveFocus());

    // Escape closes without activating anything.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

/**
 * Regression coverage: the nested Sub/SubTrigger/SubContent flow driven
 * entirely by keyboard — ArrowRight opens the submenu, ArrowDown moves
 * within it, Enter selects a nested item and closes the whole menu tree.
 */
export const InteractionNestedSubmenuKeyboard: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>CSV</DropdownMenuItem>
            <DropdownMenuItem>JSON</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    // Keyboard-triggered open (not a click) — Radix only auto-focuses the
    // first item when the trigger is activated via keyboard; a pointer
    // click leaves focus on the menu container itself.
    trigger.focus();
    await userEvent.keyboard('{Enter}');

    const body = within(canvasElement.ownerDocument.body);
    const editItem = await body.findByRole('menuitem', { name: 'Edit' });
    await waitFor(() => expect(editItem).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    const subTrigger = body.getByRole('menuitem', { name: 'Export' });
    await waitFor(() => expect(subTrigger).toHaveFocus());

    // ArrowRight opens the submenu and moves focus inside it.
    await userEvent.keyboard('{ArrowRight}');
    const csvItem = await body.findByRole('menuitem', { name: 'CSV' });
    await waitFor(() => expect(csvItem).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    const jsonItem = body.getByRole('menuitem', { name: 'JSON' });
    await waitFor(() => expect(jsonItem).toHaveFocus());

    // Enter selects the nested item and closes the entire menu tree.
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));

    // Radix's exit animation + focus-guard cleanup happens asynchronously
    // — wait for it so the a11y scan doesn't catch a transient mid-close
    // frame (same reasoning as InteractionOpenAndSelect above).
    await waitFor(() => expect(trigger.closest('[aria-hidden="true"]')).toBeNull());
  },
};

/**
 * Regression coverage, rewritten 2026-09-10 after a real bug was found in
 * this story's own prior version: it only ever tested keyboard-driven focus
 * (`Enter`/`ArrowDown`), which never exercises Radix's `.focus()`-on-hover
 * behavior — so it never caught that a `focus-visible:outline-*` ring
 * (added 2026-09-07) painted on PLAIN MOUSE HOVER too, since Chromium's
 * `:focus-visible` heuristic treats Radix's programmatic hover-triggered
 * focus as keyboard-like. Confirmed via a real browser test: hovering an
 * item with `userEvent.hover()` alone (no Tab, no keys) made
 * `element.matches(':focus-visible')` true and painted the ring — which
 * does not match Figma (no border/outline in any Menu Item state, only a
 * background-color change for Hover). The ring was removed entirely (see
 * DropdownMenu.styles.ts's file-level comment); this story now asserts BOTH
 * that mouse hover shows ONLY the background highlight (no ring) AND that
 * real keyboard navigation still shows the same background highlight
 * (still a WCAG 2.4.7-compliant visible indicator, just not a ring).
 *
 * Leaves the menu OPEN at the end (unlike every story above) so
 * `.storybook/preview.ts`'s automatic axe scan (`a11y.test: 'error'`)
 * actually scans the open menu content — per component-api-conventions.md
 * §17 item 6.
 *
 * `aria-hidden-focus` is disabled for this story only: with the menu open,
 * Radix's own internal focus-trap implementation renders a
 * `data-radix-focus-guard` `<span tabindex="0" aria-hidden="true">` at the
 * document boundary (a standard, deliberate technique — same one used by
 * react-focus-lock/Reach UI — to catch a stray Tab press cycling past the
 * trapped region and redirect it back inside; screen readers skip
 * aria-hidden content in their virtual cursor regardless of tabindex, so
 * this is not a real accessibility gap). axe-core's generic rule can't
 * distinguish this intentional pattern from a genuine violation. Confirmed
 * via direct inspection (2026-09-09): the only aria-hidden+focusable
 * element in the DOM when this story is left open is exactly this guard
 * span — nothing DropdownMenu-specific.
 */
export const InteractionFocusRingIntegrity: Story = {
  parameters: {
    a11y: { options: { rules: { 'aria-hidden-focus': { enabled: false } } } },
  },
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem destructive>Delete account</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Option</DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    const win = canvasElement.ownerDocument.defaultView!;
    const profile = await body.findByRole('menuitem', { name: 'Profile' });
    const destructiveItem = body.getByRole('menuitem', { name: 'Delete account' });

    // The exact bug: hovering with the MOUSE ONLY (no Tab, no keys) must
    // NOT paint a ring — Figma has no border/outline for Hover, only a
    // background-color change.
    await userEvent.hover(profile);
    await waitFor(() => expect(profile).toHaveFocus());
    // `transition-[background-color,color]` means the background animates
    // in over ~150ms — poll until it settles rather than reading immediately
    // (same timing-artifact class as the Checkbox/DatePickerButton flash
    // bugs elsewhere in this codebase; reading at t=0 would still show the
    // pre-focus transparent value even though the CSS is correct).
    await waitFor(() =>
      expect(win.getComputedStyle(profile).backgroundColor).not.toBe('rgba(0, 0, 0, 0)'),
    );
    const hoverCs = win.getComputedStyle(profile);
    await expect(hoverCs.outlineStyle).toBe('none');

    await userEvent.hover(destructiveItem);
    await waitFor(() => expect(destructiveItem).toHaveFocus());
    const destructiveHoverCs = win.getComputedStyle(destructiveItem);
    await expect(destructiveHoverCs.outlineStyle).toBe('none');

    // Real keyboard navigation must still show a visible indicator — the
    // shared background highlight (`focus:bg-sds-surface-subtle-hover`), which
    // fires on any DOM focus regardless of the `:focus-visible` heuristic.
    // Escape closes and returns focus to the trigger automatically (Radix's
    // own behavior) — no need to manually refocus the trigger first while
    // the menu's focus trap is still active.
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveAttribute('aria-expanded', 'false'));
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    const keyboardProfile = await body.findByRole('menuitem', { name: 'Profile' });
    await waitFor(() => expect(keyboardProfile).toHaveFocus());
    await waitFor(() =>
      expect(win.getComputedStyle(keyboardProfile).backgroundColor).not.toBe('rgba(0, 0, 0, 0)'),
    );
    const keyboardCs = win.getComputedStyle(keyboardProfile);
    await expect(keyboardCs.outlineStyle).toBe('none');

    // Deliberately does not close the menu — see file-level comment above.
  },
};

// Regression coverage for a previously-zero-coverage gap: DropdownMenu had
// no `.test.tsx` unit test file at all. A dedicated unit test file was
// attempted, but every `forwardRef` export (Content/Item/CheckboxItem/
// RadioItem/SubTrigger/Separator/Label) only mounts once the menu is open,
// and opening a Radix DropdownMenu throws
// `TypeError: Cannot read properties of null (reading 'useMemo')` under this
// repo's `unit` Vitest project specifically (confirmed via a minimal
// reproduction: a closed/unopened `<DropdownMenu>` renders fine, only
// opening it fails) — the same environment-specific popover-opening
// limitation already documented in `DatePicker.test.tsx`'s file header. This
// story exercises the same forwardRef pattern here instead, using module-
// scoped callback refs (not object refs, so the captured node is visible to
// `play()` without needing React state plumbing) to prove each part's `ref`
// genuinely reaches its real DOM node — not just that it renders.
let refForwardingCapturedContent: HTMLDivElement | null = null;
let refForwardingCapturedItem: HTMLDivElement | null = null;
let refForwardingCapturedCheckboxItem: HTMLDivElement | null = null;
let refForwardingCapturedRadioItem: HTMLDivElement | null = null;
let refForwardingCapturedSubTrigger: HTMLDivElement | null = null;
let refForwardingCapturedSeparator: HTMLDivElement | null = null;
let refForwardingCapturedLabel: HTMLDivElement | null = null;

/** Every `forwardRef` export's `ref` reaches its real DOM node — not just that it renders. */
export const InteractionRefForwarding: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
        Open menu
      </DropdownMenuTrigger>
      <DropdownMenuContent
        ref={(node) => {
          refForwardingCapturedContent = node;
        }}
      >
        <DropdownMenuLabel
          ref={(node) => {
            refForwardingCapturedLabel = node;
          }}
        >
          My account
        </DropdownMenuLabel>
        <DropdownMenuSeparator
          ref={(node) => {
            refForwardingCapturedSeparator = node;
          }}
          data-testid="ref-forwarding-separator"
        />
        <DropdownMenuItem
          ref={(node) => {
            refForwardingCapturedItem = node;
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuCheckboxItem
          ref={(node) => {
            refForwardingCapturedCheckboxItem = node;
          }}
          checked
        >
          Show hidden files
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="a">
          <DropdownMenuRadioItem
            ref={(node) => {
              refForwardingCapturedRadioItem = node;
            }}
            value="a"
          >
            Option A
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            ref={(node) => {
              refForwardingCapturedSubTrigger = node;
            }}
          >
            Export
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>CSV</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    await userEvent.click(trigger);

    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(body.getByRole('menu')).toBeInTheDocument());

    expect(refForwardingCapturedContent).toBe(body.getByRole('menu'));
    expect(refForwardingCapturedLabel).toBe(body.getByText('My account'));
    expect(refForwardingCapturedSeparator).toBe(body.getByTestId('ref-forwarding-separator'));
    expect(refForwardingCapturedItem).toBe(body.getByRole('menuitem', { name: 'Edit' }));
    expect(refForwardingCapturedCheckboxItem).toBe(
      body.getByRole('menuitemcheckbox', { name: 'Show hidden files' }),
    );
    expect(refForwardingCapturedRadioItem).toBe(
      body.getByRole('menuitemradio', { name: 'Option A' }),
    );
    expect(refForwardingCapturedSubTrigger).toBe(body.getByRole('menuitem', { name: 'Export' }));

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger.closest('[aria-hidden="true"]')).toBeNull());
  },
};

// `DropdownMenuSubContent` has no `container` prop of its own — Radix mounts
// nested submenu content inside the root Content's already-portalled tree,
// so redirecting the root `DropdownMenuContent` is sufficient; there is
// nothing separate to redirect for a submenu.
/** `container` redirects `DropdownMenuContent`'s portal target away from `document.body`. */
export const InteractionPortalContainerRedirect: Story = {
  render: () => {
    // A plain `useRef` would read `.current` as null during this same
    // initial render pass (refs attach after commit, and nothing schedules
    // a re-render just because a ref value changed) — so `container` would
    // silently pin to `undefined` forever. A state-backed callback ref
    // forces the required second render once the node actually exists in
    // the DOM (same pattern as ThemeProvider.stories.tsx's `ScopedRegion`).
    function Demo() {
      const [containerNode, setContainerNode] = useState<HTMLDivElement | null>(null);
      return (
        <div>
          <div ref={setContainerNode} data-testid="custom-portal-target" />
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-sds-200 border border-sds-border-basic px-sds-200 py-sds-100 typo-body-m">
              Open menu
            </DropdownMenuTrigger>
            <DropdownMenuContent container={containerNode ?? undefined}>
              <DropdownMenuItem>Redirected item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open menu' });
    await userEvent.click(trigger);

    const portalTarget = canvas.getByTestId('custom-portal-target');
    await waitFor(() => expect(portalTarget).toHaveTextContent('Redirected item'));

    // The content must NOT have portalled to document.body directly (it
    // should be a descendant of the redirected container instead).
    const directBodyChildren = Array.from(canvasElement.ownerDocument.body.children);
    const menu = within(canvasElement.ownerDocument.body).getByRole('menu');
    expect(directBodyChildren).not.toContain(menu);
    expect(portalTarget.contains(menu)).toBe(true);

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(trigger.closest('[aria-hidden="true"]')).toBeNull());
  },
};
