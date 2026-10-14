import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { showSnackbar, SnackbarContainer } from './index';
import { Snackbar } from './Snackbar';
import { tokenColor } from '../../../.storybook/tokenColor';

const meta: Meta<typeof SnackbarContainer> = {
  title: 'Components/Snackbar',
  component: SnackbarContainer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Snackbar component for displaying brief notifications. Use the \`showSnackbar()\` function to trigger notifications programmatically.

## Usage

\`\`\`tsx
import { showSnackbar, SnackbarContainer } from '@/components/snackbar';

// Add SnackbarContainer once in your app root
function App() {
  return (
    <>
      <SnackbarContainer />
      <YourApp />
    </>
  );
}

// Call showSnackbar from anywhere
showSnackbar({
  variant: 'success',
  title: 'アカウント情報を更新しました',
  message: 'メッセージ',
  duration: 4000,
  closable: true,
  actions: [
    { label: 'ラベル', onClick: () => {} }
  ],
});
\`\`\`

## API

### showSnackbar(options)

**Parameters:**

- \`variant\` - Visual style: \`'info' | 'success' | 'error'\` (default: \`'info'\`)
- \`title\` - Title text (required)
- \`message\` - Optional message below title
- \`closable\` - Show close button (default: \`true\`)
- \`duration\` - Auto-dismiss duration in ms, or \`0\`/\`false\` to disable (default: \`4000\`). Pauses while hovered, focused, or when the tab is hidden
- \`position\` - Position on screen: \`'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'\` (default: \`'bottom-center'\`)
- \`actions\` - Array of action buttons with \`label\`, \`onClick\`, and optional \`variant\`

**Features:**
- Multiple variants (info, success, error)
- Auto-dismiss with progress bar indicator
- Optional close button
- Action buttons support
- Multiple positioning options
- Automatic stacking (max 3 visible)
        `,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SnackbarContainer>;

/**
 * Basic info variant with title and message
 */
export const Info: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '600px',
        minHeight: 300,
      }}
    >
      <SnackbarContainer />
      <button
        onClick={() =>
          showSnackbar({
            variant: 'info',
            title: 'タイトル',
            message: 'メッセージ',
            actions: [
              {
                label: 'ラベル',
                onClick: () => console.log('アクション1'),
              },
              {
                label: 'ラベル',
                onClick: () => console.log('アクション2'),
              },
            ],
          })
        }
        style={{
          padding: '8px 16px',
          background: '#0056b3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show Info Snackbar
      </button>
    </div>
  ),
};

/**
 * Success variant
 */
export const Success: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '600px',
        minHeight: 300,
      }}
    >
      <SnackbarContainer />
      <button
        onClick={() =>
          showSnackbar({
            variant: 'success',
            title: 'アカウント情報を更新しました',
          })
        }
        style={{
          padding: '8px 16px',
          background: '#1e7e34',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show Success Snackbar
      </button>
    </div>
  ),
};

/**
 * Error variant
 */
export const Error: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '600px',
        minHeight: 300,
      }}
    >
      <SnackbarContainer />
      <button
        onClick={() =>
          showSnackbar({
            variant: 'error',
            title: 'メッセージの送信に失敗しました',
          })
        }
        style={{
          padding: '8px 16px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show Error Snackbar
      </button>
    </div>
  ),
};

/**
 * Snackbar with close button
 */
export const WithCloseButton: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '600px',
        minHeight: 300,
      }}
    >
      <SnackbarContainer />
      <button
        onClick={() =>
          showSnackbar({
            variant: 'success',
            title: 'アカウント情報を更新しました',
            closable: true,
          })
        }
        style={{
          padding: '8px 16px',
          background: '#1e7e34',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show With Close Button
      </button>
    </div>
  ),
};

/**
 * Snackbar with action buttons
 */
export const WithActions: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '600px',
        minHeight: 300,
      }}
    >
      <SnackbarContainer />
      <button
        onClick={() =>
          showSnackbar({
            variant: 'success',
            title: 'アカウント情報を更新しました',
            closable: true,
            actions: [
              {
                label: 'ラベル',
                onClick: () => console.log('アクション1'),
              },
              {
                label: 'ラベル',
                onClick: () => console.log('アクション2'),
              },
            ],
          })
        }
        style={{
          padding: '8px 16px',
          background: '#1e7e34',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show With Actions
      </button>
    </div>
  ),
};

/**
 * Task progress (Figma "インジケーター付きメッセージ"): a `loading` snackbar
 * with a Progress Bar stays until the task finishes, then is replaced in
 * place by a `success` snackbar (same `id`), which auto-dismisses normally.
 */
