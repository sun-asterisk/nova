<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Snackbar` — Component Specification

## 1. Identity

- **Figma component name:** Snackbar
- **Figma file:** `FIGMA_FILE_KEY` ("Nova｜Master", `fSzxt8wKkXsn8fmxkPBUr2`, the official file) — component `7837:3652` (Description, Title + Title Label, Status Icon, Progress Bar, Action 1/2, Close Button) embedding `Status Icon` (`8867:2716`, Inverse) and `Progress Bar` (`16982:11702`, Large, Inverse); documentation frame `7637:4257`. Re-inspected 2026-10-07, including all 18 example instances and the guideline (fixed width, bottom-right, max 3 stacked, pause on hover, 4–8s, progress = task progress → success).
- **Figma node/component URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System?node-id=7637-4257 (documentation page); actual component: node `7837:3652`
- **Code name:** `Snackbar` (presentational component) + `useSnackbar`'s `showSnackbar()` (imperative toast API, sonner-backed) + `SnackbarContainer` (the sonner `<Toaster>` mount point) + internal-only `ProgressBar`/`SnackbarAction`
- **Package export:** `@sun-asterisk/nova/snackbar` (and root)
- **Category:** Simple Component (the bare `<Snackbar>` itself, purely presentational) + a hook-based imperative toast manager layered on top (`useSnackbar`, backed by the `sonner` library)

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-09-07 via `/component Snackbar --figma <url>` (Figma-fidelity audit + fix)
- **Owner/last touched by:** Workflow D (modify), 2026-09-07

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<div role="alert"\|"status">` | The notification surface | `role="alert"` for `variant="error"`, `role="status"` otherwise — an existing, deliberate ARIA choice (cited as the reference example for "set an ARIA attribute directly only when the component has information the headless layer doesn't" in `component-api-conventions.md`) |
| 2 | Icon | `<div>` (22px tall, centered on the first text line) wrapping the shared `StatusIcon` with `inverse` (20px) or a consumer `icon` | Status indicator | `info`→info, `success`→success, `warning`→caution, `error`→danger, `loading`→spinner — Figma embeds Status Icon (Inverse) |
| 3 | Content | `<div>` | Groups title, message, progress bar, and actions | `flex-1 flex flex-col gap-2` |
| 4 | Title | `<div>` (22px box) + truncating `<span>` | Optional bold headline | Rendered when `title` is set (optional since 2026-10-07); single line, truncated |
| 5 | Message | `<div>` | Optional supporting text | Rendered only when `message` is passed |
| 6 | Progress bar | shared `ProgressBar` (`inverse`, `size="large"`) + 4px bottom padding | Task progress (Figma Progress Bar) | Rendered only when `progress` is set — typically a `loading` snackbar. Not an auto-dismiss countdown (that bar was removed 2026-10-07; Figma has none) |
| 7 | Actions | `<div>` wrapping 1+ `SnackbarAction` (internal) buttons | Optional action buttons | Rendered only when `actions` has entries |
| 8 | Close button | `<button aria-label="Close notification">` (16px icon in a 22px-tall hit area, `icon-secondary-inverse`) | Dismiss control | Rendered when `closable` (default `true`) |

Auto-dismiss is owned by the internal `useAutoDismiss` hook (no visible bar): `duration` ms of unread time, pausing on hover / focus-within / hidden tab.

`SnackbarContainer` (wraps sonner's `<Toaster>`) and `showSnackbar()` (wraps sonner's `toast.custom()`, rendering a `<Snackbar>` inside) are the imperative-toast layer — a consumer typically uses these instead of mounting `<Snackbar>` directly, though `<Snackbar>` is fully usable standalone (e.g. inline in a page, not just as a floating toast).

## 4. API

