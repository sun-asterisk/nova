/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import dts from 'vite-plugin-dts';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  rmSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// Plugin to copy global.css to dist
const copyGlobalCss = () => ({
  name: 'copy-global-css',
  closeBundle() {
    const src = path.resolve(dirname, 'scripts/global.css');
    const dest = path.resolve(dirname, 'dist/global.css');
    try {
      mkdirSync(path.dirname(dest), { recursive: true });
      copyFileSync(src, dest);
      console.log('Copied global.css to dist/');
    } catch (err) {
      console.error('Failed to copy global.css:', err);
    }
  },
});

// Plugin to copy the opt-in branded-fonts stylesheet to dist (plain CSS,
// no Tailwind processing needed — see src/branded-fonts.css).
const copyBrandedFontsCss = () => ({
  name: 'copy-branded-fonts-css',
  closeBundle() {
    const src = path.resolve(dirname, 'src/branded-fonts.css');
    const dest = path.resolve(dirname, 'dist/branded-fonts.css');
    try {
      mkdirSync(path.dirname(dest), { recursive: true });
      copyFileSync(src, dest);
      console.log('Copied branded-fonts.css to dist/');
    } catch (err) {
      console.error('Failed to copy branded-fonts.css:', err);
    }
  },
});

// Both Rollup outputs (ESM + CJS) share one `dir: 'dist'` and each emits the
// same extracted stylesheet through the SAME `assetFileNames` function (Vite
// warns, and only honours one pattern, if outputs differ), so both write the
// identical dist/index.css — the file every CSS export points at. The
// cleanup plugin below is a safety net: any stylesheet that still lands
// inside dist/esm or dist/cjs is an orphan no `exports` key reaches.
// History: the pre-2026-09-29 three-output layout re-emitted the CSS as
// dist/cjs/sun-design-system.css and dist/esm/sun-design-system.css (Phase
// 10/11 finding, ~183KB/54% of package size — docs/architecture/
// repository-architecture.md); see docs/architecture/
// package-entry-architecture.md for the current layout.
const libAssetFileNames = (assetInfo: { names?: readonly string[] }) =>
  assetInfo.names?.some((n) => n.endsWith('.css')) ? 'index.css' : 'assets/[name][extname]';

const removeDuplicateCss = () => ({
  name: 'remove-duplicate-css',
  closeBundle() {
    for (const dir of ['dist/cjs', 'dist/esm']) {
      let entries: string[];
      try {
        entries = readdirSync(path.resolve(dirname, dir));
      } catch {
        continue;
      }
      for (const file of entries) {
        if (!file.endsWith('.css') && !file.endsWith('.css.map')) continue;
        rmSync(path.resolve(dirname, dir, file));
        console.log(`Removed duplicate CSS artifact: ${dir}/${file}`);
      }
    }
  },
});

