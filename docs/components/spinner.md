# `Spinner` — Component Specification

## 1. Identity

- **Classification:** E (truly new component) — no existing component covers indeterminate loading. `grep`-confirmed: the only `loading`/`spinner` string in `src/components/**` prior to this component was an unrelated match in `Modal.tsx`.
- **Figma node:** `17037:213` (documentation page), master component `16945:9204` (file `fSzxt8wKkXsn8fmxkPBUr2`).
- **Figma re-check 2026-10-07** (`/component Spinner`, REST API): no drift — sizes 16/24/40 with track/arc 1.5/2/3px (arc `innerRadius` 0.8125/0.8333/0.85), arc 33% starting at 12 o'clock (`startingAngle` 4.712 rad → `endingAngle` 6.786 rad), round caps, tokens `surface/subtle` + `icon/primary` (Inverse: `surface/subtle inverse` + `icon/primary inverse`); `pnpm figma:theme-check` PASS. Only Code Connect was missing.
- **Code Connect:** `Spinner.figma.ts` → `16945:9204` (added 2026-10-07): Size → `size` (small omitted), Inverse=True → `inverse`; `label` is not in Figma, so it is left at its default.
- **Figma component description (usage guideline text, verbatim):** "処理の実行中であることを示す回転するインジケーター。※ 濃い色の面やオーバーレイの上では `Inverse` を有効にする — Do: 保存や認証など、待ち時間や進捗が読めない処理の実行中 / Don't: 進捗が計測できる処理は `Progress Bar` を使用."

## 2. Exhaustive Sub-Component Enumeration

`get_metadata` on the master component frame (`16945:9204`) enumerated exactly 6 symbols — the full `Size × Inverse` matrix, no other sibling component:

| Symbol | Node ID |
|---|---|
| Size=Small, Inverse=False | `16945:9195` |
| Size=Medium, Inverse=False | `16945:9199` |
| Size=Large, Inverse=False | `16945:9203` |
| Size=Small, Inverse=True | `16968:10610` |
| Size=Medium, Inverse=True | `16968:10616` |
| Size=Large, Inverse=True | `16968:10622` |

Note: the documentation page's own auto-generated preview code (`get_design_context` on the top-level frame `17037:213`) never renders "Medium, Inverse=True" — its generated helper silently falls through to the Small/Inverse=False asset for that combination. Confirmed via `get_metadata` above that the real variant genuinely exists (`16968:10616`); this is a gap in the doc page's own preview grid, not a real product constraint restricting `inverse` to only Small/Large. `size` and `inverse` are therefore implemented as fully orthogonal props.

