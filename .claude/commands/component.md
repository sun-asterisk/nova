---

## description: Production-grade component development orchestrator — discover, reconcile Figma/code/spec, design, implement, verify, and certify components without speculative architecture

# `/component` — Production Component Development Orchestrator

`/component` is the **single authoritative entry point** for creating, synchronizing, or modifying Sun Design System components.

It is NOT a component factory and MUST NOT contain implementation recipes itself.

Its responsibility is to orchestrate the complete lifecycle:

```text
Request
  ↓
Repository Discovery
  ↓
Existing Component / Figma / Documentation Reconciliation
  ↓
Classification
  ↓
Evidence Collection
  ↓
Architecture & Capability Review
  ↓
Component Specification
  ↓
Approval / Stop Conditions
  ↓
Implementation Workflow
  ↓
Documentation
  ↓
/test
  ↓
Mutation / Regression Verification
  ↓
Package / Consumer Verification
  ↓
Quality Certification
  ↓
Structured Report
```

The goal is not "make the component work."

The goal is:

> **Make the component correct, accessible, composable, documented, testable, package-safe, Figma-consistent, and maintainable under the repository's quality bar (logic, package, market, quality-system, certification, repository-architecture and foundation rules — sections 17–23 below).**

---

# 1. Arguments

`$ARGUMENTS` supports:

```text
/component <Name>
/component <Name> --figma <url>
/component <Name> --modify
/component <Name> --sync
/component <Name> --audit
/component <Name> --spec
/component <Name> --dry-run
```

## `<Name>`

Normal component request.

Example:

```bash
/component Select
```

## `--figma <url>`

Explicit Figma source.

```bash
/component Select --figma "https://www.figma.com/design/..."
```

The URL is evidence, not permission to implement.

## `--modify`

Force existing-component modification workflow.

```bash
/component Snackbar --modify
```

Still requires repository inspection.

## `--sync`

Explicitly request Figma ↔ code reconciliation.

```bash
/component Button --sync
```

This MUST determine whether:

```text
Figma → Code
Code → Figma documentation
No action
Architectural conflict
```

Do not blindly overwrite either side.

## `--audit`

Audit the requested component without implementation.

```bash
/component Button --audit
```

## `--spec`

Generate/update the component specification only.

```bash
/component Select --spec
```

No source implementation.

## `--dry-run`

Execute the entire reasoning/classification pipeline but prohibit source changes.

---

# 2. Non-Negotiable Rules

## Rule 1 — Repository is the source of truth for implementation state

Never trust:

* the user's statement that a component does not exist
* the Figma name alone
* documentation alone
* a stale componentMap entry
* a README example
* a previous audit claim

Verify directly.

---

## Rule 2 — Figma is the source of truth for visual intent

When Figma evidence exists, inspect:

* component
* variants
* properties
* states
* dimensions
* spacing
* typography
* color
* tokens
* dark/light behavior
* disabled state
* error state
* interaction state
* responsive behavior
* slots / sub-parts
* component composition
* accessibility-relevant visual states

Do not infer missing Figma behavior merely because another library supports it.

---

## Rule 3 — Existing code is the source of truth for current behavior

Before modifying anything:

```text
Read the entire component.
Read its styles.
Read its stories.
Read its tests.
Read its exports.
Read related components.
Read relevant shared utilities.
```

Do not modify a component based only on one source file.

---

## Rule 4 — Never create duplicate responsibility

Before creating a component, search for:

```text
exact component
alias
similar component
primitive wrapper
existing composition pattern
existing helper
existing Radix primitive
existing foundation capability
```

Example:

```text
Toast
→ Snackbar already exists
→ do not create Toast
```

---

## Rule 5 — Never build speculative infrastructure

Do NOT introduce:

```text
generic state manager
generic collection system
generic selection framework
generic overlay manager
generic form abstraction
generic DOM utility layer
generic accessibility framework
generic polymorphism layer
```

unless the repository contains sufficient evidence according to the foundation rules.

Minimum default evidence:

```text
≥ 2 meaningful real consumers
OR
a demonstrated recurring defect
OR
a stable platform capability
OR
an explicit approved architecture decision
```

A component that needs infrastructure is NOT automatically permission to create that infrastructure.

---

# 3. Mandatory Source Reading

Before any implementation, inspect at minimum:

```text
CLAUDE.md

.claude/rules/accessibility.md
.claude/rules/design-foundation.md
.claude/rules/figma-code-connect.md

docs/architecture/component-api-conventions.md
docs/architecture/component-capability-matrix.md
docs/architecture/market-benchmark.md
docs/architecture/component-development-system.md
docs/architecture/remediation-matrix.md

figma-sync.config.json

.claude/commands/test.md

.claude/skills/sun-design-system/
```