// vite-plugin-dts sometimes resolves a bare specifier like 'react' through
// pnpm's node_modules/react symlink to its REAL, package-manager-specific
// store path (node_modules/.pnpm/react@<version>/node_modules/react) and
// bakes that non-portable path into the emitted .d.ts file's import
// statement — unresolvable for any consumer without this exact pnpm store
// layout (Phase 10 finding: 121 real TS2307 errors against a clean
// consumer). Phase 11 found this is NOT reliably preventable via
// `preserveSymlinks: true` in tsconfig.build.json — that config change
// fixes the specifier but makes TypeScript treat the symlinked and
// realpath-resolved copies of React's types as two different identities,
// breaking every component that spreads props onto a Radix primitive
// (~40 new cascading TS2322/TS2339 errors). It also isn't deterministic:
// a clean rebuild sometimes doesn't reproduce it at all, then reproduces
// again after an unrelated `pnpm install` reshuffles the pnpm store.
// Given no safe way to prevent TypeScript from resolving through the
// symlink in the first place, this plugin corrects the emitted TEXT after
// the fact: TypeScript has already finished type-checking (correctly, using
// its normal symlink-following resolution) by the time this runs, so
// rewriting an import specifier string here cannot change what a type
// means — only how its module path is spelled. scripts/quality/
// verify-package.mjs's declaration-file scan (added the same phase this
// plugin was added) is the permanent regression gate: it fails the build
// pipeline if this class of path ever leaks through unfixed.
const fixDeclarationImportPaths = () => ({
  name: 'fix-declaration-import-paths',
  closeBundle() {
    const typesDir = path.resolve(dirname, 'dist/types');
    const PNPM_STORE_PATH =
      /(?:\.\.\/)*node_modules\/\.pnpm\/[^/]+\/node_modules\/((?:@[^/]+\/)?[^/'"]+)/g;
    let filesFixed = 0;
    const walk = (dir: string) => {
      let entries;
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch {
        return; // dist/types may not exist yet on a partial/failed build
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (entry.name.endsWith('.d.ts')) {
          const content = readFileSync(full, 'utf8');
          const fixed = content.replace(PNPM_STORE_PATH, '$1');
          if (fixed !== content) {
            writeFileSync(full, fixed);
            filesFixed += 1;
          }
        }
      }
    };
    walk(typesDir);
    if (filesFixed > 0) {
      console.log(
        `Rewrote ${filesFixed} declaration file(s) with a non-portable pnpm-store import path back to a bare specifier.`,
      );
    }
  },
});

// Makes the emitted declarations correct under every TypeScript
// `moduleResolution` a consumer can realistically use (F3 in the external
// consumer audit):
//
//  1. Relative specifiers get an explicit extension. This package is
//     `"type": "module"`, so under node16/nodenext every dist/types/**/*.d.ts
//     is an ES module, and ESM resolution never guesses extensions or
//     directory indexes — `export * from './Button'` was an
//     InternalResolutionError. Rewritten to `./Button.js` /
//     `./components/index.js` (TS maps `.js` → `.d.ts` in every mode,
//     node10 and bundler included).
//  2. A CommonJS twin (`.d.cts`, specifiers rewritten to `.cjs`) is written
//     next to every `.d.ts`. The `require` condition must point at
//     CJS-format declarations; sharing the ESM `.d.ts` made TypeScript
//     believe `require()` returns an ES module ("Masquerading as ESM").
//  3. dist/types/styles.d.cts (+ styles.d.ts) — an empty module that gives
//     the CSS subpaths a `types` target, so `import '<pkg>/styles'` resolves
//     under TS 6's `noUncheckedSideEffectImports` (NX-04). `exports` points
//     at the .d.cts: an `export {}` CommonJS declaration is valid from both
//     require and import, whereas the ESM-format .d.ts would make
//     node16-from-CJS report "ESM (dynamic import only)" for a stylesheet.
//     The .d.ts copy is the `typesVersions` (node10) target.
//
// Runs after fixDeclarationImportPaths (plugin order) so it only ever sees
// already-portable bare specifiers. The rewrite only touches module
// specifier strings, never type content.
const finalizeDeclarations = () => ({
  name: 'finalize-declarations',
  closeBundle() {
    const typesDir = path.resolve(dirname, 'dist/types');
    const RELATIVE_SPECIFIER = /((?:from|import)\s*\(?\s*)(['"])(\.\.?\/[^'"]*)\2/g;
    const files: string[] = [];
    const walk = (dir: string) => {
      let entries;
      try {
        entries = readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name.endsWith('.d.ts')) files.push(full);
      }
    };
    walk(typesDir);
    const unresolved: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      const withExtensions = content.replace(
        RELATIVE_SPECIFIER,
        (match, prefix: string, quote: string, spec: string) => {
          if (/\.(js|cjs|mjs|json)$/.test(spec)) return match;
          const base = path.resolve(path.dirname(file), spec);
          if (existsSync(`${base}.d.ts`)) return `${prefix}${quote}${spec}.js${quote}`;
          if (existsSync(path.join(base, 'index.d.ts')))
            return `${prefix}${quote}${spec.replace(/\/$/, '')}/index.js${quote}`;
          unresolved.push(`${path.relative(dirname, file)} → ${spec}`);
          return match;
        },
      );
      if (withExtensions !== content) writeFileSync(file, withExtensions);
      const cjsTwin = withExtensions
        .replace(RELATIVE_SPECIFIER, (match, prefix: string, quote: string, spec: string) =>
          spec.endsWith('.js') ? `${prefix}${quote}${spec.slice(0, -3)}.cjs${quote}` : match,
        )
        .replace(/\n?\/\/# sourceMappingURL=.*$/m, '');
      writeFileSync(file.replace(/\.d\.ts$/, '.d.cts'), cjsTwin);
    }
    const stylesDecl =
      '// Type-only target for the CSS subpath exports (./styles, ./styles.css,\n' +
      '// ./global.css, ./branded-fonts.css). A stylesheet has no JS exports.\nexport {};\n';
    writeFileSync(path.join(typesDir, 'styles.d.ts'), stylesDecl);
    writeFileSync(path.join(typesDir, 'styles.d.cts'), stylesDecl);
    if (unresolved.length > 0) {
      // Fail loudly: an unresolvable relative specifier would ship as an
      // InternalResolutionError for node16 consumers.
      throw new Error(
        `finalize-declarations: could not resolve ${unresolved.length} relative specifier(s):\n  ${unresolved.join('\n  ')}`,
      );
    }
    console.log(
      `Finalized ${files.length} declaration file(s): explicit extensions + .d.cts twins.`,
    );
  },
});

// NOTE: this package intentionally does NOT auto-inject a CSS import into
// dist/index.js / dist/cjs/index.cjs (a prior version of this config did,
// via a closeBundle file-mutation step). That approach made the root entry
// point crash in any environment that resolves/executes JS without a
// CSS-aware bundler in the loop — plain Node scripts, ts-node, ts-jest/Vitest
// without a CSS transform, and Next.js's default webpack config (which
// rejects global CSS imported from inside a node_modules JS module).
// Consumers must explicitly import the stylesheet themselves, e.g.:
//   import '@sun-asterisk/nova/styles';
// See README.md's "Installation" section and Phase 6/Phase 8 audit docs
// for
// the full rationale — this is a deliberate, documented behavior change.

// ---------------------------------------------------------------------------
// Entries & externals — ONE module graph for root + every subpath.
// ---------------------------------------------------------------------------
// Before 2026-09-29 the package was built by two independent `vite build`
// passes (this file for the root bundle, plus a since-deleted
// vite.esm-components.config.ts for the per-component subpaths). Two builds
// means two module graphs: `<pkg>` and `<pkg>/theme-provider` each carried
// their OWN copy of ThemeContext, so a root `<ThemeProvider>` + subpath
// `useTheme()` threw "must be used within a <ThemeProvider>", and every
// component shipped twice (+50% package size). Now one build declares the
// root barrel AND every public subpath barrel as entries of the same graph,
// with `preserveModules` so each source module becomes exactly one output
// file that every entry imports. `<pkg>`.ThemeProvider and
// `<pkg>/theme-provider`.ThemeProvider are therefore the same module
// instance (asserted against the packed tarball by
// scripts/quality/verify-package.mjs §3.2, in ESM and CJS).
//
// Why each barrel must still be an explicit entry: with preserveModules,
// Rollup inlines a module that contains only re-exports into its importers
// and never emits a file for it unless it is itself an entry — exactly what
// every src/components/<name>/index.ts is (Phase 6 CRIT-01/CRIT-09).
const componentsDir = path.resolve(dirname, 'src/components');
const COMPONENT_DIRS = readdirSync(componentsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && existsSync(path.join(componentsDir, d.name, 'index.ts')))
  .map((d) => d.name)
  .sort();

const buildEntries: Record<string, string> = {
  index: path.resolve(dirname, 'src/index.ts'),
  ...Object.fromEntries(
    COMPONENT_DIRS.map((name) => [
      `components/${name}/index`,
      path.join(componentsDir, name, 'index.ts'),
    ]),
  ),
  // `cn()` is the one deliberate public non-visual export (Phase X
  // Foundation Capability Audit §9.1/P1.1). The entry points at
  // src/utils/style.ts (exports ONLY `cn`), never the internal
  // src/utils/index.ts barrel, which also re-exports `useFieldIds` and the
  // focus-ring constants. Those modules still exist as files under
  // dist/{esm,cjs}/utils/ (preserveModules), but no `exports` key reaches
  // them — verify-package.mjs §3.5 asserts they stay blocked.
  'utils/cn': path.resolve(dirname, 'src/utils/style.ts'),
};

// Everything a consumer installs (dependencies + peerDependencies), plus any
// deep import of one (`react/jsx-runtime`, `react-day-picker/locale`, ...),
// is external — never vendored into dist/ (Phase 6/8 P6-CRIT-10). Derived
// from package.json so a new dependency can't be silently bundled.
const pkgJson = JSON.parse(readFileSync(path.resolve(dirname, 'package.json'), 'utf8')) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const EXTERNAL_PACKAGES = [
  ...Object.keys(pkgJson.dependencies ?? {}),
  ...Object.keys(pkgJson.peerDependencies ?? {}),
];
const isExternal = (id: string) =>
  EXTERNAL_PACKAGES.some((name) => id === name || id.startsWith(`${name}/`));

// Client-boundary modules carry a 'use client' directive in their source:
// ThemeProvider (wraps an app's root layout — a Server Component by default
// in Next.js App Router) and the modules that create React context at module
// scope (Modal.tsx, and DatePicker's react-day-picker-importing files), which
// otherwise crash with `createContext is not a function` when merely
// *imported* from a Server Component — and, through the root barrel, made
// the whole root entry RSC-unsafe (FINDINGS NX-03, 2026-09-29). ThemeScript.ts
// must stay directive-free so `getThemeScript()` remains callable from a
// Server Component.
// preserveModules emits each source module as its own file. Rollup strips
// module-level directives and esbuild's minifier drops a bare 'use client'
// as dead code, so an `output.banner` re-injects it after minification — the
// only point where it reliably survives. The banner is derived from the
// source file itself, so adding the directive to a new client-boundary
// module needs no config change. verify-package.mjs asserts the directive is
// the first statement of the expected ESM and CJS files in the packed
// tarball.
const USE_CLIENT_DIRECTIVE = /^\s*(?:\/\/[^\n]*\n\s*|\/\*[\s\S]*?\*\/\s*)*['"]use client['"]/;
const useClientCache = new Map<string, boolean>();
function hasUseClientDirective(id: string) {
  if (!useClientCache.has(id)) {
    let result = false;
    try {
      result = USE_CLIENT_DIRECTIVE.test(readFileSync(id, 'utf8'));
    } catch {
      result = false; // virtual/non-file module
    }
    useClientCache.set(id, result);
  }
  return useClientCache.get(id)!;
}
function useClientBanner(chunk: { facadeModuleId: string | null }) {
  return chunk.facadeModuleId && hasUseClientDirective(chunk.facadeModuleId) ? "'use client';" : '';
}

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vanillaExtractPlugin(),
    copyGlobalCss(),
    copyBrandedFontsCss(),
    removeDuplicateCss(),
    dts({
      insertTypesEntry: true,
      entryRoot: path.resolve(dirname, 'src'),
      // vite-plugin-dts v5 (unplugin-dts) renamed `outDir` → `outDirs`; the old
      // key is silently ignored and declarations land in dist/ instead of
      // dist/types/, breaking every subpath export's `types` path.
      outDirs: path.resolve(dirname, 'dist/types'),
      include: [
        'src/index.ts',
        'src/vite-env.d.ts',
        'src/components/index.ts',
        'src/utils/**/*.ts',
        // Only include exported components
        'src/components/button/**/*.{ts,tsx}',
        'src/components/input/**/*.{ts,tsx}',
        'src/components/textField/**/*.{ts,tsx}',
        'src/components/textarea/**/*.{ts,tsx}',
        'src/components/textareaField/**/*.{ts,tsx}',
        'src/components/radioGroup/**/*.{ts,tsx}',
        'src/components/badge/**/*.{ts,tsx}',
        'src/components/divider/**/*.{ts,tsx}',
        'src/components/switch/**/*.{ts,tsx}',
        'src/components/checkbox/**/*.{ts,tsx}',
        'src/components/tooltip/**/*.{ts,tsx}',
        'src/components/tab/**/*.{ts,tsx}',
        'src/components/snackbar/**/*.{ts,tsx}',
        'src/components/modal/**/*.{ts,tsx}',
        'src/components/scrim/**/*.{ts,tsx}',
        'src/components/datePicker/**/*.{ts,tsx}',
        'src/components/scrollbar/**/*.{ts,tsx}',
        'src/components/dropdownMenu/**/*.{ts,tsx}',
        'src/components/themeProvider/**/*.{ts,tsx}',
        'src/components/icons/**/*.{ts,tsx}',
        'src/components/link/**/*.{ts,tsx}',
        'src/components/avatar/**/*.{ts,tsx}',
        'src/components/spinner/**/*.{ts,tsx}',
        'src/components/progressBar/**/*.{ts,tsx}',
        'src/components/statusIcon/**/*.{ts,tsx}',
      ],
      exclude: ['**/*.stories.tsx', '**/*.test.tsx', '**/*.spec.tsx', '**/*.figma.ts'],
      tsconfigPath: './tsconfig.build.json',
    }),
    fixDeclarationImportPaths(),
    finalizeDeclarations(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src'),
    },
  },
  build: {
    // ONE Rollup graph for the whole package (see the entry/output notes at
    // the top of this file).
    // `formats` is omitted: Vite ignores it when rollupOptions.output is an
    // array, and says so with a warning.
    lib: {
      entry: buildEntries,
    },
    cssCodeSplit: false,
    sourcemap: true,
    minify: 'esbuild',
    rollupOptions: {
      external: isExternal,
      output: [
        {
          format: 'es',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: 'esm/[name].js',
          // preserveModules emits no shared chunks today; kept explicit so a
          // future virtual/helper module can never land at the dist/ root.
          chunkFileNames: 'esm/_chunks/[name]-[hash].js',
          assetFileNames: libAssetFileNames,
          exports: 'named',
          interop: 'auto',
          banner: useClientBanner,
        },
        {
          format: 'cjs',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: 'cjs/[name].cjs',
          chunkFileNames: 'cjs/_chunks/[name]-[hash].cjs',
          assetFileNames: libAssetFileNames,
          exports: 'named',
          interop: 'auto',
          banner: useClientBanner,
        },
      ],
    },
  },
  test: {
    projects: [
      // Type-only public API contract fixtures (Section 15) — never
      // executed, only typechecked. See test/api/*.test-d.tsx.
      {
        extends: true,
        test: {
          name: 'api',
          include: ['test/api/**/*.test-d.tsx'],
          typecheck: {
            enabled: true,
            only: true,
            // Must be explicit: the root tsconfig.json is a solution-style
            // file with `"files": []` and only `references` — handing that
            // to a plain tsc-based check silently checks NOTHING (see
            // package.json's `typecheck` script and docs/architecture/
            // remediation-report.md's Baseline section for the identical
            // bug this project's own `pnpm typecheck` had before Phase 8).
            tsconfig: './tsconfig.test-api.json',
          },
        },
      },
      // Plain unit/logic tests (*.test.ts / *.test.tsx). Deliberately reuses
      // the same Playwright/chromium browser runtime as the "storybook"
      // project below rather than adding a jsdom/happy-dom dependency — this
      // repo already made the choice to test against a real browser engine,
      // and introducing a second, different DOM implementation just for this
      // layer would be a new source of environment-specific behavior
      // differences for no real benefit.
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          setupFiles: ['test/unit.setup.ts'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
      // The same stories again in dark mode (global `theme: 'dark'` →
      // `data-theme="dark"` on <html>): every play() and every axe scan,
      // including color-contrast, must also pass in dark. See
      // .storybook/vitest.setup.dark.ts. Stories tagged `light-only`
      // (inherently light-specific assertions, each with a reason) are skipped.
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            tags: { exclude: ['light-only'] },
          }),
        ],
        test: {
          name: 'storybook-dark',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.dark.ts'],
        },
      },
    ],
  },
});
