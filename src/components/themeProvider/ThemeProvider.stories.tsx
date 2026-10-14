import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { Button } from '../button';
import { Modal, ModalContent, ModalTitle, ModalTrigger } from '../modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdownMenu';

const meta: Meta<typeof ThemeProvider> = {
  title: 'Foundation/ThemeProvider',
  component: ThemeProvider,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Wraps an app (or a scoped region) to manage the `light`/`dark`/`system` theme mode, writing `data-theme` and persisting the preference. `useTheme()` reads the current mode/resolved theme. `scoped` creates an independent theme region on a wrapper `<div>` instead of `document.documentElement` (never persists); `unmanaged` tracks the resolved theme for `useTheme()` without writing `data-theme` itself, for a consumer whose own shell already manages it.',
      },
    },
  },
  // Every story below drives ThemeProvider via a custom `render` rather than
  // Storybook `args` (its most interesting behavior — controlled/uncontrolled,
  // scoped regions, portals — isn't expressible as flat args), so this table
  // is for API documentation in the autodocs panel only; it does not drive a
  // live controls-panel re-render.
  argTypes: {
    defaultMode: {
      description: 'Uncontrolled default mode, used only on first mount',
      control: false,
      table: {
        type: { summary: "'light' | 'dark' | 'system'" },
        defaultValue: { summary: "'system'" },
      },
    },
    mode: {
      description: 'Controlled mode — omit this prop entirely for uncontrolled behavior',
      control: false,
      table: {
        type: { summary: "'light' | 'dark' | 'system'" },
      },
    },
    onModeChange: {
      description: 'Fires whenever the mode changes, controlled or uncontrolled',
      control: false,
      table: {
        type: { summary: '(mode: ThemeMode) => void' },
      },
    },
    storageKey: {
      description: 'Storage key for the persisted uncontrolled preference',
      control: false,
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'sun-theme'" },
      },
    },
    storage: {
      description:
        'Persistence implementation. Defaults to a safe localStorage wrapper. Pass null to disable persistence',
      control: false,
      table: {
        type: { summary: 'ThemeStorage | null' },
      },
    },
    disableTransitionOnChange: {
      description: 'Disable the transition-suppression behavior on a mode change',
      control: false,
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    unmanaged: {
      description:
        'Tracks the resolved theme for useTheme() but never writes the data-theme attribute itself',
      control: false,
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    scoped: {
      description:
        'Applies data-theme to a wrapper <div> instead of document.documentElement, creating an independent theme region. Never persists',
      control: false,
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    className: {
      description: 'Applied to the wrapper element. Only meaningful when scoped is true',
      control: false,
      table: {
        type: { summary: 'string' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ThemeProvider>;

function ThemeControls() {
  const { mode, resolvedTheme, setMode } = useTheme();
  return (
    <div className="flex flex-col items-start gap-2">
      <p>
        mode: <span data-testid="mode">{mode}</span> — resolved:{' '}
        <span data-testid="resolved">{resolvedTheme}</span>
      </p>
      <div className="flex gap-2">
        <Button size="small" onClick={() => setMode('light')}>
          Light
        </Button>
        <Button size="small" onClick={() => setMode('dark')}>
          Dark
        </Button>
        <Button size="small" onClick={() => setMode('system')}>
          System
        </Button>
      </div>
      <Button variant="primary" data-testid="sample-button">
        Sample Button
      </Button>
    </div>
  );
}

/** Uncontrolled, root-scoped, `defaultMode="light"` — the common case. */
export const Default: Story = {
  render: () => (
    <ThemeProvider defaultMode="light">
      <ThemeControls />
    </ThemeProvider>
  ),
};

/** `defaultMode="system"` resolves from and stays live-synced to the OS-level `prefers-color-scheme`. */
export const SystemMode: Story = {
  render: () => (
    <ThemeProvider defaultMode="system">
      <ThemeControls />
    </ThemeProvider>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the Theme toolbar (top toolbar, "Theme" dropdown) to switch the Storybook preview between light/dark/system and confirm this story follows it.',
      },
    },
  },
};

/** Fully controlled via `mode`/`onModeChange` — the provider itself holds no mode state. */
export const Controlled: Story = {
  render: () => {
    function Harness() {
      const [mode, setMode] = useState<'light' | 'dark' | 'system'>('light');
      return (
        <ThemeProvider mode={mode} onModeChange={setMode}>
          <ThemeControls />
        </ThemeProvider>
      );
    }
    return <Harness />;
  },
};

/**
 * The single most important test in this file: a REAL rendered light↔dark
 * round-trip via getComputedStyle, reusing Phase 10's proven method
 * — not token
 * inspection, not a class-string assertion.
 */
export const InteractionRuntimeSwitching: Story = {
  render: () => (
    <ThemeProvider defaultMode="light">
      <ThemeControls />
    </ThemeProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByTestId('sample-button');

    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    const lightColor = getComputedStyle(button).backgroundColor;

    await userEvent.click(canvas.getByText('Dark'));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'dark'));
    const darkColor = getComputedStyle(button).backgroundColor;

    // The two resolved colors must genuinely differ — this is what a
    // token-parity check alone (Phase 9) cannot prove.
    expect(darkColor).not.toBe(lightColor);

    await userEvent.click(canvas.getByText('Light'));
    await waitFor(() => expect(document.documentElement).toHaveAttribute('data-theme', 'light'));
    const backToLightColor = getComputedStyle(button).backgroundColor;
    expect(backToLightColor).toBe(lightColor);
  },
};

/** A nested, un-scoped `<ThemeProvider>` is an inert passthrough sharing its ancestor's context — it must not create a second DOM-writing effect. */
export const InteractionNestedPassthrough: Story = {
  name: 'Nested (inert passthrough)',
  render: () => (
    <ThemeProvider defaultMode="dark">
      <ThemeProvider>
        <ThemeControls />
      </ThemeProvider>
    </ThemeProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId('resolved')).toHaveTextContent('dark'));
  },
};

