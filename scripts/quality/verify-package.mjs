#!/usr/bin/env node
/**
 * Formalizes the manual package-verification pass into a reusable, deterministic, read-only check. Run this AFTER `pnpm build` —
 * it inspects the real packed tarball and the real dist/ output, it does
 * not build anything itself.
 *
 * What it checks (
 * "Package verification" section for the full rationale):
 *   1. Every subpath declared in package.json's `exports` field actually
 *      resolves at runtime, via both `import()` and `require()`.
 *   2. No accidental extra top-level exports beyond what's declared.
 *   2.1 Every export target (types/import/require/CSS) is in the tarball.
 *   2.2 ONE module graph: every value exported by a component subpath is
 *       the SAME object (`===`) as the root entry's export of that name, in
 *       both ESM and CJS, plus a real SSR render of root <ThemeProvider> +
 *       subpath useTheme() (F1).
 *   2.3 Client-boundary 'use client' directives (ThemeProvider, Modal,
 *       DatePicker) survive into both builds.
 *   2.4 @arethetypeswrong/cli against the packed tarball reports zero
 *       problems for node10, node16 (CJS + ESM) and bundler (F2/F3/NX-04).
 *   3. The packed tarball ships zero vendored (`node_modules`-path) files.
 *   4. Package size / file count stay within a regression band of the
 *      known-good baseline (348.1kB packed / 1.6MB unpacked /
 *      305 files) — a soft WARN band and a hard FAIL band, not a single
 *      arbitrary cutoff.
 *
 * All work happens in a throwaway temp directory that is always removed,
 * even on failure.
 */
import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  rmSync,
  mkdirSync,
  symlinkSync,
  writeFileSync,
  readFileSync,
  readdirSync,
  statSync,
  openSync,
  closeSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const pkg = JSON.parse(
  execFileSync('node', ['-e', 'console.log(JSON.stringify(require("./package.json")))'], {
    cwd: rootDir,
  }).toString(),
);

// Collects every leaf target string of an `exports` condition, however
// deeply nested (`{ import: { types, default }, require: { ... } }`).
function exportLeaves(condition) {
  if (typeof condition === 'string') return [condition];
  return Object.values(condition).flatMap(exportLeaves);
}
// A CSS subpath: every non-declaration target is a stylesheet.
function isCssExport(condition) {
  const runtime = exportLeaves(condition).filter((t) => !/\.d\.c?ts$/.test(t));
  return runtime.length > 0 && runtime.every((t) => t.endsWith('.css'));
}
const jsExportEntries = () =>
  Object.entries(pkg.exports).filter(([, condition]) => !isCssExport(condition));

// Known-good baseline.
// Re-anchored 2026-09-29 by the single-module-graph rewrite
//: previous baseline was
// 500.9kB / 2.22MB / 654 files, and the last two-graph build measured
// 750.1kB / 2.97MB / 736 files (the +50% WARN — every component shipped
// twice: once in the monolithic root bundles dist/index.js +
// dist/cjs/index.cjs, once per subpath). One graph removes the duplicate
// root bundles: packed size -52%, unpacked -43%. The file count goes UP
// (736 → 947) for two deliberate reasons, not vendoring (0 node_modules-path
// files, checked below): (1) CJS is now emitted one-file-per-module like
// ESM (it previously had a bundled root), and (2) every .d.ts has a .d.cts
// twin so `require` resolves CommonJS-format declarations under
// node16/nodenext. Icons remain one file per icon so single-icon imports
// tree-shake (verify-treeshaking.mjs).
const BASELINE = { packedKB: 357.3, unpackedMB: 1.7, files: 947 };
const WARN_GROWTH = 0.2; // +20% vs baseline: warn
const FAIL_GROWTH = 0.5; // +50% vs baseline: fail (something is being vendored again)

