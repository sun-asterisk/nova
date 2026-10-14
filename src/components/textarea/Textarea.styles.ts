import { tv } from 'tailwind-variants';
import { FOCUS_RING_OFFSET_2 } from '@/utils';

// Figma "Text Area" (598:2713) sync, 2026-10-05 (/component TextArea):
// - Focus ring offset 2px (Figma Focus Ring: stroke OUTSIDE, radius 6 = 4 + 2)
//   — Figma overrides the "text element → 3px" default (design-foundation §5.1).
//   `transition-[background-color,border-color]`, not `transition-colors`,
//   so outline-color never animates (focusRing.ts).
// - Hover: `surface-subtle-hover`, gated on `enabled:` so a disabled textarea
//   never reacts (design-foundation §5.3).
// - Disabled is an axis independent of `variant`, because Figma Text Area keeps
//   the error border/placeholder when disabled. Text Field in the same file
//   differs; confirmed 2026-10-06 that each component follows its own Figma
//   (intended — do not align them). See textarea.md §13.
export const textareaStyles = tv({
  base: `
    w-full min-w-[320px] bg-sds-surface-base rounded-sds-100 !text-sds-text-primary typo-body-m
    border
    ${FOCUS_RING_OFFSET_2}
    transition-[background-color,border-color] duration-200
    placeholder:text-sds-text-placeholder
    enabled:hover:bg-sds-surface-subtle-hover
    p-sds-150 resize-y
    min-h-[98px] max-h-[230px]
  `,
  variants: {
    variant: {
      default: 'border-sds-border-strong',
      error: 'border-sds-border-danger',
    },
    disabled: {
      true: 'bg-sds-surface-disabled cursor-not-allowed',
      false: '',
    },
  },
  compoundVariants: [
    // Figma: Status=Default, State=Disabled — disable border + placeholder.
    // (Status=Error, State=Disabled keeps border-danger / text-placeholder.)
    {
      variant: 'default',
      disabled: true,
      class: 'border-sds-border-disable placeholder:text-sds-text-disable',
    },
  ],
  defaultVariants: {
    variant: 'default',
    disabled: false,
  },
});