export const LoadingWithProgress: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '600px',
        minHeight: 300,
      }}
    >
      <SnackbarContainer />
      <button
        type="button"
        onClick={() => {
          const id = showSnackbar({
            variant: 'loading',
            message: '1件のファイルをアップロード中…',
            progress: 0,
          });
          [25, 50, 75, 100].forEach((progress, i) =>
            setTimeout(
              () =>
                showSnackbar({
                  id,
                  variant: 'loading',
                  message: '1件のファイルをアップロード中…',
                  progress,
                }),
              (i + 1) * 600,
            ),
          );
          setTimeout(
            () => showSnackbar({ id, variant: 'success', message: 'アップロードが完了しました' }),
            3000,
          );
        }}
      >
        Upload a file
      </button>
    </div>
  ),
};

/**
 * Title + message with two actions and a longer duration (Figma: "アクション
 * が含まれる場合は長めに設定"). Auto-dismiss has no countdown bar.
 */
export const WithActionsLongerDuration: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '600px',
        minHeight: 300,
      }}
    >
      <SnackbarContainer />
      <button
        onClick={() =>
          showSnackbar({
            variant: 'success',
            title: 'プレイリストに追加しました',
            message: 'マイプレイグラウンド「会議スピの曲」から削除できます。',
            duration: 6000,
            actions: [
              {
                label: 'プレイリストを見る',
                onClick: () => console.log('プレイリストを開く'),
              },
              {
                label: '閉じる',
                onClick: () => {},
              },
            ],
          })
        }
        style={{
          padding: '8px 16px',
          background: '#1e7e34',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show With Actions (6s)
      </button>
    </div>
  ),
};

/**
 * Snackbar without auto-dismiss (must be manually closed)
 */
export const NoAutoDismiss: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        minWidth: '600px',
        minHeight: 300,
      }}
    >
      <SnackbarContainer />
      <button
        onClick={() =>
          showSnackbar({
            variant: 'error',
            title: 'メッセージの送信に失敗しました',
            duration: false,
            closable: true,
          })
        }
        style={{
          padding: '8px 16px',
          background: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show No Auto Dismiss
      </button>
    </div>
  ),
};

/**
 * All snackbar variants displayed together
 */
export const AllVariants: Story = {
  render: () => (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}
    >
      <SnackbarContainer />
      <h3 style={{ marginBottom: '8px' }}>All Variants</h3>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() =>
            showSnackbar({
              variant: 'info',
              title: '通知メッセージ',
              message: 'メッセージ',
            })
          }
          style={{
            padding: '8px 16px',
            background: '#0056b3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Info
        </button>
        <button
          onClick={() =>
            showSnackbar({
              variant: 'success',
              title: 'アカウント情報を更新しました',
              closable: true,
            })
          }
          style={{
            padding: '8px 16px',
            background: '#1e7e34',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Success
        </button>
        <button
          onClick={() =>
            showSnackbar({
              variant: 'error',
              title: 'メッセージの送信に失敗しました',
              closable: true,
            })
          }
          style={{
            padding: '8px 16px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Error
        </button>
        <button
          type="button"
          onClick={() =>
            showSnackbar({ variant: 'warning', message: 'セッションの有効期限が近づいています' })
          }
        >
          Warning
        </button>
        <button
          type="button"
          onClick={() => showSnackbar({ variant: 'loading', message: '送信中…' })}
        >
          Loading
        </button>
      </div>
    </div>
  ),
};

/**
 * Every variant rendered statically (bare `<Snackbar>`), for visual review in
 * light and dark: inverse status icons (Figma Status Icon, Inverse), the
 * message-only layout, title + message, and the loading progress bar.
 */
export const VariantsGallery: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <Snackbar variant="info" message="メッセージを送信しました" duration={false} />
      <Snackbar variant="success" message="アカウント情報を更新しました" duration={false} />
      <Snackbar variant="warning" message="セッションの有効期限が近づいています" duration={false} />
      <Snackbar variant="error" message="メッセージの送信に失敗しました" duration={false} />
      <Snackbar variant="loading" message="1件のファイルをアップロード中…" progress={68} />
      <Snackbar
        variant="success"
        title="プレイリストに追加しました"
        message="マイライブラリの「お気に入りの曲」から再生できます。"
        duration={false}
        actions={[{ label: 'プレイリストを見る', onClick: () => {} }]}
      />
    </div>
  ),
};

/**
 * The `classNames` slot API reaching the icon, content, actions, and
 * closeButton parts individually — the root `className` only reaches the
 * outer `<div>`. Renders the bare `<Snackbar>` directly (not via
 * `showSnackbar()`/sonner) since `classNames` is a prop of `Snackbar`
 * itself, not of `showSnackbar()`'s options.
 */
export const CustomClassNames: Story = {
  render: () => (
    <Snackbar
      variant="success"
      title="カスタムスタイル"
      message="classNames で各パーツを個別にスタイリング"
      duration={false}
      actions={[{ label: 'Undo', onClick: () => {} }]}
      classNames={{
        icon: 'text-sds-icon-warning',
        content: 'gap-4',
        actions: 'justify-end',
        closeButton: 'text-sds-icon-danger',
      }}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the `classNames` prop, which targets the icon, content, actions, and closeButton parts individually.',
      },
    },
  },
};

