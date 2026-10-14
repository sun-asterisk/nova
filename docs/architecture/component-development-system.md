# Sun Design System — Component Development System

**This is the canonical development standard.** It documents how a request to build or change a component moves from intake to production, and where every rule that governs that movement actually lives. It is a coordination document, not a rulebook competing with the documents it references — where a rule is already written elsewhere (`component-api-conventions.md`, `.claude/rules/accessibility.md`, `.claude/rules/design-foundation.md`), this document cites it by section number rather than restating it.

Built as an *extension* of existing, real, Sun-specific tooling — not a replacement. See §8 for what was deliberately not rebuilt and why.

---

## 1. Component Lifecycle

```
Request: "/component <Name>" [--figma <url>]
        ↓
┌─────────────────────────────────────────────┐
│ STEP 0 — CLASSIFY                             │
│ Search src/components/, figma-sync.config's   │
│ componentMap, and docs/architecture/*.md for  │
│ an exact match, alias, or overlapping         │
│ component. Output classification A-E (§2).   │
└─────────────────────────────────────────────┘
        ↓                    ↓                      ↓
   A/D: exists,         B/C: exists but       E: truly new /
   matches or           incomplete/wrong      Figma has it,
   compose instead    →  → Workflow D          code doesn't
   → report, stop        (component-modify)  → Workflow C
                                                 (component-implement,
                                                  unchanged core,
                                                  Component workflow additions
                                                  only)
        ↓                                              ↓
        └──────────────────────┬───────────────────────┘
                                ↓
                  Spec written/updated at
                  docs/components/<name>.md
                                ↓
                  Implementation
                                ↓
                  /test <Name> — real quality gate
                                ↓
                  Quality score + status level
                                ↓
                  Final report (§7)
```

Entry point: `.claude/commands/component.md` (`/component <Name>`). It performs Step 0 by direct repository search — never by trusting the user's own description of whether something "exists" — then hands off to whichever workflow file actually applies. It does not contain component-building logic of its own; if implementation guidance starts accumulating inside `component.md`, that's a signal to move it into the workflow file instead.

## 2. Existing-Component Detection (Classification A-E)

| Class | Meaning | What happens |
|---|---|---|
| **A** | Exists and matches the request | Report immediately. Stop. |
| **B** | Exists but incomplete | → Workflow D (`component-modify.md`) |
| **C** | Exists but architecturally wrong | Report the concern, propose a refactor, **do not proceed without explicit approval** — architectural rewrites are a Stop-Condition class decision (CLAUDE.md §38) |
| **D** | A different, similar component already covers the need | Report the composition/extension option. Stop unless the user confirms a genuinely new component is still wanted |
| **E** | Truly new | → Workflow C (`component-implement.md`) |

Detection method: search `src/components/*` directory names, `figma-sync.config.json`'s `componentMap` (both keys and values — a Figma name and a code name can differ), and `docs/architecture/component-capability-matrix.md`'s section headers for functional overlap (e.g. a request for "Toast" should surface `Snackbar`).

## 3. Workflows

| Workflow | File | Scope | Status |
|---|---|---|---|
| A. design-system-update | `.claude/skills/sun-design-system/workflows/design-system-update.md` | Whole-system token/theme changes | Pre-existing, unchanged |
| B. figma-component-create | `.claude/skills/sun-design-system/workflows/figma-component-create.md` | New component set in Figma | Pre-existing, unchanged |
| C. component-implement | `.claude/skills/sun-design-system/workflows/component-implement.md` | Brand-new React component (classification E) | Pre-existing core (Phase 1-6), extended in Component workflow — see §4 |
| D. component-modify | `.claude/skills/sun-design-system/workflows/component-modify.md` | Existing component, non-Figma-driven change (classification B) | **New in Component workflow** |
| (unnamed) Figma Sync Workflow | `CLAUDE.md`'s own section | Figma changed, code needs to catch up (drift correction) | Pre-existing, unchanged — not part of the `sun-design-system` skill |

## 4. What Component workflow Added to `component-implement.md`

Additive only — no existing phase content was removed:

- **Phase 1.0** (new, before the existing Phase 1.1 Figma-scope check): the existing-component search from §2, so this workflow is never entered for anything but classification E.
- **Phase 3 extensions**: an API-design sub-section (compound-vs-`classNames` decision, `asChild` justification, both citing `component-api-conventions.md` by section number), a controlled/uncontrolled **State Matrix** (§5 below), a **Market Benchmark** cross-check against `market-benchmark.md`, and a **Figma Traceability** table (superset of the pre-existing Token Resolution table). The approved spec is now **persisted** to `docs/components/<name>.md` instead of only being shown in chat.
- **Logic audit** (new): after the pre-existing Self-review checklist passes, run `/test <Name>` for real evidence — the pre-existing checklist only ever covered typecheck/lint/visual Storybook rendering, never actual unit/interaction/API-contract/package/token gates.
- **Package audit extension**: the completion report gains a Quality Score, Status level, and confirmation that the spec file was written.

