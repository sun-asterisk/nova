<!-- Component Specification — see docs/components/_template.md for the schema this extends.
     ThemeProvider is a foundation capability, not a normal component, so this document uses the
     32-section structure of its architecture proposal rather than the standard per-component
     template. Status: implemented (src/components/themeProvider); the proposal text is kept as the
     design record. -->

# ThemeProvider — Architecture Proposal

**Status: implemented** (`src/components/themeProvider`). This document was written as the architecture proposal before implementation and is kept as the design record; sections that changed during implementation are marked inline.

**Method note:** every claim about Sun's current architecture below was verified by direct inspection during this task (not recalled from memory) — `scripts/global.css`'s actual dark-mode blocks, `Button.styles.ts`'s actual token usage, `.storybook/preview.ts`'s actual (empty) theme configuration, `figma-sync.config.json`, `package.json`'s actual exports, and a repository-wide search confirming zero prior `ThemeProvider`/`SunThemeProvider` reference exists anywhere in `src/`. Market claims are based on official documentation and source, not assumption.

---

## 1. Problem Definition

Today, Sun Design System's dark mode is **real, complete, and verified working at the CSS level** (Production certification proved this with a real rendered `getComputedStyle` check — light `rgb(67,67,67)` ↔ dark `rgb(231,231,231)`, both matching their exact expected token values), but entirely **unproductized**:

- A consumer must know, undocumented, that setting `document.documentElement.setAttribute('data-theme', 'dark')` is the mechanism — nothing in `README.md` or `design.md` says so (confirmed: `design.md` contains exactly one incidental mention of dark mode, in a token-naming comment, nothing else).
- There is no supported way to opt into the OS's `system` preference *and* respond to it changing later — the CSS `@media (prefers-color-scheme: dark)` bridge already exists and already works, but nothing lets a consumer combine it with a manual override or read the resolved value in JS.
- Nothing prevents a flash of the wrong theme on first paint for any consumer doing SSR or static generation, because nothing sets the attribute before React hydrates.
- Nothing exists in Storybook to preview a component in dark mode interactively (`.storybook/preview.ts` has zero theme-related configuration — confirmed by direct read).
- Every consumer who wants this today must hand-roll their own effect, their own `localStorage` key, their own `matchMedia` listener, and their own SSR script — and seventeen consumers will produce seventeen slightly-different, independently-buggy implementations of exactly the pattern the market research in `theme-provider-benchmark.md` shows is now a converged, well-understood problem.

**The problem ThemeProvider actually solves is narrow and specific: turn an already-correct, already-tested CSS mechanism into a supported, documented, SSR-safe, zero-flash JavaScript API — without changing how any existing component gets its colors.** It is not a redesign of Sun's token system, not a new styling engine, and not a JS theme-object model. The single most important fact this proposal is built on: **every one of Sun's 17 existing components already resolves 100% of its color/spacing/radius/typography values through the CSS cascade via Tailwind utility classes** (verified directly in `Button.styles.ts`: `bg-surface-primary`, `text-text-on-surface`, etc. — plain class strings, zero JS theme-object consumption, zero `useTheme()`-style interpolation anywhere in any `.styles.ts` file in the repository). This means **ThemeProvider's runtime coupling to existing components is, and must remain, zero** — no existing component needs to import from, subscribe to, or even know that ThemeProvider exists in order to render correctly in light or dark mode. This is the load-bearing architectural fact for nearly every decision in this document.

## 2. Responsibilities

ThemeProvider owns:

1. **Mode state** — `light | dark | system`, as a controlled/uncontrolled React value (§8).
2. **DOM theme application** — setting/removing the `data-theme` attribute at the correct DOM node (§11), reusing the exact attribute name and values Sun's CSS already keys on (`data-theme="dark"` / `data-theme="light"` / attribute absent for pure system-following) — not inventing a second parallel mechanism.
3. **System-preference detection and live tracking** — a `matchMedia('(prefers-color-scheme: dark)')` subscription that updates the resolved theme while `mode === 'system'` and the app keeps running (§9).
4. **Persistence** — an abstracted storage interface (default: `localStorage`), so the user's explicit choice survives a reload, with a pluggable seam for a consumer who wants a cookie instead (relevant to SSR — see §14).
5. **SSR/hydration-safe application** — the pre-hydration inline-script artifact the market research shows every mature library treats as required, not optional (§14).
6. **A `useTheme()` hook** exposing the current mode, the resolved theme (`light`/`dark`, after `system` is resolved), and a setter — for the rare, real case of a consumer needing to react to theme in JS (e.g. picking a different image asset), not for styling.
7. **Transition suppression during a switch**, respecting `prefers-reduced-motion` (§16, §19).

## 3. Non-Responsibilities

Explicitly and deliberately **outside** ThemeProvider, with the evidence for why:

