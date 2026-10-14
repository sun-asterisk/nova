import { tv } from 'tailwind-variants';
import { FOCUS_RING_OFFSET_3 } from '@/utils';

// Underline is ALWAYS present (never `no-underline`) and NEVER changes color
// on hover — only thickness (1px → 2px). Confirmed via Figma's own component
// description: "下線は常時表示。ホバーで1pxから2pxに太くなる" (underline always
// shown; on hover, thickens from 1px to 2px) — a deliberate, explicit
// "not color alone" choice (accessibility.md §4.3 / this Figma component's
// own guideline text: "状態の変化も色に依存させません" — state changes must
// not depend on color either). Do not add a `hover:text-*` color change here.
//
// `rounded-sds-50` (2px) exists purely so the `focus-visible:outline-*` ring
// (which follows an element's own border-radius in modern browsers) renders
// with Figma's specified 2px corner rounding — Link has no visible
// background/border of its own, so this radius is otherwise invisible.
//
// Underline offset 2px in every state (Figma デザイン仕様: "太さ 1px / オフセット 2px",
// Hover "太さ 2px / オフセット 2px"; was the browser default — 2026-10-07).
// Icons bind Icon/Link (Icon/Disable when disabled) in Figma, separate from
// the label's Text/Link — applied to every svg adornment.
//
// Focus ring: `FOCUS_RING_OFFSET_3` from `src/utils/focusRing.ts` (Link is a
// text element, hence the 3px offset — see that file for the full
// composition rules).
export const linkStyles = tv({
  base: `
    inline-flex items-center gap-sds-50 w-fit
    underline decoration-1 decoration-solid underline-offset-2 whitespace-nowrap
    rounded-sds-50
    ${FOCUS_RING_OFFSET_3}
  `,
  variants: {
    size: {
      large: `typo-body-l [&_svg]:size-[18px]`,
      medium: `typo-body-m [&_svg]:size-4`,
      // typo-body-s is 12px/21px (1.75 ratio) — Figma's Link "Small" size
      // specifies 12px/19.2px (1.6 ratio, matching Large/Medium's own ratio),
      // NOT the shared Body-S text style's ratio. Confirmed via
      // get_design_context on node 16337:8408 (2026-09-10): every Link size
      // uses `leading-[1.6]` uniformly, while typo-body-s (used elsewhere,
      // e.g. DropdownMenu's supportText) is built from a different ratio.
      // Arbitrary line-height value, per design-foundation.md §3's allowance
      // when no existing token step expresses the value.
      small: `text-[length:var(--font-size-sds-body-s)] leading-[1.6] [&_svg]:size-[14px]`,
    },
    disabled: {
      true: `text-sds-text-disable [&_svg]:text-sds-icon-disable cursor-not-allowed pointer-events-none`,
      false: `text-sds-text-link [&_svg]:text-sds-icon-link hover:decoration-2 cursor-pointer`,
    },
  },
  // Medium/Small don't meet WCAG 2.2's 24x24px minimum target size on their
  // own (confirmed via Figma's own guideline text: "Medium / Small は単体
  // では、WCAG 2.2 の最小サイズ 24×24px を満たさないため、実装側で上下に余白を
  // 確保し、見た目を変えずに領域だけを広げてください" — expand the tap area
  // via invisible padding, without changing the visible size). `py-*`
  // expands the real clickable/tappable box; the paired `-my-*` cancels the
  // added space in normal document flow so surrounding layout is unaffected.
  compoundVariants: [
    { size: 'medium', class: 'py-sds-25 -my-sds-25' },
    { size: 'small', class: 'py-sds-50 -my-sds-50' },
  ],
  defaultVariants: {
    size: 'large',
    disabled: false,
  },
});
