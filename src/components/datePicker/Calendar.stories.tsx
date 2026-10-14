import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Calendar } from './Calendar';
import type { DatePickerValue } from './DatePicker';

const JAN_2026 = new Date(2026, 0, 1);
const dayButton = (root: HTMLElement, iso: string) =>
  root.querySelector<HTMLButtonElement>(`button[data-day="${iso}"]`)!;

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'An always-visible calendar — the Figma "Date Picker" panel (Style = Single / Range) rendered inline instead of inside `DatePicker`\'s popover. Selection commits immediately through `onValueChange` (no Apply step). Shares the grid, day cells and keyboard navigation with `DatePicker`. As in-page content it shows a `border-weak` boundary instead of the floating shadow.',
      },
    },
  },
  tags: ['autodocs'],
  args: { onValueChange: fn(), defaultMonth: JAN_2026 },
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range'],
      description: 'Selection mode',
      table: { type: { summary: "'single' | 'range'" }, defaultValue: { summary: 'single' } },
    },
    actions: {
      control: 'boolean',
      description:
        'Footer with Today / Clear (Figma "Date Picker Actions"). Both act immediately. `false` hides it; `{ today?, clear? }` toggles each.',
      table: {
        type: { summary: 'boolean | { today?: boolean; clear?: boolean }' },
        defaultValue: { summary: 'true' },
      },
    },
    numberOfMonths: {
      control: 'number',
      description: 'Months shown side by side',
      table: { type: { summary: 'number' }, defaultValue: { summary: '1 (single) / 2 (range)' } },
    },
    minDate: {
      control: 'date',
      description: 'Earliest selectable date',
      table: { type: { summary: 'Date' } },
    },
    maxDate: {
      control: 'date',
      description: 'Latest selectable date',
      table: { type: { summary: 'Date' } },
    },
    'aria-label': {
      control: 'text',
      description: 'Accessible name of the calendar region',
      table: { type: { summary: 'string' }, defaultValue: { summary: '日付選択カレンダー' } },
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single-date selection, uncontrolled. Clicking a day commits it immediately. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('group', { name: '日付選択カレンダー' })).toBeVisible();
    await userEvent.click(dayButton(canvasElement, '2026-01-15'));
    expect(args.onValueChange).toHaveBeenCalledTimes(1);
    expect(dayButton(canvasElement, '2026-01-15').dataset.selected).toBe('true');
  },
};

/** Range selection: two months side by side; two clicks commit `{ from, to }`. */
export const Range: Story = {
  args: { mode: 'range' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(dayButton(canvasElement, '2026-01-10'));
    await userEvent.click(dayButton(canvasElement, '2026-01-14'));
    const last = (args.onValueChange as ReturnType<typeof fn>).mock.calls.at(-1)![0] as {
      from: Date;
      to: Date;
    };
    expect([last.from.getDate(), last.to.getDate()]).toEqual([10, 14]);
  },
};

/** `minDate` / `maxDate` disable days outside the window. */
export const WithMinMax: Story = {
  args: { minDate: new Date(2026, 0, 10), maxDate: new Date(2026, 0, 20) },
  play: async ({ canvasElement }) => {
    expect(dayButton(canvasElement, '2026-01-05')).toBeDisabled();
    expect(dayButton(canvasElement, '2026-01-15')).toBeEnabled();
  },
};

/** `actions={false}`: no footer — just the grid. */
export const WithoutActions: Story = {
  args: { actions: false },
  play: async ({ canvasElement }) => {
    expect(within(canvasElement).queryByRole('button', { name: '今日' })).toBeNull();
  },
};

/** Controlled from outside: Today / Clear and an external button stay in sync. */
export const Controlled: Story = {
  render: function ControlledCalendar(args) {
    const [value, setValue] = useState<DatePickerValue>(new Date(2026, 0, 12));
    return (
      <div className="flex flex-col gap-3 items-start">
        <Calendar {...args} value={value} onValueChange={setValue} />
        <button type="button" onClick={() => setValue(new Date(2026, 0, 25))}>
          Set Jan 25
        </button>
        <output data-testid="value">{value instanceof Date ? value.getDate() : 'none'}</output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'クリア' }));
    expect(canvas.getByTestId('value')).toHaveTextContent('none');
    await userEvent.click(canvas.getByRole('button', { name: 'Set Jan 25' }));
    expect(dayButton(canvasElement, '2026-01-25').dataset.selected).toBe('true');
  },
};

/**
 * In-page panel styling in light and dark: `surface-base` with a `border-weak`
 * boundary and no floating shadow (design-foundation.md §4).
 */
export const InteractionThemes: Story = {
  render: (args) => (
    <div className="flex gap-4">
      {(['light', 'dark'] as const).map((theme) => (
        <div key={theme} data-theme={theme} className="p-sds-200 bg-sds-background-base">
          <Calendar {...args} aria-label={`Calendar ${theme}`} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const theme of ['light', 'dark']) {
      const panel = within(canvasElement).getByRole('group', { name: `Calendar ${theme}` });
      const cs = getComputedStyle(panel);
      expect(cs.backgroundColor).toBe(tokenColor(panel, '--color-sds-surface-base'));
      expect(cs.borderTopColor).toBe(tokenColor(panel, '--color-sds-border-weak'));
      expect(cs.boxShadow).toBe('none');
    }
  },
};
