# Nova (Sun* Design System) — Engineering Rules

Rules for working in this repository, for people and for Claude Code. Section numbers are stable:
the skill, commands and component specs cite them as "CLAUDE.md §N".

## 1. Mission

Nova is a component platform, not just a set of visuals: design tokens → foundations → behavior primitives →
UI components → documentation → tests → published package (`@sun-asterisk/nova`).
Build only what solves a real cross-component problem. Do not add infrastructure because another design system has it.

## 2. Architecture Model

Layers: Design tokens / CSS → Foundations (theme, focus, portal, IDs) → Behavior primitives → UI components → application.
Not every component needs every layer. A component may use a vendor primitive (Radix) directly.

## 3. UI Components vs Logic Components

UI components own their visual API, token use, component-specific behavior, public props, tests and stories.
Behavior components (field, selection, overlay, controllable state…) are not public by default.

## 4. Behavior-First Architecture

Before writing a complex component, classify each behavior as component-specific, reusable, or vendor-provided.

## 5. Abstraction Decision Gate

Before adding a hook, primitive, provider or utility, check: real consumers (normally ≥ 2), existing solutions
(Radix, the platform, Tailwind, existing Nova code), whether complexity really drops, API cost, and failure modes.
Other libraries are evidence, not requirements.

## 6. Vendor Primitive Policy

Reuse mature primitives (Radix) when they already provide the behavior. Replacing one needs a documented reason
covering semantics, keyboard, focus, portal, controlled state, disabled state, SSR/RSC and browser support.

## 7. Public API Discipline

Keep the public API small. Hooks, adapters, Radix wrappers and helpers stay internal unless they are an intentional
part of the consumer contract.

## 8. Composition Over Prop Explosion

Prefer composition (`<Field><Field.Label/>…</Field>`) over ever-growing prop lists — but only with clear ownership,
stable semantics, predictable accessibility, examples and tests.

## 9. Field / Form Architecture

Nova provides field semantics (IDs, ARIA relationships, error states, label/description/error composition).
It is not a form-management library; React Hook Form, Formik and native forms are consumers.

## 10. State Architecture

Controlled/uncontrolled behavior must be consistent. Introduce a shared state primitive only when several components
need it, and test every transition (controlled ↔ uncontrolled, callbacks, Strict Mode, SSR).

## 11. Selection Architecture

No generic Selection primitive until multiple real components need identical semantics.

## 12. Collection Architecture

High-risk abstraction. Do not build it until at least two meaningful consumers require it.

## 13. Overlay Architecture

Prefer Radix overlay behavior (portal, positioning, focus, dismiss, stacking, scroll lock). No OverlayManager
without real evidence.

## 14. Portal Policy

Overlays support a consistent container strategy; the default keeps normal document behavior. Every overlay documents
its portal/container behavior (themes, stacking and accessibility can change inside scoped containers).

## 15. Theme Architecture

`ThemeProvider` → `data-theme` → CSS variables → styles. Components never read a JS theme object. Consider light,
dark, system, SSR/hydration, flash of wrong theme, portals, nested/scoped themes and reduced motion.

## 16. Accessibility Is Architecture

Semantics, keyboard, focus, state, announcements and ARIA relationships are part of the design, not a final QA step.
Follow `.claude/rules/accessibility.md` (WCAG 2.1 AA). Prefer Radix behavior over custom ARIA.

## 17. Focus Architecture

Use the shared focus-ring convention (`src/utils/focusRing.ts`); do not hand-write focus rings. Document exceptions.

## 18. Motion Architecture

`prefers-reduced-motion` is handled globally. Do not add per-component reduced-motion code without a reason, and do
not let global motion rules disable timing-critical transitions.

## 19. Figma Is a Design Contract

Figma → specification → API → implementation → Storybook → tests stay aligned. Inspect the Figma component
(variants, properties, states, dimensions, tokens, typography, interaction) before implementing.
Never infer a missing visual state from another component.

## 20. Component Specification Is Mandatory

Each component has `docs/components/<component>.md` (template: `docs/components/_template.md`).

## 21. Component Development Contract

A component is not done because it renders. It needs a correct API, behavior, accessibility, Figma mapping, package
export, type declarations, Storybook coverage, tests, tree-shaking, theme behavior and consumer behavior.

## 22. Component Quality Matrix

Evaluate architecture, API, behavior, state, accessibility, keyboard, focus, styling, tokens, theme, composition,
SSR/RSC, package, TypeScript, Storybook, tests, Figma fidelity and documentation — not just appearance.

## 23. Mutation Testing Principle

A test must fail when the behavior it protects is removed: break the implementation → the test fails → restore → it passes.

## 24. /test Is the Quality Authority

Use `/test <ComponentName>` when modifying a component. Never claim "PASS" or "certified" from a build alone.

## 25. Storybook Is a Test Environment

Stories show API, states, interaction, accessibility, edge cases, composition and theme, with `play()` tests where meaningful.

## 26. Package Consumer Is the Final Judge

