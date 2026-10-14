# Component Implementation Workflow

This workflow implements a component that has already passed `/component` classification.

It is intentionally strict.

The goal is not to produce the minimum code necessary to render the Figma design.

The goal is to produce a **production-grade library component**.

---

# Phase 1 — Full Context Inspection

Before writing code, read:

```text
CLAUDE.md

.claude/rules/accessibility.md
.claude/rules/design-foundation.md
.claude/rules/figma-code-connect.md

docs/architecture/component-api-conventions.md
docs/architecture/component-capability-matrix.md
docs/architecture/market-benchmark.md
docs/architecture/component-development-system.md

figma-sync.config.json

.claude/commands/test.md
```

Then inspect:

```text
src/components/**
```

Read all directly related components completely.

Do not rely on filenames or grep results alone.

---

# Phase 1.1 — Existing Pattern Extraction

Identify reusable patterns already present in the repository.

Inspect:

* `cn()`
* `tv()`
* Radix wrappers
* refs
* event composition
* controlled/uncontrolled state
* field IDs
* error handling
* class customization
* slot patterns
* compound components
* Storybook conventions
* test conventions.

Do not create a new abstraction if an existing abstraction already solves the problem.

---

# Phase 1.2 — Similar Component Analysis

For every similar component, document:

```text
Component
Responsibility
Public API
State model
Composition model
Customization model
Accessibility model
Relevant reusable internals
Known weaknesses
```

The new component must explicitly explain why it does not duplicate existing responsibility.

---

# Phase 2 — Figma Specification Extraction

If Figma is applicable, inspect the complete component definition.

**Before extracting anything, enumerate every distinct Figma component/symbol on the target's documentation page — never rely on name-matching a single node.** A page routinely contains more than one top-level component under its "Components" section (e.g. `DropdownMenu`'s page has both "Menu Item" and a separate "Group Header" — inspecting only "Menu Item" misses "Group Header" entirely). Call `get_metadata` on the page/parent frame first, list every component/symbol node found, then call `get_design_context` (and `get_screenshot` for anything spacing/inset-sensitive — generated Tailwind classes can look structurally right while still hiding a real visual difference, e.g. an edge-to-edge divider vs. an inset one) on each one separately before deciding the extraction is complete.

Extract:

## Anatomy

```text
root
subcomponents
slots
interactive areas
content
icons
labels
descriptions
indicators
```

## Variant axes

Record every meaningful variant axis.

## State matrix

At minimum investigate:

```text
default
hover
active
focus
focus-visible
disabled
selected
checked
loading
error
success
open
closed
expanded
collapsed
```

Do not implement states that are not required.

Do not omit states that are required.

---

# Phase 2.1 — Token Verification

Every visual value must be classified:

```text
Existing token
Existing semantic token
Existing primitive token
New token required
Non-token value intentionally required
```

Hardcoded values require justification.

Never introduce a new token merely because a value is convenient.

---

# Phase 3 — API Research

Before writing the component API, benchmark the relevant capability.

Research:

```text
MUI
Radix UI
React Aria
Chakra UI
shadcn/ui
Mantine
Ant Design
Headless UI
```

Use official documentation/source where possible.

Evaluate:

```text
API shape
composition
slots
customization
controlled state
uncontrolled state
keyboard behavior
accessibility
refs
imperative APIs
styling
form integration
localization
```

For each candidate capability:

```text
KEEP
ADAPT
REJECT
DEFER
```

Record the rationale.

Never copy another library's API blindly.

---

# Phase 3.1 — Public API Stress Test

Before implementation, attempt to break the proposed API conceptually.

Ask:

### Composition

Can users:

* provide custom content?
* provide custom icons?
* replace internal elements?
* compose Sun components together?
* use the component inside forms?
* wrap it with Tooltip?
* use it inside Modal/DropdownMenu?

### State

What happens when:

* controlled → uncontrolled?
* uncontrolled → controlled?
* value changes externally?
* disabled changes?
* error changes?
* loading changes?
* props change during interaction?

### Events

What happens when:

* consumer handler exists?
* internal handler exists?
* both exist?
* event is prevented?
* event bubbles?
* component is disabled?

