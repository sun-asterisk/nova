import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A tri-state checkbox (checked / unchecked / indeterminate) built on Radix Checkbox. `variant="error"` shows a validation-failure state; `disabled` suppresses all interaction and hover/focus feedback.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description:
        'Visual state variant of the checkbox that determines its appearance and behavior',
      control: 'select',
      options: ['default', 'error'],
      table: {
        type: { summary: 'CheckboxVariant' },
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      description: 'Whether the checkbox is disabled and cannot be interacted with',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    checked: {
      description: 'The checked state of the checkbox. Can be true, false, or "indeterminate"',
      control: 'radio',
      options: [true, false, 'indeterminate'],
      table: {
        type: { summary: 'boolean | "indeterminate"' },
        defaultValue: { summary: 'false' },
      },
    },
    defaultChecked: {
      description: 'The default checked state when the checkbox is initially rendered',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
      },
    },
    onCheckedChange: {
      description: 'Callback function fired when the checked state changes',
      table: {
        type: { summary: '(checked: boolean | "indeterminate") => void' },
      },
    },
    name: {
      description: 'The name of the checkbox for form submission',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      description: 'The value of the checkbox when used in a form',
      table: {
        type: { summary: 'string' },
      },
    },
    required: {
      description: 'Whether the checkbox is required in a form',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply to the checkbox',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default checkbox variant in unchecked state. */
export const Default: Story = {
  args: {
    variant: 'default',
    'aria-label': 'Accept terms',
  },
  parameters: {
    docs: {
      description: {
        story: 'The default checkbox variant in unchecked state.',
      },
    },
  },
};

/** Checkbox in checked state. */
export const Checked: Story = {
  args: {
    variant: 'default',
    defaultChecked: true,
    'aria-label': 'Accept terms',
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox in checked state.',
      },
    },
  },
};

/** Indeterminate state, commonly used for "select all" when only some items are selected. */
export const Indeterminate: Story = {
  args: {
    variant: 'default',
    checked: 'indeterminate',
    'aria-label': 'Select all',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Checkbox in indeterminate state, commonly used for "select all" functionality when only some items are selected.',
      },
    },
  },
};

/** Error state, typically used when validation fails. */
export const Error: Story = {
  args: {
    variant: 'error',
    'aria-label': 'Accept terms',
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox with error state, typically used when validation fails.',
      },
    },
  },
};

/** Error state in checked condition. */
export const ErrorChecked: Story = {
  args: {
    variant: 'error',
    defaultChecked: true,
    'aria-label': 'Accept terms',
  },
  parameters: {
    docs: {
      description: {
        story: 'Checkbox with error state in checked condition.',
      },
    },
  },
};

/** Disabled state — cannot be interacted with, suppresses hover/focus feedback. */
export const Disabled: Story = {
  args: {
    disabled: true,
    'aria-label': 'Accept terms',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkbox that cannot be interacted with.',
      },
    },
  },
};

/** Disabled state in checked condition. */
export const DisabledChecked: Story = {
  args: {
    disabled: true,
    defaultChecked: true,
    'aria-label': 'Accept terms',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled checkbox in checked state.',
      },
    },
  },
};

/**
 * A checkbox with its label — the Figma Checkbox "Label" composition (gap 8px,
 * Body M, `text-primary`; `text-disable` when disabled). Checkbox has no label
 * prop: wrapping it in a `<label>` names it and makes the text clickable.
 * This is the snippet Code Connect emits when Figma's Label is on.
 */
export const WithLabel: Story = {
  render: (args) => (
    <label
      className={`flex items-center gap-sds-100 typo-body-m ${
        args.disabled ? 'text-sds-text-disable' : 'text-sds-text-primary'
      }`}
    >
      <Checkbox {...args} />
      利用規約に同意する
    </label>
  ),
  args: {
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Figma Checkbox with Label: wrap the checkbox and its text in a `<label className="flex items-center gap-sds-100 typo-body-m text-sds-text-primary">` (`text-sds-text-disable` when disabled).',
      },
    },
  },
};

