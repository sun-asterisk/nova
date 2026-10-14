import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { fn, expect, userEvent, within } from 'storybook/test';
import { RadioGroup, RadioGroupItem } from './RadioGroup';

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  subcomponents: { RadioGroupItem },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A single-select group built on Radix RadioGroup. Arrow keys move the roving focus AND select the new item in one step (unlike Tabs, which only moves focus on arrow keys); Space also selects the focused item. Compose with `RadioGroupItem` (see its own story) for each option.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'The controlled value of the radio item to check',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    defaultValue: {
      description: 'The value of the radio item that should be checked when initially rendered',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    onValueChange: {
      description: 'Callback function fired when the value changes',
      table: {
        type: { summary: '(value: string) => void' },
      },
    },
    disabled: {
      description: 'Whether the radio group is disabled and cannot be interacted with',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      description: 'Whether the radio group is required for form submission',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    name: {
      description: 'The name of the radio group for form submission',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    orientation: {
      description: 'The orientation of the radio group',
      control: 'select',
      options: ['horizontal', 'vertical'],
      table: {
        type: { summary: 'horizontal | vertical' },
        defaultValue: { summary: 'vertical' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply to the radio group',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A basic radio group with three options — only one can be selected at a time. */
export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option1" id="r1" />
        <label htmlFor="r1" className="typo-body-m text-sds-text-primary cursor-pointer">
          Option 1
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option2" id="r2" />
        <label htmlFor="r2" className="typo-body-m text-sds-text-primary cursor-pointer">
          Option 2
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option3" id="r3" />
        <label htmlFor="r3" className="typo-body-m text-sds-text-primary cursor-pointer">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic radio group with three options. Only one option can be selected at a time.',
      },
    },
  },
};

/** Controlled radio group — selection is driven by React state, displayed live below. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState('option2');
    return (
      <div className="flex flex-col gap-4">
        <RadioGroup value={value} onValueChange={setValue}>
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="option1" id="c1" />
            <label htmlFor="c1" className="typo-body-m text-sds-text-primary cursor-pointer">
              Option 1
            </label>
          </div>
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="option2" id="c2" />
            <label htmlFor="c2" className="typo-body-m text-sds-text-primary cursor-pointer">
              Option 2
            </label>
          </div>
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="option3" id="c3" />
            <label htmlFor="c3" className="typo-body-m text-sds-text-primary cursor-pointer">
              Option 3
            </label>
          </div>
        </RadioGroup>
        <p className="text-sm text-sds-text-secondary">Selected: {value}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Controlled radio group where the selected value is managed by React state. Displays the current selection.',
      },
    },
  },
};

/** Horizontal orientation, useful for compact option selections. */
export const HorizontalLayout: Story = {
  render: () => (
    <RadioGroup defaultValue="small" orientation="horizontal" className="flex gap-6">
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="small" id="h1" />
        <label htmlFor="h1" className="typo-body-m text-sds-text-primary cursor-pointer">
          Small
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="medium" id="h2" />
        <label htmlFor="h2" className="typo-body-m text-sds-text-primary cursor-pointer">
          Medium
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="large" id="h3" />
        <label htmlFor="h3" className="typo-body-m text-sds-text-primary cursor-pointer">
          Large
        </label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Radio group with horizontal layout, useful for compact option selections.',
      },
    },
  },
};

/** Items in error state, with a validation message below the group. */
export const ErrorState: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <RadioGroup defaultValue="error1">
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="error1" id="e1" variant="error" />
          <label htmlFor="e1" className="typo-body-m text-sds-text-primary cursor-pointer">
            Invalid Option 1
          </label>
        </div>
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="error2" id="e2" variant="error" />
          <label htmlFor="e2" className="typo-body-m text-sds-text-primary cursor-pointer">
            Invalid Option 2
          </label>
        </div>
      </RadioGroup>
      <p className="text-sm text-sds-text-danger">Please select a valid option</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Radio group items in error state with red styling to indicate validation issues.',
      },
    },
  },
};

/** The entire group disabled — no item can be interacted with. */
export const DisabledState: Story = {
  render: () => (
    <RadioGroup defaultValue="disabled1" disabled>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="disabled1" id="d1" />
        <label htmlFor="d1" className="typo-body-m text-sds-text-disable cursor-not-allowed">
          Disabled Option 1 (Selected)
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="disabled2" id="d2" />
        <label htmlFor="d2" className="typo-body-m text-sds-text-disable cursor-not-allowed">
          Disabled Option 2
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="disabled3" id="d3" />
        <label htmlFor="d3" className="typo-body-m text-sds-text-disable cursor-not-allowed">
          Disabled Option 3
        </label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Entire radio group in disabled state, preventing any user interaction.',
      },
    },
  },
};

/** One item disabled within an otherwise-enabled group. */
export const IndividualDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option1" id="id1" />
        <label htmlFor="id1" className="typo-body-m text-sds-text-primary cursor-pointer">
          Available Option 1
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option2" id="id2" disabled />
        <label htmlFor="id2" className="typo-body-m text-sds-text-disable cursor-not-allowed">
          Disabled Option 2
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option3" id="id3" />
        <label htmlFor="id3" className="typo-body-m text-sds-text-primary cursor-pointer">
          Available Option 3
        </label>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Radio group with individual disabled items. Some options are available while others are disabled.',
      },
    },
  },
};

