import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { addDays } from 'date-fns';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { DatePicker, type DatePickerValue } from './DatePicker';

// `data-day` is a LOCAL `yyyy-MM-dd` date (see DatePickerDayButton.tsx).
// `new Date('yyyy-MM-dd')` would parse it as UTC midnight, which is the
// previous local day in any UTC- timezone — parse the fields locally instead.
const parseLocalDay = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "Date field + calendar popover (Figma Date Picker 11864:19561). Click a day, or type a date straight into the field (commits on Enter/blur). Range mode has start and end fields with Figma's re-selection rules. Calendar selections are a draft until Apply; Escape or an outside click discards them.",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'range'],
      description: 'Selection mode of the date picker',
      table: {
        type: { summary: "'single' | 'range'" },
        defaultValue: { summary: 'single' },
      },
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder shown when no value is selected',
      table: {
        type: { summary: 'string' },
      },
    },
    actions: {
      control: 'boolean',
      description:
        'Footer action bar (Today/Clear/Apply). `true` shows all three, `false` hides the footer entirely, or pass `{ today?, clear?, apply? }` to control them individually.',
      table: {
        type: { summary: 'boolean | { today?: boolean; clear?: boolean; apply?: boolean }' },
        defaultValue: { summary: 'true' },
      },
    },
    numberOfMonths: {
      control: 'number',
      description: 'Number of months visible in calendar',
      table: {
        type: { summary: 'number' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
      table: {
        type: { summary: 'boolean' },
      },
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Uncontrolled single-date selection with the default footer (Today/Clear/Apply). */
export const Single: Story = {
  args: {
    mode: 'single',
    placeholder: '日付を選択',
    actions: true,
    defaultValue: new Date(),
  },
};

/** Uncontrolled range selection (`from`/`to`) with the default footer. */
export const Range: Story = {
  args: {
    mode: 'range',
    'aria-label': '予約期間',
    actions: true,
    defaultValue: {
      from: new Date(),
      to: addDays(new Date(), 4),
    },
  },
};

/** `actions={false}` commits the selected value immediately, with no footer bar at all. */
export const WithoutActions: Story = {
  args: {
    mode: 'single',
    placeholder: '日付を選択',
    actions: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Select a date and it is applied immediately without footer actions.',
      },
    },
  },
};

/**
 * `actions` as an object selectively shows/hides individual footer buttons
 * — the replacement for the removed `showTodayAction`/`showClearAction`/
 * `showApplyAction` booleans (2026-09-07 breaking-change API redesign).
 */
export const SelectiveActions: Story = {
  args: {
    mode: 'single',
    placeholder: '日付を選択',
    actions: { today: false, clear: true, apply: true },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Passing an object to `actions` hides individual buttons — here the Today button is omitted while Clear/Apply remain.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'カレンダーを開く' }));

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');
    await expect(body.queryByRole('button', { name: '今日' })).not.toBeInTheDocument();
    await expect(body.getByRole('button', { name: 'クリア' })).toBeInTheDocument();
    await expect(body.getByRole('button', { name: '適用' })).toBeInTheDocument();
  },
};

/** Range mode without footer actions — the value commits directly while selecting. */
export const RangeWithoutActions: Story = {
  args: {
    mode: 'range',
    'aria-label': '予約期間',
    actions: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Range mode without footer actions. Value is committed directly while selecting.',
      },
    },
  },
};

/** `disabled` disables the field and its calendar button; the popover cannot be opened. */
export const Disabled: Story = {
  args: {
    mode: 'single',
    placeholder: '日付を選択',
    disabled: true,
  },
};

/** Fully controlled via `value`/`onValueChange` — the picker itself holds no selection state. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<DatePickerValue>({
      from: new Date(),
      to: addDays(new Date(), 3),
    });

    return (
      <div className="w-[520px] space-y-2">
        <DatePicker mode="range" aria-label="予約期間" value={value} onValueChange={setValue} />
        <p className="typo-body-s text-sds-text-secondary">
          Current Value: {JSON.stringify(value)}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Controlled example using external state with onValueChange callback.',
      },
    },
  },
};

/** Picking a day only updates the in-progress draft — `onValueChange` fires only after Apply is clicked. */
export const InteractionDraftNotCommittedUntilApply: Story = {
  args: {
    mode: 'single',
    placeholder: '日付を選択',
    actions: true,
    onValueChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'カレンダーを開く' }));

    const body = within(canvasElement.ownerDocument.body);

    // Clear starts disabled — no draft value has been picked yet.
    await expect(body.getByRole('button', { name: 'クリア' })).toBeDisabled();

    // Picking a day only updates the in-progress draft, not the committed
    // value — onValueChange must not fire before Apply is clicked.
    const dayButtons = body.getAllByRole('button', { name: /\d{4}$/ });
    await userEvent.click(dayButtons[Math.floor(dayButtons.length / 2)]);

    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(body.getByRole('button', { name: 'クリア' })).toBeEnabled();

    await userEvent.click(body.getByRole('button', { name: '適用' }));
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

