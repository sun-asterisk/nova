#!/usr/bin/env node
/**
 * Safe wrapper around `vitest run` for the `unit`/`storybook` browser-mode
 * projects. Fixes two confirmed, reproducible issues:
 *
 * 1. (P2 item 2) The Vitest+Playwright-provider pool (used via this repo's
 *    multi-project `vite.config.ts`) reliably completes every test file
 *    correctly, prints each file's own `✓`/`✗` result line, and then
 *    hangs indefinitely — *before* Vitest's own aggregate "Test Files..."
 *    summary line and its built-in `hanging-process` reporter ever get a
 *    chance to run. Real work completes in ~1-100s; the hang itself has
 *    been observed running past 2000s (33+ minutes) of pure idle (0% CPU)
 *    before a manual `kill -9` was needed.
 *
 * 2. (P2 item 1) The Storybook project's shared browser-mode transport
 *    (a Vite dev server fetch of `.storybook/vitest.setup.ts`) is flaky
 *    under load — confirmed via 3 back-to-back runs in the same session:
 *    PASS → FAIL(transport) → PASS, with zero real assertion failures
 *    across all 3. Retried automatically here, but ONLY when the specific
 *    transport-failure signature is detected (never for an ordinary
 *    per-file test/import failure — see `isRetryableTransportFailure`).
 *
 * CORRECTNESS — this script was itself found and fixed, twice, during its
 * own development to have exactly the false-confidence failure mode this
 * whole engagement exists to catch (Phase 14's own "Special Rule — False
 * Confidence Detection"):
 *   - v1 waited for Vitest's own aggregate summary line before deciding
 *     anything — but that line never prints in the confirmed hang, so v1
 *     just hung right along with it.
 *   - v2 used a fixed idle-timeout to decide "the run is done" and counted
 *     only `✓`/`✗` per-file lines — which silently declared a run
 *     complete-and-clean while a later file (one that might be genuinely
 *     failing, or even failing to *import*, which prints no per-file line
 *     at all) simply hadn't reported yet.
 *   - v3 tried `vitest list` to get an expected file count first — but
 *     `vitest list` must itself import every file to enumerate its test
 *     cases, so a file that fails to import breaks `vitest list` the same
 *     way, silently omitting that file rather than flagging a problem.
 *   - v4 (this version) uses a plain filesystem glob (ground truth,
 *     independent of whether Vitest can import anything) for the expected
 *     count, and never concludes "done" unless the number of files that
 *     printed a real result (success, failure, OR a standalone
 *     "Failed to import test file" block, which does not look like a
 *     normal per-file line) reaches that count. An incomplete run is
 *     reported as FAILURE, explicitly labeled INCOMPLETE — never silently
 *     treated as a clean pass. All 3 corrections were verified by hand:
 *     a real passing run, a real single-test failure, and a real
 *     import-crashing file were each run through this script and produced
 *     the correct exit code — see the mutation-evidence notes in
 *     phase14-test-certification.md's own update for this fix.
 *
 * Usage: node scripts/quality/run-vitest-safe.mjs -- <vitest run args...>
 * Example: node scripts/quality/run-vitest-safe.mjs -- run --project unit
 *
 * PROCESS-TREE CLEANUP — a fourth issue found and fixed during this
 * script's own development, discovered only by running it repeatedly in a
 * row: `pnpm exec vitest ...` is not one process but a chain (a shell
 * launches pnpm, which launches vitest, which launches a headless
 * Chromium instance) — killing only the immediate child (the shell/pnpm
 * process) with SIGKILL does NOT kill its descendants, which was directly
 * observed leaving orphaned `node (vitest)` and `chrome-headless-shell`
 * processes running (and their dev-server ports still LISTENing) after
 * this script itself had already reported a result and exited. Those
 * orphans then collided with the *next* invocation's own port selection
 * ("Port 63315 is in use, trying another one..." repeating across
 * multiple ports), which manifested as a second, entirely separate class
 * of apparent "hang" with no relation to the real fix being verified at
 * the time. Fixed by spawning the child `detached: true` (its own process
 * group) and killing the whole group (`process.kill(-pid, 'SIGKILL')`)
 * instead of just the one child process.
 *
 * BATCHING — a fifth, deeper issue, root-caused (to the extent it can be
 * from outside Vitest/Playwright's own internals) on PR #42 after the P2-2
 * hang above turned out to still occur even once every earlier fix in this
 * file was correct and confirmed working. Two hypotheses were tested and
 * BOTH ruled out with real CI evidence, not assumed:
 *   - Console-noise (vitest-dev/vitest#9941, "Playwright: logs causes
 *     timeouts across parallel tests and across browsers", still open
 *     upstream): `Switch.test.tsx` triggers a real Radix `console.warn`.
 *     Suppressing it (see test/unit.setup.ts) left the exact same hang
 *     completely unchanged (confirmed via CI run 34428258366) — ruled out.
 *   - Worker/context-pool exhaustion at a fixed size: `fileParallelism:
 *     false` (forcing one file at a time) only delayed the hang by
 *     exactly one file (6/26 instead of 5/26, confirmed via CI run
 *     34428746772) before the identical stall recurred — ruled out a
 *     fixed-N-slot theory specifically (a hard pool limit would either
 *     have fully resolved under serial execution, or hung at the exact
 *     same count regardless of concurrency).
 * What both experiments agree on: the very first ~5-6 files in ANY fresh
 * `vitest run` invocation of this project reliably complete, every single
 * time, on multiple different machines (this session's local dev machine
 * and GitHub's CI runners) — the degradation is a property of a single
 * long-running Vitest+Playwright browser-mode process accumulating state
 * across files (most likely leaked browser contexts/CDP sessions that
 * never get released between files), not of any specific file's content,
 * console output, or a fixed concurrency ceiling.
 *
 * Rather than continue chasing the exact upstream mechanism (a genuine,
 * open-ended investigation into Vitest/Playwright internals with no fix
 * identified after two substantive, evidence-based attempts), this version
 * mitigates the *symptom* directly: split the real file list into small
 * BATCH_SIZE groups and run each group as its own, separate `vitest run`
 * invocation — a fresh process, fresh browser, fresh context pool — well
 * before the observed degradation point. Slower in the success case (more
 * process/browser-startup overhead, paid `ceil(files / BATCH_SIZE)` times
 * instead of once) but reliable, versus the previous behavior of a
 * guaranteed 180s dead-time hang followed by a false failure on every run
 * of any project with more than ~6 files.
 *
 * ZERO-RESULT-HANG RETRY (added 2026-09-15) — a sixth issue: even a
 * Button file correctly isolated per the BATCHING fix above can still, on
 * rare occasion, hit the "killed after PRE_FIRST_RESULT_IDLE_MS with no
 * per-file result ever observed" path (confirmed live during the sds
 * token-namespace migration session, after a string of manual, non-wrapped
 * `vitest`/Chromium invocations had run in the same shell beforehand — the
 * isolated file itself passed instantly, in 17ms, when re-run completely
 * standalone immediately after). This is never a real content failure by
 * construction (a genuine test error still prints a per-file ✗/FAIL line
 * before the kill; zero output for the entire pre-first-result window means
 * the browser-startup "prepare" phase itself never got going — an
 * environment/leftover-process condition, not a test defect). `runOnce` now
 * tags this specific failure shape (`kind: 'zero-result-hang'`) and
 * `runWithRetries` retries it (`MAX_ZERO_RESULT_HANG_RETRIES`, independent
 * of the transport-retry budget) with a brand-new process, exactly the same
 * "only retry a signature that can't indicate a real bug" reasoning already
 * applied to the transport-failure retry — never applied to an INCOMPLETE
 * run (some files already reported before the kill), which stays a hard,
 * non-retried failure.
 */
