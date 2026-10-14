import '../../App.css';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import { createRef, useState } from 'react';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Calendar } from './Calendar';
import type { DatePickerValue } from './DatePicker';

// `Calendar` — the Figma "Date Picker" panel (11864:19567) rendered inline
// (2026-10-06). Selection commits immediately; no popover, no Apply.
const day = (iso: string) =>
  document.querySelector<HTMLButtonElement>(`button[data-day="${iso}"]`)!;
const JAN_2026 = new Date(2026, 0, 1);

describe('Calendar', () => {
  it('is visible without any interaction and is a labelled group', () => {
    render(<Calendar defaultMonth={JAN_2026} />);
    const group = screen.getByRole('group', { name: '日付選択カレンダー' });
    expect(group).toBeVisible();
    expect(day('2026-01-15')).toBeVisible();
  });

  // WCAG 2.5.3 Label in Name: the visible day number must appear as a word in
  // the day button's accessible name. react-day-picker's default ("January
  // 15th, 2026") failed axe-core 4.14's label-content-name-mismatch.
  it('names each day button with its visible day number as a plain word', async () => {
    render(<Calendar defaultMonth={JAN_2026} />);
    expect(day('2026-01-15')).toHaveAccessibleName('Thursday, January 15, 2026');
    const buttons = document.querySelectorAll<HTMLButtonElement>('button[data-day]');
    expect(buttons.length).toBeGreaterThan(28);
    for (const button of buttons) {
      const words = button.getAttribute('aria-label')!.split(/[\s,]+/);
      expect(words).toContain(button.textContent!.trim());
    }
    await userEvent.click(day('2026-01-15'));
    expect(day('2026-01-15')).toHaveAccessibleName('Thursday, January 15, 2026, selected');
  });

  it('forwards a ref to the panel element', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Calendar ref={ref} />);
    expect(ref.current).toBe(screen.getByRole('group'));
  });

  it('single: clicking a day commits immediately and updates the uncontrolled selection', async () => {
    const onValueChange = vi.fn();
    render(<Calendar defaultMonth={JAN_2026} onValueChange={onValueChange} />);
    await userEvent.click(day('2026-01-15'));
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect((onValueChange.mock.calls[0][0] as Date).getDate()).toBe(15);
    expect(day('2026-01-15').dataset.selected).toBe('true');
  });

  it('range: two clicks commit a from/to range', async () => {
    const onValueChange = vi.fn();
    render(<Calendar mode="range" defaultMonth={JAN_2026} onValueChange={onValueChange} />);
    await userEvent.click(day('2026-01-10'));
    await userEvent.click(day('2026-01-14'));
    const last = onValueChange.mock.calls.at(-1)![0] as { from: Date; to: Date };
    expect([last.from.getDate(), last.to.getDate()]).toEqual([10, 14]);
  });

  // Figma 期間選択の制御フロー — exceptions while waiting for the end.
  it('range: a day before the start replaces the start; the same day makes a one-day range', async () => {
    const onValueChange = vi.fn();
    render(<Calendar mode="range" defaultMonth={JAN_2026} onValueChange={onValueChange} />);
    await userEvent.click(day('2026-01-10'));
    await userEvent.click(day('2026-01-05'));
    expect(onValueChange).toHaveBeenLastCalledWith({ from: new Date(2026, 0, 5), to: undefined });
    await userEvent.click(day('2026-01-05'));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: new Date(2026, 0, 5),
      to: new Date(2026, 0, 5),
    });
    // A one-day range keeps the full Select radius on both sides.
    const cs = getComputedStyle(day('2026-01-05'));
    expect([
      cs.borderTopLeftRadius,
      cs.borderTopRightRadius,
      cs.borderBottomLeftRadius,
      cs.borderBottomRightRadius,
    ]).toEqual(['8px', '8px', '8px', '8px']);
  });

  // Figma 選択中: In Range style from the start up to the hovered day — but
  // never back towards an earlier day (Figma Don't).
  it('range: hovering after the start previews the range; hovering before does not', async () => {
    render(<Calendar mode="range" defaultMonth={JAN_2026} />);
    await userEvent.click(day('2026-01-10'));
    await userEvent.hover(day('2026-01-13'));
    expect(day('2026-01-12').dataset.rangeMiddle).toBe('true');
    expect(day('2026-01-13').dataset.rangeMiddle).toBe('true');
    expect(day('2026-01-14').dataset.rangeMiddle).toBe('false');
    expect(day('2026-01-10')).toHaveClass('rounded-r-sds-0');

    await userEvent.hover(day('2026-01-07'));
    expect(day('2026-01-08').dataset.rangeMiddle).toBe('false');
    expect(day('2026-01-12').dataset.rangeMiddle).toBe('false');
  });

  // Figma 今日（Range）: today is the new start, the end is cleared.
  it('range: Today sets today as the start and clears the end', () => {
    const onValueChange = vi.fn();
    render(
      <Calendar
        mode="range"
        defaultValue={{ from: new Date(2026, 0, 10), to: new Date(2026, 0, 14) }}
        onValueChange={onValueChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '今日' }));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expect(onValueChange).toHaveBeenLastCalledWith({ from: today, to: undefined });
  });

  it('Today jumps to the current month', () => {
    render(<Calendar defaultMonth={JAN_2026} />);
    fireEvent.click(screen.getByRole('button', { name: '今日' }));
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(day(iso)).toBeVisible();
  });

  it('disabled days use the regular weight (Figma Day State=Disabled)', () => {
    render(<Calendar defaultMonth={JAN_2026} minDate={new Date(2026, 0, 10)} />);
    expect(day('2026-01-05')).toHaveClass('typo-label-l-regular');
    expect(getComputedStyle(day('2026-01-05')).fontWeight).toBe('400');
    expect(getComputedStyle(day('2026-01-15')).fontWeight).toBe('700');
  });

  it('controlled: value={undefined} is empty, and external changes are reflected', async () => {
    function Harness() {
      const [v, setV] = useState<DatePickerValue>(undefined);
      return (
        <>
          <Calendar defaultMonth={JAN_2026} value={v} onValueChange={setV} />
          <button onClick={() => setV(new Date(2026, 0, 20))}>external</button>
        </>
      );
    }
    render(<Harness />);
    expect(document.querySelector('[data-selected="true"]')).toBeNull();
    fireEvent.click(screen.getByText('external'));
    expect(day('2026-01-20').dataset.selected).toBe('true');
  });

  it('Today commits today immediately; Clear commits undefined and is disabled when empty', async () => {
    const onValueChange = vi.fn();
    render(<Calendar onValueChange={onValueChange} />);
    const clear = screen.getByRole('button', { name: 'クリア' });
    expect(clear).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '今日' }));
    expect((onValueChange.mock.calls[0][0] as Date).toDateString()).toBe(new Date().toDateString());
    expect(clear).toBeEnabled();
    fireEvent.click(clear);
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  it('actions={false} hides the footer; per-button config hides one', () => {
    const { rerender } = render(<Calendar actions={false} />);
    expect(screen.queryByRole('button', { name: '今日' })).toBeNull();
    rerender(<Calendar actions={{ today: false }} />);
    expect(screen.queryByRole('button', { name: '今日' })).toBeNull();
    expect(screen.getByRole('button', { name: 'クリア' })).toBeInTheDocument();
  });

  it('minDate disables earlier days and clears a value that falls out of range', async () => {
    const onValueChange = vi.fn();
    function Harness() {
      const [min, setMin] = useState<Date | undefined>();
      return (
        <>
          <Calendar
            defaultMonth={JAN_2026}
            defaultValue={new Date(2026, 0, 5)}
            minDate={min}
            onValueChange={onValueChange}
          />
          <button onClick={() => setMin(new Date(2026, 0, 10))}>tighten</button>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByText('tighten'));
    expect(day('2026-01-08')).toBeDisabled();
    expect(onValueChange).toHaveBeenLastCalledWith(undefined);
  });

  // In-page panel: border-weak boundary on surface-base, no floating shadow
  // (design-foundation.md §4) — in light and dark.
  it.each(['light', 'dark'] as const)(
    'panel uses surface-base + border-weak, no shadow (%s)',
    (theme) => {
      render(
        <div data-theme={theme}>
          <Calendar />
        </div>,
      );
      const panel = screen.getByRole('group');
      const cs = getComputedStyle(panel);
      expect(cs.backgroundColor).toBe(tokenColor(panel, '--color-sds-surface-base'));
      expect(cs.borderTopColor).toBe(tokenColor(panel, '--color-sds-border-weak'));
      expect(cs.boxShadow).toBe('none');
    },
  );
});
