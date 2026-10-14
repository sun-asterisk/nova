# `ProgressBar` — Component Specification

## 1. Identity

- **Classification:** E, with a caveat — a same-purpose-adjacent, differently-scoped private widget already existed (see §2). No PUBLIC component previously satisfied this request: `grep`-confirmed `ProgressBar` was never exported from `src/components/snackbar/index.ts` or the top-level `src/components/index.ts`.
- **Figma node:** `17121:11722` (documentation page), master component `16982:11702` (file `fSzxt8wKkXsn8fmxkPBUr2`).
- **Figma re-check 2026-10-07** (`/component ProgressBar`, REST API): no drift — heights 4/6/8px, `radius/full` on track and progress, `surface/subtle` + `icon/primary` (Inverse: `surface/subtle inverse` + `icon/primary inverse`), width follows the container; `pnpm figma:theme-check` PASS. Pinned by the new `ProgressBar.figma.test.tsx` (3 sizes + both color modes, light/dark).
- **Code Connect:** `ProgressBar.figma.ts` → `16982:11702` (added 2026-10-07): Size → `size`, Inverse → `inverse`. Figma expresses the progress amount with the instance's right padding (not a component property), so the snippet carries placeholder `value={60}` (the default 60% look) and `aria-label` (required by ProgressBar).
- **Figma component description (verbatim):** "処理の進捗を割合で示すインジケーター。※ 進捗は右パディングで表現する。0% = パディング100%、100% = パディング0 — Do: アップロードなど、完了までの割合が判明している処理 / Don't: 完了時期が不明な待機はSpinnerを使用."

## 2. Relationship to `snackbar/ProgressBar.tsx` (pre-existing, private)

Before this component, `src/components/snackbar/ProgressBar.tsx` already existed — but it is **not** a general-purpose progress bar and was never exported publicly. It implements Snackbar's own auto-dismiss **countdown** (a `duration`-driven CSS transition from 100%→0% width, firing `onComplete` on `transitionend`), a fundamentally different behavior model from a **value-driven** determinate progress display:

