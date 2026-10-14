<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Tabs` — Component Specification

## 1. Identity

- **Figma component name:** Tab / Primary — component set `2185:1731` (4 variants) in the documentation frame `2006:1663`, file `fSzxt8wKkXsn8fmxkPBUr2` ("Nova｜Master", the official file). A single tab, mapped to `TabsTrigger` in `Tabs.figma.ts`. Properties: `Text`, `State` = Enabled / Hover / Active / Disabled, `Focus` (boolean), `Icon` (boolean, leading `Icon / Folder` instance), `Badge` (boolean, trailing Badge instance). Inspected 2026-10-07, including the frame's guideline (layout, horizontal scrolling, auto-scroll on selection). No Figma node is mapped to `Tabs`/`TabsList`/`TabsContent`.
- **Older schema:** an older version of the Figma component also has `State=Focus`; `Tabs.figma.ts` enumerates both.
- **Figma node URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Nova%EF%BD%9CMaster?node-id=2006-1663
- **Code name:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Package export:** `@sun-asterisk/nova/tab` (and root). Public types: `TabsProps`, `TabsListProps`, `TabsTriggerProps`, `TabsContentProps`.
- **Category:** Radix wrapper — `@radix-ui/react-tabs`. Composite/Compound Component (4 parts).

## 2. Status

- **Lifecycle status:** Verified (CLAUDE.md §36).
- **Last verified:** 2026-09-29 — `pnpm exec vitest run --project unit src/components/tab` (7/7), `--project storybook` (8/8 stories), `--project api test/api/tab.test-d.tsx` (no type errors). Not via `/test`.
- **Owner/last touched by:** Spec written retroactively (no Workflow C/D run), 2026-09-29.

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<div>` (`TabsPrimitive.Root`) | none | `flex flex-col`; owns value state |
| 2 | List | `<div role="tablist">` (`TabsPrimitive.List`) | `tablist` | Horizontal strip, `px-sds-200`, 1px `border-sds-border-basic` bottom border, `mb-sds-300`; scrolls horizontally when the tabs do not fit (`overflow-x-auto`), 16px scroll-padding (`scroll-px-sds-200`) |
| 3 | Trigger | `<button role="tab">` (`TabsPrimitive.Trigger`) | `tab` | 40px (`h-sds-500`) tab, one-line label (`whitespace-nowrap`, never squeezed); `group` for the overlay; a leading icon placed directly in the content is 20px and colored per state |
| 3a | Trigger content | `<div>` | none | `px-sds-200 flex gap-sds-50` (4px) — holds icon, label, badge children |
| 3b | Focus-ring overlay | `<div aria-hidden="true">` | presentational | Absolutely positioned full-size overlay; `border-2` becomes `border-sds-border-focus` on `group-focus-visible` |
| 4 | Content | `<div role="tabpanel">` (`TabsPrimitive.Content`) | `tabpanel` | `p-4 outline-none`; only the active panel is mounted (Radix default) |

## 4. API

| Component | Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|---|
| `Tabs` | `defaultValue` | `string` | — | No | Uncontrolled initial tab | §1 (controlled/uncontrolled) |
| `Tabs` | `value` / `onValueChange` | `string` / `(value: string) => void` | — | No | Controlled mode (Radix) | §1 |
| `Tabs` | `children` | `ReactNode` | — | **Yes** | Declared required in `TabsProps` | — |
| `TabsList` | `children` | `ReactNode` | — | **Yes** | Triggers | — |
| `TabsTrigger` | `value` | `string` | — | Yes (Radix) | Tab identity | — |
| `TabsTrigger` | `disabled` | `boolean` | — | No | Not selectable; skipped by arrow keys | §2 |
| `TabsTrigger` | `children` | `ReactNode` | — | **Yes** | Label; icons/badges are composed as children (there are no `icon`/`badgeLabel` props) | — |
| `TabsContent` | `value`, `children` | `string`, `ReactNode` | — | Yes | Panel for the matching trigger | — |

