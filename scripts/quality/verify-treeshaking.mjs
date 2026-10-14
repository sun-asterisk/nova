#!/usr/bin/env node
/**
 * Formalizes the manual esbuild tree-shaking proof from Phase 8
 * into a repeatable check.
 * Bundles a single-component subpath import with every real dependency
 * externalized, then verifies the output contains no signature strings
 * from unrelated components — i.e. importing one component does not pull
 * the rest of the library along with it.
 *
 * Run AFTER `pnpm build`. Read-only aside from a throwaway temp file.
 */
import * as esbuild from 'esbuild';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Regression threshold from the Phase 8 baseline (3.1kB). Generous
// headroom (10x) because this is meant to catch cross-component
// contamination (should be a step-function jump, not a slow creep), not
// to police minor byte-level output changes from bundler version bumps.
const MAX_SINGLE_COMPONENT_BYTES = 30 * 1024;

// Signature strings unique to OTHER components' internals — if any of
// these show up in a Button-only bundle, something outside Button leaked
// in. Extend this list if new components with distinctive internals ship.
const CONTAMINATION_SIGNATURES = [
  'DayPicker', // DatePicker (react-day-picker)
  'ModalOverlay',
  'showSnackbar',
  'ScrollBarArea',
  'DropdownMenuSubTrigger',
  'TooltipPrimitive',
  'sun-theme', // ThemeProvider's default storageKey
];

const externals = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'radix-ui',
  'clsx',
  'tailwind-merge',
  'tailwind-variants',
  'react-icons/md',
  'lucide-react',
  'react-day-picker',
  'date-fns',
  '@date-fns/tz',
  'sonner',
];

console.log('== Tree-shaking verification ==\n');

const workDir = mkdtempSync(path.join(tmpdir(), 'sun-ds-treeshake-'));
let failures = 0;