- **Component-level color/spacing/typography resolution.** Already 100% handled by the CSS cascade (§1). Any design that has components read a theme context to decide their own colors would be a strictly regressive rewrite of a system that already works, contradicting `CLAUDE.md`'s explicit "do not create a parallel token system" rule.
- **Locale.** No i18n/locale system exists anywhere in Sun today (confirmed: zero `locale`/`i18n` references in `src/components/`; the existing convention — per `component-implement.md`'s own guardrails — is per-component label *props* with Japanese defaults, e.g. `TextareaField`'s `requiredText = '必須'`). Locale is an orthogonal concern with an already-working, different mechanism; ThemeProvider must not become a second, competing place to configure it.
- **Direction (RTL/LTR).** No direction system exists anywhere in Sun (the only `dir` reference in the entire component tree is `DatePicker` passing react-day-picker's own optional `dir` prop through for chevron orientation — a single component's dependency detail, not a Sun-wide concern). Zero evidence of need; adding one speculatively is exactly the over-engineering `component-development-system.md` §8 forbids.
- **Density.** Sun's existing `size` prop convention (`small | medium | large`, `component-api-conventions.md` §4) already covers the one axis of "how much space does this take" that exists today, per-component, with real Figma-sourced values. A global "density" setting would require every component to consume a new context for a capability with zero current evidence of demand — deferred, not built speculatively.
- **Component visual variant defaults** (i.e., a MUI/Chakra-style `theme.components.Button.defaultProps` override system). No evidence any Sun consumer needs this, and Sun's actual styling model (compiled Tailwind classes, not a runtime-interpolated JS object) makes it architecturally awkward to retrofit — a consumer who wants a different default variant already has the tools to do this today via composition (wrap `Button` in their own component with a different default `variant`).
- **A general-purpose CSS-in-JS or styled-system runtime.** Not needed; Sun's existing `tv()`/Tailwind pipeline is unaffected by this feature end to end.

## 4. Architecture

```
Consumer's app tree
└── <ThemeProvider> (Client Component — see §14 for RSC placement)
    ├── React Context: { mode, resolvedTheme, setMode }
    ├── useEffect: sets/removes documentElement's data-theme attribute
    ├── useEffect: matchMedia subscription (only active while mode === 'system')
    ├── useEffect: persists mode to storage on change
    └── children — completely unaware ThemeProvider exists;
        resolve their own colors via the CSS cascade exactly as they do today

Consumer's own root HTML (<head>, rendered server-side, framework-appropriate)
└── <ThemeScript /> or equivalent inline snippet — a SEPARATE, small,
    explicitly-placed artifact (see §14) that runs BEFORE hydration and
    sets the same data-theme attribute from storage/matchMedia, so the
    very first paint is already correct.
```

Two artifacts, not one, is a deliberate decision — see §14 for why a single next-themes-style component cannot be assumed safe for Sun's specific Next.js App Router / RSC risk profile (Production certification already found a real, concrete RSC failure in Sun's root bundle; this design must not introduce a second one).

## 5. Provider Composition Model

A **single provider**, not a split `ColorModeProvider` + `ThemeProvider` pair (Mantine/Chakra-v2-era style). Justification: Sun has exactly one axis to manage right now (light/dark/system) — splitting into two providers for one axis adds a composition burden (`<ColorModeProvider><ThemeProvider>...`) with no current benefit. If a second, genuinely orthogonal axis emerges later (e.g. a brand/accent selector — see §26), it should be evaluated on its own merits then, not pre-emptively split out now. This mirrors MUI's own post-v6 consolidation (a single `ThemeProvider`/`CssVarsProvider`) more than the older split pattern.

## 6. Theme Model

**A minimal identifier model, not a nested JS object of resolved values.** The "theme" is:

```ts
type ThemeMode = 'light' | 'dark' | 'system';
```

No `theme.colors.primary`-style object is exposed or consumed anywhere, because no component reads one (§1/§3). This is the single largest divergence from MUI/Chakra/Ant Design's theme-object models, and it is Sun-specific, evidence-based, not a stylistic preference: those libraries need an object because their components *read from it at render time* (MUI/Chakra via CSS variables generated from it, Ant Design via CSS-in-JS interpolation). Sun's components never do this. Building an object model anyway would be pure surface area with zero consumer, violating `component-development-system.md` §8's anti-over-engineering rule directly.

**Custom branding** (§10) is modeled the same way dark mode already is — as an additional named CSS-variable override block a consumer supplies, not as a JS object Sun parses/validates/merges.

## 7. Theme API

```ts
interface ThemeProviderProps {
  /** @default 'system' */
  defaultMode?: ThemeMode;
  /** Controlled mode — omit for uncontrolled (§8) */
  mode?: ThemeMode;
  onModeChange?: (mode: ThemeMode) => void;
  /** Storage key. @default 'sun-theme' */
  storageKey?: string;
  /** Persistence seam — default localStorage; pass `null` to disable persistence entirely. */
  storage?: { get(key: string): string | null; set(key: string, value: string): void } | null;
  /** Disable the CSS-transition-suppression behavior (§16) if a consumer wants their own. */
  disableTransitionOnChange?: boolean;
  /**
   * When true, ThemeProvider tracks the resolved theme for `useTheme()` but
   * never writes the `data-theme` attribute itself — for a consumer whose
   * own app shell already manages it (see §10/§27's "unmanaged mode"
   * rationale, a genuinely Sun-specific need not found in any library
   * surveyed, since none of them ship as a *component library* consumed by
   * unknown host applications).
   */
  unmanaged?: boolean;
  children: ReactNode;
}

function useTheme(): {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
};
```

Every field above is justified individually in the sections that follow (§8 controlled/uncontrolled, §10 custom branding/unmanaged, §16 transitions).

## 8. Controlled / Uncontrolled Behavior

**Both, following Sun's own established convention exactly** (`component-api-conventions.md` §1): `mode` + `onModeChange` for controlled, `defaultMode` for uncontrolled, resolved via the same `value ?? internalState` pattern already used correctly throughout the library (e.g. `Switch`). No new pattern is introduced. A consumer who wants to drive the mode from their own app-level settings UI uses controlled mode; a consumer who just wants "remember what the user picked" uses the uncontrolled default.

