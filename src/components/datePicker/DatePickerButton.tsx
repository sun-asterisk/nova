import { tv } from 'tailwind-variants';
import { Slot } from 'radix-ui';
import { forwardRef, type ComponentProps, type ComponentRef } from 'react';

import { cn, FOCUS_RING_OFFSET_2 } from '@/utils';

const datePickerButton = tv({
  // Focus ring: `FOCUS_RING_OFFSET_2` from `src/utils/focusRing.ts` — see
  // that file for the full composition rules. This exact element previously
  // had a live "unconditional outline-none" bug: every day cell in the
  // calendar grid (via `DatePickerDayButton`) had no visible focus ring at
  // all — a real, confirmed keyboard-accessibility regression in the most
  // heavily keyboard-navigated part of DatePicker.
  base: [
    // base
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    // `transition-colors`/`transition-all` both include `outline-color` in
    // their transitioned property list — combined with a `focus-visible`
    // outline, that makes the ring visibly ANIMATE in from the element's
    // `currentColor` (its own text color, since outline-color is unset
    // while unfocused) to the real `border-focus` blue over the transition
    // duration, instead of snapping instantly. Confirmed via a neutral,
    // non-Storybook browser + real keyboard Tab + `getComputedStyle()`
    // sampled immediately after focus vs. after a wait: immediately after,
    // `outline-color` read back as the day's own text color (e.g. Today's
    // red `text-emphasis`) instead of blue, settling to the correct blue
    // only ~300ms later — a real, visible mis-colored flash on every
    // keyboard move through the calendar grid. Scoping the transition to
    // exactly the properties that should animate (hover's `ring`/bg/text)
    // avoids touching `outline-color` at all.
    'rounded-sds-200 shrink-0 transition-[background-color,box-shadow,color]',
    'typo-label-l-bold text-sds-text-primary',

    // disabled
    'disabled:text-sds-text-disable! disabled:cursor-not-allowed!',

    // hover — gated on `:enabled` so minDate/maxDate-disabled days (native
    // `disabled` attribute, set by react-day-picker) show no hover ring
    // (design-foundation.md §5.3, P0: disabled suppresses every other state).
    'enabled:hover:ring-1 enabled:hover:ring-sds-border-basic',

    // focus
    FOCUS_RING_OFFSET_2,
  ],
});

type DatePickerButtonProps = ComponentProps<'button'> & {
  asChild?: boolean;
};

export const DatePickerButton = forwardRef<ComponentRef<'button'>, DatePickerButtonProps>(
  ({ asChild, className, ...props }, ref) => {
    const Component = asChild ? Slot.Root : 'button';

    return (
      <Component
        ref={ref}
        data-slot="button"
        className={cn(datePickerButton(), className)}
        {...props}
      />
    );
  },
);
DatePickerButton.displayName = 'DatePickerButton';