/**
 * Regression coverage for three real, confirmed bugs found and fixed during
 * the 2026-09-07 Figma-fidelity audit (see docs/components/datePicker.md §7
 * and .claude/rules/design-foundation.md §5.1): (1) day cells had no visible
 * focus ring at all (tailwind-merge dropped a bare `outline` next to
 * `outline-2`, and an unconditional `outline-none` permanently suppressed
 * it), (2) day cell corner radius was 4px instead of Figma's measured 8px,
 * (3) the focus ring visibly animated from the day's own text color to the
 * correct blue over ~300ms because `transition-all` included `outline-color`
 * in its transitioned properties. All three are asserted together here so a
 * regression in any of them fails this story.
 */
export const InteractionFocusRingIntegrity: Story = {
  args: {
    mode: 'single',
    placeholder: '日付を選択',
  },
  play: async ({ canvasElement }) => {
    // Keyboard only — :focus-visible's heuristic differs between keyboard
    // and pointer focus: Tab into the field, ArrowDown opens the calendar
    // and moves focus to the grid, ArrowRight moves to another day.
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');
    const doc = canvasElement.ownerDocument;
    await waitFor(() => expect(doc.activeElement?.hasAttribute('data-day')).toBe(true));
    await userEvent.keyboard('{ArrowRight}');
    const dayEl = doc.activeElement as HTMLElement;
    if (!dayEl?.hasAttribute('data-day')) throw new Error('Focus is not on a day cell');

    const win = canvasElement.ownerDocument.defaultView!;
    const cs = win.getComputedStyle(dayEl);
    const expectedFocusColor = win
      .getComputedStyle(canvasElement.ownerDocument.documentElement)
      .getPropertyValue('--color-sds-border-focus')
      .trim();

    // Bug #1 (missing ring) + #3 (wrong-color flash): outline-color must
    // already equal the real border-focus token immediately after focus,
    // not the element's own currentColor.
    await expect(dayEl.matches(':focus-visible')).toBe(true);
    await expect(cs.outlineStyle).toBe('solid');
    await expect(cs.outlineWidth).toBe('2px');

    // Bug #2 (wrong radius): Figma measures 8px (radius-200) for a focused
    // day cell, not the old 4px (radius-100).
    await expect(cs.borderRadius).toBe('8px');

    // Bug #3's root cause: `transition-property` must not include
    // `outline-color`, or the ring will visibly animate in from the wrong
    // color on every keyboard move even though the *final* color is correct.
    await expect(cs.transitionProperty).not.toContain('outline-color');

    // Resolve the CSS custom property the same way the browser does, so
    // this assertion holds in both light and dark themes.
    if (expectedFocusColor) {
      const probe = canvasElement.ownerDocument.createElement('div');
      probe.style.color = expectedFocusColor;
      canvasElement.ownerDocument.body.appendChild(probe);
      const resolved = win.getComputedStyle(probe).color;
      probe.remove();
      await expect(cs.outlineColor).toBe(resolved);
    }
  },
};

/**
 * Range mode renders 2 months in one DayPicker instance. Verifies keyboard
 * Tab order actually reaches the second month's nav button and day cells
 * (not just the first), and — since this leaves the popover open when axe
 * scans, like `InteractionFocusRingIntegrity` above — exercises the
 * range_start/range_middle/range_end color states for contrast violations
 * that Single mode's stories never render.
 */
