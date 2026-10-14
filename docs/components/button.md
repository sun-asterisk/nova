# `Button` — Component Specification

## 1. Identity

- **Figma component name:** "Button" — top-level documentation page frame `2002:1579`; the actual reusable component set lives nested inside it at `2557:1779` (5 `Style` × 3 `Size` × 4 `State` symbols: Primary/Secondary/Emphasis/Plain/Danger × Large/Medium/Small × Enabled/Hover/Active/Disabled). Verified live 2026-09-16 — querying node `2557:1779` directly against this repo's actual `FIGMA_FILE_KEY` (`fSzxt8wKkXsn8fmxkPBUr2`) returns the identical variant structure, confirming the component-set node (not the outer documentation page) is the correct mapping target — see `.claude/rules/figma-code-connect.md` §2.
- **Figma file:** `FIGMA_FILE_KEY` — Sun Design System (`fSzxt8wKkXsn8fmxkPBUr2`)
- **Figma node/component URL:** `https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System?node-id=2557-1779`
- **Code name:** `Button`
- **Package export:** `@sun-asterisk/nova/button` (subpath), also re-exported from the package root (`src/index.ts` re-exports `./components`)
- **Category:** Simple Component

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-10-05 via `/component Button <figma-url>` (Classification F — Icon Button sizing drift; resolved by `iconOnly`, plus Icon Button Code Connect mapping). Previous: 2026-09-16, Classification A
- **Last changes:** the `-sds-` token-namespace migration (2026-09-16) — a mechanical class rename, not a behavior change; the last behavior-affecting change was `asChild` polymorphism + `type="button"` default (logic audit / market benchmark remediation)

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<button>` (default) or the child element via `Slot` (`asChild`) | native `button` (default) | Single-element component — no compound/sub-parts. Children (label, icons) are consumer-supplied `ReactNode`, not distinct anatomical slots |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'emphasis' \| 'plain' \| 'danger'` | `'primary'` | No | Visual style — matches Figma's 5 `Style` values exactly | §5 |
| `size` | `'small' \| 'medium' \| 'large'` | `'small'` (component); `'small'` is also `buttonStyles`'s own `defaultVariants.size` | No | Matches Figma's 3 `Size` values exactly | §4 |
| `asChild` | `boolean` | `false` | No | Merges Button's props/styling/ref onto a single child element (via `@radix-ui/react-slot`) instead of rendering its own `<button>` — for rendering Button's visual treatment on a different semantic element (most commonly a link) | §10 |
| `iconOnly` | `boolean` | `false` | No | Renders Figma's **Icon Button** (component set `3700:7301`): a square button — width equals the size's height (32/40/48px) — with the label-sized `min-width` removed. Children are expected to be a single icon. The button then has no visible text, so an accessible name is required via `aria-label`/`aria-labelledby`/`title`; a missing one logs a one-time dev warning. **Added 2026-10-05** (Figma alignment, Classification F): before it, an icon-only Button rendered 40×32/52×40/64×48 instead of Figma's 32×32/40×40/48×48. Additive; default `false` keeps every existing usage unchanged | §5 (boolean modifier), §10 (no separate component — `figma-sync.config.json` maps Icon Button to a Button prop) |
| `type` | `ComponentProps<'button'>['type']` | `'button'` | No | Explicitly defaulted (not left to the browser's own `'submit'` default) so Button never accidentally submits a surrounding `<form>` — regression-tested (`Button.test.tsx`) | §2 (native attribute default) |

Also extends `ComponentProps<'button'>` — every native button attribute (`disabled`, `onClick`, `aria-*`, `data-*`, etc.) passes through directly. When `asChild` is true, these are forwarded to the child via `Slot` instead of a real `<button>`, and `type` is **not** forced onto the `asChild` target (verified: `Button.test.tsx` — "does not force a `type` attribute onto the asChild target").

**Ref:** forwards to `HTMLButtonElement` (`forwardRef<HTMLButtonElement, ButtonProps>`) — verified even through `asChild` (`Button.test.tsx` — "forwards a ref to the native button element").

**No `focus`/`hover`/`active` props.** Figma models these as `State` variant values, but in code they are real CSS pseudo-classes (`hover:`, `active:`, `focus-visible:` via `FOCUS_RING_OFFSET_2`) — matches `.claude/rules/design-foundation.md` §5.1 ("Focus is a boolean, not a variant") and is the same pattern already established on `Link`.

## 5. Composition & Customization

- **No compound API** — Button is a single element; `variant`/`size` cover the whole visual surface, consistent with `component-api-conventions.md` §5's variant-prop convention.
- **`asChild`** (§10): justified by a real, documented gap — `docs/architecture/market-benchmark.md` flagged Button as "the component most likely to need [polymorphism]" (top-priority recommendation #2) since MUI/Mantine/Chakra v3/Radix/shadcn all support rendering a button-styled element as a different tag (e.g. a router `<Link>`). Implemented via `@radix-ui/react-slot`'s `Slot`, the same mechanism already used correctly on `Tooltip`/`Modal`'s Trigger/Close.
- **`className` merge** via `cn()` — reaches the root element (whichever tag it renders as, `<button>` or the `asChild` target).
- **Icons as children, not dedicated props** — `WithStartIcon`/`WithEndIcon`/`IconOnly` stories render icons as plain JSX children before/after the label text, sized via the `[&_svg]:w-*` / `[&_svg]:h-*` variant classes rather than dedicated `startIcon`/`endIcon` props.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Enabled | Variant/size base styles | Real `<button>` click | Native `button` role, accessible name from children | `disabled: false` (default) | `Primary`/`Secondary`/`Emphasis`/`Plain`/`Danger` stories, `InteractionClick` |
| Hover | `hover:bg-sds-surface-*-hover` (per variant) | Real CSS `:hover` | No ARIA change | Tailwind `hover:` variant, no JS | covered visually by stories; no dedicated interaction test (hover-only assertions are a known cross-component limitation — see `Link.md` §12 precedent) |
| Active | `active:bg-sds-surface-*-active` (per variant) | Real CSS `:active` | No ARIA change | Tailwind `active:` variant | same as Hover — visual only |
| Disabled | `disabled:bg-sds-surface-disabled disabled:text-sds-text-disable` (+ `disabled:border-*` for Secondary/Danger) | Native `disabled` attribute — not focusable, not clickable | Native `disabled` semantics (implicit, no `aria-disabled` needed) | HTML `disabled` attribute passthrough | `Disabled` story, `InteractionDisabledBlocksClick` |
| Focus-visible | 2px `border-focus` outline (`FOCUS_RING_OFFSET_2`) | Real keyboard `Tab` | `:focus-visible` (native) | `FOCUS_RING_OFFSET_2` (`src/utils/focusRing.ts`) — never hand-typed, per `.claude/rules/design-foundation.md` §5.1 | `InteractionFocusRing` |
| `asChild` (polymorphic) | Same variant/size classes applied to the child element | Child owns its own semantics/behavior (e.g. router navigation) | Child is responsible for its own accessible role | `Slot` from `@radix-ui/react-slot` | `Button.test.tsx` (4 dedicated tests: renders child, applies classes, ref forwarding, `onClick` composition, no forced `type`) |

## 7. Design Tokens — Figma Traceability

Figma source: node `2557:1779`, verified live 2026-09-16.

| Figma requirement | Value | Implementation |
|---|---|---|
| Style: Primary | filled dark surface, on-surface text | `bg-sds-surface-primary` / `hover:bg-sds-surface-primary-hover` / `active:bg-sds-surface-primary-active`, `text-sds-text-on-surface` |
| Style: Secondary | outlined, base surface | `border border-sds-border-strong bg-sds-surface-base text-sds-text-primary` |
| Style: Emphasis | filled emphasis surface | `bg-sds-surface-emphasis` (+ hover/active variants), `text-sds-text-on-surface` |
| Style: Plain | no border, transparent | `border-none bg-transparent text-sds-text-primary` |
| Style: Danger | outlined, danger border/text | `border border-sds-border-danger bg-sds-surface-base text-sds-text-danger` |
| Size: Small/Medium/Large padding, gap, radius | per Figma's 3 size specimens | `p-sds-100/150/200`, `gap-1`/`gap-1`/`gap-2`, `rounded-sds-200` (uniform across sizes) |
| Size: min-width/height | 40/32px (S), 52/40px (M), 64/48px (L) | `min-w-[40px] h-[32px]` / `min-w-[52px] h-[40px]` / `min-w-[64px] h-[48px]` — arbitrary brackets, not a spacing-scale token (dimensions, not padding/margin — no token exists for this axis) |
| Typography per size | Label S/M/L Bold | `typo-label-s-bold` / `typo-label-m-bold` / `typo-label-l-bold` |
| Icon Button (`3700:7301`) — square | 32×32 (S), 40×40 (M), 48×48 (L); same padding, colors, states as Button | `iconOnly` → `aspect-square min-w-0` on top of the size's `h-[*]`/padding — width follows height, no new arbitrary value |
| Icon size per Button size | 16/20/24px | `[&_svg]:w-4 [&_svg]:h-4` (S) / `w-5 h-5` (M) / `w-6 h-6` (L) |
| Disabled | `surface-disabled` background, `text-disable` text | `disabled:bg-sds-surface-disabled disabled:text-sds-text-disable` (+ `disabled:border-sds-border-disable` for Secondary/Danger) |

No arbitrary Tailwind value substitutes for a token that exists — the two `[...]` brackets used (`min-w-[*]`/`h-[*]`) are fixed pixel dimensions on a non-spacing axis (component sizing, not padding/margin/gap), which is outside what the spacing/radius token scale expresses.

## 8. Accessibility

Verified via `Button.test.tsx`/`Button.variants.test.tsx`/`Button.stories.tsx` interaction tests (real rendered DOM), not source inspection alone.

- **Semantic element / role:** real `<button>` (native `button` role) — never a styled `<div>`/`<span>`, per `.claude/rules/accessibility.md` §1.1.
- **Accessible name:** from `children` (text content) — verified via `getByRole('button', { name: '...' })` in every interaction story. With `iconOnly` there is no visible text: the consumer must pass `aria-label`/`aria-labelledby`/`title` (`.claude/rules/accessibility.md` §5.2). A missing name logs a one-time `console.warn` during render (no hook — Button stays Server-Component-safe, same pattern as Badge's unlabeled-dot warning); skipped with `asChild`, where the child owns its semantics.
- **Keyboard interactions:** native `<button>` keyboard activation (`Enter`/`Space`) — no custom keyboard handling needed or added.
- **Focus management:** `FOCUS_RING_OFFSET_2` (2px outline, `border-focus` color) — the shared foundation focus-ring convention, not hand-typed. Verified via `InteractionFocusRing`.
- **Disabled semantics:** native `disabled` attribute (not `aria-disabled` + manual event-blocking) — correctly unfocusable and unclickable by browser default, verified via `InteractionDisabledBlocksClick`.
- **`type="button"` default:** prevents an accidental implicit form submission when Button is used inside a `<form>` without an explicit `type` — this was LOGIC-BUTTON-01 (a real, previously-found defect), now resolved and regression-tested (`Button.test.tsx` — "defaults to type=\"button\"").
- **No hardcoded color regression (LOGIC-BUTTON-02):** the `secondary` variant previously hardcoded `bg-white`, bypassing the semantic token layer — fixed to the semantic surface token (now `bg-sds-surface-base` post-migration) and permanently regression-tested in `Button.variants.test.tsx` (`it.each(['secondary', 'danger'])`, asserting both the real token IS present and no raw `bg-white`/`bg-black`/hex-bracket pattern is).

## 9. Theming

- **Light/dark behavior:** all variant colors are semantic `-sds-*` tokens (`bg-sds-surface-primary`, `text-sds-text-on-surface`, etc.) — theme-aware by construction, no hardcoded hex anywhere in `Button.styles.ts`.
- **Verification method used:** indirectly covered by `ThemeProvider.stories.tsx`'s `InteractionRuntimeSwitching` story, which uses a real `<Button variant="primary">` as its light↔dark round-trip probe (`getComputedStyle` before/after toggling `data-theme`) — this is the test that caught and drove the fix for the dark-mode regression found during the `-sds-` migration (the `--ref` indirection now required for every semantic color, documented in `scripts/build-tokens.mjs`).

## 10. Market Benchmark

Per `docs/architecture/market-benchmark.md`:
- **Strength:** "Clean variant/size API, correct native `disabled`" (line 305).
- **Previously identified gap, now resolved:** "No polymorphism, no `type=\"button\"` default" — both are implemented in the current code (`asChild` via `Slot`, `type = 'button'` default) and regression-tested.
- Compared against MUI (`component` prop), Mantine (`component` prop), Chakra v3/Radix/shadcn (`asChild`) — Sun's `asChild` mechanism (Radix `Slot`) matches the modern (Radix-family) convention rather than the older render-prop-style `component` pattern.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| LOGIC-BUTTON-01 (no `type="button"` default — risk of accidental form submission) | Logic audit | RESOLVED | `Button.test.tsx` — "defaults to type=\"button\"", "respects an explicit type" |
| LOGIC-BUTTON-02 (`secondary` variant hardcoded `bg-white`, bypassing semantic tokens) | Logic audit, closed Test certification | RESOLVED | `Button.variants.test.tsx` — `it.each(['secondary', 'danger'])` asserts real token present + no raw `bg-white`/`bg-black`/hex bracket |
| No `asChild` polymorphism | `market-benchmark.md` recommendation #2 (top priority) | RESOLVED | `Button.test.tsx` — 4 dedicated `asChild` tests (render, styling, ref, `onClick` composition, no forced `type`) |
| `Button.test.tsx` hangs when run alongside other files in the same Vitest+Playwright browser-mode process (unrelated to Button's own behavior — traced to the unified `radix-ui` barrel package's large pre-bundling surface) | Found/fixed 2026-09-10 | RESOLVED, with a residual environment flake | `scripts/quality/run-vitest-safe.mjs` isolates `Button.test.tsx`/`Button.variants.test.tsx` one-per-batch; a further "zero-result hang" retry was added 2026-09-16 after the isolated batch was still observed to occasionally hang with zero output |
| Icon-only Button not square (rendered 40×32/52×40/64×48 vs Figma Icon Button 32×32/40×40/48×48 — label `min-width` applied to an icon) | Figma alignment, 2026-10-05 | RESOLVED via `iconOnly` | `Button.iconOnly.test.tsx` — real computed sizes per size, width=height; labeled Button unchanged; a11y warning |
| Icon Button component set (`3700:7301`) had no Code Connect mapping | Figma alignment, 2026-10-05 | RESOLVED | `IconButton.figma.ts` |
| Code Connect mapping (`Button.figma.ts`, node `2557:1779`) | This spec pass, 2026-09-16 | Verified correct against the Nova Figma file | `pnpm run code-connect:check` |

## 12. Examples

```tsx
// Basic button
<Button variant="primary" size="medium">
  Click me
</Button>

// Button with a leading icon
<Button variant="secondary" size="large">
  <MdAdd />
  Add Item
</Button>

// Icon-only button (Figma "Icon Button") — square; needs an accessible name
<Button iconOnly variant="plain" size="small" aria-label="Close">
  <MdClose />
</Button>

// Polymorphic: render Button's visual treatment on a router Link
<Button asChild variant="primary" size="medium">
  <Link to="/settings">Settings</Link>
</Button>

// Disabled
<Button variant="danger" disabled>
  Delete
</Button>
```

## 13. Known Limitations

- **Contrast (Figma token values, not fixed here):** `pnpm figma:theme-check fSzxt8wKkXsn8fmxkPBUr2 2002-1579` (2026-10-05): Emphasis Hover light 3.16:1, Emphasis Active dark 3.50:1, Secondary/Plain Active light 4.16:1 (label text 12–16px bold → 4.5:1 required). Code matches Figma exactly; needs designer confirmation.

- **Figma's `State` axis has two schemas.** An older schema has `State = Enabled/Focus/Hover/Active/Disabled`; the current Nova file moved Focus to a separate `Focus` boolean (Focus Ring layer). Both are CSS `:focus-visible` in code, so the mappings keep `Focus: false` in the `State` enum (for the older schema) and map nothing for the boolean (`.claude/rules/figma-code-connect.md` §4).
- **`iconOnly` does not enforce a single icon child.** Text children would be squeezed into a square; the prop documents intent, it does not validate children.

- **Hover/Active states have no dedicated interaction test** — covered visually by Storybook stories only; `userEvent.hover()` does not reliably trigger real CSS `:hover` in this test environment (same documented limitation as `Link`/`Scrollbar`).
- **No independent screen-reader (VoiceOver/NVDA) verification pass** — relies on native `<button>` semantics being correct by construction (no custom ARIA added), a defensible low-risk baseline but not independently re-verified.
- **`Button.test.tsx`'s CI isolation is a documented workaround, not a root-cause fix** — the underlying Vitest+Playwright browser-mode multi-file hang (traced to the `radix-ui` barrel import elsewhere in the codebase, already fixed in `Button.tsx` itself) has a residual, not-fully-eliminated flake even when isolated (see `scripts/quality/run-vitest-safe.mjs`'s "ZERO-RESULT-HANG RETRY" note, 2026-09-15/16).
- **Market benchmark benchmarked at the library level, not independently re-run for this spec pass** (§10 cites the existing `market-benchmark.md` analysis rather than a fresh comparison).

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-16 (spec backfill, no code change) | `/component --audit`-equivalent (Classification A) | 15/15 | 14/15 | 15/15 | 15/15 | 10/10 | 10/10 | 5/5 | 9/10 | 5/5 | 98/100 | none | Verified |
| 2026-10-05 (Figma alignment: `iconOnly` + Icon Button Code Connect) | `/component Button` (Classification F) → Workflow D | 15/15 | 14/15 | 15/15 | 15/15 | 10/10 | 10/10 | 5/5 | 9/10 | 5/5 | 98/100 | none | Verified |

Composition -1: no compound API to speak of (correct simplicity, but the scorecard has no "N/A" for this axis — same as `Link`). Testing -1: Hover/Active states and screen-reader behavior lack independent real-browser verification (§13).
