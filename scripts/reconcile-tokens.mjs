#!/usr/bin/env node
/**
 * scripts/reconcile-tokens.mjs
 *
 * Applies a freshly-pulled scripts/figma-variables.json (see
 * scripts/fetch-figma-tokens.mjs) onto scripts/design-tokens.tokens.json,
 * automating what was previously a manual, by-hand reconciliation.
 *
 * Reconciliation rules, per category:
 *
 *  - `colors - primitive`, `colors - semantic`, `effect.elevation`,
 *    `tokens.spacing`, `tokens.radius`, `font.{heading,title,label,body}` —
 *    ALL WHOLESALE REPLACED with Figma's data (or, for `font.*`, regenerated
 *    from the `typography - roles` node-tree table — Style tokens don't
 *    exist for this anymore, see fetch-figma-tokens.mjs's header). Every one
 *    of these is meant to have a live Figma source and nothing else; a full
 *    replace can't drift from Figma by construction, and correctly drops
 *    any token Figma has retired (e.g. the 2026.7.27 `icon-tertiary`/
 *    `text-tertiary` deprecation) without a separate manual step.
 *
 *  - The legacy letter-keyed Spacing/Radius scale (`xxs`..`5xl` /
 *    `none`..`xl`, retired on Figma's side per the dated 2026.04.10
 *    changelog) and the legacy device×language Typography scale
 *    (`font.desktop.*`/`font.mobile.*`) were REMOVED from
 *    design-tokens.tokens.json on 2026-08-31, once every component
 *    reference to them was migrated to the current scheme (see the plan
 *    doc's Implementation Log) — this script does not resurrect them: it
 *    only ever writes what today's Figma data says, so there is nothing
 *    left that could reintroduce a legacy key by accident.
 *
 *  - Everything else (`color.*` Figma-internal QA/redline styles,
 *    `typography.*`) is untouched — out of scope, as it always has been
 *    for build-tokens.mjs itself.
 *
 * This script only ever reads scripts/figma-variables.json (already on
 * disk from a `pnpm run figma:pull`) and scripts/design-tokens.tokens.json,
 * and only ever writes scripts/design-tokens.tokens.json. It does not call
 * the Figma API and does not run the CSS build — see scripts/sync-tokens.mjs
 * for the single command that runs the full pull -> reconcile -> build
 * pipeline in one go.
 */

import { readFileSync, writeFileSync } from 'node:fs';

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function px(sizeStr) {
  return parseFloat(sizeStr);
}
function weightNum(weightStr) {
  return weightStr.trim().toLowerCase() === 'bold' ? 700 : 400;
}
function lineHeightPx(fontSize, lineHeightPctStr) {
  const pct = parseFloat(lineHeightPctStr) / 100;
  return Math.round(fontSize * pct * 100) / 100;
}
function fontLeaf(sizeStr, weightStr, lineHeightPctStr) {
  const fontSize = px(sizeStr);
  return {
    type: 'custom-fontStyle',
    value: {
      fontSize,
      fontWeight: weightNum(weightStr),
      lineHeight: lineHeightPx(fontSize, lineHeightPctStr),
    },
  };
}

/** Rebuilds font.heading/title/label/body from Figma's "typography - roles"
 * node-tree table. Returns null if the table is missing/empty (e.g. the
 * Typography frame was renamed) so the caller can leave the existing
 * subtree untouched rather than wiping it out on a partial pull. */
function rolesToFontTree(roles) {
  if (!roles || Object.keys(roles).length === 0) return null;

  const tree = { heading: { desktop: {}, mobile: {} }, title: {}, label: {}, body: {} };

  for (const item of roles['Heading｜For Desktop'] ?? []) {
    tree.heading.desktop[item.token.trim().toLowerCase()] = fontLeaf(
      item.size,
      item.weight,
      item.lineHeight,
    );
  }
  for (const item of roles['Heading｜For Mobile'] ?? []) {
    tree.heading.mobile[item.token.trim().toLowerCase()] = fontLeaf(
      item.size,
      item.weight,
      item.lineHeight,
    );
  }
  for (const item of roles['Title'] ?? []) {
    tree.title[item.token.trim().toLowerCase()] = fontLeaf(item.size, item.weight, item.lineHeight);
  }
  for (const item of roles['Label'] ?? []) {
    const key = item.token.trim().toLowerCase();
    const weightKey = item.weight.trim().toLowerCase(); // "bold" | "regular"
    tree.label[key] ??= {};
    tree.label[key][weightKey] = fontLeaf(item.size, item.weight, item.lineHeight);
  }
  for (const item of roles['Body'] ?? []) {
    tree.body[item.token.trim().toLowerCase()] = fontLeaf(item.size, item.weight, item.lineHeight);
  }
  return tree;
}

