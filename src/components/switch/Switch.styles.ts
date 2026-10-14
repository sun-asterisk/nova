import { tv } from 'tailwind-variants';

// Thumb hover glow reuses the shadow-sds-level-1 token. This is not an
// elevation/floating-element shadow semantically (design.md's elevation table
// doesn't list Switch) — confirmed against Figma directly: the Hover symbol's
// own effect is literally "Elevation/Lv.1".
//
// The hover-shadow class is written out as one literal string in every
// compound variant below — never assembled at runtime (e.g.
// `group-hover:${CONST}`). Tailwind's scanner only sees literal strings in
// source, so an interpolated class is present on the element but never
// generated in the CSS (this shipped broken; see Switch.hover.test.tsx).

// `root` is a transparent 44x44-minimum hit-area wrapper — not the visible
// switch. Figma's own "タップ領域" (tap area) guideline states explicitly:
// "見た目のサイズとは別に、トグルスイッチ全体に最小 44×44px のタップ領域を確保
// します" (separately from the visual size, ensure the whole toggle switch
// has a minimum 44x44px tap area) — confirmed via redline metadata (a 44x44
// `Range` rectangle centered over both Medium's 40x24 and Large's 52x32
// tracks). This also matches accessibility.md §6.1 ("SHOULD be 44x44 on
// touch devices"). The VISIBLE colored track — same size/position/color as
// before this fix — is the separate `track` slot; `root` only owns hit-area
// sizing and cursor.
//
// Focus ring (Figma Switch 8248:329, `Focus` boolean, synced 2026-10-07):
// Figma's ring surrounds the visible TRACK — a 2px Border/Focus pill, 2px away
// from the track — not the transparent 44x44 tap area. It used to be
// `FOCUS_RING_OFFSET_2` on `root`, which drew a square ring around the tap
// area, well outside the switch. The ring now lives on `track` and is driven
// by the focused `root` (`group-focus-visible:`); `root` keeps `outline-none`
// so the browser's own focus outline does not appear on the tap area (safe:
// `root` has no competing `focus-visible:outline-*` chain any more —
// design-foundation.md §5.1). This is a documented exception to "use
// FOCUS_RING_OFFSET_2": the constant's `focus-visible:` classes target the
// focused element itself, and Tailwind only generates literal class strings,
// so the `group-focus-visible:` equivalent is written out here (same 2px /
// 2px-offset / border-focus recipe). `track` transitions only
// `background-color`: `transition-all` would animate the ring's outline-color
// from currentColor on every keyboard focus (§5.1).
export const switchStyles = tv({
  slots: {
    root: `
      relative inline-flex shrink-0 cursor-pointer items-center justify-center
      min-w-[44px] min-h-[44px]
      outline-none
      disabled:cursor-not-allowed
      group
    `,
    track: `
      relative inline-flex shrink-0 items-center
      rounded-sds-full border-2 border-transparent
      transition-[background-color] duration-200
      group-focus-visible:outline-2 group-focus-visible:outline-offset-2
      group-focus-visible:outline-sds-border-focus
    `,
    thumb: `
      pointer-events-none block rounded-sds-full bg-sds-surface-base
      transition-all duration-200
    `,
  },
  variants: {
    size: {
      medium: {
        track: 'h-[24px] w-[40px]',
        thumb: 'h-[20px] w-[20px]',
      },
      large: {
        track: 'h-[32px] w-[52px]',
        thumb: 'h-[28px] w-[28px]',
      },
    },
    checked: {
      false: {
        track: 'bg-sds-surface-secondary',
        thumb: 'translate-x-0',
      },
      true: {
        track: 'bg-sds-surface-primary group-hover:bg-sds-surface-primary-hover',
        thumb: '',
      },
    },
    disabled: {
      true: {
        track: 'bg-sds-surface-disabled group-hover:bg-sds-surface-disabled',
        thumb: 'bg-sds-surface-disabled-strong group-hover:bg-sds-surface-disabled-strong',
      },
    },
  },
  compoundVariants: [
    // Medium size - unchecked hover
    {
      size: 'medium',
      checked: false,
      disabled: false,
      class: {
        thumb: `group-hover:w-[24px] group-hover:shadow-sds-level-1`,
      },
    },
    // Large size - unchecked hover
    {
      size: 'large',
      checked: false,
      disabled: false,
      class: {
        thumb: `group-hover:w-[32px] group-hover:shadow-sds-level-1`,
      },
    },
    // Medium size - checked position + hover
    {
      size: 'medium',
      checked: true,
      disabled: false,
      class: {
        thumb: `translate-x-[16px] group-hover:w-[24px] group-hover:translate-x-[12px] group-hover:shadow-sds-level-1`,
      },
    },
    // Large size - checked position + hover
    {
      size: 'large',
      checked: true,
      disabled: false,
      class: {
        thumb: `translate-x-[20px] group-hover:w-[32px] group-hover:translate-x-[16px] group-hover:shadow-sds-level-1`,
      },
    },
    // Medium size - checked position disabled
    {
      size: 'medium',
      checked: true,
      disabled: true,
      class: {
        thumb: `translate-x-[16px]`,
      },
    },
    // Large size - checked position disabled
    {
      size: 'large',
      checked: true,
      disabled: true,
      class: {
        thumb: `translate-x-[20px]`,
      },
    },
  ],
  defaultVariants: {
    size: 'medium',
    checked: false,
    disabled: false,
  },
});