export const InteractionRangeKeyboardFlow: Story = {
  args: {
    mode: 'range',
    'aria-label': '予約期間',
    defaultValue: { from: addDays(new Date(), 1), to: addDays(new Date(), 5) },
  },
  play: async ({ canvasElement }) => {
    // Keyboard only: Tab into the start field, ArrowDown opens the calendar
    // with focus on the grid's single roving day.
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');

    const body = within(canvasElement.ownerDocument.body);
    await body.findByRole('dialog');

    // react-day-picker implements the 2-month grid as ONE composite widget
    // with a single roving tabIndex=0 cell across BOTH months (the correct
    // ARIA composite-grid pattern) — Tab enters/exits the whole grid once,
    // and Arrow keys move the cursor, including across the month boundary.
    const doc = canvasElement.ownerDocument;
    await waitFor(() => expect(doc.activeElement?.hasAttribute('data-day')).toBe(true));
    const dayEl = doc.activeElement as HTMLElement;
    const startMonth = parseLocalDay(dayEl.getAttribute('data-day')!).getMonth();

    // ...then confirm ArrowRight moves the cursor far enough to cross into
    // the second visible month (not just within the first). This is a
    // regression test for a real, confirmed bug found and fixed during the
    // 2026-09-07 audit: react-day-picker's own default `DayButton` calls
    // `ref.current?.focus()` in a `useEffect` keyed on `modifiers.focused`
    // (arrow-key navigation only updates which day IS that target in React
    // state — it never moves DOM focus itself). `DatePickerDayButton`
    // replaced the default `DayButton` for styling without replicating that
    // effect, so ArrowLeft/Right/Up/Down/Home/End/PageUp/PageDown were
    // completely non-functional — confirmed via a neutral, non-Storybook
    // browser + real keyboard presses (`document.activeElement` never
    // changed across 10 ArrowRight presses before the fix).
    let reachedSecondMonth = false;
    for (let i = 0; i < 45 && !reachedSecondMonth; i++) {
      await userEvent.keyboard('{ArrowRight}');
      const active = canvasElement.ownerDocument.activeElement;
      const day = active instanceof HTMLElement ? active.getAttribute('data-day') : null;
      if (day && parseLocalDay(day).getMonth() !== startMonth) reachedSecondMonth = true;
    }
    await expect(reachedSecondMonth).toBe(true);
  },
};

/**
 * Regression coverage for the controlled "reset" transition (e.g. a form
 * reset): the idiomatic controlled pattern starts EMPTY
 * (`useState<DatePickerValue>()`). Before the fix, DatePicker treated
 * `value === undefined` as "uncontrolled", so the first commit also wrote
 * into its internal fallback state, and clearing the controlled value back
 * to `undefined` re-displayed that stale date instead of the placeholder.
 */
export const InteractionControlledReset: Story = {
  render: () => {
    function ControlledReset() {
      const [value, setValue] = useState<DatePickerValue>();
      return (
        <div className="space-y-2">
          <DatePicker
            mode="single"
            value={value}
            onValueChange={setValue}
            placeholder="日付を選択"
          />
          <button type="button" onClick={() => setValue(undefined)}>
            Reset
          </button>
        </div>
      );
    }
    return <ControlledReset />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'カレンダーを開く' }));

    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(await body.findByRole('button', { name: '今日' }));
    await userEvent.click(body.getByRole('button', { name: '適用' }));
    await expect(canvas.getByRole('textbox')).not.toHaveValue('');

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(canvas.getByRole('textbox')).toHaveValue('');
  },
};

/** Clicking Today sets the draft to today's date, then Apply commits it and clears the trigger's placeholder. */
export const InteractionSelectToday: Story = {
  args: {
    mode: 'single',
    placeholder: '日付を選択',
    actions: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('textbox'));

    const body = within(canvasElement.ownerDocument.body);
    const todayButton = await body.findByRole('button', { name: '今日' });
    await userEvent.click(todayButton);

    const applyButton = body.getByRole('button', { name: '適用' });
    await userEvent.click(applyButton);

    const today = new Date();
    await expect(canvas.getByRole('textbox')).toHaveValue(
      new Intl.DateTimeFormat('ja-JP', { dateStyle: 'long' }).format(today),
    );
  },
};

/**
 * Regression coverage for Phase X's overlay `container` convention (§4.1 /
 * §1.3): the popover's portal must mount inside a consumer-supplied
 * `container` instead of the default `document.body` — needed so
 * `ThemeProvider`'s `scoped` mode can redirect it into the scoped subtree.
 * Asserts the popover content is a DOM descendant of the custom container
 * and NOT a direct `document.body` child, proving `container` actually
 * changes where Radix portals — not just that the prop is accepted.
 */