/**
 * Regression coverage for the 2026-09-07 Figma-fidelity audit: renders the
 * bare `<Snackbar>` directly (not via `showSnackbar()`/sonner, to avoid
 * async-portal timing) and verifies the exact computed values against real
 * Figma metadata — the fixed 400px width, title truncation, and the
 * loading progress bar's track/fill (Figma's "Progress Bar" component has no
 * status/color axis; it is shown only for task progress, 2026-10-07).
 */
export const InteractionPixelDimensionsMatchFigma: Story = {
  render: () => (
    <Snackbar
      data-testid="snackbar"
      variant="loading"
      title="This is a very long title that should truncate with an ellipsis instead of wrapping onto a second line"
      message="Some message"
      progress={40}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const snackbar = canvas.getByTestId('snackbar');
    const snackbarCs = getComputedStyle(snackbar);
    expect(snackbarCs.width).toBe('400px');

    const title = canvas.getByText(/This is a very long title/);
    const titleCs = getComputedStyle(title);
    expect(titleCs.whiteSpace).toBe('nowrap');
    expect(titleCs.textOverflow).toBe('ellipsis');

    const track = canvas.getByRole('progressbar');
    const fill = track.firstElementChild as HTMLElement;
    const trackCs = getComputedStyle(track);
    const fillCs = getComputedStyle(fill);
    expect(trackCs.height).toBe('8px');
    expect(trackCs.backgroundColor).toBe(tokenColor(track, '--color-sds-surface-subtle-inverse'));
    expect(fillCs.backgroundColor).toBe(tokenColor(fill, '--color-sds-icon-primary-inverse'));
  },
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const triggerButton = (label: string, onClick: () => void) => (
  <div style={{ minWidth: '600px', minHeight: 300 }}>
    <SnackbarContainer />
    <button type="button" onClick={onClick}>
      {label}
    </button>
  </div>
);

/**
 * Regression: auto-dismiss must pause while the pointer is over the toast.
 * Previously sonner paused its own timer on hover, but the Snackbar's own
 * countdown still called `toast.dismiss()` on completion, so a hovered toast
 * vanished anyway. The Snackbar's `useAutoDismiss` is the single timer owner
 * (sonner gets `duration: Infinity`) and pauses on hover.
 */
export const InteractionHoverPausesAutoDismiss: Story = {
  render: () =>
    triggerButton('Show', () =>
      showSnackbar({ title: 'Hover pause test', duration: 800, position: 'top-right' }),
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Show' }));
    const toast = await body.findByText('Hover pause test');

    await userEvent.hover(toast);
    await sleep(1600); // 2x the duration, entirely while hovered
    expect(body.queryByText('Hover pause test')).toBeInTheDocument();

    await userEvent.unhover(toast);
    await waitFor(() => expect(body.queryByText('Hover pause test')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  },
};

/**
 * Regression: `duration: 0` is documented as "disable auto-dismiss". sonner
 * treats a falsy duration as "use the default 4000ms", so forwarding `0`
 * verbatim silently auto-dismissed the toast after 4s.
 */
export const InteractionZeroDurationNeverAutoDismisses: Story = {
  render: () =>
    triggerButton('Show', () =>
      showSnackbar({ title: 'Zero duration test', duration: 0, position: 'top-right' }),
    ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Show' }));
    const toast = await body.findByText('Zero duration test');
    expect(toast.closest('[role="status"]')?.querySelector('[role="progressbar"]')).toBeNull();

    await sleep(4600); // past sonner's 4000ms default lifetime
    expect(body.queryByText('Zero duration test')).toBeInTheDocument();

    await userEvent.click(body.getByRole('button', { name: 'Close notification' }));
    await waitFor(() => expect(body.queryByText('Zero duration test')).not.toBeInTheDocument());
  },
};