/** Every variant × state combination side by side, for visual comparison. */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Default Variant</h3>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2 items-center">
            <Checkbox variant="default" aria-label="Default variant, unchecked" />
            <span className="text-xs text-sds-text-secondary">Unchecked</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Checkbox variant="default" defaultChecked aria-label="Default variant, checked" />
            <span className="text-xs text-sds-text-secondary">Checked</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Checkbox
              variant="default"
              checked="indeterminate"
              aria-label="Default variant, indeterminate"
            />
            <span className="text-xs text-sds-text-secondary">Indeterminate</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Error Variant</h3>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2 items-center">
            <Checkbox variant="error" aria-label="Error variant, unchecked" />
            <span className="text-xs text-sds-text-secondary">Unchecked</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Checkbox variant="error" defaultChecked aria-label="Error variant, checked" />
            <span className="text-xs text-sds-text-secondary">Checked</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Checkbox
              variant="error"
              checked="indeterminate"
              aria-label="Error variant, indeterminate"
            />
            <span className="text-xs text-sds-text-secondary">Indeterminate</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Disabled Variant</h3>
        <div className="flex gap-4 items-center">
          <div className="flex flex-col gap-2 items-center">
            <Checkbox disabled aria-label="Disabled variant, unchecked" />
            <span className="text-xs text-sds-text-secondary">Unchecked</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Checkbox disabled defaultChecked aria-label="Disabled variant, checked" />
            <span className="text-xs text-sds-text-secondary">Checked</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <Checkbox
              disabled
              checked="indeterminate"
              aria-label="Disabled variant, indeterminate"
            />
            <span className="text-xs text-sds-text-secondary">Indeterminate</span>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive showcase of all checkbox variants and their states (unchecked, checked, indeterminate).',
      },
    },
  },
};

/** The full state matrix (enabled/error/disabled × checked/unchecked/indeterminate) as specified in Figma. */
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4 text-center text-sm font-semibold">
        <div></div>
        <div>Checked</div>
        <div>Unchecked</div>
        <div>Indeterminate</div>
      </div>

      <div className="grid grid-cols-4 gap-4 items-center">
        <div className="text-sm font-medium">Enabled</div>
        <div className="flex justify-center">
          <Checkbox variant="default" defaultChecked aria-label="Enabled, checked" />
        </div>
        <div className="flex justify-center">
          <Checkbox variant="default" aria-label="Enabled, unchecked" />
        </div>
        <div className="flex justify-center">
          <Checkbox variant="default" checked="indeterminate" aria-label="Enabled, indeterminate" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 items-center">
        <div className="text-sm font-medium">Error</div>
        <div className="flex justify-center">
          <Checkbox variant="error" defaultChecked aria-label="Error, checked" />
        </div>
        <div className="flex justify-center">
          <Checkbox variant="error" aria-label="Error, unchecked" />
        </div>
        <div className="flex justify-center">
          <Checkbox variant="error" checked="indeterminate" aria-label="Error, indeterminate" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 items-center">
        <div className="text-sm font-medium">Disabled</div>
        <div className="flex justify-center">
          <Checkbox disabled defaultChecked aria-label="Disabled, checked" />
        </div>
        <div className="flex justify-center">
          <Checkbox disabled aria-label="Disabled, unchecked" />
        </div>
        <div className="flex justify-center">
          <Checkbox disabled checked="indeterminate" aria-label="Disabled, indeterminate" />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Complete matrix view of all checkbox states and variants as shown in the design specification.',
      },
    },
  },
};

