'use client';
// Client boundary: react-day-picker creates React context at module scope.
// See vite.config.ts useClientBanner.
import { cn } from '@/utils';
import { forwardRef, useEffect, useState } from 'react';
import { type DateRange, type Matcher, dateMatchModifiers } from 'react-day-picker';
import { Button } from '../button';
import type { DatePickerMode, DatePickerValue } from './DatePicker';
import { DatePickerCalendarGrid, type CalendarPassThroughProps } from './DatePickerCalendarGrid';
import { type RangeTarget, selectRangeDate, startOfToday } from './dateLogic';

/** Per-button visibility of Calendar's footer (Figma Date Picker: Today / Clear). */
export type CalendarActionsConfig = {
  /** Show the "Today" button @default true */
  today?: boolean;
  /** Show the "Clear" button @default true */
  clear?: boolean;
};

export type CalendarProps = {
  /** Selection mode: a single date or a date range @default 'single' */
  mode?: DatePickerMode;
  /** Controlled value (Date in single mode, DateRange in range mode). `value={undefined}` = controlled and empty. */
  value?: DatePickerValue;
  /** Initial value when uncontrolled (omit `value`) */
  defaultValue?: DatePickerValue;
  /** Fires on every selection — there is no Apply step inline */
  onValueChange?: (value: DatePickerValue) => void;
  /** Months shown side by side @default 1 (single), 2 (range) */
  numberOfMonths?: number;
  /** Earliest selectable date */
  minDate?: Date;
  /** Latest selectable date */
  maxDate?: Date;
  /**
   * Footer with Today / Clear (Figma Date Picker "Date Picker Actions",
   * default on). Inline, both act immediately. `false` hides the footer.
   * @default true
   */
  actions?: boolean | CalendarActionsConfig;
  /** @default '今日' */
  todayLabel?: string;
  /** @default 'クリア' */
  clearLabel?: string;
  /**
   * Accessible name of the calendar region (`role="group"`).
   * @default '日付選択カレンダー'
   */
  'aria-label'?: string;
  /** Id(s) of element(s) labelling the calendar region (overrides `aria-label`). */
  'aria-labelledby'?: string;
  /** Class names for the outer panel */
  className?: string;
} & CalendarPassThroughProps;

const isDate = (value: DatePickerValue): value is Date => value instanceof Date;
const isDateRange = (value: DatePickerValue): value is DateRange =>
  typeof value === 'object' && value !== null && ('from' in value || 'to' in value);

