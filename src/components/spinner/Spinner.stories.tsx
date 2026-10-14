import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A rotating indeterminate loading indicator — shown while a process is running but its remaining time/progress is unknown. Use a progress bar instead when the remaining time CAN be measured (e.g. a file upload with a known size), and never show both for the same process at once.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Size of the spinner',
      control: 'select',
      options: ['small', 'medium', 'large'],
      table: {
        type: { summary: "'small' | 'medium' | 'large'" },
        defaultValue: { summary: "'small'" },
      },
    },
    inverse: {
      description: 'Inverts the track/arc colors for placement on dark surfaces or overlays',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      description:
        'Accessible text announced to assistive technology while mounted — visually hidden',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'Loading'" },
      },
    },
    className: {
      description: 'Additional CSS classes to apply',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default small spinner. */
export const Default: Story = {
  args: {},
};

/** `size="small"` — 16px, 1.5px track/arc. For embedding inside other elements (Button, Text Field). */
export const Small: Story = {
  args: { size: 'small' },
};

/** `size="medium"` — 24px, 2px track/arc. For card- or section-level loading. */
export const Medium: Story = {
  args: { size: 'medium' },
};

/** `size="large"` — 40px, 3px track/arc. For full-page or modal-level loading. */
export const Large: Story = {
  args: { size: 'large' },
  parameters: { backgrounds: { default: 'light' } },
};

/** `inverse` swaps the track/arc to light-on-dark colors — use on dark surfaces or scrims. */
export const Inverse: Story = {
  args: { size: 'large', inverse: true },
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <div className="bg-sds-surface-primary p-sds-200 rounded-sds-200">
        <Story />
      </div>
    ),
  ],
};

/** Inline with adjacent status text — the spinner itself has no built-in text slot; pair it with a sibling element. */
export const WithInlineText: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Spinner size="small" />
      <span className="typo-body-m text-sds-text-primary">保存しています</span>
    </div>
  ),
};

/** Composed as an overlay over existing content (e.g. a card mid-refresh) — built entirely from composition, not a prop on Spinner itself. */
export const CardOverlay: Story = {
  render: () => (
    <div className="relative w-[240px] h-[140px] bg-sds-surface-base border border-sds-border-basic rounded-sds-200 flex items-center justify-center shadow-sds-level-1">
      <div className="absolute inset-0 flex items-center justify-center bg-sds-background-scrim rounded-sds-200">
        <Spinner inverse size="large" />
      </div>
    </div>
  ),
};

/** Composed inside a disabled `Button` for a submitting state — Button itself has no dedicated `loading` prop; this is achieved purely via composition. */
export const InButton: Story = {
  render: () => (
    <button
      disabled
      className="bg-sds-surface-primary text-sds-text-on-surface rounded-sds-200 px-sds-200 py-sds-100 flex items-center gap-2 cursor-not-allowed"
    >
      <Spinner inverse size="small" />
      送信中
    </button>
  ),
};

/** The `className` prop merges with the internal variant classes. */
export const CustomClassName: Story = {
  args: { className: 'opacity-80' },
};

/**
 * Regression coverage: the spinner is purely visual (`aria-hidden` on the
 * svg) — the accessible name for assistive technology comes entirely from
 * the visually-hidden text inside the `role="status"` live region, not
 * from color/motion alone (Figma's own accessibility guidance, matching
 * `.claude/rules/accessibility.md` §4.3 / §2.2).
 */
export const InteractionHasAccessibleStatusText: Story = {
  args: { label: '読み込んでいます' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole('status');
    expect(status).toHaveTextContent('読み込んでいます');
  },
};

/** When `label` is omitted, a sensible default ("Loading") is still announced — never silently unlabeled. */
export const InteractionDefaultLabel: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('status')).toHaveTextContent('Loading');
  },
};
