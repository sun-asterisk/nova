import { cn } from '@/utils';
import { Progress as ProgressPrimitive } from 'radix-ui';
import { type ComponentProps, forwardRef } from 'react';
import { progressBarStyles, type ProgressBarSize } from './ProgressBar.styles';

export type { ProgressBarSize };

/** Radix Progress's own fallback for an invalid `max` (see its `DEFAULT_MAX`). */
const DEFAULT_MAX = 100;

export type ProgressBarProps = Omit<
  ComponentProps<typeof ProgressPrimitive.Root>,
  'value' | 'children'
> & {
  /**
   * Current progress value. Always required — this component is
   * determinate-only. Figma's own guidance is explicit: never keep a
   * Progress Bar visible at a stalled/fake 0% while the real percentage is
   * still unknown — show `Spinner` until it can be calculated, then switch
   * to `ProgressBar`.
   */
  value: number;
  /** The value that represents 100% completion @default 100 */
  max?: number;
  /** Size of the progress bar @default 'small' */
  size?: ProgressBarSize;
  /**
   * Inverts the track/fill colors for placement on dark surfaces or
   * overlays.
   * @default false
   */
  inverse?: boolean;
};

/**
 * A determinate progress indicator — shows how far a measurable process
 * has advanced (Figma's own guideline: "プログレスバーは、処理の進捗を数値で
 * 示します。バーが伸びていくことで、どこまで進んだか、あとどれくらいで終わる
 * かを伝えます。"). Use `Spinner` instead when the remaining time/progress
 * can't be measured — never show both for the same process.
 *
 * The rendered width always reflects the real, measured `value` — Figma's
 * own guidance is explicit that the fill must never be eased/estimated
 * ahead of or stalled behind the actual measurement, since users judge
 * remaining time from how the bar grows.
 *
 * Built on Radix's `Progress` primitive (already a project dependency via
 * the unified `radix-ui` package) — it supplies the correct
 * `role="progressbar"` + `aria-valuemin`/`aria-valuemax`/`aria-valuenow`/
 * `aria-valuetext` (a sensible default percentage label, or a custom one
 * via `getValueLabel`) for free, satisfying Figma's own accessibility
 * guidance that the numeric progress must reach screen readers, not just
 * the visual bar length.
 *
 * Always pass `aria-label` or `aria-labelledby` — Radix's built-in
 * `aria-valuetext` describes the *value* ("42%"), not the widget's *name*
 * (what is progressing). Without one, `role="progressbar"` fails an
 * `aria-progressbar-name` accessibility scan (confirmed via this repo's own
 * addon-a11y gate — see docs/components/progressBar.md §9/§12).
 *
 * @example
 * ```tsx
 * <ProgressBar value={62} max={100} aria-label="Uploading file" />
 *
 * // On a dark surface / overlay
 * <ProgressBar value={40} inverse size="large" aria-label="Loading dashboard" />
 *
 * // Custom accessible value text
 * <ProgressBar
 *   value={18}
 *   max={40}
 *   getValueLabel={(v, m) => `${v} of ${m} images`}
 *   aria-label="Compressing images"
 * />
 * ```
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, size = 'small', inverse = false, ...rest }, ref) => {
    const styles = progressBarStyles({ size, inverse });
    // Radix validates value/max but never clamps: an out-of-range `value`
    // logs a console error and is silently treated as indeterminate (no
    // `aria-valuenow`), and an invalid `max` (<= 0 / NaN) logs an error and
    // falls back to 100. Normalize both here, BEFORE handing them to Radix,
    // so the ARIA output always matches the rendered width:
    // - invalid `max` → Radix's own DEFAULT_MAX (100), mirroring what Radix
    //   itself would do, minus the error and minus a `NaN%` width;
    // - numeric `value` → clamped to [0, max] (an over-range value is
    //   announced as complete, a negative one as 0 — what's visibly shown);
    // - null/undefined/NaN `value` (untyped JS consumers) → stays
    //   indeterminate (`null`), never coerced to 0.
    const safeMax = typeof max === 'number' && max > 0 ? max : DEFAULT_MAX;
    const safeValue =
      typeof value === 'number' && !Number.isNaN(value)
        ? Math.min(Math.max(value, 0), safeMax)
        : null;
    const percent = safeValue === null ? 0 : (safeValue / safeMax) * 100;

    return (
      <ProgressPrimitive.Root
        ref={ref}
        value={safeValue}
        max={safeMax}
        className={cn(styles.root(), className)}
        {...rest}
      >
        <ProgressPrimitive.Indicator
          className={styles.indicator()}
          style={{ width: `${percent}%` }}
        />
      </ProgressPrimitive.Root>
    );
  },
);

ProgressBar.displayName = 'ProgressBar';
