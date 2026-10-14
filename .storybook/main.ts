import type { StorybookConfig } from '@storybook/react-vite';

import { createRequire } from 'module';
import { join, dirname } from 'path';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

// Storybook 10 loads main.ts as ESM, where `require` is undefined —
// resolve package paths through createRequire instead.
const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')));
}
const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  viteFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '@': fileURLToPath(new URL('../src', import.meta.url)),
      },
    };

    // サブパス対応: /storybook/ 配下で静的ビルドが動作するよう base を設定
    if (process.env.STORYBOOK_BASE_PATH) {
      config.base = process.env.STORYBOOK_BASE_PATH;
    }

    config.plugins = [...(config.plugins || []), vanillaExtractPlugin(), tailwindcss()];
    return config;
  },
};
export default config;
