import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from 'storybook/test';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

const meta = {
  title: 'Components/RadioGroup/RadioGroupItem',
  component: RadioGroupItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A single option within a `RadioGroup`. Must be rendered inside a `RadioGroup` (Radix throws otherwise) — these stories each wrap it in one for that reason.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'The value of the radio item',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    variant: {
      description: 'Visual state variant of the radio item',
      control: {
        type: 'select',
      },
      options: ['default', 'error'],
      table: {
        type: { summary: "'default' | 'error'" },
        defaultValue: { summary: "'default'" },
      },
    },
    disabled: {
      description: 'Whether the radio item is disabled',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    id: {
      description: 'The id of the radio item for label association',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply to the radio item',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof RadioGroupItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Clicking an unchecked item selects it. */
export const Default: Story = {
  render: (args) => (
    <RadioGroup defaultValue="">
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem {...args} id="item1" />
        <label htmlFor="item1" className="typo-body-m text-sds-text-primary cursor-pointer">
          Radio Item
        </label>
      </div>
    </RadioGroup>
  ),
  args: {
    value: 'option1',
    variant: 'default',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole('radio');
    await expect(radio).toHaveAttribute('data-state', 'unchecked');

    await userEvent.click(radio);
    await expect(radio).toHaveAttribute('data-state', 'checked');
  },
};

// Regression coverage for the `outline-none` + bare `outline`/`outline-2`
// tailwind-merge collision (`.claude/rules/design-foundation.md` §5.1) —
// RadioGroupItem was one of the components this bug was originally found
// and fixed in, but never got a dedicated test asserting the fix via real
// keyboard `Tab` + `getComputedStyle()`.
/** Real keyboard `Tab` produces a genuine, correctly-colored focus ring — not silently suppressed. */
export const InteractionFocusRing: Story = {
  render: (args) => (
    <RadioGroup defaultValue="">
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem {...args} id="focus-item" />
        <label htmlFor="focus-item" className="typo-body-m text-sds-text-primary cursor-pointer">
          Radio Item
        </label>
      </div>
    </RadioGroup>
  ),
  args: {
    value: 'option1',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole('radio');

    await userEvent.tab();
    expect(radio).toHaveFocus();
    expect(radio.matches(':focus-visible')).toBe(true);

    const cs = getComputedStyle(radio);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
  },
};

/** Error state, for use within a group signaling a validation failure. */
export const ErrorVariant: Story = {
  render: (args) => (
    <RadioGroup defaultValue="error1">
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem {...args} id="error1" />
        <label htmlFor="error1" className="typo-body-m text-sds-text-primary cursor-pointer">
          Error Radio Item
        </label>
      </div>
    </RadioGroup>
  ),
  args: {
    value: 'error1',
    variant: 'error',
  },
};

export const DisabledVariant: Story = {
  render: (args) => (
    <RadioGroup defaultValue="disabled1">
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem {...args} id="disabled1" />
        <label htmlFor="disabled1" className="typo-body-m text-sds-text-disable cursor-not-allowed">
          Disabled Radio Item
        </label>
      </div>
    </RadioGroup>
  ),
  args: {
    value: 'disabled1',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole('radio');
    await expect(radio).toBeDisabled();
    // This story's item is also the group's defaultValue, so it starts checked.
    await expect(radio).toHaveAttribute('data-state', 'checked');
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <RadioGroup defaultValue="default">
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="default" id="v1" variant="default" />
          <label htmlFor="v1" className="typo-body-m text-sds-text-primary cursor-pointer">
            Default Variant (Checked)
          </label>
        </div>
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="default2" id="v2" variant="default" />
          <label htmlFor="v2" className="typo-body-m text-sds-text-primary cursor-pointer">
            Default Variant (Unchecked)
          </label>
        </div>
      </RadioGroup>

      <RadioGroup defaultValue="error">
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="error" id="v3" variant="error" />
          <label htmlFor="v3" className="typo-body-m text-sds-text-primary cursor-pointer">
            Error Variant (Checked)
          </label>
        </div>
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="error2" id="v4" variant="error" />
          <label htmlFor="v4" className="typo-body-m text-sds-text-primary cursor-pointer">
            Error Variant (Unchecked)
          </label>
        </div>
      </RadioGroup>

      <RadioGroup defaultValue="disabled">
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="disabled" id="v5" disabled />
          <label htmlFor="v5" className="typo-body-m text-sds-text-disable cursor-not-allowed">
            Disabled Variant (Checked)
          </label>
        </div>
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="disabled2" id="v6" disabled />
          <label htmlFor="v6" className="typo-body-m text-sds-text-disable cursor-not-allowed">
            Disabled Variant (Unchecked)
          </label>
        </div>
      </RadioGroup>
    </div>
  ),
  args: {
    value: 'showcase',
  },
};