/** Produces the reconciled design-tokens.tokens.json object. Pure function —
 * does not read or write any files itself, so it's independently testable. */
export function reconcileDesignTokens(designTokens, figmaData) {
  const out = deepClone(designTokens);

  if (figmaData['colors - primitive']) {
    out['colors - primitive'] = deepClone(figmaData['colors - primitive']);
  }
  if (figmaData['colors - semantic']) {
    out['colors - semantic'] = deepClone(figmaData['colors - semantic']);
  }
  if (figmaData.effect?.elevation) {
    out.effect ??= {};
    out.effect.elevation = deepClone(figmaData.effect.elevation);
  }

  if (figmaData.tokens?.spacing) {
    out.tokens ??= {};
    out.tokens.spacing = deepClone(figmaData.tokens.spacing);
  }
  if (figmaData.tokens?.radius) {
    out.tokens ??= {};
    out.tokens.radius = deepClone(figmaData.tokens.radius);
  }

  const freshFontTree = rolesToFontTree(figmaData['typography - roles']);
  if (freshFontTree) {
    out.font ??= {};
    out.font.heading = freshFontTree.heading;
    out.font.title = freshFontTree.title;
    out.font.label = freshFontTree.label;
    out.font.body = freshFontTree.body;
  }

  return out;
}

/** Structural summary of what changed between two design-tokens.tokens.json
 * objects, at leaf-path granularity — used for the human-readable log, not
 * for deciding whether to write (the caller always writes; this is purely
 * informational so a `tokens:sync` run stays auditable like every other
 * change this pipeline has made by hand so far). */
export function summarizeChanges(before, after) {
  const added = [];
  const removed = [];
  const changed = [];

  const leafWalk = function* (node, path) {
    if (node && typeof node === 'object' && 'type' in node && 'value' in node) {
      yield [path.join('.'), node];
      return;
    }
    if (node && typeof node === 'object') {
      for (const [k, v] of Object.entries(node)) yield* leafWalk(v, [...path, k]);
    }
  };

  const toMap = (tree) => new Map(leafWalk(tree, []));
  const beforeMap = toMap(before);
  const afterMap = toMap(after);

  for (const [path, node] of afterMap) {
    if (!beforeMap.has(path)) added.push(path);
    else if (JSON.stringify(beforeMap.get(path).value) !== JSON.stringify(node.value)) {
      changed.push({ path, before: beforeMap.get(path).value, after: node.value });
    }
  }
  for (const path of beforeMap.keys()) {
    if (!afterMap.has(path)) removed.push(path);
  }

  return { added, removed, changed };
}

async function main() {
  const designTokensPath = 'scripts/design-tokens.tokens.json';
  const figmaDataPath = 'scripts/figma-variables.json';

  let figmaData;
  try {
    figmaData = JSON.parse(readFileSync(figmaDataPath, 'utf-8'));
  } catch {
    console.error(
      `reconcile-tokens: could not read ${figmaDataPath} — run \`pnpm run figma:pull\` first ` +
        '(or use `pnpm run tokens:sync` to do the whole pull -> reconcile -> build pipeline in one command).',
    );
    process.exit(1);
  }

  const before = JSON.parse(readFileSync(designTokensPath, 'utf-8'));
  const after = reconcileDesignTokens(before, figmaData);
  const { added, removed, changed } = summarizeChanges(before, after);

  writeFileSync(designTokensPath, JSON.stringify(after, null, 2) + '\n');

  console.log(`reconcile-tokens: wrote ${designTokensPath}`);
  console.log(
    `  ${added.length} token(s) added, ${removed.length} removed, ${changed.length} changed`,
  );
  for (const path of added) console.log(`  + ${path}`);
  for (const path of removed) console.log(`  - ${path}`);
  for (const { path, before: b, after: a } of changed) {
    console.log(`  ~ ${path}: ${JSON.stringify(b)} -> ${JSON.stringify(a)}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
