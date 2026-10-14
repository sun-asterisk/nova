# `StatusIcon` — Component Specification

## 1. Identity

- **Classification:** E (truly new component) — `grep`-confirmed no existing `StatusIcon`/status-icon pattern anywhere in `src/components`.
- **Figma node:** `17234:11801` (documentation page), master component `8867:2716` (file `fSzxt8wKkXsn8fmxkPBUr2`).
- **Code Connect:** `StatusIcon.figma.ts` → `8867:2716` (added 2026-10-07): Status (all 5 values) → `status`, Inverse → `inverse`.
- **Figma re-check 2026-10-07:** icons/colors/box unchanged; the page's Update Log notes the move from the Icons page and the axis rename State → Status (already `status` in code). Guideline text is still unwritten ("Alert の作成時に…執筆します"), including whether `Status=Loading` stays. One drift fixed — the loading spinner size (§6).
- **Figma component description (verbatim):** "情報の種類や処理の結果を、決まったアイコンと色の組み合わせで示すアイコン。※ 濃い色の面の上では `Inverse` を有効にする — Do: 通知や結果表示で、情報の種類を色と形で伝えるとき / Don't: 任意のアイコンを置きたい場合は `Icon / *` を直接使用."

## 2. Figma Documentation Status — Unfinished (important, read first)

