import { tv } from 'tailwind-variants';

export const badgeStyles = tv({
  base: `
    inline-flex items-center justify-center
    text-center
  `,
  variants: {
    variant: {
      // `py-sds-50` (4px) is the exact vertical padding that produces Figma's
      // literal pill height (20px) for a 12px/12px-line-height typo class —
      // confirmed via Figma metadata (pill height:20, centered within a
      // 24-tall symbol). The previous `py-[6px]` was an arbitrary,
      // non-token value that also rendered a visibly taller (24px) pill.
      count: `
        bg-sds-surface-emphasis text-sds-text-on-surface
        px-sds-100 py-sds-50
        rounded-sds-full
        typo-label-s-regular
      `,
      // Figma's Dot symbol (node 1065:505) reserves a 24x24 anchor
      // footprint — same as Count/Label/Error — with the visible 10x10
      // circle centered inside it (see `badgeDotIndicatorClassName` below).
      // All four variants sharing one consistent box lets consumers overlay
      // any variant on an icon/avatar using the same positioning math.
      dot: `
        w-[24px] h-[24px]
      `,
      // `typo-label-s-bold` (font-weight 700) — Figma's Label badge glyph is
      // literal `font-bold`, not `font-semibold`/600 (confirmed directly
      // from Figma's own generated code for node 3127:1743, which emits
      // `font-bold` on the label text). A prior fix (commit 6057da4)
      // assumed 600/SemiBold without re-checking Figma; that assumption was
      // wrong.
      label: `
        bg-sds-surface-emphasis text-sds-text-on-surface
        px-sds-100 py-sds-50
        rounded-sds-full
        typo-label-s-bold
      `,
      // Container is fixed at Figma's 24x24 symbol footprint (node 1065:506);
      // the icon itself is deliberately sized smaller than this box in
      // Badge.tsx (19.2px) to match Figma's proportions, so the container
      // — not the svg — owns the 24x24 size here.
      error: `
        w-[24px] h-[24px]
        text-sds-icon-danger
      `,
    },
    // `position` is an independent, opt-in axis (no `defaultVariants` entry
    // below) — omitting it entirely keeps Badge's current static/inline
    // rendering. Not sourced from Figma (no anchor-position spec exists
    // there); a reasonable, common convention: -4px offset on both axes
    // (~half the Dot/Error 24px footprint bleeding outside the target's
    // corner), plus `z-10` so it stays above the content it overlays. The
    // consumer's own wrapper still needs its own `position: relative` (or
    // similar) for this to anchor correctly.
    position: {
      'top-right': 'absolute -top-1 -right-1 z-10',
      'top-left': 'absolute -top-1 -left-1 z-10',
      'bottom-right': 'absolute -bottom-1 -right-1 z-10',
      'bottom-left': 'absolute -bottom-1 -left-1 z-10',
    },
  },
  defaultVariants: {
    variant: 'count',
  },
});

// The visible circle rendered inside the `dot` variant's 24x24 container —
// a plain constant (not a tv() variant) since it's a single, non-variant
// inner element, not the badge's own root class.
export const badgeDotIndicatorClassName = `
  w-[10px] h-[10px] min-w-[10px] min-h-[10px]
  rounded-sds-full bg-sds-surface-emphasis
`;
