# Figma Code Connect Rules

These rules govern every `src/components/<name>/<Name>.figma.ts` mapping file. Code Connect is the
**code → Figma** direction (the reverse of `figma-sync`): it controls what Dev Mode and the Figma
MCP (`get_design_context`) hand a designer/consumer as "the real code" for a component instance. A
wrong mapping here doesn't just look wrong in this repo — it ships broken or inaccessible code
directly into someone else's product via copy-paste, often silently (TypeScript- and lint-clean).

Severity follows the same P0/P1/P2 convention as `.claude/rules/accessibility.md` and
`.claude/rules/design-foundation.md`. This file is the durable correctness contract, not a how-to
(commands: `pnpm run code-connect:check`, `code-connect:publish`, `typecheck:figma`).

---

## 1. Format & Source of Truth

| Criterion | Rule | Severity |
|---|---|---|
| **Parserless template only** | Every mapping is `.figma.ts` + a default-exported object using `figma.code` — never `.figma.tsx` + `figma.connect()` (the parser format). Mixing formats in one repo is unsupported | P0 |
| **Canonical URL, never hand-edited** | The `url=` comment and any Figma URL inside a `.figma.ts` always points at the canonical Nova Figma file (`fSzxt8wKkXsn8fmxkPBUr2`). Publishing to a duplicated (white-label) file happens *only* via `figma.config.json`'s `documentUrlSubstitutions` at publish time (`scripts/code-connect-publish.mjs`, which reads `FIGMA_FILE_KEY` from `.env`) — never by rewriting the URL by hand | P0 |
| **The "node IDs survive duplication" assumption must be verified against the file actually in use** | Substitution is only valid between files that are genuine duplicates of each other (duplicating a Figma file preserves node IDs; an independently built file does not). A mapping can "pass" against an unrelated file by node-ID coincidence while others fail with `node not found in file`. **Before trusting the substitution for a given file, run `pnpm run code-connect:check` against the `FIGMA_FILE_KEY` in `.env` and treat every validation failure as evidence the file is not a true duplicate** | P0 |
| **Generate from live Figma data, not the sync snapshot** | Build a new mapping from `get_code_connect_suggestions` → `get_context_for_code_connect`, not from `.figma-sync/snapshots/latest.json` — the snapshot omits `INSTANCE_SWAP` properties and will produce an incomplete mapping | P1 |

## 2. Mapping Target Selection

| Criterion | Rule | Severity |
|---|---|---|
| **Which Figma node to map is a deliberate, documented decision, not a default** | A component can have a top-level frame (e.g. the whole `DropdownMenu`) and nested sub-parts (e.g. its `Menu Item`). Mapping only the nested part (as `DropdownMenu.figma.ts` does today, deliberately, per its own header comment) means selecting the *outer* frame in Dev Mode returns no Code Connect result at all. State explicitly in the `.figma.ts` header comment which node level was chosen and why, so a reader doesn't have to guess whether the top-level frame was forgotten or intentionally skipped | P1 |

## 3. Property Mapping Correctness