### DOM

What happens when:

* ref is provided?
* custom child is used?
* element changes?
* portal is involved?
* SSR is used?

### Accessibility

What happens with:

* keyboard-only use?
* screen reader?
* missing accessible name?
* disabled state?
* error state?
* focus restoration?

If any answer is unclear, stop and resolve it before implementation.

---

# Phase 4 — Architecture Decision

Define:

```text
Component structure
Primitive choice
State ownership
Controlled/uncontrolled strategy
Composition strategy
Styling strategy
Slot strategy
Accessibility strategy
Ref strategy
Testing strategy
```

Prefer:

```text
existing primitive
+
existing repository pattern
+
composition
```

over:

```text
new abstraction
+
new state system
+
new styling system
```

---

# Phase 5 — Implementation

Implement:

```text
<Name>.tsx
<Name>.styles.ts
<Name>.stories.tsx
index.ts
```

and any required tests/specification.

Rules:

* strict TypeScript,
* no unnecessary `any`,
* no `@ts-ignore`,
* no business logic,
* no hardcoded design values without justification,
* no accidental exports,
* no hidden public APIs,
* no duplicated logic.

---

# Phase 5.1 — Composability Implementation

Explicitly verify whether the component needs:

* compound subcomponents,
* slots,
* `classNames`,
* `asChild`,
* `ReactNode` content,
* render customization,
* container/portal control,
* refs,
* event composition.

Do not add all of these automatically.

Add only where justified by:

```text
real consumer need
+
market evidence
+
repository consistency
```

---

# Phase 6 — Storybook

Create stories for the complete meaningful state matrix.

At minimum:

```text
Default
Variants
Sizes
Disabled
Focus
Error
Loading
Selected/Checked
Open/Closed
Long content
Empty content
Custom content
Composition
```

Only include states applicable to the component.

Every important interactive state must have a `play()` assertion where behavior can be tested.

Storybook is not merely documentation.

It is part of the executable quality system.

---

# Phase 7 — Accessibility

Verify:

* semantic HTML,
* keyboard interaction,
* focus behavior,
* focus-visible,
* accessible name,
* description,
* error announcement,
* disabled semantics,
* ARIA attributes,
* screen-reader behavior,
* portal behavior,
* focus restoration.

Prefer the underlying Radix/React Aria primitive when it already provides correct behavior.

Do not recreate accessibility behavior unnecessarily.

---

# Phase 8 — Tests

Create tests based on failure modes, not line coverage.

Test:

```text
happy path
state transitions
controlled/uncontrolled
external prop changes
event composition
refs
keyboard
focus
disabled
edge cases
composition
customization
```

Every bug discovered during implementation must become a regression test.

---

# Phase 9 — Documentation

Create/update:

```text
docs/components/<name>.md
```

The document must contain:

```text
Purpose
When to use
When not to use
Anatomy
API
Variants
States
Composition
Customization
Accessibility
Keyboard behavior
Figma mapping
Design tokens
Examples
Known limitations
Testing matrix
Market/API decisions
```

Future components must be able to use this document as a pattern reference.

---

# Phase 10 — Mandatory /test

Run:

```text
/test <Name>
```

Do not mark the component verified before `/test` completes.

The result must include real evidence for:

```text
unit
storybook
accessibility
API contract
package
tokens
build
typecheck
lint
dark/light
consumer compatibility
```

---

# Phase 11 — Matrix Re-evaluation

The component must be evaluated against the accumulated quality system.

## Logic

Check:

```text
State correctness
React correctness
Effects
Refs
Events
DOM behavior
Edge cases
Race conditions
```

## Package

Check:

```text
root export
subpath export
type declarations
tree-shaking
external dependencies
consumer compatibility
```

## Market

Check:

```text
API completeness
customization
composability
accessibility
state model
ecosystem conventions
```

## Testing

Check:

```text
unit tests
Storybook tests
API contract
package verification
token verification
dark/light verification
CI compatibility
```

