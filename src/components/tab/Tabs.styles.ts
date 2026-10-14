import { tv } from 'tailwind-variants';

export const tabsStyles = tv({
  slots: {
    root: 'flex flex-col',
    // Figma Tab guideline (frame 2006:1663, synced 2026-10-07): tabs keep their
    // own size and a one-line label; when they do not fit, the list scrolls
    // horizontally (`overflow-x-auto`) instead of squeezing every tab. The 16px
    // start/end padding doubles as scroll-padding (`scroll-px-sds-200`) so a
    // selected edge tab scrolled into view by `Tabs` keeps a 16px margin.
    list: 'flex overflow-x-auto scroll-px-sds-200 mb-sds-300 px-sds-200 border-b-1 border-sds-border-basic',
    trigger: `
      relative
      group
      whitespace-nowrap
      h-sds-500
      flex items-center justify-center
      cursor-pointer bg-transparent
      outline-none
      not-italic typo-label-l-regular
      text-sds-text-secondary
      transition-colors
      enabled:hover:text-sds-text-primary enabled:hover:typo-label-l-bold
      disabled:cursor-not-allowed
      disabled:text-sds-text-disable
      disabled:border-sds-border-disable
      data-[state=active]:typo-label-l-bold
      data-[state=active]:text-sds-text-primary
      data-[state=active]:border-b-2
      data-[state=active]:border-sds-border-strong
      before:content-[attr(data-text)]
      before:invisible
      before:block
      before:h-0
      before:overflow-hidden
      before:font-bold
      before:select-none
      [&>div>svg]:size-5 [&>div>svg]:shrink-0
      [&>div>svg]:text-sds-icon-secondary
      data-[state=inactive]:enabled:hover:[&>div>svg]:text-sds-icon-primary-hover
      data-[state=active]:[&>div>svg]:text-sds-icon-primary
      disabled:[&>div>svg]:text-sds-icon-disable
    `,
    // Leading icon (Figma Tab / Primary, 2185:1731): 20×20 and its own color per
    // State — Enabled icon-secondary, Hover icon-primary-hover, Active
    // icon-primary, Disabled icon-disable — instead of inheriting the label
    // color (the hover icon used to be text-primary). `[&>div>svg]` matches only
    // an icon placed directly in the trigger content, never the svg nested
    // inside a Badge.

    // `h-sds-500` (2.5rem = 40px) on trigger matches Figma's Tab/Primary frame
    // height exactly, across every state including Active's thicker
    // border-b-2 — Tailwind's global border-box sizing (Preflight) absorbs
    // that extra 1px into the same fixed height rather than growing past
    // it, matching Figma's Active symbol (also 40px tall).
    //
    // `outline-none` on trigger suppresses the browser's own native default
    // focus outline — the visible ring is a separate `focusRing` overlay
    // (below), not a CSS `outline`, and NOT built from
    // `src/utils/focusRing.ts`'s shared `FOCUS_RING_OFFSET_*` constants —
    // deliberately evaluated and excluded (see that file's composition rule
    // #3), not overlooked. This is deliberate: `outline` is always
    // painted OUTSIDE the border-box, so it can never visually cover the
    // trigger's own `border-b-2` active-indicator underneath it (confirmed
    // by rendering both together: a real `outline` sits flush right next to,
    // not on top of, the active border, showing as two adjacent bands). A
    // `border` on a separate absolutely-positioned child, by contrast, paints
    // after/above the trigger's own border decoration (normal child-over-
    // parent paint order) and so can fully cover it — matching Figma's own
    // "Focus Ring" node (3614:2053), which is a same-sized overlay rectangle,
    // not an outline.
    // Figma: 4px between icon, label and badge (was gap-2 / 8px).
    triggerContent: `
      px-sds-200
      flex items-center gap-sds-50
    `,
    // Full-size overlay matching Figma's Focus Ring node (3614:2053: x:0/y:0,
    // exactly the same 132x40 size as the whole tab symbol) — not a smaller
    // ring floating around just the inner label/icon/badge cluster.
    // `rounded-[6px]` is an intentional arbitrary value: it's the Focus Ring
    // node's literal authored radius and doesn't correspond to any step in
    // the numeric radius scale (100=4px, 200=8px).
    // Bottom is extended -0.5 (2px, vs. Figma's own -1px) rather than flush:
    // Figma's -1px was sized to cover only its thin 1px non-active border: our
    // Active+Focus combination (not shown as its own state in Figma, since
    // Figma's state variants are mutually exclusive) has to also fully cover
    // a thicker 2px `border-b-2` active indicator underneath, so the overlay
    // needs a bit more reach to guarantee full coverage in that combined case.
    //
    // Only the ACTIVE trigger extends the overlay 2px down (`-bottom-0.5`, onto
    // its own `border-b-2`, still inside the trigger's border box). An inactive
    // trigger has no bottom border, so the overlay stays flush (`bottom-0`) —
    // since the list became a horizontal scroll container (2026-10-07) anything
    // below the trigger is clipped, and the old unconditional `-bottom-0.5` cut
    // the ring's whole bottom edge off on every inactive tab.
    focusRing: `
      pointer-events-none
      absolute top-0 right-0 left-0 bottom-0
      group-data-[state=active]:-bottom-0.5
      rounded-[6px] border-2 border-transparent
      group-focus-visible:border-sds-border-focus
    `,
    content: 'p-4 outline-none',
  },
});
