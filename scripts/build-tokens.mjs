import StyleDictionary from 'style-dictionary';
import { readFileSync, writeFileSync } from 'node:fs';

// ============================================================================
// Token traceability manifest (Phase 3A — additive, does not affect
// global.css generation below). Maps every source token to the Figma node
// that produced it (styleId/variableId/collection, from Tokens Studio's own
// export metadata) and, where applicable, the generated CSS variable name.
// This does not change any token name or value — it only records what
// already exists in the source JSON so drift can be diagnosed without
// re-deriving it by hand.
// ============================================================================

/** Mirrors the primitive-color naming in createTailwindCssFormat() below, read-only.
 * Returns the sds- authoritative name — the only name global.css emits. */
function primitiveColorVarName(group, shade) {
  if (group === 'black and white') {
    return sdsify(`--color-${shade.toLowerCase().includes('black') ? 'black' : 'white'}`);
  }
  if (group === 'black alpha') group = 'black-alpha';
  if (group === 'white alpha') group = 'white-alpha';
  const key = shade?.trim().toLowerCase().replace(/\s+/g, '-');
  return sdsify(`--color-${group}-${key}`);
}

function buildTraceabilityManifest(sourcePath, manifestPath) {
  const source = JSON.parse(readFileSync(sourcePath, 'utf-8'));
  const entries = [];

  const walk = (node, path) => {
    if (node == null || typeof node !== 'object') return;
    if (typeof node.type === 'string' && 'value' in node) {
      const figma = node.extensions?.['org.lukasoppermann.figmaDesignTokens'];
      const entry = {
        path: path.join('.'),
        type: node.type,
        figmaStyleId: figma?.styleId ?? null,
        figmaVariableId: figma?.variableId ?? null,
        figmaCollection: figma?.collection ?? null,
        exportKey: figma?.exportKey ?? null,
        cssVariable: null,
        emitted: false,
      };

      // Only classify the categories build-tokens.mjs actually emits today.
      // Everything else is recorded as not emitted, not silently dropped.
      if (path[0] === 'colors - primitive' && path.length === 3) {
        entry.cssVariable = primitiveColorVarName(path[1], path[2]);
        entry.emitted = true;
      } else if (path[0] === 'colors - semantic' && path.length === 3) {
        const group = path[1]?.trim().replace(/\s+/g, '-').toLowerCase();
        const key = path[2]?.trim().replace(/\s+/g, '-').toLowerCase();
        entry.cssVariable = sdsify(`--color-${group}-${key}`);
        entry.emitted = true;
      } else if (path[0] === 'tokens' && (path[1] === 'spacing' || path[1] === 'radius')) {
        entry.cssVariable = sdsify(`--${path[1]}-${path[2]}`);
        entry.emitted = true;
      } else if (path[0] === 'effect' && path[1] === 'elevation') {
        const shadowName = path[2]?.toLowerCase().replace('.', '-').replace(/^lv-/, 'level-');
        entry.cssVariable = sdsify(`--shadow-${shadowName}`);
        entry.emitted = true;
      } else if (path[0] === 'font') {
        entry.cssVariable = `@utility typo-${path.slice(1).join('-')}`;
        entry.emitted = true;
      } else if (path[0] === 'color') {
        entry.excludedReason = 'Figma-internal QA/redline annotation styles, not product tokens';
      } else if (path[0] === 'typography') {
        entry.excludedReason = 'Newer Figma-Variables export, not yet wired to build-tokens.mjs';
      }

      entries.push(entry);
      return;
    }
    for (const [key, child] of Object.entries(node)) {
      walk(child, [...path, key]);
    }
  };

  walk(source, []);

  const manifest = {
    generatedAt: new Date().toISOString(),
    source: 'scripts/design-tokens.tokens.json',
    totalTokens: entries.length,
    emittedCount: entries.filter((e) => e.emitted).length,
    notEmittedCount: entries.filter((e) => !e.emitted).length,
    tokens: entries,
  };

  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(
    `Wrote ${manifestPath} (${manifest.emittedCount}/${manifest.totalTokens} tokens traced to a generated CSS variable)`,
  );
}

