#!/usr/bin/env node
/**
 * Light/dark theme check for ONE Figma component against the shipped tokens.
 * Read-only: GETs from the Figma REST API, reads scripts/global.css, writes
 * nothing. Part of the sun-design-system skill's mandatory dark-mode step
 * (.claude/skills/sun-design-system/references/theme-verification.md).
 *
 *   node scripts/figma/component-theme-check.mjs <fileKey> <nodeId> [--json]
 *   pnpm figma:theme-check <fileKey> <nodeId>
 *
 * <nodeId> may be a component set, a component, or a documentation frame —
 * every COMPONENT_SET / COMPONENT inside it is checked. Needs
 * FIGMA_ACCESS_TOKEN (env or .env). Not a CI gate (needs a Figma token);
 * run it locally whenever a component is created, modified or synced.
 *
 * Checks, for every color variable bound anywhere in the component's variants:
 *   1. Token parity: Figma's Light / Dark value === the value scripts/global.css
 *      resolves for `--color-sds-<name>` in the light block
 *      (`:root, [data-theme="light"]`) and the dark block
 *      (`[data-theme="dark"]`). A variable aliasing another library file
 *      cannot be resolved here and is reported UNVERIFIED — never guessed.
 *   2. Contrast: every visible TEXT layer against its nearest ancestor fill,
 *      per variant, in BOTH modes (WCAG 2.x; 4.5:1 normal text, 3:1 for
 *      >= 24px or >= 18.66px bold). Variants whose name contains
 *      "Disabled" are reported but exempt (WCAG 1.4.3). Translucent fills are
 *      composited over the nearest opaque ancestor (or surface-base).
 *
 * Exit code: 0 = every resolvable token matches and every non-disabled text
 * meets contrast; 1 = mismatch or contrast failure; 2 = usage / fetch error.
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const asJson = process.argv.includes('--json');
const [fileKey, rawNode] = args;
if (!fileKey || !rawNode) {
  console.error('usage: component-theme-check.mjs <fileKey> <nodeId> [--json]');
  process.exit(2);
}
const nodeId = rawNode.replace('-', ':');

function loadToken() {
  if (process.env.FIGMA_ACCESS_TOKEN) return process.env.FIGMA_ACCESS_TOKEN;
  const envFile = path.join(repoRoot, '.env');
  if (existsSync(envFile)) {
    const m = readFileSync(envFile, 'utf8').match(/^FIGMA_ACCESS_TOKEN=(.+)$/m);
    if (m) return m[1].trim();
  }
  console.error('FIGMA_ACCESS_TOKEN is not set (env or .env)');
  process.exit(2);
}
const token = loadToken();

async function figma(p) {
  const res = await fetch(`https://api.figma.com/v1/${p}`, { headers: { 'X-Figma-Token': token } });
  const body = await res.json();
  if (!res.ok || body.err || body.error) {
    console.error(`Figma API ${p}: ${res.status} ${body.err ?? body.message ?? ''}`);
    process.exit(2);
  }
  return body;
}

// ---------- colors ----------
const toRgba = (c, opacity = 1) => ({
  r: c.r * 255,
  g: c.g * 255,
  b: c.b * 255,
  a: (c.a ?? 1) * opacity,
});
const fmt = ({ r, g, b, a }) =>
  a >= 0.999
    ? `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
    : `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}${Math.round(
        a * 255,
      )
        .toString(16)
        .padStart(2, '0')}`;
function parseHex(h) {
  const s = h.replace('#', '');
  const n =
    s.length === 3 || s.length === 4
      ? s
          .split('')
          .map((c) => c + c)
          .join('')
      : s;
  return {
    r: parseInt(n.slice(0, 2), 16),
    g: parseInt(n.slice(2, 4), 16),
    b: parseInt(n.slice(4, 6), 16),
    a: n.length === 8 ? parseInt(n.slice(6, 8), 16) / 255 : 1,
  };
}
const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});
const lum = ({ r, g, b }) => {
  const f = (v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const sameColor = (a, b) =>
  Math.abs(a.r - b.r) < 1.5 &&
  Math.abs(a.g - b.g) < 1.5 &&
  Math.abs(a.b - b.b) < 1.5 &&
  Math.abs(a.a - b.a) < 0.02;

// ---------- code side: scripts/global.css ----------
const css = readFileSync(path.join(repoRoot, 'scripts/global.css'), 'utf8');
function block(startMarker) {
  const i = css.indexOf(startMarker);
  if (i < 0) return '';
  const open = css.indexOf('{', i);
  let depth = 0;
  for (let j = open; j < css.length; j++) {
    if (css[j] === '{') depth++;
    else if (css[j] === '}' && --depth === 0) return css.slice(open + 1, j);
  }
  return '';
}
const decls = (text) =>
  Object.fromEntries(
    [...text.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
const primitives = { ...decls(block('@theme inline')), ...decls(block('@theme static')) };
const lightRefs = decls(block(':root,\n[data-theme="light"]'));
const darkRefs = decls(block('\n[data-theme="dark"] {'));
function resolveCss(name, refs, seen = new Set()) {
  if (seen.has(name)) return null;
  seen.add(name);
  const v = refs[name] ?? primitives[name];
  if (!v) return null;
  const m = v.match(/^var\((--[\w-]+)\)$/);
  if (m) return resolveCss(m[1], refs, seen);
  return v.startsWith('#') ? parseHex(v) : null;
}
const codeColor = (cssVar, mode) => {
  const refs = mode === 'Dark' ? { ...lightRefs, ...darkRefs } : lightRefs;
  return resolveCss(`${cssVar}--ref`, refs) ?? resolveCss(cssVar, refs);
};
const cssVarFor = (figmaName) =>
  `--color-sds-${figmaName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')}`;

// ---------- Figma side ----------
const [nodes, vars] = await Promise.all([
  figma(`files/${fileKey}/nodes?ids=${encodeURIComponent(nodeId)}`),
  figma(`files/${fileKey}/variables/local`),
]);
const root = nodes.nodes?.[nodeId]?.document;
if (!root) {
  console.error(`node ${nodeId} not found in ${fileKey}`);
  process.exit(2);
}
const V = vars.meta.variables;
const COLL = vars.meta.variableCollections;
function figmaColor(variableId, mode) {
  let v = V[variableId];
  for (let hops = 0; v && hops < 10; hops++) {
    const coll = COLL[v.variableCollectionId];
    const modeId = (coll.modes.find((m) => m.name === mode) ?? coll.modes[0]).modeId;
    const val = v.valuesByMode[modeId];
    if (val && val.type === 'VARIABLE_ALIAS') {
      v = V[val.id];
      if (!v) return { remote: true };
      continue;
    }
    return val && 'r' in val ? toRgba(val) : null;
  }
  return { remote: true };
}

const walk = function* (n, ancestors = []) {
  yield [n, ancestors];
  for (const c of n.children ?? []) yield* walk(c, [...ancestors, n]);
};
const visible = (n, ancestors) =>
  n.visible !== false && ancestors.every((a) => a.visible !== false);
const fillVar = (n) => n.boundVariables?.fills?.[0]?.id;
const solidFill = (n) => (n.fills ?? []).find((f) => f.type === 'SOLID' && f.visible !== false);

const variants = [];
for (const [n] of walk(root)) {
  if (n.type === 'COMPONENT_SET')
    variants.push(...n.children.map((c) => ({ set: n.name, node: c })));
  else if (n.type === 'COMPONENT' && !variants.some((v) => v.node.id === n.id))
    variants.push({ set: n.name, node: n });
}
if (!variants.length) {
  console.error('no COMPONENT_SET / COMPONENT found under that node');
  process.exit(2);
}

// 1. token parity
const used = new Map();
for (const { node } of variants)
  for (const [n] of walk(node))
    for (const key of ['fills', 'strokes'])
      for (const b of n.boundVariables?.[key] ?? []) if (V[b.id]) used.set(b.id, V[b.id].name);
const parity = [];
for (const [id, name] of [...used].sort((a, b) => a[1].localeCompare(b[1]))) {
  const cssVar = cssVarFor(name);
  const row = { figma: name, cssVar, modes: {} };
  for (const mode of ['Light', 'Dark']) {
    const f = figmaColor(id, mode);
    const c = codeColor(cssVar, mode);
    row.modes[mode] = f?.remote
      ? { status: 'UNVERIFIED', reason: 'aliases a variable in another library file' }
      : !f
        ? { status: 'UNVERIFIED', reason: 'not a color value' }
        : !c
          ? {
              status: 'MISSING',
              figma: fmt(f),
              reason: `${cssVar} not found in scripts/global.css`,
            }
          : { status: sameColor(f, c) ? 'OK' : 'MISMATCH', figma: fmt(f), code: fmt(c) };
  }
  parity.push(row);
}

// 2. contrast per variant per mode
const baseFor = (mode) =>
  codeColor('--color-sds-surface-base', mode) ?? { r: 255, g: 255, b: 255, a: 1 };
const contrastRows = [];
for (const { set, node } of variants) {
  for (const [n, ancestors] of walk(node)) {
    if (n.type !== 'TEXT' || !visible(n, ancestors) || !fillVar(n)) continue;
    const bgNode = [...ancestors].reverse().find((a) => fillVar(a) || solidFill(a));
    const size = n.style?.fontSize ?? 14;
    const bold = (n.style?.fontWeight ?? 400) >= 700;
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    const disabled = /disabled/i.test(node.name);
    for (const mode of ['Light', 'Dark']) {
      const fg = figmaColor(fillVar(n), mode);
      if (!fg || fg.remote) continue;
      let bg = baseFor(mode);
      if (bgNode) {
        const bgc = fillVar(bgNode)
          ? figmaColor(fillVar(bgNode), mode)
          : toRgba(solidFill(bgNode).color, solidFill(bgNode).opacity ?? 1);
        if (bgc && !bgc.remote) bg = bgc.a < 0.999 ? over(bgc, baseFor(mode)) : bgc;
      }
      const ratio = contrast(fg.a < 0.999 ? over(fg, bg) : fg, bg);
      contrastRows.push({
        component: set,
        variant: node.name,
        layer: n.name,
        mode,
        fg: V[fillVar(n)].name,
        bg: bgNode
          ? fillVar(bgNode)
            ? V[fillVar(bgNode)]?.name
            : 'raw fill'
          : 'surface-base (page)',
        ratio: Math.round(ratio * 100) / 100,
        need,
        disabled,
        status: ratio >= need ? 'OK' : disabled ? 'EXEMPT' : 'FAIL',
      });
    }
  }
}

const mismatches = parity.flatMap((r) =>
  Object.entries(r.modes)
    .filter(([, m]) => m.status === 'MISMATCH' || m.status === 'MISSING')
    .map(([mode, m]) => ({ ...m, figma: r.figma, cssVar: r.cssVar, mode })),
);
const unverified = parity.filter((r) =>
  Object.values(r.modes).some((m) => m.status === 'UNVERIFIED'),
);
const failures = contrastRows.filter((r) => r.status === 'FAIL');
const failed = mismatches.length > 0 || failures.length > 0;

if (asJson) {
  console.log(
    JSON.stringify(
      { fileKey, nodeId, variants: variants.length, parity, contrast: contrastRows, failed },
      null,
      2,
    ),
  );
} else {
  console.log(
    `Figma ${fileKey} node ${nodeId}: ${variants.length} variant(s) in ${[...new Set(variants.map((v) => v.set))].join(', ')}`,
  );
  console.log(
    `\n1. Token parity (Figma Light/Dark vs scripts/global.css) — ${used.size} color variables`,
  );
  for (const r of parity) {
    const cells = ['Light', 'Dark'].map((m) => {
      const x = r.modes[m];
      return x.status === 'OK'
        ? `${m} ok ${x.code}`
        : x.status === 'MISMATCH'
          ? `${m} MISMATCH figma ${x.figma} code ${x.code}`
          : `${m} ${x.status} (${x.reason})`;
    });
    console.log(
      `  ${Object.values(r.modes).every((m) => m.status === 'OK') ? '✓' : '✗'} ${r.figma.padEnd(28)} ${cells.join(' | ')}`,
    );
  }
  const byKey = new Map();
  for (const r of contrastRows) {
    const k = `${r.fg} on ${r.bg} [${r.mode}]`;
    if (!byKey.has(k) || byKey.get(k).ratio > r.ratio) byKey.set(k, r);
  }
  console.log(`\n2. Text contrast — ${contrastRows.length} text/mode pairs, worst per fg/bg/mode:`);
  for (const r of [...byKey.values()].sort((a, b) => a.ratio - b.ratio))
    console.log(
      `  ${r.status === 'OK' ? '✓' : r.status === 'EXEMPT' ? '–' : '✗'} ${r.ratio.toFixed(2).padStart(5)}:1 (need ${r.need}) ${r.fg} on ${r.bg} [${r.mode}]${r.status === 'EXEMPT' ? ' disabled — exempt' : ''}${r.status === 'FAIL' ? `  e.g. ${r.variant} / ${r.layer}` : ''}`,
    );
  console.log(
    `\nResult: ${mismatches.length} token mismatch(es), ${unverified.length} unverified (remote alias), ${failures.length} contrast failure(s) → ${failed ? 'FAIL' : 'PASS'}`,
  );
}
process.exit(failed ? 1 : 0);