### `Snackbar`

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `variant` | `'info' \| 'success' \| 'warning' \| 'error' \| 'loading'` | `'info'` | No | Status icon (inverse StatusIcon) + `role` (`alert` for `error`). `warning`/`loading` added 2026-10-07; `loading` never auto-dismisses | §4 (variant convention) |
| `title` | `string` | — | No (since 2026-10-07) | Bold single-line headline | — |
| `message` | `string` | — | No | Body M text (wraps). Provide `title`, `message`, or both | — |
| `progress` | `number` (0–100, clamped) | — | No | Task progress bar (added 2026-10-07); omit for no bar | — |
| `closable` | `boolean` | `true` | No | Shows/hides the close button | §7 (orthogonal boolean) |
| `duration` | `number \| false` | `4000` | No | Auto-dismiss delay in ms (pauses while read); `false` or `0` disables auto-dismiss; ignored for `loading` | — |
| `icon` | `ReactNode` | variant default | No | Overrides the default variant icon | — |
| `actions` | `SnackbarActionConfig[]` (`{ label: string; onClick: () => void }[]`) | — | No | Renders 1+ action buttons | — |
| `onClose` | `() => void` | — | No | Fires once, whichever of close-button-click / auto-dismiss-completion happens first (see §5's double-close guard) | — |
| `classNames` | `{ icon?, content?, actions?, closeButton? }` | — | No | Per-part styling escape hatch | §8 (classNames slot API) |

Extends `Omit<ComponentProps<'div'>, 'title'>` (native `title` is shadowed by Snackbar's own required string prop) — `className`, `id`, `data-*`, etc. all pass through.

### `useSnackbar`'s `showSnackbar(options: ShowSnackbarOptions)`

Same shape as `SnackbarProps` minus `icon`/`classNames`, plus:

| Prop | Type | Default | Description |
|---|---|---|---|
| `id` | `string \| number` | — | Reuse a returned id to replace that snackbar in place (e.g. `loading` → `success` when the task finishes, Figma guideline). Added 2026-10-07 |
| `position` | `SnackbarPosition` (`'top-left' \| 'top-right' \| 'top-center' \| 'bottom-left' \| 'bottom-right' \| 'bottom-center'`) | `'bottom-right'` (was `'bottom-center'`, Figma guideline 2026-10-07) | Forwarded to sonner's own positioning — this is why `position` lives on `showSnackbar()`/`ShowSnackbarOptions` and not on the bare `<Snackbar>` itself, which has no portal or fixed positioning of its own |

Returns sonner's toast id (usable with `toast.dismiss()` externally if needed, though `onClose`/the close button already handle dismissal).

### `SnackbarContainer`

No props — a fixed configuration of sonner's `<Toaster position="bottom-right" expand={false} richColors={false} closeButton={false}>` (was `top-right`; Figma guideline: bottom right). sonner shows at most 3 toasts, newest on top. Mount once near the app root.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** `classNames` (§8) — a 4-part slot object (`icon`/`content`/`actions`/`closeButton`), appropriate since Snackbar is a fixed-anatomy notification, not a compositional pattern like Tooltip.
- **`asChild`:** Not applicable — no evidence of need.
- **Internal parts a consumer can realistically reach without forking:** `icon` (full override via prop, not just styling), `classNames.{icon,content,actions,closeButton}`, `className` on the root.
- **Idempotent close guard:** `Snackbar.tsx` tracks `hasClosedRef` so `onClose` fires exactly once even though it can be triggered by two independent paths (close-button click, or `ProgressBar`'s auto-dismiss `onComplete`) — a consumer's `onClose` handler doesn't need to guard against double-firing itself.
- **Imperative vs. declarative:** `showSnackbar()` is the primary, recommended entry point for toast-style usage (handles portal, stacking, position, and dismiss-on-action-click automatically via sonner); `<Snackbar>` remains available standalone for inline/non-toast placements.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| `info` (default) / `success` / `warning` / `error` | Inverse StatusIcon (`icon-info-inverse` / `-success-inverse` / `-caution-inverse` / `-danger-inverse`) | N/A | `role="status"`; `role="alert"` for `error` | `statusByVariant` → `<StatusIcon inverse>` | `Snackbar.figma.test.tsx` (light + dark), `VariantsGallery` |
| `loading` | Spinner icon; optional task `progress` bar | Never auto-dismisses; replace it (same `id`) or close it | `role="status"`; progress bar `role="progressbar"` named by the title/message | `enabled: variant !== 'loading'` | `useAutoDismiss.test.tsx`, `LoadingWithProgress` |
| Auto-dismissing (`duration` > 0) | No visible countdown (Figma has none; removed 2026-10-07) | Dismisses (`onClose`) after `duration` ms. **Pauses** while the pointer is over the snackbar (or, inside `SnackbarContainer`, anywhere over sonner's toaster — sonner parity), while focus is within it, and while the document is hidden; resumes with only the remaining time | N/A | `useAutoDismiss` (internal) is the **single timer owner** (`setTimeout` + remaining-time bookkeeping); `showSnackbar()` always passes sonner `duration: Infinity` so sonner never runs a second timer | `useAutoDismiss.test.tsx`, `useSnackbar.test.tsx`, `InteractionHoverPausesAutoDismiss` story |
| No auto-dismiss (`duration={false}` or `0`) | — | Only the close button dismisses | N/A | `duration <= 0` disables the timer; sonner always gets `Infinity` | `NoAutoDismiss`, `InteractionZeroDurationNeverAutoDismisses` stories, `useSnackbar.test.tsx` |
| Closable (`closable` default `true`) | Close button (16px cross icon) rendered | Click dismisses (`onClose`) | `aria-label="Close notification"`, keyboard-focusable native `<button>` with a visible focus ring | `closable` boolean | `WithCloseButton` story |
| With actions | 1+ pill buttons rendered below title/message | Click fires the action's own `onClick`, then (via `showSnackbar()`) also dismisses the toast | Native `<button>` semantics | `actions` array → `SnackbarAction` | `WithActions`/`WithActionAndProgress` stories |

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token/Implementation | Story | Test |
|---|---|---|---|---|
| Max-width 400px (Figma: literal `w-[400px]` + `max-w-[400px]`) | Figma raw export, node `7837:3652` | `max-w-[400px]` (was `max-w-[600px]`) | `PixelDimensionsMatchFigma` | `play()` |
| Title single-line, truncated (`overflow-hidden text-ellipsis whitespace-nowrap`) | Figma raw export, node `10301:723` | `truncate` added to the `title` slot | `PixelDimensionsMatchFigma` | `play()` |
| Progress Bar has no status/color axis — Figma's own component (node `16982:11702`) has only `Size`(S/M/L)/`Inverse`(bool); fill is always `icon-primary-inverse` (#e7e7e7) | `list_file_components_for_code_connect` properties + raw export | `ProgressBarVariant`/`variant` prop removed entirely (internal-only, not publicly exported); `bar` is unconditionally `bg-icon-primary-inverse` | `PixelDimensionsMatchFigma` | `play()` + `ProgressBar.test.tsx` |
| Progress Bar track: 8px tall, `surface-subtle-inverse` (translucent white, `rgba(255,255,255,0.13)`) background | Figma raw export: `h-[8px]`, `bg-[var(--surface\/subtle-inverse,...)]` | `h-2` (was `h-1`=4px) + `bg-surface-subtle-inverse` (was unset/transparent) | `PixelDimensionsMatchFigma` | `play()` |
| Root padding 16px | Figma: `p-[var(--200,16px)]` | `!p-200` | — | already correct pre-audit |
| Root radius 8px | Figma: `rounded-[var(--radius\/200,8px)]` | `rounded-200` | — | already correct pre-audit |
| Background `#333333` | Figma: `bg-[var(--background\/container-inverse,#333)]` | `bg-background-container-inverse` | — | already correct pre-audit |
| Shadow = Elevation/Lv.4 | Figma raw effect data: `DROP_SHADOW #00000026 (1,4) r10 s4` + `DROP_SHADOW #00000033 (0,2) r4 s0` | `shadow-level-4` | — | already correct pre-audit |
| Icon size 20px | Figma: `StatusIcon` `size-[20px]` | `w-5 h-5` (Tailwind scale 5 = 20px) | — | already correct pre-audit |
| Close icon 16px | Figma: `Icon / Cross` `size-[16px]` | `w-4 h-4` (Tailwind scale 4 = 16px) | — | already correct pre-audit |
| Action button: 32px tall, `px-100`(8px), `rounded-200`(8px), `bg-surface-subtle-inverse`, 12px bold text | Figma: `_Snackbar / Action` node `10683:3315` | `py-2.5`+`typo-label-s-bold` (10+12+10=32px), `px-2`(8px), `rounded-200`, `bg-surface-subtle-inverse` | — | already correct pre-audit |
| Title typography 14px/700 | Figma: "font-bold text-[14px]" | `typo-label-m-bold` (0.875rem=14px, weight 700) | — | already correct pre-audit |
| Message typography 14px/400/1.6 line-height | Figma: "font-normal text-[14px] leading-[1.6]" | `typo-body-m` (14px/400/1.4rem=22.4px=14×1.6) | — | already correct pre-audit |

No arbitrary Tailwind bracket values remain in `Snackbar.styles.ts` that lack a Figma-measured justification.

## 8. Accessibility

Verified via real rendered DOM (`Snackbar.test.tsx`, `ProgressBar.test.tsx`) and Storybook (`Snackbar.stories.tsx`, including the new `PixelDimensionsMatchFigma` `play()`).

- **Semantic element / role:** `role="alert"` (error — assertive, interrupts) vs. `role="status"` (info/success — polite) on the root `<div>`. This distinction is called out in `component-api-conventions.md` as the library's reference example of a deliberate, component-specific ARIA choice.
- **Accessible name:** The `title` text; the close button has its own explicit `aria-label="Close notification"` (icon-only button, correctly labeled per accessibility.md §5.2).
- **Keyboard interactions:** The close button and any action buttons are native `<button>` elements — fully keyboard reachable, with a visible focus ring (`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus`, fixed earlier this session's outline-conflict sweep).
- **Focus management:** No focus trap (Snackbar is a passive notification, not modal); no auto-focus-steal on appearance.
- **Disabled semantics:** N/A — no disabled state exists for Snackbar itself.
- **Screen reader behavior:** `role="alert"`/`"status"` ensures the title/message are announced appropriately by assistive tech without requiring user focus; the progress bar is purely visual (not exposed via `aria-valuenow` etc.) since the countdown itself isn't the primary information channel — the `role="alert"`/`status` announcement of the title/message is.

## 9. Theming

- **Light/dark behavior:** All colors are semantic tokens (`bg-background-container-inverse`, `text-icon-info`/`success`/`danger`, `bg-surface-subtle-inverse`, `bg-icon-primary-inverse`) that already resolve correctly under `[data-theme="dark"]` — no Snackbar-specific dark-mode logic.
- **Verification method used:** the 4 layers of `references/theme-verification.md` (2026-10-07) — `figma:theme-check` (7/7 tokens, Light + Dark; its 1.00:1 action-label result is a checker artifact: it compares the label to the 13%-alpha `surface-subtle-inverse` layer without compositing it over the container — axe passes on the real composite in both themes), `storybook` 14/14 + `storybook-dark` 14/14, token-resolved tests in a light and a dark region (`Snackbar.figma.test.tsx`), contrast PASS.

## 10. Market Benchmark

Not deeply re-evaluated (scope was Figma-fidelity fixes). One real, confirmed gap found during reconnaissance: Figma's actual "Status Icon" component (node `8867:2716`) supports 5 statuses — `Info | Caution | Danger | Loading | Success` — but `SnackbarVariant` only covers 3 (`info | success | error`, where `error` maps to Figma's `Danger`). Missing: a `caution`/warning variant and a `loading`/spinner variant. This is a genuine API-expansion candidate (comparable to MUI/Ant Design Snackbar/Notification/message APIs, which typically support `warning` and `loading` alongside `info`/`success`/`error`), not a bug — deferred pending a dedicated design pass, same category of decision as Badge's earlier `max`/`position` additions this session.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Snackbar max-width was 600px; Figma's component is literally 400px (`w-[400px]`/`max-w-[400px]`) | 2026-09-07 Figma-fidelity audit | Fixed | `PixelDimensionsMatchFigma` `play()` |
| Title had no truncation — could wrap to multiple lines; Figma explicitly single-lines and ellipsis-truncates it | 2026-09-07 Figma-fidelity audit | Fixed → added `truncate` | `PixelDimensionsMatchFigma` `play()` |
| Progress bar fill was colored per `variant` (blue/green/red); Figma's real "Progress Bar" component has no status/color axis at all, only `Size`/`Inverse` | 2026-09-07 Figma-fidelity audit | Fixed → `ProgressBarVariant` type/prop removed, fill unconditionally `bg-icon-primary-inverse` | `PixelDimensionsMatchFigma` `play()` + `ProgressBar.test.tsx` (updated) |
| Progress bar track was 4px tall with no background (fully invisible); Figma's track is 8px tall with a translucent-white (`surface-subtle-inverse`) background | 2026-09-07 Figma-fidelity audit | Fixed → `h-2` + `bg-surface-subtle-inverse` | `PixelDimensionsMatchFigma` `play()` |
| No dedicated pixel-regression Storybook `play()` existed for Snackbar (0 interaction tests, only render-smoke stories) before this audit | 2026-09-07 Figma-fidelity audit | Fixed → added `PixelDimensionsMatchFigma` story (renders the bare `<Snackbar>` directly, bypassing `showSnackbar()`'s async sonner portal, to keep the assertions synchronous) | `Snackbar.stories.tsx` |
| `showSnackbar({ duration: 0 })` auto-dismissed after 4s despite `0` being documented as "disable auto-dismiss" — sonner 2.0.8 treats a falsy duration as "use the default" (`toast.duration \|\| durationFromToaster \|\| TOAST_LIFETIME`) | 2026-09-29 review remediation | Fixed → sonner always receives `duration: Infinity` | `useSnackbar.test.tsx`, `InteractionZeroDurationNeverAutoDismisses` story |
| Hovered / hidden-tab toasts were dismissed anyway: sonner paused its own timer, but `ProgressBar`'s independent CSS-transition countdown still called `toast.dismiss()` on `transitionend` (two unsynchronized timers) | 2026-09-29 review remediation | Fixed → `ProgressBar` is the single timer owner (sonner gets `Infinity`) and pauses on hover (toaster-wide inside `SnackbarContainer`), focus-within, and `document.hidden`, resuming with the remaining time. Chosen over "sonner owns the timer, bar is visual only" because that would have removed auto-dismiss from the standalone `<Snackbar>` and still required mirroring sonner's pause state to keep the bar honest | `ProgressBar.pause.test.tsx` (replaced by `useAutoDismiss.test.tsx`, 2026-10-07), `InteractionHoverPausesAutoDismiss` story |
| `component-capability-matrix.md`/`market-benchmark.md` references to Snackbar were not found to be stale during this audit (unlike Divider's/Tooltip's docs, which had real staleness) | 2026-09-07 Figma-fidelity audit | N/A — no action needed | — |
| Status and close icons used non-inverse tokens on the inverse container (light mode: dark-blue info icon and a #5a5a5a close icon on #333333 — nearly invisible) | Figma alignment, 2026-10-07 | Fixed — shared `StatusIcon inverse`, close `icon-secondary-inverse` | `Snackbar.figma.test.tsx` (mutation: each non-inverse fails 8) |
| Every auto-dismissing snackbar drew a countdown bar; Figma's Progress Bar is task progress, used only with Loading | Figma alignment, 2026-10-07 (approved) | Fixed — bar only with `progress`; timer moved to `useAutoDismiss` | `useAutoDismiss.test.tsx`, `Snackbar.figma.test.tsx` |
| Width shrank to content (40–400px); Figma fixes 400px for stacking | 2026-10-07 | Fixed — `w-[400px] max-w-full` | `Snackbar.figma.test.tsx` (shrink-to-content parent) |
| Icon / close icon hugged the top edge; title box 14px pulled the message up 8px | 2026-10-07 | Fixed — 22px containers, 22px title box | `Snackbar.figma.test.tsx` |
| Actions 4px apart (Figma 8px) | 2026-10-07 | Fixed — `gap-sds-100` | `Snackbar.figma.test.tsx` |
| Default position bottom-center / container top-right (Figma: bottom right) | 2026-10-07 | Fixed — `bottom-right` | `useSnackbar.test.tsx` |
| Code Connect ignored the Status Icon (every snackbar generated as info) and mapped "Progress Bar off" to `duration: false` | 2026-10-07 | Fixed — variant from Status Icon (all 5 values), `progress: 0` when the bar is on | mock-runtime harness |

## 12. Examples

```tsx
// Standalone, inline (no toast behavior)
<Snackbar variant="info" title="タイトル" message="メッセージ" />

// Imperative toast — the recommended entry point
// Once, near your app root:
<SnackbarContainer />

// Anywhere in the app:
showSnackbar({
  variant: 'success',
  title: 'アカウント情報を更新しました',
});

// With an action button (auto-dismisses the toast on click too)
showSnackbar({
  variant: 'success',
  title: 'プレイリストに追加しました',
  message: 'マイプレイリスト「会議用の曲」から削除できます。',
  duration: 6000,
  actions: [{ label: 'プレイリストを見る', onClick: () => navigate('/playlist') }],
});

// No auto-dismiss, must be closed manually
showSnackbar({
  variant: 'error',
  title: 'メッセージの送信に失敗しました',
  duration: false,
  closable: true,
});

// Customizing a specific part
<Snackbar
  variant="info"
  title="タイトル"
  classNames={{ closeButton: 'text-icon-primary' }}
/>
```

## 13. Known Limitations

- `!p-200` (root padding) still uses an `!important` override. Its value (16px) was confirmed correct against Figma this pass, but the `!important` mechanism itself — why it's needed at all — was not re-investigated (pre-existing, untouched).
- Code Connect cannot read the Figma progress fill width, so a Progress Bar instance generates `progress: 0`.
- A hidden Figma Status Icon (toggle off) has no code equivalent — the snackbar always shows its variant icon.
- `showSnackbar()`'s `position` prop is entirely separate from anything on `<Snackbar>` itself (by design — see §4) — a consumer using `<Snackbar>` standalone (not via `showSnackbar()`) must handle their own positioning if they want toast-like placement.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 | D (modify) | 13/15 | 13/15 | 13/15 | 14/15 | 10/10 | 7/10 | 5/5 | 9/10 | 5/5 | 89/100 | none | Verified |
| 2026-10-07 | Figma alignment (Classification F + 2 variants) | 14/15 | 14/15 | 15/15 | 14/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 97/100 | none | Verified |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
