import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
  DayPicker,
  getDefaultClassNames,
  type Labels,
  type MonthCaptionProps,
  useDayPicker,
} from 'react-day-picker';

import { cn } from '@/utils';
import {
  type ComponentProps,
  type HTMLAttributes,
  type Ref,
  type TdHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';

// Day-button accessible name (WCAG 2.5.3 Label in Name). react-day-picker's
// default formats with date-fns "PPPP" ("Sunday, December 28th, 2025"), whose
// ordinal "28th" does not contain the visible "28" as a word — axe-core 4.14's
// `label-content-name-mismatch` fails every day button, and speech-input users
// saying "click 28" may not match it. Intl's full date style keeps the day as a
// plain number ("Sunday, December 28, 2025") and still follows the locale and
// time zone. The Today / selected wording is unchanged from the default.
const labelDayButton: Labels['labelDayButton'] = (date, modifiers, options) => {
  let label = new Intl.DateTimeFormat(options?.locale?.code ?? 'en-US', {
    dateStyle: 'full',
    timeZone: options?.timeZone,
  }).format(date);
  if (modifiers.today) label = `Today, ${label}`;
  if (modifiers.selected) label = `${label}, selected`;
  return label;
};

export const DatePickerBase = ({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  formatters,
  components,
  labels,
  ...props
}: ComponentProps<typeof DayPicker>) => {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        'bg-sds-surface-base group/calendar p-sds-200 in-data-[slot=card-content]:bg-transparent in-data-[slot=popover-content]:bg-transparent',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className,
      )}
      captionLayout={captionLayout}
      // A custom calendar (`dateLib`) or numbering system (`numerals`) changes
      // the visible day text, which Intl's Gregorian/latn output would not
      // match — keep react-day-picker's own label for those.
      labels={{
        ...(props.dateLib || props.numerals ? {} : { labelDayButton }),
        ...labels,
      }}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-fit', defaultClassNames.root),
        months: defaultClassNames.months,
        month: cn('flex flex-col w-full gap-4', defaultClassNames.month),
        nav: cn(
          'flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between',
          defaultClassNames.nav,
        ),
        button_previous: cn(
          'aria-disabled:opacity-50 p-0 select-none',
          defaultClassNames.button_previous,
        ),
        button_next: cn('aria-disabled:opacity-50 p-0 select-none', defaultClassNames.button_next),
        month_caption: cn(
          'flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)',
          defaultClassNames.month_caption,
        ),
        dropdowns: cn(
          'w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5',
          defaultClassNames.dropdowns,
        ),
        dropdown_root: cn(
          'relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md',
          defaultClassNames.dropdown_root,
        ),
        dropdown: cn('absolute bg-sds-surface-base inset-0 opacity-0', defaultClassNames.dropdown),
        caption_label: cn(
          'select-none',
          captionLayout === 'label' && 'typo-label-l-bold text-sds-text-primary',
          defaultClassNames.caption_label,
        ),
        // react-day-picker v10 renamed this ClassNames key from `table` to
        // `month_grid` (UI.MonthGrid) — still renders a real <table> element
        // under the hood (MonthGrid.js), so this is a rename only, not a
        // structural/accessibility change.
        month_grid: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),
        // weekday: cn(
        //   'text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none',
        //   defaultClassNames.weekday,
        // ),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        week_number_header: cn('select-none w-(--cell-size)', defaultClassNames.week_number_header),
        week_number: cn(
          'typo-body-s select-none text-sds-text-secondary',
          defaultClassNames.week_number,
        ),
        day: cn(
          'relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-sds-200 group/day aspect-square select-none',
          props.showWeekNumber
            ? '[&:nth-child(2)[data-selected=true]_button]:rounded-l-sds-200'
            : '[&:first-child[data-selected=true]_button]:rounded-l-sds-200',
          defaultClassNames.day,
        ),
        range_start: cn('rounded-l-sds-200 bg-sds-surface-primary', defaultClassNames.range_start),
        range_middle: cn('rounded-sds-0', defaultClassNames.range_middle),
        range_end: cn('rounded-r-sds-200 bg-sds-surface-primary', defaultClassNames.range_end),
        // No background fill here — design.md's DatePicker spec calls for
        // Today to be `text-emphasis` + bold only (already applied by
        // DatePickerDayButton's own `isToday` check); this just keeps the
        // radius consistent when Today also happens to be selected.
        today: cn('rounded-sds-200 data-[selected=true]:rounded-sds-0', defaultClassNames.today),
        outside: cn(
          'text-sds-text-disable aria-selected:text-sds-text-disable',
          defaultClassNames.outside,
        ),
        // Figma Day State=Disabled: Text/Disable at full opacity (no fade).
        disabled: cn('text-sds-text-disable', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      // Module-level components: an inline arrow here gets a new identity on
      // every render, so react-day-picker would REMOUNT the whole grid on any
      // parent re-render (e.g. the range hover preview) — losing the click
      // in progress and the focused day.
      components={{
        Root: CalendarRoot,
        Nav: CalendarNav,
        MonthCaption: DatePickerBaseMonthCaption,
        Chevron: CalendarChevron,
        WeekNumber: CalendarWeekNumber,
        Weekday: CalendarWeekday,
        ...components,
      }}
      {...props}
    />
  );
};

