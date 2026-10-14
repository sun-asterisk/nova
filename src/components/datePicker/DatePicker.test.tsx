import '../../App.css';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import { tokenColor } from '../../../.storybook/tokenColor';
import { createRef, useState } from 'react';
import { DatePicker } from './DatePicker';
import { DatePickerButton } from './DatePickerButton';
import { DatePickerDayButton } from './DatePickerDayButton';
import type { CalendarDay, Modifiers } from 'react-day-picker';

// Unit coverage for DatePicker: the controlled/uncontrolled value model, ref
// forwarding, the minDate/maxDate auto-clear effect, typed input, and (since
// 2026-10-07) the popover flows. The popover was once kept out of this file
// because react-day-picker threw under the `unit` project; that no longer
// reproduces (Calendar.test.tsx renders the same grid here), so the Figma
// range/Today/re-selection flows are asserted below as well as in stories.
describe('DatePicker', () => {
  const input = () => screen.getByRole('textbox') as HTMLInputElement;

  it('forwards a ref to the date input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<DatePicker ref={ref} />);
    expect(ref.current).toBe(input());
  });

  it('forwards a ref to the start input in range mode', () => {
    const ref = createRef<HTMLInputElement>();
    render(<DatePicker mode="range" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('textbox', { name: '開始日' }));
  });

  it('reflects a controlled value in the field', () => {
    render(<DatePicker mode="single" value={new Date(2026, 0, 15)} />);
    expect(input()).toHaveValue('2026年1月15日');
  });

  it('shows the placeholder while uncontrolled with no value', () => {
    render(<DatePicker placeholder="日付を選択" />);
    expect(input()).toHaveValue('');
    expect(input()).toHaveAttribute('placeholder', '日付を選択');
  });

  it('clears a value that becomes disabled after minDate/maxDate tighten', () => {
    function Harness() {
      const [minDate, setMinDate] = useState<Date | undefined>(undefined);
      return (
        <>
          <DatePicker
            mode="single"
            defaultValue={new Date(2026, 0, 1)}
            minDate={minDate}
            onValueChange={() => {}}
          />
          <button onClick={() => setMinDate(new Date(2026, 0, 10))}>tighten</button>
        </>
      );
    }
    render(<Harness />);
    expect(input()).toHaveValue('2026年1月1日');

    fireEvent.click(screen.getByText('tighten'));

    // The previously-selected Jan 1 is now before minDate (Jan 10) — the
    // value must be cleared back to the placeholder rather than silently
    // shown as both "selected" and "disabled".
    expect(input()).toHaveValue('');
  });

  it('does not auto-clear a value that remains valid after minDate/maxDate change', () => {
    function Harness() {
      const [minDate, setMinDate] = useState<Date | undefined>(undefined);
      return (
        <>
          <DatePicker
            mode="single"
            defaultValue={new Date(2026, 0, 15)}
            minDate={minDate}
            onValueChange={() => {}}
          />
          <button onClick={() => setMinDate(new Date(2026, 0, 10))}>tighten</button>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText('tighten'));

    // Jan 15 is still after minDate (Jan 10) — must not be cleared.
    expect(input()).toHaveValue('2026年1月15日');
  });

  it('disabled DatePicker disables the input and the calendar button', () => {
    render(<DatePicker disabled />);
    expect(input()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'カレンダーを開く' })).toBeDisabled();
  });

  it('formats the field using formatLocale', () => {
    render(<DatePicker mode="single" value={new Date(2026, 0, 15)} formatLocale="en-US" />);
    expect(input()).toHaveValue('January 15, 2026');
  });

  it('defaults formatLocale to ja-JP', () => {
    render(<DatePicker mode="single" value={new Date(2026, 0, 15)} />);
    expect(input()).toHaveValue('2026年1月15日');
  });

  // Controlled -> "cleared" transition (form reset). Once `value` is passed
  // as a prop at all, DatePicker is controlled — `value={undefined}` means
  // "controlled, empty", NOT "fall back to internal/default state". Before
  // the fix (`isControlled = value !== undefined`) clearing a controlled
  // value re-displayed `defaultValue`/stale internal state instead of the
  // placeholder. The realistic, popover-driven variant of this bug lives in
  // DatePicker.stories.tsx:InteractionControlledReset.
  it('shows the placeholder when a controlled value is cleared to undefined (A -> B -> undefined)', () => {
    const { rerender } = render(
      <DatePicker mode="single" value={new Date(2026, 0, 1)} defaultValue={new Date(2025, 5, 5)} />,
    );
    expect(input()).toHaveValue('2026年1月1日');

    rerender(
      <DatePicker mode="single" value={new Date(2026, 0, 2)} defaultValue={new Date(2025, 5, 5)} />,
    );
    expect(input()).toHaveValue('2026年1月2日');

    rerender(<DatePicker mode="single" value={undefined} defaultValue={new Date(2025, 5, 5)} />);
    expect(input()).toHaveValue('');
  });

  it('falls back to its own internal state when the value prop is removed entirely (controlled -> uncontrolled)', () => {
    const { rerender } = render(
      <DatePicker mode="single" value={new Date(2026, 0, 1)} defaultValue={new Date(2025, 5, 5)} />,
    );
    rerender(<DatePicker mode="single" defaultValue={new Date(2025, 5, 5)} />);
    // Uncontrolled again: internal state (initialized from defaultValue at
    // mount) is what's shown.
    expect(input()).toHaveValue('2025年6月5日');
  });
});

