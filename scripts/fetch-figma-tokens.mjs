#!/usr/bin/env node
/**
 * scripts/fetch-figma-tokens.mjs
 *
 * Pulls EVERY design token this repo cares about directly from the Figma
 * REST API and writes scripts/figma-variables.json in the SAME nested tree
 * shape as scripts/design-tokens.tokens.json, so the two can be diffed and
 * reasoned about as one data model. Two different Figma APIs are combined,
 * because this file's tokens live in two different places:
 *
 *  1. Figma Variables (`GET /files/:key/variables/local`) — Colors
 *     (Primitive + Semantic, the latter now with Light/Dark modes),
 *     Spacing, Radius, and a small Typography primitive scale
 *     (font family/weight/size). Machine-structured, one call, no
 *     ambiguity.
 *
 *  2. Figma node trees (`GET /files/:key/nodes`) — Typography's per-role
 *     (Heading/Title/Label/Body) × per-device (Desktop/Mobile) size/weight/
 *     line-height table, Elevation's 5 shadow levels, and Interaction's
 *     Focus/Press/state-coexistence guideline tables (added to Figma
 *     2026-08-17 — prose/table guidance, not a numeric token, but captured
 *     structurally so it isn't just tribal knowledge). Confirmed via
 *     `GET /files/:key/styles` returning ZERO styles of any type in this
 *     file: these are no longer Figma Text/Effect Styles, they're drawn as
 *     literal specimen frames — there is no shortcut API for any of them,
 *     they have to be read off the actual node tree, which is what this
 *     script does.
 *
 *  3. Every foundation frame's own "更新履歴" (Update Log) — read in FULL,
 *     not just the latest entry, into `$changelog`. This is how a value
 *     that differs from the stale design-tokens.tokens.json gets explained
 *     (a specific, dated, first-party decision) instead of guessed at.
 *
 * All foundation frames (Typography, Colors, Elevation, Spacing, Radius,
 * Interaction) are resolved BY NAME under the Foundations page at pull time
 * (not hardcoded node IDs), so this stays correct if Figma ever renumbers
 * nodes — only breaks if the frames are renamed, in which case this script
 * says exactly that instead of silently returning nothing.
 *
 * Why a REST script instead of asking an agent to pull it via MCP:
 * MCP's get_variable_defs depends on live Figma Desktop selection state
 * (flaky) and only returns one resolved mode at a time; get_design_context/
 * get_metadata results are capped in size for a file this large. A direct
 * REST call has neither limitation and needs no Figma app open.
 *
 * Multi-mode values (Colors - Semantic's Light + Dark): the old file predates
 * Figma Dark mode, so there's no precedent for encoding a second mode in
 * this shape. This script's convention — flagged here since nothing else in
 * the repo defines it — is a sibling `darkValue` field next to `value`,
 * using the same `{colors - primitive.…}` alias syntax. `value` always stays
 * the Light/default mode, so anything that only reads `value` (everything
 * today) is unaffected.
 *
 * Prerequisites: FIGMA_ACCESS_TOKEN with scopes file_variables:read AND
 * file_content:read (the latter is needed for the Styles-check + Nodes
 * calls), plus FIGMA_FILE_KEY — see .env.example.
 *
 * Usage: pnpm run figma:pull
 *
 * Read-only against Figma. Never touches design-tokens.tokens.json,
 * build-tokens.mjs, or global.css — safe to re-run any time. Wiring its
 * output into the actual token build is a separate, deliberate step.
 */

import { writeFileSync } from 'node:fs';

try {
  process.loadEnvFile('.env');
} catch {
  // No .env file — fall back to whatever is already in the environment.
}

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_FILE_KEY = process.env.FIGMA_FILE_KEY;
const FOUNDATIONS_PAGE_ID = '1:2'; // see figma-sync.config.json: pages.foundations.id

if (!FIGMA_ACCESS_TOKEN) {
  console.error(
    'fetch-figma-tokens: FIGMA_ACCESS_TOKEN is not set.\n' +
      '  Create one at https://www.figma.com/developers/api#access-tokens\n' +
      '  (needs "file_variables:read" + "file_content:read") and add it to your local .env.',
  );
  process.exit(1);
}
if (!FIGMA_FILE_KEY) {
  console.error('fetch-figma-tokens: FIGMA_FILE_KEY is not set in your environment/.env.');
  process.exit(1);
}

const API_BASE = 'https://api.figma.com/v1';

async function figmaGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `Figma API ${path} → HTTP ${res.status} ${res.statusText}${body ? `\n${body}` : ''}`,
    );
  }
  return res.json();
}

