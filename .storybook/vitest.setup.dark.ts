import { beforeEach } from 'vitest';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// Dark-mode pass of the whole Storybook suite (`storybook-dark` Vitest
// project, 2026-10-05). Every story — its play() and the a11y addon's axe
// scan (`a11y.test: 'error'`, incl. color-contrast) — runs a second time with
// the global `theme` set to `dark`, which preview.ts's decorator applies as
// `data-theme="dark"` on <html>. Before this, only light mode was ever
// scanned, so a dark-only contrast or token regression could ship unnoticed.
//
// Stories whose assertions are inherently light-specific opt out with the
// `light-only` tag (excluded for this project in vite.config.ts) and must
// say why in a comment next to the tag.
setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
  { initialGlobals: { theme: 'dark' } },
]);

beforeEach(() => {
  window.localStorage.clear();
});