// Figma 設計の原則: keyboard direct input. A typed date commits on Enter or
// blur without Apply; text that is not a valid, selectable date reverts.
// (Typing never opens the popover, so these run in the unit project.)
describe('DatePicker typed input', () => {
  const type = (el: HTMLElement, text: string) => fireEvent.change(el, { target: { value: text } });

  it('commits a typed date on Enter and normalizes the text', () => {
    const onValueChange = vi.fn();
    render(<DatePicker onValueChange={onValueChange} />);
    const field = screen.getByRole('textbox');
    type(field, '2026/3/14');
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 2, 14));
    expect(field).toHaveValue('2026年3月14日');
  });

  it('commits a typed date on blur', () => {
    const onValueChange = vi.fn();
    render(<DatePicker onValueChange={onValueChange} />);
    const field = screen.getByRole('textbox');
    type(field, '20260314');
    fireEvent.blur(field);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 2, 14));
  });

  it('reverts an impossible date without committing', () => {
    const onValueChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} onValueChange={onValueChange} />);
    const field = screen.getByRole('textbox');
    type(field, '2026/2/30');
    fireEvent.blur(field);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(field).toHaveValue('2026年1月15日');
  });

  it('reverts a date outside minDate/maxDate without committing', () => {
    const onValueChange = vi.fn();
    render(<DatePicker minDate={new Date(2026, 0, 10)} onValueChange={onValueChange} />);
    const field = screen.getByRole('textbox');
    type(field, '2026/1/5');
    fireEvent.keyDown(field, { key: 'Enter' });
    expect(onValueChange).not.toHaveBeenCalled();
    expect(field).toHaveValue('');
  });

  it('clearing the text clears the value', () => {
    const onValueChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} onValueChange={onValueChange} />);
    const field = screen.getByRole('textbox');
    type(field, '');
    fireEvent.blur(field);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(undefined);
  });

  it('Escape restores the committed text', () => {
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} />);
    const field = screen.getByRole('textbox');
    type(field, '2026/2/');
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field).toHaveValue('2026年1月15日');
  });

  it('does not fire onValueChange when the text is unchanged', () => {
    const onValueChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} onValueChange={onValueChange} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  describe('range', () => {
    const start = () => screen.getByRole('textbox', { name: '開始日' });
    const end = () => screen.getByRole('textbox', { name: '終了日' });

    it('typing the start then the end commits the range', () => {
      const onValueChange = vi.fn();
      render(<DatePicker mode="range" onValueChange={onValueChange} />);
      type(start(), '2026/1/10');
      fireEvent.blur(start());
      type(end(), '2026/1/20');
      fireEvent.blur(end());
      expect(onValueChange).toHaveBeenLastCalledWith({
        from: new Date(2026, 0, 10),
        to: new Date(2026, 0, 20),
      });
      expect(end()).toHaveValue('2026年1月20日');
    });

    it('an end before the start becomes the new start and clears the end', () => {
      const onValueChange = vi.fn();
      render(
        <DatePicker
          mode="range"
          defaultValue={{ from: new Date(2026, 0, 10), to: new Date(2026, 0, 20) }}
          onValueChange={onValueChange}
        />,
      );
      type(end(), '2026/1/5');
      fireEvent.blur(end());
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith({
        from: new Date(2026, 0, 5),
        to: undefined,
      });
      expect(start()).toHaveValue('2026年1月5日');
      expect(end()).toHaveValue('');
    });

    it('a start after the end clears the end', () => {
      const onValueChange = vi.fn();
      render(
        <DatePicker
          mode="range"
          defaultValue={{ from: new Date(2026, 0, 10), to: new Date(2026, 0, 20) }}
          onValueChange={onValueChange}
        />,
      );
      type(start(), '2026/1/25');
      fireEvent.keyDown(start(), { key: 'Enter' });
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith({
        from: new Date(2026, 0, 25),
        to: undefined,
      });
    });
  });
});

