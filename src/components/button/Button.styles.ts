import { tv } from 'tailwind-variants';
import { FOCUS_RING_OFFSET_2 } from '@/utils';

export const buttonStyles = tv({
  base: `
    cursor-pointer inline-flex items-center justify-center
    ${FOCUS_RING_OFFSET_2}
  `,
  variants: {
    variant: {
      primary: `
        bg-sds-surface-primary border-none text-sds-text-on-surface
        hover:bg-sds-surface-primary-hover
        active:bg-sds-surface-primary-active
        disabled:bg-sds-surface-disabled disabled:text-sds-text-disable disabled:cursor-not-allowed
      `,
      secondary: `
        border border-sds-border-strong bg-sds-surface-base text-sds-text-primary
        hover:bg-sds-surface-secondary-hover
        active:bg-sds-surface-secondary-active
        disabled:bg-sds-surface-disabled disabled:text-sds-text-disable disabled:border-sds-border-disable disabled:cursor-not-allowed
      `,
      emphasis: `
        bg-sds-surface-emphasis text-sds-text-on-surface border-none
        hover:bg-sds-surface-emphasis-hover
        active:bg-sds-surface-emphasis-active
        disabled:bg-sds-surface-disabled disabled:text-sds-text-disable disabled:cursor-not-allowed
      `,
      // `disabled:bg-transparent` is required, not redundant with the base
      // `bg-transparent`: Tailwind emits `disabled:` after `hover:`/`active:`,
      // so only a `disabled:`-prefixed background can override the hover/active
      // fill on a disabled Button (design-foundation.md §5.3, P0). Every other
      // variant already gets this from its own `disabled:bg-sds-surface-disabled`.
      plain: `
        border-none bg-transparent text-sds-text-primary
        hover:bg-sds-surface-secondary-hover
        active:bg-sds-surface-secondary-active
        disabled:bg-transparent disabled:text-sds-text-disable disabled:cursor-not-allowed disabled:border-none
      `,
      danger: `
        border border-sds-border-danger bg-sds-surface-base text-sds-text-danger
        hover:bg-sds-background-danger
        active:bg-sds-background-danger
        disabled:bg-sds-surface-disabled disabled:text-sds-text-disable disabled:border-sds-border-disable disabled:cursor-not-allowed
      `,
    },
    size: {
      small: `
        p-sds-100 gap-1 rounded-sds-200 min-w-[40px] h-[32px] typo-label-s-bold
        [&_svg]:w-4 [&_svg]:h-4
      `,
      medium: `
        p-sds-150 gap-1 rounded-sds-200 min-w-[52px] h-[40px] typo-label-m-bold
        [&_svg]:w-5 [&_svg]:h-5
      `,
      large: `
        p-sds-200 gap-2 rounded-sds-200 min-w-[64px] h-[48px] typo-label-l-bold
        [&_svg]:w-6 [&_svg]:h-6
      `,
    },
    // Figma "Icon Button" (component set 3700:7301): square. Width follows
    // the size's fixed height via aspect-ratio, and the label-sized min-width
    // is dropped — no new arbitrary dimension needed.
    iconOnly: {
      true: 'aspect-square min-w-0',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'small',
    iconOnly: false,
  },
});
