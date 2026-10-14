import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn, expect, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';
import { tokenColor } from '../../../.storybook/tokenColor';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A binary on/off toggle built on Radix Switch. Renders two layers: an outer, transparent 44x44-minimum tap-area wrapper (the real focusable/clickable element — Figma's own guideline requires this even though the visible track is smaller) and an inner visible track holding the sliding thumb. `className` targets the outer wrapper; use `classNames.track`/`classNames.thumb` to customize the visible parts.",
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['medium', 'large'],
      description: 'Size of the switch',
      table: {
        type: { summary: 'SwitchSize' },
        defaultValue: { summary: 'medium' },
      },
    },
    checked: {
      control: 'boolean',
      description: 'Controlled checked state',
      table: {
        type: { summary: 'boolean' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onCheckedChange: {
      action: 'checked changed',
      description: 'Callback when checked state changes',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Switch>;

/**
 * Default medium size switch (uncontrolled)
 */
export const Medium: Story = {
  args: {
    size: 'medium',
    'aria-label': 'Medium switch',
  },
};

/**
 * Large size switch
 */
export const Large: Story = {
  args: {
    size: 'large',
    'aria-label': 'Large switch',
  },
};

/**
 * Controlled switch example with state management
 */
export const Controlled: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
        <Switch {...args} checked={checked} onCheckedChange={setChecked} />
        <p className="text-sds-text-secondary" style={{ fontSize: '14px' }}>
          Switch is {checked ? 'ON' : 'OFF'}
        </p>
      </div>
    );
  },
  args: {
    size: 'medium',
    'aria-label': 'Toggle setting',
  },
};

/**
 * Disabled switch in unchecked state
 */
export const DisabledUnchecked: Story = {
  args: {
    size: 'medium',
    disabled: true,
    checked: false,
    'aria-label': 'Disabled switch (unchecked)',
  },
};

/**
 * Disabled switch in checked state
 */
export const DisabledChecked: Story = {
  args: {
    size: 'medium',
    disabled: true,
    checked: true,
    'aria-label': 'Disabled switch (checked)',
  },
};

/**
 * All size and state combinations
 */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Medium Size */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Medium</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '140px', fontSize: '14px' }}>Inactive - Enabled:</span>
            <Switch size="medium" checked={false} aria-label="Medium, inactive, enabled" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '140px', fontSize: '14px' }}>Inactive - Disabled:</span>
            <Switch
              size="medium"
              checked={false}
              disabled
              aria-label="Medium, inactive, disabled"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '140px', fontSize: '14px' }}>Active - Enabled:</span>
            <Switch size="medium" checked={true} aria-label="Medium, active, enabled" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '140px', fontSize: '14px' }}>Active - Disabled:</span>
            <Switch size="medium" checked={true} disabled aria-label="Medium, active, disabled" />
          </div>
        </div>
      </div>

      {/* Large Size */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600 }}>Large</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '140px', fontSize: '14px' }}>Inactive - Enabled:</span>
            <Switch size="large" checked={false} aria-label="Large, inactive, enabled" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '140px', fontSize: '14px' }}>Inactive - Disabled:</span>
            <Switch size="large" checked={false} disabled aria-label="Large, inactive, disabled" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '140px', fontSize: '14px' }}>Active - Enabled:</span>
            <Switch size="large" checked={true} aria-label="Large, active, enabled" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '140px', fontSize: '14px' }}>Active - Disabled:</span>
            <Switch size="large" checked={true} disabled aria-label="Large, active, disabled" />
          </div>
        </div>
      </div>
    </div>
  ),
};

/**
 * Switch with label in a form-like layout
 */
export const WithLabel: Story = {
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
        }}
      >
        <Switch {...args} id="with-label-switch" checked={checked} onCheckedChange={setChecked} />
        <label htmlFor="with-label-switch" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Enable notifications
        </label>
      </div>
    );
  },
  args: {
    size: 'medium',
  },
};

/**
 * Multiple switches in a settings panel
 */
export const SettingsPanel: Story = {
  render: () => {
    const [settings, setSettings] = useState({
      notifications: true,
      emailAlerts: false,
      darkMode: true,
      autoSave: false,
    });

    return (
      <div
        className="border border-sds-border-weak bg-sds-background-container"
        style={{
          width: '320px',
          padding: '20px',
          borderRadius: '8px',
        }}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>Settings</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }} id="notifications-label">
              Notifications
            </span>
            <Switch
              aria-labelledby="notifications-label"
              checked={settings.notifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, notifications: checked }))
              }
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }} id="email-alerts-label">
              Email Alerts
            </span>
            <Switch
              aria-labelledby="email-alerts-label"
              checked={settings.emailAlerts}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, emailAlerts: checked }))
              }
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }} id="dark-mode-label">
              Dark Mode
            </span>
            <Switch
              size="large"
              aria-labelledby="dark-mode-label"
              checked={settings.darkMode}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, darkMode: checked }))}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px' }} id="auto-save-label">
              Auto Save
            </span>
            <Switch
              size="large"
              aria-labelledby="auto-save-label"
              checked={settings.autoSave}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoSave: checked }))}
            />
          </div>
        </div>
      </div>
    );
  },
};