/**
 * An always-visible calendar — the Figma "Date Picker" panel (Style = Single /
 * Range, `11864:19567`) rendered inline instead of in `DatePicker`'s popover.
 * Selection commits immediately via `onValueChange`; there is no Apply step.
 * Range clicks follow Figma's 期間選択の制御フロー (1st click = start, 2nd =
 * end; an earlier day replaces the start; the same day = a one-day range), so
 * `onValueChange` also reports the in-progress `{ from, to: undefined }`.
 * Shares the exact grid (styles, keyboard navigation, day cells) with
 * `DatePicker`.
 *
 * In-page content, so it shows its boundary with `border-weak` instead of the
 * floating panel's shadow (design-foundation.md §4).
 *
 * @example
 * ```tsx
 * const [range, setRange] = useState<DatePickerValue>();
 * <Calendar mode="range" value={range} onValueChange={setRange} minDate={new Date()} />
 * ```
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>((props, ref) => {
  const {
    mode = 'single',
    value,
    defaultValue,
    onValueChange,
    numberOfMonths,
    minDate,
    maxDate,
    actions = true,
    todayLabel = '今日',
    clearLabel = 'クリア',
    'aria-label': ariaLabel = '日付選択カレンダー',
    'aria-labelledby': ariaLabelledBy,
    className,
    ...passThrough
  } = props;

  // Same controlled rule as DatePicker: the `value` KEY decides, because an
  // empty controlled calendar legitimately has `value === undefined`.
  const isControlled = 'value' in props;
  const [internalValue, setInternalValue] = useState<DatePickerValue>(defaultValue);
  const resolvedValue = isControlled ? value : internalValue;

  const commit = (next: DatePickerValue) => {
    if (!isControlled) setInternalValue(next);
    onValueChange?.(next);
  };

  const [rangeTarget, setRangeTarget] = useState<RangeTarget>('auto');
  // `undefined` = react-day-picker's own month state; set by 今日 (which
  // jumps to the current month) and by navigation from then on.
  const [displayMonth, setDisplayMonth] = useState<Date>();

  const disabledMatchers: Matcher[] = [];
  if (minDate) disabledMatchers.push({ before: minDate });
  if (maxDate) disabledMatchers.push({ after: maxDate });

  // Same as DatePicker: a value that falls outside new min/max bounds is cleared.
  useEffect(() => {
    if (!disabledMatchers.length) return;
    const outOfRange = (d?: Date) => (d ? dateMatchModifiers(d, disabledMatchers) : false);
    if (
      mode === 'single'
        ? isDate(resolvedValue) && outOfRange(resolvedValue)
        : isDateRange(resolvedValue) &&
          (outOfRange(resolvedValue.from) || outOfRange(resolvedValue.to))
    ) {
      commit(undefined);
    }
  }, [minDate, maxDate, resolvedValue]);

  const showActions = actions !== false;
  const config = typeof actions === 'object' ? actions : {};
  const showToday = config.today ?? true;
  const showClear = config.clear ?? true;
  const hasValue =
    mode === 'single'
      ? isDate(resolvedValue)
      : Boolean(isDateRange(resolvedValue) && resolvedValue.from);
  const resolvedNumberOfMonths = numberOfMonths ?? (mode === 'range' ? 2 : 1);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabelledBy ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        'w-fit rounded-sds-400 border border-sds-border-weak bg-sds-surface-base overflow-hidden',
        className,
      )}
    >
      {mode === 'single' ? (
        <DatePickerCalendarGrid
          mode="single"
          selected={isDate(resolvedValue) ? resolvedValue : undefined}
          onSelect={commit}
          disabled={disabledMatchers}
          numberOfMonths={resolvedNumberOfMonths}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          passThrough={passThrough}
        />
      ) : (
        <DatePickerCalendarGrid
          mode="range"
          selected={isDateRange(resolvedValue) ? resolvedValue : undefined}
          onSelectDate={(date) => {
            const current = isDateRange(resolvedValue) ? resolvedValue : undefined;
            const next = selectRangeDate(current, date, rangeTarget);
            setRangeTarget(next.target);
            commit(next.range);
          }}
          disabled={disabledMatchers}
          numberOfMonths={resolvedNumberOfMonths}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          passThrough={passThrough}
        />
      )}
      {showActions && (showToday || showClear) && (
        // Figma Footer: Border/Weak top, padding 16, gap 12, Medium buttons.
        <div className="border-t border-sds-border-weak p-sds-200 flex items-center justify-between gap-sds-150">
          <div className="flex items-center gap-sds-150">
            {showToday && (
              <Button
                type="button"
                variant="plain"
                size="medium"
                onClick={() => {
                  // Figma 今日: jump to this month; Range: today is the new
                  // start, the end is cleared and the next click picks it.
                  const today = startOfToday();
                  setDisplayMonth(today);
                  if (mode === 'single') {
                    commit(today);
                  } else {
                    setRangeTarget('end');
                    commit({ from: today, to: undefined });
                  }
                }}
              >
                {todayLabel}
              </Button>
            )}
          </div>
          {showClear && (
            <Button
              type="button"
              variant="secondary"
              size="medium"
              disabled={!hasValue}
              onClick={() => {
                setRangeTarget('auto');
                commit(undefined);
              }}
            >
              {clearLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
});

Calendar.displayName = 'Calendar';