| Criterion | Rule | Severity |
|---|---|---|
| **`getEnum` must enumerate every Figma value** | List every variant value Figma actually defines for that property, not just the ones exercised by today's designs — an unmapped value silently resolves to `undefined` in the generated code, with no error | P0 |
| **Never invent a prop** | A Figma property with no corresponding real component prop is omitted from the mapping entirely, never approximated with the "closest" existing prop | P0 |
| **Exact name/value match, including Figma's own typos** | Property names and enum values must match Figma verbatim. Where Figma has a misspelling (e.g. Checkbox's `State = "Desabled"`), the `.figma.ts` matches the misspelling and documents it — see §10 for the running list. If Figma is later corrected, the `.figma.ts` must be fixed in the same change | P1 |
| **Guard every conditionally-present field before interpolating it — never bare `${x}` where `x` can be `undefined`** | A Figma value that only exists when a toggle/boolean is on (a `Label`/`Title` string, a `getInstanceSwap`/`findInstance` result) is `undefined` the rest of the time. Interpolating it unconditionally into the `figma.code` template risks the literal string `"undefined"` landing in the generated snippet — Figma's own docs for `figma.code` demonstrate this scenario as `` figma.code`<MyExample/>${showIcon ? iconSnippet : null}` ``, i.e. an explicit ternary guard. Always guard with a conditional (ternary / `&&` / omit-the-key pattern), as `Snackbar.figma.ts` does for `title`/`closable`/`duration` and `Button`/`DropdownMenu`/`Tabs`/`Modal` do for their optional icon, badge and button snippets (`${x ? x : ''}`). For a required identity prop (e.g. `RadioGroup.figma.ts`'s `value`), use a value that is always present (the `Label text` TEXT property) with a literal fallback (`'option'`) — in-group uniqueness remains the consumer's responsibility | P0 |
| **A boolean shorthand may only omit the `false` branch if the component's real default is `false`** | Writing `cond ? ' propName' : ''` (or the object-key equivalent) means "when `cond` is false, say nothing about this prop" — which is only correct if leaving the prop unset reproduces what Figma shows. Check the actual default in the component/hook source before doing this. Example: `ModalHeader`'s `showCloseButton` and Snackbar's `closable` default to `true`, so `Modal.figma.ts` emits `showCloseButton={false}` and `Snackbar.figma.ts` emits `closable: false` when the Figma toggle is OFF, and omit the prop when ON | P0 |
| **Map a Figma state to the prop with the same real rendering behavior, not the similarly-named one** | Verify against the component's actual conditional render logic, not naming similarity. Example: in Figma's `Error` state, `TextField.figma.ts`/`TextareaField.figma.ts` emit the `Support Text Label` value as `error="…"` (which drives `aria-invalid`, `aria-describedby` → error id, and the red icon/text), not as `supportText` — `supportText` renders plain secondary text with no `aria-invalid`, so mapping to it would silently drop the error affordance (`.claude/rules/accessibility.md` §4.3, "not color alone"). Every other state maps it to `supportText` | P0 |

## 4. State Handling

| Criterion | Rule | Severity |
|---|---|---|
| **CSS-pseudo-class states are never passed as props** | If a Figma "State" value (`Hover`, `Focus`, `Active`) is implemented purely via a CSS pseudo-class in the component (not a React prop), it is not mapped to anything — only a state that's genuinely prop-driven (typically `Disabled`) is mapped | P0 |

## 5. Icon / Nested Instance Resolution

| Criterion | Rule | Severity |
|---|---|---|
| **Resolve nested instances dynamically** | An icon or other nested component instance is resolved via `getInstanceSwap()`/`findInstance()` + `executeTemplate()` at generation time — never hardcoded from a guessed layer name (e.g. assuming a layer named "Add" means `<MdAdd />`) | P0 |

## 6. Compound Components & Imports

| Criterion | Rule | Severity |
|---|---|---|
| **`imports` must list every component the generated `example` actually references, verified by reading the generated output, not assumed** | A compound component's example (e.g. Modal's `Modal`/`ModalContent`/`ModalHeader`/`ModalTitle`/`ModalBody`/`ModalFooter`) can silently omit a sub-import if the mapping is extended later (e.g. a new conditional block introducing another sub-component) without re-checking `imports`. Re-verify the full `imports` array against the current `example` template every time either changes | P1 |

## 7. Build Isolation

| Criterion | Rule | Severity |
|---|---|---|
| **`*.figma.ts` never ships in `dist/`** | Must stay excluded from `tsconfig.app.json`, `tsconfig.build.json`, and `vite.config.ts`'s `vite-plugin-dts` config. Any future change to these build configs must re-verify the exclusion still holds (check `dist/` after a build for stray `.figma.js`/`.d.ts` output) | P0 |

## 8. Publish Safety

| Criterion | Rule | Severity |
|---|---|---|
| **A manual `pnpm run code-connect:publish` requires explicit approval before running** | Unlike `code-connect:check` (read-only against Figma), `publish` writes to the target Figma file's shared team library and is visible to every consumer's Dev Mode immediately. Treat it the same as any other action with broad, hard-to-reverse blast radius: confirm with the user/team before running manually, never as a routine part of finishing a `.figma.ts` change | P0 |
| **CI auto-publishes changed mappings on merge — review a `.figma.ts` diff in a PR with that in mind** | `.github/workflows/code-connect-deploy.yml` publishes every `.figma.ts` that changed in a push to the default branch, automatically, with no additional human confirmation at publish time. Merging a PR that touches a mapped `.figma.ts` **is** the approval — review it with the same rigor as any other change to a shared system. (The npm package itself is deliberately *not* auto-published — publishing the library is a manual step, a separate concern from Code Connect) | P0 |
| **Never publish multiple files in one CLI call when their validity is unknown — one bad file blocks every file in that call** | `figma connect publish -f A B` (and therefore `code-connect-publish.mjs -f A B`) is all-or-nothing: if any one file fails Figma-side validation, the process exits before uploading *anything*, including files that would have validated fine on their own. `code-connect-deploy.yml` works around this by invoking the publish script once per changed file, in a loop, so one broken mapping can never block an unrelated, valid one in the same merge. Do the same for any manual multi-file publish | P0 |

