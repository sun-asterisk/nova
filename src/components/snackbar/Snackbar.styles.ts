import { tv } from 'tailwind-variants';
import { FOCUS_RING_OFFSET_2 } from '@/utils';

// Focus ring: `FOCUS_RING_OFFSET_2` from `src/utils/focusRing.ts` — see that
// file for the full composition rules (no unconditional `outline-none`).
// Figma Snackbar (7837:3652, frame 7637:4257, synced 2026-10-07):
// - fixed 400px width ("複数スタックされたときを考慮して固定") — it used to
//   shrink to its content (40–400px), so stacked snackbars had ragged widths.
//   `max-w-full` keeps it on screen on narrow viewports.
// - the status icon (20px) and the close icon (16px) sit in 22px-tall
//   containers so they line up with the first text line ("主要なテキスト行
//   （1行目）と垂直方向の中央が揃う"); they used to hug the top edge.
// - icon colors come from the shared `StatusIcon` with `inverse` (see
//   Snackbar.tsx); the close icon is `icon-secondary-inverse` — it was
//   `icon-secondary` (#5a5a5a on #333333 in light mode, nearly invisible).
// - actions are 8px apart (was 4px).
export const snackbarStyles = tv({
  slots: {
    snackbar: `
      flex items-start gap-2 !p-sds-200 rounded-sds-200 bg-sds-background-container-inverse
      shadow-sds-level-4
      w-[400px] max-w-full
      animate-in slide-in-from-bottom-2 fade-in duration-300
    `,
    icon: `
      flex-shrink-0 h-[22px] flex items-center
      [&>span]:size-5 [&_svg]:w-5 [&_svg]:h-5
    `,
    content: `
      flex-1 min-w-0 flex flex-col gap-2
    `,
    // Figma's title (node 10301:723) is explicitly single-line and
    // truncated: `overflow-hidden text-ellipsis whitespace-nowrap` — the
    // previous version let a long title wrap across multiple lines instead.
    // Figma's title text box is 22px tall (Label/Ja - L Bold, 14px, centered)
    // so it lines up with the 22px icon/close containers and the message
    // starts 8px below it; the bare 14px line box used to pull the message up
    // 8px. The inner span carries the truncation.
    title: `
      typo-label-m-bold text-sds-text-on-surface
      h-[22px] flex items-center min-w-0
      [&>span]:truncate
    `,
    message: `
      typo-body-m text-sds-text-on-surface
    `,
    // Figma ProgressBar Container: the 8px bar plus 4px of bottom padding
    // ("あえてコンポーネント下部にPaddingを設定").
    progress: `
      pb-sds-50
    `,
    actions: `
      flex items-center gap-sds-100
    `,
    closeButton: `
      flex-shrink-0 w-4 h-[22px] flex items-center justify-center
      cursor-pointer text-sds-icon-secondary-inverse
      [&_svg]:w-4 [&_svg]:h-4
      ${FOCUS_RING_OFFSET_2}
    `,
  },
});

// `transition-[background-color]` (not `transition-colors`): `transition-colors`
// includes `outline-color` in its transitioned property list, matching the
// confirmed flash-bug class documented in design-foundation.md §5.1
// (Checkbox/DatePickerButton) — scoped preventively.
export const snackbarActionStyles = tv({
  base: `
    typo-label-s-bold px-2 py-2.5 rounded-sds-200
    bg-sds-surface-subtle-inverse
    cursor-pointer border-none
    text-sds-text-on-surface
    hover:bg-sds-surface-subtle-hover-inverse
    active:bg-sds-surface-subtle-active-inverse
    ${FOCUS_RING_OFFSET_2}
    transition-[background-color] duration-150
  `,
});