Each part extends `ComponentProps<typeof TabsPrimitive.X>` (`orientation`, `activationMode`, `forceMount`, `className`, …). All four forward refs (`HTMLDivElement` / `HTMLButtonElement` for the trigger), asserted in `Tabs.test.tsx` and `test/api/tab.test-d.tsx`.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Compound — four independently composable parts (`market-benchmark.md`'s rule: 3+ independent parts → compound API). Each part takes `className`. The trigger's inner content wrapper and focus overlay are not individually customizable.
- **`asChild`:** Not a Sun concern (Radix types allow it on parts; untested).
- **Internal parts a consumer can realistically reach without forking:** All four public parts; trigger internals only via descendant selectors.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Inactive | `typo-label-l-regular`, `text-sds-text-secondary` | Click activates | `aria-selected="false"`, `tabIndex=-1` | Radix `data-state="inactive"` | `Tabs.test.tsx` "clicking a trigger switches…" |
| Active | `typo-label-l-bold`, `text-sds-text-primary`, 2px `border-sds-border-strong` bottom border | — | `aria-selected="true"`, `tabIndex=0`, `aria-controls` → panel | `data-[state=active]:` | `Tabs.test.tsx` defaultValue / controlled tests |
| Hover (enabled) | Text → primary + bold; icon `icon-primary-hover` | — | — | `enabled:hover:` | `Tabs.figma.test.tsx` (light + dark) |
| Focus-visible | 2px `border-sds-border-focus` overlay, `rounded-[6px]`, flush with an inactive trigger and reaching 2px down onto an active trigger's own border (always inside the scroll container) | Arrow keys / Tab | native `:focus-visible` on trigger | `group-focus-visible:` on overlay (not `outline`) | `Tabs.figma.test.tsx` (geometry + computed border) |
| Overflow / selection scrolling | Tabs keep their size; the list scrolls horizontally; selecting a cut-off tab scrolls it fully into view (edge tab: 16px margin), a visible tab does not move the list | Click, ArrowLeft/Right, Home/End | — | `overflow-x-auto` + `scroll-px-sds-200` + `Tabs` `onValueChange` → `scrollIntoView({ inline: 'nearest' })` on the root's own active trigger | `Tabs.figma.test.tsx`, `ManyTabsScrollable` story |
| Arrow navigation | Focus + selection move together (automatic activation), wraps, skips disabled | ArrowLeft/Right, Home/End (Radix) | roving `tabIndex` | Radix RovingFocusGroup | `InteractionArrowNavAndDisabledSkip` story (ArrowRight, disabled skip, wrap) |
| Disabled | `text-sds-text-disable`, icon `icon-disable`, `cursor-not-allowed` | Not clickable, skipped by arrows | `disabled` attribute | native `disabled:` | `Tabs.test.tsx` "a disabled trigger cannot be activated by click"; story above |

## 7. Design Tokens — Figma Traceability

Source: Figma `Tab / Primary` (`2185:1731`, 4 variants) and the guideline in frame `2006:1663`, read via the REST API on 2026-10-07. `pnpm figma:theme-check fSzxt8wKkXsn8fmxkPBUr2 2185:1731`: 12/12 color variables match `scripts/global.css` in Light and Dark, 0 contrast failures.

| Figma | Value | Implementation | Test |
|---|---|---|---|
| Tab | 40px tall, padding 8/16, 1px `Border/Basic` bottom (Active: 2px `Border/Strong`) | `h-sds-500`, `px-sds-200`, list `border-sds-border-basic`, active `border-b-2 border-sds-border-strong` | `Tabs.figma.test.tsx` (height) |
| Content gap | 4px between icon, label and badge | `gap-sds-50` | `Tabs.figma.test.tsx` |
| Label | 16px, Regular / Bold (Hover, Active); `Text/Secondary` / `Text/Primary` / `Text/Disable` | `typo-label-l-regular` / `-bold`, text tokens | `Tabs.figma.test.tsx` (hover color) |
| Icon | 20×20; `Icon/Secondary`, Hover `Icon/Primary Hover`, Active `Icon/Primary`, Disabled `Icon/Disable` | `[&>div>svg]:size-5` + per-state `text-sds-icon-*` | `Tabs.figma.test.tsx` |
| Badge | trailing Badge instance (`Surface/Emphasis`, `Text/On Surface`) | consumer `<Badge />` child | — |
| Focus ring | same-size rectangle, 2px `Border/Focus` inside stroke, radius 6 | `focusRing` overlay, `rounded-[6px]` (literal Figma radius) | `Tabs.figma.test.tsx` |
| List | 16px at the start and end; tabs not stretched to fill; horizontal scroll when they overflow; auto-scroll the selected tab into view with a 16px margin | `px-sds-200`, `overflow-x-auto`, `scroll-px-sds-200`, `Tabs` auto-scroll | `Tabs.figma.test.tsx`, `ManyTabsScrollable` |
| Sticky under the top navigation while the page scrolls | guideline | **Not implemented** — page layout, owned by the consumer | — |
| Panel padding | — | `p-4` (unchanged) | — |

## 8. Accessibility

- **Semantic element / role:** `tablist` / `tab` / `tabpanel` from Radix, with `aria-selected`, `aria-controls`, `aria-labelledby`.
- **Accessible name:** Trigger text content.
- **Keyboard interactions:** Tab enters the list at the active tab; ArrowLeft/Right move and select (wrapping, skipping disabled); Home/End (Radix). Real-key coverage: `InteractionArrowNavAndDisabledSkip`.
- **Focus management:** Documented structural exception to `FOCUS_RING_OFFSET_*` (`focusRing.ts` rule #3, `design-foundation.md` §5.1): `outline` paints outside the border-box and cannot cover the active `border-b-2`, so the ring is a bordered overlay child. Trigger has `outline-none`; `TabsContent` also has `outline-none`, so a focused panel shows no ring.
- **Disabled semantics:** Native `disabled`.
- **Screen reader behavior:** Radix-provided tab semantics. The focus overlay is `aria-hidden`.

## 9. Theming

- **Light/dark behavior:** Semantic tokens only.
- **Verification method used:** the 4 layers of `references/theme-verification.md` — `figma:theme-check` (12/12 tokens, Light + Dark), `storybook` 9/9 + `storybook-dark` 9/9, token-resolved tests in a light and a dark region (`Tabs.figma.test.tsx`), all-state contrast PASS (disabled text exempt).

## 10. Market Benchmark

`market-benchmark.md` lists Tabs as a correct 4-part compound API (Radix/Chakra/Mantine/shadcn parity). Its two recorded gaps — JSDoc documenting nonexistent `badgeLabel`/`icon` props, and a required `defaultValue` — are both fixed (`remediation-matrix.md`).

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Props types not exported | Package audit (P6-HIGH-01) | Fixed | `test/api/tab.test-d.tsx` |
| JSDoc documented nonexistent `badgeLabel`/`icon` props | Logic audit | Fixed | n/a (docs) |
| `defaultValue` unnecessarily required | Market benchmark | Fixed — optional | `Tabs.test.tsx` controlled test (renders without `defaultValue`) |
| LOGIC-TAB-01: 4x no-op `useMemo(() => tabsStyles(), [])` | Logic audit | Fixed — removed | n/a |
| Zero interaction coverage | Production certification | Fixed | `InteractionArrowNavAndDisabledSkip` |
| Code Connect `badgeCode` interpolated without a guard | `figma-code-connect.md` §3 (suspect list) | Fixed — ternary guard | mock-runtime harness (2026-10-07) |
| Many tabs squeezed to ~47px each and wrapped their label onto several lines inside the 40px tab; the list overflowed visibly (guideline: one line, keep size, scroll horizontally) | Figma alignment, 2026-10-07 | Fixed — `whitespace-nowrap`, list `overflow-x-auto` | `Tabs.figma.test.tsx` (mutation: removing either fails) |
| No auto-scroll to a selected, cut-off tab | Figma alignment, 2026-10-07 | Fixed — `Tabs` scrolls the active trigger into view (`nearest`, 16px scroll-padding) | `Tabs.figma.test.tsx`, `ManyTabsScrollable` |
| Content gap 8px (Figma 4px); hover icon inherited `text-primary` (Figma `icon-primary-hover`) | Figma alignment, 2026-10-07 | Fixed | `Tabs.figma.test.tsx` |
| Focus-ring overlay extended 2px below inactive tabs; once the list became a scroll container that bottom edge was clipped | Figma alignment, 2026-10-07 (found while fixing the overflow) | Fixed — `bottom-0`, `-bottom-0.5` only on the active tab | `Tabs.figma.test.tsx` |
| Code Connect did not map the Icon and found the Badge by layer name | Figma alignment, 2026-10-07 | Fixed — both resolved by Code Connect id (`icon-*`, `badge`) | mock-runtime harness |

## 12. Examples

```tsx
<Tabs defaultValue="overview">
  <TabsList aria-label="Project sections">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="issues">
      Issues <Badge label="12" />
    </TabsTrigger>
    <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">…</TabsContent>
  <TabsContent value="issues">…</TabsContent>
</Tabs>

// Controlled
<Tabs value={tab} onValueChange={setTab}>…</Tabs>
```

## 13. Known Limitations

- **Figma との既知の差分（フォント）**: Figma ではこのコンポーネントの一部のテキストに Label/En 系スタイル（欧文 Inter）が使われているが、実装では Inter を使わない（既定 `system-ui`、ブランドフォントは Noto Sans JP）。Dev Mode の `font-family: Inter` はコードに書き写さない。Figma 側は今後の更新で Noto Sans JP に統一予定（`design.md` §3.1）。
- Hover/active switch the label to bold, which can change the trigger's width. `Tabs.styles.ts` contains a `before:content-[attr(data-text)]` width-reservation technique, but no code sets `data-text` on the trigger, so it reserves nothing unless a consumer passes `data-text` themselves.
- `TabsContent` uses `p-4` (non-`sds` spacing) and suppresses its own focus outline.
- `TabsTrigger` uses `transition-colors`; safe here because the ring is a border on a child element, not an `outline` on the trigger.
- Icon styling (20px, per-state color) applies to an `<svg>` placed directly in the trigger content; an icon wrapped in another element keeps its own size/color.
- Auto-scroll runs on user selection (`onValueChange`); a controlled `value` changed programmatically does not scroll.
- The guideline's sticky-under-navigation behavior is page layout and is left to the consumer.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | Retroactive spec (no C/D run) | — | — | — | — | — | — | — | — | — | not scored | none known | Verified (no `/test` run; not scored) |
| 2026-10-07 | Figma alignment (Classification F) | — | — | — | — | — | — | — | — | — | 92/100 | none | Verified |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
