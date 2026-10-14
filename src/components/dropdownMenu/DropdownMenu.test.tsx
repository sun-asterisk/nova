import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'storybook/test';
import { createRef, type ReactNode } from 'react';
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
import { dropdownMenuStyles } from './DropdownMenu.styles';

// Regression coverage for a previously-zero-coverage gap: DropdownMenu had
// no `.test.tsx` at all (only Storybook stories/play tests). Accessibility
// semantics, keyboard handling and focus management come from Radix's
// DropdownMenu primitive — these tests verify Sun's wrappers wire that
// primitive up correctly (roles reach the DOM, refs/className/props are
// forwarded, Sun's own defaults and branches behave as documented), not
// Radix's internals.
//
// Visual focus-ring behavior (the 2026-09-10 hover-ring regression, see
// DropdownMenu.styles.ts) is verified with real `getComputedStyle()` in
// DropdownMenu.stories.tsx's `InteractionFocusRingIntegrity` — this "unit"
// project renders without the compiled Tailwind stylesheet (same reasoning
// as Modal.test.tsx/Badge.test.tsx), so here only the static class contract
// in `dropdownMenuStyles` is asserted.

function BasicMenu({ children, defaultOpen }: { children?: ReactNode; defaultOpen?: boolean }) {
  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        <button>Options</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {children ?? (
          <>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe('DropdownMenu', () => {
  describe('semantics & opening', () => {
    it('renders a closed trigger with menu popup semantics and no menu in the DOM', () => {
      render(<BasicMenu />);
      const trigger = screen.getByRole('button', { name: 'Options' });
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens on trigger click, exposing role="menu" with role="menuitem" children', async () => {
      render(<BasicMenu />);
      const trigger = screen.getByRole('button', { name: 'Options' });
      await userEvent.click(trigger);

      const menu = screen.getByRole('menu');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(trigger).toHaveAttribute('aria-controls', menu.id);
      expect(screen.getAllByRole('menuitem').map((el) => el.textContent)).toEqual([
        'Edit',
        'Duplicate',
        'Archive',
      ]);
    });

    it('portals content to document.body by default (outside the render container)', () => {
      const { container } = render(<BasicMenu defaultOpen />);
      const menu = screen.getByRole('menu');
      expect(container.contains(menu)).toBe(false);
      expect(document.body.contains(menu)).toBe(true);
    });

    it('portals content into a custom `container` when provided', () => {
      const portalTarget = document.createElement('div');
      document.body.appendChild(portalTarget);
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger asChild>
            <button>Options</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent container={portalTarget}>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(portalTarget.contains(screen.getByRole('menu'))).toBe(true);
      document.body.removeChild(portalTarget);
    });

    it('applies the default 4px sideOffset between trigger and content', async () => {
      render(<BasicMenu />);
      const trigger = screen.getByRole('button', { name: 'Options' });
      await userEvent.click(trigger);
      const menu = screen.getByRole('menu');
      // Radix positions via floating-ui on the next animation frame(s).
      await vi.waitFor(() => {
        const gap = menu.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom;
        expect(Math.round(gap)).toBe(4);
      });
    });

    it('lets a consumer override sideOffset', async () => {
      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button>Options</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={20}>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      const trigger = screen.getByRole('button', { name: 'Options' });
      await userEvent.click(trigger);
      const menu = screen.getByRole('menu');
      await vi.waitFor(() => {
        const gap = menu.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom;
        expect(Math.round(gap)).toBe(20);
      });
    });
  });

  describe('keyboard & focus', () => {
    it('Enter on the focused trigger opens the menu and focuses the first item; ArrowDown moves focus', async () => {
      render(<BasicMenu />);
      const trigger = screen.getByRole('button', { name: 'Options' });
      trigger.focus();
      await userEvent.keyboard('{Enter}');

      const items = screen.getAllByRole('menuitem');
      await vi.waitFor(() => expect(items[0]).toHaveFocus());
      await userEvent.keyboard('{ArrowDown}');
      expect(items[1]).toHaveFocus();
      await userEvent.keyboard('{ArrowDown}');
      expect(items[2]).toHaveFocus();
    });

    it('ArrowDown on the focused trigger opens the menu', async () => {
      render(<BasicMenu />);
      const trigger = screen.getByRole('button', { name: 'Options' });
      trigger.focus();
      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('menu')).toBeInTheDocument();
      await vi.waitFor(() => expect(screen.getAllByRole('menuitem')[0]).toHaveFocus());
    });

    it('Escape closes the menu and returns focus to the trigger', async () => {
      render(<BasicMenu />);
      const trigger = screen.getByRole('button', { name: 'Options' });
      trigger.focus();
      await userEvent.keyboard('{Enter}');
      await vi.waitFor(() => expect(screen.getAllByRole('menuitem')[0]).toHaveFocus());

      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await vi.waitFor(() => expect(trigger).toHaveFocus());
    });
  });

  describe('DropdownMenuItem', () => {
    it('fires onSelect on click and closes the menu', async () => {
      const onSelect = vi.fn();
      render(
        <BasicMenu>
          <DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
        </BasicMenu>,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Options' }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('fires onSelect on Enter from keyboard navigation', async () => {
      const onSelect = vi.fn();
      render(
        <BasicMenu>
          <DropdownMenuItem onSelect={onSelect}>Edit</DropdownMenuItem>
        </BasicMenu>,
      );
      screen.getByRole('button', { name: 'Options' }).focus();
      await userEvent.keyboard('{Enter}');
      await vi.waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
      await userEvent.keyboard('{Enter}');
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('a disabled item is exposed as disabled, does not fire onSelect, and is skipped by arrow keys', async () => {
      const onSelect = vi.fn();
      render(
        <BasicMenu>
          <DropdownMenuItem>First</DropdownMenuItem>
          <DropdownMenuItem disabled onSelect={onSelect}>
            Disabled
          </DropdownMenuItem>
          <DropdownMenuItem>Third</DropdownMenuItem>
        </BasicMenu>,
      );
      screen.getByRole('button', { name: 'Options' }).focus();
      await userEvent.keyboard('{Enter}');

      const disabled = screen.getByRole('menuitem', { name: 'Disabled' });
      expect(disabled).toHaveAttribute('aria-disabled', 'true');
      expect(disabled).toHaveAttribute('data-disabled');

      await vi.waitFor(() => expect(screen.getByRole('menuitem', { name: 'First' })).toHaveFocus());
      await userEvent.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Third' })).toHaveFocus();

      // Styles give data-[disabled] `pointer-events-none`, but that CSS is not
      // compiled in this project — dispatch the click directly to prove the
      // behavior guard is Radix's, not just CSS.
      disabled.click();
      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('description renders a secondary line inside a stacked label column', () => {
      render(
        <BasicMenu defaultOpen>
          <DropdownMenuItem description="Copies the link">Share</DropdownMenuItem>
        </BasicMenu>,
      );
      const item = screen.getByRole('menuitem');
      expect(item).toHaveTextContent('ShareCopies the link');
      const description = screen.getByText('Copies the link');
      // Description sits in its own element, nested in a wrapper that also
      // holds the label — not a direct sibling text node of the item.
      expect(description.tagName).toBe('SPAN');
      expect(description.parentElement).not.toBe(item);
      expect(description.parentElement?.parentElement).toBe(item);
      expect(description.parentElement).toHaveTextContent(/^ShareCopies the link$/);
    });

    it('without description, children render directly inside the item (no wrapper)', () => {
      render(
        <BasicMenu defaultOpen>
          <DropdownMenuItem>
            <span data-testid="child">Share</span>
          </DropdownMenuItem>
        </BasicMenu>,
      );
      expect(screen.getByTestId('child').parentElement).toBe(screen.getByRole('menuitem'));
    });

    it('destructive switches the item to the destructive style slot', () => {
      const styles = dropdownMenuStyles();
      render(
        <BasicMenu defaultOpen>
          <DropdownMenuItem>Normal</DropdownMenuItem>
          <DropdownMenuItem destructive>Delete</DropdownMenuItem>
        </BasicMenu>,
      );
      expect(screen.getByRole('menuitem', { name: 'Normal' })).toHaveClass('text-sds-text-primary');
      expect(screen.getByRole('menuitem', { name: 'Normal' })).not.toHaveClass(
        'text-sds-text-danger',
      );
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveClass('text-sds-text-danger');
      expect(screen.getByRole('menuitem', { name: 'Delete' }).className).toBe(
        styles.itemDestructive(),
      );
    });

    it('merges a consumer className with the default item styles', () => {
      render(
        <BasicMenu defaultOpen>
          <DropdownMenuItem className="custom-item">Edit</DropdownMenuItem>
        </BasicMenu>,
      );
      const item = screen.getByRole('menuitem');
      expect(item).toHaveClass('custom-item');
      expect(item).toHaveClass('text-sds-text-primary');
    });
  });

  describe('DropdownMenuCheckboxItem', () => {
    it('exposes menuitemcheckbox + aria-checked and fires onCheckedChange with the next value', async () => {
      const onCheckedChange = vi.fn();
      // onSelect preventDefault keeps the menu open after toggling (Radix's
      // documented pattern), so the rerendered checked state is observable.
      const keepOpen = (e: Event) => e.preventDefault();
      const { rerender } = render(
        <BasicMenu defaultOpen>
          <DropdownMenuCheckboxItem
            checked={false}
            onCheckedChange={onCheckedChange}
            onSelect={keepOpen}
          >
            Email
          </DropdownMenuCheckboxItem>
        </BasicMenu>,
      );
      const item = screen.getByRole('menuitemcheckbox', { name: 'Email' });
      expect(item).toHaveAttribute('aria-checked', 'false');
      // Indicator (Radix ItemIndicator) only mounts while checked.
      expect(item.querySelector('svg')).toBeNull();

      await userEvent.click(item);
      expect(onCheckedChange).toHaveBeenCalledWith(true);

      rerender(
        <BasicMenu defaultOpen>
          <DropdownMenuCheckboxItem checked onCheckedChange={onCheckedChange} onSelect={keepOpen}>
            Email
          </DropdownMenuCheckboxItem>
        </BasicMenu>,
      );
      const checked = screen.getByRole('menuitemcheckbox', { name: 'Email' });
      expect(checked).toHaveAttribute('aria-checked', 'true');
      expect(checked.querySelector('svg')).not.toBeNull();
    });

    it('renders description as a secondary line', () => {
      render(
        <BasicMenu defaultOpen>
          <DropdownMenuCheckboxItem checked description="Notify by mail">
            Email
          </DropdownMenuCheckboxItem>
        </BasicMenu>,
      );
      expect(screen.getByRole('menuitemcheckbox')).toHaveTextContent('EmailNotify by mail');
    });
  });

  describe('DropdownMenuRadioItem', () => {
    it('exposes menuitemradio within a group and fires onValueChange', async () => {
      const onValueChange = vi.fn();
      render(
        <BasicMenu defaultOpen>
          <DropdownMenuRadioGroup value="name" onValueChange={onValueChange}>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </BasicMenu>,
      );
      const name = screen.getByRole('menuitemradio', { name: 'Name' });
      const date = screen.getByRole('menuitemradio', { name: 'Date' });
      expect(name).toHaveAttribute('aria-checked', 'true');
      expect(date).toHaveAttribute('aria-checked', 'false');
      expect(name.querySelector('svg')).not.toBeNull();
      expect(date.querySelector('svg')).toBeNull();

      await userEvent.click(date);
      expect(onValueChange).toHaveBeenCalledWith('date');
    });
  });

  describe('Submenu', () => {
    it('SubTrigger advertises a submenu and ArrowRight opens SubContent (ref forwarded)', async () => {
      const subContentRef = createRef<HTMLDivElement>();
      render(
        <BasicMenu>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
            <DropdownMenuSubContent ref={subContentRef}>
              <DropdownMenuItem>CSV</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </BasicMenu>,
      );
      screen.getByRole('button', { name: 'Options' }).focus();
      await userEvent.keyboard('{Enter}');
      await vi.waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());
      await userEvent.keyboard('{ArrowDown}');

      const subTrigger = screen.getByRole('menuitem', { name: 'Export' });
      expect(subTrigger).toHaveFocus();
      expect(subTrigger).toHaveAttribute('aria-haspopup', 'menu');
      expect(subTrigger).toHaveAttribute('aria-expanded', 'false');
      // Sun appends a chevron icon after the children.
      expect(subTrigger.lastElementChild?.tagName.toLowerCase()).toBe('svg');

      await userEvent.keyboard('{ArrowRight}');
      expect(subTrigger).toHaveAttribute('aria-expanded', 'true');
      await vi.waitFor(() => expect(screen.getByRole('menuitem', { name: 'CSV' })).toHaveFocus());
      expect(subContentRef.current).toBeInstanceOf(HTMLDivElement);
      expect(subContentRef.current).toHaveAttribute('role', 'menu');
      expect(subContentRef.current).toContainElement(screen.getByRole('menuitem', { name: 'CSV' }));
    });
  });

  describe('static parts', () => {
    it('Separator renders role="separator" and Label renders its text', () => {
      render(
        <BasicMenu defaultOpen>
          <DropdownMenuLabel>My account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Edit</DropdownMenuItem>
        </BasicMenu>,
      );
      expect(screen.getByRole('separator')).toBeInTheDocument();
      const label = screen.getByText('My account');
      expect(label).not.toHaveAttribute('role', 'menuitem');
      expect(screen.getAllByRole('menuitem')).toHaveLength(1);
    });

    it('Shortcut renders a span with merged className and forwarded props', () => {
      render(
        <BasicMenu defaultOpen>
          <DropdownMenuItem>
            Copy
            <DropdownMenuShortcut className="custom-shortcut" data-testid="shortcut">
              ⌘C
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </BasicMenu>,
      );
      const shortcut = screen.getByTestId('shortcut');
      expect(shortcut.tagName).toBe('SPAN');
      expect(shortcut).toHaveClass('custom-shortcut', 'ml-auto');
      expect(shortcut).toHaveTextContent('⌘C');
    });
  });

  describe('ref & className forwarding', () => {
    it('forwards refs to the real DOM nodes of every forwardRef part', async () => {
      const contentRef = createRef<HTMLDivElement>();
      const itemRef = createRef<HTMLDivElement>();
      const checkboxRef = createRef<HTMLDivElement>();
      const radioRef = createRef<HTMLDivElement>();
      const subTriggerRef = createRef<HTMLDivElement>();
      const separatorRef = createRef<HTMLDivElement>();
      const labelRef = createRef<HTMLDivElement>();
      const triggerRef = createRef<HTMLButtonElement>();

      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger ref={triggerRef}>Options</DropdownMenuTrigger>
          <DropdownMenuContent ref={contentRef}>
            <DropdownMenuLabel ref={labelRef}>Label</DropdownMenuLabel>
            <DropdownMenuSeparator ref={separatorRef} />
            <DropdownMenuItem ref={itemRef}>Item</DropdownMenuItem>
            <DropdownMenuCheckboxItem ref={checkboxRef} checked>
              Check
            </DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup value="a">
              <DropdownMenuRadioItem ref={radioRef} value="a">
                Radio
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger ref={subTriggerRef}>More</DropdownMenuSubTrigger>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );

      // While the (modal) menu is open, Radix aria-hides outside content,
      // including the trigger — hence `hidden: true`.
      expect(triggerRef.current).toBe(
        screen.getByRole('button', { name: 'Options', hidden: true }),
      );
      expect(contentRef.current).toBe(screen.getAllByRole('menu')[0]);
      expect(itemRef.current).toBe(screen.getByRole('menuitem', { name: 'Item' }));
      expect(checkboxRef.current).toBe(screen.getByRole('menuitemcheckbox', { name: 'Check' }));
      expect(radioRef.current).toBe(screen.getByRole('menuitemradio', { name: 'Radio' }));
      expect(subTriggerRef.current).toBe(screen.getByRole('menuitem', { name: 'More' }));
      expect(separatorRef.current).toBe(screen.getByRole('separator'));
      expect(labelRef.current).toBe(screen.getByText('Label'));
    });

    it('merges consumer className on content, checkbox/radio items, subTrigger, separator and label', () => {
      render(
        <DropdownMenu defaultOpen>
          <DropdownMenuTrigger>Options</DropdownMenuTrigger>
          <DropdownMenuContent className="c-content">
            <DropdownMenuLabel className="c-label">Label</DropdownMenuLabel>
            <DropdownMenuSeparator className="c-sep" />
            <DropdownMenuCheckboxItem className="c-check">Check</DropdownMenuCheckboxItem>
            <DropdownMenuRadioGroup>
              <DropdownMenuRadioItem className="c-radio" value="a">
                Radio
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="c-sub">More</DropdownMenuSubTrigger>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenu>,
      );
      expect(screen.getByRole('menu')).toHaveClass('c-content', 'shadow-sds-level-2');
      expect(screen.getByText('Label')).toHaveClass('c-label');
      expect(screen.getByRole('separator')).toHaveClass('c-sep', 'bg-sds-border-weak');
      expect(screen.getByRole('menuitemcheckbox')).toHaveClass('c-check');
      expect(screen.getByRole('menuitemradio')).toHaveClass('c-radio');
      expect(screen.getByRole('menuitem', { name: 'More' })).toHaveClass('c-sub');
    });
  });

  describe('styles contract (design-foundation §5.1)', () => {
    // Static class-contract check only — the real rendered behavior (no
    // ring on pure hover, background highlight on keyboard focus) is
    // verified with getComputedStyle in the InteractionFocusRingIntegrity
    // story. This guards the source of that behavior from silently drifting.
    const styles = dropdownMenuStyles();
    const itemSlots = {
      item: styles.item(),
      itemDestructive: styles.itemDestructive(),
      checkboxItem: styles.checkboxItem(),
      radioItem: styles.radioItem(),
      subTrigger: styles.subTrigger(),
    };

    it.each(Object.entries(itemSlots))(
      '%s suppresses the native outline and carries no focus-visible ring',
      (_slot, classes) => {
        const tokens = classes.split(/\s+/);
        expect(tokens).toContain('outline-none');
        expect(tokens.some((t) => t.startsWith('focus-visible:outline'))).toBe(false);
        expect(tokens.some((t) => t.startsWith('focus:bg-'))).toBe(true);
        expect(tokens).toContain('data-[disabled]:pointer-events-none');
      },
    );
  });
});
