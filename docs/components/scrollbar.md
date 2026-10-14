# `Scrollbar` — Component Specification

## 1. Identity

- **Figma component name:** Scrollbar / Vertical, Scrollbar / Horizontal (documentation page: "Scrollbar")
- **Figma file:** `FIGMA_FILE_KEY` — Sun Design System (`fSzxt8wKkXsn8fmxkPBUr2`)
- **Figma node/component URL:** `https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Nova%EF%BD%9CMaster?node-id=11377-7179` — component sets `Scrollbar / Vertical` `17520:11839` and `Scrollbar / Horizontal` `12508:14528` (`State = Enabled / Hover`)
- **Code Connect:** `Scrollbar.figma.ts` → `17520:11839` (`<Scrollbar showHorizontal={false}>`), `ScrollbarHorizontal.figma.ts` → `12508:14528` (`<Scrollbar showVertical={false}>`). Fixed 2026-10-07: the mapping pointed at `12471-14086`, which does not exist in Nova｜Master, so Dev Mode showed no code; the horizontal set had no mapping
- **Code name:** `Scrollbar` (composed), `ScrollBarArea` (low-level primitive)
- **Package export:** `@sun-asterisk/nova/scrollbar` (subpath, 2 exports), also re-exported from the package root
- **Category:** Simple Component, leaning Composite via the exposed low-level `ScrollBarArea` primitive for manual composition — not a compound API in the Modal/DropdownMenu sense

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-09-08 via `/component Scrollbar --figma <url>` (Figma-fidelity audit), then a same-day quality-improvement pass (dark-mode verification + hover-widen testability refactor + real axe scan/keyboard-scroll verification)
- **Owner/last touched by:** Workflow D (modify), 2026-09-08 — two passes, see §14; 2026-10-07 `/component Scrollbar` Figma re-check (Code Connect remap only — visuals unchanged, see §7)

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `ScrollAreaPrimitive.Root` (Radix `ScrollArea.Root`) | — | Overflow container; owns Radix's internal size/overflow observation |
| 2 | Viewport | `ScrollAreaPrimitive.Viewport` | `tabIndex={0}` (genuinely keyboard-focusable) | Scrollable content area; the real native-scroll element |
| 3 | Vertical track | `ScrollBarArea` (`ScrollAreaPrimitive.ScrollAreaScrollbar orientation="vertical"`) | — | Rendered when `showVertical` (default `true`); shown/hidden per Radix's `type` prop (default `hover`) |
| 4 | Horizontal track | `ScrollBarArea` (`orientation="horizontal"`) | — | Rendered when `showHorizontal` (default `true`) |
| 5 | Thumb | `ScrollAreaPrimitive.ScrollAreaThumb` (inside each `ScrollBarArea`) | — | The draggable indicator; length set by Radix via inline style (proportional to visible/scrollable ratio), cross-axis thickness set by this component's own `tv()` variants |
| 6 | Corner | `ScrollAreaPrimitive.Corner` | — | Fills the bottom-right gap when both scrollbars are visible |

## 4. API

**`Scrollbar` (composed):**

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `showVertical` | `boolean` | `true` | No | Show the vertical scrollbar when content overflows |
| `showHorizontal` | `boolean` | `true` | No | Show the horizontal scrollbar when content overflows |
| `viewportClassName` | `string` | — | No | Extra classes for the scroll viewport |
| `scrollbarClassName` | `string` | — | No | Extra classes for both scrollbar tracks |
| `thumbClassName` | `string` | — | No | Extra classes for both thumbs |

Also extends `ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>` — i.e. every Radix `ScrollArea.Root` prop (`type`, `scrollHideDelay`, `dir`, etc.) passes through directly.

**`ScrollBarArea` (low-level primitive, for manual composition inside a raw Radix `ScrollArea.Root`):**

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | No | Drives `scrollbarStyles({ orientation })` — see §7 for why this must be an explicit prop, not a CSS attribute selector |
| `thumbClassName` | `string` | — | No | Extra classes for this track's thumb |