## 9. Light / Dark / System

`system` is a real third mode, not sugar for "run this once at mount." Per the market research's Near-Universal Practice #4, ThemeProvider subscribes to `matchMedia('(prefers-color-scheme: dark)')` and updates `resolvedTheme` live while the OS preference changes and `mode === 'system'` — a static one-time read at mount would fail the explicit "system preference changes while application is running" scenario this proposal is required to survive (§ hostile review, `theme-provider-quality-matrix.md`). The listener is only attached while `mode === 'system'`, removed otherwise — no wasted subscription.

`resolvedTheme` (always concretely `'light'`/`'dark'`, `system` already resolved) is what's actually written to `data-theme`; `mode` (which may literally be `'system'`) is what `useTheme()` exposes as the user's *choice*, not the *resolved* result. This distinction is deliberate and mirrors every library surveyed with a `system` mode.

## 10. Custom Theme / Branding

No JS theme object — re-branding is a plain CSS custom-property override (§6). **The one supported override surface is the public semantic variable `--color-sds-<role>`** (e.g. `--color-sds-surface-primary`), set on any ancestor element (`:root`, `body`, or a wrapper class):

```css
.brand-ocean {
  --color-sds-surface-primary: #0b5cad;
  --color-sds-surface-primary-hover: #0a4f96;
  --color-sds-text-link: #0b5cad;
}
/* A brand that also needs different dark values: */
[data-theme='dark'] .brand-ocean,
.brand-ocean[data-theme='dark'] {
  --color-sds-surface-primary: #7fb8f0;
}
```

Everything beneath that element follows the override — every library utility (`bg-sds-surface-primary` on `Button`, etc.) **and** any consumer CSS that reads `var(--color-sds-surface-primary)`.

### 10.1 Two variable layers — which one to touch

| Variable | Layer | Who sets it | Consumers |
|---|---|---|---|
| `--color-sds-<role>--ref` | **Theme** (internal) | Sun only: `:root, [data-theme="light"]`, the OS-dark `@media` block, `[data-theme="dark"]` | Only `--color-sds-<role>` reads it. **Not a supported override surface** — its name and existence may change without notice |
| `--color-sds-<role>` | **Public / brand** | `var(--…--ref)` by default (in Tailwind `@theme static`, re-bound on every `:where([data-theme])` element); **consumers override this** | Every compiled utility (`.bg-sds-surface-primary { background-color: var(--color-sds-surface-primary) }`) and consumer `var()` CSS |
| `--color-sds-<hue>-<step>` (primitives) | Palette | Sun | Theme-invariant; overriding a primitive recolors every semantic role that maps to it in either theme — possible, but rarely what a brand wants |

### 10.2 Interaction with nested theme regions

`:where([data-theme]) { --color-sds-<role>: var(--color-sds-<role>--ref) }` re-binds every public variable on each theme boundary (required by §12 — see §12.1). Consequences, all verified by `pnpm test:foundation`:

- A brand override on the **same element** as `data-theme` always wins: the re-bind is `:where()` (specificity 0), so any consumer selector beats it regardless of stylesheet order.
- A brand override on an **ancestor** of a nested `[data-theme]` region does **not** reach inside that region — the region re-binds to its own theme. To brand a nested region too, target it as well (`.brand-ocean, .brand-ocean [data-theme] { … }`), or put the brand class on the region element itself.
- A consumer brand rule inside a cascade `@layer` loses to Sun's unlayered re-bind on `[data-theme]` elements (unlayered beats layered). Declare brand overrides unlayered, or on a non-`[data-theme]` element.

### 10.3 Regression record (CLAUDE.md §33) — SC-02, fixed 2026-09-29

- **What happened:** this section documented overriding `--color-sds-*`, but it had no effect on any library component. `scripts/global.css` declared semantic colors in `@theme inline`, which copies a theme variable's value verbatim into the utility, so `.bg-sds-surface-primary` compiled to `var(--color-sds-surface-primary--ref)` — it never read the public name. Found by an external-consumer showcase (`sun-design-system-consumers/FINDINGS.md` SC-02).
- **Why it was wrong:** the doc's contract and the compiled CSS disagreed, and nothing tested the contract — only the (internal) `--ref` override was exercised by dark mode.
- **New rule:** public semantic colors are emitted in `@theme static` (non-inline → utilities compile to `var(--color-sds-<role>)`; `static` → every public var is emitted even if no library utility uses it). Theme blocks only ever write `--ref`. `scripts/build-tokens.mjs` (`buildThemeBlocks()`) is the single source; never hand-edit `scripts/global.css`.
- **How it is tested:** `pnpm test:foundation` (`scripts/quality/verify-motion-and-theme.mjs`) asserts, in a real browser against `dist/index.css`, that an ancestor `.brand-ocean { --color-sds-surface-primary }` restyles both a `Button`-primary utility pair and a custom `var()` element, and that a brand on the same element as `data-theme` wins even when the consumer stylesheet loads *before* Sun's. Mutation-verified: reverting the utility to `var(--…--ref)` → 8 failures; dropping `:where()` from the re-bind → 8 failures; restored → 0. `pnpm test:tokens` fails if any public var lacks a light `--ref` or a re-bind.

