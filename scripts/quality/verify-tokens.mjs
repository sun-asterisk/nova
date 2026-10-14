#!/usr/bin/env node
/**
 * Read-only token-drift check against scripts/global.css (the generated
 * output of `pnpm build:tokens`). Does NOT call Figma, does NOT mutate
 * anything, does NOT regenerate tokens — see .claude/rules/design-foundation.md
 * §6 "never guess" and CLAUDE.md's Phase 1.5 discovery-only precedent for
 * why this stays strictly read-only.
 *
 * Checks:
 *   1. Every semantic `--color-sds-*--ref` (theme layer) overridden in a
 *      dark block also has a light value in `:root, [data-theme="light"]`,
 *      and appears in BOTH the prefers-color-scheme bridge and the explicit
 *      [data-theme="dark"] block — and vice versa. An orphan in only one of
 *      the three is exactly the class of drift that's easy to introduce by
 *      hand-editing one block and forgetting the other two.
 *   1b. Every public semantic `--color-sds-*` in `@theme static` (the
 *      re-brand surface) has a light `--ref` value AND is re-bound in the
 *      `:where([data-theme])` block — a missing re-bind silently freezes that
 *      token to the root theme inside nested/scoped regions (SC-03).
 *   2. No duplicate custom-property declaration within the same block
 *      (a copy-paste mistake, not intentional CSS cascade — this file is
 *      machine-generated, so a duplicate key means the generator emitted
 *      it twice, not a deliberate override).
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const cssPath = path.join(rootDir, 'scripts/global.css');
const css = readFileSync(cssPath, 'utf8');

console.log('== Token drift verification (read-only) ==\n');

function extractBlock(source, startMarker) {
  const startIdx = source.indexOf(startMarker);
  if (startIdx === -1) return null;
  const braceStart = source.indexOf('{', startIdx);
  let depth = 0;
  let i = braceStart;
  for (; i < source.length; i++) {
    if (source[i] === '{') depth += 1;
    if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  return source.slice(braceStart + 1, i);
}

function extractVars(block) {
  const vars = new Map();
  if (!block) return vars;
  const re = /(--color-sds-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
  let match;
  while ((match = re.exec(block))) {
    const name = match[1];
    vars.set(name, (vars.get(name) ?? 0) + 1);
  }
  return vars;
}

// Light (default) theme-layer `--ref` values live in a plain
// `:root, [data-theme="light"]` block; the public semantic names live in
// `@theme static` (Tailwind v4 CSS-first theme syntax) and are re-bound on
// every theme boundary in `:where([data-theme])`. See buildThemeBlocks() in
// scripts/build-tokens.mjs.
const rootBlock = extractBlock(css, ':root,\n[data-theme="light"]');
const publicBlock = extractBlock(css, '@theme static {');
const rebindBlock = extractBlock(css, ':where([data-theme])');
const mediaBlock = extractBlock(css, '@media (prefers-color-scheme: dark)');
const dataThemeBlock = extractBlock(css, '\n[data-theme="dark"] {');

const lightVars = extractVars(rootBlock);
const publicVars = extractVars(publicBlock);
const rebindVars = extractVars(rebindBlock);
const mediaVars = extractVars(mediaBlock);
const dataThemeVars = extractVars(dataThemeBlock);

let failures = 0;

console.log(`Light (:root, [data-theme="light"]): ${lightVars.size} --color-sds-*--ref vars`);
console.log(`Public (@theme static): ${publicVars.size} vars`);
console.log(`Re-bound (:where([data-theme])): ${rebindVars.size} vars`);
console.log(`Dark (prefers-color-scheme bridge): ${mediaVars.size} vars`);
console.log(`Dark (data-theme="dark"): ${dataThemeVars.size} vars\n`);

if (lightVars.size === 0) {
  console.error(
    '  ✗ found 0 light-mode --color-sds-* variables — the :root block selector/regex likely broke; treat this as a check failure, not "nothing to compare"',
  );
  failures += 1;
}

// Primitive scales (--color-sds-neutral-900, --color-sds-yellow-400, etc.)
// are intentionally theme-invariant per design-foundation.md §1 ("primitives
// never change by theme") and the generator's own comment above the dark
// blocks in global.css — they never appear in either dark block. Only
// semantic tokens (background-*, border-*, icon-*, surface-*, text-*) are
// meant to switch. Derive the semantic set as "any name that appears in at
// least one dark block" rather than guessing a naming convention, so this
// check can't drift from whatever the generator actually considers
// semantic.
const semanticNames = new Set([...mediaVars.keys(), ...dataThemeVars.keys()]);

if (publicVars.size === 0) {
  console.error(
    '  ✗ found 0 public semantic vars in `@theme static` — block selector/regex likely broke',
  );
  failures += 1;
}
for (const name of publicVars.keys()) {
  if (!lightVars.has(`${name}--ref`)) {
    console.error(`  ✗ public ${name} has no light ${name}--ref value`);
    failures += 1;
  }
  if (!rebindVars.has(name)) {
    console.error(
      `  ✗ public ${name} is not re-bound in :where([data-theme]) — it would stay frozen to the root theme inside nested/scoped regions`,
    );
    failures += 1;
  }
}
for (const name of rebindVars.keys()) {
  if (!publicVars.has(name)) {
    console.error(
      `  ✗ ${name} is re-bound in :where([data-theme]) but not declared in @theme static`,
    );
    failures += 1;
  }
}

for (const name of semanticNames) {
  if (!lightVars.has(name)) {
    console.error(
      `  ✗ ${name} has a dark override but no light (:root, [data-theme="light"]) value at all`,
    );
    failures += 1;
    continue;
  }
  if (!mediaVars.has(name)) {
    console.error(
      `  ✗ ${name} is semantic (has a value in at least one dark block) but missing from the prefers-color-scheme bridge`,
    );
    failures += 1;
  }
  if (!dataThemeVars.has(name)) {
    console.error(`  ✗ ${name} is semantic but missing from the [data-theme="dark"] block`);
    failures += 1;
  }
}

for (const [blockName, vars] of [
  ['light', lightVars],
  ['public (@theme static)', publicVars],
  ['re-bind (:where([data-theme]))', rebindVars],
  ['dark (media)', mediaVars],
  ['dark (data-theme)', dataThemeVars],
]) {
  for (const [name, count] of vars) {
    if (count > 1) {
      console.error(
        `  ✗ ${name} is declared ${count} times in the ${blockName} block (should be exactly once — generator likely emitted a duplicate)`,
      );
      failures += 1;
    }
  }
}

if (failures === 0) {
  console.log(
    '  ✓ every semantic color token has a matching light + both dark overrides, with no duplicates',
  );
}

console.log(`\n== ${failures} failing ==`);
if (failures > 0) process.exit(1);