// ============================================================================
// CSS variable namespace (Phase 3E). `--sds-*`-prefixed names are
// AUTHORITATIVE — their values are the real source of truth. Every
// pre-existing unprefixed name (`--color-*`, `--spacing-*`, `--radius-*`,
// `--shadow-*`, `--font-*`) becomes a compatibility bridge that resolves via
// var() to its sds- counterpart, so every existing component's Tailwind
// classes keep resolving with zero component-file changes.
//
// The "sds" segment is inserted AFTER the category prefix Tailwind v4
// recognizes (`--color-`, `--spacing-`, `--radius-`, `--shadow-`), not
// before it — `--color-sds-blue-500`, not `--sds-color-blue-500`. Tailwind
// only maps utilities from variables that literally start with its known
// category prefixes, so putting "sds" first would silently stop generating
// `bg-*`/`p-*`/`rounded-*`/`shadow-*` utilities for every namespaced token.
// This is a deliberate, mechanical correction of the naming shorthand used
// in the original token-architecture proposal.
// ============================================================================
const NAMESPACE = 'sds';
const CATEGORY_PREFIXES = [
  'font-size',
  'line-height',
  'font-weight',
  'font-family',
  'color',
  'spacing',
  'radius',
  'shadow',
].sort((a, b) => b.length - a.length);

/** '--color-blue-500' -> '--color-sds-blue-500' */
function sdsify(varName) {
  const body = varName.slice(2); // drop leading '--'
  for (const prefix of CATEGORY_PREFIXES) {
    if (body === prefix || body.startsWith(`${prefix}-`)) {
      const rest = body.slice(prefix.length); // '' or '-blue-500'
      return `--${prefix}-${NAMESPACE}${rest}`;
    }
  }
  throw new Error(`sdsify: unrecognized CSS variable prefix in "${varName}"`);
}

// ============================================================================
// Dark mode (additive, degrades gracefully). Figma's "Colors - Semantic"
// variable collection now has Light + Dark modes (added after the last
// design-tokens.tokens.json export, which predates it and has no dark data
// at all). Rather than wait for a new Tokens Studio export, this reads the
// fresh scripts/figma-variables.json cache (produced by
// `pnpm run figma:pull`)
// and emits a pure-CSS override block for the Dark mode, on top of the
// existing @theme inline output above. Nothing here changes a single Light
// value — this only ADDS a second value that wins under a dark condition.
//
// Only semantic tokens that already exist in the Light/default generation
// are overridden here. A Figma semantic name with no existing counterpart
// is a genuinely new token (not a Light/Dark question) and is intentionally
// left for a separate decision — see the console warnings this prints.
// ============================================================================
/**
 * '{colors - primitive.neutral.100}' -> '--color-sds-neutral-100'. Mirrors
 * the alias-parsing already done for `value` in the COLORS: SEMANTIC branch
 * above — this is the same alias syntax, just also applied to `darkValue`.
 */
function resolveColorAliasToSdsVar(aliasStr) {
  let refKey = aliasStr.slice(1, -1).trim();
  refKey = refKey.replace(/^colors\s*[-–]\s*primitive\./i, '');
  const parts = refKey
    .split('.')
    .map((p) => p.trim())
    .filter(Boolean);
  const primitiveVar =
    parts[0] === 'black and white'
      ? `--color-${parts[1].toLowerCase()}`
      : `--color-${parts.join('-').replace(/\s+/g, '-')}`;
  return sdsify(primitiveVar);
}

/**
 * Emits every runtime theme block (plain CSS, outside @theme):
 *
 *   1. `:root, [data-theme="light"]`  light `--ref` values. Listing
 *      `[data-theme="light"]` (not only :root) is what lets a light region
 *      nested inside a dark page / OS-dark root actually turn light again.
 *   2. `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])`
 *      OS-preference dark, root only — unchanged behavior.
 *   3. `[data-theme="dark"]`  explicit dark, on the root OR any nested/scoped
 *      element (previously `:root[data-theme="dark"]` only — SC-03).
 *   4. `:where([data-theme])`  re-declares every public semantic var as
 *      `var(--…--ref)` on each theme boundary so the public value (and thus
 *      every utility and consumer `var(--color-sds-*)`) is re-resolved from
 *      that element's own theme. `:where()` keeps specificity 0 so any
 *      consumer re-brand selector on the same element wins.
 *
 * Explicit `[data-theme]` always wins over the OS preference: (2) is
 * excluded when the root says light, and (1)/(3) are equal-specificity with
 * (3) later in source order.
 */
