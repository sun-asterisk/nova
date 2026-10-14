import { beforeEach } from 'vitest';
import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

// Stories run in one shared real-browser context, so anything a story
// persists to localStorage (ThemeProvider's default persistence, from
// Phase 13B) would otherwise leak into whichever story happens to run
// next and silently override that story's own `defaultMode`/`mode`.
beforeEach(() => {
  window.localStorage.clear();
});
