import { cn } from '@/utils';
import {
  type ComponentProps,
  forwardRef,
  type ReactNode,
  type Ref,
  type RefCallback,
  useRef,
} from 'react';
import { IconCross } from '../icons';
import { ProgressBar } from '../progressBar';
import { StatusIcon, type StatusIconValue } from '../statusIcon';
import { SnackbarAction } from './SnackbarAction';
import { snackbarStyles } from './Snackbar.styles';
import { useAutoDismiss } from './useAutoDismiss';

/**
 * Available snackbar variants — Figma's Snackbar status icon (`Status Icon`,
 * Inverse): Info / Success / Warning (Caution) / Danger / Loading.
 * `warning` and `loading` were added 2026-10-07. `loading` shows a spinner,
 * never auto-dismisses, and is the variant `progress` is meant for.
 */
export type SnackbarVariant = 'info' | 'success' | 'warning' | 'error' | 'loading';

/**
 * Available snackbar positions — used by `showSnackbar()`/`ShowSnackbarOptions`
 * (see `useSnackbar.tsx`), which actually renders through `sonner` and can
 * position itself. The bare `<Snackbar>` component below is presentational
 * only (no portal, no fixed positioning) — position is a concern for
 * whatever mounts it, which is why this component itself has no `position`
 * prop.
 */
export type SnackbarPosition =
  'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center';

/** Snackbar action configuration */
export interface SnackbarActionConfig {
  /** Label text for the action button */
  label: string;
  /** Click handler for the action */
  onClick: () => void;
}

/**
 * Snackbar component props extending standard HTML div attributes
 */
export type SnackbarProps = Omit<ComponentProps<'div'>, 'title'> & {
  /** Visual style variant of the snackbar @default 'info' */
  variant?: SnackbarVariant;
  /**
   * Bold, single-line title. Optional (2026-10-07): most Figma snackbars are a
   * message only (the Title toggle off). Provide `title`, `message`, or both.
   */
  title?: string;
  /** Message text (Body M, wraps), shown below the title when both are set */
  message?: string;
  /** Show close button @default true */
  closable?: boolean;
  /**
   * Auto-dismiss duration in milliseconds. Set to 0 or false to disable
   * @default 4000. The countdown pauses while hovered, while focus is inside,
   * and while the tab is hidden. No countdown bar is drawn (Figma has none).
   * Ignored for `variant="loading"`, which stays until it is replaced
   * (e.g. `showSnackbar({ id, variant: 'success', … })`) or closed.
   */
  duration?: number | false;
  /**
   * Task progress, 0–100, shown as Figma's inverse Progress Bar (Large) below
   * the text — for a `loading` snackbar ("…をアップロード中"). Omit for no
   * bar. Added 2026-10-07.
   */
  progress?: number;
  /** Custom icon to override default variant icon */
  icon?: ReactNode;
  /** Action buttons configuration */
  actions?: SnackbarActionConfig[];
  /** Callback when snackbar is dismissed */
  onClose?: () => void;
  /** Additional class names applied to specific internal parts, for customization beyond the root `className`. */
  classNames?: {
    /** The icon container. */
    icon?: string;
    /** The text-content container (title + message + progress + actions). */
    content?: string;
    /** The actions row. */
    actions?: string;
    /** The close button. */
    closeButton?: string;
  };
};

// Snackbar variant → shared StatusIcon status. Figma's Snackbar embeds the
// Status Icon component with Inverse = True, so the colors are the
// `*-inverse` tokens on the inverse container — the icons used to take the
// non-inverse tokens (e.g. a dark-blue info icon on #333333 in light mode).
const statusByVariant: Record<SnackbarVariant, StatusIconValue> = {
  info: 'info',
  success: 'success',
  warning: 'caution',
  error: 'danger',
  loading: 'loading',
};

