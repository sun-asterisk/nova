/**
 * Public API contract fixtures for `DatePicker` — type-only checks (never
 * executed at runtime), run via `pnpm test:api`. See
 * docs/architecture/component-api-conventions.md §15 for the full
 * rationale and the one-file-per-component convention this file follows.
 */
import { expectTypeOf } from 'vitest';
import type { ComponentRef } from 'react';
import {
  Calendar,
  type CalendarActionsConfig,
  type CalendarProps,
  DatePicker,
  type DatePickerActionsConfig,
  type DatePickerProps,
  type DatePickerValue,
} from '@/components/datePicker';

// Phase: 2026-09-07 Figma-fidelity audit.
expectTypeOf<DatePickerProps['mode']>().toEqualTypeOf<'single' | 'range' | undefined>();
expectTypeOf<DatePickerProps['value']>().toEqualTypeOf<DatePickerValue>();
expectTypeOf<DatePickerValue>().toEqualTypeOf<
  Date | import('react-day-picker').DateRange | undefined
>();

() => <DatePicker mode="single" defaultValue={new Date()} onValueChange={(date) => void date} />;
() => (
  <DatePicker
    mode="range"
    value={{ from: new Date(), to: new Date() }}
    onValueChange={(range) => void range}
  />
);
() => <DatePicker actions={false} minDate={new Date()} />;
() => <DatePicker actions={{ today: false, clear: true, apply: true }} formatLocale="en-US" />;
// Invalid: not a real DatePickerMode.
// () => <DatePicker mode="multiple" />;
// Invalid: showActions/showTodayAction/etc. were collapsed into `actions`
// (breaking change, 2026-09-07 Figma-fidelity audit).
// () => <DatePicker showActions={false} showTodayAction={false} />;

expectTypeOf<DatePickerProps['actions']>().toEqualTypeOf<
  boolean | DatePickerActionsConfig | undefined
>();

// 2026-10-07 (breaking, Figma field trigger): the ref is the date input
// (range: the start input), no longer the trigger button.
expectTypeOf<ComponentRef<typeof DatePicker>>().toEqualTypeOf<HTMLInputElement>();
expectTypeOf<DatePickerProps['startDateLabel']>().toEqualTypeOf<string | undefined>();
expectTypeOf<DatePickerProps['endDateLabel']>().toEqualTypeOf<string | undefined>();
expectTypeOf<DatePickerProps['openCalendarLabel']>().toEqualTypeOf<string | undefined>();
() => <DatePicker mode="range" startDateLabel="Check-in" endDateLabel="Check-out" />;
() => <DatePicker openCalendarLabel="Open calendar" />;

// SC-04 (2026-09-29): trigger field semantics are explicit, trigger-bound props.
expectTypeOf<DatePickerProps['id']>().toEqualTypeOf<string | undefined>();
expectTypeOf<DatePickerProps['aria-label']>().toEqualTypeOf<string | undefined>();
expectTypeOf<DatePickerProps['aria-labelledby']>().toEqualTypeOf<string | undefined>();
expectTypeOf<DatePickerProps['aria-describedby']>().toEqualTypeOf<string | undefined>();
expectTypeOf<DatePickerProps['aria-invalid']>().toEqualTypeOf<
  boolean | 'false' | 'true' | 'grammar' | 'spelling' | undefined
>();
() => <DatePicker id="due" aria-invalid aria-describedby="due-error" />;
() => <DatePicker aria-label="Due date" />;
() => <DatePicker aria-labelledby="due-label" />;

// SC-07 (2026-09-29): overridable calendar dialog name.
expectTypeOf<DatePickerProps['calendarLabel']>().toEqualTypeOf<string | undefined>();
() => <DatePicker calendarLabel="Choose a date" />;

// --- Calendar (inline panel, 2026-10-06) ------------------------------------
// Lives in the datePicker folder and ships from `./date-picker` + the root, so
// its contract sits in this file (§15.1: one file per component folder).
expectTypeOf<CalendarProps['mode']>().toEqualTypeOf<'single' | 'range' | undefined>();
expectTypeOf<CalendarProps['value']>().toEqualTypeOf<DatePickerValue>();
expectTypeOf<CalendarProps['defaultValue']>().toEqualTypeOf<DatePickerValue>();
expectTypeOf<CalendarProps['onValueChange']>().toEqualTypeOf<
  ((value: DatePickerValue) => void) | undefined
>();
expectTypeOf<CalendarProps['numberOfMonths']>().toEqualTypeOf<number | undefined>();
expectTypeOf<CalendarProps['minDate']>().toEqualTypeOf<Date | undefined>();
expectTypeOf<CalendarProps['maxDate']>().toEqualTypeOf<Date | undefined>();
expectTypeOf<CalendarProps['actions']>().toEqualTypeOf<
  boolean | CalendarActionsConfig | undefined
>();
// Inline has no Apply step — only Today / Clear (Figma Date Picker actions).
expectTypeOf<CalendarActionsConfig>().toEqualTypeOf<{ today?: boolean; clear?: boolean }>();
expectTypeOf<CalendarProps['todayLabel']>().toEqualTypeOf<string | undefined>();
expectTypeOf<CalendarProps['clearLabel']>().toEqualTypeOf<string | undefined>();
expectTypeOf<CalendarProps['aria-label']>().toEqualTypeOf<string | undefined>();
expectTypeOf<CalendarProps['aria-labelledby']>().toEqualTypeOf<string | undefined>();
expectTypeOf<ComponentRef<typeof Calendar>>().toEqualTypeOf<HTMLDivElement>();
() => <Calendar />;
() => <Calendar mode="range" defaultValue={{ from: new Date(), to: new Date() }} />;
() => <Calendar value={undefined} onValueChange={() => {}} actions={{ today: false }} />;
() => <Calendar minDate={new Date()} numberOfMonths={2} aria-label="Pick" />;
// Invalid: Calendar has no Apply action and no popover-only props.
// () => <Calendar actions={{ apply: true }} />;
// () => <Calendar container={document.body} />;
