'use client';
// Client boundary: creates React context at module scope (directly or via
// react-day-picker), which fails when imported from a React Server Component.
// See vite.config.ts useClientBanner.
import { cn } from '@/utils';
import {
  forwardRef,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { type DateRange, type Matcher, dateMatchModifiers } from 'react-day-picker';
import {
  DatePickerPopover,
  DatePickerPopoverContent,
  DatePickerPopoverTrigger,
} from './DatePickerPopover';
import { DatePickerCalendarGrid, type CalendarPassThroughProps } from './DatePickerCalendarGrid';
import {
  formatDateLabel,
  parseDateInput,
  type RangeTarget,
  selectRangeDate,
  startOfToday,
} from './dateLogic';
import { Button } from '../button';
import { inputStyles } from '../input/Input.styles';

/** Available date picker selection modes */
export type DatePickerMode = 'single' | 'range';

/** Value type for the date picker — a single Date, a DateRange, or undefined */
export type DatePickerValue = Date | DateRange | undefined;

/** Per-button visibility within the footer action bar (see `DatePickerProps['actions']`) */
export type DatePickerActionsConfig = {
  /** Show the "Today" button @default true */
  today?: boolean;
  /** Show the "Clear" button @default true */
  clear?: boolean;
  /** Show the "Apply" button @default true */
  apply?: boolean;
};

/**
 * DatePicker component props extending Calendar props
 */
export type DatePickerProps = {
  /** Selection mode: 'single' for a single date, 'range' for a date range @default 'single' */
  mode?: DatePickerMode;
  /** Controlled selected value (Date for single mode, DateRange for range mode) */
  value?: DatePickerValue;
  /** Default value for uncontrolled usage */
  defaultValue?: DatePickerValue;
  /** Callback fired when the selected value changes */
  onValueChange?: (value: DatePickerValue) => void;
  /**
   * Placeholder of the single-mode date field. Range mode shows
   * `startDateLabel` / `endDateLabel` in its two fields instead.
   * @default '日付を選択'
   */
  placeholder?: string;
  /** Whether the date picker field is disabled @default false */
  disabled?: boolean;
  /** Additional CSS class applied to the field (the bordered wrapper) */
  className?: string;
  /**
   * Footer action bar (Today / Clear / Apply). `true` shows all three
   * (default); `false` hides the footer entirely — selecting a day then
   * commits `onValueChange` immediately and closes the popover instead of
   * requiring Apply. Pass an object to show/hide individual buttons.
   * @default true
   */
  actions?: boolean | DatePickerActionsConfig;
  /** Number of months displayed side by side. Defaults to 2 in range mode, 1 in single mode */
  numberOfMonths?: number;
  /** Minimum selectable date — dates before this are disabled */
  minDate?: Date;
  /** Maximum selectable date — dates after this are disabled */
  maxDate?: Date;
  /** Label text for the "Today" action button @default '今日' */
  todayLabel?: string;
  /** Label text for the "Clear" action button @default 'クリア' */
  clearLabel?: string;
  /** Label text for the "Apply" action button @default '適用' */
  applyLabel?: string;
  /**
   * Range mode: accessible name and placeholder of the start-date field.
   * @default '開始日'
   */
  startDateLabel?: string;
  /**
   * Range mode: accessible name and placeholder of the end-date field.
   * @default '終了日'
   */
  endDateLabel?: string;
  /** Accessible name of the calendar button inside the field @default 'カレンダーを開く' */
  openCalendarLabel?: string;
  /**
   * BCP-47 locale used to format the field's displayed date (via
   * `Intl.DateTimeFormat`) and to read the day/month order of typed dates
   * @default 'ja-JP'. Distinct from react-day-picker's own `locale` prop (a
   * date-fns `Locale` object, still available via pass-through) — that one
   * controls the calendar's OWN internal i18n (month/weekday names).
   */
  formatLocale?: string;
  /**
   * Redirect where the calendar popover's portal mounts (e.g. into a Shadow
   * DOM host or a specific stacking-context container — same convention as
   * `Modal`/`DropdownMenu`/`Tooltip`). Default: `document.body`.
   */
  container?: ComponentProps<typeof PopoverPrimitive.Portal>['container'];
  /**
   * Accessible name of the calendar popover (`role="dialog"`).
   * @default '日付選択カレンダー'
   */
  calendarLabel?: string;
  // --- Field semantics (SC-04) ---------------------------------------------
  // The date `<input>` is the form control, so these go to it — NOT to
  // react-day-picker's calendar root. In range mode the two inputs sit in a
  // `role="group"`: `aria-label`/`aria-labelledby` name the group, `id` goes
  // to the start input, and `aria-describedby`/`aria-invalid` go to both.
  /** `id` of the date input (range: the start input) — lets a `<label htmlFor>` label it. */
  id?: string;
  /** Accessible name of the date input (range: of the group of both inputs). */
  'aria-label'?: string;
  /** Id(s) of element(s) labelling the date input (range: the group of both inputs). */
  'aria-labelledby'?: string;
  /** Id(s) of element(s) describing the input(s), e.g. helper or error text. */
  'aria-describedby'?: string;
  /** Marks the input(s) invalid and shows the error border (pair with `aria-describedby` → error text). */
  'aria-invalid'?: ComponentProps<'input'>['aria-invalid'];
} & CalendarPassThroughProps;

type FieldKey = 'single' | 'start' | 'end';

const isDate = (value: DatePickerValue): value is Date => value instanceof Date;

const isDateRange = (value: DatePickerValue): value is DateRange =>
  typeof value === 'object' && value !== null && ('from' in value || 'to' in value);

const fieldTexts = (value: DatePickerValue, locale: string): Record<FieldKey, string> => {
  const format = (date: Date | undefined) => (date ? formatDateLabel(date, locale) : '');
  return {
    single: format(isDate(value) ? value : undefined),
    start: format(isDateRange(value) ? value.from : undefined),
    end: format(isDateRange(value) ? value.to : undefined),
  };
};

const firstDateOf = (value: DatePickerValue) =>
  isDate(value) ? value : isDateRange(value) ? value.from : undefined;

/**
 * A date field with a calendar popover (Figma Date Picker, `11864:19561`):
 * click a day in the calendar, or type a date straight into the field.
 * Range mode has a start and an end field and follows Figma's
 * 期間選択の制御フロー. Supports controlled and uncontrolled usage, date
 * constraints via minDate/maxDate, and Japanese formatting by default.
 *
 * - Calendar selections go into a draft that **Apply** commits; Escape or an
 *   outside click discards it (there is no Cancel button, per Figma).
 * - A typed date commits on Enter or when the field loses focus (no Apply
 *   needed). Text that is not a valid, selectable date reverts.
 *
 * @example
 * ```tsx
 * // Single date picker (uncontrolled)
 * <label htmlFor="due">期限</label>
 * <DatePicker id="due" defaultValue={new Date()} onValueChange={(date) => console.log(date)} />
 *
 * // Date range picker (controlled)
 * const [range, setRange] = useState<DatePickerValue>();
 * <DatePicker mode="range" aria-label="予約期間" value={range} onValueChange={setRange} />
 *
 * // With date constraints and hidden actions
 * <DatePicker minDate={new Date('2025-01-01')} maxDate={new Date('2025-12-31')} actions={false} />
 * ```
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => {
  const {
    mode = 'single',
    value,
    defaultValue,
    onValueChange,
    placeholder = '日付を選択',
    disabled = false,
    className,
    actions = true,
    numberOfMonths,
    minDate,
    maxDate,
    todayLabel = '今日',
    clearLabel = 'クリア',
    applyLabel = '適用',
    startDateLabel = '開始日',
    endDateLabel = '終了日',
    openCalendarLabel = 'カレンダーを開く',
    formatLocale = 'ja-JP',
    container,
    calendarLabel = '日付選択カレンダー',
    id,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
    ...calendarProps
  } = props;

  // Controlled/uncontrolled decision: controlled iff the `value` KEY is
  // present in props, not iff `value !== undefined`.
  //
  // Deliberately differs from Radix's `useControllableState` (used by
  // Checkbox/Switch/RadioGroup/Tabs), which treats `prop !== undefined`
  // as controlled. That works for those components because their values
  // (`boolean`/`string`) are never legitimately `undefined` while
  // controlled. DatePicker's `value` IS legitimately `undefined` while
  // controlled — "no date selected" — and the idiomatic controlled
  // pattern starts that way (`useState<DatePickerValue>()`, see the JSDoc
  // example above). With `value !== undefined`, a controlled picker was
  // silently uncontrolled whenever it was empty: the first commit also
  // wrote into `internalValue`, and a later reset to `undefined` (e.g.
  // form reset, A -> B -> undefined) re-displayed that stale date instead
  // of the placeholder. See docs/components/datePicker.md §4.1.
  //
  // Consequences: `value={undefined}` = controlled + empty (placeholder,
  // `defaultValue` ignored). Omitting `value` entirely = uncontrolled.
  // Removing the key at runtime (controlled -> uncontrolled) falls back to
  // `internalValue`, which is only written while uncontrolled.
  const isControlled = 'value' in props;
  const [internalValue, setInternalValue] = useState<DatePickerValue>(defaultValue);
  const [draftValue, setDraftValue] = useState<DatePickerValue>(
    isControlled ? value : defaultValue,
  );
  const [open, setOpen] = useState(false);
  // Which end the next range click edits (Figma 確定後の再編集).
  const [rangeTarget, setRangeTarget] = useState<RangeTarget>('auto');
  // First displayed month while open; `undefined` = react-day-picker default.
  const [displayMonth, setDisplayMonth] = useState<Date>();

  const showActions = actions !== false;
  const actionsConfig = typeof actions === 'object' ? actions : {};
  const showTodayAction = actionsConfig.today ?? true;
  const showClearAction = actionsConfig.clear ?? true;
  const showApplyAction = actionsConfig.apply ?? true;

  const resolvedValue = isControlled ? value : internalValue;
  const resolvedNumberOfMonths = numberOfMonths ?? (mode === 'range' ? 2 : 1);
  const disabledMatchers: Matcher[] = [];

  if (minDate) {
    disabledMatchers.push({ before: minDate });
  }

  if (maxDate) {
    disabledMatchers.push({ after: maxDate });
  }

  const isSelectable = (date: Date) =>
    disabledMatchers.length === 0 || !dateMatchModifiers(date, disabledMatchers);

  // --- Typed text ------------------------------------------------------------
  // The inputs show the COMMITTED value (never the draft). While the user
  // types, the text is local; it is re-derived whenever the committed value
  // or locale changes.
  const committedTexts = fieldTexts(resolvedValue, formatLocale);
  const [texts, setTexts] = useState(committedTexts);
  const committedKey = `${committedTexts.single}|${committedTexts.start}|${committedTexts.end}`;
  useEffect(() => {
    setTexts(fieldTexts(resolvedValue, formatLocale));
    // committedKey captures every input of fieldTexts that can change.
  }, [committedKey]);

  useEffect(() => {
    if (!open) {
      setDraftValue(resolvedValue);
    }
  }, [open, resolvedValue]);

  // If minDate/maxDate tighten such that the currently-selected value is no
  // longer selectable, clear it rather than silently keeping a value that
  // now renders as simultaneously "selected" and "disabled" in the calendar
  // grid with no way for the consumer to know it happened.
  useEffect(() => {
    if (disabledMatchers.length === 0) return;

    if (mode === 'single') {
      if (isDate(resolvedValue) && dateMatchModifiers(resolvedValue, disabledMatchers)) {
        commitValue(undefined);
      }
      return;
    }

    if (isDateRange(resolvedValue)) {
      const fromInvalid = resolvedValue.from
        ? dateMatchModifiers(resolvedValue.from, disabledMatchers)
        : false;
      const toInvalid = resolvedValue.to
        ? dateMatchModifiers(resolvedValue.to, disabledMatchers)
        : false;
      if (fromInvalid || toInvalid) {
        commitValue(undefined);
      }
    }
    // Only re-run when the bounds or the resolved value actually change —
    // commitValue/mode are derived fresh each render from stable inputs.
  }, [minDate, maxDate, resolvedValue]);

  const commitValue = (nextValue: DatePickerValue) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  };

  // --- Popover / focus wiring ------------------------------------------------
  const fieldRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const inputRefs = {
    single: useRef<HTMLInputElement>(null),
    start: useRef<HTMLInputElement>(null),
    end: useRef<HTMLInputElement>(null),
  };
  // Forwarded ref = the (start) date input — the field's form control.
  useImperativeHandle(
    ref,
    () => (mode === 'range' ? inputRefs.start.current : inputRefs.single.current)!,
    [mode],
  );
  // Where the popover was opened from (focus returns there on close) and
  // whether focus moves into the calendar: a click in a typing field keeps
  // focus (and the caret) in it; the calendar button and ArrowDown move it
  // to the grid.
  const openedFrom = useRef<FieldKey | 'button'>('button');
  const focusGridOnOpen = useRef(true);
  const interactedOutside = useRef(false);

  const openPopover = (from: FieldKey | 'button', focusGrid: boolean) => {
    openedFrom.current = from;
    focusGridOnOpen.current = focusGrid;
    interactedOutside.current = false;
    setDraftValue(resolvedValue);
    setDisplayMonth(firstDateOf(resolvedValue) ?? calendarProps.defaultMonth);
    setOpen(true);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      // Calendar button: the 'auto' flow unless a field already chose an end.
      setRangeTarget('auto');
      openPopover('button', true);
    } else {
      setOpen(false);
    }
  };

  const focusCalendarDay = () => {
    // react-day-picker keeps exactly one day at tabIndex 0 (the selected day,
    // else today, else the first day) — the grid's roving entry point.
    const day = contentRef.current?.querySelector<HTMLButtonElement>(
      'button[data-day][tabindex="0"]',
    );
    day?.focus();
  };

  // --- Committing typed text -------------------------------------------------
  const revert = (field: FieldKey) =>
    setTexts((prev) => ({ ...prev, [field]: committedTexts[field] }));

  /** Returns true when the field's text is valid (committed or unchanged). */
  const commitTyped = (field: FieldKey): boolean => {
    const text = texts[field].trim();
    if (text === committedTexts[field]) return true;

    let next: DatePickerValue;
    if (text === '') {
      if (field === 'end')
        next = isDateRange(resolvedValue) ? { from: resolvedValue.from, to: undefined } : undefined;
      else next = undefined;
    } else {
      const date = parseDateInput(text, formatLocale);
      if (!date || !isSelectable(date)) {
        revert(field);
        return false;
      }
      if (field === 'single') {
        next = date;
      } else {
        const current = isDateRange(resolvedValue) ? resolvedValue : undefined;
        next = selectRangeDate(current, date, field).range;
      }
    }

    commitValue(next);
    // Normalize the text even if the committed value did not change (e.g.
    // `2025/1/5` for an already-selected Jan 5).
    setTexts(fieldTexts(next, formatLocale));
    if (open) {
      setDraftValue(next);
      setRangeTarget('auto');
    }
    return true;
  };

  const handleInputChange = (field: FieldKey, text: string) => {
    setTexts((prev) => ({ ...prev, [field]: text }));
    // Let the open calendar follow a recognizable typed date.
    const date = open ? parseDateInput(text, formatLocale) : undefined;
    if (date) setDisplayMonth(date);
  };

  const handleInputKeyDown = (field: FieldKey, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (commitTyped(field)) setOpen(false);
    } else if (event.key === 'Escape') {
      revert(field);
    } else if (event.key === 'ArrowDown') {
      // Combobox convention: ArrowDown moves into the calendar (opening it).
      event.preventDefault();
      if (field !== 'single') setRangeTarget(field);
      if (open) focusCalendarDay();
      else openPopover(field, true);
    }
  };

  const handleInputClick = (field: FieldKey) => {
    if (disabled) return;
    if (field !== 'single') setRangeTarget(field);
    if (!open) openPopover(field, false);
  };

  // --- Calendar selections (draft) -------------------------------------------
  const selectedSingleValue = isDate(showActions ? draftValue : resolvedValue)
    ? ((showActions ? draftValue : resolvedValue) as Date)
    : undefined;
  const rangeSource = showActions ? draftValue : resolvedValue;
  const selectedRangeValue = isDateRange(rangeSource) ? rangeSource : undefined;

  const hasSelectedValue =
    mode === 'single' ? Boolean(selectedSingleValue) : Boolean(selectedRangeValue?.from);
  const canApply =
    mode === 'single'
      ? isDate(draftValue)
      : Boolean(isDateRange(draftValue) && draftValue.from && draftValue.to);

  const handleSingleSelect = (nextDate: Date | undefined) => {
    if (showActions) {
      setDraftValue(nextDate);
      return;
    }

    commitValue(nextDate);
    setOpen(false);
  };

  const handleRangeSelectDate = (date: Date) => {
    const { range: nextRange, target } = selectRangeDate(selectedRangeValue, date, rangeTarget);
    setRangeTarget(target);
    if (showActions) {
      setDraftValue(nextRange);
      return;
    }

    commitValue(nextRange);
    if (nextRange.from && nextRange.to) {
      setOpen(false);
    }
  };

  // handleToday/handleClear are only ever invoked from the action bar
  // buttons below, which only render when showActions is true — so these
  // always update the in-progress draft, never commit directly.
  const handleToday = () => {
    const today = startOfToday();
    // Figma 今日: jump to the current month too.
    setDisplayMonth(today);
    if (mode === 'single') {
      setDraftValue(today);
      return;
    }

    // Figma 今日（Range）: today becomes the new start; the end is cleared and
    // the next click picks it.
    setDraftValue({ from: today, to: undefined });
    setRangeTarget('end');
  };

  const handleClear = () => {
    setDraftValue(undefined);
    setRangeTarget('auto');
  };

  const handleApply = () => {
    commitValue(draftValue);
    setOpen(false);
  };

  const describedProps = {
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
  };
  const isInvalid = ariaInvalid === true || ariaInvalid === 'true';

  const inputProps = (field: FieldKey) => ({
    ref: inputRefs[field],
    type: 'text' as const,
    autoComplete: 'off',
    disabled,
    value: texts[field],
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      handleInputChange(field, event.target.value),
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => handleInputKeyDown(field, event),
    onClick: () => handleInputClick(field),
    // Leaving a field (also for the other range input, or a calendar day)
    // commits what was typed in it.
    onBlur: () => commitTyped(field),
    'data-slot': `date-picker-input-${field}`,
    className: cn(
      'min-w-0 flex-1 bg-transparent outline-none typo-body-l text-sds-text-primary',
      'placeholder:text-sds-text-placeholder disabled:cursor-not-allowed disabled:text-sds-text-disable',
    ),
    ...describedProps,
  });

  return (
    <DatePickerPopover open={open} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Anchor asChild>
        <div
          ref={fieldRef}
          data-slot="date-picker-field"
          role={mode === 'range' ? 'group' : undefined}
          aria-label={mode === 'range' ? ariaLabel : undefined}
          aria-labelledby={mode === 'range' ? ariaLabelledBy : undefined}
          data-disabled={disabled || undefined}
          className={cn(
            'relative flex w-full items-center gap-sds-100 pl-sds-150 pr-sds-50',
            inputStyles({ variant: disabled ? 'disabled' : isInvalid ? 'error' : 'default' }),
            // The field shows ONE focus ring: around the whole field while
            // an input is focused (Figma Text Field focus), but not when
            // the calendar button is — that button draws its own ring, and
            // two concentric rings would be ambiguous. Gated, so not the
            // design-foundation.md §5.1 unconditional-outline-none bug.
            'has-[button:focus-visible]:outline-none',
            className,
          )}
        >
          {mode === 'single' ? (
            <input
              {...inputProps('single')}
              id={id}
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledBy}
              placeholder={placeholder}
            />
          ) : (
            <>
              <input
                {...inputProps('start')}
                id={id}
                aria-label={startDateLabel}
                placeholder={startDateLabel}
              />
              <span aria-hidden className="shrink-0 typo-body-l text-sds-text-secondary">
                −
              </span>
              <input {...inputProps('end')} aria-label={endDateLabel} placeholder={endDateLabel} />
            </>
          )}
          <DatePickerPopoverTrigger asChild>
            <Button
              variant="plain"
              iconOnly
              disabled={disabled}
              aria-label={openCalendarLabel}
              className="shrink-0 [&_svg]:size-5"
            >
              <CalendarIcon
                aria-hidden
                className={disabled ? 'text-sds-icon-disable' : 'text-sds-icon-secondary'}
              />
            </Button>
          </DatePickerPopoverTrigger>
        </div>
      </PopoverPrimitive.Anchor>
      <DatePickerPopoverContent
        ref={contentRef}
        container={container}
        aria-label={calendarLabel}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          // Typing field: keep focus (and the caret) in it. Calendar button or
          // ArrowDown: start on the grid's roving day, not the month nav.
          if (focusGridOnOpen.current) requestAnimationFrame(focusCalendarDay);
        }}
        onInteractOutside={(event) => {
          // Clicks/focus on the field itself (switching between the inputs,
          // placing the caret) must not dismiss the calendar.
          if (fieldRef.current?.contains(event.target as Node)) {
            event.preventDefault();
            return;
          }
          interactedOutside.current = true;
        }}
        onCloseAutoFocus={(event) => {
          if (interactedOutside.current) {
            // Do not steal focus from wherever the user went.
            event.preventDefault();
            return;
          }
          if (openedFrom.current !== 'button') {
            event.preventDefault();
            inputRefs[openedFrom.current].current?.focus();
          }
        }}
      >
        {mode === 'single' ? (
          <DatePickerCalendarGrid
            mode="single"
            selected={selectedSingleValue}
            onSelect={handleSingleSelect}
            disabled={disabledMatchers}
            numberOfMonths={resolvedNumberOfMonths}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            passThrough={calendarProps}
          />
        ) : (
          <DatePickerCalendarGrid
            mode="range"
            selected={selectedRangeValue}
            onSelectDate={handleRangeSelectDate}
            disabled={disabledMatchers}
            numberOfMonths={resolvedNumberOfMonths}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            passThrough={calendarProps}
          />
        )}

        {showActions && (
          // Figma Footer: Border/Weak top, padding 16, gap 12, Medium buttons.
          <div className="border-t border-sds-border-weak p-sds-200 flex items-center justify-between gap-sds-150">
            <div className="flex items-center gap-sds-150">
              {showTodayAction && (
                <Button type="button" variant="plain" size="medium" onClick={handleToday}>
                  {todayLabel}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-sds-150">
              {showClearAction && (
                <Button
                  type="button"
                  variant="secondary"
                  size="medium"
                  disabled={!hasSelectedValue}
                  onClick={handleClear}
                >
                  {clearLabel}
                </Button>
              )}
              {showApplyAction && (
                <Button
                  type="button"
                  variant="primary"
                  size="medium"
                  disabled={!canApply}
                  onClick={handleApply}
                >
                  {applyLabel}
                </Button>
              )}
            </div>
          </div>
        )}
      </DatePickerPopoverContent>
    </DatePickerPopover>
  );
});

DatePicker.displayName = 'DatePicker';
