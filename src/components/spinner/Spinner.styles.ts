import { tv } from 'tailwind-variants';

export type SpinnerSize = 'small' | 'medium' | 'large';

/**
 * Fixed size → { box, stroke } px map. Figma documents exactly 3 discrete
 * sizes with a matching track/arc stroke width each ("サイズ" spec: Small
 * 16px/1.5px, Medium 24px/2px, Large 40px/3px) — no continuous/custom
 * sizing is defined, so this stays a closed lookup rather than a formula.
 */
export const SPINNER_DIMENSIONS: Record<SpinnerSize, { box: number; stroke: number }> = {
  small: { box: 16, stroke: 1.5 },
  medium: { box: 24, stroke: 2 },
  large: { box: 40, stroke: 3 },
};

export const spinnerStyles = tv({
  slots: {
    root: 'relative inline-flex shrink-0',
    // `spinner-rotate` keyframes are defined in src/styles.css (not
    // Tailwind's built-in `animate-spin`, which is linear/360°) — see
    // docs/components/spinner.md for the full derivation of the -90deg to
    // 268deg range (Figma: 12-o'clock start, 358° clockwise sweep) and the
    // cubic-bezier(0.5, 0.2, 0.5, 0.8) easing.
    svg: 'origin-center animate-spinner-rotate motion-reduce:animate-none',
    track: '',
    arc: '',
  },
  variants: {
    size: {
      small: { root: 'size-[16px]' },
      medium: { root: 'size-[24px]' },
      large: { root: 'size-[40px]' },
    },
    inverse: {
      false: { track: 'stroke-sds-surface-subtle', arc: 'stroke-sds-icon-primary' },
      true: { track: 'stroke-sds-surface-subtle-inverse', arc: 'stroke-sds-icon-primary-inverse' },
    },
  },
  defaultVariants: {
    size: 'small',
    inverse: false,
  },
});