## 9. Keeping Mappings in Sync with Component Changes

| Criterion | Rule | Severity |
|---|---|---|
| **A prop/variant change on a mapped component requires reviewing its `.figma.ts` in the same change** | `pnpm run code-connect:build` only catches a mapping that fails to *parse or typecheck*; it does not catch a mapping that still typechecks but now describes stale/wrong behavior (the §3 bug classes). Whoever changes a mapped component's public props/variants (e.g. via `.claude/skills/sun-design-system/workflows/component-modify.md`) must check whether the corresponding `.figma.ts` still describes real behavior, not rely on CI alone | P1 |

## 10. Known Figma-side spelling quirks

Kept here, not just in the individual `.figma.ts` comment, so a repo-wide Figma correction pass can find every affected mapping in one place.

| Component | Figma value as written | Correct spelling | `.figma.ts` |
|---|---|---|---|
| Checkbox | `State = "Desabled"` | `Disabled` | `src/components/checkbox/Checkbox.figma.ts` |

## 11. Verification Checklist

Run for every new or changed `.figma.ts`, in order:

1. `pnpm run typecheck:figma`
2. `pnpm run lint:fix`
3. `pnpm run code-connect:build` (typecheck + dry-run parse against Figma; this is also the intended CI gate — see §12. A `node not found in file` failure may mean the target file is not a true duplicate — check §1 before assuming the mapping is wrong)
4. **Manually** compare the generated `example` against the real component's actual conditional
   rendering for every optional/boolean/enum field. Steps 1-3 are TypeScript-, lint-, and
   Figma-node-existence-based and will NOT catch any of the §3 bug classes (undefined-interpolation,
   wrong boolean default, wrong prop mapping) — they compile, lint, and validate clean by
   construction. This step is the only defense against them until/unless a stronger automated
   check exists.
5. If `imports` changed or the `example` template gained/lost a referenced sub-component, re-verify §6.

## 12. CI

Two separate mechanisms — do not conflate them:

1. **PR validation gate** (`pnpm run code-connect:build`) — catches a mapping that fails to parse,
   fails to typecheck, or references a Figma property that no longer exists. It is not wired into CI
   by default; run it locally (§11) for every changed mapping. See §11 item 4: it does not catch the
   §3 correctness bugs.
2. **Auto-publish on merge** (`.github/workflows/code-connect-deploy.yml`, on push to the default
   branch) — publishes only the `.figma.ts` files that actually changed in that push, each in its own
   isolated CLI call (§8). Requires `FIGMA_ACCESS_TOKEN` (secret) and `FIGMA_FILE_KEY` (variable).

This is intentionally **not** mirrored for the npm package itself — publishing the library is a
manual step, a separate decision with a different automation policy.

Neither CI mechanism above catches the §3 correctness bugs (undefined-interpolation, wrong boolean
default, wrong prop mapping) — only §11 item 4's manual comparison does.

## 13. Scoring

When auditing a `.figma.ts` mapping (new, changed, or as part of a periodic sweep), score each
category 0–5:

| Score | Meaning |
|-------|---------|
| 5 | Fully compliant, no issues |
| 4 | Minor issues (P2 only) |
| 3 | Some issues (P1, no P0) |
| 2 | Significant issues (1–2 P0) |
| 1 | Major issues (3+ P0) |
| 0 | Mapping is absent, or so wrong it misrepresents the component entirely |

**Categories:**
1. Format, source of truth & mapping-target selection (§1–2) — 5 points
2. Property mapping correctness (§3–4) — 5 points
3. Icon resolution, compound-component imports & build isolation (§5–7) — 5 points
4. Process: publish safety & sync-on-change (§8–9) — 5 points

**Total: X/20**

**Verdicts:**
- **18–20**: COMPLIANT
- **14–17**: MINOR ISSUES — fix before publishing
- **10–13**: TO FIX — multiple correctness/process gaps
- **0–9**: NOT READY — do not publish