// SC-04 (2026-09-29): field semantics must land on the date input — the
// focusable form control — not on react-day-picker's calendar root (which
// isn't even rendered until the popover opens).
describe('DatePicker field semantics', () => {
  it('forwards id so a <label htmlFor> labels the input', () => {
    render(
      <>
        <label htmlFor="due">Due date</label>
        <DatePicker id="due" />
      </>,
    );
    const field = screen.getByRole('textbox', { name: 'Due date' });
    expect(field).toHaveAttribute('id', 'due');
  });

  it('forwards aria-label / aria-labelledby to the input', () => {
    const { rerender } = render(<DatePicker aria-label="Start date" />);
    expect(screen.getByRole('textbox', { name: 'Start date' })).toBeInTheDocument();
    rerender(
      <>
        <span id="lbl">End date</span>
        <DatePicker aria-labelledby="lbl" />
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'End date' })).toBeInTheDocument();
  });

  it('forwards aria-invalid and aria-describedby so an error message is associated', () => {
    render(
      <>
        <DatePicker aria-label="Due" aria-invalid aria-describedby="due-error" />
        <p id="due-error">Pick a date in the future</p>
      </>,
    );
    const field = screen.getByRole('textbox', { name: 'Due' });
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Pick a date in the future');
  });

  it('shows the error border while aria-invalid', () => {
    const { container } = render(<DatePicker aria-label="Due" aria-invalid />);
    expect(container.querySelector('[data-slot="date-picker-field"]')).toHaveClass(
      'border-sds-border-danger',
    );
  });

  it('does not add field attributes when none are passed', () => {
    render(<DatePicker />);
    const field = screen.getByRole('textbox');
    expect(field).not.toHaveAttribute('id');
    expect(field).not.toHaveAttribute('aria-invalid');
    expect(field).not.toHaveAttribute('aria-describedby');
  });

  it('range: names the group and both inputs; describes both', () => {
    render(
      <>
        <DatePicker
          mode="range"
          id="stay"
          aria-label="予約期間"
          aria-invalid
          aria-describedby="stay-error"
        />
        <p id="stay-error">期間を選択してください</p>
      </>,
    );
    expect(screen.getByRole('group', { name: '予約期間' })).toBeInTheDocument();
    const start = screen.getByRole('textbox', { name: '開始日' });
    const end = screen.getByRole('textbox', { name: '終了日' });
    expect(start).toHaveAttribute('id', 'stay');
    for (const field of [start, end]) {
      expect(field).toHaveAttribute('aria-invalid', 'true');
      expect(field).toHaveAccessibleDescription('期間を選択してください');
    }
  });

  it('the calendar button announces a dialog popup', () => {
    render(<DatePicker />);
    const button = screen.getByRole('button', { name: 'カレンダーを開く' });
    expect(button).toHaveAttribute('aria-haspopup', 'dialog');
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});

const dayButton = (iso: string) =>
  document.querySelector<HTMLButtonElement>(`[role="dialog"] button[data-day="${iso}"]`)!;
const dialog = () => screen.findByRole('dialog');
const footer = (name: string) =>
  within(document.querySelector('[role="dialog"]')!).getByRole('button', { name });