Also inspect the relevant existing components.

If a referenced document does not exist, report it.

Do not silently substitute another document.

---

# 4. Phase A — Repository Discovery

Perform direct repository inspection.

Determine:

### A1. Code existence

```text
src/components/<name>
```

### A2. Figma mapping

Inspect:

```text
figma-sync.config.json
```

### A3. Documentation existence

Search:

```text
docs/components/
docs/architecture/
README
Storybook
```

### A4. Export existence

Inspect:

```text
src/index.ts
package.json
exports
```

### A5. Test existence

Search:

```text
*.test.*
*.stories.*
play()
API contract tests
quality scripts
```

### A6. Similarity

Search for:

```text
name
aliases
ARIA role
Radix primitive
responsibility
visual role
```

---

# 5. Phase B — Classification

Classify into exactly one:

| Class | Meaning                                          | Action                 |
| ----- | ------------------------------------------------ | ---------------------- |
| A     | Exists and satisfies request                     | STOP                   |
| B     | Exists but incomplete                            | Modify                 |
| C     | Exists but architecture is wrong                 | STOP + approval        |
| D     | Existing component already covers responsibility | STOP                   |
| E     | Truly new and justified                          | New-component workflow |
| F     | Figma/code drift                                 | Sync workflow          |
| G     | Insufficient evidence                            | Research/STOP          |

Never silently convert G into E.

---

# 6. Classification Report Before Implementation

Before implementation, output:

```text
Classification: X

Existing code:
Figma mapping:
Existing similar components:
Relevant foundation capabilities:
Relevant market precedent:
Known consumers:
Architecture risk:
Figma evidence:
Decision:
```

Then:

```text
PROCEED
```

or:

```text
STOP CONDITION
```

Do not begin implementation if a Stop Condition exists.

---

# 7. Phase C — Evidence Collection

Every proposed capability MUST be classified:

```text
CONFIRMED
SUPPORTED BY EXISTING SYSTEM
MARKET-PROVEN
INFERRED
UNKNOWN
```

Never represent inference as fact.

For every non-trivial API decision, answer:

```text
Why does this prop exist?
Who consumes it?
Is it in Figma?
Is it already used elsewhere?
Does a Radix primitive provide it?
Does another mature library establish a useful precedent?
Does it create public API surface?
Is it breaking?
Can it be removed later?
```

---

# 8. Phase D — Architecture Review

Before implementation, evaluate:

## 8.1 Primitive

Determine whether Radix already provides the behavior.

Prefer:

```text
Radix primitive
+
Sun styling
+
Sun API conventions
```

over rebuilding behavior.

---

## 8.2 State

Explicitly model:

```text
default state
controlled state
uncontrolled state
disabled
loading
error
focus
hover
active
selected
open
closed
invalid
readonly
```

Only include states that are meaningful for the component.

---

## 8.3 Accessibility

Verify:

```text
semantic element
ARIA role
accessible name
description
label
invalid state
keyboard behavior
focus management
focus-visible
disabled semantics
screen-reader behavior
portal behavior
```

If Radix owns behavior, verify that Sun does not accidentally override it.

---

## 8.4 Composition

Evaluate:

```text
children
slots
subcomponents
compound API
asChild
classNames
container
```

Use Sun's existing conventions.

Do not invent a new composition model.

---

## 8.5 Styling

Verify:

```text
design tokens
Tailwind v4
tailwind-variants
cn()
dark mode
light mode
focus ring
reduced motion
CSS variable usage
```

No hardcoded visual values when an existing token exists.

---

## 8.6 Public API

Every public prop must have a reason.

For every proposed prop:

```text
Figma?
Consumer?
Market precedent?
Existing convention?
Required?
Optional?
Breaking risk?
```

If the answer is merely:

```text
"other libraries have it"
```

that is insufficient.

---

# 9. Phase E — Figma ↔ Code Reconciliation

When Figma exists, produce a reconciliation matrix:

| Capability | Figma | Existing code | Required  | Decision  |
| ---------- | ----- | ------------- | --------- | --------- |
| variant    | ✓     | ✓             | no        | preserve  |
| size       | ✓     | ✗             | yes       | implement |
| disabled   | ✓     | ✓             | no        | preserve  |
| error      | ✗     | ✓             | uncertain | STOP      |
| dark mode  | ✓     | ✓             | no        | preserve  |

Rules:

1. Never invent missing Figma states.
2. Never delete existing API solely because Figma lacks it.
3. Flag divergence.
4. Breaking API changes require explicit approval.
5. Visual differences must be traced to tokens before modifying styles.

---

# 10. Phase F — Component Specification

Before implementation, create or update:

```text
docs/components/<component-name>.md
```

using:

```text
docs/components/_template.md
```

