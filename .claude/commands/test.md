---
description: Quality orchestrator — analyzes, runs, and classifies the full production-quality test system
---

# Test (Quality Orchestrator)

This command is NOT a shortcut for `pnpm test`. It orchestrates the full quality pipeline, decides what actually needs to run for the given scope, runs it, and reports findings against the standing quality contract — the same contract this repo's own `docs/architecture/component-api-conventions.md`, `.claude/rules/design-foundation.md`, and `.claude/rules/accessibility.md` establish.

## Arguments

`$ARGUMENTS` selects scope:

- (empty) or a component name (e.g. `Button`, `DropdownMenu`) — deep-test one component and its direct dependents
- `package` — package/export/tree-shaking verification only
- `tokens` — token drift verification only
- `full` — the complete production-quality suite (equivalent to `pnpm test:full`, plus the analysis/classification steps below — not just the raw command)
- append `--fix` to allow automated remediation of trivial, non-architectural failures (formatting, missing `export`, a story missing a `play()` for an already-existing interactive affordance). Without `--fix`, this command NEVER edits code — see "Fix Policy" below.

## Prerequisites

- `pnpm install` has been run
- For browser-mode tests (`test:unit`, `test:storybook`): `pnpm exec playwright install --with-deps chromium` at least once
- Read `docs/architecture/component-api-conventions.md` and `CLAUDE.md` §22 (Component Quality Matrix) before the first run in a session — they define what "correct" means here, not this file

---

## Orchestration Steps

Follow this sequence; do not skip a step because it "seems fine" — that's exactly the assumption this command exists to stop making.

### 1. Inspect repository state

- `git status --short` — is there uncommitted work that changes the scope of what needs testing?
- If a component name was given, `git diff --stat -- src/components/<name>` — what actually changed since the last commit?

### 2. Load the relevant quality matrix

Read (only the parts relevant to scope, not the whole file every time):

- `CLAUDE.md` §21–§26 — the component development contract, quality matrix and verification rules
- `docs/architecture/component-api-conventions.md` — the 14 API conventions every component must follow
- `.claude/rules/design-foundation.md` and `.claude/rules/accessibility.md` — P0/P1/P2 usage rules
- If scope is a specific component: its own `.tsx`/`.styles.ts`/`.stories.tsx`/`.test.tsx` files

### 3. Determine expected behavior for this scope

Before running anything, state explicitly (in your own reasoning, and in the final report) what "passing" means for this scope: which conventions apply, which prior findings are regression-relevant, whether any deferred item touches this component (check `docs/architecture/remediation-matrix.md`'s Stop-Condition Log — a deferred item is NOT a new requirement; don't fail a component for not implementing something that was explicitly deferred pending approval).

### 4. Run the tests for this scope

