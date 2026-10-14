import { tv } from 'tailwind-variants';

// Figma "Scrim" (component 10930:5994, frame 10930:5489, Nova｜Master): a
// full-viewport `Background/Scrim` layer behind a front component (Modal,
// future Drawer/Sheet). It fades in with the front component and fades out
// when it closes ("前面コンポーネントが表示されるタイミングで同時にフェード
// インし、閉じる際にフェードアウトします"). The fade is a CSS animation, so the
// global prefers-reduced-motion rule already collapses it (design-foundation
// §5.4). `data-[state=closed]` drives the fade-out when a presence-aware
// parent (e.g. Radix Dialog's Overlay) keeps it mounted while closing.
export const scrimStyles = tv({
  base: `
    fixed inset-0 z-50 bg-sds-background-scrim
    animate-in fade-in-0 duration-200
    data-[state=closed]:animate-out data-[state=closed]:fade-out-0
  `,
});
