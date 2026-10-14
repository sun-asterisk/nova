# `Link` — Component Specification

## 1. Identity

- **Figma component name:** "Link" (node `16337:8408`, documentation page node `16399:10751`)
- **Figma file:** `FIGMA_FILE_KEY` — Sun Design System (`fSzxt8wKkXsn8fmxkPBUr2`)
- **Figma node/component URL:** `https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Nova%EF%BD%9CMaster?node-id=16399-10751`
- **Code Connect:** `Link.figma.ts` → `16337:8408` (added 2026-10-07): Size → `size` (large omitted), State=Disabled → `disabled` (Hover is CSS), Prefix/Suffix Icon → `startAdornment`/`endAdornment` via `getInstanceSwap`; `href="#"` is a placeholder (Figma has no URL)
- **Code name:** `Link`
- **Package export:** `@sun-asterisk/nova/link` (subpath), also re-exported from the package root
- **Category:** Simple Component
- **New in Figma:** confirmed via the page's own Update Log — "2026.08.06 — Link コンポーネントを新規作成" (Link component newly created) — this is a genuinely new component, not a rename/variant of an existing one. Classification: **E** (truly new component). Confirmed via Step 2 analysis that `Button`'s `asChild` polymorphism does not already cover this — Button has no underlined-text-only visual variant, and its own guideline explicitly separates the two: "処理の実行やモーダルの開閉は Button を使用" (use Button for executing actions or opening/closing a dialog).

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-10-07 via `/component Link --figma <url>` (Figma alignment: underline offset, icon tokens, Code Connect)
- **Owner/last touched by:** Workflow C (new component), 2026-09-10

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<a>` (enabled) or `<span>` (disabled) | `link` (native, when `<a>`) | The whole component is a single element — no compound/sub-parts |
| 2 | Start adornment | consumer-supplied `ReactNode` | — | Optional, before the label — indicates navigation direction/target |
| 3 | Label | `children` | — | The link text itself |
| 4 | End adornment | consumer-supplied `ReactNode` | — | Optional, after the label — commonly `IconExternalLink` for links leaving the site |

## 4. API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `size` | `'large' \| 'medium' \| 'small'` | `'large'` | No | Typography scale — matches Figma's own default |
| `disabled` | `boolean` | `false` | No | Renders as non-interactive text (`<span>`) instead of a real `<a>` — see §8 |
| `startAdornment` | `ReactNode` | — | No | Icon/element before the label |
| `endAdornment` | `ReactNode` | — | No | Icon/element after the label |
| `asChild` | `boolean` | `false` | No | Merges Link's classes/props onto its single child (via `Slot` from `radix-ui`) instead of rendering its own `<a>` — for router links (React Router `Link`/`NavLink`, Next.js `Link`) that must render their own anchor. Adornments are placed inside the child. With `disabled`, the child is **not** rendered (no navigation possible); its label renders as the usual non-interactive `<span aria-disabled="true">`. **New 2026-09-29 (RR-01)**, additive. **Limitation:** Slot merges `className` as strings, so a child whose `className` is a function (React Router `NavLink`'s `({ isActive }) => …`) cannot be combined with it — style the active state via `aria-current="page"` (NavLink sets it) instead |

Also extends `ComponentProps<'a'>` — every native anchor attribute (`href`, `target`, `rel`, `onClick`, etc.) passes through directly when enabled. When `disabled`, `href`/`onClick`/`target`/`rel` are intentionally NOT forwarded to the rendered `<span>` (see §8); all other attributes (`id`, `data-*`, `style`, `aria-*`) still are.

**Ref:** forwards to `HTMLAnchorElement | HTMLSpanElement` (a union, not a single concrete type) — which one depends on `disabled` at render time. With `asChild`, the ref reaches the child element (Slot ref composition).

**No `focus` prop.** Figma's own generated component code models `focus` as a boolean variant property, independent of `state` — but in code, focus is real browser state (`:focus-visible`), not a component prop; this matches `.claude/rules/design-foundation.md` §5.1's "Focus is a boolean, not a variant" rule exactly, and Figma's own choice to model it as an independent boolean (not a `state` variant value) is itself evidence for that same rule.

## 5. Composition & Customization

- **`startAdornment`/`endAdornment` (not Figma's `prefixIcon`/`suffixIcon` boolean+instance pair)** — matches `Input`'s existing naming convention for the same "optional icon before/after content" pattern, for consistency across the library, rather than mirroring Figma's own generated prop names 1:1 (same non-1:1 principle already established for `DropdownMenu`'s `MenuItem`).
- **`className` merge** via `cn()` — reaches the root element (whichever tag it renders as).
- **No compound API** — Link is a single element, not a multi-part composite; nothing to expose beyond the root.
- **`asChild` (RR-01, 2026-09-29)** — component-api-conventions.md §10 limits `asChild` to components with a demonstrated polymorphism need. Link has one: an external React Router SSR consumer could not give router links (`NavLink`, which renders its own `<a>` and handles client-side navigation) Link styling, and fell back to `Button asChild`. Default `false` (§10's default rule). Uses `Slot.Root` + `Slot.Slottable` from `radix-ui` so `startAdornment`/`endAdornment` land inside the child's anchor around its label.
  ```tsx
  import { NavLink } from 'react-router';
  <Link asChild endAdornment={<IconArrowRight />}>
    <NavLink to="/trips">Trips</NavLink>
  </Link>
  ```

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Enabled | `text-link` (blue), 1px underline | Real `<a href>` navigation | Native `link` role | `disabled: false` variant | `Default` |
| Hover | SAME color, underline thickens 1px → 2px | Real CSS `:hover` | No ARIA change | `hover:decoration-2` (no `hover:text-*`) | `InteractionHoverThickensUnderline` (class-list check; real-hover thickness verified externally — see the story's own comment on `userEvent.hover()`'s limitation) |
| Focus-visible | 2px `border-focus` outline, 3px offset, 2px corner radius | Real keyboard `Tab` | `:focus-visible` (native) | `focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-border-focus`, `rounded-50` | `InteractionFocusRing` |
| Disabled | `text-disable` (gray), 1px underline, no hover-thicken | Not focusable, not clickable, `Tab` skips over it entirely | `aria-disabled="true"` on a plain `<span>` (no native `disabled` semantics exist for anchors) | Conditional `<span>` render, `href`/`onClick`/`target`/`rel` withheld | `InteractionDisabledSkipsFocus`, `Link.test.tsx` |

## 7. Design Tokens — Figma Traceability

Figma source: `get_design_context` on node `16337:8408` ("Link"), confirmed 2026-09-10.

| Figma requirement | Value | Implementation |
|---|---|---|
| Size: Large | 16px / line-height 1.6 (25.6px), 18px icons | `typo-body-l` (exact match: `--font-size-sds-body-l`=1rem, `--line-height-sds-body-l`=1.6rem → ratio 1.6) |
| Size: Medium | 14px / line-height 1.6 (22.4px), 16px icons | `typo-body-m` (exact match: 0.875rem/1.4rem → ratio 1.6) |
| Size: Small | 12px / line-height 1.6 (19.2px), 14px icons | **Not** `typo-body-s`: that token is 0.75rem/1.3125rem → ratio **1.75**, not 1.6 — a genuine mismatch between Link's own spec and the shared Body-S text style, confirmed by comparing `get_design_context`'s literal `leading-[1.6]` (uniform across all 3 Link sizes) against `typo-body-s`'s generated CSS. Implemented as an arbitrary `leading-[1.6]` paired with the existing `--font-size-body-s` variable (per design-foundation.md §3's allowance when no token step expresses the value) |
| Underline: always visible, never removed | `decoration-solid`, `underline` unconditionally | `base` styles — no state removes it |
| Underline thickness: 1px (Enabled/Disabled), 2px (Hover) | `decoration-[1px]` / `decoration-[2px]` | `decoration-1` (base) / `hover:decoration-2` — **no color change on hover**, confirmed via Figma's own component description ("状態の変化も色に依存させません" — state changes must not depend on color either) |
| Focus ring | `border-2 border-focus`, `inset-[-3px]` (3px offset), `rounded-[2px]` | `focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-border-focus`, `rounded-50` (2px, exact token match) — 3px offset matches design-foundation.md §5.1's existing "3px for text elements" rule exactly, independently confirmed by this Figma component |
| Underline offset: 2px in every state | デザイン仕様 "太さ 1px / オフセット 2px", Hover "太さ 2px / オフセット 2px" | `underline-offset-2` (added 2026-10-07 — was the browser default) |
| Text color: Enabled/Hover | `text/link` (`#0464be`) | `text-text-link` |
| Text color: Disabled | `text/disable` (`#959595`) | `text-text-disable` |
| Icon color: Enabled/Hover / Disabled | `icon/link` / `icon/disable` (separate variables from the label's text tokens; same values today) | `[&_svg]:text-sds-icon-link` / `[&_svg]:text-sds-icon-disable` (2026-10-07 — icons previously inherited the text color) |
| Icon/text gap | 4px | `gap-50` |
| `whitespace-nowrap` on the label (every state) | Confirmed in Figma's own generated code, all 9 state combinations | `whitespace-nowrap` in `base` |
| Tap target: Medium/Small don't meet WCAG 2.2's 24×24px minimum alone | Guideline text: expand via invisible padding, without changing visible size | `py-25 -my-25` (Medium), `py-50 -my-50` (Small) — padding expands the real clickable box, matching negative margin cancels the added space in normal document flow |

## 8. Accessibility

- **Semantic element:** Real `<a href>` when enabled (per `.claude/rules/accessibility.md` §1.1 — navigation must use `<a href>`, never a styled `<button>`/`<div>`). When `disabled`, a plain `<span aria-disabled="true">` — per Figma's own explicit guidance: "Disabled は、無効な a 要素ではなく非対話のテキストとして描画してください" (render Disabled as non-interactive text, not a disabled `<a>` element — anchors have no native `disabled` attribute to begin with).
- **Not color alone (WCAG 1.4.1):** the underline is always visible (never removed) and hover is conveyed by thickness change, not color — confirmed as a deliberate Figma design decision, not an oversight.
- **Contrast (per Figma's own accessibility guideline section):** link text vs. surrounding body text ≥3:1; link text vs. background ≥4.5:1; focus ring vs. background ≥3:1 — all satisfied by the existing `text-link`/`border-focus` semantic tokens (already used and vetted elsewhere in the library), not newly-introduced values.
- **Touch target (WCAG 2.5.8):** Medium/Small expand their real clickable box via padding to meet the 24×24px minimum, without visually changing size (see §7).
- **Focus management:** real keyboard `Tab` reaches the link (when enabled) and shows the ring; `Tab` skips over it entirely when disabled (native behavior of a non-focusable `<span>` with no `tabIndex`) — both verified via `InteractionFocusRing`/`InteractionDisabledSkipsFocus`.

## 9. Theming

- `text-link`, `text-disable`, `border-focus` are all semantic tokens — theme-aware by construction, no hardcoded hex anywhere in `Link.styles.ts`.

## 10. Market Benchmark

Not independently benchmarked against MUI/Radix/Chakra/etc. in this pass — Link's scope is narrow enough (a single-element text link, no compound API, no controlled/uncontrolled state) that the API surface has little room for meaningful divergence between libraries. `startAdornment`/`endAdornment` naming was chosen for internal consistency with `Input` rather than from external precedent.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Self-authored `outline-none` + `focus-visible:outline-*` tailwind-merge collision (the exact P0 bug class documented in design-foundation.md §5.1) | Caught and fixed during this component's own initial implementation, 2026-09-10, before ever being committed as a "final" version | Fixed — removed the erroneous unconditional `outline-none` before it shipped | `InteractionFocusRing` |
| `typo-body-s` mismatch for Small size (1.75 vs. Figma's 1.6 ratio) | This implementation, 2026-09-10 | Documented, implemented with an arbitrary `leading-[1.6]` — not silently forced onto the existing token | N/A (a token-value question, not a component behavior bug) |
| Underline offset missing; icons used text tokens; no Code Connect | Figma alignment, 2026-10-07 | Fixed | `Link.figma.test.tsx` (light + dark; sizes, icon sizes, colors, offset — mutation-verified, icon tokens via scoped token overrides) |
| RR-01: no `asChild`, router links couldn't take Link styling | External consumer verification (React Router SSR), 2026-09-29 | Fixed — `asChild` via `radix-ui` Slot | `Link.test.tsx` "asChild" (4 tests, fail against the pre-change Link); `test/api/link.test-d.tsx`; `Link.stories.tsx` `AsChildRouterLink` |

## 12. Known Limitations

- **No fresh manual screen-reader verification** — relies on native `<a>`/`<span aria-disabled>` semantics being correct by construction (no custom ARIA role/state added), which is a defensible low-risk baseline, but not independently re-verified with VoiceOver/NVDA.
- **Real-hover underline-thickness change is not verified via `getComputedStyle()` inside the automated test suite** — `userEvent.hover()` does not reliably activate a plain CSS `:hover` pseudo-class in this environment (documented precedent: `Scrollbar`). `InteractionHoverThickensUnderline` verifies the correct CSS mechanism is wired up (class list) rather than the live computed value; the actual real-cursor behavior was not independently re-verified in a neutral non-Storybook browser for this component (unlike `Scrollbar`/`Checkbox`, which had dedicated neutral-page verification passes).
- **No dedicated pixel-measurement test** for the Medium/Small touch-target expansion (`py-25 -my-25`/`py-50 -my-50`) — implemented per the Figma guideline's intent, not verified via a real `getBoundingClientRect()` assertion confirming the clickable box actually reaches 24×24px.
- **Market benchmark not independently run** (§10).

## 13. Examples

```tsx
// Basic link
<Link href="/settings">Settings</Link>

// External link with a suffix icon
<Link href="https://example.com" target="_blank" rel="noopener noreferrer" endAdornment={<IconExternalLink />}>
  Visit our site
</Link>

// Smaller size
<Link size="small" href="/help">Help</Link>

// Disabled — renders as non-interactive text, not a disabled <a>
<Link disabled>Currently unavailable</Link>
```

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-10 (new component) | Workflow C | 15/15 | 14/15 | 15/15 | 15/15 | 9/10 | 10/10 | 5/5 | 9/10 | 5/5 | 97/100 | none | Verified |
| 2026-10-07 (Figma alignment) | `/component` F | 15/15 | 14/15 | 15/15 | 15/15 | 9/10 | 10/10 | 5/5 | 10/10 | 5/5 | 98/100 | none | Verified |

Composition -1: no compound API to speak of (a deliberate, correct simplicity for this component, but the scorecard has no "N/A" for this axis). Design/Tokens -1: the Small-size line-height had to be implemented as an arbitrary value rather than an existing token, due to a genuine mismatch between Link's own Figma spec and the shared `typo-body-s` text style (documented, not silently forced). Testing -1: the real-hover thickness change and the touch-target expansion are both implemented correctly per the spec but lack a fully independent real-browser/pixel-measurement verification pass (see §12).
