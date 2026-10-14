<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Switch` — Component Specification

## 1. Identity

- **Figma component name:** Switch
- **Figma file:** `FIGMA_FILE_KEY` ("Nova｜Master", `fSzxt8wKkXsn8fmxkPBUr2`, the official file) — component set `8248:329` (`Value` = True/False, `Size` = Large/Medium, `State` = Enabled/Disabled/Hover, `Focus` boolean; 12 variants), documentation frame `10245:2939`. Re-inspected 2026-10-07.
- **Figma node/component URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System?node-id=10245-2939
- **Code name:** `Switch`
- **Package export:** `@sun-asterisk/nova/switch` (and root)
- **Category:** Radix wrapper — `@radix-ui/react-switch` (`SwitchPrimitive.Root`/`SwitchPrimitive.Thumb`)

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-09-07 via `/component Switch --figma <url>` (Figma-fidelity audit + fix)
- **Owner/last touched by:** Workflow D (modify), 2026-09-07

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root (tap-area wrapper) | `<button role="switch">` (`SwitchPrimitive.Root`) | The actual focusable/clickable element | Transparent, min 44x44px — Figma's own guideline requires this regardless of the visible track's smaller size |
| 2 | Track | `<span>` | Visible colored track | Same size/color/position as before this audit — `h-[24px] w-[40px]` (medium) / `h-[32px] w-[52px]` (large) |
| 3 | Thumb | `<span>` (`SwitchPrimitive.Thumb`) | Sliding handle | Grows wider on hover (see §7) |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `size` | `'medium' \| 'large'` | `'medium'` | No | Size of the switch | §4 (variant convention) |
| `classNames` | `{ track?: string; thumb?: string }` | — | No | Customizes the visible track/thumb — `className` itself targets the outer tap-area wrapper, not the track | §8 (classNames slot API) |

Extends `ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>` — `checked`, `defaultChecked`, `onCheckedChange`, `disabled`, and all native Radix Switch Root props pass through.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** `classNames` (§8) — a 2-part slot object (`track`/`thumb`), consistent with Input/TextField/TextareaField/Snackbar's existing slot APIs. A compound API (`Switch.Track`/`Switch.Thumb` subcomponents) was not justified — Switch has no case for a consumer needing to reorder or omit a part, only to restyle it.
- **`asChild`:** Not applicable — no evidence of need.
- **Internal parts a consumer can realistically reach without forking:** Track and thumb via `classNames`; the outer tap-area wrapper via `className` (as before, its default target).

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Unchecked | Track: `surface-secondary` (#b3bed0); thumb at track's left edge | Click/Space/Enter toggles | `aria-checked="false"`, `data-state="unchecked"` | Radix `data-state` + `checked` variant | `Switch.test.tsx`, `InteractionToggle` story |
| Checked | Track: `surface-primary` (#434343); thumb slides to right | Click/Space/Enter toggles | `aria-checked="true"`, `data-state="checked"` | same | same |
| Hover (unchecked/checked) | Thumb widens (20→24px medium, 28→32px large) + `shadow-level-1` glow | N/A | N/A | `group`/`group-hover:` from the outer 44x44 root (fires from anywhere in the tap area, not just the visible track) | `PixelDimensionsMatchFigma` story (thumb-width assertion); manually verified hover-from-padding-zone via a real browser |
| Disabled | Track/thumb: `surface-disabled`/`surface-disabled-strong` (#f2f2f2/#d5d5d5), no hover/press feedback | Native `disabled`, no toggle | `disabled` attribute | `disabled` variant | `Switch.test.tsx`, `InteractionDisabledBlocksToggle` story |
| Focus-visible | 2px `border-focus` pill ring, offset 2px, around the visible **track** (Figma `Focus` ring, 2026-10-07); the 44x44 tap area itself draws no outline | Tab reaches it; Space/Enter toggle | native `:focus-visible` on root | `group-focus-visible:outline-*` on track, `outline-none` on root | `Switch.figma.test.tsx` (light + dark, mutation-verified), `InteractionFocusRing` |

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Medium track 40x24, Large 52x32 | Figma metadata (`Value=True, Size=Medium/Large, State=Enabled` symbols) | `h-[24px] w-[40px]` / `h-[32px] w-[52px]` | `Switch.styles.ts` `size` variant (`track` slot) | `PixelDimensionsMatchFigma` | `Switch.stories.tsx` `play()` |
| Thumb 20x20 (medium) / 28x28 (large), 2px inset from track edges | Figma metadata (Handle `x=2,y=2`) | `border-2 border-transparent` on track (border-box eats 2px, centering the thumb via flex) | `Switch.styles.ts` `track` base + `thumb` size variant | `PixelDimensionsMatchFigma` | `Switch.stories.tsx` `play()` |
| Hover thumb width: medium 20→24, large 28→32 | Figma metadata (Hover Handle symbols) | `group-hover:w-[24px]` / `group-hover:w-[32px]` | `Switch.styles.ts` `compoundVariants` | — | manual real-browser verification |
| Hover shadow = Elevation/Lv.1 | Figma raw effect data on Hover Handle: `DROP_SHADOW #00000026 (0,1) r4 s1` + `DROP_SHADOW #00000033 (0,1) r2 s0` | `shadow-level-1` (`HOVER_SHADOW` constant) | `Switch.styles.ts` | — | manual real-browser verification |
| Checked track color `#434343` | `get_variable_defs`: `Surface/Primary` | `bg-surface-primary` (= `neutral-700` = `#434343`) | `Switch.styles.ts` `checked` variant | `AllStates` | manual verification |
| Unchecked track color `#b3bed0` | `get_variable_defs`: `Surface/Secondary` | `bg-surface-secondary` (= `gray-300` = `#b3bed0`) | `Switch.styles.ts` `checked` variant | `AllStates` | `PixelDimensionsMatchFigma` `play()` |
| Disabled colors `#f2f2f2`/`#d5d5d5` | `get_variable_defs`: `Surface/Disabled`/`Surface/Disabled Strong` | `bg-surface-disabled` / `bg-surface-disabled-strong` | `Switch.styles.ts` `disabled` variant | `DisabledUnchecked`/`DisabledChecked` | manual verification |
| Minimum 44x44 tap area | Figma's own "タップ領域" guideline text + redline metadata (a 44x44 `Range` rectangle centered over both track sizes) — also accessibility.md §6.1 | `min-w-[44px] min-h-[44px]` on the outer root | `Switch.styles.ts` `root` | `PixelDimensionsMatchFigma` | `Switch.stories.tsx` `play()` |

