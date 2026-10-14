<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Tooltip` — Component Specification

## 1. Identity

- **Figma component name:** Tooltip
- **Figma file:** `FIGMA_FILE_KEY` ("Nova｜Master", `fSzxt8wKkXsn8fmxkPBUr2`, the official file) — component set `9639:4097` (`Label`, `Placement` = Top/Bottom/Right/Left), documentation frame `10245:3230`. Re-inspected 2026-10-07 (bubble, arrow, guideline: 0.5s delay, immediate hide on leave/blur/Esc/outside click, prefer top, collision order top → bottom → right → left).
- **Figma node/component URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System?node-id=10245-3230 (documentation page); actual component: node `9639:4097`
- **Code name:** `Tooltip` (compound: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`)
- **Package export:** `@sun-asterisk/nova/tooltip` (and root)
- **Category:** Pattern / Composite Component — a documented, fixed 4-part composition recipe over `@radix-ui/react-tooltip`

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-09-07 via `/component Tooltip --figma <url>` (Figma-fidelity audit + fix)
- **Owner/last touched by:** Workflow D (modify), 2026-09-07

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | `TooltipProvider` | context provider, no DOM node | Coordinates delay/skip-delay timing across all tooltips in scope | Mount once near the app root, not per-`Tooltip` |
| 2 | `Tooltip` | context provider, no DOM node | Manages open/close state | Controlled or uncontrolled (`open`/`onOpenChange`, or uncontrolled) |
| 3 | `TooltipTrigger` | the child element itself (`asChild` defaults to `true`) | The hover/focus target | No wrapper DOM node introduced — Radix's `Slot` merges trigger props onto the child directly |
| 4 | `TooltipContent` | `<div role="tooltip">` inside a `Portal` | The floating popup | Contains `children` + a `TooltipPrimitive.Arrow` |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `TooltipProvider.delayDuration` | `number` | `500` | No | ms before showing on hover/focus — matches Figma's own guideline text ("0.5秒後に情報を表示") | — |
| `TooltipProvider.skipDelayDuration` | `number` | `0` | No | ms grace period for moving between triggers without re-incurring the delay | — |
| `TooltipTrigger.asChild` | `boolean` | `true` (flipped from Radix's own `false`) | No | Merges trigger props onto the child element instead of wrapping it in a `<button>` | §10 (documented default-flip precedent) |
| `TooltipContent.sideOffset` | `number` | `8` | No | Distance in px from the trigger | — |
| `TooltipContent.container` | `ComponentProps<Portal>['container']` | `document.body` | No | Redirects where the tooltip portal mounts | market-benchmark.md §"Portal container passthrough" |

Extends Radix's own `Root`/`Trigger`/`Content`/`Provider` props directly (`ComponentProps<typeof TooltipPrimitive.*>`) — no custom fields beyond the ones above.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Compound (4 separate exports) — the right choice here since a consumer genuinely composes different children into `Trigger`/`Content` (component-api-conventions.md §8's part-count rule: a fixed 2-part slot object doesn't fit a pattern this compositional).
- **`asChild`:** Justified and precedented — `TooltipTrigger` deliberately flips Radix's own default (`false`→`true`) with the rationale in its own JSDoc: an un-flipped default would wrap the child in an extra `<button>`, which breaks when the child is already an interactive element (a real accessibility concern, not a stylistic preference).
- **Internal parts a consumer can realistically reach without forking:** `TooltipContent`'s `className` (merged via `cn()`), `container` for portal redirection.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Closed | Not rendered | N/A | N/A | Radix `data-state="closed"` | `InteractionFocusShowEscapeHide` story |
| Delayed-open (hover) | Fades in (`fade-in-0`) | Shows after `delayDuration` (500ms default) | `role="tooltip"` | `data-[state=delayed-open]:animate-in` | `CustomDelay` story |
| Instant-open (focus) | Fades in immediately | Shows on keyboard focus with no delay | same | `data-[state=instant-open]:animate-in` | `InteractionFocusShowEscapeHide` story |
| Closing | Fades out | Hides on: pointer leaves trigger, trigger loses focus, Escape, or an outside click — all confirmed against Figma's own guideline text | `data-state="closed"` | `data-[state=closed]:animate-out` | `InteractionFocusShowEscapeHide` story |

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Padding 8px/4px | Figma raw export (node `9639:4097`): `px-[var(--100,8px)] py-[var(--50,4px)]` | `px-100 py-50` | `Tooltip.tsx` `TooltipContent` | all | manual real-browser verification |
| Radius 4px | Figma raw export: `rounded-[var(--radius\/100,4px)]` | `rounded-100` | `Tooltip.tsx` | all | manual real-browser verification |
| Background `#333333` | Figma raw export: `bg-[var(--background\/container-inverse,#333)]` | `bg-background-container-inverse` | `Tooltip.tsx` | all | already correct pre-audit |
| Text white | Figma raw export: `text-[color:var(--text\/on-surface,white)]` | `text-text-on-surface` | `Tooltip.tsx` | all | already correct pre-audit |
| Typography 12px/400/1.75 line-height | Figma: "Body/Ja - S" role | `typo-body-s` | `Tooltip.tsx` | all | already correct pre-audit |
| Shadow = Elevation/Lv.3 | Figma raw effect data on the live component (not the summary table, which said level-2 but self-contradicted with a "2〜3" range elsewhere) — two-layer `DROP_SHADOW #00000026 (0,3) r8 s3` + `DROP_SHADOW #00000033 (1,1) r3 s0` | `shadow-level-3` | `Tooltip.tsx` | all | manual real-browser verification (exact rgba/offset/blur/spread match confirmed) |
| Max-width 240px | Figma raw export: `max-w-[240px]` | `max-w-60` (Tailwind scale, numerically equal — no dedicated max-width token category exists) | `Tooltip.tsx` | `LongText` | — |
| Arrow width 12px | Figma raw export: all 4 placement variants use `w-[12px]` for the Arrow Container | `width={12}` on `TooltipPrimitive.Arrow` | `Tooltip.tsx` | all | already correct pre-audit |
| Arrow sticks out 4px | Figma Arrow Container is 12×4 (the 12×6 vector overlaps the bubble by 2px) | `height={4}` (was 5, 2026-10-07) | `Tooltip.tsx` | all | `Tooltip.figma.test.tsx` (4 sides, light + dark) |
| z-index | No Figma equivalent (z-index isn't a Figma property) — aligned to the repo's own actual convention instead | `z-50`, matching DropdownMenu/DatePickerPopover/Modal's overlay (all real code, not `design.md`'s aspirational/unimplemented z=100/200 diagram) | `Tooltip.tsx` | — | manual real-browser verification (`getComputedStyle().zIndex === '50'`) |

No arbitrary Tailwind bracket values remain that lack a Figma-measured or convention-based justification.

## 8. Accessibility

Verified via real rendered DOM (`Tooltip.test.tsx`, 4 tests) and a real browser (`Tooltip.stories.tsx`'s `InteractionFocusShowEscapeHide` `play()`, using a custom `isElementVisible()` helper — Radix renders the tooltip text twice, once visible and once as a visually-hidden accessible-name fallback, so a plain "is this text in the document" check isn't sufficient).

- **Semantic element / role:** `role="tooltip"` (native Radix).
- **Accessible name:** The tooltip's own text content; Radix also injects a visually-hidden duplicate as an accessible-name fallback mechanism (confirmed present by design, not a bug).
- **Keyboard interactions:** Tab to focus the trigger (shows instantly, no delay); Escape dismisses.
- **Focus management:** No focus trap (tooltip is non-interactive by design — Figma's own guideline explicitly forbids putting operable elements inside one).
- **Disabled semantics:** N/A at the Tooltip level — a documented workaround (wrap a disabled trigger in `<span>`, since disabled elements don't fire the hover/focus events tooltips need) exists in `DisabledButton` story.
- **Screen reader behavior:** Verified via the `isElementVisible()`-gated interaction test.

## 9. Theming

- **Light/dark behavior:** All colors are semantic tokens that already resolve correctly under `[data-theme="dark"]` — no Tooltip-specific dark-mode logic.
- **Verification method used:** the 4 layers of `references/theme-verification.md` (2026-10-07) — `figma:theme-check` (2/2 tokens, Light + Dark; on-surface on container-inverse 12.63:1 / 13.78:1), `storybook` + `storybook-dark`, token-resolved bubble/arrow tests rendered into a light and a dark `data-theme` region via `container` (`Tooltip.figma.test.tsx`), contrast PASS.

## 10. Market Benchmark

Not deeply re-evaluated (scope was Figma-fidelity fixes). `market-benchmark.md` previously listed "no Portal container passthrough" as a gap for Tooltip — already fixed in the current code (a `container` prop exists) before this audit; that specific doc line is stale, not a real gap.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Arrow stuck out 5px; Figma's Arrow Container is 4px | Figma alignment, 2026-10-07 | Fixed — `height={4}` | `Tooltip.figma.test.tsx` (mutation: back to 5 or wrong fill each fail 8) |
| No token-resolved / dark-mode assertion of the bubble | Figma alignment, 2026-10-07 | Added `Tooltip.figma.test.tsx` | mutation-verified |
| `z-9999` was a real outlier vs. every other floating component in the repo (`z-50` on DropdownMenu ×2, DatePickerPopover, Modal's overlay) | 2026-09-07 Figma-fidelity audit | Fixed | manual real-browser verification |
| `rounded`/`px-2`/`py-1` (bare Tailwind scale) produced correct pixel values but didn't route through this repo's named token classes | 2026-09-07 Figma-fidelity audit | Fixed → `rounded-100`/`px-100`/`py-50` | manual real-browser verification |
| Shadow was `shadow-level-2`, but the live Figma component's applied effect is literally "Elevation/Lv.3" — `design.md`'s own summary table said level-2 while its z-layer diagram already (self-contradictorily) said "2〜3" | 2026-09-07 Figma-fidelity audit | Fixed → `shadow-level-3` (per explicit direction); `design.md` §4.4/§6.1/§6.2 updated to match | manual real-browser verification (exact rgba/offset/blur/spread match) |
| No `.test.tsx` existed — Trigger/Content ref forwarding and the `asChild=true` default's "no wrapper element" behavior were unverified by any DOM assertion | 2026-09-07 Figma-fidelity audit | Fixed — added `Tooltip.test.tsx` (4 tests) | `Tooltip.test.tsx` |
| `market-benchmark.md` claimed no Portal `container` passthrough exists | Pre-existing (found during this audit's reconnaissance) | Not fixed — stale doc claim, code already correct | N/A |

## 12. Examples

```tsx
// Once, near your app root:
<TooltipProvider>
  <App />
</TooltipProvider>

// Anywhere inside it:
<Tooltip>
  <TooltipTrigger>
    <button>Hover me</button>
  </TooltipTrigger>
  <TooltipContent>Tooltip text</TooltipContent>
</Tooltip>

// Disabled trigger — wrap in a span since disabled elements don't fire hover/focus
<Tooltip>
  <TooltipTrigger asChild>
    <span>
      <button disabled>Disabled</button>
    </span>
  </TooltipTrigger>
  <TooltipContent>Why this is disabled</TooltipContent>
</Tooltip>
```

## 13. Known Limitations

- Per-`side` text alignment (Figma right-aligns the label only for `Left`-placed tooltips) was not replicated — it only visibly matters for a wrapped multi-line label in that specific placement, an edge case not worth the added conditional-class complexity for typical short tooltip text.
- `TooltipPrimitive.Arrow`'s exact shape doesn't match Figma's bespoke rounded/pinched arrow path (Radix always draws its own simple triangle polygon, not a swappable custom path) — width (12px) and the 4px protrusion match Figma's Arrow Container; the rounded tip is not reproduced.
- Collision fallback: Figma's guideline tries top → bottom → right → left; Radix flips only to the opposite side (top ↔ bottom, left ↔ right) and then shifts along the edge, so a tooltip never jumps to a perpendicular side.
- Reduced motion: the fade is a CSS animation, which the global `prefers-reduced-motion` rule in `src/styles.css` already collapses (design-foundation.md §5.4).
- `design.md`'s own z-layer diagram (§6.2) still shows an aspirational `z=100`/`z=200` scale that no real component in the codebase actually uses (every real floating component uses `z-50`/`z-[51]`) — not reconciled in this audit; a repo-wide z-index consistency pass is a separate, larger effort.


## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 | D (modify) | 15/15 | 15/15 | 14/15 | 15/15 | 10/10 | 7/10 | 5/5 | 9/10 | 5/5 | 95/100 | none | Verified |
| 2026-10-07 | Figma alignment (Classification F) | 15/15 | 15/15 | 14/15 | 15/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 99/100 | none | Verified |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