| Scope | Commands |
|---|---|
| a component name | `pnpm exec vitest run --project unit src/components/<dir>` (if a `.test.tsx` exists), `pnpm exec vitest run --project storybook src/components/<dir>` **and** `pnpm exec vitest run --project storybook-dark src/components/<dir>` (dark mode is mandatory — see "Dark mode" below) |
| `package` | `pnpm build && pnpm test:package` |
| `tokens` | `pnpm test:tokens` |
| `foundation` | `pnpm build && pnpm test:foundation` — real-browser verification of the CSS-only foundation capabilities (global reduced-motion, `ThemeProvider`'s `color-scheme`) that have no other automated coverage; see `scripts/quality/verify-motion-and-theme.mjs` |
| `full` | `pnpm test:full` (chains typecheck → lint → api → unit → storybook → storybook-dark → tokens → build → build-storybook → package → foundation — see `package.json`) |
| empty | `pnpm typecheck && pnpm exec eslint src/components src/utils` plus whatever component(s) changed per step 1 |

Also run, when scope includes a component with type-contract fixtures relevant to it: `pnpm test:api`.

**Note on `test:unit`/`test:storybook`/`test` (the `full` scope's own unit+storybook steps)**: these route through `scripts/quality/run-vitest-safe.mjs`, not `vitest` directly (see `package.json`). This wrapper exists because the Vitest+Playwright-provider browser-mode pool has a confirmed, reproducible hang — every test file completes and prints its own result, then the process hangs indefinitely before Vitest's own summary line ever prints. The wrapper detects this via an idle-timeout against per-file result lines (not the aggregate summary), reports the real parsed pass/fail, and force-kills the whole process group (not just the immediate child — a plain kill leaves orphaned `chrome-headless-shell` processes behind). The scoped, single-component command shown above (`vitest run --project unit src/components/<dir>` directly) is unaffected by the *teardown* hang for a fast, already-passing scope, but can still hit it — if a scoped run seems to hang with no output, that's this same issue, not a new bug.

#### Dark mode (step 4 detail — mandatory for every component scope)

Full definition (4 layers, incl. the Figma-side check `pnpm figma:theme-check <fileKey> <nodeId>` that compares Figma's Light/Dark variable values with `scripts/global.css` and computes all-variant text contrast): `.claude/skills/sun-design-system/references/theme-verification.md`. This section covers the rendering layer that `/test` runs.

The `storybook-dark` Vitest project (`.storybook/vitest.setup.dark.ts`) runs **every story again with the global theme set to `dark`** (`data-theme="dark"` on `<html>`, canvas painted with `--color-sds-background-base`). Every `play()` and every addon-a11y axe scan — `a11y.test: 'error'`, so **color-contrast in dark fails the run** — must pass in both projects. A component result is not PASS unless both `storybook` and `storybook-dark` pass.

Rules for stories, enforced by this pass:
- Never hardcode a color in a story (inline `#666`, Tailwind palette `text-red-600`, `bg-[#…]`) — use semantic `-sds-` tokens.
- Never assert a hardcoded color in a `play()`. Compare against `tokenColor(element, '--color-sds-…')` from `.storybook/tokenColor.ts`, which resolves the token inside the element's own theme region / portal.
- A `ThemeProvider scoped` / `data-theme` region paints no background: give it one (`bg-sds-background-base`) or its text sits on the outer theme's background.
- A story whose assertions are inherently light-specific may opt out with `tags: ['light-only']` **plus a comment explaining why**. Use it as a last resort.

### 5. Identify missing coverage

For the scoped component(s), check — don't assume — each of:

- Does `<Name>.test.tsx` exist and clear `component-api-conventions.md` §16's full bar for logic not reasonably observable through a Storybook `play()` (state derivation, effect cleanup, ref forwarding, controlled/uncontrolled transitions, callback firing, boundary inputs) — NOT a token happy-path test? See `src/components/switch/Switch.test.tsx` and `src/components/textareaField/TextareaField.test.tsx` for the reference shape, and apply §16's litmus test ("is there a realistic logic bug this file would NOT catch?").
- Does every meaningfully-different story state have a `play()`, and does the component's Storybook coverage clear `component-api-conventions.md` §17's full bar — every documented keyboard interaction exercised with real key presses, focus-visible rings asserted via real `Tab` + `getComputedStyle()` (never a screenshot or source read alone), every previously-fixed regression given a dedicated regression `play()`, and at least one popover/menu/dialog-opening story left open at the end so axe can scan the open content? (Not every story needs a `play()` — a purely visual variant showcase doesn't. Apply §17's litmus test before deciding coverage is sufficient.)
- Does the story file itself clear §18's documentation-completeness bar — a substantive `parameters.docs.description.component`, `argTypes` covering every meaningfully-controllable prop (description, control, `table.type.summary`, `table.defaultValue.summary`), a JSDoc comment above every story, and the canonical baseline set (Default/every variant/every size/Disabled/Loading/Error/edge cases/customization example, each present or consciously judged not applicable)? Apply §18's litmus test: could a new team member understand this component using only the rendered docs page, never the source?
- Does `test/api/<Name>.test-d.tsx` exist for this component, and does it clear `component-api-conventions.md` §15's full bar — NOT a partial/spot-check fixture? One file per component (§15.1, `test/api/<ComponentName>.test-d.tsx` matching `src/components/<name>/`, never appended to a different component's file), and every item in §15.2's checklist: every own prop individually asserted, every union/enum checked exhaustively (not sampled), required-vs-optional asserted precisely, every removed/narrowed native prop asserted, every ref-forwarding export checked, compound APIs given a realistic full composition (multiple shapes where more than one is valid), every `classNames`/slot key checked, every separately-exported type checked directly, and a commented invalid-usage example under every discriminant enum prop. Apply §15.2's litmus test ("is there a realistic breaking change this file would NOT catch?") — if yes, report it as a coverage gap, don't wave it through because *some* fixture file exists.
- Is the component's barrel (`src/components/<name>/index.ts`) actually exporting everything Storybook/tests treat as public? (Don't assume a component's export surface is complete just because it compiles internally — a documented, tested component missing from its own barrel is a real bug class.)

### 6. Compare against prior findings

Grep `docs/architecture/remediation-matrix.md` and `docs/architecture/market-benchmark.md` for the component's name. Any Critical/High finding for it must have a corresponding regression test (unit or story `play()`). If one doesn't, that's a coverage gap to report — not something to silently add without flagging it first (see Fix Policy).

### 7. Classify results

Use exactly these labels, per check:

```
PASS              — verified, matches the documented contract
PASS WITH GAP     — works, but coverage/verification is incomplete (say exactly what's missing)
FAIL              — contract violation or regression (cite the specific rule/finding it violates)
DEFERRED          — intentionally not required right now (cite the specific Stop-Condition Log entry)
NOT APPLICABLE    — the check doesn't apply to this component/scope (say why)
```

### 8. Report

Produce a structured report (not a wall of raw command output):

```
## /test <scope> report

**Verdict:** PASS | PASS WITH GAP | FAIL

### Ran
- <commands actually executed>

### Results
| Check | Result | Note |
|---|---|---|
...

### Coverage gaps found
- ...

### Regressions found (if any)
- <what>, <which rule/finding it violates>, <file:line>

### Recommended fix (if FAIL or gap found)
- <specific, minimal fix — not "refactor this component">
```

---

## Fix Policy

Default behavior is **TEST → ANALYZE → REPORT**, never **TEST → MODIFY CODE**.

If a failure is found without `--fix`: explain it, locate the root cause, recommend a specific fix, and stop. Do not edit files.

With `--fix`, you may make ONLY these categories of change automatically:

- Formatting (`eslint --fix` / Prettier) on files already in scope
- A missing barrel export for a component that is already implemented, documented in Storybook, and referenced elsewhere as public (the `Snackbar` class of bug) — but only when there's no ambiguity about intent
- Adding a `play()` to a story that already demonstrates an interactive affordance but has no assertion (not inventing new stories or new interactions)

Even with `--fix`, NEVER automatically:

- Change a component's public prop types, defaults, or variant values
- Resolve a Stop-Condition Log / deferred item
- Add a new dependency
- Rewrite a component's implementation to satisfy a test you also just wrote
- Touch anything under `explorer/` or `docs/` as a side effect of a component-scoped fix

If a fix would fall into one of those categories, report it as a recommended fix and stop — same as without `--fix`.

---

## Usage

```bash
# Deep-test one component
/test Button

# Package/export/tree-shaking verification only
/test package

# Token drift check only
/test tokens

# Full production-quality suite
/test full

# Full suite, auto-fixing trivial issues (formatting, missing exports)
/test full --fix

```