No arbitrary Tailwind bracket values remain that lack a Figma-measured justification.

## 8. Accessibility

Verified via real rendered DOM (`Switch.test.tsx`, `Switch.stories.tsx` `play()`) and a real browser (neutral, non-Storybook harness for the focus ring and hover-from-padding-zone checks).

- **Semantic element / role:** `<button role="switch">` (native Radix semantics).
- **Accessible name:** From `aria-label`/`aria-labelledby` (consumer-supplied) or an associated `<label>`.
- **Keyboard interactions:** Tab to focus, Space/Enter to toggle (native Radix behavior).
- **Focus management:** 2px `border-focus` ring, offset 2px, around the full 44x44 tap area — verified via real keyboard `Tab` + `getComputedStyle()`.
- **Disabled semantics:** Native `disabled` attribute; no hover/press feedback (verified: `disabled` variant overrides `checked` track color).
- **Screen reader behavior:** `aria-checked`/`data-state` reflect the current value in both controlled and uncontrolled usage (see `Switch.test.tsx`'s controlled→uncontrolled regression test).
- **Touch target:** Minimum 44x44px tap area (see §7) — a genuine gap found and fixed during this audit.

## 9. Theming

- **Light/dark behavior:** All colors are semantic tokens that already resolve correctly under `[data-theme="dark"]` — no Switch-specific dark-mode logic.
- **Verification method used:** the 4 layers of `references/theme-verification.md` (2026-10-07) — `figma:theme-check` (7/7 tokens, Light + Dark), `storybook` 14/14 + `storybook-dark` 14/14, token-resolved size/position/color/hover/focus tests for both sizes in a light and a dark region (`Switch.figma.test.tsx`), contrast N/A (no text).

## 10. Market Benchmark

Not deeply re-evaluated (scope was Figma-fidelity fixes). The tap-area/visible-track separation this audit introduced is a common accessible-toggle pattern (touch target larger than the visual control) seen across mature libraries; Sun's `classNames.track`/`classNames.thumb` slot API follows the same convention already established by Input/TextField/TextareaField/Snackbar.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Switch had no minimum 44x44 tap area — the clickable/focusable region was exactly the visible track's size (24x40 medium, 32x52 large) | 2026-09-07 Figma-fidelity audit | Fixed (per explicit direction) — restructured into an outer 44x44-minimum `root` wrapper + inner visible `track` | `Switch.stories.tsx` `PixelDimensionsMatchFigma` `play()` |
| `className` previously targeted the visible colored track directly; after the fix it targets the outer (invisible) tap-area wrapper instead | 2026-09-07 Figma-fidelity audit (introduced by the fix above) | Mitigated — added `classNames.track`/`classNames.thumb` so the visible parts remain reachable | `test/api/switch.test-d.tsx` (type contract) |
| Sizes, colors (checked/unchecked/disabled), thumb inset, hover width growth, and hover shadow were all independently verified against Figma and found already correct | 2026-09-07 Figma-fidelity audit | No change needed | `PixelDimensionsMatchFigma` `play()` |
| Focus ring drew a square around the transparent 44x44 tap area; Figma (new `Focus` boolean) draws a 2px pill ring 2px around the visible track | Figma alignment, 2026-10-07 | Fixed — ring on the track via `group-focus-visible:`; root `outline-none`; track transition narrowed to `background-color` (design-foundation.md §5.1 flash rule) | `Switch.figma.test.tsx` (mutation: no track ring / old root ring / `transition-all` each fail 4), `InteractionFocusRing` |
| Code Connect read `Active`, but the official file's property is `Value` → `checked={undefined}`; no accessible name in the generated code | Figma alignment, 2026-10-07 | Fixed — reads `Value` (falls back to `Active`, then `false`), emits a replace-me `aria-label` | mock-runtime harness |

## 12. Examples

```tsx
// Basic switch
<Switch aria-label="Enable notifications" />

// Controlled
const [checked, setChecked] = useState(false);
<Switch checked={checked} onCheckedChange={setChecked} aria-label="Dark mode" />

// Large switch
<Switch size="large" aria-label="Enable notifications" />

// Disabled
<Switch disabled aria-label="Enable notifications" />

// Customizing the visible track (className targets the tap-area wrapper, not the track)
<Switch classNames={{ track: 'ring-2 ring-blue-500' }} aria-label="Enable notifications" />
```

## 13. Known Limitations

- The `className`→outer-wrapper retargeting (§11) is a real behavior change for any existing consumer who previously styled the visible track via plain `className` — they must switch to `classNames.track`.
- Hover-from-padding-zone behavior (the enlarged 44x44 tap area triggering the same hover feedback as the visible track) was verified manually via a real browser in this session, but has no automated Playwright-driven regression test — `PixelDimensionsMatchFigma`'s `play()` only asserts static geometry, not hover interaction on the padding zone specifically.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 | D (modify) | 14/15 | 14/15 | 15/15 | 15/15 | 10/10 | 7/10 | 5/5 | 9/10 | 5/5 | 94/100 | none | Verified |
| 2026-10-07 | Figma alignment (Classification F) | 14/15 | 14/15 | 15/15 | 15/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 98/100 | none | Verified |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
