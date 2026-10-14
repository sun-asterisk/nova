import { tv } from 'tailwind-variants';

export type ProgressBarSize = 'small' | 'medium' | 'large';

export const progressBarStyles = tv({
  slots: {
    // Figma: "プログレスバーの横幅は要素を基準に自由に決めて構いません" — no
    // fixed width is documented (its own "サイズ" spec diagram labels the
    // width "Variable to content"), so this fills its container by default;
    // consumers control actual width via a wrapper or `className`.
    root: 'relative w-full overflow-hidden rounded-sds-full',
    indicator: `
      h-full rounded-sds-full
      transition-[width] duration-200 ease-out motion-reduce:transition-none
    `,
  },
  variants: {
    size: {
      small: { root: 'h-[4px]' },
      medium: { root: 'h-[6px]' },
      large: { root: 'h-[8px]' },
    },
    inverse: {
      false: { root: 'bg-sds-surface-subtle', indicator: 'bg-sds-icon-primary' },
      true: { root: 'bg-sds-surface-subtle-inverse', indicator: 'bg-sds-icon-primary-inverse' },
    },
  },
  defaultVariants: {
    size: 'small',
    inverse: false,
  },
});
