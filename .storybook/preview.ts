import type { Preview } from '@storybook/react-vite';
import '../src/App.css';

// Global theme toolbar (Phase 13B, ThemeProvider integration — see
// docs/components/theme-provider.md §20). Deliberately a small, direct
// decorator rather than a new addon dependency: Storybook's preview
// renders each story inside its own iframe, so `document.documentElement`
// there is the correct root-scoped target — exactly the same mechanism
// ThemeProvider itself applies in a real page, so no story needs any
// per-story wiring to pick this up.
function applyPreviewTheme(theme: string) {
  if (theme === 'system') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', theme);
  }
  // Paint the canvas like a real themed page would. The library's CSS
  // deliberately leaves <body> unstyled (that's the consumer's page), so
  // without this the canvas stayed white in dark mode and transparent
  // components (Button `plain`, Link, …) were checked — and shown — as light
  // text on white: a false color-contrast failure found by the
  // `storybook-dark` project on 2026-10-05. Token vars, so it follows
  // data-theme (and `system`) automatically.
  document.body.style.backgroundColor = 'var(--color-sds-background-base)';
  document.body.style.color = 'var(--color-sds-text-primary)';
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
          { value: 'system', icon: 'browser', title: 'System' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [
    (Story, context) => {
      applyPreviewTheme(context.globals.theme ?? 'light');
      return Story();
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
  },
};

export default preview;