const DatePickerBaseMonthCaption = ({
  className,
  displayIndex,
  children,
  // DOM に漏れて React warning になるため rest から除外する
  calendarMonth: _calendarMonth,
  ...props
}: MonthCaptionProps) => {
  const {
    months,
    previousMonth,
    nextMonth,
    goToMonth,
    components,
    classNames,
    labels: { labelPrevious, labelNext },
    dayPickerProps,
  } = useDayPicker();

  const showNavigation = !dayPickerProps.hideNavigation;
  const isFirstMonth = displayIndex === 0;
  const isLastMonth = displayIndex === months.length - 1;

  return (
    <div
      {...props}
      className={cn('relative flex items-center justify-between h-(--cell-size)', className)}
    >
      {showNavigation && isFirstMonth ? (
        <components.PreviousMonthButton
          type="button"
          className={classNames.button_previous}
          tabIndex={previousMonth ? undefined : -1}
          aria-disabled={previousMonth ? undefined : true}
          aria-label={labelPrevious(previousMonth)}
          onClick={() => {
            if (previousMonth) {
              goToMonth(previousMonth);
            }
          }}
        >
          <components.Chevron
            disabled={previousMonth ? undefined : true}
            className={classNames.chevron}
            orientation={dayPickerProps.dir === 'rtl' ? 'right' : 'left'}
          />
        </components.PreviousMonthButton>
      ) : (
        <span className="size-10" aria-hidden />
      )}

      <div className="flex-1 text-center">{children}</div>

      {showNavigation && isLastMonth ? (
        <components.NextMonthButton
          type="button"
          className={classNames.button_next}
          tabIndex={nextMonth ? undefined : -1}
          aria-disabled={nextMonth ? undefined : true}
          aria-label={labelNext(nextMonth)}
          onClick={() => {
            if (nextMonth) {
              goToMonth(nextMonth);
            }
          }}
        >
          <components.Chevron
            disabled={nextMonth ? undefined : true}
            className={classNames.chevron}
            orientation={dayPickerProps.dir === 'rtl' ? 'left' : 'right'}
          />
        </components.NextMonthButton>
      ) : (
        <span className="size-10" aria-hidden />
      )}
    </div>
  );
};

const CalendarRoot = ({
  className,
  rootRef,
  ...props
}: {
  rootRef?: Ref<HTMLDivElement> | undefined;
} & HTMLAttributes<HTMLDivElement>) => {
  return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />;
};

const CalendarNav = () => <></>;

const CalendarChevron = ({
  className,
  orientation,
  ...props
}: {
  className?: string | undefined;
  size?: number | undefined;
  disabled?: boolean | undefined;
  orientation?: 'up' | 'down' | 'left' | 'right' | undefined;
}) => {
  if (orientation === 'left') {
    return <ChevronLeftIcon className={cn('size-4', className)} {...props} />;
  }
  if (orientation === 'right') {
    return <ChevronRightIcon className={cn('size-4', className)} {...props} />;
  }
  return <ChevronDownIcon className={cn('size-4', className)} {...props} />;
};

const CalendarWeekNumber = ({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => {
  return (
    <td {...props}>
      <div className="flex size-(--cell-size) items-center justify-center text-center">
        {children}
      </div>
    </td>
  );
};

const CalendarWeekday = ({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) => {
  // Weekday header cells are non-interactive labels (react-day-picker
  // marks this row aria-hidden since day cells carry their own
  // labels) — must not render a real focusable <button> inside an
  // aria-hidden ancestor.
  return (
    <th {...props}>
      {/* Figma weekday cell: 40×32, 12px Text/Secondary, regular. */}
      <span className="flex items-center justify-center w-10 h-8 typo-body-s text-sds-text-secondary">
        {children}
      </span>
    </th>
  );
};
