import { toast } from 'sonner';
import {
  Snackbar,
  type SnackbarVariant,
  type SnackbarPosition,
  type SnackbarActionConfig,
} from './Snackbar';

/**
 * Options for showing a snackbar notification
 */
export interface ShowSnackbarOptions {
  /** Visual style variant of the snackbar @default 'info' */
  variant?: SnackbarVariant;
  /** Bold, single-line title. Optional — provide `title`, `message`, or both. */
  title?: string;
  /** Message text, shown below the title when both are set */
  message?: string;
  /** Show close button @default true */
  closable?: boolean;
  /** Auto-dismiss duration in milliseconds. Set to 0 or false to disable @default 4000 (ignored for `loading`) */
  duration?: number | false;
  /** Task progress 0–100 for a `loading` snackbar (Figma Progress Bar). Omit for no bar. */
  progress?: number;
  /**
   * Position of the snackbar on screen @default 'bottom-right' (Figma
   * guideline: "原則として画面の右下に配置"; was 'bottom-center')
   */
  position?: SnackbarPosition;
  /**
   * Reuse an existing snackbar's id to replace it in place — e.g. switch a
   * `loading` snackbar to `success` when the task finishes (Figma: "完了時に
   * 自動的に「成功」のSnackbarに切り替わります"). `showSnackbar` returns the id.
   */
  id?: string | number;
  /** Action buttons configuration */
  actions?: SnackbarActionConfig[];
}

/**
 * Show a snackbar notification programmatically using the Snackbar component.
 * This is the recommended way to trigger snackbars from anywhere in your app.
 *
 * @example
 * ```tsx
 * // Basic usage
 * showSnackbar({
 *   variant: 'success',
 *   title: 'アカウント情報を更新しました',
 * });
 *
 * // With message and actions
 * showSnackbar({
 *   variant: 'success',
 *   title: 'プレイリストに追加しました',
 *   message: 'マイプレイグラウンド「会議スピの曲」から削除できます。',
 *   duration: 6000,
 *   actions: [
 *     {
 *       label: 'プレイリストを見る',
 *       onClick: () => console.log('Open playlist'),
 *     },
 *   ],
 * });
 *
 * // Task progress: loading → success in place (same id)
 * const id = showSnackbar({ variant: 'loading', message: 'アップロード中…', progress: 0 });
 * showSnackbar({ id, variant: 'loading', message: 'アップロード中…', progress: 68 });
 * showSnackbar({ id, variant: 'success', message: 'アップロードが完了しました' });
 *
 * // Without auto-dismiss
 * showSnackbar({
 *   variant: 'error',
 *   title: 'メッセージの送信に失敗しました',
 *   duration: false,
 *   closable: true,
 * });
 * ```
 */
export const showSnackbar = ({
  variant = 'info',
  title,
  message,
  closable = true,
  duration = 4000,
  progress,
  position = 'bottom-right',
  actions,
  id,
}: ShowSnackbarOptions) => {
  return toast.custom(
    (t) => (
      <Snackbar
        variant={variant}
        title={title}
        message={message}
        closable={closable}
        duration={duration}
        progress={progress}
        actions={actions?.map((action) => ({
          ...action,
          onClick: () => {
            action.onClick();
            toast.dismiss(t);
          },
        }))}
        onClose={() => toast.dismiss(t)}
      />
    ),
    {
      // Always Infinity: sonner's own timer is disabled on purpose. The
      // Snackbar's useAutoDismiss is the single owner of auto-dismiss (it pauses
      // on hover / focus-within / hidden tab and calls onClose on
      // completion). Forwarding a finite duration here would run a second,
      // independent timer; forwarding `0` would be worse — sonner treats a
      // falsy duration as "use the default" (4000ms), so `duration: 0`
      // ("disable auto-dismiss") silently auto-dismissed.
      duration: Infinity,
      position,
      unstyled: true,
      ...(id !== undefined ? { id } : {}),
    },
  );
};

export type { SnackbarVariant, SnackbarPosition, SnackbarActionConfig };
