import { cn } from '@/utils';
import { type ComponentProps, forwardRef } from 'react';
import { SPINNER_DIMENSIONS, spinnerStyles, type SpinnerSize } from './Spinner.styles';

export type { SpinnerSize };

export type SpinnerProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Size of the spinner @default 'small' */
  size?: SpinnerSize;
  /**
   * Inverts the track/arc colors for placement on dark surfaces or overlays
   * (Figma's own guideline: "濃い色の面やオーバーレイの上に配置する場合は
   * Inverse を有効にしてください").
   * @default false
   */
  inverse?: boolean;
  /**
   * Accessible text announced to assistive technology while the spinner is
   * mounted — visually hidden. Figma's own accessibility guidance is
   * explicit that the spinner is a purely visual representation and that a
   * screen-reader environment must be told a process is running via text
   * (and, separately, that its own completion must also be announced —
   * that part is a consumer responsibility once real content replaces the
   * spinner, since the spinner itself has no notion of "done").
   * @default 'Loading'
   */
  label?: string;
};

/**
 * A rotating indeterminate loading indicator — shown while a process is
 * running but its completion percentage is unknown (Figma's own guideline:
 * use `Spinner` when remaining time/progress can't be measured; use a
 * progress bar instead when it can — never show both for the same
 * process).
 *
 * Purely presentational: mount it while a process is running, unmount it
 * (swapping in real content or a completion message) when done. It does
 * not track time, delay, or minimum-display-duration — Figma's own spec
 * calls for a 500ms minimum display time before removing it (to avoid a
 * flicker), which is a consumer-side timing concern, not something this
 * component can own on its own.
 *
 * @example
 * ```tsx
 * <Spinner size="large" label="Loading dashboard" />
 *
 * // On a dark surface / overlay
 * <Spinner inverse size="large" />
 * ```
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'small', inverse = false, label = 'Loading', ...rest }, ref) => {
    const styles = spinnerStyles({ size, inverse });
    const { box, stroke } = SPINNER_DIMENSIONS[size];
    const radius = (box - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    // Figma: "円弧は全周の33%" — the arc always covers 33% of the circle.
    const arcLength = circumference * 0.33;

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        className={cn(styles.root(), className)}
        {...rest}
      >
        <svg
          className={styles.svg()}
          width={box}
          height={box}
          viewBox={`0 0 ${box} ${box}`}
          aria-hidden="true"
        >
          <circle
            className={styles.track()}
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
          />
          <circle
            className={styles.arc()}
            cx={box / 2}
            cy={box / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
          />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    );
  },
);

Spinner.displayName = 'Spinner';
