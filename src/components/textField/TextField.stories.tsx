import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from 'storybook/test';
import { MdSearch, MdClose, MdLock, MdPerson } from 'react-icons/md';
import { TextField } from './TextField';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A text field component that combines an input field with label, validation, and helper text functionality. Built on top of the Input component with additional form-related features.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Visual style variant of the text field',
      control: 'select',
      options: ['default', 'error'],
      table: {
        type: { summary: 'InputVariant' },
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      description: 'Whether the field is disabled and cannot be interacted with',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      description: 'The label text displayed above the input field',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'ラベル' },
      },
    },
    error: {
      description:
        'Error message to display below the input. When provided, the input will show error state',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    supportText: {
      description:
        'Helper text displayed below the input to provide additional context or instructions',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    required: {
      description: 'Whether the field is required. Shows a required indicator next to the label',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    requiredText: {
      description: 'Custom text for the required indicator badge',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '必須' },
      },
    },
    startAdornment: {
      description: 'Element to display at the start (left) of the input field',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    endAdornment: {
      description: 'Element to display at the end (right) of the input field',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    placeholder: {
      description: 'Placeholder text shown when the input is empty',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    name: {
      description: 'Name attribute for the input element, used for form submission',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    value: {
      description: 'Current value of the input field',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    onChange: {
      description: 'Callback fired when the input value changes',
      table: {
        type: { summary: '(event: ChangeEvent<HTMLInputElement>) => void' },
      },
    },
    onBlur: {
      description: 'Callback fired when the input loses focus',
      table: {
        type: { summary: '(event: FocusEvent<HTMLInputElement>) => void' },
      },
    },
    onFocus: {
      description: 'Callback fired when the input receives focus',
      table: {
        type: { summary: '(event: FocusEvent<HTMLInputElement>) => void' },
      },
    },
  },
  args: {
    onChange: () => {},
    onBlur: () => {},
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default state: a label and a placeholder, no adornments or validation. */
export const Default: Story = {
  args: {
    name: 'username',
    placeholder: 'Enter your username',
    label: 'Username',
  },
  parameters: {
    docs: {
      description: {
        story: 'The default state of the TextField component with just a label and placeholder.',
      },
    },
  },
};

/** Icon adornments at both ends, passed through to the underlying `Input`. */
export const WithAdornments: Story = {
  args: {
    name: 'search',
    placeholder: 'Search...',
    label: 'Search',
    startAdornment: <MdSearch />,
    endAdornment: <MdClose />,
  },
  parameters: {
    docs: {
      description: {
        story: 'TextField with icon adornments at the beginning and end of the input field.',
      },
    },
  },
};

/** `required` shows the required-indicator badge next to the label. */
export const Required: Story = {
  args: {
    name: 'email',
    placeholder: 'Enter your email',
    label: 'Email Address',
    required: true,
    startAdornment: <MdPerson />,
  },
  parameters: {
    docs: {
      description: {
        story: 'A required field with the required indicator badge displayed next to the label.',
      },
    },
  },
};

/** `supportText` renders helper text below the input when there is no `error`. */
export const WithSupportText: Story = {
  args: {
    name: 'password',
    placeholder: 'Enter your password',
    label: 'Password',
    supportText: 'Must be at least 8 characters long',
    type: 'password',
    startAdornment: <MdLock />,
  },
  parameters: {
    docs: {
      description: {
        story: 'TextField with helper text providing additional instructions or context.',
      },
    },
  },
};

/** `error` replaces `supportText` (if any) and forces the error visual variant regardless of `variant`. */
export const ErrorState: Story = {
  args: {
    name: 'email',
    placeholder: 'Enter your email',
    label: 'Email Address',
    error: 'Please enter a valid email address',
    value: 'invalid-email',
    startAdornment: <MdPerson />,
  },
  parameters: {
    docs: {
      description: {
        story: 'TextField in error state with an error message displayed below the input.',
      },
    },
  },
};

/** `disabled` blocks interaction while still displaying label, value, and support text. */
export const Disabled: Story = {
  args: {
    name: 'disabled-field',
    placeholder: 'This field is disabled',
    label: 'Disabled Field',
    disabled: true,
    value: 'Cannot edit this',
    supportText: 'This field cannot be modified',
  },
  parameters: {
    docs: {
      description: {
        story: 'TextField in disabled state, preventing user interaction.',
      },
    },
  },
};

/** `requiredText` overrides the default Japanese required-indicator text. */
export const CustomRequiredText: Story = {
  args: {
    name: 'custom-required',
    placeholder: 'Enter value',
    label: 'Custom Required Field',
    required: true,
    requiredText: 'Required',
    supportText: 'This field uses custom required text',
  },
  parameters: {
    docs: {
      description: {
        story:
          'TextField with custom text for the required indicator instead of the default Japanese text.',
      },
    },
  },
};

/** All meaningfully-different states side by side for visual comparison. */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <TextField name="default" label="Default State" placeholder="Enter text" />
      <TextField
        name="required"
        label="Required Field"
        placeholder="Enter text"
        required
        startAdornment={<MdPerson />}
      />
      <TextField
        name="with-support"
        label="With Support Text"
        placeholder="Enter text"
        supportText="This is helpful information"
      />
      <TextField
        name="error"
        label="Error State"
        placeholder="Enter text"
        error="This field has an error"
        value="invalid input"
      />
      <TextField
        name="disabled"
        label="Disabled State"
        placeholder="Disabled"
        disabled
        value="Cannot edit"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all possible states of the TextField component in a single view.',
      },
    },
  },
};

/** The `classNames` slot API reaching the label, support-text, and error parts independently of the root `className` (which only reaches the leaf `<input>`). */
export const CustomClassNames: Story = {
  args: {
    name: 'custom-classnames',
    label: 'Custom-Styled Label',
    supportText: 'Custom-styled support text',
    classNames: {
      label: 'text-sds-text-emphasis',
      supportText: 'italic',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `classNames` prop, which targets the label, supportText, and error parts individually — the root `className` only reaches the leaf `<input>`.',
      },
    },
  },
};

/** Typing fires `onChange` for every keystroke and updates the input's value. */
export const InteractionTyping: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    onChange: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Username');

    await userEvent.type(input, 'hello');
    expect(input).toHaveValue('hello');
    expect(args.onChange).toHaveBeenCalledTimes(5);
  },
};

/** `error` wires `aria-invalid` and `aria-describedby` to the rendered error message. */
export const InteractionErrorWiring: Story = {
  args: {
    label: 'Email',
    error: 'Invalid email address',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email');

    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const errorEl = canvasElement.ownerDocument.getElementById(describedBy!);
    expect(errorEl).toHaveTextContent('Invalid email address');
  },
};

/**
 * Figma Text Field `Status=Error` (610:2971): the support text stays visible
 * and the error message (icon + text) appears below it; the input is
 * described by both (2026-10-05 Figma sync — it used to replace the support
 * text). Runs in light and dark (`storybook-dark`).
 */
export const InteractionErrorWithSupportText: Story = {
  args: {
    label: 'Email',
    required: true,
    supportText: 'We will never share your email',
    error: 'Invalid email address',
    defaultValue: 'abc@',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText(/Email/);
    const support = canvas.getByText('We will never share your email');
    const error = canvas.getByText('Invalid email address');

    expect(support).toBeVisible();
    expect(error).toBeVisible();
    expect(support.compareDocumentPosition(error) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const describedBy = input.getAttribute('aria-describedby')!.split(' ');
    expect(describedBy).toContain(support.id);
    expect(describedBy).toContain(error.closest('[id]')!.id);
  },
};
