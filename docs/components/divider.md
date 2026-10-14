<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Divider` — Component Specification

## 1. Identity

- **Figma component name:** Divider / Horizontal, Divider / Vertical
- **Figma file:** `FIGMA_FILE_KEY` ("Nova｜Master", `fSzxt8wKkXsn8fmxkPBUr2`, the official file) — two property-less components: `Divider / Horizontal` (`977:1950`, mapped by `Divider.figma.ts`) and `Divider / Vertical` (`2692:1756`, mapped by `DividerVertical.figma.ts` since 2026-10-07). Re-inspected 2026-10-07.
- **Figma node/component URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System?node-id=2006-1755
- **Code name:** `Divider`
- **Package export:** `@sun-asterisk/nova/divider` (and root)
- **Category:** Primitive — purely presentational separator; hand-rolled `<div>`, not `@radix-ui/react-separator` (`docs/architecture/component-capability-matrix.md` §4)

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-09-07 via `/component Divider --figma <url>` (Figma-fidelity audit + fix)
- **Owner/last touched by:** Workflow D (modify), 2026-09-07

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<div role="separator">` | Semantic separator | The single rendered element — a directional 1px border (`border-t` for horizontal, `border-l` for vertical) on a 0-sized box |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | No | Direction of the separator line | §4 (variant convention) |
| `flexItem` | `boolean` | `false` | No | Stretches a vertical divider to fill its flex container's cross-axis (`self-stretch`) | §7 (1–2 orthogonal booleans are fine) |