Distinct from `Progress Bar` (already implemented as `Snackbar`'s internal `ProgressBar.tsx`, node `16982:11702`) — Figma explicitly separates the two ("Progress Bar との使い分け"): Spinner for indeterminate processes, Progress Bar for processes with a measurable remaining amount. Never show both for the same process.

## 3. Anatomy

- **Root** (`div`, `role="status"`, `aria-live="polite"`) — the accessible live region.
  - **`svg`** (`aria-hidden`) — purely decorative; continuously rotating.
    - **track** (`circle`) — full-circle background, low-contrast, deliberately near-invisible.
    - **arc** (`circle`) — 33%-of-circumference stroke, round line caps, the actual visible rotating indicator.
  - **visually-hidden label** (`span.sr-only`) — the real accessible name.

## 4. API

```ts
type SpinnerSize = 'small' | 'medium' | 'large';

type SpinnerProps = Omit<ComponentProps<'div'>, 'children'> & {
  size?: SpinnerSize;      // @default 'small' — Figma's own default variant
  inverse?: boolean;       // @default false
  label?: string;          // @default 'Loading' — visually-hidden accessible text
};
```

`children` is withheld — Spinner has no content slot; pair it with adjacent text via composition (see §5) rather than passing content through it.

## 5. Composition & Customization

Spinner intentionally does not own:
- **Text pairing** — Figma's own preview examples always pair Spinner with adjacent status text ("ファイルを保存しています", "サインインしています"), but this is achieved by placing a sibling element next to `<Spinner>`, not a `label`/`text` prop that renders visible content (`label` is visually-hidden only).
- **Overlay/scrim wrapping** — the "Card mid-refresh" and "full-screen scrim" examples in Figma are built by the CONSUMER composing a plain positioned wrapper (`absolute inset-0 flex items-center justify-center bg-background-scrim`) around `<Spinner inverse />`, not a `<Spinner overlay>` prop. See `CardOverlay` story.
- **Button loading state** — `Button` has no `loading` prop in this repo (confirmed: no `loading`/`isLoading` in `Button.tsx`). Figma's own "Button Loading" example is reproduced via composition only (`<button disabled><Spinner inverse size="small" />label</button>` — see `InButton` story); adding a dedicated `loading` prop to `Button` is out of scope for this component's implementation and was not requested.
- **Minimum display duration** — Figma's own spec (§7 below) mandates a 500ms minimum display time before a spinner may be removed, to avoid a perceived screen flicker. This is a consumer-side timing concern (the consumer controls when Spinner mounts/unmounts based on its own async operation), not something Spinner can own — it has no notion of when the underlying process starts or finishes. **Deferred**, documented as consumer guidance only; see §12.
- **Determinate/progress value** — rejected outright; that is `Progress Bar`'s explicit, documented job (§2).

## 6. State Matrix

| State | Behavior |
|---|---|
| Mounted | Rotates continuously, `role="status"`/`aria-live="polite"` announces `label` |
| `prefers-reduced-motion: reduce` | Rotation frozen (`motion-reduce:animate-none`) — Figma explicitly permits "stop or reduce" (WCAG 2.3.3) |
| `inverse` | Track/arc swap to light-on-dark tokens |
| Unmounted | Fully removed — no exit transition documented in Figma |

There is no disabled/error/hover/focus/active state — Spinner is non-interactive and never receives focus.

## 7. Design Tokens — Figma Traceability

| Figma variable | Value | Tailwind class | Role |
|---|---|---|---|
| `Icon/Primary` | `#333333` | `stroke-icon-primary` | Arc, non-inverse |
| `Icon/Primary Inverse` | `#e7e7e7` | `stroke-icon-primary-inverse` | Arc, inverse |
| `Surface/Subtle` | `#00000014` (8% black) | `stroke-surface-subtle` | Track, non-inverse |
| `Surface/Subtle Inverse` | `#ffffff21` (13% white) | `stroke-surface-subtle-inverse` | Track, inverse |

All 4 confirmed already present in `scripts/global.css` (`--color-icon-primary`, `--color-icon-primary-inverse`, `--color-surface-subtle`, `--color-surface-subtle-inverse`) before use — no new token needed.

**Sizes** ("デザイン仕様 → サイズ", read directly off the `Style`/`Range` annotation components in the doc page, not guessed): Small 16px box / 1.5px track+arc stroke; Medium 24px / 2px; Large 40px / 3px.

**Shape** ("形状"): "円弧は全周の33%。12時を起点に時計回りに配置し、線端は丸めます。背景には全周のトラックを敷きます。" — arc is 33% of the circle, starts at 12 o'clock, clockwise, round line caps, full-circle track behind it. Implemented via `stroke-dasharray={[circumference*0.33, circumference]}` with round `stroke-linecap`, radius computed as `(box - stroke) / 2`.

**Motion** ("モーション"): "時間：1秒でループ" / "回転：時計回りに358度" / "イージング：`cubic-bezier(0.5, 0.2, 0.5, 0.8)`". The hint box explains the 358° (not 360°) choice explicitly: "360度ではなく358度にすることで、ループの継ぎ目に2度のずれが生まれます。減速から加速へ切り替わる瞬間に、回転が停止して見えるのを防いでいます。" (2° short of a full turn so the loop seam doesn't read as a momentary freeze at the exact point the easing decelerates into re-acceleration). Implemented as a single keyframe `from { rotate(-90deg) } to { rotate(268deg) }` (268 = -90 + 358 — the -90 folds in the 12-o'clock start, so no separate static offset is needed), `--animate-spinner-rotate` in `src/styles.css` (deliberately not Tailwind's built-in `animate-spin`, which is linear/360°).

**Reported drift (not silently corrected, per `.claude/rules/design-foundation.md` §6):** `get_motion_context` on the animated symbol node reported `timelineDurationMs: 1200` (with `motionSummary: null`, no keyframe/easing data extracted) — this conflicts with the written guideline's explicit "1秒でループ" (1000ms). The written guideline is treated as authoritative here (it gives exact, deliberate numbers — duration, degrees, and a specific cubic-bezier — while the motion-context tool returned only a coarse timeline-container duration with no actual keyframe data, most plausibly an artifact of how the Figma prototype's Smart Animate transition itself was authored rather than the intended production CSS duration). Flagging this discrepancy here rather than silently picking one value.

## 8. Accessibility

- **State communication** ("状態の伝達"): "スピナーは視覚的な表現のみです。読み上げ環境には処理中であることをテキストで伝えてください。処理が完了したことも同様に通知が必要です。" — implemented via `role="status"` + `aria-live="polite"` + a visually-hidden `label` (default `'Loading'`, never silently unlabeled). Completion announcement is a consumer responsibility (Spinner has no concept of when the underlying task finishes) — documented, not implemented, per §5.
- **Reduced motion** ("アニメーションの抑制", WCAG 2.3.3): `motion-reduce:animate-none` freezes rotation under `prefers-reduced-motion: reduce`.
- **Contrast** ("コントラスト", WCAG 1.4.11): arc-to-background must be ≥3:1 — `icon-primary` (#333) on light and `icon-primary-inverse` (#e7e7e7) on dark both comfortably exceed this. The track is deliberately low-contrast (8%/13% alpha) since it carries no information on its own; only the arc must be distinguishable.
- The decorative `svg` is `aria-hidden="true"` — the accessible name comes entirely from the visually-hidden `span`, never from color/motion alone (`.claude/rules/accessibility.md` §4.3).

## 9. Theming

Colors are semantic tokens (`stroke-icon-primary`/`stroke-surface-subtle` + their `-inverse` pairs) — no dark-mode-specific override needed beyond what `inverse` already provides, since `inverse` is an explicit, consumer-controlled placement choice (dark surface vs. light surface), not tied to the app's light/dark theme mode itself.

## 10. Market Benchmark

| Pattern | MUI `CircularProgress` | Chakra `Spinner` | Ant Design `Spin` | Decision |
|---|---|---|---|---|
| `size` (fixed steps vs. numeric) | numeric px | `xs`–`xl` enum | `small`/`default`/`large` | **ADAPT** — Figma defines exactly 3 fixed steps, so a closed enum (matches Chakra/Antd), not a numeric prop (MUI) |
| `role="status"` + visually-hidden label | — | Yes, identical pattern | — | **KEEP** — matches Chakra exactly, and this repo's own `Avatar` status-dot precedent |
| Determinate/`value` prop | Yes | — | Yes (`percent`) | **REJECT** — Figma explicitly reserves this for the separate `Progress Bar` component |
| `children`-wrapping overlay (dim content + centered spinner while `spinning`) | — | — | Yes (`Spin` wraps children) | **REJECT** for the base component — built via plain composition instead (`CardOverlay` story), keeping Spinner a single-purpose visual primitive per Step 6's composability review |
| Customizable `thickness`/`speed` | Yes | Yes (`speed`, `thickness`) | — | **DEFER** — no continuous customization documented in Figma; the 3 fixed size/stroke pairs are a closed set |

## 11. Regression Matrix

| Date | Issue | Fix | Test |
|---|---|---|---|
| 2026-09-08 | N/A (initial implementation) | — | Full suite below |

## 12. Known Limitations

- **Minimum display duration (500ms) is not implemented** — Figma's own spec requires it, but it is a consumer-side timing concern (see §5). Documented here as guidance: hold the spinner mounted for at least 500ms after showing it, even if the underlying task completes sooner, to avoid a perceived flicker.
- **Completion announcement is not implemented** — Spinner has no way to know when the task it represents finishes; the consumer must announce completion separately (e.g. its own `aria-live` region) when swapping the spinner out for real content.
- **`get_motion_context`'s reported 1200ms timeline duration vs. the written "1秒" (1000ms) spec** — see §7's "Reported drift" note. Implemented per the written spec.

## 13. Examples

```tsx
import { Spinner } from '@sun-asterisk/nova/spinner';

// Default
<Spinner />

// Full-page/modal loading
<Spinner size="large" label="Loading dashboard" />

// On a dark surface / overlay
<Spinner inverse size="large" />

// Inline with status text
<div className="flex items-center gap-2">
  <Spinner size="small" />
  <span>Saving…</span>
</div>
```

## 14. Quality Score & History

| Pass | Date | Score | Notes |
|---|---|---|---|
| 1 | 2026-09-08 | 95/100 | Initial implementation. Full Figma variant matrix confirmed (6/6 symbols). Sizes/shape/motion/colors all traced to explicit Figma spec text, not guessed. One reported (not silently resolved) drift: `get_motion_context`'s 1200ms vs. written "1秒". Two deliberately deferred consumer-side behaviors (min-display-duration, completion announcement), documented rather than implemented. |
| 2 | 2026-10-07 | 96/100 | `/component Spinner` Figma re-check: no visual drift (see §1). Added Code Connect (`Spinner.figma.ts`, all 6 combinations rendered through a mock runtime; `code-connect:check` valid). |