**This Figma page is explicitly marked incomplete by its own authors.** The "ガイドライン" (guidelines) section reads only "執筆中" (draft/in-progress): "Alert の作成時にガイドラインとデザイン仕様を執筆します。あわせて Status=Loading を残すかを判断します。" (Guidelines and design spec will be written when `Alert` is created. At the same time, we'll decide whether to keep `Status=Loading`.) There is no written accessibility guidance, no contrast citation, and no confirmation that `loading` is a permanent part of this component — unlike `Spinner`/`ProgressBar`, whose Figma pages had fully-written guideline sections.

Per `.claude/rules/design-foundation.md` §6 ("report drift, don't silently correct it"), this is documented rather than silently resolved:

- **`loading` is included** because it exists as two real, working Figma variants today (`Status=Loading, Inverse=False` node `8867:2712`, `Status=Loading, Inverse=True` node `10693:2727`) — excluding a currently-real variant would under-cover the actual Figma component.
- **It is flagged provisional.** Re-verify this status value specifically when `Alert` is designed in Figma — it may be removed, renamed, or redefined at that point. This is a deliberate, documented risk, not an oversight.
- **Accessibility behavior (§9) is this repo's own reasoned application of `.claude/rules/accessibility.md` §5.2**, not a transcription of Figma-provided accessibility guidance (there is none).

## 3. Exhaustive Sub-Component Enumeration

`get_metadata` on the master component frame (`8867:2716`) enumerated exactly 10 symbols — the full `Status × Inverse` matrix (5 statuses × 2), no other sibling component, and confirmed **no `Size` axis at all** (every symbol is `24×24`, unlike `Spinner`/`ProgressBar`'s 3-size scale):

| Symbol | Node ID |
|---|---|
| Status=Info, Inverse=False | `8867:2715` |
| Status=Success, Inverse=False | `8867:2714` |
| Status=Caution, Inverse=False | `10660:7573` |
| Status=Danger, Inverse=False | `8867:2713` |
| Status=Loading, Inverse=False | `8867:2712` |
| Status=Info, Inverse=True | `10693:2725` |
| Status=Success, Inverse=True | `10693:2731` |
| Status=Caution, Inverse=True | `10693:2729` |
| Status=Danger, Inverse=True | `10693:2723` |
| Status=Loading, Inverse=True | `10693:2727` |

`get_design_context`'s "Component descriptions" block additionally confirmed the exact icon mapping via each icon's own Figma documentation:

| Status | Icon | Figma node | Icon's own Figma description |
|---|---|---|---|
| `info` | `Icon / Info Circle` | `16163:200` | "情報 / ガイド / ヒント" |
| `success` | `Icon / Check Circle` | `16162:2182` | "成功 / 完了" |
| `caution` | `Icon / Exclamation Triangle` | `16161:524` | "警告 / 注意" |
| `danger` | `Icon / Exclamation Circle` | `16163:285` | "エラー / 致命的な不具合" |
| `loading` | composes `Spinner` (node `16945:9204`) | — | — |

All 4 non-loading icons already existed in `src/components/icons/` (`IconInfoCircle`, `IconCheckCircle`, `IconExclamationTriangle`, `IconExclamationCircle`) — reused directly, no new icon SVGs created.

## 4. Anatomy

- **Root** (`span`, `size-[24px]`) — the accessible-name boundary.
  - Non-loading statuses: the matching `currentColor`-based `Icon/*` component, colored via a `text-icon-{status}[-inverse]` class.
  - `loading`: `Spinner` `size="medium"` (24px, 2px stroke) rendered at 20px — matching Figma's Medium instance at 20px (§6). Was `size="small"` (16px) until 2026-10-07.

**Consumers:** `Snackbar` renders `<StatusIcon status={…} inverse />` for every variant (2026-10-07) — Figma's Snackbar embeds this Status Icon component with Inverse = True (`info`, `success`, `warning`→`caution`, `error`→`danger`, `loading`).

## 5. API

```ts
type StatusIconValue = 'info' | 'success' | 'caution' | 'danger' | 'loading';

type StatusIconProps = Omit<ComponentProps<'span'>, 'children'> & {
  status: StatusIconValue;   // required — no default (see rationale below)
  inverse?: boolean;          // @default false
};
```

`status` is **required**, with no default — the same reasoning as `ProgressBar`'s required `value`: Figma's own generated reference code defaults to `status = "Info"`, but that default is an artifact of `get_design_context`'s codegen (the first variant in the grid), not a confirmed deliberate design default the way `Spinner`'s "Small" genuinely is (verified as the real default variant via `get_metadata`/`get_design_context` agreement for that component). Silently rendering an unrelated "info" icon when a caller forgets to pass `status` would be actively misleading (shows the *wrong* status, not just an incomplete one) — the same class of risk `ProgressBar`'s required `value` was designed to prevent.

## 6. Composition & Customization

- **`loading` reuses `Spinner`**, not a hand-duplicated arc. Figma (`Status=Loading`, 8867:2712, re-checked 2026-10-07 via the REST API) nests a Spinner **Size=Medium** instance (24px, arc `innerRadius` 0.8333 → 2px stroke) sized **20×20** inside the 24px box. Since 2026-10-07 the code renders exactly that: `Spinner size="medium"` with `className="size-5 [&_svg]:size-full"` — the svg keeps its 24px viewBox and scales to 20px, so the stroke stays proportional (≈1.67px), the same as Figma's scaled instance. **This reverses the 2026-09-08 decision** to use `size="small"` (16px): its reason (1), a CSS conflict between an explicit size and an `inset-[8.33%]` override, does not apply — no inset is used, only a plain 20px size; its reason (2), that Spinner's "Small" guideline covers embedding, was an inference, while the Figma component itself shows a 20px Medium spinner. Guarded by `StatusIcon.figma.test.tsx` (20px, viewBox 24, stroke-width 2, track/arc tokens in light/dark — fails with the old `size="small"`).
- **No visible text slot** — matches `Spinner`/`ProgressBar`'s established precedent in this repo; pair with adjacent text via composition (`WithAdjacentText` story).
- **No `Size` prop** — Figma defines none; this is a fixed single size (24px), unlike `Spinner`/`ProgressBar`.

## 7. State Matrix

| State | Behavior |
|---|---|
| `status` = info/success/caution/danger | Renders the matching static icon, colored per token |
| `status` = "loading" | Renders `Spinner` (continuously rotating, see `Spinner`'s own state matrix) |
| `inverse` | Swaps every status's color to its light-on-dark token |
| Unlabeled (default) | `aria-hidden="true"`, no `role` |
| `aria-label`/`aria-labelledby` provided | `aria-hidden` dropped, `role="img"` added |

No hover/focus/active/disabled state — non-interactive, never receives focus.

## 8. Design Tokens — Figma Traceability

| Figma variable | Non-inverse | Inverse | Tailwind class (non-inverse / inverse) |
|---|---|---|---|
| `Icon/Info` | `#0464be` | `#0d9aec` | `text-icon-info` / `text-icon-info-inverse` |
| `Icon/Success` | `#2aa847` | `#4fcb58` | `text-icon-success` / `text-icon-success-inverse` |
| `Icon/Caution` | `#b7791f` | `#eebb24` | `text-icon-caution` / `text-icon-caution-inverse` |
| `Icon/Danger` | `#dd2305` | `#fc593f` | `text-icon-danger` / `text-icon-danger-inverse` |

All 8 confirmed already present in `scripts/global.css` before use (`get_variable_defs` on the master component, cross-checked against `--color-icon-{info,success,caution,danger}[-inverse]`) — no new token needed. `loading` has no color token of its own; `Spinner` manages its own `Icon/Primary`/`Surface/Subtle` colors via its own `inverse` prop.

## 9. Accessibility

No written Figma accessibility guidance exists for this component (§2). The following is this repo's own reasoned application of `.claude/rules/accessibility.md` §5.2 ("Icon Handling"), not a Figma transcription:

- **Decorative by default** (`aria-hidden="true"`, no `role`) — Figma's own documented "Do" example (notifications/result displays) always pairs the icon with adjacent visible text that already conveys the meaning, matching §5.2's "paired with visible text → `aria-hidden`" branch.
- **Labeled when standalone** — passing `aria-label` (or `aria-labelledby`) automatically drops `aria-hidden` and adds `role="img"`, matching §5.2's "sole indicator → parent MUST have `aria-label`" branch. Never both `aria-hidden` and a label at once (contradictory — an `aria-hidden` element's label would never reach assistive technology).
- **Not color alone** (WCAG 1.4.1): each status uses a genuinely different *icon shape*, not color alone — satisfied structurally by the icon choice itself, independent of any Figma-provided guidance.
- **`loading`'s own `role="status"` live region is intentionally superseded**, not duplicated — see the code comment in `StatusIcon.tsx` for the ARIA-flattening reasoning (relies on `role="img"`'s standard descendant-pruning behavior when labeled; fully suppressed by the parent's `aria-hidden` when not).

## 10. Theming

Same rationale as `Spinner`/`ProgressBar` — `inverse` is an explicit, consumer-controlled placement choice, not tied to the app's light/dark theme mode.

## 11. Market Benchmark

| Pattern | MUI (`Alert`'s built-in icon mapping) | Chakra (no direct equivalent) | Ant Design (`Result`/`Alert` icon mapping) | Decision |
|---|---|---|---|---|
| Fixed status→icon+color mapping as its own standalone component | No — bundled inside `Alert` only | — | No — bundled inside `Alert`/`Result` only | **ADAPT** — this repo's Figma explicitly extracts it as its own reusable primitive (usable outside any future `Alert`), which none of the benchmarked libraries do as a standalone export |
| `loading` as a status alongside info/success/warning/error | Not typically (loading has its own separate spinner icon convention) | — | Ant Design's `Result` has a `status="info"` but no built-in "loading" result icon | **KEEP, flagged provisional** — real today in Figma, but Figma's own team is the one questioning whether it belongs (§2) |
| Decorative-by-default icon paired with text | Standard practice (MUI's `Alert` icon is `aria-hidden` by default) | — | Standard practice | **KEEP** — matches established practice plus this repo's own `.claude/rules/accessibility.md` §5.2 |

## 12. Regression Matrix

| Date | Issue | Fix | Test |
|---|---|---|---|
| 2026-09-08 | N/A (initial implementation) | — | Full suite below |
| Loading spinner 16px (`size="small"`) vs Figma's 20px Medium instance | Figma alignment, 2026-10-07 | Fixed — Medium scaled to 20px | `StatusIcon.figma.test.tsx` (mutation-verified) |
| No pixel/token tests per status; no Code Connect | `/component StatusIcon`, 2026-10-07 | Fixed — `StatusIcon.figma.test.tsx` (4 icons × default/inverse × light/dark: 24px box + icon, token colors); `StatusIcon.figma.ts` | — |

## 13. Known Limitations

- **`status="loading"` is provisional** — Figma's own team has not decided whether to keep it (§2). Re-verify when `Alert` is designed.
- **No written Figma accessibility/contrast guidance** — this component's accessibility behavior (§9) is this repo's own reasoned application of existing rules, not a Figma transcription, unlike `Spinner`/`ProgressBar`.
- **No `Size` axis** — by Figma's own design (§3), not an omission.

## 14. Examples

```tsx
import { StatusIcon } from '@sun-asterisk/nova/status-icon';

// Paired with text — the icon is decorative, the text carries the meaning
<div className="flex items-center gap-2">
  <StatusIcon status="success" />
  <span>Saved successfully</span>
</div>

// Standalone — needs its own accessible name
<StatusIcon status="danger" aria-label="Error" />

// On a dark surface / overlay
<StatusIcon status="info" inverse />

// Loading (provisional, see Known Limitations)
<StatusIcon status="loading" />
```

## 15. Quality Score & History

| Pass | Date | Score | Notes |
|---|---|---|---|
| 1 | 2026-09-08 | 94/100 | Initial implementation. Full Figma variant matrix confirmed (10/10 symbols). Confirmed via Figma's own "Component descriptions" block that each icon maps to an already-existing icon component and that `loading` composes `Spinner` — both reused directly, no duplication. Explicitly documented (not silently resolved) that Figma's own documentation page for this component is unfinished, with a specific, actionable flag on `loading`'s provisional status. |
| 2 | 2026-10-07 | 96/100 | Figma alignment: loading spinner now Figma's 20px Medium (was 16px small — §6 explains the reversal); `StatusIcon.figma.test.tsx` (light + dark, mutation-verified); Code Connect (`StatusIcon.figma.ts`, 10 combinations rendered via a mock runtime; `code-connect:check` valid). Figma guideline text still unwritten. |
