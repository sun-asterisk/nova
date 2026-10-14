import { cn } from '@/utils';
import { type ComponentProps, forwardRef, type ReactNode } from 'react';
import { IconExclamationCircle } from '../icons';
import { badgeDotIndicatorClassName, badgeStyles } from './Badge.styles';

/** Available badge variants */
export type BadgeVariant = 'count' | 'dot' | 'label' | 'error';

/** Corner a badge anchors to when `position` is set */
export type BadgePosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

/**
 * Badge component props extending standard HTML span attributes
 */
export type BadgeProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Visual style variant of the badge @default 'count' */
  variant?: BadgeVariant;
  /** Label text for count and label variants */
  label?: string;
  /**
   * Maximum numeric value before the displayed `label` is truncated with a
   * "+" suffix (e.g. `max={99}` turns `label="150"` into `"99+"`). Only
   * applies when `label` parses as a finite number — has no effect on
   * non-numeric labels like `"New"`.
   * @default undefined — no truncation, `label` renders as-is
   */
  max?: number;
  /**
   * Anchors the badge to a corner via absolute positioning, for overlaying
   * it on an icon/avatar. The nearest ancestor must have `position: relative`
   * (or similar) for this to anchor correctly — Badge does not create that
   * wrapper itself.
   * @default undefined — static/inline placement (current default)
   */
  position?: BadgePosition;
  /** Custom content to render inside badge (overrides label) */
  children?: ReactNode;
};

/**
 * A flexible badge component for displaying notifications, counts, status indicators, and labels.
 * Supports different visual variants with optimized rendering.
 *
 * Not a live region by default — pass `role="status"` only when the badge's
 * value updates while the user is on the page and should be announced.
 * Uses no hooks, so it renders in React Server Components.
 *
 * @example
 * ```tsx
 * // Count badge
 * <Badge variant="count" label="99+" />
 *
 * // Count badge with automatic truncation ("150" renders as "99+")
 * <Badge variant="count" label="150" max={99} />
 *
 * // Dot indicator
 * <Badge variant="dot" />
 *
 * // Label badge
 * <Badge variant="label" label="New" />
 *
 * // Error indicator
 * <Badge variant="error" />
 *
 * // Custom content
 * <Badge variant="count">
 *   <CustomIcon />
 * </Badge>
 *
 * // Anchored to a corner — wrapper needs `position: relative`
 * <div className="relative inline-flex">
 *   <Avatar />
 *   <Badge variant="dot" position="top-right" aria-label="Online" />
 * </div>
 * ```
 */

let hasWarnedUnlabeledDot = false;

function warnUnlabeledDotOnce(): void {
  if (hasWarnedUnlabeledDot) return;
  hasWarnedUnlabeledDot = true;
  console.warn(
    '[Sun Badge] variant="dot" renders a decorative-only indicator with no visible text. ' +
      'Screen-reader users will hear nothing unless you provide an `aria-label` (or ' +
      '`aria-labelledby`), e.g. <Badge variant="dot" aria-label="Online" />.',
  );
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'count', label, max, position, className, children, ...rest }, ref) => {
    const badgeClassName = cn(badgeStyles({ variant, position }), className);

    // The `dot` variant's only visible content is a decorative,
    // `aria-hidden` circle (see `content` below) — its accessible name comes
    // entirely from a consumer-provided `aria-label`/`aria-labelledby`. A
    // Dot badge shipped without one is a real, silent accessibility gap
    // (Phase 5.5 LOGIC-BADGE-01 / Phase 14 P3-1), so it is warned about.
    // Warned unconditionally (not gated behind NODE_ENV), matching the
    // established convention in ThemeProvider.tsx.
    //
    // Deliberately NOT a hook (NX-02, 2026-09-29): an earlier `useEffect`
    // here made Badge fail in a React Server Component ("useEffect only
    // works in Client Components") — Badge has no interactivity and must
    // stay RSC-safe. The check runs during render instead, deduplicated
    // once per module instance so re-renders/StrictMode don't spam it.
    const hasExplicitName = Boolean(rest['aria-label'] || rest['aria-labelledby']);
    if (variant === 'dot' && !hasExplicitName) warnUnlabeledDotOnce();

    // Truncates a numeric `label` to "`${max}+`" once it exceeds `max` — has
    // no effect on non-numeric labels (e.g. "New") or when `max` is unset.
    // The same truncated value is used for both the visible content and the
    // accessible name below, so a screen reader announces what's shown.
    const displayLabel = (() => {
      if (max === undefined || label === undefined) return label;
      const numeric = Number(label);
      if (!Number.isFinite(numeric)) return label;
      return numeric > max ? `${max}+` : label;
    })();

    const content = (() => {
      if (children) return children;

      // Figma reserves a 24x24 anchor footprint for the Dot variant (see
      // Badge.styles.ts) with only the visible 10x10 circle centered inside
      // it — rendered here as a decorative inner element, `aria-hidden`
      // since the accessible name comes from the outer span's `aria-label`.
      if (variant === 'dot') {
        return <span aria-hidden="true" className={badgeDotIndicatorClassName} />;
      }

      if (variant === 'error') {
        // Reuses the shared `IconExclamationCircle` (also used by
        // TextField/TextareaField/Snackbar) rather than forking a
        // near-duplicate icon. Figma's Badge/Error glyph (node 1065:506) is
        // a visually smaller ring than this icon's native proportions
        // (outer radius 8px vs. this icon's 10px, within the same 24x24
        // canvas) — sized at 19.2px (24 * 8/10) here so the rendered ring
        // matches Figma's 16px ring diameter, centered in the badge's own
        // 24x24 footprint (see the `error` variant in Badge.styles.ts).
        // This scales the ring stroke down proportionally too (2px -> 1.6px,
        // vs. Figma's 1.36px) — close enough to be visually indistinguishable
        // at real badge sizes, without maintaining a second icon asset.
        return <IconExclamationCircle width={19.2} height={19.2} />;
      }

      return displayLabel;
    })();

    // Semantics (RR-02, 2026-09-29, accessibility.md §2.1): a Badge is NOT
    // a live region by default. `role="status"` on every badge made static
    // labels/counts announce as status updates and bled into the accessible
    // name of whatever contains them (e.g. a Tab). Consumers whose badge
    // content genuinely updates asynchronously opt in by passing
    // `role="status"` themselves (`rest` is spread last, so it wins).
    //  - count/label/children: plain text, read as-is — no role, no
    //    redundant aria-label (a name on a generic <span> is prohibited).
    //  - dot/error: no visible text, so the root is a named graphic
    //    (`role="img"`). `error` carries a built-in name; `dot` gets
    //    `role="img"` only once the consumer names it — unnamed, it stays a
    //    plain decorative span (and warns, above).
    // Spread AFTER `rest`, with consumer values resolved via `??`: a
    // consumer `role`/`aria-label` still wins, but an explicit
    // `aria-label={undefined}` (common conditional-prop pattern) can no
    // longer erase the built-in error name (BD-01, 2026-09-29).
    const graphicSemantics =
      variant === 'error'
        ? { role: rest.role ?? 'img', 'aria-label': rest['aria-label'] ?? 'Error badge' }
        : variant === 'dot' && !children && hasExplicitName
          ? { role: rest.role ?? 'img' }
          : undefined;

    return (
      <span ref={ref} className={badgeClassName} {...rest} {...graphicSemantics}>
        {content}
      </span>
    );
  },
);

Badge.displayName = 'Badge';
