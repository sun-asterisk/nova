<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Badge` — Component Specification

## 1. Identity

- **Figma component name:** Badge
- **Figma file:** `FIGMA_FILE_KEY` ("Nova｜Master", `fSzxt8wKkXsn8fmxkPBUr2`, the official file) — component set `1065:507` (`Style` = Count / Dot / Label / Error, `Text`), documentation frame `2006:1708`. Re-inspected 2026-10-07. Note: the `Text` property is bound only to the Count text layer; Label's text is written directly in its `New` layer.
- **Figma node/component URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System?node-id=1065-507
- **Code name:** `Badge`
- **Package export:** `@sun-asterisk/nova/badge` (and root)
- **Category:** Simple Component — single presentational `<span>`, no internal state machine, no Radix primitive (`docs/architecture/component-capability-matrix.md` §1)

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-10-07 via `/component Badge --figma <url>` — visual already matched Figma in light and dark (now locked by `Badge.figma.test.tsx`); Code Connect Label text and Dot name fixed. Previously 2026-09-07 (Figma-fidelity audit + fix, `max`/`position` props).
- **Owner/last touched by:** Workflow D (modify), 2026-09-07

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<span>` (`role="img"` for `error` and a labelled `dot`; no role otherwise) | Plain text / named graphic — **not** a live region by default | The single rendered element for `count`/`label`/`error`; the outer 24x24 anchor box for `dot` |
| 2 | Dot indicator (variant `dot` only) | `<span aria-hidden="true">` | Decorative | The visible 10x10 circle, centered inside the root's 24x24 footprint |
| 3 | Error icon (variant `error` only) | `<svg>` (shared `IconExclamationCircle`) | Decorative | Scaled to 19.2px so its rendered ring matches Figma's proportions, centered in the root's 24x24 footprint |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `variant` | `'count' \| 'dot' \| 'label' \| 'error'` | `'count'` | No | Visual style variant | §4 (variant convention) |
| `label` | `string` | — | No | Text for `count`/`label` variants | — |
| `max` | `number` | `undefined` (no truncation) | No | Truncates a numeric `label` to `` `${max}+` `` once it exceeds this value; no effect on non-numeric labels | — |
| `position` | `'top-right' \| 'top-left' \| 'bottom-right' \| 'bottom-left'` | `undefined` (static/inline) | No | Anchors the badge to a corner via absolute positioning; the ancestor still needs its own `position: relative` | — |
| `children` | `ReactNode` | — | No | Overrides default content for any variant | §6 (content override) |

Extends `Omit<ComponentProps<'span'>, 'children'>` — all other native span attributes (`className`, `aria-label`, `onClick`, `id`, etc.) pass through.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Neither — Badge is a single element with no internal parts a consumer would need to target independently (only the `dot`/`error` variants have an inner decorative node, and it's deliberately not customizable since it's purely presentational).
- **`asChild`:** Not applicable — no evidence of need; Badge is always a `<span>`.
- **Internal parts a consumer can realistically reach without forking:** None beyond the root — `className` on the root plus `children` override covers all observed use cases.

## 6. State Matrix

