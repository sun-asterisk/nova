import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ChangeEvent } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { TextareaField } from './TextareaField';

const meta = {
  title: 'Components/TextareaField',
  component: TextareaField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A textarea combined with a label, error/support text, a required-field indicator, and an optional live character counter (via `maxLength`). Built on `Textarea`, sharing `useFieldIds` with `TextField` for stable, ARIA-correct label/error/support-text wiring.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error'],
      description: 'Visual style variant of the textarea field',
      table: {
        type: { summary: "'default' | 'error'" },
        defaultValue: { summary: "'default'" },
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the field is disabled and cannot be interacted with',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    label: {
      control: { type: 'text' },
      description: 'Label text displayed above the textarea field',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'ラベル'" },
      },
    },
    required: {
      control: { type: 'boolean' },
      description: 'Whether the field is required. Shows a required indicator next to the label',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    requiredText: {
      control: { type: 'text' },
      description: 'Custom text for the required indicator badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: "'必須'" },
      },
    },
    error: {
      control: { type: 'text' },
      description:
        'Error message to display below the textarea. Replaces supportText when present and forces the error visual variant',
      table: {
        type: { summary: 'string' },
      },
    },
    supportText: {
      control: { type: 'text' },
      description: 'Helper text displayed below the textarea',
      table: {
        type: { summary: 'string' },
      },
    },
    maxLength: {
      control: { type: 'number' },
      description:
        'Maximum character length for the textarea. Shows a live character counter when provided',
      table: {
        type: { summary: 'number' },
      },
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text for the textarea',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof TextareaField>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default state: a label and a placeholder, no adornments or validation. */
export const Default: Story = {
  args: {
    label: 'コメント',
    placeholder: 'コメントを入力してください',
  },
};

/** `required` shows the required-indicator badge next to the label. */
export const Required: Story = {
  args: {
    label: 'メッセージ',
    placeholder: 'メッセージを入力してください',
    required: true,
    supportText: 'このフィールドは必須です',
  },
};

/** `maxLength` renders a live `n / max` character counter below the textarea. */
export const WithCharacterLimit: Story = {
  args: {
    label: '説明',
    placeholder: '説明を入力してください（最大500文字）',
    maxLength: 500,
    supportText: '商品の詳細な説明を入力してください',
  },
};

/** Pre-filled with a `defaultValue` (uncontrolled), showing existing content. */
export const WithDefaultValue: Story = {
  args: {
    label: 'フィードバック',
    placeholder: 'フィードバックを入力してください',
    defaultValue: 'これは既存のテキストです。編集することができます。',
    maxLength: 200,
    required: true,
  },
};

/** `error` replaces `supportText` (if any) and forces the error visual variant regardless of `variant`. */
export const ErrorState: Story = {
  args: {
    label: 'エラーフィールド',
    placeholder: 'テキストを入力してください',
    error: 'このフィールドは必須です',
    required: true,
    value: '',
  },
};

/** The character counter turns to the danger color once the count exceeds `maxLength`, coexisting with an explicit `error`. */
export const ErrorStateWithCharacterLimit: Story = {
  args: {
    label: 'コメント',
    placeholder: 'コメントを入力してください',
    error: '文字数が上限を超えています',
    maxLength: 50,
    defaultValue:
      'このテキストは50文字を超えているため、エラーが表示されます。これは長すぎるテキストの例です。',
    required: true,
  },
};

/** `disabled` blocks interaction while still displaying label, value, and support text. */
export const Disabled: Story = {
  args: {
    label: '無効フィールド',
    placeholder: '入力できません',
    disabled: true,
    defaultValue: 'このフィールドは無効化されています',
    supportText: 'このフィールドは現在編集できません',
  },
};

/** Every optional feature combined: required, character limit, support text, and a larger `rows` count. */
export const AllFeatures: Story = {
  args: {
    label: '詳細情報',
    placeholder: '詳細情報を入力してください',
    required: true,
    maxLength: 300,
    supportText: 'できるだけ詳しく記入してください',
    rows: 6,
  },
};

/** `requiredText` overrides the default Japanese required-indicator text. */
export const CustomRequiredText: Story = {
  args: {
    label: 'カスタム必須フィールド',
    placeholder: 'テキストを入力してください',
    required: true,
    requiredText: 'REQUIRED',
    supportText: 'カスタムの必須テキストを使用',
  },
};

/** The `classNames` slot API reaching the label, support-text, and error parts independently of the root `className` (which only reaches the leaf `<textarea>`). */
export const CustomClassNames: Story = {
  args: {
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
          'Demonstrates the `classNames` prop, which targets the label, supportText, and error parts individually — the root `className` only reaches the leaf `<textarea>`.',
      },
    },
  },
};

/** A fully controlled field with client-side validation deriving `error` from the current value. */
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('');
    const [hasError, setHasError] = useState(false);
    const maxLength = 100;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      setHasError(newValue.length > maxLength || newValue.trim() === '');
    };

    return (
      <div className="w-96">
        <TextareaField
          label="インタラクティブフィールド"
          placeholder="テキストを入力してテストしてください"
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          required
          error={
            hasError
              ? value.trim() === ''
                ? 'このフィールドは必須です'
                : '文字数が上限を超えています'
              : undefined
          }
          supportText="リアルタイムバリデーションのテスト"
          rows={4}
        />
        <div className="mt-4 p-3 bg-sds-surface-secondary-hover rounded text-sm">
          <p>現在の状態:</p>
          <ul className="mt-2 space-y-1">
            <li>
              文字数: {value.length}/{maxLength}
            </li>
            <li>エラー: {hasError ? 'あり' : 'なし'}</li>
            <li>空白: {value.trim() === '' ? 'はい' : 'いいえ'}</li>
          </ul>
        </div>
      </div>
    );
  },
};

/** All meaningfully-different states side by side for visual comparison. */
export const VariantComparison: Story = {
  render: () => (
    <div className="space-y-6">
      <TextareaField
        label="Default State"
        placeholder="デフォルト状態"
        supportText="通常の状態です"
      />
      <TextareaField
        label="Error State"
        placeholder="エラー状態"
        error="エラーメッセージ"
        defaultValue="エラーのあるテキスト"
      />
      <TextareaField
        label="Disabled State"
        placeholder="無効状態"
        disabled
        defaultValue="無効化されたテキスト"
        supportText="編集できません"
      />
    </div>
  ),
};

/** Typing updates the live character counter (`n / max`) in real time. */
export const InteractionCharacterCounter: Story = {
  args: {
    label: '説明',
    placeholder: '説明を入力してください（最大500文字）',
    maxLength: 500,
    supportText: '商品の詳細な説明を入力してください',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('0 / 500')).toBeInTheDocument();

    const textarea = canvas.getByPlaceholderText('説明を入力してください（最大500文字）');
    await userEvent.type(textarea, 'hello');
    await expect(canvas.getByText('5 / 500')).toBeInTheDocument();
  },
};

/** `error` wires `aria-invalid` and `aria-describedby` to the rendered error message. */
export const InteractionErrorWiring: Story = {
  args: {
    label: 'エラーフィールド',
    placeholder: 'テキストを入力してください',
    error: 'このフィールドは必須です',
    required: true,
    value: '',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('テキストを入力してください');
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    await expect(textarea.getAttribute('aria-describedby')).toContain('-error');
    await expect(canvas.getByText('このフィールドは必須です')).toBeInTheDocument();
  },
};