/** Each option paired with a label and a supporting description, e.g. for pricing plans. */
export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="plan1">
      <div className="flex items-start gap-2">
        <RadioGroupItem value="plan1" id="plan1" className="mt-1" />
        <div className="flex flex-col">
          <label htmlFor="plan1" className="cursor-pointer font-medium">
            Basic Plan
          </label>
          <p className="text-sm text-sds-text-secondary">Perfect for individuals and small teams</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="plan2" id="plan2" className="mt-1" />
        <div className="flex flex-col">
          <label htmlFor="plan2" className="cursor-pointer font-medium">
            Professional Plan
          </label>
          <p className="text-sm text-sds-text-secondary">For growing teams with advanced needs</p>
        </div>
      </div>
      <div className="flex items-start gap-2">
        <RadioGroupItem value="plan3" id="plan3" className="mt-1" />
        <div className="flex flex-col">
          <label htmlFor="plan3" className="cursor-pointer font-medium">
            Enterprise Plan
          </label>
          <p className="text-sm text-sds-text-secondary">
            For large organizations with custom requirements
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Radio group with labels and descriptions for each option, useful for pricing plans or feature selections.',
      },
    },
  },
};

/** Default, error, and disabled states side by side, each with a selected and unselected item. */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <h4 className="font-medium mb-2">Default State</h4>
        <RadioGroup defaultValue="default1">
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="default1" id="all1" />
            <label htmlFor="all1" className="typo-body-m text-sds-text-primary cursor-pointer">
              Selected
            </label>
          </div>
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="default2" id="all2" />
            <label htmlFor="all2" className="typo-body-m text-sds-text-primary cursor-pointer">
              Unselected
            </label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <h4 className="font-medium mb-2">Error State</h4>
        <RadioGroup defaultValue="error1">
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="error1" id="all3" variant="error" />
            <label htmlFor="all3" className="typo-body-m text-sds-text-primary cursor-pointer">
              Selected Error
            </label>
          </div>
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="error2" id="all4" variant="error" />
            <label htmlFor="all4" className="typo-body-m text-sds-text-primary cursor-pointer">
              Unselected Error
            </label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <h4 className="font-medium mb-2">Disabled State</h4>
        <RadioGroup defaultValue="disabled1">
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="disabled1" id="all5" disabled />
            <label htmlFor="all5" className="typo-body-m text-sds-text-disable cursor-not-allowed">
              Selected Disabled
            </label>
          </div>
          <div className="flex items-center gap-sds-100">
            <RadioGroupItem value="disabled2" id="all6" disabled />
            <label htmlFor="all6" className="typo-body-m text-sds-text-disable cursor-not-allowed">
              Unselected Disabled
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all radio group states in both selected and unselected conditions.',
      },
    },
  },
};

/** Multiple radio groups composed inside a real form, with validation and live state display. */
export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      size: 'medium',
      color: '',
      delivery: 'standard',
    });

    return (
      <form className="flex flex-col gap-6 w-80">
        <div>
          <label className="block font-medium mb-2">Size *</label>
          <RadioGroup
            value={formData.size}
            onValueChange={(value) => setFormData({ ...formData, size: value })}
            required
          >
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem value="small" id="size-s" />
              <label htmlFor="size-s" className="typo-body-m text-sds-text-primary cursor-pointer">
                Small
              </label>
            </div>
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem value="medium" id="size-m" />
              <label htmlFor="size-m" className="typo-body-m text-sds-text-primary cursor-pointer">
                Medium
              </label>
            </div>
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem value="large" id="size-l" />
              <label htmlFor="size-l" className="typo-body-m text-sds-text-primary cursor-pointer">
                Large
              </label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <label className="block font-medium mb-2">Color *</label>
          <RadioGroup
            value={formData.color}
            onValueChange={(value) => setFormData({ ...formData, color: value })}
            required
          >
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem
                value="red"
                id="color-r"
                variant={formData.color === '' ? 'error' : 'default'}
              />
              <label htmlFor="color-r" className="typo-body-m text-sds-text-primary cursor-pointer">
                Red
              </label>
            </div>
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem
                value="blue"
                id="color-b"
                variant={formData.color === '' ? 'error' : 'default'}
              />
              <label htmlFor="color-b" className="typo-body-m text-sds-text-primary cursor-pointer">
                Blue
              </label>
            </div>
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem
                value="green"
                id="color-g"
                variant={formData.color === '' ? 'error' : 'default'}
              />
              <label htmlFor="color-g" className="typo-body-m text-sds-text-primary cursor-pointer">
                Green
              </label>
            </div>
          </RadioGroup>
          {formData.color === '' && (
            <p className="text-sm text-sds-text-danger mt-1">Please select a color</p>
          )}
        </div>

        <div>
          <label className="block font-medium mb-2">Delivery Method</label>
          <RadioGroup
            value={formData.delivery}
            onValueChange={(value) => setFormData({ ...formData, delivery: value })}
          >
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem value="standard" id="delivery-s" />
              <label
                htmlFor="delivery-s"
                className="typo-body-m text-sds-text-primary cursor-pointer"
              >
                Standard (5-7 days)
              </label>
            </div>
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem value="express" id="delivery-e" />
              <label
                htmlFor="delivery-e"
                className="typo-body-m text-sds-text-primary cursor-pointer"
              >
                Express (2-3 days)
              </label>
            </div>
            <div className="flex items-center gap-sds-100">
              <RadioGroupItem value="overnight" id="delivery-o" />
              <label
                htmlFor="delivery-o"
                className="typo-body-m text-sds-text-primary cursor-pointer"
              >
                Overnight
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="p-4 bg-sds-surface-secondary-hover rounded">
          <p className="text-sm">
            <strong>Form Data:</strong>
          </p>
          <pre className="text-xs mt-2">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      </form>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Complete form example demonstrating multiple radio groups with validation and state management.',
      },
    },
  },
};