/**
 * The `classNames` slot API reaching the track and thumb parts individually —
 * the root `className` targets only the outer 44x44 tap-area wrapper.
 */
export const CustomClassNames: Story = {
  args: {
    'aria-label': 'Custom-styled switch',
    checked: true,
    classNames: {
      track: 'ring-2 ring-offset-2 ring-sds-icon-warning',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `classNames` prop, which targets the track and thumb independently — the root `className` only reaches the outer tap-area wrapper.',
      },
    },
  },
};

/** Clicking or pressing Enter/Space toggles the switch and fires `onCheckedChange`. */
export const InteractionToggle: Story = {
  args: {
    'aria-label': 'Enable notifications',
    onCheckedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Enable notifications' });

    expect(toggle).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(toggle);
    expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    await userEvent.keyboard('{Enter}');
    expect(args.onCheckedChange).toHaveBeenCalledWith(false);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
  },
};

/** A disabled switch cannot be toggled by click, and fires no `onCheckedChange`. */
export const InteractionDisabledBlocksToggle: Story = {
  args: {
    'aria-label': 'Enable notifications',
    disabled: true,
    onCheckedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Enable notifications' });

    expect(toggle).toBeDisabled();

    await userEvent.click(toggle, { pointerEventsCheck: 0 });
    expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

/**
 * Regression coverage for §17 (component-api-conventions.md): Switch's own
 * missing focus ring was the ORIGINAL motivating bug for
 * `.claude/rules/design-foundation.md` §5.1's "every interactive element
 * has a visible focus ring" rule, and `Switch.styles.ts` is cited as the
 * REFERENCE explanation for the correct gated
 * `disabled:focus-visible:outline-none` pattern elsewhere in this codebase
 * — yet, until now, nothing here actually asserted the fix with a real
 * keyboard `Tab` + `getComputedStyle()`. Verifies the ring renders with the
 * real `border-focus` token color, and that a disabled switch suppresses
 * it (both are asserted, not just documented).
 */
export const InteractionFocusRing: Story = {
  args: {
    'aria-label': 'Enable notifications',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Enable notifications' });

    await userEvent.tab();
    expect(canvasElement.ownerDocument.activeElement).toBe(toggle);
    expect(toggle.matches(':focus-visible')).toBe(true);

    // Figma draws the ring around the visible track (a pill), not the
    // transparent 44x44 tap area — the ring lives on the track, driven by the
    // focused root (Switch.styles.ts, 2026-10-07).
    const track = toggle.firstElementChild as HTMLElement;
    const cs = getComputedStyle(track);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineOffset).toBe('2px');
    expect(getComputedStyle(toggle).outlineStyle).toBe('none');
  },
};

/**
 * A disabled switch must suppress the focus ring entirely (design-
 * foundation.md §5.3 — "Disabled suppresses every other state"), verified
 * via the same gated `disabled:focus-visible:outline-none` mentioned above.
 */
export const InteractionDisabledSuppressesFocusRing: Story = {
  args: {
    'aria-label': 'Enable notifications',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('switch', { name: 'Enable notifications' });

    await userEvent.tab();
    // A disabled native <button> is never focusable at all, so Tab moves
    // past it entirely — activeElement must not be the switch.
    expect(canvasElement.ownerDocument.activeElement).not.toBe(toggle);
  },
};

/**
 * Regression coverage for the 2026-09-07 Figma-fidelity audit: Figma's own
 * guideline ("タップ領域") requires a minimum 44x44px tap area separate from
 * the visible track size — accessibility.md §6.1 requires the same for
 * touch devices. Confirms the outer button (the real focusable/clickable
 * element) meets that minimum while the visible track keeps its exact
 * pre-existing size/color.
 */
export const InteractionPixelDimensionsMatchFigma: Story = {
  args: {
    'aria-label': 'toggle',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('switch', { name: 'toggle' });
    const track = button.firstElementChild as HTMLElement;
    const thumb = track.firstElementChild as HTMLElement;

    const buttonRect = button.getBoundingClientRect();
    expect(buttonRect.width).toBeGreaterThanOrEqual(44);
    expect(buttonRect.height).toBeGreaterThanOrEqual(44);

    const trackRect = track.getBoundingClientRect();
    expect(trackRect.width).toBeCloseTo(40, 0);
    expect(trackRect.height).toBeCloseTo(24, 0);
    expect(getComputedStyle(track).backgroundColor).toBe(
      tokenColor(track, '--color-sds-surface-secondary'),
    );

    const thumbRect = thumb.getBoundingClientRect();
    expect(thumbRect.width).toBeCloseTo(20, 0);
    expect(thumbRect.height).toBeCloseTo(20, 0);
  },
};