describe('DatePicker popover', () => {
  it('clicking the field opens the calendar and keeps focus (and typing) in the field', async () => {
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} />);
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await dialog();
    await new Promise(requestAnimationFrame);
    expect(document.activeElement).toBe(field);
  });

  it('opens on the month of the selected date', async () => {
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} />);
    await userEvent.click(screen.getByRole('textbox'));
    await dialog();
    expect(dayButton('2026-01-15').dataset.selected).toBe('true');
  });

  it('the calendar button moves focus to the roving day of the grid', async () => {
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} />);
    await userEvent.click(screen.getByRole('button', { name: 'カレンダーを開く' }));
    await dialog();
    await vi.waitFor(() => expect(document.activeElement).toBe(dayButton('2026-01-15')));
  });

  it('ArrowDown in the field opens the calendar and moves focus into the grid', async () => {
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} />);
    screen.getByRole('textbox').focus();
    await userEvent.keyboard('{ArrowDown}');
    await dialog();
    await vi.waitFor(() => expect(document.activeElement).toBe(dayButton('2026-01-15')));
  });

  it('Escape discards the draft', async () => {
    const onValueChange = vi.fn();
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('textbox'));
    await dialog();
    await userEvent.click(dayButton('2026-01-20'));
    await userEvent.keyboard('{Escape}');
    await vi.waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox')).toHaveValue('2026年1月15日');
  });

  it('typing a date while open moves the calendar to that month', async () => {
    render(<DatePicker defaultValue={new Date(2026, 0, 15)} />);
    const field = screen.getByRole('textbox');
    await userEvent.click(field);
    await dialog();
    fireEvent.change(field, { target: { value: '2026/5/3' } });
    await vi.waitFor(() => expect(dayButton('2026-05-03')).toBeTruthy());
  });

  it('Clear is enabled as soon as the draft has a date, Apply commits it', async () => {
    const onValueChange = vi.fn();
    render(<DatePicker defaultMonth={new Date(2026, 0, 1)} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('textbox'));
    await dialog();
    expect(footer('クリア')).toBeDisabled();
    expect(footer('適用')).toBeDisabled();
    await userEvent.click(dayButton('2026-01-20'));
    expect(footer('クリア')).toBeEnabled();
    await userEvent.click(footer('適用'));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(new Date(2026, 0, 20));
  });

  // One month per picker: the unit viewport is too narrow for two.
  describe('range (Figma 期間選択の制御フロー)', () => {
    const range = { from: new Date(2026, 0, 10), to: new Date(2026, 0, 20) };

    it('an earlier 2nd click replaces the start; the same day confirms a one-day range', async () => {
      const onValueChange = vi.fn();
      render(
        <DatePicker
          mode="range"
          numberOfMonths={1}
          defaultMonth={new Date(2026, 0, 1)}
          onValueChange={onValueChange}
        />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'カレンダーを開く' }));
      await dialog();
      await userEvent.click(dayButton('2026-01-10'));
      await userEvent.click(dayButton('2026-01-05'));
      expect(footer('適用')).toBeDisabled();
      expect(dayButton('2026-01-05').dataset.selected).toBe('true');
      expect(dayButton('2026-01-10').dataset.selected).not.toBe('true');
      await userEvent.click(dayButton('2026-01-05'));
      await userEvent.click(footer('適用'));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith({
        from: new Date(2026, 0, 5),
        to: new Date(2026, 0, 5),
      });
    });

    it('Today sets today as the start and clears the end (Apply waits for the end)', async () => {
      render(<DatePicker mode="range" numberOfMonths={1} defaultValue={range} />);
      await userEvent.click(screen.getByRole('button', { name: 'カレンダーを開く' }));
      await dialog();
      await userEvent.click(footer('今日'));
      expect(footer('適用')).toBeDisabled();
      const today = new Date();
      const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      expect(dayButton(iso).dataset.selected).toBe('true');
    });

    it('end field: a day before the start becomes the new start and the end waits', async () => {
      const onValueChange = vi.fn();
      render(
        <DatePicker
          mode="range"
          numberOfMonths={1}
          defaultValue={range}
          onValueChange={onValueChange}
        />,
      );
      await userEvent.click(screen.getByRole('textbox', { name: '終了日' }));
      await dialog();
      await userEvent.click(dayButton('2026-01-05'));
      expect(footer('適用')).toBeDisabled();
      await userEvent.click(dayButton('2026-01-08'));
      await userEvent.click(footer('適用'));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith({
        from: new Date(2026, 0, 5),
        to: new Date(2026, 0, 8),
      });
    });

    it('start field: a day before the end updates only the start', async () => {
      const onValueChange = vi.fn();
      render(
        <DatePicker
          mode="range"
          numberOfMonths={1}
          defaultValue={range}
          onValueChange={onValueChange}
        />,
      );
      await userEvent.click(screen.getByRole('textbox', { name: '開始日' }));
      await dialog();
      await userEvent.click(dayButton('2026-01-12'));
      await userEvent.click(footer('適用'));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith({
        from: new Date(2026, 0, 12),
        to: new Date(2026, 0, 20),
      });
    });

    it('end field: a day after the start updates only the end', async () => {
      const onValueChange = vi.fn();
      render(
        <DatePicker
          mode="range"
          numberOfMonths={1}
          defaultValue={range}
          onValueChange={onValueChange}
        />,
      );
      await userEvent.click(screen.getByRole('textbox', { name: '終了日' }));
      await dialog();
      await userEvent.click(dayButton('2026-01-25'));
      await userEvent.click(footer('適用'));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith({
        from: new Date(2026, 0, 10),
        to: new Date(2026, 0, 25),
      });
    });

    it('switching between the two fields keeps the calendar (and its draft) open', async () => {
      const onValueChange = vi.fn();
      render(
        <DatePicker
          mode="range"
          numberOfMonths={1}
          defaultValue={range}
          onValueChange={onValueChange}
        />,
      );
      await userEvent.click(screen.getByRole('textbox', { name: '開始日' }));
      const panel = await dialog();
      await userEvent.click(dayButton('2026-01-12'));
      await userEvent.click(screen.getByRole('textbox', { name: '終了日' }));
      // Same panel, never dismissed: a close + reopen would reset the draft.
      expect(screen.getByRole('dialog')).toBe(panel);
      await userEvent.click(footer('適用'));
      expect(onValueChange).toHaveBeenCalledExactlyOnceWith({
        from: new Date(2026, 0, 12),
        to: new Date(2026, 0, 20),
      });
    });
  });

  // Figma デザイン仕様: Surface/Base, radius 16, Elevation Lv.2, no border,
  // 4px under the field; footer Border/Weak + padding 16.
  it.each(['light', 'dark'] as const)('popover matches the Figma panel (%s)', async (theme) => {
    render(
      <div data-theme={theme}>
        <DatePicker defaultValue={new Date(2026, 0, 15)} container={undefined} />
      </div>,
    );
    await userEvent.click(screen.getByRole('textbox'));
    const panel = await dialog();
    // Measure after the zoom-in entry animation (its 95% scale skews rects).
    await Promise.all(panel.getAnimations().map((animation) => animation.finished));
    const cs = getComputedStyle(panel);
    expect(cs.borderTopWidth).toBe('0px');
    expect(cs.borderTopLeftRadius).toBe('16px');
    expect(cs.backgroundColor).toBe(tokenColor(panel, '--color-sds-surface-base'));
    const probe = document.createElement('div');
    probe.className = 'shadow-sds-level-2';
    panel.appendChild(probe);
    expect(cs.boxShadow).toBe(getComputedStyle(probe).boxShadow);
    probe.remove();
    expect(panel.getBoundingClientRect().width).toBe(312);
    const fieldRect = document
      .querySelector('[data-slot="date-picker-field"]')!
      .getBoundingClientRect();
    expect(Math.round(panel.getBoundingClientRect().top - fieldRect.bottom)).toBe(4);
    const footerEl = footer('適用').closest('.border-t')!;
    expect(getComputedStyle(footerEl).paddingTop).toBe('16px');
    expect(getComputedStyle(footerEl).borderTopColor).toBe(
      tokenColor(panel, '--color-sds-border-weak'),
    );
    expect(footer('適用').getBoundingClientRect().height).toBe(40);
  });
});

