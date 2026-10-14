#!/usr/bin/env node
/**
 * Real-browser verification for the two CSS-only Phase X foundation
 * capabilities that have no other automated regression coverage anywhere
 * in the `/test` suite: the global `prefers-reduced-motion` rule and
 * `ThemeProvider`'s native `color-scheme` bridge (both added to
 * `src/styles.css`
 * §10.4/§10.5).
 *
 * Neither behavior is reachable from Vitest's jsdom-free browser-mode
 * projects in a way that lets a single test emulate
 * `prefers-reduced-motion`/`prefers-color-scheme` per-test (Vitest browser
 * mode's Playwright provider config is workspace-wide, not per-test), so
 * this is a small, standalone Playwright script instead — the same
 * "real packed/built artifact, not just source" philosophy as
 * `verify-package.mjs`, applied to compiled CSS instead of the compiled JS
 * package. Run this AFTER `pnpm build` — it loads the real `dist/index.css`
 * against a minimal static HTML fixture, not a mock.
 *
 * Also covers nested/scoped `[data-theme]` regions and the `--color-sds-*`
 * re-brand override surface (SC-02/SC-03 — see
 * docs/components/theme-provider.md §10/§12), for both a compiled library
 * utility and consumer-authored `var(--color-sds-*)` CSS.
 *
 * Mutation-tested manually during Phase X implementation (see the
 * Foundation Capability Implementation report's Mutation-Test Evidence
 * section): each assertion below was confirmed to FAIL when the
 * corresponding `src/styles.css` rule was deliberately broken, then to
 * PASS again once restored.
 */
import { chromium } from 'playwright';
import { mkdtempSync, writeFileSync, rmSync, cpSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

let failures = 0;
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}
function fail(msg) {
  failures += 1;
  console.error(`  ✗ ${msg}`);
}

console.log('== Motion & theme CSS verification (real browser, real dist/index.css) ==\n');