function findAll(node, pred, acc = []) {
  if (pred(node)) acc.push(node);
  for (const c of node.children || []) findAll(c, pred, acc);
  return acc;
}
function findDirect(node, name) {
  return (node.children || []).find((c) => c.name === name);
}

// ============================================================================
// Part 1 — Variables API: Colors, Spacing, Radius, Typography primitives
// ============================================================================

/** Figma color channels are floats 0–1. Always emit 8-digit hex (#rrggbbaa), matching the old export's convention of always including the alpha channel. */
function colorToHex({ r, g, b, a }) {
  const toByte = (c) => Math.round(Math.max(0, Math.min(1, c)) * 255);
  const hex = (c) => toByte(c).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}${hex(a)}`;
}

/** "Group/Key With Spaces" -> ["group", "key with spaces"] — old export's JSON keys are lowercase, spaces preserved (dashing happens later, only in build-tokens.mjs's CSS-variable-name generation). */
function splitFigmaName(name) {
  const [group, ...rest] = name.split('/');
  return [group.trim().toLowerCase(), rest.join('/').trim().toLowerCase()];
}

/** Resolves a variable's raw per-mode value, following VARIABLE_ALIAS chains to their concrete value + the name of what was ultimately aliased. */
function resolveValue(rawValue, variablesById, resolvedType, seen = new Set()) {
  if (rawValue && typeof rawValue === 'object' && rawValue.type === 'VARIABLE_ALIAS') {
    if (seen.has(rawValue.id)) return { value: null, ref: undefined, error: 'circular alias' };
    seen.add(rawValue.id);
    const target = variablesById[rawValue.id];
    if (!target) return { value: null, ref: undefined, error: `unresolved alias ${rawValue.id}` };
    const targetModeId = Object.keys(target.valuesByMode)[0];
    const inner = resolveValue(
      target.valuesByMode[targetModeId],
      variablesById,
      resolvedType,
      seen,
    );
    return { value: inner.value, ref: target.name, error: inner.error };
  }
  if (resolvedType === 'COLOR' && rawValue && typeof rawValue === 'object') {
    return { value: colorToHex(rawValue), ref: undefined };
  }
  return { value: rawValue, ref: undefined };
}

/** '{colors - primitive.neutral.100}' — matches the old export's alias syntax exactly. */
function aliasString(figmaRefName) {
  const [group, key] = splitFigmaName(figmaRefName);
  return `{colors - primitive.${group}.${key}}`;
}

function extNode({ variableId, collection, scopes }) {
  return {
    'org.lukasoppermann.figmaDesignTokens': {
      collection,
      scopes: scopes ?? [],
      variableId,
      exportKey: 'variables',
    },
  };
}

async function fetchVariables() {
  const { meta } = await figmaGet(`/files/${FIGMA_FILE_KEY}/variables/local`);
  const { variables, variableCollections } = meta;

  const out = {
    'colors - primitive': {},
    'colors - semantic': {},
    tokens: { spacing: {}, radius: {} },
    'typography - variables': {},
  };
  const unclassified = {};
  let variableCount = 0;

  const localCollections = Object.values(variableCollections).filter((c) => !c.remote);

  for (const collection of localCollections) {
    const hasDarkMode = collection.modes.some((m) => m.name === 'Dark');
    const lightModeId =
      collection.modes.find((m) => m.name === 'Light')?.modeId ?? collection.modes[0].modeId;
    const darkModeId = collection.modes.find((m) => m.name === 'Dark')?.modeId;

    for (const variableId of collection.variableIds) {
      const variable = variables[variableId];
      if (!variable || variable.remote) continue;
      variableCount++;

      const lightResolved = resolveValue(
        variable.valuesByMode[lightModeId],
        variables,
        variable.resolvedType,
      );
      const darkResolved = hasDarkMode
        ? resolveValue(variable.valuesByMode[darkModeId], variables, variable.resolvedType)
        : null;

      const ext = extNode({ variableId, collection: collection.name, scopes: variable.scopes });
      const dtcgType = variable.resolvedType === 'COLOR' ? 'color' : 'dimension';

      if (collection.name === 'Colors - Primitive') {
        const [group, key] = splitFigmaName(variable.name);
        out['colors - primitive'][group] ??= {};
        out['colors - primitive'][group][key] = {
          type: 'color',
          value: lightResolved.value,
          blendMode: 'normal',
          extensions: ext,
        };
      } else if (collection.name === 'Colors - Semantic') {
        const [group, key] = splitFigmaName(variable.name);
        out['colors - semantic'][group] ??= {};
        out['colors - semantic'][group][key] = {
          description: '',
          type: 'color',
          value: lightResolved.ref ? aliasString(lightResolved.ref) : lightResolved.value,
          ...(darkResolved?.ref ? { darkValue: aliasString(darkResolved.ref) } : {}),
          extensions: ext,
        };
      } else if (collection.name === 'Spacing') {
        // The "Spacing" collection also contains stray variables literally
        // named "Radius/…" — duplicates of the dedicated Radius collection
        // (identical values). Route them to Radius; dedup is automatic.
        if (/^radius\//i.test(variable.name)) {
          const key = variable.name.replace(/^radius\//i, '').toLowerCase();
          out.tokens.radius[key] ??= {
            type: dtcgType,
            value: lightResolved.value,
            extensions: ext,
          };
          continue;
        }
        out.tokens.spacing[variable.name] = {
          type: dtcgType,
          value: lightResolved.value,
          extensions: ext,
        };
      } else if (collection.name === 'Radius') {
        // Figma names these "Radius/0", "Radius/100", … inside the Radius
        // collection itself — strip the redundant prefix.
        const key = variable.name.replace(/^radius\//i, '').toLowerCase();
        out.tokens.radius[key] = { type: dtcgType, value: lightResolved.value, extensions: ext };
      } else if (collection.name === 'Typography') {
        const [group, key] = splitFigmaName(variable.name);
        out['typography - variables'][group] ??= {};
        out['typography - variables'][group][key || group] = {
          type: variable.resolvedType === 'FLOAT' ? 'dimension' : 'string',
          value: lightResolved.value,
          extensions: ext,
        };
      } else {
        unclassified[collection.name] ??= {};
        unclassified[collection.name][variable.name] = {
          type: dtcgType,
          value: lightResolved.value,
          extensions: ext,
        };
      }
    }
  }

  return { out, unclassified, variableCount };
}

// ============================================================================
// Part 2 — Node tree: Typography's per-role specimen table (no Figma Styles
// exist for this anymore — see file header). Resolves the "Typography" frame
// by name under the Foundations page, not by a hardcoded node id.
// ============================================================================

const TYPOGRAPHY_ROLE_TITLES = [
  'Heading｜For Desktop',
  'Heading｜For Mobile',
  'Title',
  'Label',
  'Body',
];

function readStyleTagToken(styleTagInstance) {
  const props = styleTagInstance.componentProperties || {};
  for (const v of Object.values(props)) if (v.type === 'TEXT') return v.value;
  return null;
}

async function fetchTypographyRoles(typographyFrameId) {
  const { nodes } = await figmaGet(`/files/${FIGMA_FILE_KEY}/nodes?ids=${typographyFrameId}`);
  const root = nodes[typographyFrameId]?.document;
  if (!root) return {};

  const roles = {};
  const containers = findAll(root, (n) => n.type === 'FRAME' && n.name === 'Container');
  for (const container of containers) {
    const titleNode = findAll(
      container,
      (n) => n.type === 'TEXT' && TYPOGRAPHY_ROLE_TITLES.includes(n.characters),
    )[0];
    if (!titleNode) continue;
    const role = titleNode.characters;

    const styleWrapper = findDirect(container, 'Style Wrapper');
    if (!styleWrapper) continue;

    const rows = [];
    for (const row of (styleWrapper.children || []).filter((c) => c.name === 'Style')) {
      const styleTag = findAll(row, (n) => n.name === 'StyleTag')[0];
      const token = styleTag ? readStyleTagToken(styleTag) : null;
      const propertyFrame = findAll(row, (n) => n.name === 'Property')[0];
      const texts = (propertyFrame?.children || [])
        .filter((c) => c.type === 'TEXT')
        .map((c) => c.characters);
      rows.push({ token, size: texts[0], weight: texts[1], lineHeight: texts[2] });
    }
    roles[role] = rows;
  }
  return roles;
}

// ============================================================================
// Part 3 — Node tree: Elevation's 5 shadow levels, read directly off each
// level's sample "Card" node's `effects` (no Figma Effect Styles exist for
// this anymore either). Resolves the "Elevation" frame by name, and each
// "Lv.N" sub-frame's Card by name — not hardcoded node ids.
// ============================================================================

function effectsToOldShape(effects) {
  return effects
    .filter((e) => e.visible !== false)
    .map((e, i) => ({
      index: i,
      type: 'custom-shadow',
      value: {
        shadowType: e.type === 'INNER_SHADOW' ? 'innerShadow' : 'dropShadow',
        radius: e.radius,
        color: colorToHex(e.color),
        offsetX: e.offset?.x ?? 0,
        offsetY: e.offset?.y ?? 0,
        spread: e.spread ?? 0,
      },
    }));
}

async function fetchElevationLevels(elevationFrameId) {
  const { nodes } = await figmaGet(`/files/${FIGMA_FILE_KEY}/nodes?ids=${elevationFrameId}`);
  const root = nodes[elevationFrameId]?.document;
  if (!root) return {};

  const levels = {};
  const levelFrames = findAll(root, (n) => n.type === 'FRAME' && /^Lv\.\d+$/.test(n.name));
  for (const levelFrame of levelFrames) {
    const card = findDirect(levelFrame, 'Card');
    if (!card?.effects?.length) continue;
    const key = levelFrame.name.toLowerCase(); // "lv.1"
    const layers = effectsToOldShape(card.effects);
    levels[key] = Object.fromEntries(
      layers.map((l) => [l.index, { type: l.type, value: l.value }]),
    );
  }
  return levels;
}

// ============================================================================
// Part 4 — Node tree: Interaction guidelines (Focus display spec, Press/
// Active behavior per component category, State-coexistence priority rules).
// This is prose/table GUIDANCE, not numeric tokens with a CSS variable to
// generate — added to the Foundations page 2026.08.17 (see changelog, Part
// 5). Captured here as structured rows so it's not just tribal knowledge;
// intended to feed design.md, not build-tokens.mjs.
// ============================================================================

async function fetchInteractionGuidelines(interactionFrameId) {
  const { nodes } = await figmaGet(`/files/${FIGMA_FILE_KEY}/nodes?ids=${interactionFrameId}`);
  const root = nodes[interactionFrameId]?.document;
  if (!root) return [];

  const container = findAll(root, (n) => n.name === 'Container')[0];
  if (!container) return [];

  const modules = [];
  for (const wrapper of (container.children || []).filter((c) => c.name === 'Wrapper')) {
    const module = findDirect(wrapper, 'Module');
    const area = findDirect(wrapper, 'Area');
    if (!module || !area) continue;

    const moduleTexts = findAll(module, (n) => n.type === 'TEXT').map((n) => n.characters);
    const header = findDirect(area, 'Header');
    const columns = findAll(header, (n) => n.type === 'TEXT').map((n) => n.characters);
    const rows = (area.children || [])
      .filter((c) => c.name === 'Row')
      .map((row) => {
        const cells = findAll(row, (n) => n.type === 'TEXT').map((n) => n.characters);
        return Object.fromEntries(columns.map((col, i) => [col, cells[i]]));
      });

    modules.push({ title: moduleTexts[0], description: moduleTexts.slice(1), columns, rows });
  }
  return modules;
}

// ============================================================================
// Part 5 — Full changelog history for every foundation frame. Each frame's
// "更新履歴" (Update Log) section is read in full, not just the latest
// entry — this is what actually explains *why* a value differs from the
// stale design-tokens.tokens.json (e.g. a deliberate, dated rename vs. an
// accident). Figma's own placeholder/example row (present on frames with no
// real history yet, prefixed "例）") is filtered out rather than reported as
// a real change.
// ============================================================================

async function fetchChangelog(frameId) {
  const { nodes } = await figmaGet(`/files/${FIGMA_FILE_KEY}/nodes?ids=${frameId}`);
  const root = nodes[frameId]?.document;
  const log = findAll(root, (n) => n.name === 'Update Log')[0];
  if (!log) return [];

  const units = findAll(log, (n) => n.name === 'LogUnit');
  return units
    .map((unit) => {
      const date = (unit.children || []).find((c) => c.type === 'TEXT')?.characters ?? '?';
      const items = findAll(unit, (n) => n.name === 'List')
        .map((list) =>
          findAll(list, (n) => n.type === 'TEXT')
            .map((t) => t.characters)
            .join(' '),
        )
        .filter((item) => !item.startsWith('例）')); // Figma's own placeholder example row
      return { date, items };
    })
    .filter((entry) => entry.items.length > 0);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log(`fetch-figma-tokens: pulling variables for file ${FIGMA_FILE_KEY}…`);
  const { out, unclassified, variableCount } = await fetchVariables();

  console.log('fetch-figma-tokens: resolving Foundations page frames by name…');
  const { document: foundationsPage } = (
    await figmaGet(`/files/${FIGMA_FILE_KEY}/nodes?ids=${FOUNDATIONS_PAGE_ID}&depth=1`)
  ).nodes[FOUNDATIONS_PAGE_ID];
  const typographyFrame = findDirect(foundationsPage, 'Typography');
  const elevationFrame = findDirect(foundationsPage, 'Elevation');
  const interactionFrame = findDirect(foundationsPage, 'Interaction');

  if (typographyFrame) {
    console.log(
      'fetch-figma-tokens: pulling Typography specimen table (node tree, no Styles exist)…',
    );
    out['typography - roles'] = await fetchTypographyRoles(typographyFrame.id);
  } else {
    console.log(
      'fetch-figma-tokens: no frame named "Typography" found on the Foundations page — skipping specimen table.',
    );
  }

  if (elevationFrame) {
    console.log('fetch-figma-tokens: pulling Elevation levels (node tree, no Styles exist)…');
    out.effect = { elevation: await fetchElevationLevels(elevationFrame.id) };
  } else {
    console.log(
      'fetch-figma-tokens: no frame named "Elevation" found on the Foundations page — skipping.',
    );
  }

  if (interactionFrame) {
    console.log('fetch-figma-tokens: pulling Interaction guidelines (node tree, prose/tables)…');
    out['interaction - guidelines'] = await fetchInteractionGuidelines(interactionFrame.id);
  } else {
    console.log(
      'fetch-figma-tokens: no frame named "Interaction" found on the Foundations page — skipping.',
    );
  }

  console.log('fetch-figma-tokens: reading full changelog history for every foundation frame…');
  const changelogFrames = [
    ['Typography', typographyFrame],
    ['Colors - Primitive', findDirect(foundationsPage, 'Color｜Primitive')],
    ['Colors - Semantic', findDirect(foundationsPage, 'Color｜Semantic')],
    ['Elevation', elevationFrame],
    ['Spacing', findDirect(foundationsPage, 'Spacing')],
    ['Radius', findDirect(foundationsPage, 'Radius')],
    ['Interaction', interactionFrame],
  ];
  out.$changelog = {};
  for (const [name, frame] of changelogFrames) {
    if (!frame) continue;
    const history = await fetchChangelog(frame.id);
    if (history.length) out.$changelog[name] = history;
  }

  if (Object.keys(unclassified).length) {
    out['_unclassified'] = unclassified;
    console.log(
      `fetch-figma-tokens: found collection(s) with no mapping rule yet — kept under "_unclassified", not silently dropped: ${Object.keys(unclassified).join(', ')}`,
    );
  }

  out.$meta = {
    generatedAt: new Date().toISOString(),
    fileKey: FIGMA_FILE_KEY,
    sourceApis: [
      'GET /v1/files/:file_key/variables/local',
      "GET /v1/files/:file_key/nodes (Typography, Elevation, Interaction, and every frame's Update Log — all resolved by frame name)",
    ],
    note: "darkValue is this script's own convention (see file header) — no precedent exists in design-tokens.tokens.json, which predates Figma Dark mode. typography - roles, effect, and interaction - guidelines are read from node trees, not Variables — GET /v1/files/:key/styles returns zero styles of any type in this file. $changelog carries every foundation frame's full update history (not just the latest entry) so a stale value can be traced to a specific dated decision instead of guessed at.",
  };

  writeFileSync('scripts/figma-variables.json', JSON.stringify(out, null, 2) + '\n');
  console.log(
    `fetch-figma-tokens: wrote scripts/figma-variables.json (${variableCount} variables + node-tree data)`,
  );
  console.log(
    `  colors - primitive: ${Object.values(out['colors - primitive']).reduce((n, g) => n + Object.keys(g).length, 0)}`,
  );
  console.log(
    `  colors - semantic:  ${Object.values(out['colors - semantic']).reduce((n, g) => n + Object.keys(g).length, 0)}`,
  );
  console.log(`  tokens.spacing:     ${Object.keys(out.tokens.spacing).length}`);
  console.log(`  tokens.radius:      ${Object.keys(out.tokens.radius).length}`);
  console.log(
    `  typography - variables: ${Object.values(out['typography - variables']).reduce((n, g) => n + Object.keys(g).length, 0)}`,
  );
  console.log(
    `  typography - roles: ${Object.keys(out['typography - roles'] ?? {}).length} role groups`,
  );
  console.log(`  effect.elevation:   ${Object.keys(out.effect?.elevation ?? {}).length} levels`);
  console.log(
    `  interaction - guidelines: ${(out['interaction - guidelines'] ?? []).length} modules`,
  );
  console.log(
    `  $changelog: ${Object.values(out.$changelog).reduce((n, entries) => n + entries.length, 0)} dated entries across ${Object.keys(out.$changelog).length} frames`,
  );
}

main().catch((err) => {
  console.error('fetch-figma-tokens: failed —', err.message);
  process.exit(1);
});
