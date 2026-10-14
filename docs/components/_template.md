<!--
Component Specification Template.

This is the persisted, living counterpart to the ephemeral "Spec 宣言" shown
in chat during .claude/skills/sun-design-system/workflows/component-implement.md
Phase 3 (new components) or component-modify.md Phase 3 (changes to existing
ones). Copy this file to docs/components/<name>.md, fill in every section,
and keep it current — it is updated every time Workflow C or D touches the
component again, not written once and abandoned.

Do not invent sections. Do not skip a section because it feels redundant for
a simple component — write "N/A — <reason>" instead, so a reader can tell
"not applicable" apart from "not filled in yet".

See docs/architecture/component-development-system.md for the full rationale
behind every section below, and for the Quality Score rubric referenced in
§14.
-->

# `<ComponentName>` — Component Specification

## 1. Identity

- **Figma component name:** <exact name as it appears in Figma>
- **Figma file:** <FIGMA_FILE_KEY_* variable name, or "N/A — not Figma-sourced">
- **Figma node/component URL:** <link, if available>
- **Code name:** `<ComponentName>`
- **Package export:** `@sun-asterisk/nova/<subpath>` (and/or root)
- **Category:** Simple Component | Composite/Compound Component | Primitive wrapper (cite `docs/architecture/component-capability-matrix.md`'s own category vocabulary if this component was previously audited there)

## 2. Status

- **Lifecycle status:** Draft | Implemented | Verified | Certified | Production
- **Last verified:** <date> via `/test <ComponentName>`
- **Owner/last touched by:** Workflow C (new) | Workflow D (modify), <date>

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | | | |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| | | | | | §<N> |

Note inherited native/Radix props by reference (e.g. "extends `ComponentProps<'button'>`") rather than re-listing every one.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** <decision and why, citing `component-api-conventions.md` §8's part-count rule>
- **`asChild`:** <justification, citing §10, or "not applicable — no evidence of need">
- **Internal parts a consumer can realistically reach without forking:** <list>

## 6. State Matrix

Only include states that actually apply to this component (from: default, hover, active, focus, focus-visible, disabled, loading, error, selected, checked, indeterminate, open, closed, invalid, success, warning).

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| | | | | Radix data-attr / internal state / CSS pseudo-class | file:line or "none — gap" |

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| | | | `<Name>.styles.ts:N` | `<Variant>` story | file:line or "none — gap" |

Flag any arbitrary Tailwind value (`[...]`) here with its justification — per `component-implement.md`'s own rule, an arbitrary value is only acceptable when no token is a reasonable substitute, and it must carry an inline comment in `<Name>.styles.ts` explaining why.

## 8. Accessibility

Verified via real rendered DOM (Production certification's standard — source inspection alone does not satisfy this section).

- **Semantic element / role:**
- **Accessible name:**
- **Keyboard interactions:**
- **Focus management:** (ring spec, trap if applicable, restoration if applicable)
- **Disabled semantics:**
- **Screen reader behavior:**

## 9. Theming

- **Light/dark behavior:** <describe, and how it was verified — token parity alone is not sufficient per Production certification/11; a real rendered check is preferred>
- **Verification method used:**

## 10. Market Benchmark

Cite the relevant row(s) from `docs/architecture/market-benchmark.md`'s Market Capability Matrix. If Sun's API is deliberately simpler than a comparable library, state why — not "we didn't get to it."

## 11. Regression Matrix

Cross-reference any audit finding that applies to this component (search `docs/architecture/market-benchmark.md`, `remediation-matrix.md` and `component-capability-matrix.md` by component name) and its current test-coverage status.

| Finding | Source | Status | Regression test |
|---|---|---|---|

## 12. Examples

Realistic usage — not `Lorem ipsum`, not placeholder names. Show at least one accessibility-correct pattern (e.g. `aria-label` on an icon-only trigger).

## 13. Known Limitations

State them plainly. A limitation hidden here is a limitation a future consumer discovers the hard way.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| | | /15 | /15 | /15 | /15 | /10 | /10 | /5 | /10 | /5 | /100 | none / <list> | |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