When package structure changes, check a clean consumer: ESM, CJS, TypeScript, Next.js, non-Tailwind hosts,
root and subpath imports, CSS imports, tree-shaking, declarations, peer dependencies.

## 27. Public API vs Internal API

Public = supported consumer contract; internal = implementation detail; vendor = third party.
Internal must never become public by accident. Every new export needs a reason.

## 28. Repository Architecture

`src/components` (UI components), `src/utils` (proven cross-cutting helpers), styles and tokens. Do not move files
only to make directories symmetrical.

## 29. Do Not Create a "Utility Grab Bag"

Every hook or helper belongs to a defined capability, not a catch-all `hooks/` folder.

## 30. New Logic Component Decision Tree

Vendor primitive solves it → reuse. Existing Nova code solves it → reuse. One consumer → keep it local.
Different semantics → keep separate. No real reduction in defects/complexity → keep local. Otherwise design, review,
mutation-test, then implement.

## 31. Anti-Patterns

Abstractions copied from other libraries, hooks for every repeated line, premature managers or factories,
exposing internals, an `sx` prop, implicit form injection, CSS-in-JS, replacing Radix without reason,
new dependencies for one component, turning Nova into a form library or an app framework.

## 32. Market Research Rule

For significant capabilities, study mature systems (MUI, Base UI, Radix, React Aria, Chakra, shadcn/ui, Headless UI,
Mantine, Ant Design): why they have it, what it solves, the trade-offs, and whether Nova has the same problem.

## 33. Documentation Must Prevent Regression

When a rule comes from a real bug, document what happened, why the old approach was wrong, the rule, when it applies,
exceptions and how it is tested.

## 34. Component Workflow

`/component <Name>` → classify → existing code → Figma → architecture → behavior → market benchmark → API design →
specification → approval when required → implementation → Storybook → tests → mutation check → `/test` →
package check. Do not skip steps because the change looks simple.

### 34.1 Authoritative Tooling

Use `/component`, `/test` and the `sun-design-system` skill (`.claude/skills/sun-design-system/`) for component work.

## 35. New Component Must Not Reimplement Existing Behavior

Search existing components, utilities, Radix primitives and shared conventions first. If reuse is impossible, document why.

## 36. Component Completion Definition

- **Draft** — specification exists
- **Implemented** — source code exists
- **Verified** — tests and Storybook behavior pass
- **Certified** — passes `/test` and package/API checks
- **Production** — certified, documented, package-safe, Figma-aligned, no unresolved critical findings

Never use these labels without evidence.

## 37. Change Management

Before changing existing architecture, inspect implementation, usages, tests, stories, exports, Figma mapping and docs;
identify breaking changes and migration needs; propose, get approval when required, implement incrementally, run `/test`.

## 38. Stop Conditions

Stop and report instead of implementing when the component or behavior already exists, the request conflicts with
the architecture, an unapproved breaking change is needed, Figma is ambiguous, approaches have materially different
long-term consequences, a new primitive would add significant public API, or tests cannot prove the behavior.

## 39. Core Principle

Evidence before abstraction. Behavior before visuals. Public API only when the contract is intentional.
Reuse before duplication. Tests must prove the behavior they claim to protect.

---

## Design Foundation and Accessibility Rules

- `.claude/rules/design-foundation.md` — color, typography, spacing, radius, elevation and interaction-state usage
- `.claude/rules/accessibility.md` — WCAG 2.1 AA criteria per component type
- `.claude/rules/figma-code-connect.md` — Code Connect mapping correctness

## Figma Code Connect

Each Figma component node is registered with its React component, so Dev Mode and the Figma MCP return real code
(`<Button variant="primary">`) instead of generated JSX.

| File | Role |
|---|---|
| `src/components/<name>/<Name>.figma.ts` | Mapping per component (parserless template: `.figma.ts` + `figma.code`) |
| `figma.config.json` | `documentUrlSubstitutions` replaces the fileKey with `$FIGMA_FILE_KEY` at publish time |
| `scripts/code-connect-publish.mjs` | Resolves `FIGMA_FILE_KEY` from `.env` and runs the CLI |
| `tsconfig.figma.json` | Type-check config for `*.figma.ts` |

- Mapping URLs point at the Nova Figma file. A duplicated file keeps node IDs, so publishing to your own copy only
  needs `FIGMA_FILE_KEY`. Do not hand-edit the URLs.
- Commands: `pnpm run code-connect:check`, `pnpm run code-connect:publish` (needs `FIGMA_ACCESS_TOKEN`), `pnpm run typecheck:figma`.
- Map only prop-driven states (`Disabled`); hover/focus/active are CSS pseudo-classes. List every Figma variant value
  in `getEnum`. Never invent props. Resolve nested instances (icons) with `getInstanceSwap()` + `executeTemplate()`.
  Match Figma names exactly, including Figma's own typos.
- `*.figma.ts` files are excluded from the library build (`tsconfig.app.json`, `tsconfig.build.json`, `vite.config.ts`).
