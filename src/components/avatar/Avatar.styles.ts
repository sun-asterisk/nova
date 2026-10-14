import { tv } from 'tailwind-variants';
import { FOCUS_RING_OFFSET_3 } from '@/utils';

// Focus ring: `FOCUS_RING_OFFSET_3` from `src/utils/focusRing.ts` — see that
// file for the full composition rules.
//
// `outline-offset-3` (not `-2`): confirmed via `get_design_context` on
// Figma's own "Avatar" component (node 16593:8749) — its Focus Ring layer
// uses `inset-[-3px]` for every size. Avatar is a filled circular SHAPE, so
// design-foundation.md §5.1's general rule of thumb ("2px offset for filled/
// shape elements, 3px for text") would predict 2px — but Figma's own
// concrete implementation for this specific component uses 3px. Figma is
// the source of truth for visual requirements, so 3px is used here; this is
// a genuine, confirmed exception to the general rule, not a guess.
export const avatarStyles = tv({
  slots: {
    // rounded-sds-full + overflow-hidden: Avatar is ALWAYS circular — Figma's
    // own guideline is explicit and non-negotiable about this ("アバターは
    // 常に円形で表示します。縦横比を変えたり、角丸の矩形や楕円にしたりしない
    // でください" — always circular; never change the aspect ratio or use a
    // rounded rectangle/ellipse).
    root: `
      relative inline-flex shrink-0 items-center justify-center
      rounded-sds-full overflow-hidden
      bg-sds-surface-secondary
      ${FOCUS_RING_OFFSET_3}
    `,
    image: `size-full object-cover`,
    // Fallback foreground — Figma Avatar (16593:8749, re-checked 2026-10-07):
    // initials `Text/On Surface`, icon `Icon/Secondary`.
    //
    // KNOWN, ACCEPTED WCAG 1.4.3 FAILURE: white `text-on-surface` on
    // `surface-secondary` is 1.88:1 (light) / 1.71:1 (dark), below 4.5:1.
    // SC-05 (2026-09-29) had switched the initials to `text-primary` (6.73:1)
    // pending Figma; Figma still specifies `Text/On Surface`, and the team
    // chose to follow Figma (2026-10-07) — the fix belongs in Figma (a darker
    // fill or a dark initial color). Storybook's axe gate skips
    // `color-contrast` for `[data-slot="avatar-fallback"]` only (see
    // Avatar.stories.tsx); see docs/components/avatar.md.
    // The icon (`Icon/Secondary`) passes 3:1 (3.65:1 light / 5.4:1 dark).
    fallback: `flex size-full items-center justify-center text-sds-text-on-surface [&_svg]:text-sds-icon-secondary`,
    status: `
      absolute rounded-sds-full border-2 border-sds-surface-base
    `,
  },
  variants: {
    size: {
      // Pixel dimensions confirmed via get_design_context — Figma's Avatar
      // sizes don't map onto the numeric spacing scale (24/32/40/56/80 —
      // only 40 lands on an existing step), so these stay literal px values,
      // matching the component's own established `size-[Npx]` convention
      // used elsewhere in this codebase for exact Figma-measured dimensions.
      xsmall: { root: 'size-[24px]' },
      small: { root: 'size-[32px]' },
      medium: { root: 'size-[40px]' },
      large: { root: 'size-[56px]' },
      xlarge: { root: 'size-[80px]' },
    },
    ring: {
      // 2px, `surface-base`-colored (matches the page background, not a
      // semantic "border" token) — confirmed via `get_variable_defs` on the
      // Figma component. A `ring-*` box-shadow (not a real `border`) so it
      // overlays outward without shrinking the inner circle, matching
      // Figma's own separate, non-layout-affecting "Ring" overlay layer.
      true: { root: 'ring-2 ring-sds-surface-base' },
    },
  },
  compoundVariants: [
    // Initial/icon fallback sizing — confirmed via get_design_context per
    // size. None of these land on the existing `typo-*` scale (Avatar's own
    // sizes are Figma-specific, not shared with the general typography
    // scale), so arbitrary values are used with `leading-none` since
    // vertical centering here comes from the flex layout, not line-height.
    { size: 'xsmall', class: { fallback: 'text-[12px] leading-none [&_svg]:size-4' } },
    { size: 'small', class: { fallback: 'text-[14px] leading-none [&_svg]:size-5' } },
    { size: 'medium', class: { fallback: 'text-[16px] leading-none [&_svg]:size-6' } },
    { size: 'large', class: { fallback: 'text-[20px] leading-none [&_svg]:size-8' } },
    { size: 'xlarge', class: { fallback: 'text-[28px] leading-none [&_svg]:size-10' } },
    // Status dot sizing/position — confirmed via get_design_context.
    // XSmall has NO status compound variant at all — Figma's own component
    // description is explicit: "XSmall はステータス非対応" (XSmall does not
    // support status); status is simply never rendered at that size (see
    // Avatar.tsx).
    { size: 'small', class: { status: 'size-[10px] bottom-0 right-0' } },
    { size: 'medium', class: { status: 'size-[12px] bottom-0 right-0' } },
    { size: 'large', class: { status: 'size-[16px] bottom-0 right-0' } },
    { size: 'xlarge', class: { status: 'size-[20px] bottom-[2px] right-[2px]' } },
  ],
  defaultVariants: {
    size: 'medium',
    ring: false,
  },
});

// Status dot fill color per presence state — confirmed via `get_variable_defs`
// on Figma's "_Avatar / Status" component (node 16591:8648): Online→
// icon/success, Away→icon/caution, Busy→icon/danger, Offline→icon/disable.
export const avatarStatusColorClass: Record<'online' | 'away' | 'busy' | 'offline', string> = {
  online: 'bg-sds-icon-success',
  away: 'bg-sds-icon-caution',
  busy: 'bg-sds-icon-danger',
  offline: 'bg-sds-icon-disable',
};