Badge has no interactive states (not focusable, no hover/active/disabled) — it's a passive, non-operable indicator per Figma's own component description ("非操作の小型標識" / "a non-operable small-scale indicator"). N/A — no state matrix applies.

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Count/Label pill height 20px | Figma metadata (node `1065:504`/`3127:1743`: pill height 20, centered in 24-tall symbol) | `py-50` (spacing-50 = 4px) + `typo-label-s-*` (12px/12px line-height) = 4+12+4=20px | `Badge.styles.ts:15-37` | `PixelDimensionsMatchFigma` | `Badge.stories.tsx` `play()` |
| Count/Label horizontal padding 8px | Figma metadata (text x-offset) | `px-100` (spacing-100 = 8px) | `Badge.styles.ts:17,34` | `PixelDimensionsMatchFigma` | `Badge.stories.tsx` `play()` |
| Count/Label radius (pill) | Figma: fully rounded | `rounded-full` | `Badge.styles.ts:18,35` | `PixelDimensionsMatchFigma` | `Badge.stories.tsx` `play()` |
| Count font-weight 400 | Figma generated code: `font-normal` (node `883:1946`) | `typo-label-s-regular` | `Badge.styles.ts:19` | `PixelDimensionsMatchFigma` | `Badge.stories.tsx` `play()` |
| Label font-weight 700 | Figma generated code: literal `font-bold` (node `3127:1745`) — a prior fix (commit `6057da4`) had assumed 600/SemiBold without re-checking Figma | `typo-label-s-bold` | `Badge.styles.ts:36` | `PixelDimensionsMatchFigma` | `Badge.stories.tsx` `play()` |
| Dot/Error 24x24 anchor footprint | Figma metadata (nodes `1065:505`, `1065:506`: 24x24 outer symbol) | `w-[24px] h-[24px]` | `Badge.styles.ts:21-26,42-45` | `PixelDimensionsMatchFigma` | `Badge.stories.tsx` `play()` |
| Dot visible circle 10x10, centered | Figma metadata (node `1065:505`: ellipse 10x10 at (7,7) within 24x24) | `badgeDotIndicatorClassName` (`Badge.styles.ts`) | `Badge.tsx` (inner `aria-hidden` span) | `PixelDimensionsMatchFigma` | `Badge.stories.tsx` `play()` + `Badge.test.tsx` |
| Error icon ring proportions (outer r=8, ~1.36px thick) | Figma raw SVG export (node `1065:506`) vs. shared `IconExclamationCircle` (r=10, 2px ring) | `IconExclamationCircle` scaled to 19.2px (24 × 8/10) | `Badge.tsx` (error branch) | `Error` | none — visual-only, not asserted by `play()` |
| Colors (`bg-surface-emphasis`, `text-icon-danger`, `text-text-on-surface`) | Figma fills `#DD2305` | semantic tokens, already correct pre-audit | `Badge.styles.ts` | all | none |

