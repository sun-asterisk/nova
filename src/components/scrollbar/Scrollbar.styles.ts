import { tv } from 'tailwind-variants';

export const scrollbarStyles = tv({
  slots: {
    root: 'relative overflow-hidden size-full',
    viewport: 'size-full rounded-[inherit]',
    // Single source of truth for both the composed <Scrollbar> and the
    // standalone <ScrollBarArea> primitive — previously ScrollBarArea
    // hardcoded its own, separately-maintained copy of this same visual
    // spec, which could silently drift out of sync with this file.
    scrollbar: 'flex touch-none select-none p-1 transition-colors',
    // No `flex-1`/`data-[orientation=...]` here — see the `variants` block
    // below for why. `transition-[width,height,background-color]` (not
    // `transition-colors`/`-all`): Figma's own guideline text explicitly
    // says the width change on hover should animate ("スクロールバーの幅が
    // アニメーションして拡大します"), which requires the size classes to
    // actually apply in the first place (see below) before the transition
    // can matter.
    // `data-[hovered=true]:` (not `hover:`) — the widen/darken state is
    // driven by real React state on the TRACK's pointer events
    // (Scrollbar.tsx), not a plain CSS `:hover` pseudo-class. See the
    // `orientation` variants below and Scrollbar.tsx for why.
    thumb:
      'relative rounded-sds-full bg-sds-border-basic transition-[width,height,background-color] data-[hovered=true]:bg-sds-border-strong',
    corner: 'bg-transparent',
  },
  variants: {
    // Orientation-dependent sizing is driven by this explicit `variants`
    // key (passed as `scrollbarStyles({ orientation })`), NOT by
    // `data-[orientation=...]:` selectors on the thumb — confirmed via a
    // real browser + Radix's own source (`ScrollAreaThumbImpl`,
    // `@radix-ui/react-scroll-area/dist/index.js`) that Radix's
    // `ScrollAreaThumb` element never sets its own `data-orientation`
    // attribute (only the parent `ScrollAreaScrollbar`/track does), so
    // every `data-[orientation=vertical]:w-1`/`hover:w-2`/etc. class
    // previously on the thumb silently never matched anything.
    //
    // The `!` (important) suffix on every size utility below is NOT
    // optional styling preference — it is load-bearing. Radix's
    // `ScrollAreaThumbImpl` always sets BOTH `width` and `height` via
    // inline `style` (`width: var(--radix-scroll-area-thumb-width)`,
    // `height: var(--radix-scroll-area-thumb-height)`), regardless of
    // orientation. For a vertical-only scrollbar the width variable is
    // never defined (only the horizontal scrollbar sets it), so that
    // inline `width` declaration computes to invalid-at-computed-value,
    // which resolves to `width`'s initial value (`auto`) — but an inline
    // style, even one that resolves to `auto`, still WINS the cascade
    // over a plain class, so a non-`!important` `w-1` class is silently
    // ignored no matter what. Confirmed via a real browser: without `!`,
    // the previous `flex-1` produced an accidental ~3px width from
    // flex-grow filling free space (unrelated to the intended 4px/8px,
    // and never responding to hover); replacing `flex-1` with `flex-none`
    // alone made it worse (0px — an empty div's auto/shrink-to-fit
    // width). Only `!important` actually beats the inline style. Found
    // and fixed 2026-09-08 — this means the thumb's intended hover-widen
    // behavior had never once worked in any shipped version.
    //
    // Track thickness is 12px (`w-3`/`h-3`) with 4px (`p-1`) padding, per
    // Figma's own "Hit Area" spec (node 12424:7122/12471:14134/12503:14324)
    // — was previously 8px/2px (`w-2`/`p-0.5`), a real, confirmed
    // measurement mismatch. At 4px padding, the default 4px-wide thumb
    // exactly fills the 12-2*4=4px content box; when the track is hovered
    // (`data-[hovered=true]`, set via Scrollbar.tsx — see there for why
    // it's the TRACK's hover, not the thumb's own, that Figma specifies)
    // the thumb widens to 8px, overflowing the padding by 2px each side,
    // leaving the exact 2px margin Figma's own Hover spec shows.
    orientation: {
      vertical: {
        scrollbar: 'w-3 h-full border-l border-l-transparent',
        thumb: 'flex-none w-1! data-[hovered=true]:w-2!',
      },
      horizontal: {
        scrollbar: 'h-3 w-full flex-col border-t border-t-transparent',
        thumb: 'flex-none h-1! data-[hovered=true]:h-2!',
      },
    },
  },
});