"dark/light verification" is defined in [`references/theme-verification.md`](../references/theme-verification.md) — all four layers are mandatory and reported with numbers: (1) `pnpm figma:theme-check <fileKey> <nodeId>` — Figma Light/Dark values of every bound color variable vs `scripts/global.css`; (2) the component passes in **both** the `storybook` and `storybook-dark` Vitest projects (axe incl. color-contrast runs in each); (3) Figma-derived colors/rings/placeholder/hover are asserted with `tokenColor()` in **both** a light and a dark region, mutation-verified in both; (4) the script's all-variant text-contrast table (catches hover/active states axe never renders). Light-only evidence is reported as "dark mode not verified", never as PASS.

"unit tests" means `<Name>.test.tsx` meeting `component-api-conventions.md` §16's coverage checklist in full (every derived-state branch, every callback, every ref, every boundary input, every previously-fixed regression). "Storybook tests" means `.stories.tsx` `play()` coverage meeting §17's checklist in full (every documented keyboard interaction via real key presses, focus-visible rings asserted via real `Tab` + `getComputedStyle()`, a HOVER-ONLY test with zero keyboard interaction for any roving-tabindex composite widget per §17 item 9, every previously-fixed regression, at least one popover/dialog left open at the end for axe to scan) AND §18's documentation-completeness checklist in full (substantive component description, complete `argTypes`, a JSDoc comment above every story, the canonical baseline story set). "API contract" means a new `test/api/<ComponentName>.test-d.tsx` (one file, matching the component's own `src/components/<name>/` folder — never appended to an existing file) that meets every item in `docs/architecture/component-api-conventions.md` §15's coverage checklist in full — not a spot-check of one or two props. None of the three is satisfied by a fixture merely existing — each section defines its own litmus test; apply it before marking that check satisfied.

## Certification

Check:

```text
clean external consumer
generated declarations
real package import
real TypeScript compilation
real build
real runtime
```

A component must not be certified merely because its own local tests pass.

---

# Phase 12 — Adversarial Review

Before declaring completion, attempt to break the component.

Ask:

```text
What happens with invalid combinations of props?

What happens when props change after mount?

What happens when the consumer controls state?

What happens when the consumer does not control state?

What happens when children are unusual?

What happens when content is extremely long?

What happens when the component is nested?

What happens when it is rendered through a portal?

What happens under SSR?

What happens in dark mode?

What happens when the consumer overrides styling?

What happens when the consumer uses only the subpath import?

What happens when the component is tree-shaken?

What happens when React types are resolved from a clean consumer?

What happens when keyboard interaction is used exclusively?

What happens when accessibility information is missing?
```

Any newly discovered Critical/P0 defect blocks certification.

---

# Phase 13 — Final Classification

Use exactly one:

```text
Draft
Implemented
Verified
Certified
Production
```

## Draft

API/specification exists.

## Implemented

Code exists.

## Verified

Local tests and Storybook pass.

## Certified

All mandatory quality gates pass.

## Production

Certified +:

* no known Critical/P0,
* no unresolved release blocker,
* package consumer verified,
* documentation complete,
* API intentionally public,
* Figma fidelity verified where applicable.

---

# Mandatory Stop Conditions

Stop and request approval when:

* breaking API change is required,
* new global architecture is required,
* new dependency is required,
* new design token is required but not defined,
* Figma and repository conventions conflict,
* market benchmark suggests incompatible API choices,
* accessibility behavior is ambiguous,
* a component duplicates another component,
* an abstraction would affect multiple components,
* a public API cannot be justified.

Never silently solve architectural ambiguity.

---

# Component Quality Principle

The component is successful only when all of these are simultaneously true:

```text
Figma fidelity
      ↓
Design tokens
      ↓
Implementation
      ↓
API
      ↓
Composition
      ↓
Accessibility
      ↓
Storybook
      ↓
Tests
      ↓
Package
      ↓
External consumer
      ↓
Production
```

A component that only passes visual review is incomplete.

A component that only passes unit tests is incomplete.

A component that works locally but fails as a package is incomplete.

A component that copies another library's API without a Sun-specific reason is incomplete.

The target is:

> **A component that is difficult to break, easy to compose, easy to customize, accessible by default, and boringly reliable in real consumer projects.**