try {
  const entryFile = path.join(workDir, 'entry.mjs');
  writeFileSync(
    entryFile,
    `export { Button } from '${path.join(rootDir, 'dist/esm/components/button/index.js')}';\n`,
  );

  const result = await esbuild.build({
    entryPoints: [entryFile],
    bundle: true,
    format: 'esm',
    write: false,
    external: externals,
    metafile: false,
  });

  const output = result.outputFiles[0].text;
  const sizeKB = (output.length / 1024).toFixed(2);

  console.log(
    `Button-only bundle: ${sizeKB}kB (regression ceiling: ${(MAX_SINGLE_COMPONENT_BYTES / 1024).toFixed(0)}kB)\n`,
  );

  if (output.length > MAX_SINGLE_COMPONENT_BYTES) {
    console.error(
      `  ✗ bundle size ${sizeKB}kB exceeds the ${MAX_SINGLE_COMPONENT_BYTES / 1024}kB regression ceiling`,
    );
    failures += 1;
  } else {
    console.log(`  ✓ bundle size within regression ceiling`);
  }

  for (const signature of CONTAMINATION_SIGNATURES) {
    if (output.includes(signature)) {
      console.error(
        `  ✗ found unrelated-component signature "${signature}" in a Button-only bundle`,
      );
      failures += 1;
    } else {
      console.log(`  ✓ no "${signature}" contamination`);
    }
  }

  // Root-entry tree-shaking (2026-09-29, docs/architecture/
  // package-entry-architecture.md): the root entry used to be one
  // monolithic bundle, so `import { Button } from '<pkg>'` pulled in the
  // whole library. It is now a re-export barrel over the same per-module
  // files the subpaths use, and package.json's `sideEffects: ["*.css"]` lets
  // a bundler drop every module the consumer doesn't reach. Same size
  // ceiling and contamination signatures as the subpath check above.
  const rootEntryFile = path.join(workDir, 'root-entry.mjs');
  writeFileSync(
    rootEntryFile,
    `export { Button } from '${path.join(rootDir, 'dist/esm/index.js')}';\n`,
  );
  const rootResult = await esbuild.build({
    entryPoints: [rootEntryFile],
    bundle: true,
    format: 'esm',
    write: false,
    external: externals,
    metafile: false,
  });
  const rootOutput = rootResult.outputFiles[0].text;
  const rootSizeKB = (rootOutput.length / 1024).toFixed(2);
  console.log(
    `\nButton-from-root bundle: ${rootSizeKB}kB (regression ceiling: ${(MAX_SINGLE_COMPONENT_BYTES / 1024).toFixed(0)}kB)\n`,
  );
  if (rootOutput.length > MAX_SINGLE_COMPONENT_BYTES) {
    console.error(
      `  ✗ bundle size ${rootSizeKB}kB exceeds the ${MAX_SINGLE_COMPONENT_BYTES / 1024}kB regression ceiling — the root entry is not tree-shaking`,
    );
    failures += 1;
  } else {
    console.log(`  ✓ bundle size within regression ceiling`);
  }
  for (const signature of CONTAMINATION_SIGNATURES) {
    if (rootOutput.includes(signature)) {
      console.error(
        `  ✗ found unrelated-component signature "${signature}" in a Button-from-root bundle`,
      );
      failures += 1;
    } else {
      console.log(`  ✓ no "${signature}" contamination`);
    }
  }

  // Symmetric check (Phase 13B): ThemeProvider ships as its own module
  // file (see vite.config.ts's entries/preserveModules) specifically to stay
  // RSC-safe — a build misconfiguration that let it re-absorb the rest of
  // the library would silently reintroduce that risk.
  const themeProviderEntryFile = path.join(workDir, 'theme-provider-entry.mjs');
  writeFileSync(
    themeProviderEntryFile,
    `export { ThemeProvider } from '${path.join(rootDir, 'dist/esm/components/themeProvider/index.js')}';\n`,
  );

  const themeProviderResult = await esbuild.build({
    entryPoints: [themeProviderEntryFile],
    bundle: true,
    format: 'esm',
    write: false,
    external: externals,
    metafile: false,
  });

  const themeProviderOutput = themeProviderResult.outputFiles[0].text;
  const themeProviderSizeKB = (themeProviderOutput.length / 1024).toFixed(2);

  console.log(
    `\nThemeProvider-only bundle: ${themeProviderSizeKB}kB (regression ceiling: ${(MAX_SINGLE_COMPONENT_BYTES / 1024).toFixed(0)}kB)\n`,
  );

  if (themeProviderOutput.length > MAX_SINGLE_COMPONENT_BYTES) {
    console.error(
      `  ✗ bundle size ${themeProviderSizeKB}kB exceeds the ${MAX_SINGLE_COMPONENT_BYTES / 1024}kB regression ceiling`,
    );
    failures += 1;
  } else {
    console.log(`  ✓ bundle size within regression ceiling`);
  }

  for (const signature of CONTAMINATION_SIGNATURES) {
    if (signature === 'sun-theme') continue; // ThemeProvider's own signature
    if (themeProviderOutput.includes(signature)) {
      console.error(
        `  ✗ found unrelated-component signature "${signature}" in a ThemeProvider-only bundle`,
      );
      failures += 1;
    } else {
      console.log(`  ✓ no "${signature}" contamination`);
    }
  }

  // Icons (Phase: /component Icon session) ship 55 named exports from one
  // shared `icons` subpath, deliberately NOT 55 separate npm subpaths —
  // this only stays a good tradeoff if real ESM tree-shaking actually
  // eliminates the other 54 when a consumer imports just one.
  const iconEntryFile = path.join(workDir, 'icon-entry.mjs');
  writeFileSync(
    iconEntryFile,
    `export { IconHome } from '${path.join(rootDir, 'dist/esm/components/icons/index.js')}';\n`,
  );

  const iconResult = await esbuild.build({
    entryPoints: [iconEntryFile],
    bundle: true,
    format: 'esm',
    write: false,
    external: externals,
    metafile: false,
  });

  const iconOutput = iconResult.outputFiles[0].text;
  const iconSizeKB = (iconOutput.length / 1024).toFixed(2);
  const MAX_SINGLE_ICON_BYTES = 4 * 1024; // one icon's own path data is ~1-4kB

  console.log(`\nIconHome-only bundle: ${iconSizeKB}kB (regression ceiling: 4kB)\n`);

  if (iconOutput.length > MAX_SINGLE_ICON_BYTES) {
    console.error(`  ✗ bundle size ${iconSizeKB}kB exceeds the 4kB regression ceiling`);
    failures += 1;
  } else {
    console.log(`  ✓ bundle size within regression ceiling`);
  }

  for (const otherIcon of ['IconStar', 'IconBell', 'IconGear', 'IconVideoCamera']) {
    if (iconOutput.includes(otherIcon)) {
      console.error(`  ✗ found unrelated icon "${otherIcon}" in an IconHome-only bundle`);
      failures += 1;
    } else {
      console.log(`  ✓ no "${otherIcon}" contamination`);
    }
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(`\n== ${failures} failing ==`);
if (failures > 0) process.exit(1);