The specification MUST contain:

```text
Purpose
Responsibility
Non-goals
Anatomy
Variants
Sizes
States
Props
Controlled/uncontrolled behavior
Accessibility
Keyboard behavior
Composition
Slots
Styling
Tokens
Dark/light behavior
Responsive behavior
Figma mapping
Dependencies
Market precedent
Known limitations
Testing requirements
Package/export requirements
```

The spec becomes the contract for implementation.

---

# 11. API Design Gate

Reject unnecessary API.

A proposed public API must survive:

```text
Consumer test
Figma test
Architecture test
Accessibility test
Market test
Removal test
```

### Removal test

Ask:

> If this prop disappeared tomorrow, what real consumer would break?

If the answer is:

```text
none
```

do not add the prop.

---

# 12. Implementation Routing

Do NOT implement inside this command.

Route to:

```text
.claude/skills/sun-design-system/workflows/component-implement.md
```

for new components.

Route to:

```text
.claude/skills/sun-design-system/workflows/component-modify.md
```

for modifications.

Route Classification F (pure Figma/code drift reconciliation) to `component-modify.md` as well — it covers token and visual drift.

This command remains an orchestrator.

---

# 13. Mandatory Implementation Constraints

The routed workflow MUST:

### Read before write

Read:

```text
all relevant source
all relevant styles
stories
tests
exports
related components
```

### Reuse before abstracting

Search for:

```text
existing utility
existing primitive
existing hook
existing styling pattern
existing API convention
```

### No speculative abstraction

Do not create a shared abstraction merely because the new component could theoretically use it.

---

# 14. Mandatory Documentation

After implementation, update only the documentation that is actually affected.

At minimum, evaluate:

```text
docs/components/<name>.md
docs/architecture/component-capability-matrix.md
docs/architecture/component-development-system.md
docs/architecture/component-api-conventions.md
```

Update market benchmark only when the component changes an established capability gap.


---

# 15. Mandatory `/test` Integration

Every implemented component MUST invoke:

```text
/test <ComponentName>
```

Do not claim verification without real output.

The test system MUST evaluate:

```text
unit
Storybook
interaction
a11y
API contract
package
exports
build
tree-shaking where relevant
dark/light — always, per .claude/skills/sun-design-system/references/theme-verification.md (4 layers; light-only evidence = NOT VERIFIED)
motion where relevant
consumer behavior where relevant
```

---

# 16. Mutation Requirement

For every critical regression test added, verify:

```text
break implementation
→ test fails
→ restore implementation
→ test passes
```

A test that remains green after its protected behavior is deliberately removed is considered:

```text
INVALID
```

Do not count invalid tests as coverage.

---

# 17. Logic Matrix

Evaluate the component against:

```text
hooks
effects
refs
event composition
DOM interaction
state transitions
controlled/uncontrolled behavior
prop transformation
async behavior
timer behavior
race conditions
cleanup
SSR/RSC behavior
portal behavior
dependency arrays
stale closures
duplicate logic
dead logic
```

Any Critical/P0 issue means:

```text
FAIL
```

regardless of score.

---

# 18. Package Matrix

Evaluate:

```text
root ESM
root CJS
subpath export
TypeScript declarations
CJS conditions
tree-shaking
CSS export
CSS duplication
external dependencies
peer dependencies
package tarball
consumer installation
consumer TypeScript
Node consumer
Next.js consumer where applicable
```

Do not rely solely on:

```bash
pnpm build
```

Exit code alone is insufficient evidence.

---

# 19. Market Matrix

Benchmark only capabilities relevant to this component.

Use:

```text
MUI
Radix
React Aria
Chakra
shadcn/ui
Base UI
Headless UI
Ant Design
Mantine
```

where applicable.

Do NOT copy APIs simply because competitors have them.

Classify each gap:

```text
Required parity
Useful parity
Optional
Deliberately rejected
```

---

# 20. Quality-System Matrix

The component MUST integrate with:

```text
/test
test:unit
test:storybook
test:api
test:package
test:tokens
test:foundation
test:full
```

where applicable.

If a relevant quality gate does not apply, document why.

---

# 21. Certification Matrix

Before certification, evaluate external-consumer reality:

```text
published .d.ts
clean TypeScript consumer
clean npm package
ESM
CJS
subpath
root import
Next.js
React Server Components where applicable
CSS loading
dark/light rendering
Storybook rendering
```

A repository-local green build is NOT equivalent to production certification.

---

# 22. Repository Architecture

Before creating files, determine:

```text
correct component directory
correct utility boundary
correct foundation boundary
correct public/private boundary
correct package export
correct test location
correct Storybook location
```

Do not introduce new top-level architectural boundaries without evidence.

---

# 23. Foundation Rules