import { spawn } from 'node:child_process';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const args = process.argv.slice(2);
const dashIndex = args.indexOf('--');
const vitestArgs = dashIndex === -1 ? args : args.slice(dashIndex + 1);

// Two different idle allowances, not one — confirmed necessary by hand
// during this script's own development. Before any test file has printed
// even one result, the process is still in Playwright/Vite's own browser
// "prepare" phase (starting the browser, warming the dev server), which
// this session directly observed taking anywhere from ~90s to over 1000s
// under load — a single flat idle-timeout short enough to catch the real
// post-results hang quickly would misfire during ordinary slow startup,
// declaring a false "genuine hang" before the run ever really began. Once
// at least one file HAS reported, per-file gaps are consistently small
// (single-digit-to-double-digit milliseconds, confirmed across dozens of
// real runs this session), so a much shorter idle allowance is both safe
// and desirable there — it's what makes this wrapper meaningfully faster
// than the hard ceiling alone for the common, already-warmed-up case.
const PRE_FIRST_RESULT_IDLE_MS = 150_000;
const POST_FIRST_RESULT_IDLE_MS = 12_000;
// CORRECTION: this was briefly raised to 300s on the (wrong) theory that
// batch 1's incomplete runs were a one-time Vite dependency-pre-bundling
// cold-start cost that just needed more time. Disproven with real CI
// evidence (PR #42, run 34431136338): even at 300s, batch 1 stalled at the
// exact same 3/5 files as it did at 180s — genuinely stuck, not slow. The
// real cause (see getMatchingFiles's own comment) was Button's test files
// specifically hanging when they're part of the first vitest process
// spawned against a fresh checkout; fixed by sorting them out of batch 1
// entirely, not by waiting longer. Reverted to the original 180s.
const HARD_CEILING_MS = 180_000;
const POLL_MS = 1_000;
const MAX_TRANSPORT_RETRIES = 2;
// A "zero-result hang" (killed after PRE_FIRST_RESULT_IDLE_MS with not one
// single file having reported anything yet, not even a failure) is, by
// construction, never a real content/logic failure — a genuine test error
// still prints a per-file ✗/FAIL line before the process gets killed. Zero
// output for the entire pre-first-result window means the browser-startup
// "prepare" phase itself never completed, which is an environment/process
// issue (observed 2026-09-15 during the sds token-namespace migration: a
// Button-isolated single-file batch — already isolated exactly per the
// BATCHING fix below — still hit this after a preceding string of manual,
// non-wrapped `vitest`/Chromium invocations in the same shell session,
// consistent with the PROCESS-TREE CLEANUP issue's own leftover-process
// theory rather than a new, distinct defect). Retrying is exactly as safe
// as the existing transport-failure retry below (same reasoning: only ever
// retry a failure signature that cannot, by definition, indicate a real
// content bug) — never applied to an INCOMPLETE run (some files already
// reported), which stays a hard, non-retried failure since that pattern
// could plausibly indicate a real per-file defect.
const MAX_ZERO_RESULT_HANG_RETRIES = 2;

