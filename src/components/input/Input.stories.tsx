import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { MdClose, MdSearch, MdLock, MdPerson, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { expect, userEvent, within } from 'storybook/test';
import { Input } from './Input';

const meta = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible input field component with support for icons, different states, and customizable styling. Used as the foundation for more complex form components.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Visual state variant of the input field',
      control: 'select',
      options: ['default', 'error'],
      table: {
        type: { summary: 'InputVariant' },
        defaultValue: { summary: 'default' },
      },
    },
    disabled: {
      description: 'Whether the input is disabled and cannot be interacted with',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      description: 'Placeholder text displayed when the input is empty',
      control: 'text',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'テキストを入力' },
      },
    },
    startAdornment: {
      description: 'Icon or element displayed at the start (left) of the input field',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    endAdornment: {
      description: 'Icon or element displayed at the end (right) of the input field',
      table: {
        type: { summary: 'ReactNode' },
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
      description: 'Callback function fired when the input value changes',
      table: {
        type: { summary: '(event: ChangeEvent<HTMLInputElement>) => void' },
      },
    },
    onFocus: {
      description: 'Callback function fired when the input receives focus',
      table: {
        type: { summary: '(event: FocusEvent<HTMLInputElement>) => void' },
      },
    },
    onBlur: {
      description: 'Callback function fired when the input loses focus',
      table: {
        type: { summary: '(event: FocusEvent<HTMLInputElement>) => void' },
      },
    },
    type: {
      description: 'HTML input type attribute (text, password, email, etc.)',
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text' },
      },
    },
    name: {
      description: 'Name attribute for the input element, used for form submission',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply to the input wrapper',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: { onChange: () => {}, onBlur: () => {} },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text',
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'The default state of the input field with standard styling.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Enter text');
    await userEvent.type(input, 'hello');
    await expect(input).toHaveValue('hello');
  },
};

export const WithStartIcon: Story = {
  args: {
    placeholder: 'Search...',
    startAdornment: <MdSearch />,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input field with an icon at the beginning to indicate functionality.',
      },
    },
  },
};

export const WithEndIcon: Story = {
  args: {
    placeholder: 'Enter text',
    endAdornment: <MdClose />,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input field with an icon at the end, commonly used for clear or action buttons.',
      },
    },
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: 'Search and clear',
    startAdornment: <MdSearch />,
    endAdornment: <MdClose />,
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input field with icons at both ends for enhanced functionality.',
      },
    },
  },
};

export const ErrorState: Story = {
  args: {
    placeholder: 'Enter valid input',
    startAdornment: <MdPerson />,
    variant: 'error',
    value: 'invalid@',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input field in error state with red styling to indicate validation issues.',
      },
    },
  },
};

export const DisabledState: Story = {
  args: {
    placeholder: 'Disabled input',
    startAdornment: <MdLock />,
    disabled: true,
    value: 'Cannot edit this',
  },
  parameters: {
    docs: {
      description: {
        story: 'Input field in disabled state, preventing user interaction.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByDisplayValue('Cannot edit this');
    await expect(input).toBeDisabled();
  },
};

export const PasswordField: Story = {
  render: (args) => {
    const [visible, setVisible] = useState(false);
    return (
      <Input
        {...args}
        type={visible ? 'text' : 'password'}
        endAdornment={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="pointer-events-auto cursor-pointer flex items-center"
          >
            {visible ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
        }
      />
    );
  },
  args: {
    placeholder: 'Enter password',
    startAdornment: <MdLock />,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Password input field with a working show/hide toggle. The end adornment must be a real interactive element (a `<button>`) to be both clickable and accessible — Input itself does not assume any adornment is clickable.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Enter password');
    const toggle = canvas.getByRole('button', { name: /show password/i });

    await expect(input).toHaveAttribute('type', 'password');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(toggle);
    await expect(input).toHaveAttribute('type', 'text');
    await expect(canvas.getByRole('button', { name: /hide password/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(canvas.getByRole('button', { name: /hide password/i }));
    await expect(input).toHaveAttribute('type', 'password');
  },
};

export const EmailField: Story = {
  args: {
    placeholder: 'Enter email address',
    type: 'email',
    startAdornment: <MdPerson />,
  },
  parameters: {
    docs: {
      description: {
        story: 'Email input field with appropriate type and icon.',
      },
    },
  },
};

// Regression coverage for the `outline-none` + bare `outline`/`outline-2`
// tailwind-merge collision and the `transition-colors`/`outline-color` flash
// bug (`.claude/rules/design-foundation.md` §5.1) — Input's focus ring is
// declared via `focus-within:outline-*` on the WRAPPER div (not the native
// `<input>` itself), so the assertion targets the wrapper.
/** Real keyboard `Tab` produces a genuine, correctly-colored focus ring on the wrapper — not silently suppressed. */
export const InteractionFocusRing: Story = {
  args: {
    placeholder: 'Focus me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Focus me');

    await userEvent.tab();
    expect(input).toHaveFocus();

    const wrapper = input.parentElement as HTMLElement;
    const cs = getComputedStyle(wrapper);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-80">
      <Input placeholder="Default state" startAdornment={<MdSearch />} />
      <Input
        placeholder="With value"
        startAdornment={<MdPerson />}
        value="John Doe"
        onChange={() => {}}
      />
      <Input
        placeholder="Error state"
        startAdornment={<MdPerson />}
        endAdornment={<MdClose />}
        variant="error"
        value="invalid input"
        onChange={() => {}}
      />
      <Input
        placeholder="Disabled state"
        startAdornment={<MdLock />}
        disabled
        value="Cannot edit"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all input states in a single view for comparison.',
      },
    },
  },
};