**`unmanaged` mode** exists specifically for a consumer whose own application shell already owns `data-theme`/`class` toggling (their own design system, or their own `next-themes` instance) and wants Sun's components to simply follow along, with `useTheme()` available for any Sun-aware code the consumer writes, but with zero risk of two independent managers fighting over the same DOM attribute. This is the one genuinely novel API surface in this proposal relative to the benchmarked libraries, and it exists for a reason none of them have: **every library surveyed ships as part of an application or a self-contained design system consumed by trusted, known code — Sun ships as a component library consumed by unknown third-party Next.js/React applications that may already have their own theme management.** Rejecting this feature would be ignoring a real, Sun-specific consumer risk (Production certification already demonstrated the cost of assuming Sun's consumers all look the same, with the root-bundle RSC failure).

## 11. CSS Variable Strategy

**Root-scoped by default** (`document.documentElement`, i.e. `<html>`) — matching Sun's dark-mode CSS (originally `:root[data-theme="dark"]`, confirmed via real `getComputedStyle` verification in Production certification; since 2026-09-29 the selector is `[data-theme="dark"]` so it also applies to scoped regions — §12.1). This is not a new choice; it is *codifying* the mechanism that already exists and already passes real rendered verification. Per the benchmark's cross-cutting synthesis, root-scoping has zero portal-compatibility cost, since every portalled node (Radix renders to `document.body` by default) still inherits from `:root` regardless of its position in the React tree. This is the direct, market-validated reason Sun should **not** adopt Radix Themes' own wrapper-scoped-by-default model as the primary mode.

An **opt-in scoped mode** (§12) sets the attribute on a wrapper `<div>` instead of `documentElement`, for the one real use case that needs it (independent theme regions in one page) — with the portal caveat from Radix Themes' own docs carried over honestly, not hidden.

## 12. Scoped Themes / Nested Providers