const workDir = mkdtempSync(path.join(tmpdir(), 'sun-ds-motioncheck-'));
try {
  cpSync(path.join(rootDir, 'dist/index.css'), path.join(workDir, 'index.css'));

  // Fixture matches Modal's real enter-animation class combination
  // (`animate-in fade-in-0 zoom-in-95 duration-300`) — deliberately NOT
  // Spinner's, which carries its own `motion-reduce:animate-none` class
  // that would make this check pass regardless of whether the GLOBAL rule
  // itself works (a real blind spot found during Phase X's own mutation
  // testing — see the implementation report).
  writeFileSync(
    path.join(workDir, 'fixture.html'),
    `<!DOCTYPE html><html data-theme="dark"><head><link rel="stylesheet" href="index.css"></head>
     <body><div id="anim" class="animate-in fade-in-0 zoom-in-95 duration-300"></div></body></html>`,
  );

  const browser = await chromium.launch();

  {
    const page = await browser.newPage();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`file://${path.join(workDir, 'fixture.html')}`);
    const duration = await page.evaluate(
      () => getComputedStyle(document.getElementById('anim')).animationDuration,
    );
    if (duration === '0.01ms' || duration === '1e-05s') {
      ok(
        `prefers-reduced-motion: reduce collapses a real animate-in element's duration (${duration})`,
      );
    } else {
      fail(`prefers-reduced-motion: reduce did NOT collapse animation-duration (got ${duration})`);
    }
    await page.close();
  }

  {
    const page = await browser.newPage();
    await page.goto(`file://${path.join(workDir, 'fixture.html')}`);
    const duration = await page.evaluate(
      () => getComputedStyle(document.getElementById('anim')).animationDuration,
    );
    if (duration === '0.3s') {
      ok(
        `normal motion preserves the real 300ms duration (${duration}) — the reduced-motion rule is correctly scoped, not always-on`,
      );
    } else {
      fail(
        `normal motion unexpectedly altered animation-duration (got ${duration}, expected 0.3s)`,
      );
    }
    await page.close();
  }

  {
    const page = await browser.newPage();
    await page.goto(`file://${path.join(workDir, 'fixture.html')}`);
    const colorScheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    );
    if (colorScheme === 'dark') {
      ok(`data-theme="dark" sets color-scheme: dark on :root (${colorScheme})`);
    } else {
      fail(`data-theme="dark" did NOT set color-scheme: dark (got ${colorScheme})`);
    }
    await page.close();
  }

  // A `data-theme="light"` fixture, with the OS itself preferring dark —
  // proves an explicit data-theme always wins over the OS preference.
  writeFileSync(
    path.join(workDir, 'fixture-light.html'),
    `<!DOCTYPE html><html data-theme="light"><head><link rel="stylesheet" href="index.css"></head><body></body></html>`,
  );
  {
    const page = await browser.newPage();
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(`file://${path.join(workDir, 'fixture-light.html')}`);
    const colorScheme = await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    );
    if (colorScheme === 'light') {
      ok(`data-theme="light" wins over OS dark preference (${colorScheme})`);
    } else {
      fail(`data-theme="light" did NOT override OS dark preference (got ${colorScheme})`);
    }
    await page.close();
  }

  // ---------------------------------------------------------------------
  // Nested / scoped theme regions + re-brand override surface (SC-02/SC-03,
  // docs/components/theme-provider.md §10/§12). Every expectation is a real
  // computed color. Expected light/dark values are derived from
  // scripts/global.css's own light/dark `--ref` mapping for the probed token
  // and resolved through a primitive-only probe — never hardcoded hex — so
  // this checks the cascade wiring, not token values.
  // ---------------------------------------------------------------------
  const globalCss = readFileSync(path.join(rootDir, 'scripts/global.css'), 'utf8');
  const TOKEN = '--color-sds-surface-primary';
  const refRe = new RegExp(`${TOKEN}--ref:\\s*var\\((--color-sds-[a-z0-9-]+)\\)`, 'g');
  const refs = [...globalCss.matchAll(refRe)].map((m) => m[1]);
  // Generator order: light block first, then the two dark blocks.
  const [lightPrimitive, darkPrimitive] = [refs[0], refs[1]];

  // Mirrors the classes Button variant="primary" compiles to
  // (src/components/button/Button.styles.ts: bg-sds-surface-primary
  // text-sds-text-on-surface) plus a consumer-authored custom var() usage.
  const probe = (id) =>
    `<button id="${id}-util" class="bg-sds-surface-primary text-sds-text-on-surface">Btn</button>` +
    `<div id="${id}-custom" style="background-color: var(${TOKEN})"></div>`;
  writeFileSync(
    path.join(workDir, 'fixture-nested.html'),
    // The consumer <style> is deliberately loaded BEFORE the library
    // stylesheet: the re-brand must win by specificity (the library's
    // `:where([data-theme])` re-bind is specificity 0), not by luck of
    // source order.
    `<!DOCTYPE html><html ROOTATTR><head>
     <style>
       .brand-ocean { ${TOKEN}: rgb(1, 2, 3); }
       #expect-light { background-color: var(${lightPrimitive}); }
       #expect-dark { background-color: var(${darkPrimitive}); }
     </style><link rel="stylesheet" href="index.css"></head><body>
     <div id="expect-light"></div><div id="expect-dark"></div>
     ${probe('root')}
     <div data-theme="dark">${probe('dark')}
       <div data-theme="light">${probe('darklight')}</div>
     </div>
     <div data-theme="light">${probe('light')}
       <div data-theme="dark">${probe('lightdark')}</div>
     </div>
     <div class="brand-ocean">${probe('brand')}
       <div class="brand-ocean" data-theme="dark">${probe('branddark')}</div>
     </div>
     </body></html>`,
  );

  async function readColors(rootAttr, colorScheme) {
    const html = readFileSync(path.join(workDir, 'fixture-nested.html'), 'utf8').replace(
      'ROOTATTR',
      rootAttr,
    );
    const file = path.join(
      workDir,
      `fixture-nested-${rootAttr ? 'attr' : 'none'}-${colorScheme}.html`,
    );
    writeFileSync(file, html);
    const page = await browser.newPage();
    await page.emulateMedia({ colorScheme });
    await page.goto(`file://${file}`);
    const colors = await page.evaluate(() =>
      Object.fromEntries(
        [...document.querySelectorAll('[id]')].map((el) => [
          el.id,
          getComputedStyle(el).backgroundColor,
        ]),
      ),
    );
    await page.close();
    return colors;
  }

  function expectColor(colors, id, expected, label) {
    if (colors[id] === expected) ok(`${label} (${colors[id]})`);
    else fail(`${label}: got ${colors[id]}, expected ${expected}`);
  }

  for (const [rootAttr, os] of [
    ['data-theme="light"', 'light'],
    ['data-theme="dark"', 'light'],
    ['', 'dark'],
    ['data-theme="light"', 'dark'],
  ]) {
    const c = await readColors(rootAttr, os);
    const L = c['expect-light'];
    const D = c['expect-dark'];
    const ctx = `[root ${rootAttr || '(no attr)'}, OS ${os}]`;
    if (!L || L === D) {
      fail(
        `${ctx} light/dark primitives for ${TOKEN} are indistinguishable (${L} / ${D}) — probe is meaningless`,
      );
      continue;
    }
    const rootExpected = rootAttr.includes('dark') || (!rootAttr && os === 'dark') ? D : L;
    for (const kind of ['util', 'custom']) {
      const what = kind === 'util' ? 'library utility' : 'custom var() CSS';
      expectColor(c, `root-${kind}`, rootExpected, `${ctx} root ${what} follows root theme / OS`);
      expectColor(c, `dark-${kind}`, D, `${ctx} nested data-theme="dark" region: ${what} is dark`);
      expectColor(
        c,
        `darklight-${kind}`,
        L,
        `${ctx} light region inside dark region: ${what} is light`,
      );
      expectColor(
        c,
        `light-${kind}`,
        L,
        `${ctx} nested data-theme="light" region: ${what} is light`,
      );
      expectColor(
        c,
        `lightdark-${kind}`,
        D,
        `${ctx} dark region inside light region: ${what} is dark`,
      );
      expectColor(
        c,
        `brand-${kind}`,
        'rgb(1, 2, 3)',
        `${ctx} ancestor ${TOKEN} re-brand restyles ${what}`,
      );
      expectColor(
        c,
        `branddark-${kind}`,
        'rgb(1, 2, 3)',
        `${ctx} re-brand on the same element as data-theme beats the theme re-bind (${what})`,
      );
    }
  }

  await browser.close();
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(`\n== ${failures} failing ==`);
if (failures > 0) {
  process.exit(1);
}
