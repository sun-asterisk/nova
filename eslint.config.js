// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginStorybook from 'eslint-plugin-storybook';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginTs from '@typescript-eslint/eslint-plugin';

export default [
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      prettier: prettierPlugin,
      '@typescript-eslint': eslintPluginTs,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...pluginReact.configs.flat.recommended.rules,
      ...prettierConfig.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'react/react-in-jsx-scope': 'off',
      'react/display-name': 'off',
      'prettier/prettier': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.stories.@(js|jsx|ts|tsx)'],
    plugins: {
      storybook: pluginStorybook,
    },
    rules: {
      ...pluginStorybook.configs.recommended.rules,
    },
  },
  {
    ignores: [
      'src/routeTree.gen.ts',
      'src/api/*',
      // External-consumer fixtures (test/consumers/README.md): independent
      // apps with their own deps/tsconfig/style, linted by nothing here on
      // purpose — they must look like real third-party code. Only the
      // repo-owned harness itself is linted.
      'test/consumers/**/*',
      '!test/consumers/run.mjs',
      '!test/consumers/harness/',
      '!test/consumers/harness/**',
    ],
  },
];