describe('DatePickerDayButton', () => {
  const renderDay = (date: Date) => {
    const day = { date } as CalendarDay;
    const modifiers = {} as Modifiers;
    render(<DatePickerDayButton day={day} modifiers={modifiers} data-testid="day" />);
    return screen.getByTestId('day');
  };

  // `data-day` must be the LOCAL calendar date. It was previously built
  // from `toISOString()` (UTC), which shifts local midnight to the previous
  // day in any UTC+ timezone (e.g. JST +09:00) and local 23:59 to the next
  // day in any UTC- timezone. Both edges are asserted so this fails in any
  // non-UTC timezone the suite runs in (vitest browser mode inherits the
  // host TZ; it is not forced in config).
  it('renders data-day as the local calendar date at local midnight', () => {
    expect(renderDay(new Date(2026, 0, 15, 0, 0, 0))).toHaveAttribute('data-day', '2026-01-15');
  });

  it('renders data-day as the local calendar date at local end of day', () => {
    expect(renderDay(new Date(2026, 0, 15, 23, 59, 59))).toHaveAttribute('data-day', '2026-01-15');
  });
});

describe('DatePickerButton', () => {
  // design-foundation.md §5.3 (P0): a disabled element must show no hover
  // visual. The day cell's hover ring must be gated on the native
  // `:enabled` state (react-day-picker passes the native `disabled`
  // attribute for minDate/maxDate-excluded days).
  it('gates the hover ring on :enabled so disabled days show no hover ring', () => {
    render(<DatePickerButton disabled data-testid="btn" />);
    const classes = screen.getByTestId('btn').className.split(/\s+/);
    expect(classes).toContain('enabled:hover:ring-1');
    expect(classes).toContain('enabled:hover:ring-sds-border-basic');
    expect(classes).not.toContain('hover:ring-1');
    expect(classes).not.toContain('hover:ring-sds-border-basic');
  });
});
