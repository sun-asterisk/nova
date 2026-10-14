import { tv } from 'tailwind-variants';

// `transition-[background-color,border-color]` (not `transition-colors`):
// `transition-colors` includes `outline-color` in its transitioned property
// list, which is the exact class of bug design-foundation.md §5.1 documents
// as a confirmed, real focus-ring color flash in Checkbox/DatePickerButton
// (outline-color animating from `currentColor` to `border-focus` over the
// transition duration) — applies equally here via `focus-within:outline-*`.
// Scoped preventively; not independently re-verified via a real-browser
// timing test this session.
//
// Figma "Text Field" (610:2971) sync, 2026-10-05: resting background is
// `surface-base` (Figma's token; same value as the previous `background-base`
// in both themes); the focus ring is offset 2px (Figma Focus Ring: stroke
// OUTSIDE, 2px outside the field, radius 6 = 4 + 2). The ring stays a
// hand-written `focus-within:` chain rather than FOCUS_RING_OFFSET_2 because
// it must live on the wrapper around the adornments, which never receives
// focus itself (design-foundation.md §5.1 structural exception). The
// placeholder color is NOT here: this class string is applied to the wrapper
// <div>, which has no ::placeholder — see Input.tsx.
export const inputStyles = tv({
  base: `
    border border-sds-border-strong bg-sds-surface-base rounded-sds-100 !text-sds-text-primary typo-body-l
    focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-sds-border-focus
    transition-[background-color,border-color] duration-200
    h-[40px] [&_svg]:w-[24px] [&_svg]:h-[24px]
  `,
  variants: {
    variant: {
      // Figma State=Hover (both Status values): a single translucent fill.
      default: `
        border-sds-border-strong
        hover:bg-sds-surface-subtle-hover
        focus-within:border-sds-border-focus
      `,
      error: `
        border-sds-border-danger
        hover:bg-sds-surface-subtle-hover
      `,
      disabled: `
        bg-sds-surface-disabled text-sds-text-disable cursor-not-allowed !text-sds-text-disable border-sds-border-disable
      `,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
