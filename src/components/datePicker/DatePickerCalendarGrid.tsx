'use client';
// Client boundary: react-day-picker creates React context at module scope.
// See vite.config.ts useClientBanner.
import { type ComponentProps, useState } from 'react';
import { type DateRange, type Matcher } from 'react-day-picker';
import { buttonStyles } from '../button/Button.styles';
import { DatePickerBase } from './DatePickerBase';
import { DatePickerDayButtonAdapter } from './DatePickerDayButton';
import { isAfterDay } from './dateLogic';

/**
 * INTERNAL (not exported from the package). The Sun-styled react-day-picker
 * grid shared by `DatePicker` (inside its popover) and `Calendar` (inline).
 * Extracted 2026-10-06 when `Calendar` became the second consumer — the
 * single/range branches were previously duplicated verbatim inside
 * DatePicker.tsx.
 */
export type CalendarPassThroughProps = Omit<
  ComponentProps<typeof DatePickerBase>,
  'mode' | 'selected' | 'onSelect' | 'numberOfMonths' | 'id' | 'aria-label' | 'aria-labelledby'
>;

type GridProps = {
  disabled?: Matcher[];
  numberOfMonths: number;
  /** First displayed month. `undefined` leaves react-day-picker in charge (uncontrolled). */
  month?: Date;
  onMonthChange?: (month: Date) => void;
  passThrough?: CalendarPassThroughProps;
} & (
  | { mode: 'single'; selected: Date | undefined; onSelect: (value: Date | undefined) => void }
  | {
      mode: 'range';
      selected: DateRange | undefined;
      /**
       * The clicked date only. The owner applies Figma's range rules
       * (`selectRangeDate`) — react-day-picker's own range algorithm (which
       * extends/shrinks around the clicked day) is deliberately not used.
       */
      onSelectDate: (date: Date) => void;
    }
);

// Figma Icon Button: Style=Plain, Size=Medium (40×40, 20px chevron).
const NAV_BUTTON = buttonStyles({ variant: 'plain', size: 'medium', iconOnly: true });

// Figma Date Picker (11864:19567). Header: padding 16/8, 40px nav buttons.
// Calendar: padding 8 top / 16 sides+bottom, weekday row 40×32 (12px
// Text/Secondary), 40×40 day cells with 2px between weeks. Range: the two
// months sit 24px apart.
const gridClassNames = (mode: 'single' | 'range') => ({
  root: 'w-fit',
  months: mode === 'range' ? 'flex flex-row gap-sds-300' : 'flex flex-row',
  month: 'flex flex-col gap-sds-200',
  month_caption: 'h-10 text-sds-text-primary typo-label-l-bold',
  button_previous: NAV_BUTTON,
  button_next: NAV_BUTTON,
  weekdays: 'flex',
  weekday: 'p-0 typo-body-s text-sds-text-secondary',
  week: 'flex w-full mt-sds-25',
  day: 'p-0 text-center size-10',
});

export function DatePickerCalendarGrid(props: GridProps) {
  const { disabled, numberOfMonths, month, onMonthChange, passThrough } = props;

  // Range hover preview (Figma 1回目のクリック → 選択中): while only the start is
  // set, the days from the start up to the hovered day show the In Range
  // style. Never towards an earlier day — that click would replace the start
  // (Figma Don't: 開始日より過去の日付のカーソル位置まで In Range スタイルを適用する).
  const [hovered, setHovered] = useState<Date>();
  const openStart =
    props.mode === 'range' && props.selected?.from && !props.selected.to
      ? props.selected.from
      : undefined;
  const previewTo = openStart && hovered && isAfterDay(hovered, openStart) ? hovered : undefined;

  const modifiers = {
    range_preview:
      previewTo && openStart ? { after: openStart, before: addOneDay(previewTo) } : false,
    // react-day-picker only flags range_start once BOTH ends exist, so the
    // open start of a preview gets its own flag for the Range Start shape.
    range_preview_start: previewTo && openStart ? openStart : false,
    ...passThrough?.modifiers,
  };

  const shared = {
    disabled: disabled && disabled.length ? disabled : undefined,
    numberOfMonths,
    className: 'px-sds-200 pt-sds-100 pb-sds-200',
    classNames: gridClassNames(props.mode),
    components: { DayButton: DatePickerDayButtonAdapter },
    ...passThrough,
    modifiers,
    month: passThrough?.month ?? month,
    onMonthChange: (next: Date) => {
      onMonthChange?.(next);
      passThrough?.onMonthChange?.(next);
    },
    onDayMouseEnter: (
      ...args: Parameters<NonNullable<CalendarPassThroughProps['onDayMouseEnter']>>
    ) => {
      setHovered(args[0]);
      passThrough?.onDayMouseEnter?.(...args);
    },
    onDayMouseLeave: (
      ...args: Parameters<NonNullable<CalendarPassThroughProps['onDayMouseLeave']>>
    ) => {
      setHovered(undefined);
      passThrough?.onDayMouseLeave?.(...args);
    },
  };

  if (props.mode === 'single') {
    return (
      <DatePickerBase
        mode="single"
        selected={props.selected}
        onSelect={props.onSelect}
        {...shared}
      />
    );
  }
  const { onSelectDate } = props;
  return (
    <DatePickerBase
      mode="range"
      selected={props.selected}
      onSelect={(_range, triggerDate) => {
        setHovered(undefined);
        onSelectDate(triggerDate);
      }}
      {...shared}
    />
  );
}

const addOneDay = (date: Date) => {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
};