/** Checkboxes composed inside a real `<form>`, including a required item. */
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 p-6 border rounded-lg max-w-md">
      <h3 className="text-lg font-semibold mb-4">選択してください</h3>

      <div className="flex items-center gap-sds-100">
        <Checkbox id="option1" name="options" value="option1" defaultChecked />
        <label htmlFor="option1" className="typo-body-m text-sds-text-primary cursor-pointer">
          オプション1
        </label>
      </div>

      <div className="flex items-center gap-sds-100">
        <Checkbox id="option2" name="options" value="option2" />
        <label htmlFor="option2" className="typo-body-m text-sds-text-primary cursor-pointer">
          オプション2
        </label>
      </div>

      <div className="flex items-center gap-sds-100">
        <Checkbox id="option3" name="options" value="option3" variant="error" />
        <label htmlFor="option3" className="typo-body-m text-sds-text-primary cursor-pointer">
          オプション3 (エラー)
        </label>
      </div>

      <div className="flex items-center gap-sds-100">
        <Checkbox id="option4" name="options" value="option4" disabled />
        <label htmlFor="option4" className="typo-body-m text-sds-text-disable cursor-not-allowed">
          オプション4 (無効)
        </label>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center gap-sds-100">
          <Checkbox id="terms" required />
          <label htmlFor="terms" className="typo-body-m text-sds-text-primary cursor-pointer">
            利用規約に同意する <span className="text-sds-text-danger">*</span>
          </label>
        </div>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of checkboxes used in a form with various states and labels.',
      },
    },
  },
};

/** Clicking toggles checked state and fires `onCheckedChange` with the new value each time. */
export const InteractionToggle: Story = {
  args: {
    'aria-label': 'Accept terms',
    onCheckedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept terms' });

    expect(checkbox).toHaveAttribute('data-state', 'unchecked');

    await userEvent.click(checkbox);
    expect(args.onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox).toHaveAttribute('data-state', 'checked');

    await userEvent.click(checkbox);
    expect(args.onCheckedChange).toHaveBeenCalledWith(false);
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  },
};

/** A disabled checkbox blocks both click activation and the `onCheckedChange` callback. */
export const InteractionDisabledBlocksToggle: Story = {
  args: {
    'aria-label': 'Accept terms',
    disabled: true,
    onCheckedChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept terms' });

    expect(checkbox).toBeDisabled();

    await userEvent.click(checkbox, { pointerEventsCheck: 0 });
    expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

// Phase X.1 — Foundation Capability Implementation: aria-invalid is now
// derived automatically from `variant`/`disabled`, never a new prop. See
// Checkbox.test.tsx for the unit-level mutation-tested coverage of the
// underlying logic; this story additionally verifies it survives through
// a real rendered DOM node the way a consumer/AT would observe it.
/** `variant="error"` sets a real `aria-invalid="true"`; the default variant sets none; disabled suppresses it. */
export const InteractionAriaInvalid: Story = {
  render: () => (
    <div className="flex gap-6">
      <Checkbox variant="default" aria-label="Default" data-testid="default" />
      <Checkbox variant="error" aria-label="Error" data-testid="error" />
      <Checkbox disabled variant="error" aria-label="Disabled error" data-testid="disabled-error" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('default')).not.toHaveAttribute('aria-invalid');
    expect(canvas.getByTestId('error')).toHaveAttribute('aria-invalid', 'true');
    expect(canvas.getByTestId('disabled-error')).not.toHaveAttribute('aria-invalid');
  },
};

// Regression coverage for the `outline-none` + bare `outline`/`outline-2`
// tailwind-merge collision (`.claude/rules/design-foundation.md` §5.1) —
// Checkbox was one of the components this bug was originally found and
// fixed in this session, but never got a dedicated test asserting the
// fix via real keyboard `Tab` + `getComputedStyle()` (source/screenshot
// checks alone do not prove a focus ring renders — see design-foundation.md
// §5.1's own explanation of why).
/** Real keyboard `Tab` produces a genuine, correctly-colored focus ring — not silently suppressed. */
export const InteractionFocusRing: Story = {
  args: {
    'aria-label': 'Accept terms',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept terms' });

    await userEvent.tab();
    expect(checkbox).toHaveFocus();
    expect(checkbox.matches(':focus-visible')).toBe(true);

    const cs = getComputedStyle(checkbox);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
  },
};