export const InteractionCustomContainer: Story = {
  render: () => {
    function WithCustomContainer() {
      const [container, setContainer] = useState<HTMLDivElement | null>(null);
      return (
        <div>
          <p style={{ marginBottom: 4 }}>Portal target below (dashed border):</p>
          <div
            ref={setContainer}
            data-testid="custom-portal-container"
            style={{ border: '2px dashed red', padding: 8, minHeight: 24 }}
          />
          <DatePicker container={container ?? undefined} placeholder="日付を選択" />
        </div>
      );
    }
    return <WithCustomContainer />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'カレンダーを開く' }));

    const customContainer = canvas.getByTestId('custom-portal-container');
    const todayButton = await within(customContainer).findByRole('button', { name: '今日' });

    expect(customContainer.contains(todayButton)).toBe(true);
  },
};

/**
 * SC-07 (2026-09-29): the calendar popover's accessible name defaults to
 * `日付選択カレンダー` and is overridable via `calendarLabel` (for non-Japanese
 * UIs). Asserts both the default and the override on the real `role="dialog"`.
 */
export const InteractionCalendarLabel: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <DatePicker placeholder="Default label" />
      <DatePicker placeholder="Custom label" calendarLabel="Choose a date" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const [defaultButton, customButton] = canvas.getAllByRole('button', {
      name: 'カレンダーを開く',
    });
    await userEvent.click(defaultButton);
    expect(await body.findByRole('dialog', { name: '日付選択カレンダー' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(customButton);
    expect(await body.findByRole('dialog', { name: 'Choose a date' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
  },
};

/**
 * Figma 設計の原則: keyboard direct input for experienced users. A typed date
 * commits on Enter (or blur) without Apply and is normalized to the display
 * format; text that is not a valid, selectable date reverts.
 */
export const InteractionTypedInput: Story = {
  args: {
    'aria-label': 'お届け希望日',
    onValueChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const field = canvas.getByRole('textbox', { name: 'お届け希望日' });

    await userEvent.type(field, '2026/3/14{Enter}');
    await expect(args.onValueChange).toHaveBeenCalledWith(new Date(2026, 2, 14));
    await expect(field).toHaveValue('2026年3月14日');

    await userEvent.clear(field);
    await userEvent.type(field, '2026/2/30');
    await userEvent.tab();
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(field).toHaveValue('2026年3月14日');
  },
};

/**
 * Figma 確定後の再編集: clicking the end field enters end re-selection — a day
 * before the start becomes the new start and the end waits (Apply disabled
 * until it is picked). Days are picked with the keyboard (ArrowDown from the
 * field enters the grid; arrows + Enter); pointer clicks on days for the same
 * flow are covered by DatePicker.test.tsx with real Playwright input.
 */
export const InteractionRangeReselectEnd: Story = {
  args: {
    mode: 'range',
    'aria-label': '予約期間',
    defaultValue: { from: new Date(2026, 0, 10), to: new Date(2026, 0, 20) },
    onValueChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const doc = canvasElement.ownerDocument;
    const focusedDay = () => doc.activeElement?.getAttribute('data-day');

    const endField = canvas.getByRole('textbox', { name: '終了日' });
    await userEvent.click(endField);
    await body.findByRole('dialog');
    // Focus stays in the field (typing remains possible) until ArrowDown.
    await expect(doc.activeElement).toBe(endField);

    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(focusedDay()).toBe('2026-01-10'));
    // Jan 10 → Jan 5, before the start: becomes the new start.
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{Enter}');
    await expect(focusedDay()).toBe('2026-01-05');
    await expect(body.getByRole('button', { name: '適用' })).toBeDisabled();

    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}{Enter}');
    await userEvent.click(body.getByRole('button', { name: '適用' }));
    await expect(args.onValueChange).toHaveBeenCalledWith({
      from: new Date(2026, 0, 5),
      to: new Date(2026, 0, 8),
    });
    await expect(canvas.getByRole('textbox', { name: '開始日' })).toHaveValue('2026年1月5日');
    await expect(endField).toHaveValue('2026年1月8日');
  },
};

/** `aria-invalid` shows the Text Field error border; pair it with `aria-describedby` → error text. */
export const Invalid: Story = {
  render: () => (
    <div className="w-[320px] space-y-1">
      <label htmlFor="due" className="typo-label-m-bold text-sds-text-primary">
        お届け希望日
      </label>
      <DatePicker id="due" aria-invalid aria-describedby="due-error" />
      <p id="due-error" className="typo-body-s text-sds-text-danger">
        日付を選択してください
      </p>
    </div>
  ),
};