| | `snackbar/ProgressBar.tsx` (private) | `progressBar/ProgressBar.tsx` (this component, public) |
|---|---|---|
| Driven by | `duration` (ms) — time-based, auto-animates | `value`/`max` — controlled, reflects a real measured number |
| Purpose | Snackbar's own auto-dismiss visual countdown | General determinate progress display (uploads, batch processing, etc.) |
| Exported publicly | No | Yes (`./progress-bar` subpath) |
| Size/Inverse variants | No (hardcoded to Snackbar's own always-inverse, single fixed height) | Yes — full Figma 3-size × 2-inverse matrix |

Both happen to share the name "ProgressBar" because both are, visually, a track+fill bar — this is not a conflict: different files, different folders, the private one is never exported so there is no package-level or TypeScript-compile-level collision, and Figma's own component documentation (the comment already in `snackbar/ProgressBar.tsx`, referencing this exact master node `16982:11702`) already anticipated exactly this relationship before this component existed. **Decision:** implement the new component fresh, matching the full public Figma spec; leave the private Snackbar countdown widget untouched — it is a certified, tested, working implementation of a genuinely different (time-based, not value-based) behavior, and CLAUDE.md's "preserve existing behavior unless a change is explicitly approved" / "avoid unnecessary breaking changes" argue against a purely-cosmetic rename of already-audited code as an unrequested side effect of this task.

## 3. Exhaustive Sub-Component Enumeration

`get_metadata` on the master component frame (`16982:11702`) enumerated exactly 6 symbols — the full `Size × Inverse` matrix, no other sibling component:

| Symbol | Node ID | Height |
|---|---|---|
| Size=Small, Inverse=False | `16982:11686` | 4px |
| Size=Medium, Inverse=False | `16982:11689` | 6px |
| Size=Large, Inverse=False | `16982:11692` | 8px |
| Size=Small, Inverse=True | `16982:11695` | 4px |
| Size=Medium, Inverse=True | `16982:11698` | 6px |
| Size=Large, Inverse=True | `16982:11701` | 8px |

No other component/symbol found on this documentation page. Distinct from `Spinner` (node `16945:9204`) — Figma explicitly separates the two ("Spinner との使い分け"): ProgressBar for measurable/determinate processes, Spinner for indeterminate ones. Never show both for the same process.

## 4. Anatomy

- **Root** (`role="progressbar"`, via Radix `Progress.Root`) — the track.
  - **Indicator** (via Radix `Progress.Indicator`) — the fill, width set to `value/max` as a percentage.

No built-in visible numeric label — Figma's own "配置と幅" guideline treats the percentage/count text as a separately-placed sibling element (right-aligned, fixed-width, to prevent layout jitter as digit count changes), not a slot owned by the bar itself. See `WithValueLabel` story for the composition pattern.

## 5. API

```ts
type ProgressBarSize = 'small' | 'medium' | 'large';

type ProgressBarProps = Omit<ComponentProps<typeof ProgressPrimitive.Root>, 'value' | 'children'> & {
  value: number;              // required — no default; always determinate
  max?: number;                // @default 100
  size?: ProgressBarSize;      // @default 'small' — Figma's own default variant
  inverse?: boolean;           // @default false
  // + getValueLabel?(value, max): string — passed through from Radix's Progress.Root
};
```

Built on Radix's `Progress` primitive — already available via the project's existing unified `radix-ui` package dependency (confirmed via `node -e "require('radix-ui').Progress"`, no new dependency needed; same pattern as `Avatar`). Radix's `Progress.Root` supplies `role="progressbar"` + `aria-valuemin="0"` + `aria-valuemax` + `aria-valuenow` + `aria-valuetext` (defaulting to `` `${Math.round(value/max*100)}%` ``, overridable via `getValueLabel`) automatically — confirmed by reading its actual runtime source (`node_modules/.../@radix-ui/react-progress/dist/index.mjs`), not assumed from the type declarations alone.

`value` is **required**, with no default — Figma's own guidance is explicit that a Progress Bar must never be shown at a stalled/fake 0% while the real percentage is still unknown (§7); forcing an explicit `value` makes it harder to accidentally render one prematurely.

## 6. Composition & Customization

- **Numeric label** — composed as a sibling (`WithValueLabel` story), not a prop, per Figma's own placement guideline.
- **Width** — Figma's own size-spec diagram labels the bar's width "Variable to content" (no fixed width documented; "プログレスバーの横幅は要素を基準に自由に決めて構いません"). The root defaults to `w-full` (fills its container); consumers control actual width via a wrapper element or `className`.
- **Spinner hand-off** — Figma's own "表示と制御" guidance: if the percentage takes time to become known, show `Spinner` first, then swap to `ProgressBar` once it's calculable — never show a stalled 0% bar. This is a consumer-side usage pattern (which component is mounted when), not an API this component owns.
- **Value-change smoothing** — a 200ms `ease-out` width transition is applied to the indicator (`motion-reduce:transition-none` respected). This duration is a judgment call, not an explicit Figma-specified number (Figma gives no transition duration for ProgressBar, unlike `Spinner`'s explicit "1秒") — chosen to be short enough that it never reads as "faking" progress ahead of/behind the real value (Figma's own explicit constraint, §7), only smoothing the render of real value changes.

## 7. State Matrix

| State | Behavior |
|---|---|
| `value` changes | Indicator width updates to the new `value/max` percentage, with a brief 200ms smoothing transition |
| `value` out of `[0, max]` | Rendered width is defensively clamped to `[0%, 100%]`; the raw value is still passed to Radix's own `value`/`max` validation, which logs a `console.error` and reports an "indeterminate"-like ARIA state (`aria-valuenow` omitted) for genuinely invalid input — a caller bug worth surfacing, not silently hidden |
| `value === max` | Radix sets `data-state="complete"` on both Root and Indicator (available for consumer styling if needed; not used by this component's own styles) |
| `inverse` | Track/fill swap to light-on-dark tokens |

There is no disabled/error/hover/focus/active state — ProgressBar is non-interactive and never receives focus.

## 8. Design Tokens — Figma Traceability

| Figma variable | Value | Tailwind class | Role |
|---|---|---|---|
| `Icon/Primary` | `#333333` | `bg-icon-primary` | Fill, non-inverse |
| `Icon/Primary Inverse` | `#e7e7e7` | `bg-icon-primary-inverse` | Fill, inverse |
| `Surface/Subtle` | `#00000014` | `bg-surface-subtle` | Track, non-inverse |
| `Surface/Subtle Inverse` | `#ffffff21` | `bg-surface-subtle-inverse` | Track, inverse |
| `Full` | `999` | `rounded-full` | Track + fill corner radius |

All 4 colors confirmed identical to `Spinner`'s own token traceability (same `get_variable_defs` result on both master components) — already present in `scripts/global.css` before use, no new token needed.

**Heights** (confirmed via `get_metadata` symbol dimensions, not guessed): Small 4px, Medium 6px, Large 8px.

**Fill technique — a deliberate code-vs-Figma adaptation, documented not silently chosen:** Figma's own component description states the fill is authored via *right padding* on the track ("進捗は右パディングで表現する。0% = パディング100%、100% = パディング0") — an auto-layout trick internal to how the design tool itself encodes a percentage fill. The generated reference code mirrors this (`pr-[Npx]` on the track + a `flex-1` fill div). This implementation instead uses a plain `width: {percent}%` on a separate Indicator div — functionally and visually identical, but idiomatic for code (matches the pre-existing `snackbar/ProgressBar.tsx`'s own technique, and matches how Radix's `Progress.Indicator` is conventionally styled). The padding-vs-width difference is a Figma-authoring detail, not a visual spec deviation.

## 9. Accessibility

- **`aria-label` (or `aria-labelledby`) is required, not optional** — found via this repo's own addon-a11y gate (`test: 'error'`) while writing this component's stories: every story initially failed `aria-progressbar-name` (axe). `aria-valuetext` describes the **value** ("42%"), not the widget's **name** (what is progressing — "Uploading file", "Loading dashboard"). `role="progressbar"` requires both, same as any other ARIA widget role needs an accessible name. This component does not supply a default name (it has no way to know what the caller is tracking) — every real usage MUST pass `aria-label` or `aria-labelledby` explicitly, or it fails WCAG 4.1.2 or an axe/addon-a11y scan exactly like the initial stories did here.
- **State communication** ("状態の伝達"): "読み上げ環境には現在の進捗を数値で伝えてください。バーの見た目だけでは割合が伝わりません。処理が完了したことも同様に通知が必要です。" — satisfied automatically by Radix's `role="progressbar"` + `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext` (default `"NN%"`, overridable via `getValueLabel`). Completion announcement beyond the value reaching 100% (e.g. a spoken "Done" message) is a consumer responsibility, same as `Spinner`.
- **Not color/length alone** ("色以外での伝達", WCAG 1.4.1): "進捗を色や長さだけで伝えないでください。割合が判断に必要な場面では数値を併記します。" — the ARIA value attributes satisfy this for assistive technology regardless of whether a visible numeric label is also shown; a visible label is still recommended when the percentage matters for sighted users' decisions (see `WithValueLabel`).
- **Contrast** ("コントラスト", WCAG 1.4.11): fill-to-track contrast must be ≥3:1 — identical tokens to `Spinner`, already confirmed sufficient there.
- **No `aria-live`:** deliberately omitted. A progress bar driven by frequent real value updates (e.g. every network chunk) would generate excessive, disruptive announcements if wrapped in a live region — Radix's own `Progress` primitive does not add one either. If a consumer's use case genuinely needs verbose updates, that's a call for their own wrapping, not a default this shared component should impose.

## 10. Theming

Colors are semantic tokens with an explicit `inverse` toggle (not tied to the app's light/dark theme mode) — same rationale as `Spinner` (§9 of that spec).

## 11. Market Benchmark

| Pattern | MUI `LinearProgress` | Chakra `Progress` | Ant Design `Progress` | Radix `Progress` | Decision |
|---|---|---|---|---|---|
| Underlying primitive | Own implementation | Own implementation | Own implementation | `role="progressbar"` + ARIA value attrs, unstyled | **KEEP** — reuse Radix (already a dependency), matches CLAUDE.md's "don't replace an existing accessible primitive without a clear reason" |
| `size` (fixed steps vs. numeric) | numeric (`thickness`-like via `sx`) | `xs`–`lg` enum | `strokeWidth` numeric | none (unstyled) | **ADAPT** — Figma defines exactly 3 fixed heights, so a closed enum (matches `Spinner`'s own precedent in this repo) |
| Indeterminate mode | Yes (separate `variant`) | Yes (separate prop) | Yes | Yes (`value={null}`) | **REJECT** — Figma explicitly reserves indeterminate display for the separate `Spinner` component; this component's `value` is required and always a number |
| `getValueLabel`/custom accessible text | `aria-label` only | — | `format` render prop | `getValueLabel` | **KEEP** — pass through Radix's own `getValueLabel` verbatim rather than inventing a parallel prop name |
| Built-in visible label/text | Some (`LinearProgressWithLabel` pattern in MUI docs, not built into the base component) | — | Yes (`format`, shows `%` by default) | — | **REJECT** for the base component — Figma's own placement guideline treats the label as a separately-composed sibling, not an owned slot (matches `Spinner`'s precedent) |

## 12. Regression Matrix

| Date | Issue | Fix | Test |
|---|---|---|---|
| 2026-09-08 | Every initial story failed `aria-progressbar-name` (axe, via addon-a11y's `test: 'error'` gate) — `role="progressbar"` had `aria-valuetext` but no accessible name | Added `aria-label` to every story; documented as a required part of real usage (§9), not something the component can default | `InteractionHasAccessibleValue` (`getByRole('progressbar', { name: ... })`), addon-a11y gate on every story |

## 13. Known Limitations

- **No built-in visible numeric label** — by design (§6); composed via a sibling element in consumer code.
- **No `aria-live`** — by design (§9); a consumer needing verbose per-update announcements must add their own live region.
- **Spinner-to-ProgressBar hand-off timing is not implemented** — Figma's own guidance to show `Spinner` before the percentage is known, then switch, is a consumer-side usage pattern (which component is mounted when), not something either component can own on its own — same category of deferred decision as `Spinner`'s minimum-display-duration guidance.

## 14. Examples

```tsx
import { ProgressBar } from '@sun-asterisk/nova/progress-bar';

// Basic — aria-label is required (§9), not optional
<ProgressBar value={62} aria-label="Uploading file" />

// Custom max, larger size
<ProgressBar value={18} max={40} size="large" aria-label="Compressing images" />

// On a dark surface / overlay
<ProgressBar value={40} inverse size="large" aria-label="Loading dashboard" />

// With a visible, right-aligned fixed-width label
<div className="flex items-center gap-2">
  <ProgressBar value={74} className="flex-1" aria-label="Uploading file" />
  <span className="text-right w-8">74%</span>
</div>
```

## 15. Quality Score & History

| Pass | Date | Score | Notes |
|---|---|---|---|
| 1 | 2026-09-08 | 96/100 | Initial implementation. Full Figma variant matrix confirmed (6/6 symbols). Reused Radix's `Progress` primitive (no new dependency), verified its ARIA behavior by reading actual runtime source, not just type declarations. Explicitly documented (not silently resolved) the relationship to the pre-existing, differently-scoped private `snackbar/ProgressBar.tsx`. |
| 2 | 2026-10-07 | 97/100 | `/component ProgressBar` Figma re-check: no drift. Added `ProgressBar.figma.test.tsx` (computed sizes/colors, light + dark) and Code Connect (`ProgressBar.figma.ts`, 6 combinations rendered via a mock runtime; `code-connect:check` valid). |
