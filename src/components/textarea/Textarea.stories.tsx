import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Textarea } from './Textarea';
import { Button } from '../button';
import { tokenColor } from '../../../.storybook/tokenColor';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible textarea component with `default`/`error` visual variants and a disabled state. Used as the foundation for `TextareaField` (which adds a label/description/error-message wrapper) — reach for `Textarea` directly only when that wrapper is not needed.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error'],
      description: 'Visual state variant of the textarea field',
      table: {
        type: { summary: "'default' | 'error'" },
        defaultValue: { summary: "'default'" },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is disabled and cannot be interacted with',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the textarea',
      table: {
        type: { summary: 'string' },
      },
    },
    rows: {
      control: { type: 'number' },
      description: 'Number of visible text lines',
      table: {
        type: { summary: 'number' },
      },
    },
    cols: {
      control: { type: 'number' },
      description: 'Number of visible character columns',
      table: {
        type: { summary: 'number' },
      },
    },
    maxLength: {
      control: { type: 'number' },
      description: 'Maximum number of characters allowed',
      table: {
        type: { summary: 'number' },
      },
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Basic textarea; typing updates its value. */
export const Default: Story = {
  args: {
    placeholder: 'テキストを入力',
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('テキストを入力');
    await userEvent.type(textarea, 'hello world');
    await expect(textarea).toHaveValue('hello world');
  },
};

/** Pre-filled with a `defaultValue`, showing how existing content renders. */
export const WithContent: Story = {
  args: {
    placeholder: 'テキストを入力',
    defaultValue: 'This is some sample content in the textarea.',
    rows: 4,
  },
};

/** `variant="error"` for signaling a validation failure. */
export const ErrorState: Story = {
  args: {
    variant: 'error',
    placeholder: 'エラー状態のテキストエリア',
    defaultValue: 'Invalid content',
    rows: 4,
  },
};

/** `disabled` blocks interaction while still displaying existing content. */
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: '無効状態のテキストエリア',
    defaultValue: 'This textarea is disabled',
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByDisplayValue('This textarea is disabled');
    await expect(textarea).toBeDisabled();
  },
};

/** A larger textarea via `rows`/`cols`, for long-form content. */
export const LargeTextarea: Story = {
  args: {
    placeholder: '大きなテキストエリア',
    rows: 8,
    cols: 50,
  },
};

/** `maxLength` caps input length via the native HTML attribute. */
export const WithMaxLength: Story = {
  args: {
    placeholder: '最大100文字まで入力可能',
    maxLength: 100,
    rows: 4,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('最大100文字まで入力可能');
    await expect(textarea).toHaveAttribute('maxlength', '100');
  },
};

/** A controlled textarea whose variant/disabled state is toggled live via external buttons. */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [variant, setVariant] = useState<'default' | 'error'>('default');
    const [disabled, setDisabled] = useState(false);

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setVariant('default');
              setDisabled(false);
            }}
            variant={variant === 'default' && !disabled ? 'primary' : 'secondary'}
          >
            Default
          </Button>
          <Button
            onClick={() => {
              setVariant('error');
              setDisabled(false);
            }}
            variant={variant === 'error' ? 'danger' : 'secondary'}
          >
            Error
          </Button>
          <Button onClick={() => setDisabled(true)} variant={disabled ? 'primary' : 'secondary'}>
            Disabled
          </Button>
        </div>
        <Textarea
          variant={variant}
          disabled={disabled}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="インタラクティブなテキストエリア"
          rows={4}
          maxLength={200}
        />
        <p className="text-sm text-sds-text-secondary">Current value length: {value.length}</p>
      </div>
    );
  },
};

/**
 * Figma Text Area disabled states (598:2713, 2026-10-05): a disabled textarea
 * shows its value in `text-primary` on `surface-disabled`; in the error state
 * it keeps the danger border. This intentionally differs from Text Field —
 * confirmed 2026-10-06 as intended (each component follows its own Figma) — see textarea.md §13.
 */
export const DisabledStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Textarea aria-label="Disabled empty" disabled />
      <Textarea aria-label="Disabled filled" disabled defaultValue="Disabled with content" />
      <Textarea
        aria-label="Disabled error"
        disabled
        variant="error"
        defaultValue="Disabled in error"
      />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const name of ['Disabled empty', 'Disabled filled', 'Disabled error']) {
      expect(canvas.getByRole('textbox', { name })).toBeDisabled();
    }
    const error = canvas.getByRole('textbox', { name: 'Disabled error' });
    expect(getComputedStyle(error).borderTopColor).toBe(
      tokenColor(error, '--color-sds-border-danger'),
    );
  },
};
