#!/usr/bin/env node
/**
 * scripts/sync-tokens.mjs
 *
 * The single entrypoint for the full token pipeline:
 *
 *   Figma (live)  --fetch-figma-tokens.mjs-->  scripts/figma-variables.json
 *                 --reconcile-tokens.mjs----->  scripts/design-tokens.tokens.json
 *                 --build-tokens.mjs---------->  scripts/global.css
 *
 * Previously these were three separate, manually-sequenced steps — pull,
 * hand-edit design-tokens.tokens.json to match whatever the pull found,
 * then rebuild. This script runs all three in one command so
 * design-tokens.tokens.json (and therefore global.css) can never silently
 * drift from Figma again: every run re-derives the Figma-sourced categories
 * from scratch rather than trusting a stale hand-maintained file.
 *
 * What this does NOT do (by design):
 *   - It does not delete the legacy letter-keyed Spacing/Radius scale or the
 *     legacy device x language Typography scale — both were retired on
 *     Figma's side but are kept as a static bridge since components/external
 *     consumers may still reference them. Removing them is a separate,
 *     explicit, future step, not an automatic side effect of syncing.
 *   - It does not touch any component (.tsx/.styles.ts) file. If a Figma
 *     change requires a new component-level rename (like this session's
 *     `icon-tertiary` retirement or the Spacing/Radius numeric migration),
 *     that is a separate, explicitly-approved pass — see the plan doc's
 *     Implementation Log for the precedent.
 *
 * Usage: pnpm run tokens:sync
 *
 * Requires FIGMA_ACCESS_TOKEN + FIGMA_FILE_KEY (see .env.example) — this makes a
 * live network call to Figma every run, unlike `build:tokens` alone.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { reconcileDesignTokens, summarizeChanges } from './reconcile-tokens.mjs';

function step(label, fn) {
  console.log(`\n=== ${label} ===`);
  return fn();
}

function run(cmd, args) {
  execFileSync(cmd, args, { stdio: 'inherit' });
}

async function main() {
  step('1/3 — Pull live data from Figma (fetch-figma-tokens.mjs)', () => {
    run('node', ['scripts/fetch-figma-tokens.mjs']);
  });

  step('2/3 — Reconcile scripts/design-tokens.tokens.json against Figma', () => {
    const designTokensPath = 'scripts/design-tokens.tokens.json';
    const before = JSON.parse(readFileSync(designTokensPath, 'utf-8'));
    const figmaData = JSON.parse(readFileSync('scripts/figma-variables.json', 'utf-8'));
    const after = reconcileDesignTokens(before, figmaData);
    const { added, removed, changed } = summarizeChanges(before, after);

    writeFileSync(designTokensPath, JSON.stringify(after, null, 2) + '\n');

    if (!added.length && !removed.length && !changed.length) {
      console.log(
        'reconcile-tokens: no changes — design-tokens.tokens.json already matched Figma.',
      );
    } else {
      console.log(
        `reconcile-tokens: ${added.length} added, ${removed.length} removed, ${changed.length} changed`,
      );
      for (const path of added) console.log(`  + ${path}`);
      for (const path of removed) console.log(`  - ${path}`);
      for (const { path, before: b, after: a } of changed) {
        console.log(`  ~ ${path}: ${JSON.stringify(b)} -> ${JSON.stringify(a)}`);
      }
    }
  });

  step('3/3 — Rebuild scripts/global.css (build-tokens.mjs)', () => {
    run('node', ['scripts/build-tokens.mjs']);
  });

  console.log('\ntokens:sync: done. Review the diff on scripts/global.css before committing.');
}

main().catch((err) => {
  console.error('tokens:sync: failed —', err.message);
  process.exit(1);
});