function buildThemeBlocks(emittedSdsColorVarNames, lightRefs) {
  const publicNames = [...emittedSdsColorVarNames].sort((a, b) => a.localeCompare(b));
  const lightBlock = `
/* ---- Light theme (default). Internal --ref layer only; see buildThemeBlocks()
   in scripts/build-tokens.mjs. ---- */
:root,
[data-theme="light"] {
${lightRefs.map((l) => `  ${l}`).join('\n')}
}
`;
  const rebindBlock = `
/* ---- Re-resolve the public semantic vars at every theme boundary so nested /
   scoped [data-theme] regions (and anything portaled into them) get their
   own theme, not the root's already-resolved value. Specificity 0. ---- */
:where([data-theme]) {
${publicNames.map((n) => `  ${n}: var(${n}--ref);`).join('\n')}
}
`;
  return lightBlock + buildDarkModeOverrides(emittedSdsColorVarNames) + rebindBlock;
}

function buildDarkModeOverrides(emittedSdsColorVarNames) {
  let cache;
  try {
    cache = JSON.parse(readFileSync('scripts/figma-variables.json', 'utf-8'));
  } catch {
    console.log(
      'build-tokens: scripts/figma-variables.json not found — skipping dark mode ' +
        '(run `pnpm run figma:pull` to generate it; this is optional, not an error).',
    );
    return '';
  }

  const semantic = cache['colors - semantic'];
  if (!semantic) {
    console.log(
      'build-tokens: scripts/figma-variables.json has no "colors - semantic" — skipping dark mode.',
    );
    return '';
  }

  const overrides = [];
  const newInFigma = [];
  for (const [group, keys] of Object.entries(semantic)) {
    for (const [key, def] of Object.entries(keys)) {
      if (!def.darkValue) continue; // this token has no Dark mode in Figma — nothing to override
      const varName = sdsify(`--color-${group}-${key}`.replace(/\s+/g, '-'));
      if (!emittedSdsColorVarNames.has(varName)) {
        newInFigma.push(`${group}.${key}`);
        continue;
      }
      // Override the internal `--ref` (theme) layer, never the public name —
      // the public name is the consumer's re-brand surface and is re-bound
      // to `--ref` on every [data-theme] boundary (buildThemeBlocks()).
      overrides.push(`    ${varName}--ref: var(${resolveColorAliasToSdsVar(def.darkValue)});`);
    }
  }

  if (newInFigma.length) {
    console.log(
      `build-tokens: ${newInFigma.length} semantic color(s) exist in Figma but not yet in ` +
        `global.css (new tokens, not a dark-mode question — needs its own decision): ` +
        newInFigma.join(', '),
    );
  }

  if (!overrides.length) return '';

  overrides.sort((a, b) => a.localeCompare(b));
  const body = overrides.join('\n');
  return `
/* ---- Dark mode (from scripts/figma-variables.json, written by
   \`pnpm run figma:pull\`). Overrides only
   the semantic color sds- variables above; primitives never change by
   theme. An explicit [data-theme] always wins over the OS preference, and
   [data-theme="dark"] applies on nested/scoped elements too. ---- */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${body}
  }
}
[data-theme="dark"] {
${body}
}
`;
}

