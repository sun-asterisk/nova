import { tv } from 'tailwind-variants';
import { FOCUS_RING_OFFSET_2 } from '@/utils';

// `size-[18px]` (below) matches Figma's Checkbox "Bounding box" exactly,
// confirmed across all 18 State x Status x Value combinations. No numeric
// spacing-scale step lands on 18 (16 and 24 are the neighbors), so this is
// a deliberate arbitrary value, not a missed token.
// Focus ring: `FOCUS_RING_OFFSET_2` from `src/utils/focusRing.ts` — see that
// file for the full composition rules (no unconditional `outline-none`, no
// `transition-all`/`transition-colors` pairing). Only the gated
// `disabled:focus-visible:outline-none` below is component-specific.
//
// `transition-[background-color]` (not `transition-all`, found and fixed
// 2026-09-09): `transition-all` includes `outline-color` in its transitioned
// property list, and since `outline-color` is unset while unfocused
// (computing as `currentColor` — the checkbox's own icon/text color), the
// ring visibly animated from that wrong color to the real `border-focus`
// blue over ~300-400ms on every keyboard focus — a real, confirmed flash,
// not just a `getComputedStyle()` timing artifact (verified via a neutral
// non-Storybook page + real keyboard `Tab`: `rgb(0,4,7)` → `rgb(4,100,190)`
// over 400ms). This is exactly the bug class design-foundation.md §5.1
// already documents for `DatePickerButton`.
//
// Disabled (Figma Checkbox 17503:9619, State=Disabled, synced 2026-10-06):
// surface-disabled fill, border-disable border and an icon-disable check /
// minus — identical for Status=Default and Status=Error, and with no opacity.
// The box used `disabled:opacity-50` plus the enabled `icon-on-surface` icon,
// so a checked disabled box was nearly indistinguishable from an unchecked one.
export const checkboxStyles = tv({
  base: `
    m-0.75 border rounded-sds-100 transition-[background-color]
    size-[18px] [&_svg]:w-3.5 [&_svg]:h-3.5
    flex items-center justify-center shrink-0
    cursor-pointer
    disabled:cursor-not-allowed disabled:focus-visible:outline-none
    ${FOCUS_RING_OFFSET_2}
    data-[state=checked]:text-sds-icon-on-surface
    data-[state=indeterminate]:text-sds-icon-on-surface
  `,
  variants: {
    variant: {
      default: `
        border-sds-border-strong bg-sds-surface-base
        hover:bg-sds-surface-secondary-hover
        data-[state=checked]:bg-sds-surface-primary
        data-[state=indeterminate]:bg-sds-surface-primary
        data-[state=checked]:hover:bg-sds-surface-primary-hover
        data-[state=indeterminate]:hover:bg-sds-surface-primary-hover
      `,
      error: `
        border-sds-border-danger bg-sds-surface-base
        hover:bg-sds-background-danger
        data-[state=checked]:bg-sds-surface-danger
        data-[state=indeterminate]:bg-sds-surface-danger
        data-[state=checked]:hover:bg-sds-surface-danger
        data-[state=indeterminate]:hover:bg-sds-surface-danger
      `,
      disabled: `
        bg-sds-surface-disabled border-sds-border-disable
        data-[state=checked]:bg-sds-surface-disabled
        data-[state=indeterminate]:bg-sds-surface-disabled
        data-[state=checked]:text-sds-icon-disable
        data-[state=indeterminate]:text-sds-icon-disable
      `,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
