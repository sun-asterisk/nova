import { cn } from '@/utils';
import { Avatar as AvatarPrimitive } from 'radix-ui';
import { type ComponentProps, forwardRef, type ReactNode, useId } from 'react';
import { IconUser } from '../icons';
import { avatarStatusColorClass, avatarStyles } from './Avatar.styles';

/** Available avatar sizes */
export type AvatarSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge';

/** Available presence-status colors */
export type AvatarStatusValue = 'online' | 'away' | 'busy' | 'offline';

/**
 * Avatar component props extending Radix Avatar Root.
 */
export type AvatarProps = ComponentProps<typeof AvatarPrimitive.Root> & {
  /** Size of the avatar @default 'medium' */
  size?: AvatarSize;
  /** Image URL. When provided (and loads successfully), takes priority over `initial`/`icon`. */
  src?: string;
  /**
   * Accessible name of the avatar — the person's/organization's name.
   * Avatar is identification information, not decoration (Figma's own
   * accessibility guidance: pair the avatar with the person's name, either
   * as adjacent visible text or via `alt`). When set (or when `aria-label`/
   * `aria-labelledby` is passed), the whole avatar is exposed as ONE named
   * graphic (`role="img"`) — whether it shows the photo, initials, or icon —
   * and the status label, if any, is appended to that name. Omit it (empty)
   * only when the name is already visible as adjacent text.
   */
  alt?: string;
  /**
   * Fallback initials (1-2 characters recommended — Figma's own guideline:
   * "イニシャルは全角1文字、半角2文字までに収めます" — full-width 1 character
   * or half-width 2 characters max), shown when `src` is absent or fails to
   * load. Takes priority over `icon`.
   */
  initial?: string;
  /**
   * Fallback icon, shown when neither `src` nor `initial` resolve to
   * content. Defaults to a generic person icon (`IconUser`) — matching
   * Figma's own "Icon / User" reference for this exact fallback.
   */
  icon?: ReactNode;
  /**
   * Adds a 2px, page-background-colored outer ring — for visually
   * separating overlapping/stacked avatars (Figma: "重ねて並べる場合は Ring
   * を有効にし、隣接するアバターとの境界を明確にします").
   * @default false
   */
  ring?: boolean;
  /**
   * Presence-status dot, overlaid bottom-right. Not shown at `size="xsmall"`
   * (Figma's own explicit constraint: "XSmall はステータス非対応"). Must be
   * paired with a text label (`statusLabel`, or the built-in default) —
   * color alone must never convey status (Figma's own accessibility
   * guidance, matching `.claude/rules/accessibility.md` §4.3).
   */
  status?: AvatarStatusValue;
  /**
   * Accessible (visually-hidden) text naming the status shown by `status`.
   * Defaults to the capitalized status value (e.g. `'online'` → "Online")
   * if omitted, so the status is never silently color-only even if a
   * consumer forgets to pass this.
   */
  statusLabel?: string;
};

const DEFAULT_STATUS_LABEL: Record<AvatarStatusValue, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

/**
 * A circular display element for identifying a user or organization —
 * photo, initials, or a generic icon, in that priority order (Figma's own
 * guideline: "写真が取得できる場合は写真を、取得できない場合はイニシャルを、
 * それも無ければ汎用アイコンを表示"). Not interactive by itself — Figma's own
 * guideline is explicit: "アバターは相手を見分けるための要素であり、それ自体
 * が操作を持ちません" (an avatar is for identification; it has no
 * interaction of its own). Wrap it in a `Button`/`Link` if it needs to be
 * clickable.
 *
 * Always circular — never change the aspect ratio or use a rounded
 * rectangle/ellipse (Figma's own guideline is explicit and non-negotiable
 * about this).
 *
 * @example
 * ```tsx
 * // Photo, falling back to initials, falling back to a generic icon
 * <Avatar src={user.photoUrl} alt={user.name} initial="鈴" />
 *
 * // Stacked/overlapping avatars
 * <div className="flex -space-x-2">
 *   <Avatar ring src={a.photoUrl} alt={a.name} />
 *   <Avatar ring src={b.photoUrl} alt={b.name} />
 * </div>
 *
 * // With a presence status
 * <Avatar src={user.photoUrl} alt={user.name} status="online" />
 * ```
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  (
    {
      className,
      size = 'medium',
      src,
      alt = '',
      initial,
      icon,
      ring = false,
      status,
      statusLabel,
      ...props
    },
    ref,
  ) => {
    const styles = avatarStyles({ size, ring });
    // XSmall doesn't support status — Figma's own explicit constraint.
    const showStatus = Boolean(status) && size !== 'xsmall';
    const statusText = status ? (statusLabel ?? DEFAULT_STATUS_LABEL[status]) : undefined;
    const statusId = useId();

    // Accessible name (NX-05, 2026-09-29). Radix's Avatar Root is a plain,
    // role-less <span>: only a loaded <img alt> carries a name, so an
    // initials/icon avatar had no naming path, and `aria-label` on the
    // role-less span is prohibited (axe `aria-prohibited-attr`). When the
    // consumer names the avatar (alt / aria-label / aria-labelledby), the
    // Root becomes a single named graphic, the common pattern for a
    // composite image (WAI-ARIA `img` role). `img` children are
    // presentational, so the inner <img> gets alt="" (no duplicate name)
    // and the status text is folded into the Root's own name.
    const {
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      role: roleProp,
      ...rootProps
    } = props;
    const name = ariaLabel ?? (alt || undefined);
    const isNamed = Boolean(name || ariaLabelledBy);
    const statusShown = showStatus && statusText;
    const namingProps = isNamed
      ? {
          role: roleProp ?? 'img',
          ...(ariaLabelledBy
            ? {
                'aria-labelledby': statusShown ? `${ariaLabelledBy} ${statusId}` : ariaLabelledBy,
              }
            : { 'aria-label': statusShown ? `${name}, ${statusText}` : name }),
        }
      : { role: roleProp, 'aria-label': ariaLabel, 'aria-labelledby': ariaLabelledBy };

    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(styles.root(), className)}
        {...namingProps}
        {...rootProps}
      >
        {src && (
          <AvatarPrimitive.Image className={styles.image()} src={src} alt={isNamed ? '' : alt} />
        )}
        {/* `delayMs` only when `src` is set — Radix's Fallback applies the
        delay unconditionally whenever the prop is present, even with no
        Image mounted at all, which would otherwise make the fallback (the
        common case: no photo, initials/icon only) delay for no reason. */}
        <AvatarPrimitive.Fallback
          data-slot="avatar-fallback"
          className={styles.fallback()}
          delayMs={src ? 200 : undefined}
        >
          {initial || icon || <IconUser />}
        </AvatarPrimitive.Fallback>
        {showStatus && status && (
          <span className={cn(styles.status(), avatarStatusColorClass[status])}>
            <span id={statusId} className="sr-only">
              {statusText}
            </span>
          </span>
        )}
      </AvatarPrimitive.Root>
    );
  },
);

Avatar.displayName = 'Avatar';