const VENDOR_PATTERNS = [/node_modules\//, /^\.pnpm\//];

let failures = 0;
let warnings = 0;

function fail(msg) {
  failures += 1;
  console.error(`  ✗ ${msg}`);
}
function warn(msg) {
  warnings += 1;
  console.warn(`  ! ${msg}`);
}
function ok(msg) {
  console.log(`  ✓ ${msg}`);
}

console.log('== Package verification ==\n');

// --- 1. Pack the real tarball -------------------------------------------------
const workDir = mkdtempSync(path.join(tmpdir(), 'sun-ds-pkgcheck-'));
let tarballPath;
try {
  console.log('Packing...');
  const packOutput = execFileSync('npm', ['pack', '--pack-destination', workDir, '--json'], {
    cwd: rootDir,
  }).toString();
  const [packInfo] = JSON.parse(packOutput);
  tarballPath = path.join(workDir, packInfo.filename);
  const packedKB = packInfo.size / 1024;
  const unpackedMB = packInfo.unpackedSize / 1024 / 1024;
  const fileCount = packInfo.entryCount ?? packInfo.files?.length;

  console.log(
    `\nPacked: ${packedKB.toFixed(1)}kB, unpacked ${unpackedMB.toFixed(2)}MB, ${fileCount} files (baseline: ${BASELINE.packedKB}kB / ${BASELINE.unpackedMB}MB / ${BASELINE.files} files)\n`,
  );

  for (const [label, value, base] of [
    ['packed size', packedKB, BASELINE.packedKB],
    ['unpacked size', unpackedMB, BASELINE.unpackedMB],
    ['file count', fileCount, BASELINE.files],
  ]) {
    const growth = (value - base) / base;
    if (growth > FAIL_GROWTH) {
      fail(
        `${label} grew ${(growth * 100).toFixed(0)}% vs baseline (${value} vs ${base}) — likely a new vendored/leaked dependency`,
      );
    } else if (growth > WARN_GROWTH) {
      warn(
        `${label} grew ${(growth * 100).toFixed(0)}% vs baseline (${value} vs ${base}) — worth a look, not necessarily a regression`,
      );
    } else {
      ok(`${label} within regression band (${value} vs baseline ${base})`);
    }
  }

  // --- 2. Vendor leakage ------------------------------------------------------
  const fileList = execFileSync('tar', ['-tzf', tarballPath])
    .toString()
    .split('\n')
    .filter(Boolean);
  const vendored = fileList.filter((f) => VENDOR_PATTERNS.some((re) => re.test(f)));
  if (vendored.length > 0) {
    fail(
      `${vendored.length} vendored file(s) shipped in the tarball: ${vendored.slice(0, 5).join(', ')}${vendored.length > 5 ? '...' : ''}`,
    );
  } else {
    ok('0 vendored (node_modules-path) files in the tarball');
  }

  // --- 3. Extract into a real, isolated node_modules and resolve every export -
  const consumerDir = path.join(workDir, 'consumer');
  // Install under the package's own name (scope/name), read from package.json so the
  // same check works for the public package (@sun-asterisk/nova) the export renames it to.
  const pkgInstallDir = path.join(consumerDir, 'node_modules', ...pkg.name.split('/'));
  mkdirSync(pkgInstallDir, { recursive: true });
  execFileSync('tar', ['-xzf', tarballPath, '-C', pkgInstallDir, '--strip-components=1']);
  writeFileSync(
    path.join(consumerDir, 'package.json'),
    JSON.stringify({ name: 'consumer', private: true, type: 'module' }),
  );

  // Symlink every runtime/peer dependency from this repo's own
  // node_modules into the consumer fixture, so the packed library's real
  // `import 'react'` etc. resolve — exactly what a real `npm install`
  // would produce, without a second, slow, network-dependent install.
  const depNames = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ]);
  const consumerNodeModules = path.join(consumerDir, 'node_modules');
  for (const depName of depNames) {
    const source = path.join(rootDir, 'node_modules', depName);
    try {
      statSync(source);
    } catch {
      continue; // not installed at the root — nothing to link
    }
    const dest = path.join(consumerNodeModules, depName);
    mkdirSync(path.dirname(dest), { recursive: true });
    symlinkSync(source, dest, 'dir');
  }

  console.log('\nResolving every declared export...');
  const packageName = pkg.name;
  let resolvedCount = 0;
  for (const [subpath] of jsExportEntries()) {
    const specifier = subpath === '.' ? packageName : `${packageName}${subpath.slice(1)}`;

    try {
      const esmResult = execFileSync(
        'node',
        [
          '-e',
          `import('${specifier}').then(m => console.log(Object.keys(m).length)).catch(e => { console.error(e.message); process.exit(1); })`,
        ],
        { cwd: consumerDir },
      )
        .toString()
        .trim();
      const cjsResult = execFileSync(
        'node',
        ['-e', `console.log(Object.keys(require('${specifier}')).length)`],
        { cwd: consumerDir },
      )
        .toString()
        .trim();
      ok(`${subpath} — ESM ${esmResult} exports, CJS ${cjsResult} exports`);
      resolvedCount += 1;
    } catch (err) {
      fail(`${subpath} failed to resolve: ${err.message.split('\n')[0]}`);
    }
  }
  console.log(
    `\n${resolvedCount}/${jsExportEntries().length} JS export paths resolved successfully.`,
  );

  // --- 3.1. Every export target (incl. `types` and CSS) exists in the tarball
  // The runtime resolution loop above only exercises `import`/`require`, so a
  // missing `.d.ts` is invisible to it. Found 2026-09-29: vite-plugin-dts v5
  // renamed `outDir` → `outDirs`, the old key was silently ignored, and every
  // subpath's `types` target under dist/types/components/ stopped existing —
  // TypeScript consumers of subpath imports got no types while this script
  // still reported 26/26 PASS.
  console.log('\nChecking every export target file is in the tarball...');
  const packedFiles = new Set(fileList.map((f) => f.replace(/^package\//, '')));
  let missingTargets = 0;
  for (const [subpath, condition] of Object.entries(pkg.exports)) {
    for (const target of exportLeaves(condition)) {
      if (!packedFiles.has(target.replace(/^\.\//, ''))) {
        missingTargets += 1;
        fail(`${subpath} → ${target} is not in the packed tarball`);
      }
    }
  }
  if (missingTargets === 0) ok('every export target (types/import/require/CSS) is in the tarball');

  // --- 3.2. One module graph: root and every subpath share module instances
  // Found 2026-09-29 by the external consumer audit (F1): the root entry and
  // the subpath entries were produced by two separate `vite build` passes,
  // so each carried its own copy of every module — root <ThemeProvider> +
  // subpath useTheme() threw "must be used within a <ThemeProvider>", and
  // every component shipped twice. Every value a component subpath exports
  // must be the very same object the root exports under that name. `./cn`
  // is the one subpath whose export is deliberately not re-exported from
  // the root, so it has no root counterpart to compare against.
  console.log('\nVerifying root and subpath entries share one module graph...');
  const SUBPATHS_NOT_IN_ROOT = new Set(['./cn']);
  const identitySubpaths = jsExportEntries()
    .map(([subpath]) => subpath)
    .filter((subpath) => subpath !== '.' && !SUBPATHS_NOT_IN_ROOT.has(subpath));
  const identityProbe = (format) => {
    const load =
      format === 'esm'
        ? (spec) => `await import(${JSON.stringify(spec)})`
        : (spec) => `require(${JSON.stringify(spec)})`;
    const body = `
      const root = ${load(packageName)};
      const subpaths = ${JSON.stringify(identitySubpaths)};
      const problems = [];
      let compared = 0;
      for (const subpath of subpaths) {
        const mod = ${format === 'esm' ? 'await import' : 'require'}(${JSON.stringify(packageName)} + subpath.slice(1));
        for (const [name, value] of Object.entries(mod)) {
          if (name === 'default' || name === '__esModule') continue;
          compared += 1;
          if (!(name in root)) problems.push(subpath + ' exports ' + name + ', which the root entry does not');
          else if (root[name] !== value) problems.push(subpath + '.' + name + ' !== root.' + name);
        }
      }
      // Behavioural proof of the same property, not just referential
      // equality: a root provider must satisfy a subpath hook.
      const React = ${load('react')};
      const { renderToString } = ${load('react-dom/server')};
      const tp = ${load(packageName + '/theme-provider')};
      const h = (React.default ?? React).createElement;
      let rendered;
      try {
        const Probe = () => h('i', null, 'mode:' + tp.useTheme().mode);
        rendered = renderToString(h(root.ThemeProvider, { defaultMode: 'dark' }, h(Probe)));
      } catch (e) {
        rendered = 'THROW:' + e.message;
      }
      console.log(JSON.stringify({ compared, problems, rendered }));
    `;
    const script = format === 'esm' ? body : `(async () => {${body}})()`;
    const out = execFileSync(
      'node',
      [format === 'esm' ? '--input-type=module' : '--input-type=commonjs', '-e', script],
      { cwd: consumerDir, stdio: ['ignore', 'pipe', 'pipe'] },
    )
      .toString()
      .trim()
      .split('\n')
      .pop();
    return JSON.parse(out);
  };
  for (const format of ['esm', 'cjs']) {
    try {
      const { compared, problems, rendered } = identityProbe(format);
      if (compared === 0) {
        fail(
          `${format.toUpperCase()}: identity check compared 0 exports — probe is not testing anything`,
        );
      } else if (problems.length > 0) {
        fail(
          `${format.toUpperCase()}: ${problems.length}/${compared} subpath export(s) are a different instance from the root's: ${problems.slice(0, 5).join('; ')}${problems.length > 5 ? '...' : ''}`,
        );
      } else {
        ok(
          `${format.toUpperCase()}: all ${compared} subpath exports across ${identitySubpaths.length} subpaths are === the root entry's`,
        );
      }
      if (/mode:dark/.test(rendered)) {
        ok(
          `${format.toUpperCase()}: root <ThemeProvider> + /theme-provider useTheme() renders (${rendered})`,
        );
      } else {
        fail(
          `${format.toUpperCase()}: root <ThemeProvider> + /theme-provider useTheme() failed: ${rendered}`,
        );
      }
    } catch (err) {
      fail(
        `${format.toUpperCase()}: identity probe crashed: ${(err.stderr?.toString() || err.message).split('\n')[0]}`,
      );
    }
  }

  // --- 3.3. 'use client' survives on ThemeProvider (Next.js RSC) ----------
  // Rollup strips module-level directives and esbuild's minifier drops a
  // bare 'use client'; vite.config.ts re-adds it via output.banner. Without
  // it, importing ThemeProvider in a Next.js App Router layout fails with
  // `createContext is not a function` (docs/architecture/
  // theme-provider-rsc-verification.md). Checked on the packed files that
  // the `/theme-provider` and root entries actually load.
  // Modal.tsx / DatePicker.tsx joined on 2026-09-29 (FINDINGS NX-03): they
  // create React context at module scope, so without the directive `/modal`,
  // `/date-picker` — and via the barrel the package root — crashed when
  // merely imported from a Server Component.
  console.log("\nChecking client-boundary 'use client' directives...");
  for (const file of [
    'dist/esm/components/themeProvider/ThemeProvider.js',
    'dist/cjs/components/themeProvider/ThemeProvider.cjs',
    'dist/esm/components/modal/Modal.js',
    'dist/cjs/components/modal/Modal.cjs',
    'dist/esm/components/datePicker/DatePicker.js',
    'dist/cjs/components/datePicker/DatePicker.cjs',
  ]) {
    let head = '';
    try {
      head = readFileSync(path.join(pkgInstallDir, file), 'utf8').slice(0, 64);
    } catch {
      fail(`${file} is missing from the tarball`);
      continue;
    }
    if (/^\s*['"]use client['"]/.test(head)) ok(`${file} starts with 'use client'`);
    else
      fail(
        `${file} does not start with 'use client' (starts: ${JSON.stringify(head.slice(0, 30))})`,
      );
  }
  for (const file of [
    'dist/esm/components/themeProvider/ThemeScript.js',
    'dist/cjs/components/themeProvider/ThemeScript.cjs',
  ]) {
    const content = readFileSync(path.join(pkgInstallDir, file), 'utf8');
    if (/['"]use client['"]/.test(content.slice(0, 64))) {
      fail(`${file} carries 'use client' — ThemeScript must stay Server-Component-callable`);
    } else {
      ok(`${file} has no 'use client' (stays Server-Component-callable)`);
    }
  }

  // --- 3.4. Type resolution under every moduleResolution (attw) -----------
  // Found 2026-09-29 by the external consumer audit: subpath types did not
  // resolve under node10 (F2 — NestJS/ts-jest default), node16/nodenext
  // got FalseESM + InternalResolutionError (F3 — extensionless .d.ts
  // specifiers in a "type": "module" package, and `require` sharing the
  // ESM declarations), and `./styles` had no declaration target under TS 6
  // `noUncheckedSideEffectImports` (NX-04). @arethetypeswrong/cli checks
  // exactly these against the real tarball; any problem fails.
  console.log('\nRunning @arethetypeswrong/cli against the packed tarball...');
  const attwBin = path.join(rootDir, 'node_modules', '.bin', 'attw');
  // stdout goes to a real file, not a pipe: attw calls process.exit() when
  // it finds problems, which truncates a piped stdout at the 64KiB pipe
  // buffer (its JSON report, with resolution traces, is far larger).
  const attwReportPath = path.join(workDir, 'attw.json');
  const attwOut = openSync(attwReportPath, 'w');
  try {
    execFileSync(attwBin, [tarballPath, '--format', 'json'], {
      cwd: workDir,
      stdio: ['ignore', attwOut, 'pipe'],
    });
  } catch (err) {
    // attw exits non-zero when it finds problems; the report is still written.
    if (err.status == null) {
      fail(`attw could not run: ${(err.stderr?.toString() || err.message).split('\n')[0]}`);
    }
  } finally {
    closeSync(attwOut);
  }
  const attwJson = readFileSync(attwReportPath, 'utf8');
  if (!attwJson.trim()) fail('attw produced no report');
  if (attwJson.trim()) {
    const report = JSON.parse(attwJson.slice(attwJson.indexOf('{')));
    const entrypoints = Object.keys(report.analysis?.entrypoints ?? {});
    // attw's JSON groups problems by kind: { FalseESM: [...], ... }.
    const problems = Array.isArray(report.problems)
      ? report.problems
      : Object.values(report.problems ?? {}).flat();
    const expected = Object.keys(pkg.exports).length;
    if (entrypoints.length !== expected) {
      fail(
        `attw analysed ${entrypoints.length} entrypoints, expected ${expected} (one per exports key)`,
      );
    }
    if (problems.length > 0) {
      const summary = problems
        .slice(0, 8)
        .map(
          (p) =>
            `${p.kind}${p.entrypoint ? ` ${p.entrypoint}` : ''}${p.resolutionKind ? ` [${p.resolutionKind}]` : ''}`,
        )
        .join('; ');
      const byKind = Object.entries(
        problems.reduce((acc, p) => ({ ...acc, [p.kind]: (acc[p.kind] ?? 0) + 1 }), {}),
      )
        .map(([kind, n]) => `${n} ${kind}`)
        .join(', ');
      fail(
        `attw found ${problems.length} problem(s) (${byKind}): ${summary}${problems.length > 8 ? '...' : ''}`,
      );
    } else {
      ok(
        `attw: 0 problems across ${entrypoints.length} entrypoints × node10/node16-cjs/node16-esm/bundler`,
      );
    }
  }

  // --- 3.5. Public API budget (Phase X Foundation Capability Audit §9.3) --
  // The audit budgeted exactly +1 new public export (`cn`) beyond the
  // per-component subpaths. This check makes that budget mutation-testable:
  // it fails if `./cn` is ever silently removed from `exports` (§4's own
  // per-subpath resolution loop above only checks whatever IS currently
  // declared — it has no opinion on what SHOULD be declared, so it cannot
  // by itself catch a required subpath quietly disappearing), and it fails
  // if any internal-only utility (`useFieldIds`, the focus-ring constants)
  // ever becomes reachable via a real deep import against the packed
  // tarball, closing the loop on the exact "accidentally public" class of
  // defect this repo's own HIGH-02 finding first diagnosed.
  console.log('\nVerifying the public API budget...');
  const REQUIRED_PUBLIC_SUBPATHS = ['./cn'];
  for (const subpath of REQUIRED_PUBLIC_SUBPATHS) {
    if (subpath in pkg.exports) {
      ok(`${subpath} is present in package.json's exports (required public API)`);
    } else {
      fail(`${subpath} is MISSING from package.json's exports — required public API budget item`);
    }
  }

  const FORBIDDEN_DEEP_IMPORTS = [
    'dist/esm/utils/useFieldIds.js',
    'dist/esm/utils/focusRing.js',
    'utils',
    'utils/useFieldIds',
    'utils/focusRing',
  ];
  for (const deepPath of FORBIDDEN_DEEP_IMPORTS) {
    const specifier = `${packageName}/${deepPath}`;
    try {
      // stdio: 'pipe' (the default) still lets a child's own uncaught-
      // exception printer write to ITS stderr, which Node then surfaces
      // via the thrown error's `.stderr` — read that instead of `.message`
      // so an *expected* ERR_PACKAGE_PATH_NOT_EXPORTED here doesn't dump a
      // raw stack trace into otherwise-clean passing output.
      execFileSync('node', ['-e', `require('${specifier}')`], {
        cwd: consumerDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      fail(
        `${specifier} unexpectedly RESOLVED — an internal-only utility is accidentally reachable`,
      );
    } catch (err) {
      const stderr = err.stderr?.toString() ?? err.message;
      if (/ERR_PACKAGE_PATH_NOT_EXPORTED/.test(stderr)) {
        ok(`${specifier} correctly blocked (ERR_PACKAGE_PATH_NOT_EXPORTED)`);
      } else {
        fail(`${specifier} failed for an unexpected reason: ${stderr.split('\n')[0]}`);
      }
    }
  }

  // --- 4. Declaration-file portability -----------------------------------
  // Phase 10 found every published .d.ts hardcoding a pnpm-virtual-store
  // path for React's types (e.g. `.pnpm/react@19.2.7/node_modules/react`)
  // instead of the bare `react` specifier — unresolvable for any consumer
  // without this exact repo's pnpm store layout. Phase 11 could not find a
  // config-level fix that didn't itself regress source typechecking (a
  // `preserveSymlinks: true` attempt caused ~40 new cascading type errors
  // across every component wrapping a Radix primitive with spread props —
  //), and the defect did
  // not reproduce against a from-scratch clean build/cache during Phase 11's
  // own re-verification — its root trigger (something about vite-plugin-dts'
  // resolution under a particular pnpm-store/cache state) is not fully
  // understood. Rather than declare it silently fixed, this check makes the
  // failure mode impossible to ship undetected: it scans every emitted
  // .d.ts file's actual text for a node_modules-store path leaking into an
  // import/export specifier, on every build, forever.
  console.log('\nScanning declaration files for non-portable module paths...');
  const typesDir = path.join(pkgInstallDir, 'dist/types');
  const NONPORTABLE_PATTERNS = [/\.pnpm\//, /node_modules\/[^'"]+\/node_modules\//];
  const badDeclarations = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.d\.c?ts$/.test(entry.name)) {
        const content = readFileSync(full, 'utf8');
        if (NONPORTABLE_PATTERNS.some((re) => re.test(content))) {
          badDeclarations.push(path.relative(pkgInstallDir, full));
        }
      }
    }
  };
  walk(typesDir);
  if (badDeclarations.length > 0) {
    fail(
      `${badDeclarations.length} declaration file(s) reference a non-portable node_modules-store path: ${badDeclarations.slice(0, 5).join(', ')}${badDeclarations.length > 5 ? '...' : ''}`,
    );
  } else {
    ok('0 declaration files reference a non-portable node_modules-store path');
  }
} finally {
  rmSync(workDir, { recursive: true, force: true });
}

console.log(`\n== ${failures} failing, ${warnings} warning(s) ==`);
if (failures > 0) {
  process.exit(1);
}