## 5. State Matrix

Every component with meaningful interaction/value state gets one, scoped to only the states that actually apply from: `default, hover, active, focus, focus-visible, disabled, loading, error, selected, checked, indeterminate, open, closed, invalid, success, warning`. Format:

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|

Prefer Radix's own `data-state`/`data-disabled` attributes when Radix already provides the state (per `component-api-conventions.md` §9's own guidance and the `Switch` regression this exact principle would have caught earlier). Do not duplicate state Radix already tracks.

## 6. Quality Matrix

### 6.1 Score (informational — never gates on its own)

| Category | Weight | Assessed against |
|---|---:|---|
| API | 15 | `component-api-conventions.md`'s 14 sections |
| Composition | 15 | Same doc, §8 (className/slots) + §13 (compound components) |
| Accessibility | 15 | `.claude/rules/accessibility.md`, verified via real rendered DOM — source inspection alone does not count (Production certification's standard) |
| Logic | 15 | State/effects/refs/controlled-uncontrolled/race-condition correctness (Logic audit-class findings) |
| Design/token fidelity | 10 | `.claude/rules/design-foundation.md`, the component's Figma Traceability table |
| Theming | 10 | `pnpm test:tokens` plus a real rendered light/dark check (Production certification's method — token parity alone is not sufficient) |
| Storybook | 5 | Real `play()` assertions, not interaction-without-assertion (Quality system's explicit anti-pattern) |
| Testing | 10 | Real `/test <Name>` results |
| Package/consumer | 5 | The subset of `/test package` relevant to this component (subpath resolves, tree-shakes cleanly) |

**Mandatory override:** any Critical/P0 finding is a FAIL regardless of the numeric total. The score is a reporting summary; it never overrides a Critical finding, exactly as Production certification's certification never let a high pass-count paper over a Critical defect.

This is a rubric for a human/agent's evidence-based assessment — deliberately not an automated point-counting script. "Composition quality" and similar categories require judgment against the cited rules, not a mechanically computable metric.

### 6.2 Status Levels

```
Draft → Implemented → Verified → Certified → Production
```

- **Draft** — spec exists at `docs/components/<name>.md`, no source yet.
- **Implemented** — source exists.
- **Verified** — `/test <Name>` has actually been run and passes.
- **Certified** — every applicable quality-matrix category passes, zero P0 findings.
- **Production** — Certified, plus a real package/consumer check per Production certification's method (packed tarball inspected, or the relevant `/test package` subset run against it).

Recorded in the component's own spec file (§14 of `docs/components/_template.md`) and updated every time Workflow C or D touches the component — never asserted without the evidence that justifies it.

## 7. Final Report Shape

Produced by `/component` after the routed workflow completes:

```
## /component <Name> report

**Classification:** A/B/C/D/E — <one-line reason>
**Workflow used:** component-implement.md | component-modify.md | Figma Sync Workflow | (stopped — no action needed)
**Spec:** docs/components/<name>.md (created | updated | not applicable)
**Status:** Draft | Implemented | Verified | Certified | Production
**Quality score:** NN/100 (category breakdown)
**Critical/P0 findings:** none | <list>
**/test results:** <real pass/fail counts>
**Market benchmark:** <accepted gap + reason, or "no gap identified">
**Next steps:** <if not yet Production>
```

## 8. What Was Deliberately Not Rebuilt

Two things this discovery phase found and explicitly chose not to build on:

1. **A separate generated component registry (a `ds-registry.json`-style file).** Sun's real files (`src/components/*`, `component-api-conventions.md`, `figma-sync.config.json`) already are the registry. A derived, cached, second copy of the same information is the generic-component-factory anti-pattern (CLAUDE.md §31), and it drifts out of sync with the real files.
2. **An automated numeric quality-scoring script.** See §6.1 — the rubric is a structure for judgment, not a metric a script computes.

Also not introduced, per the brief's own explicit list, because no evidence in this 17-component library justified them: a universal slot system, a custom state-machine library, a custom accessibility framework, a custom styling engine, an `sx`-style prop.

## 9. Approval Gates

Inherited, not reinvented, from the repository's established Stop-Condition discipline (CLAUDE.md §38):

- Any public API, behavior, or export change → explicit approval, never silent (`docs/architecture/remediation-matrix.md`'s Stop-Condition Log is the precedent).
- Any classification-C outcome (exists but architecturally wrong) → propose, don't implement, until approved.
- Any Workflow D change with `Breaking change? yes` in its Phase 3 spec → same discipline.

## 10. Security

Figma MCP calls always delegate through the existing `skillNames: "figma-use"` sub-agent convention already established in `SKILL.md` — never called directly by a senior/orchestrating agent, and never printing token values. Inherited unchanged; verified clean in Production certification (`.env.example`, `.npmrc` conventions).

## 11. Foundation Capabilities Every Component Author Must Know

The foundation capability audit extracted a small, deliberately-not-growing set of shared infrastructure. A new component MUST use these rather than reinventing them — each one exists specifically because at least one earlier component already reinvented it incorrectly:

- **Focus ring** — import `FOCUS_RING_OFFSET_2`/`FOCUS_RING_OFFSET_3` from `src/utils/focusRing.ts` into any `.styles.ts` file, never hand-type the Tailwind string. See `.claude/rules/design-foundation.md` §5.1 for which offset to use and the two documented structural exceptions (`Tabs`, `DropdownMenu`'s menu-item family).
- **Reduced motion** — inherited automatically and globally from `src/styles.css` for any CSS `animation` (not `transition`) the moment a new component uses one. Do not add a per-component `motion-reduce:animate-none` class as the primary mechanism — see `.claude/rules/design-foundation.md` §5.4.
- **Overlay portal container** — any component rendering through a Radix `Portal` (a new Dialog/Popover/Menu-family primitive) must accept and forward a `container` prop to that Portal, matching `Modal`/`DropdownMenu`/`Tooltip`/`DatePickerPopover`'s existing shape exactly (`ComponentProps<typeof XPrimitive.Portal>['container']`). Needed so `ThemeProvider`'s `scoped` mode can redirect portaled content into the scoped subtree — see `docs/architecture/component-api-conventions.md` §9.
- **`cn()`** — internal usage (`import { cn } from '@/utils'`) is how every component composes classes; this is unchanged. `cn` is also the library's one deliberate public export (`./cn` subpath) for consumers building their own components on Sun's tokens — do not add a second, differently-named className utility.
- **`useFieldIds()`** — internal-only (`@/utils`), for components with a labeled-field + optional description/error shape (see `TextField`/`TextareaField`). Do not add it to any public prop type or re-export it from a component's own barrel.
- **`ThemeProvider`'s `color-scheme`** — automatic; a new component needs no code for this. Native browser UI (scrollbars, form-control chrome) already matches whatever `data-theme` is active.

### 11.1 Field/validation wiring contract (Foundation capability implementation)

If a new component participates in the field/validation system, it MUST use one of these two
established mechanisms — never invent its own id-generation or `aria-*` wiring scheme:

1. **Field-owning components** (a component that renders its own `<label>`, description, and
   error text internally — the `TextField`/`TextareaField` shape): use `useFieldIds()` for
   `fieldId`/`descriptionId`/`errorId`/`describedBy` generation, exactly as those two
   components do. This is the only legitimate consumer of `useFieldIds()`.
2. **Bare-primitive components** (a component that does NOT own label/description/error
   rendering — the `Checkbox`/`RadioGroupItem`/`Switch` shape, where the consumer supplies an
   external `<label htmlFor>` sibling): do **not** pull in `useFieldIds()` — it generates ids
   for a label/description/error triad the component doesn't render, so there's nothing for
   it to wire. Instead:
   - If the component already has a `variant`/error-status concept (`variant: 'error'` on
     `Checkbox`/`RadioGroupItem`, pending the deferred unification noted in
     `component-api-conventions.md` §3), derive `aria-invalid` from it internally — one line,
     no new prop, consumer-supplied `aria-invalid` still wins since it spreads after (see
     `Checkbox.tsx`/`RadioGroup.tsx`'s `RadioGroupItem` for the reference implementation, added
     Foundation capability implementation).
   - If the component has no error-status concept at all (`Switch`, verified Foundation capability implementation — no
     Figma error visual exists for it), add nothing speculatively. Confirm the absence, don't
     invent one "for consistency" with Checkbox/RadioGroup.
   - Label association for a bare-primitive component is already fully solved by native HTML
     (`id`/`htmlFor`) with zero Sun-side code — do not add id-generation to "help" this case.
3. **Group-level accessible names** (`RadioGroup`'s `<fieldset>`/`<legend>` requirement,
   accessibility.md §7.6): this is a native-HTML wrapping pattern the *consumer* applies
   around the component, not a prop the component exposes — verified Foundation capability implementation that Radix's
   `RadioGroupPrimitive.Root` (`role="radiogroup"`) needs no Sun code change to support being
   wrapped in a `<fieldset>`. Document the pattern in the component's own Storybook (see
   `RadioGroup.stories.tsx`'s `AccessibleFormFieldset`), don't bake a `legend` prop into the
   component unless a real need for one is demonstrated.

Do not default to "extend `useFieldIds()` to every form-adjacent component" without first
checking which of these three shapes actually applies — Foundation capability implementation originally scoped as a
`useFieldIds()` extension to `Checkbox`/`RadioGroup`/`Switch`, and on independent
re-verification against the real source, none of the three needed it.

**What NOT to build**, still current (§8's own list plus Foundation capability audit's `useDisclosure`/generic-DOM-hook/`VisuallyHidden`/outside-click/second-composition-model rejections): do not introduce a new hook, provider, or component-external utility to solve a problem a single new component has, unless it already has 2+ real consumers across this library and clears the "why does this need to exist" test in that audit's §5. When in doubt, keep the logic component-local and flag it in the component's own spec rather than generalizing speculatively.