/**
 * An independent theme region forced to light mode regardless of the host
 * page's own theme. Demonstrates the `container` redirect every
 * Radix-portalled component now supports (Modal gained this in Phase 13B
 * specifically to close this gap).
 */
export const InteractionScopedRegion: Story = {
  name: 'Scoped theme region',
  render: () => {
    function ScopedWithPortals() {
      // A plain useRef here would read `.current` as null during this same
      // initial render pass (refs attach after commit, and nothing
      // schedules a re-render just because a ref value changed) — so the
      // container prop would silently pin to `undefined` forever. A
      // state-backed callback ref forces the required second render once
      // the node actually exists in the DOM.
      const [scopeNode, setScopeNode] = useState<HTMLDivElement | null>(null);
      return (
        <ThemeProvider
          scoped
          mode="light"
          ref={setScopeNode}
          // A scoped region switches tokens but paints no background of its
          // own — without one, a light region inside a dark page shows its
          // light text on the page's dark background (found by the
          // storybook-dark pass, 2026-10-05; documented in theme-provider.md).
          className="rounded-sds-200 border border-sds-border-weak bg-sds-background-base p-4"
        >
          <p className="typo-body-s text-sds-text-secondary mb-2">
            This region is pinned to light mode via a scoped ThemeProvider.
          </p>
          <div className="flex gap-2">
            <Modal>
              <ModalTrigger asChild>
                <Button size="small">Open Modal</Button>
              </ModalTrigger>
              <ModalContent container={scopeNode ?? undefined}>
                <ModalTitle>Scoped Modal</ModalTitle>
                <p data-testid="modal-body">Portal content redirected into the scoped region.</p>
              </ModalContent>
            </Modal>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="small">Open Menu</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent container={scopeNode ?? undefined}>
                <DropdownMenuItem data-testid="menu-item">Item</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </ThemeProvider>
      );
    }
    return <ScopedWithPortals />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Open Modal'));
    const modalBody = await within(document.body).findByTestId('modal-body');
    // The portalled content's closest data-theme ancestor must be the
    // scoped wrapper, not documentElement — proving the container redirect
    // actually worked, not just that the CSS class looks right.
    expect(modalBody.closest('[data-theme]')).toHaveAttribute('data-theme', 'light');
    expect(modalBody.closest('[data-theme]')).not.toBe(document.documentElement);
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByText('Open Menu'));
    const menuItem = await within(document.body).findByTestId('menu-item');
    expect(menuItem.closest('[data-theme]')).toHaveAttribute('data-theme', 'light');
    expect(menuItem.closest('[data-theme]')).not.toBe(document.documentElement);
    await userEvent.keyboard('{Escape}');

    // Radix un-hides background content asynchronously as the menu closes —
    // wait for that cleanup so the a11y scan doesn't catch a transient
    // moment where the trigger is still inside an aria-hidden ancestor (see
    // the identical pattern in DropdownMenu.stories.tsx).
    const menuTrigger = canvas.getByText('Open Menu');
    await waitFor(() => expect(menuTrigger.closest('[aria-hidden="true"]')).toBeNull());
  },
};

/** `unmanaged` tracks the resolved theme for `useTheme()` but never writes `data-theme` itself. */
export const InteractionUnmanaged: Story = {
  name: 'Unmanaged',
  render: () => (
    <ThemeProvider unmanaged mode="dark">
      <ThemeControls />
    </ThemeProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByTestId('resolved')).toHaveTextContent('dark'));
    // unmanaged: useTheme() reports dark, but ThemeProvider itself never
    // touches the attribute — the Storybook toolbar decorator's own value
    // (whatever the preview is currently set to) remains untouched by this
    // story specifically.
  },
};