- **Nested `ThemeProvider`s inherit by default** unless the inner one explicitly renders in `scoped` mode. An un-scoped nested provider is a legitimate (if usually pointless) no-op wrapper — it must not throw, warn destructively, or silently do something surprising (see the hostile-review scenario in `theme-provider-quality-matrix.md`).
- **`scoped` mode** (`<ThemeProvider scoped>`) creates an isolated CSS-variable region on a wrapper element instead of `documentElement`, for the genuine "two independent theme regions in one page" case (e.g. an embedded widget with a forced light theme inside an otherwise-dark host page). **Portal caveat, carried over honestly from Radix Themes' own documented limitation:** any Radix-portalled content from inside a scoped region (Modal, DropdownMenu, Tooltip) that portals to `document.body` by default will render **outside** the scoped wrapper's DOM subtree and will not see its overridden variables unless redirected. Sun already has the fix for this half-built: `DropdownMenuContent` and `TooltipContent` already accept a `container` prop (added in Remediation) that redirects the Radix `Portal` target — a scoped-theme consumer needs to pass the scoped wrapper element as `container`. `ModalContent` (`container`, governance audit) and `DatePicker` (`container`) now have the same passthrough (see each component's source/doc). A portal redirected into the scoped wrapper is an ordinary DOM descendant of it, so it gets the region's full token set via the CSS in §12.1.

### 12.1 CSS contract for nested / scoped regions — SC-03, fixed 2026-09-29

> **A scoped region paints no background (2026-10-05).** `scoped` / `data-theme` switches every token inside the region, but the region element itself has no background unless you give it one. A light region inside a dark page then shows light-theme text on the page's dark background — found by the `storybook-dark` test pass (`Scoped theme region` story: `text-secondary` #5a5a5a on #1c1c1c, 2.47:1). Give the region its own surface, e.g. `className="bg-sds-background-base"`.

Any element carrying `data-theme="light"` or `data-theme="dark"` — `<html>`, a `scoped` wrapper, or any nested element — gets the **complete** semantic token set for that theme, including a light region inside a dark page (or OS-dark root) and vice versa. Generated by `buildThemeBlocks()` in `scripts/build-tokens.mjs`:

```css
:root, [data-theme="light"] { --color-sds-<role>--ref: <light primitive>; … }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --color-sds-<role>--ref: <dark primitive>; … }  /* OS preference, root only — unchanged */
}
[data-theme="dark"] { --color-sds-<role>--ref: <dark primitive>; … }
:where([data-theme]) { --color-sds-<role>: var(--color-sds-<role>--ref); … }
```

Precedence: an explicit `[data-theme]` always wins over the OS preference (the `@media` block excludes a light root; the light/dark blocks are equal specificity with dark later, and each applies to the element that carries the attribute).

**Regression record (CLAUDE.md §33).**
- **What happened:** `ThemeProvider scoped` set `data-theme` on its wrapper but changed no colors (`FINDINGS.md` SC-03). Dark `--ref` overrides existed only for `:root[data-theme="dark"]` and the OS `@media` block; there was no `[data-theme="light"]` block at all; and the public `--color-sds-<role>: var(--…--ref)` was declared only on `:root`.
- **Why it was wrong:** a custom property whose value contains `var()` is resolved on the element that *declares* it; descendants inherit the resolved color, not the `var()` expression. Declaring the public name only on `:root` froze it to the root theme everywhere below, so even a correct nested `--ref` override could not reach custom `var()` CSS. The unit test only asserted the attribute was set, never a computed color.
- **Rule:** theme blocks must not be `:root`-qualified, must exist for both light and dark, and every public semantic variable must be re-bound on `:where([data-theme])`. `pnpm test:tokens` enforces the block completeness; `pnpm test:foundation` enforces the rendered result.
- **How it is tested:** `scripts/quality/verify-motion-and-theme.mjs` renders nested dark-in-light, light-in-dark, dark-in-light-in-… regions under four root/OS combinations (`light`/`light`, `dark`/`light`, none/`dark`, `light`/`dark`) and asserts computed `background-color` for both a library utility and a custom `var()` element — expected colors are derived from `scripts/global.css`'s own light/dark mapping, never hardcoded. Mutation-verified: pre-fix `dist/index.css` → 24 failures; `:where([data-theme])` re-bind removed → 16; dark block `:root`-only → 12; light block `:root`-only → 12; restored → 0.
- **Component side (fixed 2026-09-29):** `scoped` mode used to set `data-theme` in a layout effect, so the attribute was absent from SSR HTML and a scoped region could flash the root theme before hydration (SC-03's second half). The scoped wrapper now renders `data-theme` as a real attribute (omitted when `unmanaged`), so it is in the server HTML — see §14 and `ThemeProvider.hydration.test.tsx`. Residual: a scoped region in `mode="system"` renders `light` on the server (the OS preference is unknowable there; `getThemeScript()` only covers `<html>`) and switches after hydration.

## 13. Portal Compatibility

Direct consequence of §11's root-scoping default: **zero special handling needed for the default (non-scoped) case.** Every one of Sun's Radix-portalled components (Modal, DropdownMenu, Tooltip) already renders correctly-themed content today, with no ThemeProvider at all, because `[data-theme="dark"]` on `documentElement` cascades to `document.body` and everything under it regardless of React-tree position — this is not a new guarantee this proposal introduces, it is an already-true fact this proposal must not accidentally break. For `scoped` mode, see §12's honest caveat.

## 14. SSR / RSC / Hydration

This is the section where the market research's Near-Universal Practice #1/#2 must be reconciled with a genuinely Sun-specific constraint the benchmarked libraries don't share.

**The constraint:** Production certification found a real, reproducible RSC failure in Sun's own root bundle (`createContext is not a function` under Next's `react-server` condition, because the root bundle is one non-code-split file eagerly importing every component's Radix dependencies). `ThemeProvider` is itself built on `createContext` — if it is shipped only as part of the same root bundle, importing it in a Server Component would hit an analogous failure. **Mitigation, consistent with Repository architecture review's own established pattern:** ThemeProvider ships its own dedicated subpath export (e.g. `@sun-asterisk/nova/theme-provider`), built via the same per-component mechanism every other component already uses. *(Superseded 2026-09-29: the root and all subpaths are now one module graph with `'use client'` on client-boundary modules, so the root import is RSC-safe too.)* Since ThemeProvider itself has zero Radix dependency, its own subpath bundle is trivially small and does not drag in anything RSC-unsafe.

**The FOUC problem, and why this proposal ships two artifacts, not one (§4):** `ThemeProvider` (a Client Component — self-declared via its own `'use client'` directive, unlike `Button`/`Modal`; see §13's rejected-API entry for why the original "consumer adds it" convention doesn't transfer to a root-wrapping provider) can still legitimately render literal HTML — including a `<script>` — that Next.js will include in the initial server-rendered payload, since `'use client'` governs hydration, not SSR exclusion. However, tying the FOUC-prevention script's *placement* to wherever the consumer happens to mount `<ThemeProvider>` is fragile: if a consumer wraps only part of their tree (a common, legitimate pattern — see the hostile-review scenario "consumer uses only Button"), the script needs to run at the true document root regardless of where the React-level provider sits. **Therefore this proposal separates the two concerns physically**: a small, standalone `ThemeScript` export (or, per §27, a documented raw snippet) that the consumer places directly in their own root `<head>` — a Server Component-compatible artifact, following exactly the MUI (`InitColorSchemeScript`) / Mantine (`ColorSchemeScript` + `mantineHtmlProps`) precedent of "a separate, explicitly-placed thing," not bundled invisibly inside the context provider's own render output.

**Known, accepted friction (not hidden):** React 19 emits an "Encountered a script tag" console warning for a component-rendered `<script>`, a known, currently-unresolved, library-wide issue (confirmed present even in `next-themes` itself per the benchmark). This proposal accepts this as a cosmetic, documented limitation rather than engineering around it prematurely — see §29.

**`suppressHydrationWarning`** must be documented as required on whatever element `ThemeScript` mutates (`<html>`, typically), for the same universal reason every benchmarked library needs it: React did not render that attribute, so it will otherwise warn about a mismatch it didn't cause.

**Hydration-safe mode resolution (SSR-01, fixed 2026-09-29).** `suppressHydrationWarning` only covers the `<html>` attribute the script writes — it does **not** cover React-rendered output that depends on the theme (e.g. a component rendering `useTheme().mode`). An earlier implementation read the stored preference inside a `useState` initializer, so on a real SSR page whose stored mode differed from `defaultMode`, the client's hydration render produced different text than the server HTML: React #418, and React discarded the server HTML and client-re-rendered the whole root (found by an external React Router SSR consumer — `sun-design-system-consumers/react-router-ssr/scripts/probe-theme-hydration.mjs`). The rule now:

- The stored preference is read via `useSyncExternalStore` with a **server snapshot of "nothing stored" (→ `defaultMode`)**, the same pattern `system` mode already used for `prefers-color-scheme` (server snapshot → `light`). During hydration, `useTheme()` therefore returns exactly what the server rendered (`defaultMode`, and `light` for an unresolved `system`); React re-renders with the real stored/OS value immediately after hydration. Client-only (`createRoot`) mounts still read the stored value on their very first render.
- **Consequence for consumers:** theme-dependent *React output* (not CSS) shows the `defaultMode` value for the hydration pass and updates one render later. Colors never flash, because they come from the `data-theme` attribute, which the pre-hydration script already set correctly.
- During the hydration render the provider does **not** overwrite an existing `data-theme` attribute (it would otherwise replace the script's correct value with the server-snapshot value for a frame). If no script ran (attribute absent), it fills the attribute in immediately as before.
- Only an explicit `setMode()` call is persisted. The mount-time value is never written back (it is either what storage already holds, or `defaultMode`, which `getThemeScript()` falls back to by itself) — writing it during hydration would have replaced the user's stored preference with `defaultMode`.
- Controlled `mode`, nested passthrough (never persists), `scoped` (never reads/persists storage) and `storage={null}` are unchanged. Cross-tab `storage` events are not followed (unchanged; not part of the contract).

**Scoped regions in SSR HTML (2026-09-29).** A `scoped` provider's wrapper `<div>` renders `data-theme={resolvedTheme}` during render (not from a layout effect), so the region is already themed in the server HTML and needs no script; hydration matches because a scoped provider never reads storage (its mode is `mode`/`defaultMode` on both sides). `system` in a scoped region resolves to `light` on the server and updates after hydration. `unmanaged` scoped providers render no attribute. The layout effect still performs transition suppression on a runtime switch for scoped regions.

Tested by `src/components/themeProvider/ThemeProvider.hydration.test.tsx` — real `renderToString` + `hydrateRoot` in Chromium, asserting no `onRecoverableError`/`console.error`, the stored mode after hydration, the stored value not overwritten, no `data-theme` flip away from a pre-hydration script value, and `data-theme` present in scoped SSR markup (failed before the scoped change); each root-mode assertion was mutation-verified (fails with the old server snapshot / without the hydration-pass attribute guard / with mount-time persistence).

## 15. Runtime Theme Switching

A `setMode` call updates React state → an effect writes the new `data-theme` value → the CSS cascade repaints instantly (no component re-render required, since — per §1 — no component subscribes to theme state to compute its own styling). This is a direct, structural advantage of Sun's CSS-cascade-only styling model over CSS-in-JS libraries (Ant Design) where a theme change can trigger real re-computation cost across the tree.

## 16. Transition Strategy

Adopts the `next-themes`-pioneered technique documented in the benchmark: on a mode change, inject a temporary `* { transition: none !important }` stylesheet, force a synchronous reflow, remove it on the next animation frame. Default-on (`disableTransitionOnChange` opts out), matching the shadcn/community-default configuration, since an un-suppressed switch produces a visibly worse UX (every transitioning element in the app animating at once) with no compensating benefit.

## 17. Accessibility

- **`prefers-reduced-motion` governs the transition-suppression mechanism itself** (§19) — not just component-level animations. If the OS requests reduced motion, no crossfade/transition treatment is applied to the theme switch at all (the switch is instant either way, in both the "suppressed" and "reduced-motion" cases — the only difference is that with reduced-motion, Sun does not even consider adding a deliberate crossfade effect in the future without re-checking this preference first).
- **No new keyboard/focus surface** — ThemeProvider itself renders no interactive DOM element. Any theme-toggle UI (a switch/button reading `useTheme()`) is the consumer's own component, built from Sun's existing `Switch`/`Button` — already accessible, nothing new to verify here beyond what's already certified.
- **No accessible-name/ARIA requirement** on `ThemeProvider` itself, since it has no visual or interactive representation.

## 18. TypeScript API

Strict, matching `component-api-conventions.md` §11: `ThemeProviderProps`/`ThemeMode` always exported, no `any`, no `@ts-ignore`. `useTheme()`'s return type is a plain object, not a tuple, for named-property clarity (consistent with how `useFieldIds()` already returns a named object rather than a tuple — an existing Sun convention, not a new one).

## 19. Consumer DX

- One documented, copy-pasteable snippet for the common case (uncontrolled, root-scoped, system default) — no configuration required to get correct, flash-free light/dark/system behavior.
- The `unmanaged` escape hatch (§10) documented explicitly for the "I already have my own theme system" consumer, rather than leaving them to discover the conflict the hard way.
- `README.md`'s Next.js section (already corrected once in Repository architecture review for the RSC/subpath-import issue) gains a parallel, explicit theming section — closing the exact documentation gap identified in §1.
- `component-api-conventions.md` gains a new §15 "Theming" section once this ships — confirmed by direct inspection that no such section exists yet.

## 20. Storybook Integration

Closes a confirmed, currently-total gap (`.storybook/preview.ts` has zero theme configuration today). Add a global theme toolbar (Storybook's standard `globalTypes` + a `withThemeByDataAttribute`-style decorator, setting `data-theme` on the preview iframe's root) so every existing and future story can be previewed in light/dark without per-story wiring. This is additive to every existing story — no story file needs to change.

## 21. Testing Strategy

Every layer of the existing, real `/test` system (Quality system-11) applies, with no new layer invented:

- **Unit** (`test:unit`): mode resolution logic (`system` → live `matchMedia` tracking, controlled/uncontrolled resolution, persistence read/write) — pure logic, exactly the kind of thing `Switch.test.tsx` already demonstrates the pattern for.
- **Storybook** (`test:storybook`): a real rendered light↔dark↔light round-trip assertion via `getComputedStyle`, using the **exact method Production certification already proved works** (not token-parity alone).
- **API** (`test:api`): `test/api/themeProvider.test-d.tsx` — fixtures for `ThemeProviderProps`/`useTheme()`.
- **Package** (`test:package`): the new subpath export resolves via both `import()`/`require()`, exactly like every other component subpath.
- **Tokens** (`test:tokens`): unaffected — this feature adds no new tokens.

## 22. Performance

No component re-render is triggered by a theme switch (§15) — the only cost is the CSS cascade repainting, which happens regardless of ThemeProvider's existence today. The `matchMedia` listener is a single subscription, torn down when not in `system` mode. No measurable bundle-size concern: the entire mechanism is native browser APIs (`matchMedia`, `localStorage`) plus a small amount of React state — no new runtime dependency (see §27 for why a `next-themes` dependency was considered and rejected specifically for a *library*, not an app).

## 23. Security / Isolation Considerations

- `storageKey` is namespaced (`'sun-theme'` default, not a generic `'theme'`) to avoid colliding with a consumer's own storage key of the same name.
- No secret or credential ever touches this feature.
- The FOUC-prevention script (§14) is a static, auditable string with no dynamic interpolation of consumer-controlled data beyond the theme mode enum itself — no injection surface.
- Shadow DOM / iframe embedding: `document.documentElement` in an iframe context resolves to that iframe's own document root, which is the CORRECT, expected behavior for an embedded widget wanting its own independent theme state — no special handling needed beyond documenting this is how it behaves (relevant to §12's scoped-theme discussion for the "embedded widget" case).

## 24. Migration From SunThemeProvider

**Not applicable.** Confirmed by repository-wide search: no `SunThemeProvider`/`ThemeProvider` exists anywhere in `src/` today. This is a greenfield addition, not a migration.

## 25. Backward Compatibility

**Fully additive, zero breaking change.** Every existing component continues to resolve its own styling via the CSS cascade exactly as it does today, with or without `ThemeProvider` present. A consumer who continues to manually set `data-theme` themselves (today's only option) is unaffected — nothing about this proposal changes what `data-theme="dark"` means or how `scripts/global.css` responds to it.

## 26. Public API Surface

New exports only, following Sun's established subpath-per-component convention (Repository architecture review):

```
@sun-asterisk/nova            → ThemeProvider, useTheme (root, code-split per Repository architecture review)
@sun-asterisk/nova/theme-provider → ThemeProvider, useTheme, ThemeMode, ThemeProviderProps
```

`ThemeScript` (§14) ships from the same subpath. Nothing existing is renamed, removed, or altered.

## 27. Rejected Alternatives

| Alternative | Why rejected |
|---|---|
| Depend on `next-themes` directly | Chakra v3's move *to* it is real evidence it's the right call **for an application**. A component **library** forcing a runtime dependency onto every consumer is a different risk: version coupling, and a real conflict scenario when a consumer's own app *already* uses `next-themes` for its own theming, now with two independent managers touching `data-theme`. Sun's own `unmanaged` mode (§10) exists specifically to let a consumer keep using `next-themes` (or anything else) for the DOM-attribute-setting job while still getting `useTheme()`. The underlying mechanism is small enough (native `matchMedia`/`localStorage`, no polyfills) that owning it in-house is proportionate for a library, unlike for an app where `next-themes`' Next.js-specific conveniences pay for the dependency. |
| A MUI/Chakra/Ant-Design-style JS theme-object model | §6 — no Sun component reads one; building it anyway is pure unused surface area. |
| Wrapper-scoped-by-default CSS variables (Radix Themes' default) | §11 — introduces a portal-compatibility cost (confirmed in Radix's own docs) for every consumer, to support a scoped-theme use case most consumers don't need. Offered as an explicit opt-in (§12) instead. |
| No theme provider at all (React Aria/Headless UI's position) | Valid for a headless behavior layer with no visual opinion of its own; does not transfer to Sun, which already ships fully-styled, opinionated components with a real, currently-unproductized dark mode already built and tested. |
| Split `ColorModeProvider` + `ThemeProvider` | §5 — no second orthogonal axis exists yet to justify the composition overhead. |
| A full design-token JS object exposed via `useTheme()` | Same reasoning as the rejected theme-object model (§6) — `useTheme()` exposes only `mode`/`resolvedTheme`/`setMode`, the minimum a real, demonstrated use case (rare JS-level theme-awareness) needs. |
| ~~Baking `'use client'` directly into `ThemeProvider.tsx`'s source~~ — **superseded during the governance audit's implementation, see below** | Originally rejected as a new, inconsistent convention (no existing Sun component self-declares it). A real `next build` disproved this for ThemeProvider specifically: unlike a leaf component, ThemeProvider's entire purpose is to wrap an app's root layout, which App Router forces to be a Server Component by default — there is no file the consumer controls that can serve as the client boundary in that position. Confirmed via real build failure (`TypeError: createContext is not a function`); fixed by self-declaring `'use client'` after all. |

## 28. Market Benchmark

Condensed conclusions of the market research this proposal acts on:

- **Root-scoped CSS variables**, a **pre-hydration inline script**, **`suppressHydrationWarning`**, a **live `matchMedia` subscription for `system` mode**, and **transition suppression during a switch** are near-universal, settled practice across every mature library surveyed that ships a theme system — this proposal adopts all five as defaults, not as novel design.
- **Tailwind v4's own documentation explicitly lists `[data-theme="dark"]` as one of two sanctioned dark-mode patterns** — Sun's existing mechanism is confirmed-idiomatic, not improvised.
- **Radix UI Themes' wrapper-scoping default** is the one mechanism this proposal deliberately does *not* copy as the default, precisely because its own docs document the portal-breakage cost — informing §11/§12 directly.
- **Chakra UI v3's move to depend on `next-themes`** is the strongest signal against building a bespoke runtime — engaged with directly and specifically rejected for this library's own risk profile in §27, not ignored.

## 29. Risks

| Risk | Severity | Mitigation / status |
|---|---|---|
| React 19 "script tag" console warning from `ThemeScript` | Low (cosmetic) | Accepted, documented (§14) — an unresolved, library-wide issue, not unique to this design |
| ~~`Modal` lacks the `container` prop `DropdownMenuContent`/`TooltipContent` already have~~ | — | **Resolved** (governance audit): `ModalContent` has a `container` prop (and `DatePicker` has one too), so scoped-theme + portal redirect works for every portal-based component — pass the scoped wrapper (via `ref`) as `container`. See §12 and `docs/components/modal.md` §4 |
| A consumer's own theme system conflicts with Sun's default (non-`unmanaged`) mode, both trying to own `data-theme` | Medium | `unmanaged` mode (§10) is the designed mitigation — must be prominent in docs, not a buried option |
| FOUC script correctness across the diversity of real SSR setups (Next.js Pages Router vs. App Router vs. non-Next SSR) | Medium | Cannot be fully verified without a real Next.js project per app-router variant — flagged explicitly as requiring the same real-build verification Production certification used, not simulated |
| Scoped mode's portal caveat being missed by a consumer | Low-Medium | Must be documented as prominently as Radix Themes documents it for their own users — an honest limitation, not hidden |

## 30. Open Decisions

Requiring explicit approval before or during implementation, per this repository's own established Stop-Condition discipline (CLAUDE.md §38):

1. ~~**Should `Modal` gain a `container` prop now**~~ — **Closed:** yes; `ModalContent` gained `container` in governance audit, so scoped-theme mode is consistent across Modal, DropdownMenu, Tooltip (and DatePicker).
2. **Exact default `storageKey`** (`'sun-theme'` proposed) — cosmetic, but worth confirming before it becomes part of the public contract.
3. **Whether `ThemeScript` ships as a component or as a documented raw string/function the consumer inlines themselves** — both satisfy §14's separation-of-concerns requirement; the former is slightly nicer DX, the latter sidesteps the React-19-script-tag-warning question entirely by never being a React-rendered element in the consumer's tree. This is a real, unresolved tradeoff, not a rhetorical one.
4. **Whether a second orthogonal axis (e.g. brand/accent) is anticipated soon enough to influence §5's single-provider decision now** — this proposal assumes no (§5's evidence-based reasoning), but this is the kind of decision this document's own Section 25 principle (`docs/architecture/component-development-system.md`) says must be an explicit approval, not a silent assumption baked in.

## 31. Implementation Plan

Only after the open decisions in §30 are resolved and this proposal is approved:

1. `ThemeProvider.tsx`, `ThemeProvider.styles.ts` (N/A — no visual styling of its own, likely omitted), `useTheme.ts`, `ThemeScript.tsx`, `index.ts` at `src/components/themeProvider/` (or a `src/foundation/`-style location if the repository-architecture review from Repository architecture review suggests theming belongs outside `components/` — **this itself is a small, additional open decision** not previously listed, added here for completeness: does a non-visual, no-DOM-of-its-own capability belong in `src/components/` alongside Badge/Button/etc., or does it warrant a new top-level boundary? Repository architecture review's own repository-architecture document did not anticipate a foundation-level provider and should be consulted/amended if this is approved).
2. Register the new subpath in `package.json`'s `exports` and `typesVersions`, exactly matching the existing per-component pattern (the single `vite.config.ts` build discovers `src/components/*/index.ts` automatically — `vite.esm-components.config.ts` was removed 2026-09-29).
3. Storybook global theme toolbar + decorator (§20).
4. Unit tests (mode resolution, persistence, `matchMedia` subscription lifecycle including StrictMode double-invoke safety).
5. Storybook interaction test: the real rendered light↔dark↔light round-trip (§21), reusing Production certification's proven method.
6. `test/api/themeProvider.test-d.tsx` addition.
7. Documentation: `README.md` theming section, `component-api-conventions.md` new §15, `design.md` dark-mode section expansion.
8. Full `/test full` + a real external-consumer package check (Production certification's method) before calling this Certified.

## 32. Acceptance Criteria

ThemeProvider is not "done" until, with real evidence (not "should work"):

- [ ] Light/dark/system all resolve correctly, verified via real `getComputedStyle`, not token inspection.
- [ ] `system` mode tracks a live OS preference change while running (a real `matchMedia` dispatch test, not just an initial-value check).
- [ ] No flash of wrong theme on a real SSR page load (verified with an actual Next.js build, per Production certification's own consumer-verification standard).
- [ ] No hydration-mismatch console error/warning under the documented `suppressHydrationWarning` setup.
- [ ] Every existing Modal/DropdownMenu/Tooltip story still renders correctly themed with zero code change to those components.
- [ ] The new subpath resolves via real `import()`/`require()` against a packed tarball, exactly like every other component subpath (the production-certification method).
- [ ] `prefers-reduced-motion` genuinely suppresses the transition treatment (a real media-query-mocked test, not an assumption).
- [ ] Full `/test full` passes with zero Critical findings.
