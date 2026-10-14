# `Avatar` — Component Specification

## 1. Identity

- **Figma component name:** "Avatar" (node `16593:8749`, documentation page node `16609:8640`), plus a separate status-dot component **"_Avatar / Status"** (node `16591:8648`)
- **Figma file:** `FIGMA_FILE_KEY` — Sun Design System (`fSzxt8wKkXsn8fmxkPBUr2`)
- **Figma node/component URL:** `https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Nova%EF%BD%9CMaster?node-id=16609-8640` (set `16593:8749`, status `16591:8648`)
- **Code Connect:** `Avatar.figma.ts` → `16593:8749` (added 2026-10-07): Size → `size`, Type → `src`+`alt` placeholders / `initial` / `icon` (instance swap), Status + nested `_Avatar / Status` Color → `status`, Ring → `ring`. Focus is not mapped (Avatar has no interaction of its own)
- **Code name:** `Avatar`
- **Package export:** `@sun-asterisk/nova/avatar` (subpath), also re-exported from the package root
- **Category:** Simple Component (built on the Radix `Avatar` primitive, already available via the project's existing `radix-ui` unified-package dependency — no new dependency added)
- **New in Figma:** confirmed via the page's own Update Log — "2026.08.06 — Avatar コンポーネントを新規作成" (Avatar component newly created). Classification: **E** (truly new component). `figma-sync.config.json`'s `componentMap` already listed `"Avatar": "avatar"` in anticipation, but no `src/components/avatar/` implementation existed before this pass.

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-10-07 via `/component Avatar --figma <url>` (Figma alignment: fallback colors, Code Connect)
- **Owner/last touched by:** Workflow C (new component), 2026-09-10

## 3. Anatomy

Per the **mandatory exhaustive sub-component enumeration** (`.claude/commands/component.md` Step 3), this Figma page contains 2 distinct components — both inspected via `get_design_context`:

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `AvatarPrimitive.Root` (Radix) | — | Circular container, `rounded-full overflow-hidden` |
| 2 | Image | `AvatarPrimitive.Image` (Radix) | — | Rendered only when `src` is set; Radix tracks load state automatically |
| 3 | Fallback | `AvatarPrimitive.Fallback` (Radix) | — | Renders `initial` text, or a custom `icon`, or the default `IconUser` — shown whenever Image is absent, loading, or failed |
| 4 | Status dot | plain `<span>` | — | Optional, bottom-right overlay; not a Radix primitive — Figma's separate "_Avatar / Status" component, reimplemented directly since it's a single colored dot with no interactive/loading behavior of its own |

## 4. API

| Prop | Type | Default | Required | Description |
|---|---|---|---|---|
| `size` | `'xsmall' \| 'small' \| 'medium' \| 'large' \| 'xlarge'` | `'medium'` | No | Figma's own master-component default was `'xsmall'` (likely just symbol-index order, not a UX recommendation — no single size is called out as "the" default anywhere in the Guideline text, which is entirely contextual: "文中や表のセル内には XSmall...一覧・ヘッダーには..."); `'medium'` was chosen as the most broadly-applicable real-world default |
| `src` | `string` | — | No | Image URL; takes priority over `initial`/`icon` when it loads |
| `alt` | `string` | `''` | No | Accessible name of the **avatar** (photo, initials or icon). When set — or when `aria-label`/`aria-labelledby` is passed — the Root renders as one `role="img"` graphic carrying the name (+ status label); see §8. **Semantics changed 2026-09-29 (NX-05)** |
| `initial` | `string` | — | No | Fallback initials; takes priority over `icon` |
| `icon` | `ReactNode` | `<IconUser />` | No | Fallback icon |
| `ring` | `boolean` | `false` | No | 2px `surface-base`-colored outer ring, for stacked avatars |
| `status` | `'online' \| 'away' \| 'busy' \| 'offline'` | — | No | Presence dot; not shown at `size="xsmall"` |
| `statusLabel` | `string` | capitalized `status` value | No | Accessible text for the status dot |

Also extends `ComponentProps<typeof AvatarPrimitive.Root>` (which itself extends `ComponentProps<'span'>`) — every native `<span>` attribute passes through.

**Ref:** forwards to `HTMLSpanElement` (Radix `Avatar.Root`'s own rendered element).

**No `type` prop** (unlike Figma's own generated code, which models `type: 'Image'|'Initial'|'Icon'` as an explicit enum). Figma's own Guideline text describes an **automatic priority fallback chain** — "写真が取得できる場合は写真を、取得できない場合はイニシャルを、それも無ければ汎用アイコンを表示" (show the photo if available; otherwise initials; otherwise the generic icon) — which is exactly Radix `Avatar`'s built-in `Root`/`Image`/`Fallback` behavior (automatic, load-state-aware). An explicit `type` prop would require the consumer to manually keep it in sync with which content they've actually supplied — redundant, error-prone state that Figma's variant system needs (for illustrating each combination as a distinct symbol) but that a real API does not.

**No `focus` prop**, matching `Link`'s and `.claude/rules/design-foundation.md` §5.1's "Focus is a boolean, not a variant" rule — Figma models it as an independent boolean here too, same as `Link`.

## 5. Composition & Customization

- **Built on Radix's `Avatar` primitive** (`radix-ui`'s unified package — already a project dependency; no new package added). `Root`/`Image`/`Fallback` are used internally but not exposed as a compound API to consumers — Avatar is presented as a single, simple component, matching Figma's own single-component mental model (no compound composition anywhere in the Guideline text).
- **`icon`/`initial` naming** (not Figma's `iconInstance`/`initial` — actually these do match Figma's own prop names this time, unlike `DropdownMenu`'s `prefixIcon`/`suffixIcon` situation).
- **Not interactive by itself.** Figma's own guideline: "アバターは相手を見分けるための要素であり、それ自体が操作を持ちません" (an avatar is for identification; it has no interaction of its own). Wrap it in `Button`/`Link` (`asChild`) for a clickable avatar — Avatar does not force any particular interactive wrapper.

## 6. State Matrix

| State | Visual behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|
| Image loads | Shows the photo | — | `AvatarPrimitive.Image` (Radix-managed load state) | Storybook (visual; real network image) |
| Image absent/fails | Shows `initial` or the icon fallback | — | `AvatarPrimitive.Fallback` | `BrokenImageFallsBackToInitial`, `Avatar.test.tsx` |
| `ring` | 2px `surface-base` outer ring (box-shadow, non-layout-affecting) | — | `ring-2 ring-surface-base` | `Avatar.test.tsx`, `StackedGroup` |
| `status` set (size ≠ xsmall) | Colored dot, bottom-right | `sr-only` text names the status — never color-only | `avatarStatusColorClass` map + visually-hidden span | `InteractionStatusHasAccessibleLabel`, `Avatar.test.tsx` |
| `status` set at `size="xsmall"` | No dot rendered at all | — | `showStatus` guard | `Avatar.test.tsx` |
| Focus-visible (when made focusable by a consumer) | 2px `border-focus` outline, 3px offset | `:focus-visible` (native) | `focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-border-focus` | `InteractionFocusRing` |

## 7. Design Tokens — Figma Traceability

Figma source: `get_design_context`/`get_variable_defs` on nodes `16593:8749` ("Avatar") and `16591:8648` ("_Avatar / Status"), confirmed 2026-09-10.

| Figma requirement | Value | Implementation |
|---|---|---|
| Sizes (px) | XSmall 24, Small 32, Medium 40, Large 56, XLarge 80 | `size-[24px]`/`[32px]`/`[40px]`/`[56px]`/`[80px]` — none land on the numeric spacing scale except 40, so literal px values are used throughout for consistency |
| Initial font sizes | 12/14/16/20/28px per size, all `leading-none` (vertical centering via flex, not line-height) | Arbitrary `text-[Npx]` per size — none of these match the existing `typo-*` scale's own ratios; documented as a genuine mismatch, not a missed token |
| Icon fallback sizes | 16/20/24/32/40px per size | `[&_svg]:size-4`/`size-5`/`size-6`/`size-8`/`size-10` |
| Always circular | Non-negotiable per Figma's own guideline ("常に円形で表示...角丸の矩形や楕円にしたりしないでください") | `rounded-full overflow-hidden` unconditionally |
| Ring: 2px, `surface-base`-colored | `get_variable_defs` on the Avatar component confirms `Surface/Base` (#ffffff) | `ring-2 ring-surface-base` |
| Focus ring: 2px, `border-focus`, 3px offset | `inset-[-3px]` on Figma's own Focus Ring layer, every size | `outline-2 outline-offset-3 outline-border-focus` — **note**: Avatar is a filled circular shape, so design-foundation.md §5.1's general rule of thumb would predict a 2px offset (like other shape/filled elements) — but Figma's own concrete implementation uses 3px here, matching `Link`'s (a text element). A confirmed exception to the general guideline, not a guess — Figma is the source of truth for the actual value. |
| Status dot sizes/position | 10/12/16/20px (Small/Medium/Large/XLarge only — **no XSmall variant at all**), bottom-right; XLarge specifically offset `bottom-[2px] right-[2px]` instead of flush `bottom-0 right-0` | Matching compound variants per size |
| Status colors | `get_variable_defs`: Online→`icon/success` (#2aa847), Away→`icon/caution` (#b7791f), Busy→`icon/danger` (#dd2305), Offline→`icon/disable` (#959595) | `bg-icon-success`/`bg-icon-caution`/`bg-icon-danger`/`bg-icon-disable` — all 4 tokens already existed in the generated pipeline, confirmed via `global.css` before use |
| Status dot border | `Surface/Base` (#ffffff), ~2px, so it stays visible even over a photo | `border-2 border-surface-base` on the dot itself |
| Default icon | Figma's own component description references "Icon / User" as the generic fallback | `IconUser` (already existed in this library's icon set) |

## 8. Accessibility

- **Identification information, not decoration** (per Figma's own accessibility section: "アバターは装飾ではなく相手を見分けるための情報です"). `alt` should always be set when `src` is used; `WithName` demonstrates the recommended adjacent-name-text pattern as an alternative/complement.
- **Status is never color-only** (WCAG 1.4.1 / `.claude/rules/accessibility.md` §4.3) — every status dot carries a real, queryable `sr-only` text label, defaulting to the capitalized status value even if a consumer never passes `statusLabel` explicitly.
- **Accessible name (NX-05, 2026-09-29):** Radix's Avatar Root is a role-less `<span>`; only a loaded `<img alt>` carried a name, so an initials/icon-only avatar had no naming path, and `aria-label` on the role-less span is flagged by axe as `aria-prohibited-attr` (found by external consumer verification). Now, when the consumer names the avatar via `alt`, `aria-label`, or `aria-labelledby`, the Root gets `role="img"` and the name — regardless of whether the photo, initials or icon is showing. Because `img` children are presentational, the inner `<img>` then gets `alt=""` (no duplicate name) and the status text is folded into the name (`"Jane Doe, Online"`; with `aria-labelledby`, the status's own `sr-only` element id is appended to the reference list). An **unnamed** avatar is unchanged: role-less, initials read as text, icon decorative — correct only when the person's name is adjacent visible text (`WithName`). A consumer-supplied `role` still wins. **Behavior change:** `getByAltText(name)` no longer finds a named photo avatar — use `getByRole('img', { name })`. Tested in `Avatar.test.tsx` "accessible name" + `Avatar.stories.tsx` `NamedWithoutPhoto` (axe gate); mutation-verified.
- **Initial-text contrast — KNOWN, ACCEPTED WCAG 1.4.3 FAILURE (team decision 2026-10-07):** Figma Avatar (`16593:8749`, re-checked 2026-10-07 via the REST API + `pnpm figma:theme-check`) still specifies initials in `Text/On Surface` (white) on `Surface/Secondary` — **1.88:1 light** (#ffffff on #b3bed0) / **1.71:1 dark** (#1c1c1c on #384356), below 4.5:1. SC-05 (2026-09-29) had switched the initials to `text-primary` (6.73:1 / 8.07:1) pending Figma confirmation; with Figma unchanged, the team chose to follow Figma. **The real fix belongs in Figma** (a darker fill, or a dark initial color such as `text/primary`) — once Figma changes, revert to a compliant pair and remove the axe exemptions. Exemptions are scoped to the fallback element only: Storybook (`a11y.config` color-contrast `selector: *:not([data-slot="avatar-fallback"])`) and the consumer harness (`ACCEPTED_AVATAR_INITIALS` excluded from AxeBuilder). The fallback **icon** uses Figma's `Icon/Secondary` (3.65:1 light / 5.4:1 dark — passes the 3:1 non-text minimum).
- **Not focusable/interactive by default** — matches Figma's explicit "アバターは...それ自体が操作を持ちません" guidance. The `focus-visible:outline-*` classes are present and ready to activate correctly if a consumer adds their own focusability (`tabIndex`, or wrapping in a real interactive element), per Figma's own accessibility note: "押せるようにする場合はフォーカス表示が必要です" (if made clickable, focus display is required).

## 9. Theming

- `bg-surface-secondary`, `text-text-primary` (initials/icon; was `text-on-surface` until 2026-09-29, see §8), `ring-surface-base`, `border-surface-base`, `bg-icon-success`/`-caution`/`-danger`/`-disable`, `outline-border-focus` are all semantic tokens — theme-aware by construction, no hardcoded hex anywhere in `Avatar.styles.ts`.

## 10. Market Benchmark

- **Radix UI** — `@radix-ui/react-avatar` (via the unified `radix-ui` package, already a dependency) provides exactly the `Root`/`Image`/`Fallback` automatic-load-state-fallback pattern this component's Figma spec independently describes. **KEEP** — used directly, no new dependency.
- **MUI** — `Avatar` supports `src`/children-as-fallback/a default person icon; broadly the same shape. Not adopted 1:1 (MUI exposes `variant="circular"|"rounded"|"square"`, which this component deliberately rejects — Figma is explicit that Avatar is always circular, never a rounded rectangle).
- **Chakra/Mantine** — both offer a `group`/`stack` sub-component for overlapping avatars with automatic spacing. **DEFERRED** — this pass implements the visual `ring` prop Figma calls for, but leaves the actual stacking/overlap layout to the consumer's own flex/`-space-x-*` utility (demonstrated in `StackedGroup`), rather than adding a dedicated `AvatarGroup` component without a concrete Figma spec for one.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Radix `Avatar.Fallback`'s `delayMs` applies unconditionally whenever the prop is present, even with no `Image` mounted at all — an unconditional `delayMs={200}` made the fallback (initials/icon, the common no-photo case) delay for no reason | Found while writing this component's own unit tests, 2026-09-10, before ever being committed as a "final" version | Fixed — `delayMs` only passed when `src` is actually set | `Avatar.test.tsx` ("renders the default IconUser fallback...") |
| Figma's own generated code only wires Ring/Focus Ring/Status to the Initial/Icon symbol variants, never Image (`isXXXAndIsInitialOrIcon` gates every one of them) | Found during Figma discovery, 2026-09-10 | **Extended in this implementation to work uniformly across all content types (Image included)** — treated as a Figma component-authoring gap (the designer wired these overlays only for the Initial/Icon symbols), not an intentional Image-specific exclusion; every real-world precedent (MUI/Chakra/Mantine) supports a status dot on a photo avatar, and Figma's own guideline text never singles out Image as unsupported. Documented here rather than silently decided — a Figma-side clarification would be the more thorough long-term fix. | `WithRing`/`AllStatuses` stories use `initial`, not `src`, but nothing in the implementation gates Ring/Status by content type — verified by reading `Avatar.tsx` directly |
| SC-05: initials contrast 1.88:1 light / 1.71:1 dark (`text-on-surface` on `surface-secondary`) | External consumer verification (axe), 2026-09-29 | Was fixed with `text-primary` pending Figma; **reverted to Figma's `text-on-surface` on 2026-10-07 by team decision (accepted WCAG deviation, see §8)** | `Avatar.figma.test.tsx` (asserts the Figma tokens, light/dark); `Avatar.stories.tsx` `InteractionFigmaFallbackColors` |
| Fallback icon inherited the text color; Figma binds `Icon/Secondary` | Figma alignment, 2026-10-07 | Fixed — `[&_svg]:text-sds-icon-secondary` | `Avatar.figma.test.tsx` (mutation-verified) |
| No pixel-measurement coverage for sizes / status dot / ring; no Code Connect | `/component Avatar`, 2026-10-07 | Fixed — `Avatar.figma.test.tsx` (5 sizes × light/dark: box, initials font, icon, status size/inset, 4 status colors + 2px Surface/Base border, ring); `Avatar.figma.ts` | — |
| NX-05: no accessible-name path for initials/icon-only avatars; `aria-label` alone → `aria-prohibited-attr` | External consumer verification (axe), 2026-09-29 | Fixed — named avatar = `role="img"` Root | `Avatar.test.tsx` "accessible name"; `Avatar.stories.tsx` `NamedWithoutPhoto` |

## 12. Known Limitations

- **No `AvatarGroup`/stacking sub-component** — the `ring` prop is provided, but arranging multiple avatars into an overlapping stack is left to the consumer's own layout (see §10).
- **Image-load-failure story (`BrokenImageFallsBackToInitial`) depends on a real network request failing** in Storybook's browser-mode test — not mocked, so it's dependent on the test environment actually being able to attempt (and fail) a real HTTP request to a nonexistent URL; a fully offline/CI-sandboxed environment could behave differently.
- **Ring/Status on Image avatars** (§11's earlier judgment call) — now confirmed by Figma itself (2026-10-07: the `Type=Image` variants carry the Ring and Status layers too).
- **Initials contrast is an accepted WCAG 1.4.3 failure** until Figma changes the pairing (§8).

## 13. Examples

```tsx
// Photo, falling back to initials, falling back to a generic icon
<Avatar src={user.photoUrl} alt={user.name} initial="鈴" />

// Stacked/overlapping avatars
<div className="flex -space-x-2">
  <Avatar ring src={a.photoUrl} alt={a.name} />
  <Avatar ring src={b.photoUrl} alt={b.name} />
</div>

// With a presence status
<Avatar src={user.photoUrl} alt={user.name} status="online" />

// Paired with a visible name
<div className="flex items-center gap-2">
  <Avatar src={user.photoUrl} alt={user.name} />
  <span>{user.name}</span>
</div>
```

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-10 (new component) | Workflow C | 15/15 | 14/15 | 15/15 | 14/15 | 9/10 | 10/10 | 5/5 | 9/10 | 5/5 | 96/100 | none | Verified |
| 2026-10-07 (Figma alignment) | `/component` F: Figma fallback colors, Code Connect, pixel tests | 15/15 | 14/15 | 10/15 | 15/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 94/100 | **P0 (accepted):** initials contrast 1.88:1 / 1.71:1 (WCAG 1.4.3), team decision to follow Figma — §8 | Verified with an accepted P0 deviation (not Certified until Figma fixes the pairing) |

Composition -1: no `AvatarGroup` sub-component for stacking layout (§12, a deferred, not-Figma-specified capability). Logic -1: the Ring/Focus/Status-for-Image extension (§11) is a reasonable but unconfirmed judgment call, not verified with the design team. Design/Tokens -1: several size-specific typography values had to be implemented as arbitrary px values, with no matching existing `typo-*` token. Testing -1: no pixel-measurement test for status-dot/ring exact dimensions, and the broken-image story depends on a real (unmocked) network failure.
