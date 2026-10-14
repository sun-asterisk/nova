import { tv } from 'tailwind-variants';
import { FOCUS_RING_OFFSET_2 } from '@/utils';

export const modalStyles = tv({
  slots: {
    // z-[51] (one above `overlay`'s z-50): Radix portals ModalOverlay and
    // ModalContent as separate sibling nodes under document.body, so
    // correct stacking must not depend on DOM/mount order — content needs
    // an explicitly higher z-index than the overlay, not just an equal one.
    //
    // `max-h-[calc(100vh-160px)]`: Figma's own guideline is explicit —
    // "Max-height：画面上下に80pxのマージンを確保" (reserve an 80px margin on
    // BOTH the top and bottom of the viewport), not "80% of viewport
    // height". The previous `max-h-[80vh]` only coincidentally matches at
    // specific viewport heights (e.g. 800px: 80vh=640px vs 800-160=640px)
    // and is measurably wrong at others (e.g. 1200px viewport: 80vh=960px
    // vs the correct 1200-160=1040px).
    //
    // `pb-sds-300` lives here (on the outer content box), not on `footer` —
    // Figma's own root Modal container has `pb-[24px]` unconditionally,
    // regardless of whether the footer/action row is present at all (a
    // footer-less modal is an explicitly recommended pattern per Figma's
    // own guideline: "フッター自体を省略することを推奨"). Putting it only on
    // `footer` (the prior implementation) meant a footer-less modal had
    // zero bottom padding below its body content.
    content: `
      fixed top-[50%] left-[50%]
      z-[51]
      translate-x-[-50%] translate-y-[-50%]
      w-full max-w-[calc(100%-2rem)]
      bg-sds-surface-base
      rounded-sds-400
      shadow-sds-level-5
      outline-none
      pb-sds-300
      data-[state=open]:animate-in data-[state=closed]:animate-out
      data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
      data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
      duration-200
      flex flex-col
      max-h-[calc(100vh-160px)]
    `,
    closeButton: `
      inline-flex items-center justify-center
      w-[24px] h-[24px]
      text-sds-icon-secondary
      ${FOCUS_RING_OFFSET_2}
      [&_svg]:w-[24px] [&_svg]:h-[24px]
      [&_svg]:pointer-events-none
      [&_svg]:shrink-0
      cursor-pointer
    `,
    header: `
      p-sds-300
      flex-shrink-0
      flex items-center justify-between
      border-b border-transparent
      transition-colors duration-150
    `,
    // Figma "+ Status Icon": a 24px status icon, 12px before the title.
    headerLead: `
      flex items-center gap-sds-150 min-w-0
    `,
    title: `
      typo-label-l-bold
      text-sds-text-primary
    `,
    // Figma's Modal has no separate "caption under title" text style — the
    // only secondary/supporting text it actually uses (the Body/Contents
    // "message", 14px/400/1.6 line-height) is `typo-body-m`, not
    // `typo-body-s` (12px). The previous `typo-body-s` didn't match any
    // real text style used in the Modal component.
    description: `
      typo-body-m
      text-sds-text-secondary
    `,
    // Figma's Body/Contents area is `flex flex-col gap-[8px]` — the
    // previous version had no layout/gap of its own, so multiple direct
    // children (e.g. a message paragraph plus a form field) would stack
    // with zero spacing unless the consumer supplied their own margin.
    // The body scrolls inside the Sun Scrollbar (Figma's Modal body has a
    // Scrollbar Rail, 2026-10-07): `body` is the ScrollArea root (fills the
    // space left between header and footer), `bodyViewport` the scrolling
    // element (horizontal padding), `bodyContent` the 8px-gap column.
    // The ScrollArea viewport's own `size-full` (h-full) cannot resolve here:
    // the modal's height is only capped by `max-h`, never definite, so the
    // viewport grew with its content and the root clipped it instead of
    // scrolling. Making the root a flex column and the viewport `flex-1
    // min-h-0` lets the capped space flow down to the viewport.
    body: `
      flex-1 min-h-0 flex flex-col
    `,
    bodyViewport: `
      h-auto flex-1 min-h-0
      px-sds-300
    `,
    bodyContent: `
      flex flex-col gap-sds-100
    `,
    // No `pb` here — see `content`'s own `pb-sds-300` above, which now covers
    // the modal's bottom padding whether or not a footer is present.
    footer: `
      flex items-center justify-end gap-sds-150
      pt-sds-300 px-sds-300
      flex-shrink-0
      border-t border-transparent
      transition-colors duration-150
    `,
  },
  variants: {
    size: {
      small: {
        content: 'sm:max-w-[384px]',
      },
      medium: {
        content: 'sm:max-w-[560px]',
      },
      large: {
        content: 'sm:max-w-[768px]',
      },
      // Figma "Auto（コンテンツ量に応じて可変）": width follows the content,
      // still capped by the viewport (`max-w-[calc(100%-2rem)]` in `content`).
      auto: {
        content: 'w-auto',
      },
    },
    // Figma "+ Status Icon": body and footer start at the title's left edge —
    // 24px padding + 24px icon + 12px gap = 60px (no spacing token is 60px).
    indented: {
      true: {
        bodyViewport: 'pl-[60px]',
        footer: 'pl-[60px]',
      },
    },
    // Figma: when the body's content overflows and requires scrolling, a
    // divider line dynamically appears on whichever side still has hidden
    // content — below the header while more content is hidden above (i.e.
    // not scrolled all the way to the top), above the footer while more
    // content is hidden below (i.e. not scrolled all the way to the
    // bottom). Both, one, or neither can be visible at once. Uses a real
    // (always-present, `border-transparent` by default) border rather than
    // conditionally adding/removing the border utility itself, so toggling
    // it doesn't shift layout by the border's own width.
    headerDivider: {
      true: { header: 'border-sds-border-weak' },
    },
    footerDivider: {
      true: { footer: 'border-sds-border-weak' },
    },
  },
  defaultVariants: {
    size: 'medium',
  },
});