Extends `Omit<ComponentProps<'div'>, 'children'>` — `children` is intentionally omitted since Divider never renders it (a real defect this repo's own capability matrix had flagged before it was fixed pre-dating this audit).

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Neither — single element, no internal parts.
- **`asChild`:** Not applicable — no evidence of need (`component-api-conventions.md` explicitly names Divider as a component with no legitimate polymorphism need).
- **Internal parts a consumer can realistically reach without forking:** None beyond the root — `className` covers all observed use cases (including supplying the divider's own margin, see §7).

## 6. State Matrix

Divider is non-interactive (not focusable, no hover/active/disabled). N/A — no state matrix applies.

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Line thickness 1px | Figma raw SVG export (nodes `977:1950`/`2692:1756`): `<path stroke="#E7E7E7">`, default 1px stroke width, no explicit `stroke-width` | `border-t`/`border-l` (Tailwind default border width = 1px) on a 0-sized box | `Divider.styles.ts` (`orientation.horizontal`/`orientation.vertical`) | `PixelDimensionsMatchFigma` | `Divider.stories.tsx` `play()` |
| Line color `#E7E7E7` | Figma raw SVG export | `border-border-weak` (= `--color-sds-neutral-100` = `#e7e7e7`) | `Divider.styles.ts` `base` | `PixelDimensionsMatchFigma` | `Divider.stories.tsx` `play()` |
| No built-in margin | Figma's own real usage examples show the gap around a divider varies by context: 8px between dense list items (node `3366:2568`, y-gap computed from list-item positions), 16px inside a card/module (node `3363:2245`), 32px between page-level sections (node `3325:1037`) — no single default exists | none — margin removed entirely, left to the consumer | `Divider.styles.ts` (no `my-*`/`mx-*` in `base` or variants) | `PixelDimensionsMatchFigma` | `Divider.stories.tsx` `play()` |

No arbitrary Tailwind bracket values remain in `Divider.styles.ts`.

## 8. Accessibility

Verified via real rendered DOM (`Divider.test.tsx`, 3 tests) and a real browser (`Divider.stories.tsx` `play()`).

- **Semantic element / role:** `<div role="separator">`.
- **Accessible name:** None — Divider is decorative/structural, not a labeled region.
- **Keyboard interactions:** None — not focusable, not operable.
- **Focus management:** N/A.
- **Disabled semantics:** N/A.
- **Screen reader behavior:** `aria-orientation="vertical"` is set only when `orientation="vertical"` (omitted, not `"horizontal"`, for the default) — matches `component-api-conventions.md`'s reference example for "set an ARIA attribute directly only when the component has information the headless layer doesn't."

## 9. Theming

- **Light/dark behavior:** `border-border-weak` is a semantic token that already resolves correctly under `[data-theme="dark"]` per the existing token pipeline — no Divider-specific dark-mode logic.
- **Verification method used:** the 4 layers of `references/theme-verification.md` (2026-10-07) — `figma:theme-check` (`Border/Weak` Light + Dark), `storybook` + `storybook-dark`, token-resolved 1px `border-weak` tests for both orientations in a light and a dark region (`Divider.figma.test.tsx`, mutation-verified), contrast N/A (decorative separator).

## 10. Market Benchmark

Not deeply re-evaluated (scope was Figma-fidelity fixes). The removed built-in margin brings Divider in line with MUI/Ant Design's convention (their `Divider`/`Divider` primitives carry no built-in margin either — spacing is the consumer's responsibility via `sx`/className or the surrounding layout).

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Divider rendered as a 2px-thick line, not Figma's 1px — `base` had an unconditional `border` (all 4 sides) alongside a contradictory `border-none` in the same string; tailwind-merge drops the earlier `border-none` (same conflict-resolution behavior documented in `Checkbox.styles.ts` for `outline`), so the divider actually got a full border box (1px top + 1px bottom stacked on a 0-height box = 2px rendered), not a single 1px edge | 2026-09-07 Figma-fidelity audit | Fixed | `Divider.stories.tsx` `PixelDimensionsMatchFigma` `play()` |
| Divider forced an unconditional 8px margin (`my-[8px]`/`mx-[8px]`) that didn't match Figma's own varied real-world spacing (8/16/32px depending on context) | 2026-09-07 Figma-fidelity audit | Fixed (margin removed entirely, per explicit direction) | `Divider.stories.tsx` `PixelDimensionsMatchFigma` `play()` |
| Code Connect mapped only `Divider / Horizontal`; selecting a `Divider / Vertical` instance in Dev Mode showed no code | Figma alignment, 2026-10-07 | Fixed — `DividerVertical.figma.ts` → `<Divider orientation="vertical" />` | `code-connect:check` (both nodes valid) |
| No token-resolved / dark-mode assertion of the 1px `border-weak` line | Figma alignment, 2026-10-07 | Added `Divider.figma.test.tsx` (light + dark) | mutation: wrong color fails 4, 2px horizontal/vertical each fail 2 |
| `component-capability-matrix.md`/`market-benchmark.md` claimed `children` was silently dropped and `aria-orientation` was missing — both were already fixed in the current code before this audit; those docs are stale | Discovered during this audit's reconnaissance | Not fixed (out of scope — stale doc, not stale code) | N/A |

## 12. Examples

```tsx
// Horizontal divider — consumer controls the surrounding gap
<div className="flex flex-col gap-4">
  <p>Above</p>
  <Divider />
  <p>Below</p>
</div>

// Vertical divider in a flex layout
<div className="flex items-center gap-2" style={{ height: '100px' }}>
  <span>Left</span>
  <Divider orientation="vertical" flexItem />
  <span>Right</span>
</div>
```

## 13. Known Limitations

- No built-in margin (see §7/§11) — this is a deliberate behavior change from the prior version; any existing consumer relying on the old unconditional 8px margin must now add their own spacing.
- No "full-width vs. partial-width" variant prop — Figma's guideline text distinguishes these only as *usage patterns* (how wide a container the consumer places the divider in), not a distinct Figma component variant; confirmed via `get_metadata` showing a single symbol per orientation with no variant properties.
- Code Connect emits `orientation="vertical"` without `flexItem`; stretching to a flex row's height is a layout decision left to the consumer.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 | D (modify) | 15/15 | 14/15 | 15/15 | 15/15 | 10/10 | 7/10 | 5/5 | 9/10 | 5/5 | 95/100 | none | Verified |
| 2026-10-07 | Figma alignment (Classification F, Code Connect only) | 15/15 | 14/15 | 15/15 | 15/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 99/100 | none | Verified |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
