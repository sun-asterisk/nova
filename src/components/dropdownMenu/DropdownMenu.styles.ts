import { tv } from 'tailwind-variants';

// Deliberately does not use `src/utils/focusRing.ts`'s shared
// `FOCUS_RING_OFFSET_*` constants anywhere in this file — evaluated and
// excluded (see that file's composition rule #4), not overlooked.
//
// No `focus-visible:outline-*` ring on item/itemDestructive/checkboxItem/
// radioItem/subTrigger — REMOVED 2026-09-10 after a real, confirmed bug was
// found (not present before this fix, a genuine regression from an earlier
// 2026-09-07 pass that added it without testing pure mouse hover): Radix's
// Menu implementation calls `.focus()` on an item when the mouse merely
// moves over it (the correct ARIA composite-menu pattern — roving focus
// position must follow hover so a subsequent Enter/click acts on the
// hovered item), and Chromium's `:focus-visible` heuristic treats that
// programmatic, non-click focus as "keyboard-like," so the ring painted on
// every plain mouse hover — confirmed via a real browser test
// (`userEvent.hover()` with NO Tab/keyboard interaction at all:
// `element.matches(':focus-visible')` was `true`, ring visibly rendered).
// This does not match Figma (Hover state has no border/outline anywhere in
// its own generated code — only a background-color change) and is not a
// hover/focus conflict `.claude/rules/design-foundation.md` §5.1 was written
// to guard against (that rule concerns standalone-focusable elements like
// Checkbox/Switch, not a roving-tabindex composite where Radix intentionally
// unifies hover and keyboard-highlight into one DOM focus event). The
// existing `hover:`/`focus:bg-sds-surface-subtle-hover` background change is the
// visible indicator for BOTH mouse hover and real keyboard navigation
// (WCAG 2.4.7 requires a visible indicator, not specifically an outline) —
// exactly matching Figma, which never shows a distinct ring-based "Focus"
// state for Menu Item at all. See `InteractionFocusRingIntegrity` in
// DropdownMenu.stories.tsx for the regression test asserting no ring paints
// on pure hover, alongside the background highlight still working correctly.
//
// item/itemDestructive/checkboxItem/radioItem/subTrigger DO carry an
// unconditional `outline-none` (added alongside the ring removal above) —
// this is SAFE here, unlike the tailwind-merge collision documented in
// Checkbox.styles.ts, precisely BECAUSE there is no competing `outline-2`/
// `focus-visible:outline-*` chain anywhere in these five slots for it to
// silently poison. Without it, the browser's own native default focus
// outline (`outline: auto`, confirmed via a real computed-style check) fills
// the gap left by removing our custom ring — also not present in Figma.
// Hover/focus background: `surface-subtle-hover` (NOT `surface-button-
// secondary-hover`, found and fixed 2026-09-10 — that token never existed
// anywhere in the generated token pipeline; `hover:`/`focus:bg-sds-surface-
// button-secondary-hover` compiled to zero CSS, so every item's hover/focus
// state rendered with literally no background at all). Confirmed via Figma's
// live "Menu Item" component (Hover binds to `surface/subtle-hover`) and via
// this file's own already-correct `active:bg-sds-surface-subtle`, which the
// hover token should be the sibling of — `surface-secondary-hover` (Button's
// real secondary-hover token) belongs to a different semantic family (opaque
// button fills), not the semi-transparent "subtle overlay on an existing
// surface" family DropdownMenu items need. design.md's own §2.2/§6.1 text
// contained the same stale token name; corrected there too.
export const dropdownMenuStyles = tv({
  slots: {
    // shadow-sds-level-2: Figma's menu panels (13053:4521 etc.) apply the
    // effect style "Elevation Lv.2" and the デザイン仕様 frame labels it so
    // (2026-10-07; was level-3 from design.md §6.1, now corrected there).
    // flex-col + gap-sds-50: Figma's panel Auto Layout puts 4px between items.
    // max-w-[320px]: Figma's guideline text mandates a min/max width range
    // but gives no exact pixel figure anywhere in the retrievable spec — this
    // is a reasonable content-driven cap (every Figma example item is
    // 254-270px wide), not a sourced value. max-height uses Radix's own
    // `--radix-dropdown-menu-content-available-height` CSS variable, which
    // already implements the spec's "shrink to fit between the trigger and
    // the viewport edge" behavior exactly — no guessed item-count-based
    // pixel value needed. The matching 16px viewport margin IS an exact
    // Figma figure ("画面の上下端から16pxの余白"); set via `collisionPadding`
    // default on DropdownMenuContent itself (see DropdownMenu.tsx).
    content: `
      z-50 flex flex-col gap-sds-50 min-w-[200px] max-w-[320px] overflow-hidden overflow-y-auto rounded-sds-200 bg-sds-surface-base p-sds-100
      shadow-sds-level-2
      max-h-[var(--radix-dropdown-menu-content-available-height)]
      data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
      data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
    `,
    // pl-sds-150/pr-sds-100 (not px-sds-150 symmetric): Figma's Menu Item measures 12px
    // left / 8px right padding (confirmed via get_design_context on node
    // 11853:12967) — asymmetric, not the symmetric 12px/12px previously here.
    // min-h-9: Figma "Min-height: 36px". Icons: Figma binds icon/primary
    // (icon/danger for Danger, icon/disable when disabled) — applied to every
    // svg in the item; `group/item` lets the description follow Disabled.
    item: `
      group/item relative flex min-h-9 cursor-pointer select-none items-center gap-2
      rounded-sds-100 pl-sds-150 pr-sds-100 py-sds-100 typo-body-m text-sds-text-primary
      [&_svg]:shrink-0 [&_svg]:text-sds-icon-primary data-[disabled]:[&_svg]:text-sds-icon-disable!
      transition-[background-color,color]
      hover:bg-sds-surface-subtle-hover
      focus:bg-sds-surface-subtle-hover
      active:bg-sds-surface-subtle
      outline-none
      data-[disabled]:pointer-events-none data-[disabled]:text-sds-text-disable
    `,
    // Figma Style=Danger: text/icon danger; Hover/Active use the same
    // surface/subtle fills as every other item (was background-danger — not
    // in Figma, corrected 2026-10-07).
    itemDestructive: `
      group/item relative flex min-h-9 cursor-pointer select-none items-center gap-2
      rounded-sds-100 pl-sds-150 pr-sds-100 py-sds-100 typo-body-m text-sds-text-danger
      [&_svg]:shrink-0 [&_svg]:text-sds-icon-danger data-[disabled]:[&_svg]:text-sds-icon-disable!
      transition-[background-color,color]
      hover:bg-sds-surface-subtle-hover
      focus:bg-sds-surface-subtle-hover
      active:bg-sds-surface-subtle
      outline-none
      data-[disabled]:pointer-events-none data-[disabled]:text-sds-text-disable
    `,
    checkboxItem: `
      group/item relative flex min-h-9 cursor-pointer select-none items-center gap-2
      rounded-sds-100 py-sds-100 pl-sds-150 pr-sds-100 typo-body-m text-sds-text-primary
      [&_svg]:shrink-0 [&_svg]:text-sds-icon-primary data-[disabled]:[&_svg]:text-sds-icon-disable!
      transition-[background-color,color]
      hover:bg-sds-surface-subtle-hover
      focus:bg-sds-surface-subtle-hover
      active:bg-sds-surface-subtle
      outline-none
      data-[disabled]:pointer-events-none data-[disabled]:text-sds-text-disable
    `,
    radioItem: `
      group/item relative flex min-h-9 cursor-pointer select-none items-center gap-2
      rounded-sds-100 py-sds-100 pl-sds-150 pr-sds-100 typo-body-m text-sds-text-primary
      [&_svg]:shrink-0 [&_svg]:text-sds-icon-primary data-[disabled]:[&_svg]:text-sds-icon-disable!
      transition-[background-color,color]
      hover:bg-sds-surface-subtle-hover
      focus:bg-sds-surface-subtle-hover
      active:bg-sds-surface-subtle
      outline-none
      data-[disabled]:pointer-events-none data-[disabled]:text-sds-text-disable
    `,
    // Figma Style=Option: a 20px Check Icon Container IN the row's Auto
    // Layout (12px item padding, 8px gap → the label starts at 40px). It
    // always reserves its space; only the check inside shows when checked.
    // Was an absolutely-positioned indicator at 8px with the label at 32px
    // (corrected 2026-10-07).
    itemIndicator: `
      flex size-5 shrink-0 items-center justify-center
    `,
    // Stacks a label with an optional `description` (Figma's "Menu Item"
    // `supportText` property) — a real, distinct styled sub-element, not a
    // generic child slot. `text-sds-text-secondary` regardless of the item's own
    // variant/state, matching Figma's own component (every state branch in
    // its generated code uses the same secondary color for supportText, even
    // Destructive/Disabled).
    itemText: `
      flex flex-1 min-w-0 flex-col items-start justify-center gap-sds-50
    `,
    // Figma: Text/Secondary; Text/Disable on a disabled item (Figma keeps the
    // Option style's disabled support text secondary — treated as a Figma
    // inconsistency, every other disabled text there is Text/Disable).
    itemDescription: `
      w-full truncate typo-body-s text-sds-text-secondary
      group-data-[disabled]/item:text-sds-text-disable
    `,
    // The trailing chevron is Figma's Suffix Icon Container: icon/secondary.
    subTrigger: `
      group/item relative flex min-h-9 cursor-pointer select-none items-center gap-2
      rounded-sds-100 pl-sds-150 pr-sds-100 py-sds-100 typo-body-m text-sds-text-primary
      [&_svg]:shrink-0 [&_svg]:text-sds-icon-primary [&>svg:last-child]:text-sds-icon-secondary
      data-[disabled]:[&_svg]:text-sds-icon-disable!
      transition-[background-color,color]
      hover:bg-sds-surface-subtle-hover
      focus:bg-sds-surface-subtle-hover
      data-[state=open]:bg-sds-surface-subtle-hover
      outline-none
      data-[disabled]:pointer-events-none data-[disabled]:text-sds-text-disable
    `,
    subContent: `
      z-50 flex flex-col gap-sds-50 min-w-[200px] overflow-hidden rounded-sds-200 bg-sds-surface-base p-sds-100
      shadow-sds-level-2
      data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95
      data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
    `,
    // `my-sds-100 h-px` (NOT `-mx-sds-100 my-sds-100` bleeding to the panel edge, found
    // and fixed 2026-09-10): confirmed via a real screenshot of Figma's own
    // "Grouping" example (get_screenshot on node 13055:14342) that the
    // divider is clearly INSET, with visible whitespace on both sides —
    // it never touches the rounded content panel's outer edge the way the
    // previous negative-margin bleed made it do. It naturally stays inset
    // within `content`'s own `p-sds-100`, matching Figma's "Group Header"
    // component (node 11846:2269), which wraps its own divider in the same
    // 8px padding rather than bleeding it outward.
    separator: `
      my-sds-100 h-px bg-sds-border-weak
    `,
    label: `
      px-sds-150 py-sds-50 typo-label-s-bold text-sds-text-secondary
    `,
    shortcut: `
      ml-auto typo-body-s text-sds-text-secondary
      group-data-[disabled]/item:text-sds-text-disable
    `,
  },
});
