<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Modal` — Component Specification

## 1. Identity

- **Figma component name:** Modal (+ related Scrim documentation page)
- **Figma file:** `FIGMA_FILE_KEY` ("Nova｜Master", `fSzxt8wKkXsn8fmxkPBUr2`, the official file) — component set `11017:20474` (`Style` = Basic / + Status Icon / + Scrolling / + Status & Scrolling, `Size` = Small / Medium / Large), documentation frame `10837:3946`; the backdrop is the Figma `Scrim` component (`10930:5994`, public `Scrim` since 2026-10-07). Re-inspected 2026-10-07.
- **Figma node/component URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System?node-id=10837-3946 (Modal doc page, actual component `11017:20474`); https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System?node-id=10930-5489 (Scrim doc page, actual component `10930:5994`)
- **Code name:** `Modal` (compound: `Modal`, `ModalTrigger`, `ModalPortal`, `ModalClose`, `ModalOverlay`, `ModalContent`, `ModalHeader`, `ModalTitle`, `ModalDescription`, `ModalBody`, `ModalFooter`)
- **Package export:** `@sun-asterisk/nova/modal` (and root)
- **Category:** Pattern / Composite Component over `@radix-ui/react-dialog`

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-09-07 via `/component Modal --figma <url>` (Figma-fidelity audit + fix), extended same day with dark-mode verification, scroll-divider edge-case tests, a market benchmark pass, and a documented 3-button-footer composition pattern
- **Owner/last touched by:** Workflow D (modify), 2026-09-07

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | `Modal` | context provider (`DialogPrimitive.Root`) | Manages open/close state | Controlled or uncontrolled |
| 2 | `ModalTrigger` | `DialogPrimitive.Trigger` | Opens the modal | `asChild` (Radix default `false`, unflipped here — always pass `asChild` explicitly when wrapping a real button, per every story's own usage) |
| 3 | `ModalPortal` | `DialogPrimitive.Portal` | Mounts overlay+content elsewhere in the DOM | Used internally by `ModalContent`; **never wrap `ModalContent` in it** (see §5 "ModalPortal / ModalOverlay") |
| 4 | `ModalOverlay` (= "Scrim") | `<div>` (`DialogPrimitive.Overlay`) | Semi-transparent backdrop | `bg-background-scrim` (`#00000094`); auto-included by `ModalContent` |
| 5 | `ModalContent` | `<div role="dialog">` | The panel itself | Fixed, centered, sized by `size`; owns the scroll-divider state (see §7) |
| 6 | `ModalHeader` | `<div>` | Title row + close button | `border-b` divider appears dynamically (this audit's addition) |
| 7 | `ModalTitle` | `DialogPrimitive.Title` | Accessible dialog name | Linked via `aria-labelledby` (Radix) |
| 8 | `ModalDescription` | `DialogPrimitive.Description` | Accessible dialog description | Linked via `aria-describedby` (Radix) |
| 9 | `ModalBody` | `<div>` | Scrollable content area | `flex flex-col gap-100` (this audit's addition — see §7); owns the scroll-position measurement |
| 10 | `ModalFooter` | `<div>` | Action buttons row | `border-t` divider appears dynamically (this audit's addition) |
| 11 | `ModalClose` | `DialogPrimitive.Close` | Dismiss control, placeable anywhere | `asChild` (same Radix-default-unflipped note as Trigger) |

## 4. API

### `ModalContent`

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `size` | `'small' \| 'medium' \| 'large' \| 'auto'` | `'medium'` | No | Max-width: 384px / 560px / 768px; `auto` = width follows the content (still capped by the viewport). Default changed `'small'` → `'medium'` and `auto` added 2026-10-07 (Figma: "Medium（デフォルト）", "Auto（コンテンツ量に応じて可変）") |
| `status` | `StatusIconValue` (`'info' \| 'success' \| 'caution' \| 'danger' \| 'loading'`) | — | No | Figma "+ Status Icon" style: a 24px `StatusIcon` 12px before the title, and the body/footer indented 60px to align with the title (added 2026-10-07) |
| `container` | `ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>['container']` | `document.body` | No | Redirects the portal mount point (governance audit finding — Modal was the one portal-based component missing this, mirroring DropdownMenu/Tooltip's existing `container` prop) |

Extends `ComponentPropsWithoutRef<typeof DialogPrimitive.Content>` otherwise.

### `ModalHeader`

| Prop | Type | Default | Description |
|---|---|---|---|
| `showCloseButton` | `boolean` | `true` | Toggles the header's `×` close button |
| `closeLabel` | `string` | `'Close dialog'` | Accessible name of the icon-only `×` button. **New 2026-09-29 (SC-07)**, additive — previously hard-coded English inside an otherwise often-Japanese UI (DatePicker's defaults are Japanese). Default deliberately unchanged (changing it would silently rename the button for every consumer and their tests); override per locale, e.g. `closeLabel="閉じる"`. No Figma property exists for it, so `Modal.figma.ts` intentionally does not map it (figma-code-connect.md §3 "never invent a prop") |

### Others

`Modal` = `ComponentPropsWithoutRef<typeof DialogPrimitive.Root>` (bare alias — `open`/`onOpenChange`/`defaultOpen` pass through). `ModalTrigger`/`ModalPortal`/`ModalClose`/`ModalTitle`/`ModalDescription` are bare Radix prop aliases with no custom fields. `ModalBody`/`ModalFooter` are `ComponentPropsWithoutRef<'div'>` with no custom fields.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Compound (11 exports) — matches Tooltip's precedent as "genuine compound-component composition" (`market-benchmark.md`); a fixed 2–4-part `classNames` slot object wouldn't fit a pattern this compositional (arbitrary header icons, arbitrary body content, 1–3 footer buttons).
- **`asChild`:** `ModalTrigger` and `ModalClose` both use Radix's own default (`false`, unflipped) — every story consistently passes `asChild` explicitly when wrapping a `<Button>`. This is a deliberate difference from Tooltip's `TooltipTrigger` (which flips the default to `true`) — Modal's trigger/close are conventionally wrapped around Sun's own `<Button>` component (which itself supports `asChild`/polymorphism), not raw DOM elements, so there was no accessibility motivation to flip the default here (unlike Tooltip's documented rationale).
- **Internal parts a consumer can realistically reach without forking:** `className` on every exported part (all merged via `cn()`); custom header icon via composition (`<ModalHeader><div className="flex gap-3">...</div></ModalHeader>`, shown in the component's own JSDoc) rather than a dedicated icon prop — deliberate, since Figma's "+ Status Icon" variant has no distinct properties beyond swapping in an icon, fully achievable via composition without new API surface.
- **`ModalPortal` / `ModalOverlay` (SC-06, documented 2026-09-29):** `ModalContent` **always** renders its own `ModalPortal` + `ModalOverlay`. Wrapping `ModalContent` in `ModalPortal` or rendering a `ModalOverlay` next to it therefore produces a nested portal and **two scrims** (reported by an external consumer). The two exports exist for exactly one case: a fully custom content element built directly on Radix's `Dialog.Content` (from `radix-ui`) instead of `ModalContent` — `<ModalPortal><ModalOverlay /><Dialog.Content>…</Dialog.Content></ModalPortal>`. To move `ModalContent`'s portal, use `ModalContent`'s own `container` prop. Making `ModalContent` detect an enclosing `ModalPortal` and skip its own portal/overlay was considered and **rejected for now**: `<ModalPortal><ModalContent/></ModalPortal>` (no overlay) currently shows a scrim, and would silently lose it — a behavior change for existing code; removing the exports would be breaking. Both constraints are stated in the JSDoc of `ModalPortal`/`ModalOverlay`.
- **Scroll-divider coordination:** `ModalContent` owns the shared divider-visibility state via React Context (not prop-drilling or a DOM-query-based approach) since `ModalHeader`/`ModalBody`/`ModalFooter` are siblings, not nested — `ModalBody` measures its own scroll position and reports up; `ModalHeader`/`ModalFooter` read down. This state is internal/unexported (not part of the public API) — see §7 and §11 for the full rationale.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Closed | Not rendered | N/A | N/A | Radix `data-state="closed"` | `InteractionOpenEscapeClose` story |
| Open | Overlay + content fade/zoom in | Focus moves into the dialog (Radix) | `role="dialog"`, `aria-modal` (Radix) | `data-[state=open]:animate-in` | `InteractionOpenEscapeClose`, `Modal.test.tsx` |
| Content fits (no overflow) | No header/footer dividers | N/A | N/A | `showHeaderDivider`/`showFooterDivider` both `false` | `LongContent` `play()` (implicitly, via the "at top" initial-state assertion structure) |
| Scrollable, at top | Footer-top divider only | Scrolling reveals more content below | N/A | `canScroll && !atTop` / `canScroll && !atBottom` | `LongContent` `play()` |
| Scrollable, mid-scroll | Both header-bottom and footer-top dividers | N/A | N/A | same | `LongContent` `play()` |
| Scrollable, at bottom | Header-bottom divider only | N/A | N/A | same | `LongContent` `play()` |
| Focus trap | Tab cycles within the dialog only | Confirmed via existing test | Radix's own `FocusScope` | Radix built-in | `InteractionFocusTrap` story |
| Escape / outside click | Closes, focus returns to trigger | Confirmed via existing test | Radix built-in | Radix built-in | `InteractionOpenEscapeClose` story |

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token/Implementation | Story | Test |
|---|---|---|---|---|
| Sizes: Small 384px, Medium 560px (default), Large 768px, Auto | Figma doc page, frame `10837:3946` | `sm:max-w-[384px]/[560px]/[768px]`, `w-auto`; default `medium` | `Small`/`Default`/`Large`/`AutoSize` | default and `auto` fixed 2026-10-07 — `Modal.figma.test.tsx` |
| "+ Status Icon": 24px status icon, 12px gap, body/footer at 60px | Figma `11017:20474` status variants | `status` → `StatusIcon` in the header, `pl-[60px]` (no 60px spacing token) on body viewport and footer | `WithStatusIcon` | `Modal.figma.test.tsx` |
| Body Scrollbar Rail | Figma "+ Scrolling" variants | `ModalBody` renders the Sun `Scrollbar` (vertical); dividers measure its viewport | `LongContent` | `Modal.figma.test.tsx` (scrolls, footer stays inside) |
| Scrim `Background/Scrim`, fade in/out | Figma `Scrim` `10930:5994` | `ModalOverlay` uses the shared `scrimStyles` (public `Scrim`) | all | `Modal.figma.test.tsx`, `Scrim.test.tsx` |
| Radius 16px | Figma: `rounded-[var(--radius\/400,16px)]` | `rounded-400` | all | already correct pre-audit |
| Shadow = Elevation/Lv.5 | Figma raw effect: `DROP_SHADOW #00000026 (2,7) r16 s4` + `DROP_SHADOW #00000033 (0,4) r6 s0` | `shadow-level-5` | all | already correct pre-audit |
| Scrim `#00000094` | `get_variable_defs` on node `10930:5994`: `Background/Scrim` | `bg-background-scrim` (= `black-alpha-600` = `#00000094`) | all | already correct pre-audit |
| Header padding 24px, gap 12px between title/close | Figma raw export: `p-[var(--300,24px)]`, `gap-[var(--150,12px)]` | `p-300` | all | already correct pre-audit |
| Title 16px/700 | Figma: "font-bold text-[16px]" | `typo-label-l-bold` (1rem=16px, weight 700) | all | already correct pre-audit |
| **Max-height: 80px margin reserved on top AND bottom of viewport** | Figma text: "Max-height：画面上下に80pxのマージンを確保" | `max-h-[calc(100vh-160px)]` (was `max-h-[80vh]` — only coincidentally equal at some viewport heights) | `LongContent` | manual real-browser verification (700px viewport → 540px, exactly 700-160) |
| **Body/Contents: `flex flex-col gap-[8px]`** | Figma raw export, node under `11337:46058` | `flex flex-col gap-100` added to `body` (previously had no layout of its own) | `LongContent` | manual real-browser verification |
| **Root `pb-[24px]` unconditional, regardless of footer presence** | Figma raw export, node `11337:46053`: `pb-[var(--300,24px)]` on the outermost container | `pb-300` moved to `content` (was on `footer` only, meaning footer-less modals — an explicitly recommended Figma pattern — had zero bottom padding) | — | manual real-browser verification (`paddingBottom: '24px'` confirmed present regardless of footer) |
| **`ModalDescription` text style: `typo-body-m` (14px/400/1.6), not `typo-body-s` (12px)** | Figma's only secondary/supporting text style actually used in Modal (Body/Contents "message") is 14px/400/1.6 — no 12px caption style exists anywhere in the component | `description` slot: `typo-body-s` → `typo-body-m` | — | not re-verified visually this pass (low-risk token correction) |
| **Dynamic scroll dividers: `border-border-weak` on header-bottom/footer-top, shown/hidden by scroll position** | Figma text + redline labeled literally "Border / Weak" (node `11356:49655`) | New `headerDivider`/`footerDivider` `tv()` variants + `ModalBody`'s scroll-tracking `useLayoutEffect` (see §5) | `LongContent` `play()` | `play()` asserts exact `rgb(231,231,231)`/`rgba(0,0,0,0)` at all 3 scroll positions |

No arbitrary Tailwind bracket values remain that lack a Figma-measured justification.

## 8. Accessibility

Verified via real rendered DOM (`Modal.test.tsx`, 5 tests) and Storybook (`InteractionOpenEscapeClose`, `InteractionFocusTrap`, `LongContent` — 14 stories total, all passing).

- **Semantic element / role:** `role="dialog"` with `aria-modal` (native Radix).
- **Accessible name:** `ModalTitle` → `aria-labelledby`; `ModalDescription` → `aria-describedby` (both Radix built-in linking).
- **Keyboard interactions:** Tab/Shift+Tab cycles within the dialog (focus trap); Escape closes; focus returns to the trigger on close (all Radix built-in, confirmed by existing tests).
- **Focus management:** Radix's `FocusScope` traps focus; confirmed via `InteractionFocusTrap`.
- **Disabled semantics:** N/A at the Modal level.
- **Screen reader behavior:** Background content is `aria-hidden` while open (Radix built-in).
- **Close-button `aria-label`:** `closeLabel`, default `"Close dialog"` — icon-only button, correctly labeled per accessibility.md §5.2; overridable since 2026-09-29 (SC-07, `Modal.test.tsx` "closeLabel overrides…", mutation-verified).

## 9. Theming

- **Light/dark behavior:** All colors are semantic tokens; independently verified via a real browser with `[data-theme="dark"]` set (2026-09-07 follow-up):
  - Scrim: `rgba(0, 0, 0, 0.72)` = exactly `black-alpha-700` (`#000000b8`), the documented dark-mode value of `background-scrim`.
  - Content background: `rgb(28, 28, 28)` = exactly `neutral-900` (`#1c1c1c`), dark-mode `surface-base`.
  - Scroll-divider color (mid-scroll): `rgb(51, 51, 51)` = exactly `neutral-800` (`#333333`), dark-mode `border-weak` — confirms the new divider feature correctly uses the theme-aware token, not a hardcoded light-mode color.
  - `ModalDescription`'s `typo-body-m` fix confirmed still 14px/400 in dark mode (font-size doesn't vary by theme, but this confirms the class survived the audit's earlier token-name change).
- **Verification method used:** Real Playwright browser check (`getComputedStyle`) against the built package with `data-theme="dark"` on `<html>`, plus a full-scroll screenshot — see the 2026-09-07 follow-up in §11.

## 10. Market Benchmark

Extended 2026-09-07 (follow-up) with a proper benchmark pass against MUI's `Dialog` and Chakra UI's `Dialog`:

| Capability | MUI | Chakra | Sun's Modal | Verdict |
|---|---|---|---|---|
| `scroll`/`scrollBehavior` (content-scrolls vs. whole-dialog-scrolls) | `scroll="paper"` (default) / `"body"` | `scrollBehavior="inside"` / `"outside"` (default) | Always "inside" (header/footer fixed, only body scrolls) | **REJECT** an `"outside"` option — Figma's own guideline is explicit and singular: "ヘッダーとフッターは常に固定表示され、本文エリアのみでスクロールが発生します" (header/footer always fixed, only the body scrolls). Adding the alternative would contradict the spec, not fill a gap. |
| `fullScreen` / `size="full"` | `fullScreen` boolean | `size="full"`/`"cover"` | No fullscreen option (max is `large`=768px) | **DEFER** — no Figma evidence (only 3 documented sizes exist anywhere in the file) and no demonstrated use case in this codebase; adding it speculatively would violate "every public API addition must have a demonstrated use case." |
| `placement` (top/center/bottom) | N/A (always centered) | `placement="top"\|"center"\|"bottom"` | Always centered | **REJECT** — Figma's guideline is an explicit, permanent design decision: "モーダルは常に、ビューポートの中央（垂直・水平方向）に配置されます" (Modal is always centered, both axes). |
| `closeOnInteractOutside`/`closeOnEscape`-style convenience | N/A (MUI's `onClose` reason param covers it) | `closeOnInteractOutside`, `closeOnEscape` booleans | No convenience booleans, but the underlying capability already exists via Radix's own `onPointerDownOutside`/`onEscapeKeyDown` (inherited, since `ModalContentProps` extends the full Radix `Content` props) | **KEEP as-is (no new prop)** — but this benchmark pass surfaced a **real, concrete gap**: the `DangerConfirmation` reference story is *exactly* the case Figma's own guideline calls out as needing this ("重大な確認：削除など...「閉じるボタン」と「スクリムクリック」を無効化"), yet it didn't use the existing capability at all. Fixed the story itself (`showCloseButton={false}` + `onPointerDownOutside`/`onEscapeKeyDown` `.preventDefault()`), closing the gap between guideline and reference implementation without adding new API surface. |
| `motionPreset` | `slots.transition` | `motionPreset` (5 presets) | Fixed fade+zoom, not configurable | **REJECT** — no demonstrated need; Figma documents only one animation treatment for Modal. |
| 3-button footer placement (1 far left, 2 grouped right) | N/A (compose manually) | N/A (compose manually) | Achievable via `className="justify-between"` override on `ModalFooter` (merges correctly via `cn()`/tailwind-merge) — not previously demonstrated | **ADAPT (documentation only, no new prop)** — added a `ThreeButtonFooter` story showing the exact composition pattern; verified via real browser that `justify-content: space-between` applies correctly and buttons land at the expected positions. Deliberately not a new `actions`-array prop (unlike Snackbar) — `ModalFooter` stays fully compositional. |

Net effect: 1 real code fix (`DangerConfirmation` story), 1 new documented composition pattern (`ThreeButtonFooter` story), 4 explicit REJECT/DEFER decisions with cited evidence — no new public props added to `Modal`/`ModalContent`/`ModalFooter`.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| `max-h-[80vh]` didn't match Figma's "reserve 80px margin on top AND bottom" spec — only coincidentally equal at specific viewport heights | 2026-09-07 Figma-fidelity audit | Fixed → `max-h-[calc(100vh-160px)]` | manual real-browser verification |
| `ModalBody` had no `flex flex-col gap` — Figma's Body/Contents area uses `gap-[8px]` | 2026-09-07 Figma-fidelity audit | Fixed → `flex flex-col gap-100` | manual real-browser verification |
| Bottom padding lived only on `footer`'s own `p-300` — a footer-less modal (an explicitly Figma-recommended pattern) got zero bottom padding | 2026-09-07 Figma-fidelity audit | Fixed → `pb-300` moved to `content`, unconditional | manual real-browser verification |
| `ModalDescription` used `typo-body-s` (12px); Figma's only comparable secondary-text style in Modal is `typo-body-m` (14px) | 2026-09-07 Figma-fidelity audit | Fixed → `typo-body-m` | not independently re-verified this pass |
| No dynamic scroll-position-aware header/footer dividers existed at all — a real, confirmed missing feature per Figma's explicit guideline | 2026-09-07 Figma-fidelity audit | Implemented (per explicit direction) — new React Context + `ModalBody` scroll/resize tracking + `headerDivider`/`footerDivider` `tv()` variants | `LongContent` `play()` (asserts exact border colors at top/middle/bottom scroll positions) |
| No `.test.tsx` existed for Modal — ref forwarding, `showCloseButton`, `container`, and `ModalClose` dismissal were unverified by any DOM assertion | 2026-09-07 Figma-fidelity audit | Fixed — added `Modal.test.tsx` (5 tests) | `Modal.test.tsx` |
| Dark-mode colors (scrim, content background, scroll-divider color) had not been independently verified | 2026-09-07 follow-up | Verified — all 3 confirmed exact hex/rgba matches against dark-mode token values | manual real-browser verification (`data-theme="dark"`) |
| Scroll-divider re-measurement had no test for the "content changes after mount without user scrolling" case (the specific behavior the `children`-dependency effect exists for) | 2026-09-07 follow-up | Fixed — added `ScrollDividerUpdatesOnContentChange` story | `Modal.stories.tsx` `play()` |
| `DangerConfirmation` reference story didn't implement Figma's own recommended pattern for critical confirmations (disable close button + outside-click/Escape) despite the capability already existing via Radix | 2026-09-07 follow-up (found during market benchmark) | Fixed — story now uses `showCloseButton={false}` + `onPointerDownOutside`/`onEscapeKeyDown` `.preventDefault()` | `Modal.stories.tsx` (visual/manual) |
| No documented composition pattern existed for Figma's 3-button footer layout (1 far left, 2 grouped right) | 2026-09-07 follow-up | Fixed — added `ThreeButtonFooter` story (className override, no new prop) | manual real-browser verification (`justify-content: space-between`, button positions confirmed) |

## 12. Examples

```tsx
// Basic
<Modal>
  <ModalTrigger asChild>
    <Button>Open Modal</Button>
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Title</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <p>Modal content goes here</p>
    </ModalBody>
    <ModalFooter>
      <ModalClose asChild>
        <Button variant="secondary">Cancel</Button>
      </ModalClose>
      <Button variant="primary">Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

// Controlled
const [open, setOpen] = useState(false);
<Modal open={open} onOpenChange={setOpen}>
  <ModalTrigger asChild><Button>Controlled</Button></ModalTrigger>
  <ModalContent>Content</ModalContent>
</Modal>

// Footer-less (Figma-recommended for info-only modals — still gets correct bottom padding)
<Modal>
  <ModalTrigger asChild><Button>Info</Button></ModalTrigger>
  <ModalContent>
    <ModalHeader><ModalTitle>Heads up</ModalTitle></ModalHeader>
    <ModalBody><p>Just some information, no action needed.</p></ModalBody>
  </ModalContent>
</Modal>

// Custom portal container (e.g. a scoped ThemeProvider wrapper)
<ModalContent container={scopedRootRef.current}>...</ModalContent>

// Long content — header/footer dividers appear automatically as needed
<ModalContent size="medium">
  <ModalHeader><ModalTitle>Terms of Service</ModalTitle></ModalHeader>
  <ModalBody>{/* many paragraphs */}</ModalBody>
  <ModalFooter><Button>I Agree</Button></ModalFooter>
</ModalContent>

// Critical confirmation — force an explicit decision (Figma's recommended
// exception case): no close button, no dismiss on outside-click/Escape
<ModalContent
  size="small"
  onPointerDownOutside={(e) => e.preventDefault()}
  onEscapeKeyDown={(e) => e.preventDefault()}
>
  <ModalHeader showCloseButton={false}>
    <ModalTitle>Are you sure you want to delete?</ModalTitle>
  </ModalHeader>
  <ModalFooter>
    <ModalClose asChild><Button variant="secondary">Cancel</Button></ModalClose>
    <Button variant="danger">Delete</Button>
  </ModalFooter>
</ModalContent>

// 3-button footer (Figma's max: a 3rd choice goes on the far left,
// separate from the grouped pair on the right) — plain composition, no
// new prop
<ModalFooter className="justify-between">
  <Button variant="plain">Save Draft</Button>
  <div className="flex items-center gap-150">
    <ModalClose asChild><Button variant="secondary">Cancel</Button></ModalClose>
    <Button variant="primary">Publish</Button>
  </div>
</ModalFooter>
```

## 13. Known Limitations

- Figma's action-button placement guideline (3-button split layout: 1 on the far left, 2 grouped on the right) is documented via the `ThreeButtonFooter` story but not enforced in code — `ModalFooter` is fully compositional, so a consumer must apply the `className="justify-between"` pattern themselves.
- `ModalBody` scrolls inside the Sun `Scrollbar` (2026-10-07): the viewport is keyboard-focusable (`tabIndex=0`, focus ring), like every `Scrollbar`. A consumer `className` on `ModalBody` lands on the scroll root, not on the padded content.
- The scroll-divider `ResizeObserver` observes only the scroll viewport (covers window-resize-driven `clientHeight` changes; the `children`-dependency effect covers React-driven content changes) — an extremely rare case of non-React-driven DOM mutation inside the body (e.g. a raw `innerHTML` write from an uncontrolled third-party widget) would not trigger a re-measurement.
- Modal stacking (opening a Modal from within another Modal) is explicitly discouraged by Figma's own guideline but not prevented in code — consistent with the library's general philosophy of not enforcing usage guidelines architecturally.
- `motionPreset`/`placement`/`fullScreen`-style props from MUI/Chakra were explicitly evaluated and rejected/deferred (see §10) — not oversights, but should a genuine future need arise (e.g. a real fullscreen-on-mobile request), they'd need re-evaluating against Figma at that time, not copied wholesale from another library.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 | D (modify) | 14/15 | 14/15 | 14/15 | 14/15 | 10/10 | 7/10 | 5/5 | 9/10 | 5/5 | 92/100 | none | Verified |
| 2026-09-07 (follow-up) | D (modify) | 14/15 | 15/15 | 14/15 | 14/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 97/100 | none | Verified |
| 2026-10-07 | Figma alignment (Classification F + `status`/`auto`) | 14/15 | 15/15 | 14/15 | 15/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 98/100 | none | Verified |

Follow-up deltas: **Theming 7→10** (dark mode independently verified — 3 exact token matches, not just "should work"). **Testing 9→10** (added the scroll-divider content-change edge case, closing the one testing gap noted in the initial pass). **Composition 14→15** (the 3-button footer pattern is now a documented, verified composition recipe rather than an unaddressed guideline). Market capability isn't a scored column in this table, but the benchmark pass itself (§10) surfaced and fixed a real gap (`DangerConfirmation`'s pattern mismatch) beyond just producing a comparison table.

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