No arbitrary Tailwind bracket values remain in `Badge.styles.ts` except `w-[24px]`/`h-[24px]`/`w-[10px]`/`h-[10px]` (icon/decorative-element sizing, not spacing/radius — outside design-foundation.md §3's scope) and `min-w-[10px] min-h-[10px]` (defensive, prevents flex-shrink collapsing the dot).

## 8. Accessibility

Verified via real rendered DOM (`Badge.test.tsx`) and a real browser (`Badge.stories.tsx` `play()`).

- **Semantic element / role (changed 2026-09-29, RR-02):** Badge is **not a live region by default**. It previously rendered `role="status"` on every badge, which made static labels/counts behave as status-update regions (accessibility.md §2.1 reserves live regions for *asynchronously updating* content) and was reported by an external consumer as noise inside Tab triggers. Now:
  - `count` / `label` / custom `children`: a plain `<span>` with no role and no `aria-label` — the visible text is the accessible content (an `aria-label` on a role-less `<span>` is `aria-prohibited-attr`).
  - `error`: `role="img"` with the built-in name `"Error badge"` (overridable with `aria-label`).
  - `dot`: `role="img"` once the consumer supplies `aria-label`/`aria-labelledby`; unlabelled it stays a role-less decorative span (a nameless `role="img"` would itself be a violation) and warns.
  - **Opt-in live region:** if a badge's value genuinely updates while the user is on the page and should be announced (e.g. an unread counter), pass `role="status"` yourself — native props are spread last, so it wins: `<Badge label={String(unread)} role="status" />`.
  - **Migration note:** tests that located a Badge via `getByRole('status')` must switch to `getByText(...)` (count/label) or `getByRole('img', { name })` (dot/error), or pass `role="status"` explicitly.
- **Accessible name:** `count`/`label` expose their (possibly `max`-truncated) visible text; `error` has a built-in name (`"Error badge"`) independent of `label`; `dot` has no built-in name — the consumer must supply `aria-label` (tested; documented as consumer responsibility, matching accessibility.md §4.3's "status indicators must include a text label" via the accessible name rather than visible text).
- **Server Components (NX-02, 2026-09-29):** Badge uses no React hooks and is RSC-safe. The unlabelled-`dot` `console.warn` used to live in a `useEffect`, which made Badge throw in a Server Component ("useEffect only works in Client Components"); it now runs during render, deduplicated to once per module instance. Tested by calling Badge's render function outside React (which throws on any hook call).
- **Keyboard interactions:** None — not focusable, not operable.
- **Focus management:** N/A — no focus ring, not in the tab order.
- **Disabled semantics:** N/A — Badge has no disabled state.
- **Screen reader behavior:** The `dot`/`error` variants' inner decorative elements (circle, icon) are `aria-hidden="true"` so they never contribute to the accessible name — verified in `Badge.test.tsx`.

## 9. Theming

- **Light/dark behavior:** All colors are semantic tokens (`bg-surface-emphasis`, `text-icon-danger`, `text-text-on-surface`) that already resolve correctly under `[data-theme="dark"]` per the existing token pipeline — no Badge-specific dark-mode logic.
- **Verification method used:** the 4 layers of `references/theme-verification.md` (2026-10-07) — `figma:theme-check` (3/3 tokens, Light + Dark; on-surface on emphasis 4.86:1 light / 5.39:1 dark), `storybook` 9/9 + `storybook-dark` 9/9, token-resolved size/color tests for every variant in a light and a dark region (`Badge.figma.test.tsx`, mutation-verified), all-state contrast PASS.

## 10. Market Benchmark

Not evaluated during the initial Figma-fidelity pass (that scope was fixing existing bugs, not API expansion); two identified gaps vs. MUI/Ant Design were closed as a same-day follow-up after explicit direction to add them:

- **`max` (KEEP, adapted):** MUI's `Badge` `max` prop auto-truncates numeric `badgeContent`. Adapted here as an opt-in `max?: number` that only affects a numerically-parseable `label` (Sun's `label` is a generic string, unlike MUI's typed `badgeContent`), truncating to `` `${max}+` `` — matches Figma's own guideline text about limiting displayed digits for readability ("文字数の制限").
- **`position` (ADAPT, deliberately lighter-weight):** MUI/Ant Design's Badge *wraps* `children` and positions itself internally (`<Badge badgeContent={4}><IconButton/></Badge>`). Rejected that pattern here — it would make Badge own its children's rendering, contradicting this repo's existing composition philosophy (`CLAUDE.md`: "a component should not unnecessarily own its children's rendering"; every other Sun component is composed, not wrapping). Instead, `position` only adds corner-anchoring classes (`absolute` + offset + `z-10`) to Badge itself; the consumer still supplies their own `position: relative` wrapper around both the target and the Badge, matching Sun's existing minimal, non-owning API style.
- Offsets (`-1`/`-4px`) are a reasonable, common convention, not Figma-sourced — no anchor-position spec exists in Figma for Badge.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Label font-weight was 600 (`font-semibold`), Figma specifies 700 (`font-bold`) | 2026-09-07 Figma-fidelity audit (this session); regressed once already by commit `6057da4` | Fixed | `Badge.stories.tsx` `PixelDimensionsMatchFigma` `play()` |
| Count/Label pill rendered 24px tall via arbitrary `py-[6px]`; Figma specifies 20px | 2026-09-07 Figma-fidelity audit | Fixed | `Badge.stories.tsx` `PixelDimensionsMatchFigma` `play()` |
| Count/Label used raw `text-[12px]`/`font-*`/`leading-[100%]` instead of `typo-*` utilities (design-foundation.md §2 violation) | 2026-09-07 Figma-fidelity audit | Fixed | `Badge.stories.tsx` `PixelDimensionsMatchFigma` `play()` |
| Error icon (shared `IconExclamationCircle`, r=10/2px ring) didn't match Figma's bespoke Badge/Error glyph (r=8/~1.36px ring) | 2026-09-07 Figma-fidelity audit | Fixed (icon reused, scaled to 19.2px — not a pixel-perfect ratio match, see §13) | none — visual only |
| Dot rendered as a bare 10x10 element; Figma reserves a 24x24 anchor footprint (matching Count/Label/Error) | 2026-09-07 Figma-fidelity audit | Fixed | `Badge.stories.tsx` `PixelDimensionsMatchFigma` `play()`, `Badge.test.tsx` |
| NX-02: `useEffect` (dot warning) broke Badge in a React Server Component | 2026-09-29 external consumer verification (Next 16 RSC probe) | Fixed (warning moved to render, once per module) | `Badge.test.tsx` "uses no React hooks (RSC-safe)", "warns only once per module" |
| RR-02: every Badge was a `role="status"` live region, even static counts/labels | 2026-09-29 external consumer verification (React Router SSR) | Fixed (no live region by default; `role="status"` opt-in via native prop; `role="img"` for dot/error) | `Badge.test.tsx` "is not a live region by default", "opt in … role=\"status\"", dot/error `role="img"` tests |
| Code Connect: a Label badge emitted the `Text` property (default `"99"`) instead of its visible text — Figma binds `Text` only to Count; Label's text lives in the `New` layer | Figma alignment, 2026-10-07 | Fixed — Label reads the `New` text layer | mock-runtime harness (2026-10-07) |
| Code Connect: Dot emitted `<Badge variant="dot" />` with no accessible name (the case Badge itself warns about) | Figma alignment, 2026-10-07 | Fixed — emits a replace-me `aria-label="Describe the status"` (same pattern as `IconButton.figma.ts`) | mock-runtime harness |
| No token-resolved / dark-mode assertion of the Figma sizes and colors | Figma alignment, 2026-10-07 | Added `Badge.figma.test.tsx` (light + dark) | mutation: pill height, label weight, dot size, error color each fail 2 tests |

## 12. Examples

```tsx
// Count badge with a number
<Badge variant="count" label="5" />

// Dot indicator — MUST supply an aria-label since it has no visible text
<Badge variant="dot" aria-label="Unread notifications" />

// Label badge
<Badge variant="label" label="New" />

// Error indicator — has a built-in accessible name
<Badge variant="error" />

// Custom content (overrides label/icon)
<Badge variant="count">🔥</Badge>

// Numeric truncation ("150" renders as "99+")
<Badge variant="count" label="150" max={99} />

// Anchored to a corner — wrapper needs its own `position: relative`
<div className="relative inline-flex">
  <Avatar />
  <Badge variant="dot" position="top-right" aria-label="Online" />
</div>
```

## 13. Known Limitations

- **Figma との既知の差分（フォント）**: Figma ではこのコンポーネントの一部のテキストに Label/En 系スタイル（欧文 Inter）が使われているが、実装では Inter を使わない（既定 `system-ui`、ブランドフォントは Noto Sans JP）。Dev Mode の `font-family: Inter` はコードに書き写さない。Figma 側は今後の更新で Noto Sans JP に統一予定（`design.md` §3.1）。
- Count/Label's rendered width is ~0.3–0.5px off Figma's exact px value (e.g. 31.28px vs. Figma's 31px) — caused by `system-ui` vs. the Figma file's web-font metrics, which is this project's deliberate, documented font policy (design-foundation.md §2), not a bug.
- The `error` variant's icon reuses the shared `IconExclamationCircle` scaled to 19.2px rather than an exact-ratio recreation of Figma's bespoke glyph — the ring renders at ~1.6px thick vs. Figma's ~1.36px (both proportionally scaled from different base ratios). Deliberate trade-off (per explicit direction) to avoid a near-duplicate icon file; visually very close but not pixel-identical.
- Dot's 24x24 anchor footprint is a real layout-behavior change for any external consumer of the published package who had manually positioned Dot assuming a 10x10 box. No in-repo consumer existed before this fix (checked via repo-wide grep).
- `position`'s corner offsets (`-4px`, `z-10`) are a reasonable common convention, not a Figma-sourced spec — no anchor-position example exists in Figma for Badge.
- `max` only truncates when `label` parses as a finite number (`Number(label)`) — a label like `"5 new"` is left untouched, which is intentional (no silent misparsing) but means malformed numeric-looking strings won't truncate either.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 | D (modify) | 14/15 | 13/15 | 14/15 | 14/15 | 9/10 | 7/10 | 5/5 | 8/10 | 5/5 | 89/100 | none | Verified |
| 2026-09-07 (follow-up) | D (modify) | 14.5/15 | 14/15 | 14/15 | 14/15 | 9/10 | 7/10 | 5/5 | 9/10 | 5/5 | 91.5/100 | none | Verified |
| 2026-10-07 | Figma alignment (Classification F, Code Connect only) | 14.5/15 | 14/15 | 14.5/15 | 14/15 | 9/10 | 10/10 | 5/5 | 10/10 | 5/5 | 96/100 | none | Verified |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