/**
 * A flexible snackbar component for displaying notifications with various states and actions.
 * This component is presentational only — it has no portal and no fixed
 * positioning; use `showSnackbar()` (see `useSnackbar.tsx`) for a
 * positioned, stacked, auto-managed toast instead.
 *
 * Features:
 * - Variants info, success, warning, error, loading (Figma Status Icon, Inverse)
 * - Auto-dismiss (pauses while hovered, while focus is inside, and while the
 *   tab is hidden); `loading` never auto-dismisses
 * - Optional task `progress` bar, optional title, optional close button
 * - Action buttons, custom icons
 *
 * @example
 * ```tsx
 * // Message only (the most common Figma snackbar)
 * <Snackbar variant="success" message="アカウント情報を更新しました" />
 *
 * // Title + message with an action
 * <Snackbar
 *   variant="success"
 *   title="プレイリストに追加しました"
 *   message="マイライブラリの「お気に入りの曲」から再生できます。"
 *   actions={[{ label: 'プレイリストを見る', onClick: openPlaylist }]}
 * />
 *
 * // Task in progress (stays until replaced)
 * <Snackbar variant="loading" message="1件のファイルをアップロード中…" progress={68} />
 * ```
 */
export const Snackbar = forwardRef<HTMLDivElement, SnackbarProps>(
  (
    {
      variant = 'info',
      title,
      message,
      closable = true,
      duration = 4000,
      progress,
      icon,
      actions,
      onClose,
      className,
      classNames,
      ...rest
    },
    ref,
  ) => {
    const styles = snackbarStyles();

    const displayIcon = icon ?? <StatusIcon status={statusByVariant[variant]} inverse />;
    const hasActions = actions && actions.length > 0;

    // Guard against onClose firing more than once — it can be triggered by
    // either the close button or the auto-dismiss timer, and a consumer's
    // onClose handler shouldn't have to be idempotent itself.
    const hasClosedRef = useRef(false);
    // Root element, the auto-dismiss timer's hover/focus pause scope.
    const rootRef = useRef<HTMLDivElement>(null);
    const handleClose = () => {
      if (hasClosedRef.current) return;
      hasClosedRef.current = true;
      onClose?.();
    };

    useAutoDismiss({
      duration: duration === false ? 0 : duration,
      enabled: variant !== 'loading',
      onComplete: handleClose,
      scopeRef: rootRef,
    });

    return (
      <div
        ref={mergeRefs(ref, rootRef)}
        className={cn(styles.snackbar(), 'relative', className)}
        role={variant === 'error' ? 'alert' : 'status'}
        {...rest}
      >
        {/* Icon */}
        <div className={cn(styles.icon(), classNames?.icon)}>{displayIcon}</div>

        {/* Text content */}
        <div className={cn(styles.content(), classNames?.content)}>
          {title && (
            <div className={styles.title()}>
              <span>{title}</span>
            </div>
          )}
          {message && <div className={styles.message()}>{message}</div>}

          {/* Task progress (Figma Progress Bar — Large, Inverse) */}
          {progress !== undefined && (
            <div className={styles.progress()}>
              <ProgressBar
                value={Math.min(100, Math.max(0, progress))}
                inverse
                size="large"
                aria-label={title ?? message ?? 'Progress'}
              />
            </div>
          )}

          {/* Action buttons */}
          {hasActions && (
            <div className={cn(styles.actions(), classNames?.actions)}>
              {actions!.map((action, index) => (
                <SnackbarAction key={index} onClick={() => action.onClick()}>
                  {action.label}
                </SnackbarAction>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        {closable && (
          <button
            type="button"
            className={cn(styles.closeButton(), classNames?.closeButton)}
            onClick={handleClose}
            aria-label="Close notification"
          >
            <IconCross />
          </button>
        )}
      </div>
    );
  },
);

Snackbar.displayName = 'Snackbar';

// Small local ref-merge helper (same pattern as Modal/DatePickerDayButton) —
// Snackbar needs its own root ref alongside any ref a consumer forwards in.
function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as { current: T | null }).current = node;
    }
  };
}