Foundation capabilities are subject to:

```text
2+ meaningful consumers
OR recurring defect
OR stable platform capability
OR explicit approved architecture
```

Examples:

```text
focus ring
cn()
portal container
useFieldIds
controlled state
selection infrastructure
collection infrastructure
overlay infrastructure
```

Do not create a foundation abstraction simply because it would make one component cleaner.

---

# 24. Component Quality Score

Every completed component receives a score only AFTER real verification.

Suggested weighting:

```text
API / DX              15
Architecture          15
Logic / Correctness   15
Accessibility         15
Figma fidelity        10
Styling / Theming     10
Testing               10
Package / Consumer     5
Documentation          5
-------------------------
Total                100
```

Mandatory overrides:

```text
Critical/P0 → FAIL
Broken package → FAIL
Broken declaration → FAIL
Broken accessibility fundamental → FAIL
Unverified required behavior → NOT CERTIFIED
Mutation-invalid critical test → NOT CERTIFIED
```

Suggested status:

```text
0–59    FAIL
60–74   NEEDS WORK
75–89   VERIFIED
90–96   CERTIFIED
97–100  PRODUCTION
```

A numerical score NEVER overrides a Critical finding.

---

# 25. Stop Conditions

STOP immediately when encountering:

```text
breaking public API change
unclear Figma intent
vendor selection ambiguity
new infrastructure with insufficient consumers
accessibility uncertainty
package architecture uncertainty
RSC behavior uncertainty
new dependency with unclear justification
conflicting architecture documents
conflicting design tokens
unknown consumer requirement
```

Report:

```text
STOP CONDITION
Evidence
Why it matters
Options
Recommended option
Required approval
```

Never silently decide.

---

# 26. Definition of Done

A component is NOT done merely because:

```text
it renders
Storybook opens
tests pass
build passes
```

It is done only when:

```text
✓ repository architecture correct
✓ Figma intent reconciled
✓ component specification exists
✓ API justified
✓ accessibility verified
✓ logic audited
✓ dark/light verified where applicable
✓ Storybook exists
✓ interaction tests exist where applicable
✓ unit tests exist where logic warrants them
✓ mutation-tested critical regressions
✓ API contract verified
✓ package verified
✓ exports verified
✓ TypeScript consumer verified where applicable
✓ /test passes
✓ no unresolved Critical/P0
✓ documentation updated
✓ quality score earned from evidence
```

---

# 27. Final Report

After completion, output exactly:

```text
# /component <Name> report

Classification:
< A/B/C/D/E/F/G >

Decision:
<Implemented / Modified / Synchronized / Audited / Stopped>

Workflow:
<workflow used>

Figma:
<source / unavailable / drift detected>

Spec:
docs/components/<name>.md
<created / updated / unchanged>

Implementation:
<summary>

Public API:
<added / changed / none>

Foundation impact:
<none / existing capability reused / new capability proposed>

Accessibility:
<PASS / FAIL / NOT VERIFIED>

Logic:
<PASS / FAIL / NOT VERIFIED>

Theme (light/dark):
<1. Figma↔token Light/Dark N/N (pnpm figma:theme-check) · 2. storybook a/a + storybook-dark b/b · 3. token-resolved light+dark tests · 4. all-state contrast FAILs / NOT VERIFIED>

Figma fidelity:
<PASS / FAIL / NOT VERIFIED>

Market benchmark:
<summary>

/test:
<real result>

Mutation verification:
<PASS / FAIL / NOT APPLICABLE>

Package verification:
<PASS / FAIL / NOT APPLICABLE>

Quality score:
<NN/100>

Critical/P0:
<none / list>

Deferred:
<none / list>

Status:
<Draft / Implemented / Verified / Certified / Production>

Next steps:
<none / explicit actions>
```

---

# 28. Absolute Prohibitions

NEVER:

```text
invent Figma behavior
invent consumers
invent API requirements
copy competitor APIs blindly
create infrastructure for one consumer
mark tests as passing without running them
trust exit code alone
mark Production without /test
ignore package verification
ignore external TypeScript behavior
silently make breaking changes
silently resolve architectural ambiguity
duplicate existing component responsibility
create a second composition model
create generic helper abstractions without evidence
```

---

# 29. Philosophy

The command optimizes for:

```text
Correctness > Speed
Evidence > Assumption
Reuse > Abstraction
Composition > Duplication
Stable API > Feature Count
Real Consumers > Market Hype
Verification > Confidence
Explicit Decisions > Silent Decisions
```

The desired end state is NOT:

> "Sun has many components."

The desired end state is:

> **"Every component in Sun Design System has a traceable reason to exist, a documented contract, a defensible API, verified behavior, verified package output, verified accessibility, verified visual intent, and a repeatable development workflow."**
