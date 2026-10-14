import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { StatusIcon } from './StatusIcon';

const meta = {
  title: 'Components/StatusIcon',
  component: StatusIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A fixed icon+color pairing that conveys the type of information or the result of a process — use this instead of a raw `Icon/*` whenever the meaning is one of info/success/caution/danger/loading, so the pairing stays consistent everywhere. Figma's own documentation page for this component is unfinished (\"執筆中\") — see the component's own JSDoc / docs/components/statusIcon.md for what is and isn't confirmed.",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      description: 'Which fixed icon+color combination to show',
      control: 'select',
      options: ['info', 'success', 'caution', 'danger', 'loading'],
      table: {
        type: { summary: "'info' | 'success' | 'caution' | 'danger' | 'loading'" },
      },
    },
    inverse: {
      description: 'Inverts the color for placement on dark surfaces',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    className: {
      description: 'Additional CSS classes to apply',
      control: 'text',
      table: { type: { summary: 'string' } },
    },
  },
} satisfies Meta<typeof StatusIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default `info` status icon. */
export const Default: Story = {
  args: { status: 'info' },
};

/** `status="info"` — informational messages, guides, hints. */
export const Info: Story = {
  args: { status: 'info' },
};

/** `status="success"` — a process completed successfully. */
export const Success: Story = {
  args: { status: 'success' },
};

/** `status="caution"` — a warning that doesn't block the user. */
export const Caution: Story = {
  args: { status: 'caution' },
};

/** `status="danger"` — an error or fatal failure. */
export const Danger: Story = {
  args: { status: 'danger' },
};

/**
 * `status="loading"` composes `Spinner` internally — provisional per
 * Figma's own unfinished documentation for this component (may be removed
 * once `Alert` is designed; see Known Limitations in the docs spec).
 */
export const Loading: Story = {
  args: { status: 'loading' },
};

/** Every status side by side. */
export const AllStatuses: Story = {
  args: { status: 'info' },
  render: () => (
    <div className="flex gap-4">
      <StatusIcon status="info" />
      <StatusIcon status="success" />
      <StatusIcon status="caution" />
      <StatusIcon status="danger" />
      <StatusIcon status="loading" />
    </div>
  ),
};

/** `inverse` swaps every status to its light-on-dark color — use on dark surfaces or scrims. */
export const Inverse: Story = {
  args: { status: 'info', inverse: true },
  render: () => (
    <div className="flex gap-4 bg-sds-surface-primary p-4 rounded-sds-200">
      <StatusIcon status="info" inverse />
      <StatusIcon status="success" inverse />
      <StatusIcon status="caution" inverse />
      <StatusIcon status="danger" inverse />
      <StatusIcon status="loading" inverse />
    </div>
  ),
};

/**
 * Decorative by default — paired with adjacent visible text that already
 * conveys the meaning (Figma's own documented "Do" example: notifications
 * and result displays). This is the primary intended usage.
 */
export const WithAdjacentText: Story = {
  args: { status: 'success' },
  render: () => (
    <div className="flex items-center gap-2">
      <StatusIcon status="success" />
      <span className="typo-body-m text-sds-text-primary">Saved successfully</span>
    </div>
  ),
};

/** The `className` prop merges with the internal color/layout classes. */
export const CustomClassName: Story = {
  args: { status: 'info', className: 'opacity-80' },
};

/**
 * Regression coverage: decorative-by-default (`aria-hidden`, matching
 * Figma's own paired-with-text "Do" usage) — the icon itself carries no
 * accessible name unless explicitly labeled.
 */
export const InteractionDecorativeByDefault: Story = {
  args: { status: 'success' },
  render: () => <StatusIcon status="success" data-testid="status-icon" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByTestId('status-icon');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(icon).not.toHaveAttribute('role');
  },
};

/**
 * Regression coverage: when used standalone (no adjacent text), passing
 * `aria-label` drops the default `aria-hidden` and exposes the icon as a
 * labeled `role="img"` instead — never both `aria-hidden` and a label at
 * once (they're contradictory).
 */
export const InteractionAccessibleWhenLabeled: Story = {
  args: { status: 'danger', 'aria-label': 'Error' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvas.getByRole('img', { name: 'Error' });
    expect(icon).not.toHaveAttribute('aria-hidden');
  },
};
