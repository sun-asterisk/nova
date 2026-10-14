import { tv } from 'tailwind-variants';
import { FOCUS_RING_OFFSET_2 } from '@/utils';

// Focus ring: `FOCUS_RING_OFFSET_2` from `src/utils/focusRing.ts` — see that
// file for the full composition rules. Only the gated
// `disabled:focus-visible:outline-none` below is component-specific.
//
// The 8px selected dot is the Indicator's <svg>; its fill lives here
// (`[&_svg]:fill-*`) so the disabled variant can recolor it.
//
// Disabled (Figma Radio 17503:9702, State=Disabled, synced 2026-10-06):
// surface-disabled fill whether or not the item is selected, border-disable,
// and an icon-disable dot — identical for Status=Default and Status=Error.
// The item kept the white surface-base fill when unselected and drew a
// surface-base dot (nearly invisible on surface-disabled) when selected.
// Same fix as Checkbox (Checkbox.styles.ts).
export const radioGroupItemStyles = tv({
  base: `
    m-0.75 aspect-square size-4.5 shrink-0 rounded-sds-full border
    transition-[color,box-shadow]
    ${FOCUS_RING_OFFSET_2}
    disabled:cursor-not-allowed disabled:focus-visible:outline-none
    bg-sds-surface-base [&_svg]:fill-sds-surface-base
  `,
  variants: {
    variant: {
      default: `
        border-sds-border-strong text-sds-text-primary
        hover:bg-sds-surface-secondary-hover
        data-[state=checked]:bg-sds-surface-primary
        data-[state=checked]:hover:bg-sds-surface-primary-hover
      `,
      error: `
        border-sds-border-danger text-sds-text-danger
        hover:bg-sds-background-danger
        data-[state=checked]:bg-sds-surface-danger
        data-[state=checked]:hover:bg-sds-surface-danger
      `,
      disabled: `
        bg-sds-surface-disabled border-sds-border-disable text-sds-text-disable
        [&_svg]:fill-sds-icon-disable
      `,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