Also extends `ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>`.

**Refs:** `Scrollbar` forwards to the Root `<div>`; `ScrollBarArea` forwards to the track (`ScrollAreaScrollbar`) `<div>`. Both are `HTMLDivElement`.

## 5. Composition & Customization

- **`*ClassName` props vs. compound API:** Named per-part override props (`viewportClassName`/`scrollbarClassName`/`thumbClassName`), not a compound API — the correct choice per `component-api-conventions.md`'s "2 or fewer visually distinct parts → named `*ClassName` props" rule, and per `market-benchmark.md`'s explicit citation of this exact pattern as the library's own reference implementation for this idiom (see §10).
- **`ScrollBarArea` as an escape hatch:** exported specifically so a consumer can hand-compose a Radix `ScrollArea.Root`/`Viewport` with only one axis, custom `Corner` handling, or anything else `Scrollbar`'s fixed composition doesn't allow — demonstrated in `Scrollbar.stories.tsx`'s `PrimitiveUsage` story.
- **Internal parts a consumer can realistically reach without forking:** viewport, both tracks, both thumbs — all four via the named `*ClassName` props; nothing is unreachable.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Track: hidden | Not rendered (default `type="hover"`) | — | — | Radix `Presence`-driven mount/unmount | Storybook (visual) |
| Track: visible | 12px thick, 4px padding | Appears on container hover (`type="hover"`, default) or always (`type="always"`) | — | `scrollbarStyles({ orientation }).scrollbar` | `InteractionFocusRingAndThumbSizing` (asserts 12px) |
| Thumb: default | 4px thick, `bg-border-basic`, `rounded-full` | Draggable; clicking the track also jumps/drags (Radix built-in) | — | `scrollbarStyles({ orientation }).thumb` (`w-1!`/`h-1!`) | `InteractionFocusRingAndThumbSizing` (asserts 4px) |
| Thumb: hover | Widens to 8px, `bg-border-strong`, animated (`transition-[width,height,background-color]`) | Triggered by hovering the TRACK (the full 12px Hit Area — matches Figma's own "Track領域に入った時" spec), not just the thin 4px thumb | — | Real React state (`isTrackHovered`) set via the track's `onPointerEnter`/`onPointerLeave`, applied to the thumb as `data-hovered`; styled via `data-[hovered=true]:w-2!`/`h-2!` + `data-[hovered=true]:bg-border-strong` (not a CSS `:hover` pseudo-class — see §7) | `InteractionFocusRingAndThumbSizing` (asserts 4px→8px on hover, then back to 4px on unhover, via `userEvent.hover()`/`unhover()`); also verified via a neutral non-Storybook browser + real `page.mouse.move()` |
| Viewport: focus-visible | 2px `border-focus` outline, `outline-offset-2`, `rounded-[inherit]` | Real keyboard `Tab` | `:focus-visible` (native) | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus` on the Viewport | `InteractionFocusRingAndThumbSizing` |

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Track thickness (Hit Area) = 12px | `get_design_context` on nodes 12424:7122/12471:14134/12503:14324 — every "Hit Area" callout spans the component's full 12px width/height | `w-3`/`h-3` | `Scrollbar.styles.ts`'s `orientation.vertical.scrollbar`/`orientation.horizontal.scrollbar` | `Default`/`Horizontal`/etc. (visual) | `InteractionFocusRingAndThumbSizing` |
| Track padding = 4px (default state) | Same nodes — thumb (4px) exactly fills the 12px track minus 2×4px padding | `p-1` | `Scrollbar.styles.ts`'s `scrollbar` slot | Storybook (visual) | `InteractionFocusRingAndThumbSizing` (implied by the 4px thumb-width assertion) |
| Thumb width: 4px default, 8px hover | `get_design_context` on node 17520:11839 (`Scrollbar / Vertical`, States Enabled/Hover) and 12508:14528 (`Scrollbar / Horizontal`) | `w-1!`/`data-[hovered=true]:w-2!` (vertical), `h-1!`/`data-[hovered=true]:h-2!` (horizontal) | `Scrollbar.styles.ts`'s `orientation.*.thumb`; hover state set in `Scrollbar.tsx` | Storybook (visual) | `InteractionFocusRingAndThumbSizing` (both default and hover-widen, plus unhover shrink-back) |
| Thumb color ≈ `rgba(0,0,0,0.3)` | Figma's literal fill value on the thumb | `border-basic` (light mode = `neutral-300` = `#bdbdbd`, ≈177,177,177 — within ~11/255 of a literal 30%-opacity-black-over-white composite, and correctly theme-aware unlike a hardcoded rgba would be) | `Scrollbar.styles.ts`'s `thumb` slot | Storybook (visual) | N/A — confirmed a reasonable semantic-token approximation, not a bug |
| Hover-widen must animate | Figma's guideline text: "スクロールバーの幅がアニメーションして拡大します" (the width change animates on hover) | — | `transition-[width,height,background-color]` on the thumb | Storybook (visual) | N/A — verified via neutral browser (see below) |
| Focus ring: 2px `border-focus`, offset outward | Established codebase convention (design-foundation.md §5.1); not separately re-specified for Scrollbar in this Figma page | `border-focus` | `Scrollbar.tsx`'s Viewport | Storybook (visual) | `InteractionFocusRingAndThumbSizing` |

**Bugs found and fixed in this audit (2026-09-08):**

1. **Missing focus ring on the scroll viewport.** Same `tailwind-merge` `outline-none` + bare `outline`/`outline-2` collision found repeatedly elsewhere in this library (Checkbox, RadioGroup, DropdownMenu, Snackbar, DatePicker) — the viewport's `tabIndex={0}` makes it genuinely keyboard-focusable, but the ring never painted. A prior architectural audit (`component-capability-matrix.md`) had marked this "confirmed correct" based on source-level token/class presence, not actual computed style — this class of bug is invisible from source inspection alone. Fixed by removing the unconditional `outline-none`.
2. **Wrong track thickness/padding.** 8px track (`w-2`) with 2px padding (`p-0.5`) — Figma's own "Hit Area" spec measures 12px with 4px padding across every relevant redline callout. Fixed (`w-3`/`h-3`, `p-1`).
3. **Thumb sizing classes were completely dead code — the most severe finding.** `data-[orientation=vertical]:w-1`/`hover:w-2`/etc. on the thumb never matched anything, because Radix's `ScrollAreaThumb` element never carries its own `data-orientation` attribute (confirmed by reading `@radix-ui/react-scroll-area`'s own source — only the parent track sets it). The thumb's visible ~3-4px width came entirely from an unrelated `flex-1` (`flex-basis:0%, flex-grow:1`) filling whatever space was left in the track's flex main axis — meaning the intended 4px→8px hover-widen animation had never once worked in any shipped version of this component. Compounding this: Radix's `ScrollAreaThumb` always sets `width`/`height` via inline `style` (`width: var(--radix-scroll-area-thumb-width)`, which for a vertical-only scrollbar is undefined and computes to the property's initial value, `auto`) — an inline style, even one resolving to `auto`, still wins the cascade over a plain class, so even a correctly-scoped class silently did nothing. Fixed by (a) converting to an explicit `tv()` `variants: { orientation }` key driven by the real `orientation` prop (not a CSS attribute selector that doesn't exist on this element), and (b) using Tailwind's `!` (important) suffix on every size utility, since only `!important` actually beats a non-important inline style.
4. **Hover-widen trigger fixed to match Figma exactly, and made testable (quality-improvement pass).** The original CSS `hover:` mechanism had two separate problems, found together: (a) it fired on the thumb's own thin 4px hover target, whereas Figma's guideline text explicitly says the width-expand triggers on entering the TRACK's full 12px "Hit Area" ("Track領域に入った時"); (b) `userEvent.hover()` (Testing Library, used inside Storybook `play()` functions) dispatches synthetic pointer/mouse events without moving the real OS-level cursor, so it reliably triggers JS `mouseenter`/`pointerenter` *listeners* but does not reliably activate a plain CSS `:hover` pseudo-class the way a genuine cursor move does — leaving this behavior with no automated regression coverage. Fixed by tracking hover as real React state (`isTrackHovered`) driven by the TRACK's own `onPointerEnter`/`onPointerLeave`, applied to the thumb via a `data-hovered` attribute and styled with `data-[hovered=true]:w-2!`/`h-2!` (same mechanism Radix's own track-reveal-on-container-hover already uses, which is why that one was always testable). This single fix resolved both the Figma-accuracy gap and the testability gap.

Verified via both a real browser (`page.mouse.move()` onto the track: 4px → 8px → back to 4px on move-away) and the Storybook regression story (`userEvent.hover()`/`unhover()` on the track: same 4px → 8px → 4px sequence, now passing).

## 8. Accessibility

- **Semantic element / role:** No explicit ARIA role (Radix `ScrollArea` is intentionally ARIA-less — a scroll container has no native ARIA semantics to model). The Viewport is a plain `<div tabIndex={0}>`, making it keyboard-reachable so users can scroll via arrow keys/Page Up/Page Down without needing a mouse or a working scrollbar drag.
- **Keyboard interactions:** Native browser scroll behavior once the Viewport is focused (arrow keys, Page Up/Down, Home/End) — no custom key handler, correctly delegating scroll physics to the browser per Figma's own guideline ("スクロールの物理演算はOS/ブラウザに委譲します" — physics is delegated to the OS/browser).
- **Focus management:** Fixed in this audit (bug #1 above) — verified via real keyboard `Tab` + `getComputedStyle()`.
- **Screen reader behavior:** Not independently re-verified with a manual VoiceOver/NVDA pass — relies on the Viewport being a real, natively-scrollable, focusable element with no ARIA overrides to get wrong (a defensible, low-risk baseline for a scroll-position indicator with no independent semantic meaning). Partially substituted by a real automated axe-core scan (below), which covers what axe can detect but not everything a manual pass would.
- **Automated axe scan (quality-improvement pass):** Ran `axe-core` directly (not just Storybook's `addon-a11y`) against a real neutral-browser render of `Scrollbar`, in both light and dark themes, with the track hovered/visible. Result: **zero violations attributable to the component** in either theme. The only violations reported (`html-has-lang`, `landmark-one-main`, `page-has-heading-one`, `region`, and in one run a `color-contrast` hit) were all artifacts of the bare test-harness page itself (missing `<html lang>`/`<main>`/`<h1>`, and a hardcoded demo-content text color left over from a dark-mode-only test page reused for a light-mode check) — not the Scrollbar component, and not present in any real consuming application.
- **Keyboard scroll verification (quality-improvement pass):** Confirmed via real keyboard presses in a neutral browser that `ArrowDown`, `PageDown`, `End`, and `Home` all correctly move `scrollTop` once the Viewport is focused (native behavior, no custom handler, nothing to break) — `Home`'s apparent partial-scroll reading turned out to be a native smooth-scroll animation still in flight at the 100ms check, not a bug; waiting for the animation to finish showed the correct final position (0).

## 9. Theming

- **Light/dark behavior:** `bg-border-basic`/`hover:bg-border-strong` (thumb) and `border-focus` (viewport focus ring) are semantic tokens, correctly theme-aware — confirmed NOT hardcoded (rejected an initial hypothesis that the thumb color should switch to a raw `rgba(0,0,0,0.3)`/`black-alpha-400` token instead; the current semantic-token choice is the more correct one specifically because it inverts properly in dark mode, unlike a fixed black-alpha value would).
- **Verification method used (quality-improvement pass):** Real neutral-browser render under `[data-theme="dark"]`, with the track hovered. Measured contrast: default thumb vs. its actual rendered background ≈4.56:1 (passes the 3:1 non-text-UI-component minimum, `.claude/rules/accessibility.md` §4.2), hover-state thumb ≈14.3:1, and the dark-mode focus ring color (`rgb(13, 154, 236)`, the dark-mode `border-focus` override) renders correctly. Confirmed visually via screenshot — thumb clearly visible against the dark surface, no color regression.

## 10. Market Benchmark

Per `docs/architecture/market-benchmark.md`: `Scrollbar` is explicitly credited as **"the best slot-customization example in the library"** — its `viewportClassName`/`scrollbarClassName`/`thumbClassName` pattern is the cited reference implementation the benchmark recommends generalizing to `Input`/`Snackbar`/`TextField`/`TextareaField` (see the benchmark's "Adopt one customization mechanism, deliberately" recommendation). The benchmark's one prior concrete finding for this component — a "dual style-source-of-truth" duplication between `ScrollBarArea`'s own inline defaults and `scrollbarStyles()` — no longer exists in current code (`ScrollBarArea` already consumes `scrollbarStyles()` as its single source; this was resolved sometime before this audit and confirmed by reading the current file). No other Scrollbar-specific market-capability gaps are tracked in the benchmark.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Missing viewport focus ring (`outline-none` + bare `outline` tailwind-merge drop) | This audit, 2026-09-08 (previously mis-marked "confirmed correct" by an earlier source-level-only audit) | Fixed | `Scrollbar.stories.tsx:InteractionFocusRingAndThumbSizing` |
| Wrong track thickness/padding (8px/2px vs. Figma's 12px/4px) | This audit, 2026-09-08 | Fixed | `Scrollbar.stories.tsx:InteractionFocusRingAndThumbSizing` |
| Thumb sizing classes entirely dead (`data-orientation` never set on the thumb) | This audit, 2026-09-08 | Fixed | `Scrollbar.stories.tsx:InteractionFocusRingAndThumbSizing` (default width) |
| Missing hover-widen transition (no animation, contradicting Figma's own guideline text) | This audit, 2026-09-08 | Fixed | `InteractionFocusRingAndThumbSizing` (hover-widen assertion exercises the transitioned property) + neutral-browser verification |
| Hover-widen triggered on the wrong element (thumb instead of the full track) + untestable via `userEvent.hover()` | Quality-improvement pass, 2026-09-08 | Fixed | `InteractionFocusRingAndThumbSizing` (now asserts 4px→8px→4px via `userEvent.hover()`/`unhover()` on the track) + neutral-browser `page.mouse.move()` |
| No real axe-core scan (only Storybook's `addon-a11y`) | Quality-improvement pass, 2026-09-08 | Verified — zero component-attributable violations in light or dark theme | Manual neutral-browser axe run (not yet a persisted automated test — see §13) |
| No real-browser dark-mode contrast verification | Quality-improvement pass, 2026-09-08 | Verified — all measured ratios pass | Manual neutral-browser check (not yet a persisted automated test — see §13) |
| Dual style-source-of-truth (`ScrollBarArea` vs. `scrollbarStyles()`) | `market-benchmark.md` (earlier audit) | Already resolved before this audit | N/A |
| Zero unit-test coverage | `component-capability-matrix.md` (earlier audit) | Fixed | `Scrollbar.test.tsx` (2 ref-forwarding tests) |
| Code Connect node `12471-14086` missing from Nova｜Master; horizontal set unmapped | `/component Scrollbar`, 2026-10-07 | Fixed — `17520:11839` + new `ScrollbarHorizontal.figma.ts` (`12508:14528`) | `pnpm run code-connect:check` (both valid against `fSzxt8wKkXsn8fmxkPBUr2`) |
| Figma thumb fill is a raw `#000000` @ 30% (no variable) | `/component Scrollbar`, 2026-10-07 | **Kept as token** (user decision) — `border-basic`/`border-strong` stay; a fixed black would nearly vanish on dark surfaces and break design-foundation.md §1. Reported as Figma-side drift (the thumb should bind a semantic variable) | §7 row "Thumb color" |

## 12. Examples

```tsx
// Basic vertical-only scrollbar
<div className="h-64 w-80 rounded-100 border border-border-basic">
  <Scrollbar showHorizontal={false}>
    <div className="flex flex-col gap-3 p-4">{/* content */}</div>
  </Scrollbar>
</div>

// Bidirectional
<Scrollbar>
  <div className="min-w-[600px]">{/* wide content */}</div>
</Scrollbar>

// Always-visible scrollbars
<Scrollbar type="always" showHorizontal={false}>{/* content */}</Scrollbar>

// Custom track/thumb styling
<Scrollbar
  showHorizontal={false}
  scrollbarClassName="px-1"
  thumbClassName="bg-border-strong hover:bg-text-disabled rounded-full"
>
  {/* content */}
</Scrollbar>

// Low-level primitive for manual composition
<ScrollArea.Root className="relative size-full">
  <ScrollArea.Viewport tabIndex={0} className="size-full rounded-[inherit]">
    {/* content */}
  </ScrollArea.Viewport>
  <ScrollBarArea className="px-[3px]" thumbClassName="bg-border-strong rounded-full" />
  <ScrollArea.Corner />
</ScrollArea.Root>
```

## 13. Known Limitations

- **No fresh manual screen-reader verification** — relies on the Viewport being a plain, natively-scrollable, focusable element with no ARIA to get wrong, plus a real axe-core scan (zero violations) as a partial substitute; axe cannot fully replace a manual VoiceOver/NVDA pass.
- **The dark-mode contrast check and the real axe scan are not persisted as automated tests** — both were run manually in a neutral browser harness during this audit and confirmed passing, but neither is wired into CI, so a future regression in either wouldn't be caught automatically. Adding either would require either a dedicated Playwright test file outside the existing `unit`/`storybook` vitest projects, or a `@axe-core/playwright`-style integration — not attempted in this turn.
- **`prefers-reduced-motion` is not respected** by the thumb's hover-widen transition — a systemic, repo-wide gap (`component-capability-matrix.md` "Notable systemic findings" §590) affecting every animating component, not specific to `Scrollbar` and not fixed in this turn.
- **No dedicated pixel-measurement story beyond what `InteractionFocusRingAndThumbSizing` covers as a byproduct** of its focus-ring/sizing assertions (e.g. no explicit check of `p-1` padding value in isolation, corner sizing, etc.).

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-08 (pass 1) | Workflow D (Figma-fidelity audit) | 15/15 | 15/15 | 13/15 | 14/15 | 10/10 | 7/10 | 4/5 | 8/10 | 5/5 | 91/100 | none | Verified |
| 2026-09-08 (pass 2) | Workflow D (quality-improvement: dark-mode verification + hover-widen testability refactor + real axe/keyboard-scroll verification) | 15/15 | 15/15 | 14/15 | 15/15 | 10/10 | 10/10 | 5/5 | 9/10 | 5/5 | 98/100 | none | Verified |
| 2026-10-07 | `/component` Figma re-check (F): Code Connect remapped to Nova (vertical + new horizontal); dimensions re-confirmed (4→8px thumb, 12px track, padding 4) | 15/15 | 15/15 | 14/15 | 15/15 | 10/10 | 10/10 | 5/5 | 9/10 | 5/5 | 98/100 | none | Verified |

Pass 2 changes: Accessibility +1 (real axe-core scan run, zero component-attributable violations in either theme; keyboard scroll behavior verified with real key presses — but still -1 since a manual VoiceOver/NVDA pass was never done, only axe's automated coverage); Logic +1 (the hover-widen mechanism's testing-tool blind spot is resolved — it's real React state now, not a CSS pseudo-class, so it's no longer inherently untestable via dispatched events); Theming +3 (real neutral-harness dark-mode contrast measurements, all passing); Storybook +1 (`InteractionFocusRingAndThumbSizing` now asserts the full hover-widen→unhover cycle, not just default width); Testing +1 (same hover-widen coverage, now real and persisted in Storybook — but still -1 since the dark-mode contrast check and the axe scan itself were one-off manual runs, not wired into CI, so a future regression in either would go undetected).
