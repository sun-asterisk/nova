import {
  forwardRef,
  useEffect,
  useRef,
  type ComponentProps,
  type ComponentRef,
  type ButtonHTMLAttributes,
  type Ref,
  type RefCallback,
} from 'react';
import type { CalendarDay, Modifiers } from 'react-day-picker';
import { DatePickerButton } from './DatePickerButton';
import { cn } from '@/utils';

// Small local ref-merge helper (same pattern as Modal.tsx/ThemeProvider.tsx)
// — this component needs its own internal ref for the focus effect below,
// alongside any ref a consumer forwards in.
function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}

// `yyyy-MM-dd` from the date's LOCAL calendar fields. react-day-picker's
// `day.date` is local midnight; `toISOString()` (UTC) would shift it to the
// previous day in any UTC+ timezone (e.g. JST). Consumers of `data-day`
// (e.g. DatePicker.stories.tsx) must parse it back as a local date too.
const pad2 = (n: number) => String(n).padStart(2, '0');
const toLocalISODate = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

type DatePickerDayButtonProps = ComponentProps<typeof DatePickerButton> & {
  day: CalendarDay;
  modifiers: Modifiers;
};

export const DatePickerDayButton = forwardRef<
  ComponentRef<typeof DatePickerButton>,
  DatePickerDayButtonProps
>(({ className, day, modifiers, ...props }, ref) => {
  const {
    selected,
    range_start,
    range_end,
    range_middle,
    range_preview,
    range_preview_start,
    today,
    disabled,
    outside,
  } = modifiers;

  // react-day-picker's OWN default `DayButton` does this exact thing (see
  // react-day-picker/dist/esm/components/DayButton.js) — arrow-key
  // navigation (`moveFocus` in DayPicker.js) only updates which day is the
  // roving `modifiers.focused` target in React state; it never calls the
  // DOM `.focus()` API itself. Replacing the default `DayButton` with this
  // custom one (for styling/token wiring) without replicating this effect
  // meant `ArrowLeft/Right/Up/Down`/`Home`/`End`/`PageUp`/`PageDown` were
  // completely non-functional — Tab could reach exactly one day cell and
  // then keyboard users were stuck, with no way to reach any other date.
  // Confirmed via a neutral, non-Storybook browser + real keyboard
  // `ArrowRight` presses: `document.activeElement` never changed from the
  // initially-focused day across 10 presses before this fix.
  const localRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (modifiers.focused) localRef.current?.focus();
  }, [modifiers.focused]);

  const isSingleSelected = selected && !(range_start || range_end || range_middle);

  const isSelected = isSingleSelected || range_start || range_end;
  // `range_preview` (set by DatePickerCalendarGrid): the hover preview from
  // a start date to the cursor — Figma shows it with the In Range style.
  const isRangeMiddle = Boolean(range_middle || (range_preview && !isSelected));
  const isToday = today && !isSelected && !isRangeMiddle;

  return (
    <DatePickerButton
      ref={mergeRefs(ref, localRef)}
      data-day={toLocalISODate(day.date)}
      data-selected={isSelected}
      data-range-middle={isRangeMiddle}
      disabled={disabled}
      className={cn(
        'w-[2.5rem] h-[2.5rem]',
        {
          'text-sds-text-emphasis': isToday,
          'bg-sds-surface-primary text-sds-text-on-surface': isSelected,
          'bg-sds-surface-subtle rounded-sds-0': isRangeMiddle,
          // `outside` days are still real, interactive, keyboard-focusable
          // buttons (not the native `disabled` attribute — see
          // `DatePickerButton.tsx`'s own `disabled:text-sds-text-disable!`,
          // which IS exempt from contrast requirements per
          // .claude/rules/accessibility.md §4.1). `text-sds-text-disable`
          // (#959595 on white) measures 2.99:1 here — a real, confirmed
          // WCAG AA failure for a genuinely operable element (caught by
          // Storybook's automatic axe check once a story left the popover
          // open — earlier stories all closed it before the scan ran).
          // `text-sds-text-secondary` (#5a5a5a, ~6.9:1) keeps outside days
          // visually de-emphasized while passing the 4.5:1 minimum.
          'text-sds-text-secondary': outside && !isSelected,
          // A one-day range (start = end) keeps the full Select radius.
          'rounded-l-sds-200 rounded-r-sds-0':
            (range_start && !range_end) || (range_preview_start && !isRangeMiddle),
          'rounded-r-sds-200 rounded-l-sds-0': range_end && !range_start,
          // Figma Day State=Disabled: regular weight (enabled days are bold).
          'typo-label-l-regular': disabled,
        },
        className,
      )}
      {...props}
    />
  );
});
DatePickerDayButton.displayName = 'DatePickerDayButton';

/**
 * Typed adapter satisfying react-day-picker's exact declared `DayButton`
 * custom-component signature: `(props: {day, modifiers} & ButtonHTMLAttributes) => Element`.
 *
 * A `forwardRef` component's own call signature returns `ReactNode` (which
 * includes `undefined`), not the narrower `Element` react-day-picker's type
 * requires — passing `DatePickerDayButton` directly to `components.DayButton`
 * type-checks incorrectly even though it works correctly at runtime (React
 * has built-in support for rendering `ForwardRefExoticComponent`s wherever a
 * JSX element type is expected). This plain function wrapper has an
 * inferred `JSX.Element` return type, which satisfies react-day-picker's
 * signature exactly with no behavior change.
 */
export const DatePickerDayButtonAdapter = (
  props: { day: CalendarDay; modifiers: Modifiers } & ButtonHTMLAttributes<HTMLButtonElement>,
) => <DatePickerDayButton {...props} />;