// See the module header's "BATCHING" section. 5 is the largest size
// confirmed, via repeated real CI runs, to reliably complete every file
// before the observed degradation point — not a round-number guess.
const BATCH_SIZE = 5;

// Manual recursive walk instead of `node:fs`'s `globSync` — v4 of this
// script used `globSync`, which works fine locally (this session's dev
// machine runs Node 22+) but broke CI outright: `globSync` was only added
// to `node:fs` in Node 22.0.0, and every job in `.github/workflows/ci.yml`
// pins `node-version: '20'`. Confirmed via CI itself (PR #42, run
// 34388498283): `SyntaxError: The requested module 'node:fs' does not
// provide an export named 'globSync'` on Node v20.20.2 — this is a hard
// crash before any test even starts, not a subtler bug. A manual walk using
// only `readdirSync` (available since Node 0.x) needs no dependency (a
// glob library like `fast-glob`/`tinyglobby` is only a *transitive*
// dependency here, pulled in by Vite/Storybook — importing it directly
// without declaring it would be fragile) and is simpler than the actual
// matching this script needs (fixed extensions, not real glob syntax).
function walkFiles(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    // `__screenshots__/<TestFile>.test.tsx/` is a real DIRECTORY Vitest's
    // own browser-mode failure-screenshot feature creates — skipped at
    // walk time here (cleaner than the old post-hoc statSync check) so it
    // can never be miscounted as a test file (confirmed by hand: this
    // false match once inflated the count from 26 to 37).
    if (entry.name === '__screenshots__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
}

function extractProjects(vitestArgs) {
  const projects = [];
  for (let i = 0; i < vitestArgs.length; i++) {
    if (vitestArgs[i] === '--project') projects.push(vitestArgs[i + 1]);
  }
  return projects;
}

function extractPathScopes(vitestArgs) {
  return vitestArgs.filter((a, i) => {
    if (a.startsWith('-')) return false;
    if (vitestArgs[i - 1] === '--project') return false;
    if (a === 'run') return false;
    return true;
  });
}

// Everything in vitestArgs that isn't `run`, a `--project X` pair, or a
// path scope — passed through unchanged to every batch invocation. None of
// this repo's own scripts currently use any such flag, but a future one
// (e.g. `--reporter=...`) should still reach vitest rather than being
// silently dropped by the batching rewrite.
function extractExtraFlags(vitestArgs) {
  const pathScopes = new Set(extractPathScopes(vitestArgs));
  return vitestArgs.filter((a, i) => {
    if (a === 'run') return false;
    if (a === '--project') return false;
    if (vitestArgs[i - 1] === '--project') return false;
    if (pathScopes.has(a)) return false;
    return true;
  });
}

// Ground-truth file list for one specific project, filtered to any
// path-scope arguments given (e.g. `src/components/button`). Returns a
// sorted array (not just a count) so callers can chunk it into batches.
function getMatchingFiles(projectName, pathScopes) {
  const testRe = /\.test\.(ts|tsx)$/;
  const storyRe = /\.stories\.(js|jsx|mjs|ts|tsx)$/;

  const allFiles = [];
  walkFiles(path.join(repoRoot, 'src'), allFiles);

  const matches = [];
  for (const abs of allFiles) {
    const rel = path.relative(repoRoot, abs).split(path.sep).join('/');
    const isTest = testRe.test(rel);
    const isStory = storyRe.test(rel);
    if (projectName === 'unit' && !isTest) continue;
    const isStoryProject = projectName === 'storybook' || projectName === 'storybook-dark';
    if (isStoryProject && !isStory) continue;
    if (projectName !== 'unit' && !isStoryProject) continue;
    if (pathScopes.length > 0 && !pathScopes.some((scope) => rel.startsWith(scope))) continue;
    matches.push(rel);
  }
  matches.sort();
  return matches;
}

// True for Button's own test files — see `main()`'s own comment for why
// these are handled as isolated, one-file batches rather than joining the
// normal chunking. Kept as a named predicate since both `main()` and
// (historically) `getMatchingFiles` need the same check.
function isButtonFile(rel) {
  return rel.startsWith('src/components/button/');
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

// Strips ANSI SGR escape codes (`\x1b[...m`) — needed because this
// script's own local development testing (always piped to a log file, a
// non-TTY) never once produced colorized output, so `parseResultFromOutput`
// shipped with a regex requiring a literal `|` delimiter around the
// project name (e.g. `✓ |unit (chromium)|`), which IS what Vitest emits
// on a plain/non-color stream. But GitHub Actions' runner makes Node think
// it's writing to a color-capable terminal, so Vitest emits ANSI
// background-color codes around "unit (chromium)" instead of literal `|`
// characters — a completely different line shape with no `|` at all. That
// mismatch meant `parseResultFromOutput` silently matched ZERO lines for
// the entire run in CI, every single time, regardless of how many files
// had actually passed — confirmed via PR #42, run 34389089773: 5 real
// files passed (visible in the raw log) but the wrapper still reported
// "no per-file test result ever observed" once the run stalled. Stripping
// ANSI codes first, and no longer requiring a literal `|` (allowing any
// mix of whitespace/`|` between the symbol and the project name instead),
// makes the same regex work for both the colorized and plain-text shapes.
function stripAnsi(str) {
  // eslint-disable-next-line no-control-regex -- ESC (0x1b) is the actual character being matched, not an accidental one
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function parseResultFromOutput(output) {
  const clean = stripAnsi(output);
  const lines = clean.split('\n');
  let passedFiles = 0;
  let failedFiles = 0;
  for (const line of lines) {
    if (/^\s*[✓✔][\s|]*?(unit|storybook)\s*\(chromium\)/.test(line)) {
      passedFiles += 1;
    } else if (
      /^\s*[✗✖❯xX][\s|]*?(unit|storybook)\s*\(chromium\)/.test(line) ||
      /^\s*FAIL[\s|]*?(unit|storybook)\s*\(chromium\)/.test(line)
    ) {
      failedFiles += 1;
    }
  }
  const importFailureMatches = clean.match(/^Error: Failed to import test file/gm) || [];
  failedFiles += importFailureMatches.length;

  const totalObserved = passedFiles + failedFiles;
  if (totalObserved === 0) return null;
  return { passedFiles, failedFiles, totalObserved };
}

/**
 * Distinguishes the known, confirmed-flaky shared-transport failure (P2
 * item 1 — a Vite dev-server fetch of the *shared* `.storybook/
 * vitest.setup.ts` failing, unrelated to any individual test file's own
 * content) from an ordinary per-file test/import failure. Only the former
 * is safe to blindly retry — retrying a real content bug would silently
 * paper over it, exactly the anti-pattern this whole phase exists to
 * prevent (Phase 14 §0: "NEVER optimize the metrics instead of the
 * quality"). The signature is specific and was directly observed 2 of 3
 * times this failure occurred in the same session (see
 * phase14-test-certification.md §7): "Failed to fetch dynamically
 * imported module" paired with a reference to the *shared* setup file
 * path, not any individual `.test.tsx`/`.stories.tsx` file.
 */
function isRetryableTransportFailure(output) {
  const hasFetchFailure = /Failed to fetch dynamically imported module/.test(output);
  const pointsAtSharedSetup = /vitest\.setup\.ts/.test(output);
  return hasFetchFailure && pointsAtSharedSetup;
}

/**
 * Kills the whole process GROUP the child belongs to, not just the one
 * direct child — see the module-level "PROCESS-TREE CLEANUP" doc comment
 * for why this is required (a plain `child.kill()` was confirmed, by hand,
 * to leave orphaned `node (vitest)`/`chrome-headless-shell` processes
 * running and their dev-server ports still open).
 */
function killProcessGroup(child) {
  if (child.pid == null) return;
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    // Group kill can fail if the group is already gone (e.g. the child
    // exited on its own between the watchdog firing and this call) — fall
    // back to a direct kill of just the one process as a last resort.
    try {
      child.kill('SIGKILL');
    } catch {
      /* already gone */
    }
  }
}

function runOnce(vitestArgs, expectedFiles) {
  return new Promise((resolve) => {
    console.log(`Running: pnpm exec vitest ${vitestArgs.join(' ')}`);
    const child = spawn('pnpm', ['exec', 'vitest', ...vitestArgs], {
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: false,
      detached: true, // own process group, so the whole tree can be killed together
    });

    let output = '';
    let lastOutputAt = Date.now();
    let settled = false;

    function captureAndForward(streamName) {
      return (chunk) => {
        output += chunk.toString();
        lastOutputAt = Date.now();
        process[streamName].write(chunk);
      };
    }
    child.stdout.on('data', captureAndForward('stdout'));
    child.stderr.on('data', captureAndForward('stderr'));

    function finish(exitCode, reason, kind = null) {
      if (settled) return;
      settled = true;
      clearInterval(watchdog);
      if (reason) console.log(`\n[run-vitest-safe] ${reason}`);
      resolve({ exitCode, output, kind });
    }

    child.on('exit', (code) => finish(code ?? 1, null));

    const startedAt = Date.now();
    const watchdog = setInterval(() => {
      const now = Date.now();
      const hitHardCeiling = now - startedAt >= HARD_CEILING_MS;
      const resultSoFar = parseResultFromOutput(output);
      // Before the first real result, allow a much longer idle window
      // (real browser-startup "prepare" time, observed up to 1000s+ under
      // load) — only the shorter, tight window applies once files are
      // actively flowing. See this script's own header/constant comments.
      const idleAllowance =
        resultSoFar === null ? PRE_FIRST_RESULT_IDLE_MS : POST_FIRST_RESULT_IDLE_MS;
      const hitIdleGrace = now - lastOutputAt >= idleAllowance;
      if (!hitHardCeiling && !hitIdleGrace) return;

      const result = resultSoFar;

      if (result === null) {
        killProcessGroup(child);
        finish(
          1,
          `Killed after ${Math.round((now - startedAt) / 1000)}s with no per-file test result ever observed — a genuine hang before any result was known (waited up to ${PRE_FIRST_RESULT_IDLE_MS / 1000}s of pure idle for browser-startup slowness before concluding this).`,
          'zero-result-hang',
        );
        return;
      }

      const runIncomplete = expectedFiles !== null && result.totalObserved < expectedFiles;
      if (runIncomplete && !hitHardCeiling) return; // keep waiting, might just be slow

      killProcessGroup(child);

      if (runIncomplete) {
        finish(
          1,
          `Killed after hitting the ${HARD_CEILING_MS / 1000}s hard ceiling with only ${result.totalObserved}/${expectedFiles} expected test files having reported a result (${result.failedFiles} of those failed). This run is INCOMPLETE, not a pass.`,
        );
        return;
      }

      const allPassed = result.failedFiles === 0;
      const countNote =
        expectedFiles !== null
          ? `${result.totalObserved}/${expectedFiles} expected test files reported`
          : `${result.totalObserved} test file(s) reported`;
      finish(
        allPassed ? 0 : 1,
        `${countNote} a real result (${result.failedFiles} failed), but the process produced no further output and stalled — the confirmed post-results hang. Force-terminated; exit code reflects the real, parsed per-file results.`,
      );
    }, POLL_MS);
  });
}

// Runs one vitest invocation to completion, retrying only on the known
// transport-flakiness signature (never on a real content failure). Shared
// by both the batched path and the no-project fallback path below.
async function runWithRetries(oneInvocationArgs, expectedFiles) {
  let attempt = 0;
  let transportAttempts = 0;
  let hangAttempts = 0;
  for (;;) {
    attempt += 1;
    const { exitCode, output, kind } = await runOnce(oneInvocationArgs, expectedFiles);

    if (exitCode === 0) return 0;

    if (transportAttempts < MAX_TRANSPORT_RETRIES && isRetryableTransportFailure(output)) {
      transportAttempts += 1;
      console.log(
        `\n[run-vitest-safe] Detected the known, confirmed-flaky shared-transport failure (Vite dev-server fetch of vitest.setup.ts) — not a real test-content failure. Retrying (attempt ${attempt + 1})...`,
      );
      continue;
    }

    // See MAX_ZERO_RESULT_HANG_RETRIES's own comment above for why this
    // specific failure kind (killed with literally zero per-file results,
    // not even a failure) can never be a real content bug and is therefore
    // as safe to retry as the transport-failure case above.
    if (hangAttempts < MAX_ZERO_RESULT_HANG_RETRIES && kind === 'zero-result-hang') {
      hangAttempts += 1;
      console.log(
        `\n[run-vitest-safe] Detected a zero-result hang (browser-startup "prepare" phase never completed, before any file could even fail) — not a real test-content failure. Retrying with a fresh process (attempt ${attempt + 1})...`,
      );
      continue;
    }

    if (attempt > 1) {
      console.log(
        `\n[run-vitest-safe] Failed after ${attempt} attempt(s), including ${transportAttempts} transport-flakiness retry(ies) and ${hangAttempts} zero-result-hang retry(ies). This is a real failure, not a known infra flake.`,
      );
    }
    return exitCode;
  }
}

async function main() {
  const projectFilters = extractProjects(vitestArgs);
  const pathScopes = extractPathScopes(vitestArgs);
  const extraFlags = extractExtraFlags(vitestArgs);

  if (projectFilters.length === 0) {
    // No `--project` given — can't reliably determine which files belong
    // to which project, so batching isn't possible here. Falls back to a
    // single, unbatched invocation (this repo's own scripts always pass an
    // explicit --project, so this path is a safety net, not the common
    // case).
    console.warn(
      '[run-vitest-safe] No --project filter given — cannot batch by file. Running as a single, unbatched invocation (weaker guarantee against the known degradation).',
    );
    process.exit(await runWithRetries(vitestArgs, null));
  }

  let overallFailed = false;

  for (const projectName of projectFilters) {
    const files = getMatchingFiles(projectName, pathScopes);

    if (files.length === 0) {
      console.warn(
        `[run-vitest-safe] [${projectName}] No matching files found via filesystem walk — running as a single, unbatched invocation (weaker guarantee).`,
      );
      const exitCode = await runWithRetries(
        ['run', '--project', projectName, ...extraFlags, ...pathScopes],
        null,
      );
      if (exitCode !== 0) overallFailed = true;
      continue;
    }

    // Button's own test files are each given a dedicated, single-file
    // batch, never grouped with any other file (including each other) — a
    // real, reproducible defect confirmed across 4 separate CI runs (PR
    // #42). Simply sorting them to the end (a batch of `Button.test.tsx` +
    // `Button.variants.test.tsx` together, as its own last batch) was NOT
    // enough: Button.test.tsx (asChild/Slot-heavy) then reliably completed
    // first in that batch, but Button.variants.test.tsx (simple,
    // `asChild`-free `it.each` over two variants) then hung with zero
    // results — the second file run in ANY process that had already
    // loaded Button.tsx's module once. Every other file in every other
    // batch (1-5 files each) has always completed reliably regardless of
    // position; only a file importing Button.tsx, run anywhere other than
    // alone as the sole file of a fresh process, has ever failed. Root
    // cause not fully understood (something about Button.tsx's specific
    // `Slot` usage and Vite/esbuild's module transform/caching within one
    // continuous vitest worker), but isolating each Button file to its own
    // process is a real, verified fix for the actual observed failure —
    // not a guess.
    const regularFiles = files.filter((f) => !isButtonFile(f));
    const isolatedFiles = files.filter(isButtonFile);
    const batches = [...chunk(regularFiles, BATCH_SIZE), ...isolatedFiles.map((f) => [f])];
    console.log(
      `[run-vitest-safe] [${projectName}] ${files.length} file(s) total → ${batches.length} batch(es) (up to ${BATCH_SIZE} files each, Button's own files isolated one per batch — see this script's own "BATCHING" header comment for why), each its own fresh vitest process.`,
    );

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `\n[run-vitest-safe] [${projectName}] batch ${i + 1}/${batches.length} (${batch.length} file(s)): ${batch.join(', ')}`,
      );
      const batchArgs = ['run', '--project', projectName, ...extraFlags, ...batch];
      const exitCode = await runWithRetries(batchArgs, batch.length);
      if (exitCode !== 0) {
        overallFailed = true;
        console.log(
          `[run-vitest-safe] [${projectName}] batch ${i + 1}/${batches.length} FAILED (exit code ${exitCode}).`,
        );
      }
    }
  }

  if (overallFailed) {
    console.log('\n[run-vitest-safe] One or more batches failed — see above for which.');
  }
  process.exit(overallFailed ? 1 : 0);
}

main();
