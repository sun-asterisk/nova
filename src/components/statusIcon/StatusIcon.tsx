import { cn } from '@/utils';
import { type ComponentProps, forwardRef } from 'react';
import {
  IconCheckCircle,
  IconExclamationCircle,
  IconExclamationTriangle,
  IconInfoCircle,
} from '../icons';
import { Spinner } from '../spinner';
import { statusIconColorClass, type StatusIconValue } from './StatusIcon.styles';

export type { StatusIconValue };

export type StatusIconProps = Omit<ComponentProps<'span'>, 'children'> & {
  /**
   * Which fixed icon+color combination to show. `loading` composes
   * `Spinner` rather than a static icon — Figma's own doc page for this
   * component is explicitly unfinished ("執筆中") and has not yet decided
   * whether `loading` will remain once the `Alert` component is designed;
   * it is included here because it exists as a real, working Figma variant
   * today, but flagged as provisional — see Known Limitations in
   * docs/components/statusIcon.md.
   */
  status: StatusIconValue;
  /**
   * Inverts the color for placement on dark surfaces.
   * @default false
   */
  inverse?: boolean;
};

const ICON_BY_STATUS = {
  info: IconInfoCircle,
  success: IconCheckCircle,
  caution: IconExclamationTriangle,
  danger: IconExclamationCircle,
} as const;

/**
 * A fixed icon+color pairing that conveys the type of information or the
 * result of a process (Figma's own guideline: "情報の種類や処理の結果を、
 * 決まったアイコンと色の組み合わせで示すアイコン"). Use this — not a raw
 * `Icon/*` — whenever the meaning is one of `info`/`success`/`caution`/
 * `danger`/`loading`, so the icon+color combination stays consistent
 * everywhere it's used. Reach for a plain icon component directly only when
 * you want an arbitrary icon Figma's own "Don't" is explicit about this:
 * "任意のアイコンを置きたい場合は `Icon / *` を直接使用".
 *
 * Decorative by default (`aria-hidden`) — Figma's own documented usage is
 * always paired with adjacent visible text (a notification/result message)
 * that already conveys the meaning (`.claude/rules/accessibility.md` §5.2:
 * an icon paired with visible text should be `aria-hidden`). Pass
 * `aria-label` when using it as a standalone, sole indicator instead — the
 * default `aria-hidden` is automatically dropped in favor of `role="img"`
 * plus your label.
 *
 * @example
 * ```tsx
 * // Paired with text — the icon is decorative, the text carries the meaning
 * <div className="flex items-center gap-2">
 *   <StatusIcon status="success" />
 *   <span>Saved successfully</span>
 * </div>
 *
 * // Standalone — needs its own accessible name
 * <StatusIcon status="danger" aria-label="Error" />
 *
 * // On a dark surface / overlay
 * <StatusIcon status="info" inverse />
 * ```
 */
export const StatusIcon = forwardRef<HTMLSpanElement, StatusIconProps>(
  ({ status, inverse = false, className, ...rest }, ref) => {
    const isLabeled = 'aria-label' in rest || 'aria-labelledby' in rest;

    return (
      <span
        ref={ref}
        aria-hidden={isLabeled ? undefined : true}
        role={isLabeled ? 'img' : undefined}
        className={cn('relative inline-flex size-[24px] items-center justify-center', className)}
        {...rest}
      >
        {status === 'loading' ? (
          // Spinner's own `role="status"`/live-region announcement is
          // superseded by this span's own accessibility handling above
          // (either `aria-hidden` suppresses the whole subtree, or
          // `role="img"` prunes descendant semantics per ARIA's flattening
          // behavior for image-like roles) — `label` is still forwarded
          // here purely as defense-in-depth, not the primary mechanism.
          // Figma Status=Loading (8867:2712): a Spinner Size=Medium instance
          // (24px, 2px stroke) scaled down to 20px inside the 24px box — the
          // svg scales via its viewBox, so the stroke stays proportional
          // (~1.67px). Was Spinner small (16px, 1.5px) — corrected 2026-10-07.
          <Spinner
            size="medium"
            inverse={inverse}
            label={rest['aria-label'] ?? 'Loading'}
            className="size-5 [&_svg]:size-full"
          />
        ) : (
          (() => {
            const Icon = ICON_BY_STATUS[status];
            return (
              <Icon className={statusIconColorClass[status][inverse ? 'inverse' : 'default']} />
            );
          })()
        )}
      </span>
    );
  },
);

StatusIcon.displayName = 'StatusIcon';