// Phase X.1 — Foundation Capability Implementation: aria-invalid is now
// derived automatically from RadioGroupItem's `variant`/`disabled`, never a
// new prop. See RadioGroup.test.tsx for the unit-level mutation-tested
// coverage; this story additionally verifies it survives through a real
// rendered DOM node the way a consumer/AT would observe it.
/** `variant="error"` sets a real `aria-invalid="true"` on the item; the default variant sets none; disabled suppresses it. */
export const InteractionAriaInvalid: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="flex gap-6">
      <RadioGroupItem value="a" aria-label="Default" data-testid="default" />
      <RadioGroupItem value="b" variant="error" aria-label="Error" data-testid="error" />
      <RadioGroupItem
        value="c"
        disabled
        variant="error"
        aria-label="Disabled error"
        data-testid="disabled-error"
      />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('default')).not.toHaveAttribute('aria-invalid');
    expect(canvas.getByTestId('error')).toHaveAttribute('aria-invalid', 'true');
    expect(canvas.getByTestId('disabled-error')).not.toHaveAttribute('aria-invalid');
  },
};

// Phase X.1 — closes the "no enforced <fieldset>/<legend> semantics
// anywhere, including the story meant to model production usage" gap
// (component-capability-matrix.md, accessibility.md §7.6). On independent
// re-verification this needed no RadioGroup code change at all: Radix's
// `RadioGroupPrimitive.Root` already renders `role="radiogroup"`, and a
// consumer can wrap it in a native `<fieldset>`/`<legend>` today with zero
// API additions — the gap was purely that no story demonstrated the
// correct pattern. This story is that missing example.
/** The accessible, production-correct way to group a RadioGroup: native `<fieldset>`/`<legend>`, not a bare `<label>`. */
export const AccessibleFormFieldset: Story = {
  render: () => (
    <fieldset className="flex flex-col gap-3 border border-sds-border-strong rounded-sds-200 p-sds-200">
      <legend className="font-medium px-sds-100">Shipping speed</legend>
      <RadioGroup defaultValue="standard">
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="standard" id="fs-standard" />
          <label htmlFor="fs-standard" className="typo-body-m text-sds-text-primary cursor-pointer">
            Standard (5-7 days)
          </label>
        </div>
        <div className="flex items-center gap-sds-100">
          <RadioGroupItem value="express" id="fs-express" />
          <label htmlFor="fs-express" className="typo-body-m text-sds-text-primary cursor-pointer">
            Express (2-3 days)
          </label>
        </div>
      </RadioGroup>
    </fieldset>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A `<fieldset>` + `<legend>` gives the whole group an accessible name via native semantics (no `aria-label`/`aria-labelledby` needed on RadioGroup itself) — the recommended wrapping pattern for any RadioGroup used in a real form, in place of a bare `<label>` above the group.',
      },
    },
  },
};

/** Real click + Arrow-key + Space selection, verifying roving focus moves and selects together. */
export const InteractionSelectAndArrowNav: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" onValueChange={fn()}>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option1" id="ix1" />
        <label htmlFor="ix1" className="typo-body-m text-sds-text-primary cursor-pointer">
          Option 1
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option2" id="ix2" />
        <label htmlFor="ix2" className="typo-body-m text-sds-text-primary cursor-pointer">
          Option 2
        </label>
      </div>
      <div className="flex items-center gap-sds-100">
        <RadioGroupItem value="option3" id="ix3" />
        <label htmlFor="ix3" className="typo-body-m text-sds-text-primary cursor-pointer">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const option1 = canvas.getByRole('radio', { name: 'Option 1' });
    const option2 = canvas.getByRole('radio', { name: 'Option 2' });
    const option3 = canvas.getByRole('radio', { name: 'Option 3' });

    expect(option1).toHaveAttribute('data-state', 'checked');

    await userEvent.click(option2);
    expect(option2).toHaveAttribute('data-state', 'checked');
    expect(option1).toHaveAttribute('data-state', 'unchecked');
    expect(option2).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}');
    expect(option3).toHaveFocus();

    await userEvent.keyboard(' ');
    expect(option3).toHaveAttribute('data-state', 'checked');
  },
};