function createTailwindCssFormat() {
  return function ({ dictionary }) {
    const utilities = [];
    const groupKeys = ['colorsPrimitive', 'colorsSemantic', 'spacing', 'radius', 'shadow', 'font'];
    const groups = Object.fromEntries(groupKeys.map((k) => [k, []])); // sds-authoritative
    // Light-theme `--ref` values — plain CSS, not @theme (see the SEMANTIC branch).
    const lightRefs = [];

    // Shadow tokens have multiple drop-shadow layers per elevation level.
    // Collect layers per name, then emit a single comma-separated declaration.
    const shadowLayers = new Map();

    const addLine = (arr, line) => {
      if (!arr.includes(line)) arr.push(line);
    };

    /** Emits the sds-authoritative declaration. `-sds-` is now the ONLY
     * namespace this design system ships — the legacy unprefixed bridge
     * alias was removed once every component was migrated to `-sds-` class
     * names (
     * §L/§R for the original bridged-migration rationale this superseded). */
    const emit = (groupKey, varName, value) => {
      const sdsName = sdsify(varName);
      addLine(groups[groupKey], `${sdsName}: ${value};`);
      return sdsName;
    };

    // --- Parse tokens ---
    dictionary.allTokens.forEach((token) => {
      const path0 = token.path[0];

      // Intentionally excluded from generation — see scripts/token-manifest.json
      // for the full list. `color.*` is Figma-internal QA/redline annotation
      // styles (not product tokens). `typography.*` is a newer, parallel
      // Figma-Variables export that duplicates font.* values but isn't yet
      // wired up on the Figma/Tokens-Studio side.
      if (path0 === 'color' || path0 === 'typography') return;

      // COLORS: PRIMITIVE
      if (path0 === 'colors - primitive') {
        let group = token.path[1];
        const shade = token.path[2];
        if (group === 'black and white') {
          const colorName = shade.toLowerCase().includes('black') ? 'black' : 'white';
          emit('colorsPrimitive', `--color-${colorName}`, token.value);
          return;
        }
        if (group === 'black alpha') group = 'black-alpha';
        if (group === 'white alpha') group = 'white-alpha';
        const key = shade?.trim().toLowerCase().replace(/\s+/g, '-');
        emit('colorsPrimitive', `--color-${group}-${key}`, token.value);
        return;
      }

      // COLORS: SEMANTIC
      if (path0 === 'colors - semantic') {
        const group = token.path[1]?.trim().replace(/\s+/g, '-').toLowerCase();
        const key = token.path[2]?.trim().replace(/\s+/g, '-').toLowerCase();
        const originalValue = token.original?.value;
        if (typeof originalValue === 'string' && originalValue.startsWith('{')) {
          let refKey = originalValue.slice(1, -1).trim();
          refKey = refKey.replace(/^colors\s*[-–]\s*primitive\./i, '');
          const parts = refKey
            .split('.')
            .map((p) => p.trim())
            .filter(Boolean);
          const primitiveVar =
            parts[0] === 'black and white'
              ? `--color-${parts[1].toLowerCase()}`
              : `--color-${parts.join('-').replace(/\s+/g, '-')}`;
          // Two variables per semantic token, with two different jobs:
          //
          //   --color-sds-x--ref  THEME layer (internal). Holds the
          //                       primitive for the active theme. Declared
          //                       per theme on `:root, [data-theme="light"]`
          //                       and the dark blocks (buildThemeBlocks()).
          //   --color-sds-x       PUBLIC / BRAND layer. `var(--…--ref)` by
          //                       default. This is what every compiled
          //                       utility reads and the one supported
          //                       override surface for re-branding.
          //
          // The public names go in a `@theme static` block (not `inline`):
          // non-inline makes Tailwind compile `.bg-sds-surface-primary` to
          // `var(--color-sds-surface-primary)` — a live reference that an
          // ancestor override can change — instead of copying the value
          // verbatim (`inline` produced `var(--…--ref)`, which made the
          // documented `--color-sds-*` re-brand a no-op, SC-02). `static`
          // makes Tailwind always emit every public var even when no library
          // utility uses it, so consumer CSS reading `var(--color-sds-…)`
          // always resolves.
          //
          // The public value must be re-declared on every `[data-theme]`
          // element too (see buildThemeBlocks()): a custom property whose
          // value is `var(...)` is resolved on the element that declares it
          // and descendants inherit the RESOLVED color, so declaring it only
          // on :root froze every nested/scoped theme region to the root
          // theme (SC-03).
          const sdsPublicName = sdsify(`--color-${group}-${key}`);
          const refName = `${sdsPublicName}--ref`;
          addLine(lightRefs, `${refName}: var(${sdsify(primitiveVar)});`);
          addLine(groups.colorsSemantic, `${sdsPublicName}: var(${refName});`);
        }
        return;
      }

      // SPACING
      if (path0 === 'tokens' && token.path[1] === 'spacing') {
        const key = token.path[2];
        const value = `${token.original.value / 16}rem`;
        emit('spacing', `--spacing-${key}`, value);
        return;
      }

      // RADIUS
      if (path0 === 'tokens' && token.path[1] === 'radius') {
        const key = token.path[2];
        emit('radius', `--radius-${key}`, `${token.original.value / 16}rem`);
        return;
      }

      // SHADOW — aggregate layers per level (layer index = token.path[3])
      if (path0 === 'effect' && token.path[1] === 'elevation') {
        // The source key is literally `lv.1` (a dot inside one JSON key).
        // Depending on the Style Dictionary version, that arrives either as a
        // single path segment (`['effect','elevation','lv.1','0']`) or split
        // on the dot (`['effect','elevation','lv','1','0']`) — the installed
        // v5 does the latter, which previously collapsed every level into one
        // bogus `--shadow-sds-lv`. Join everything between `elevation` and the
        // trailing layer index so both shapes yield `level-1` … `level-5`.
        const shadowName = token.path
          .slice(2, -1)
          .join('-')
          .toLowerCase()
          .replace('.', '-')
          .replace(/^lv-/, 'level-');
        const layerIndex = Number(token.path[token.path.length - 1]);
        const { offsetX, offsetY, radius, spread, color } = token.value;
        const layer = `${offsetX}px ${offsetY}px ${radius}px ${spread}px ${color}`;
        if (!shadowLayers.has(shadowName)) shadowLayers.set(shadowName, []);
        shadowLayers.get(shadowName).push({ index: layerIndex, value: layer });
        return;
      }

      // FONT
      if (path0 === 'font') {
        const pathKey = token.path.slice(1).join('-');
        const { fontSize, lineHeight, fontWeight } = token.value;
        const sdsFontSize = emit('font', `--font-size-${pathKey}`, `${fontSize / 16}rem`);
        const sdsLineHeight = emit('font', `--line-height-${pathKey}`, `${lineHeight / 16}rem`);
        const sdsFontWeight = emit('font', `--font-weight-${pathKey}`, `${fontWeight}`);
        // Per-token font-family (e.g. --font-family-eina-03) is intentionally
        // NOT emitted here anymore — see the shared --font-family-sans
        // variable below. It was dead even before this change (the
        // @utility block never referenced it).

        // ---- Generate @utility (unchanged class name; references the
        // sds-authoritative variables directly) ----
        const utilName = `typo-${pathKey}`;
        utilities.push(`@utility ${utilName} {
  font-family: var(${sdsify('--font-family-sans')});
  font-size: var(${sdsFontSize});
  line-height: var(${sdsLineHeight});
  font-weight: var(${sdsFontWeight});
}`);
      }
    });

    // ---- Shared base font stack (not sourced from a Figma token — this is
    // a deliberate architecture decision).
    // Figma's Typography frame explicitly instructs implementers to use the
    // OS-native `system-ui` stack rather than a bundled web font, so this is
    // the ONE font-family every `typo-*` utility uses by default — no font
    // files are loaded for it. Consumers who want the branded Inter/Noto
    // Sans JP look instead can opt in with a single import
    // (`@sun-asterisk/nova/branded-fonts.css`, see
    // src/branded-fonts.css) which loads those fonts AND overrides this same
    // variable — no other code changes needed on either side. ----
    emit(
      'font',
      '--font-family-sans',
      "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    );

    // --- Emit aggregated shadows (one declaration per elevation level) ---
    for (const [name, layers] of shadowLayers) {
      const combined = layers
        .sort((a, b) => a.index - b.index)
        .map((l) => l.value)
        .join(', ');
      emit('shadow', `--shadow-${name}`, combined);
    }

    // --- Sort for consistency ---
    Object.values(groups).forEach((arr) => arr.sort((a, b) => a.localeCompare(b)));
    utilities.sort((a, b) => a.localeCompare(b));

    // --- Combine output: sds-authoritative declarations only, in one
    // @theme inline block (see Phase 2 §K — Tailwind v4 utility generation
    // only requires a recognized category prefix on the variable name). ---
    const renderGroups = (groupsObj) =>
      Object.values(groupsObj)
        .flat()
        .map((line) => `  ${line}\n`)
        .join('');

    const { colorsSemantic, ...inlineGroups } = groups;
    const themeContent = renderGroups(inlineGroups);
    const semanticContent = colorsSemantic.map((line) => `  ${line}\n`).join('');
    lightRefs.sort((a, b) => a.localeCompare(b));

    const emittedSdsColorVarNames = new Set(
      colorsSemantic.map((line) => line.slice(0, line.indexOf(':'))),
    );
    const themeBlocks = buildThemeBlocks(emittedSdsColorVarNames, lightRefs);

    return (
      `@theme inline {\n${themeContent}}\n\n` +
      `/* Public semantic colors — the re-brand override surface. \`static\` (not
   \`inline\`) so utilities compile to var(--color-sds-*) and every var is
   always emitted. See scripts/build-tokens.mjs and
   docs/components/theme-provider.md §10. */\n` +
      `@theme static {\n${semanticContent}}\n\n${utilities.join('\n\n')}\n${themeBlocks}`
    );
  };
}
const sd = new StyleDictionary({
  source: ['scripts/design-tokens.tokens.json'],
  platforms: {
    tailwind: {
      transformGroup: 'js',
      buildPath: './scripts/',
      files: [
        {
          destination: 'global.css',
          format: 'css/tailwind',
        },
      ],
    },
  },
});

sd.registerFormat({
  name: 'css/tailwind',
  format: createTailwindCssFormat(),
});

sd.buildAllPlatforms();

buildTraceabilityManifest('scripts/design-tokens.tokens.json', 'scripts/token-manifest.json');
