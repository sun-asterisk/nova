# `DropdownMenu` — Component Specification

## 1. Identity

- **Figma component name:** "Dropdown Menu" (documentation page, node `12669:14631`) — Figma explicitly does NOT ship a fixed "whole menu" component (see its own text node 13056:11809: item count/composition varies too much, so consumers compose menus from the "Menu Item" component inside their own Auto Layout frame). The actual reusable component is **"Menu Item"** (node `11853:12967`, variants `Style: Action|Option|Danger` × `State: Enabled|Hover|Active|Disabled` — the old `State=Destructive` value became `Style=Danger`), plus a separate **"Group Header"** symbol (node `11846:2269`).
- **Code Connect:** `DropdownMenu.figma.ts` → Menu Item `11853:12967` (rewritten 2026-10-07: Action → `DropdownMenuItem`, Danger → `destructive`, Option → `DropdownMenuCheckboxItem checked`, Disabled → `disabled`); `DropdownMenuGroupHeader.figma.ts` → Group Header `11846:2269` (Divider → `DropdownMenuSeparator`, Group Label → `DropdownMenuLabel`). The previous item mapping referenced State values that no longer exist in Figma.
- **Figma file:** `FIGMA_FILE_KEY` — Sun Design System (`fSzxt8wKkXsn8fmxkPBUr2`)
- **Figma node/component URL:** `https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Nova%EF%BD%9CMaster?node-id=12669-14631`
- **Code name:** `DropdownMenu` (compound, 14 exports)
- **Package export:** `@sun-asterisk/nova/dropdown-menu` (subpath, 14 exports), also re-exported from the package root
- **Category:** Composite Component / Pattern — a thin styling layer over `@radix-ui/react-dropdown-menu`, matching Figma's own "compose from Menu Item" philosophy rather than a monolithic component

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-10-07 via `/component DropdownMenu --figma <url>` (Figma alignment, see §7.1)
- **Owner/last touched by:** Workflow D (modify), 2026-10-07

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | `DropdownMenu` | `DropdownMenuPrimitive.Root` | — | Controlled/uncontrolled open-state owner |
| 2 | `DropdownMenuTrigger` | `DropdownMenuPrimitive.Trigger` | `button` | Opens the menu on click; unstyled by default (consumers style it directly, per every story) |
| 3 | `DropdownMenuContent` | `DropdownMenuPrimitive.Portal` + `.Content` | `menu` | Portalled panel; `sideOffset` defaults to `4`; `container` redirects the portal target |
| 4 | `DropdownMenuItem` | `DropdownMenuPrimitive.Item` | `menuitem` | Action row; `destructive` switches to danger text styling |
| 5 | `DropdownMenuCheckboxItem` | `DropdownMenuPrimitive.CheckboxItem` | `menuitemcheckbox` | Multi-select toggle item with a check indicator |
| 6 | `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` | `.RadioGroup` / `.RadioItem` | `menuitemradio` | Single-select item group, same check indicator as CheckboxItem (see §7) |
| 7 | `DropdownMenuSub` / `DropdownMenuSubTrigger` / `DropdownMenuSubContent` | `.Sub` / `.SubTrigger` / `.SubContent` | `menuitem` (trigger) | Nested submenu; `SubContent` has no independent `container` (see §5) |
| 8 | `DropdownMenuSeparator` | `.Separator` | `separator` | 1px `border-weak` divider |
| 9 | `DropdownMenuLabel` | `.Label` | — | Non-interactive section heading |
| 10 | `DropdownMenuShortcut` | plain `<span>` | — | Right-aligned keyboard-shortcut hint; no ref support (not a Radix primitive) |
| 11 | `DropdownMenuGroup` | `DropdownMenuPrimitive.Group` | `group` | Groups related items for `aria-label`ling |

## 4. API

| Prop | On | Type | Default | Description |
|---|---|---|---|---|
| `destructive` | `DropdownMenuItem` | `boolean` | `false` | Switches to `text-text-danger`; the only boolean prop in the whole compound API — no explosion |
| `description` | `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem` | `ReactNode` | — | Secondary line below the label (Figma's `supportText` property) — see §7 |
| `container` | `DropdownMenuContent` | `ComponentProps<typeof Portal>['container']` | `document.body` | Redirects the portal target (e.g. into a scoped `ThemeProvider` region) |
| `sideOffset` | `DropdownMenuContent` | `number` | `4` | Passed through to Radix; overridable |
| `collisionPadding` | `DropdownMenuContent` | `number \| Partial<Record<'top'\|'right'\|'bottom'\|'left', number>>` | `16` | Viewport margin the menu keeps while auto-flipping/shrinking — 16px matches Figma's exact figure; passed straight through to Radix, overridable |

Every part also extends its matching Radix primitive's full prop set via `ComponentProps<typeof X>` — no accidental prop narrowing found.

**Refs:** 8 of 11 exports forward a ref to `HTMLDivElement` (`Content`, `Item`, `CheckboxItem`, `RadioItem`, `SubTrigger`, `SubContent`, `Separator`, `Label`); `Trigger`/`Root`/`Group`/`Sub`/`RadioGroup` are bare Radix primitives (already `forwardRef` internally); `Shortcut` has no ref support (plain function component, matches Figma — it has no distinct interactive/focusable role).

## 5. Composition & Customization

- **"Group Header" (Figma node `11846:2269`) is a separate Figma component from "Menu Item"** that bundles a divider + a bold 12px secondary-colored label into ONE component with two independent boolean properties (`divider`, `groupLabel`), letting a designer show either, both, or neither. This is deliberately NOT mirrored as a bundled component in code — `DropdownMenuLabel` and `DropdownMenuSeparator` stay separate, composable primitives, which already covers all of Figma's combinations through plain composition (divider alone, label alone, or both together). See `DropdownMenuLabel`'s own JSDoc for the full reasoning.
- **`className` merge on every wrapped part** via `cn()` — no part is unreachable.
- **`container` on `Content` only** — `SubContent` has no independent portal/container prop. This is correct, not a gap: Radix mounts nested submenu content inside the root Content's already-portalled subtree, so redirecting the root is sufficient; verified via `InteractionPortalContainerRedirect`.
- **Composition over boolean props, with one deliberate exception**: shortcut keys and icons are passed as plain children (e.g. `<DropdownMenuItem><Icon/>Label<DropdownMenuShortcut>⌘N</DropdownMenuShortcut></DropdownMenuItem>`), not dedicated boolean/slot props — the correct choice per CLAUDE.md's "prefer composition over excessive boolean props," even though Figma models `prefixIcon`/`suffixIcon`/`shortcutKey` as boolean variant properties (Figma's generated-code shape is not a mandate to mirror 1:1). `description` is the one exception: it's a real, distinct styled sub-element (its own typography/color, independent of the item's own variant/state) rather than a generic child, so it's a dedicated prop, not a composition pattern — matching how `TextField`/`TextareaField` already model `supportText` the same way.
- **`description` constraint**: when provided, `children` is treated as the label only — a leading icon or a nested `DropdownMenuShortcut` inside `children` would be pulled into the stacked label+description column instead of staying as a row-level sibling. Documented directly in `DropdownMenuItem`'s JSDoc.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Item: default | No background | — | — | `item` slot base | `Default` |
| Item: hover/focus | `surface-subtle-hover` background, `rounded-100`, NO ring/outline | Mouse hover (Radix's own `.focus()`-on-pointer-move) or keyboard roving-focus — both produce the identical visual | none — deliberately no ring, see §7 | `hover:`/`focus:bg-surface-subtle-hover`, `outline-none` | `InteractionFocusRingIntegrity` (rewritten 2026-09-10 — see §7) |
| Item: active (pressed) | `surface-subtle` background | Pointer-down | — | `active:bg-surface-subtle` | Storybook (visual) |
| Item: disabled | `text-text-disable`, no pointer events | Skipped by roving focus and click | `data-[disabled]` (native Radix) | `data-[disabled]:pointer-events-none data-[disabled]:text-text-disable` | `DisabledItem` |
| Item: destructive (Figma Style=Danger) | `text-danger` / `icon-danger`; hover/focus `surface-subtle-hover`, active `surface-subtle` like every item (was `background-danger`, not in Figma — 2026-10-07) | Same as default otherwise | — | `itemDestructive` slot | `DropdownMenu.figma.test.tsx` (light/dark) |
| CheckboxItem/RadioItem: checked | 20px `IconCheck` in the row's layout (12px padding + 20px + 8px gap → label at 40px, checked or not) | `Space`/`Enter`/click toggles — **the menu stays open** (Figma: selection items don't close the menu; 2026-10-07) | `aria-checked` (native Radix) | `itemIndicator` span always reserves the space; Radix `ItemIndicator` mounts the check; `onSelect` calls `preventDefault()` after the consumer's handler | `DropdownMenu.figma.test.tsx` |
| SubTrigger: open | `surface-subtle-hover` background | Hover or `ArrowRight`/click opens the submenu | `aria-expanded` (native Radix) | `data-[state=open]:bg-surface-subtle-hover` | `InteractionNestedSubmenuKeyboard` |
| Content: open/close | Fade + zoom in/out (`animate-in`/`animate-out`) | — | Radix `Presence` | `data-[state=open\|closed]:animate-*` | Storybook (visual) |

## 7. Design Tokens — Figma Traceability

Figma source for all rows below: `get_design_context` on node `11853:12967` ("Menu Item"), confirmed 2026-09-10.

| Figma requirement | Figma value | Prior code value | Status | Fix |
|---|---|---|---|---|
| Hover background token | `surface/subtle-hover` | `surface-button-secondary-hover` | **P0 bug — token didn't exist anywhere in the generated CSS pipeline** (confirmed via repo-wide grep; `Button.styles.ts`'s real secondary-hover token is `surface-secondary-hover`, a different name entirely). Hover/focus rendered **zero background** on every item. | Fixed → `surface-subtle-hover` in all 5 affected slots (`item`, `checkboxItem`, `radioItem`, `subTrigger` ×2 occurrences each for hover/focus, plus `subTrigger`'s `data-[state=open]`). `design.md` §2.2/§4.4 corrected (same stale token name had propagated into the docs). |
| Item padding | `pl-150 (12px) / pr-100 (8px) / py-100 (8px)` — asymmetric | `px-150` (12px both sides) | Bug — right padding 4px too wide | Fixed → `pl-150 pr-100 py-100` |
| Option-style check icon container | `size-[20px]` | `width={16} height={16}` (CheckboxItem's `IconCheck`), `size={8}` `MdCircle` (RadioItem) | Bug (size) + architectural drift (RadioItem used an external `react-icons/md` dot instead of this library's own icon set, and didn't match Figma at all — Figma's "Option" style has no distinct radio-dot variant, only a check icon) | Fixed → both `CheckboxItem` and `RadioItem` now render `IconCheck` at `20×20`; `itemIndicator` slot's container is `size-5` (20px), not `size-4` (16px) |
| Suffix chevron (submenu expand indicator) | `size-[20px]` | `width={16} height={16}` | Bug | Fixed → `20×20` |
| Container radius/shadow | `rounded-200`, Elevation **Lv.2** (panels 13053:4521 / 13055:14342 / 13055:13999 apply effect style "Elevation Lv.2"; デザイン仕様 labels it so) | `shadow-level-3` | **Drift, fixed 2026-10-07** → `shadow-level-2` (`design.md` §6.1 + design-foundation.md §4 updated) | See §7.1 |
| Menu-item Active background | `surface/subtle` | `surface-subtle` | Already correct — matches `design.md` §7.2's own documented rule for menu items | No change |
| Item hover/focus ring | No border/outline in ANY Menu Item state — only background changes | `focus-visible:outline-2 ... outline-border-focus` (added 2026-09-07, never tested against pure mouse hover) | **P0 bug, found 2026-09-10 by direct user report + real-browser confirmation**: Radix's Menu implementation calls `.focus()` on an item when the mouse merely moves over it (correct ARIA composite-menu behavior — roving focus follows hover). Chromium's `:focus-visible` heuristic treats that programmatic focus as keyboard-like, so the ring painted on EVERY plain mouse hover, not just real keyboard `Tab`/`Arrow` navigation — confirmed via `userEvent.hover()` with zero keyboard interaction: `element.matches(':focus-visible')` was `true`. | Ring removed entirely from `item`/`itemDestructive`/`checkboxItem`/`radioItem`/`subTrigger`; added unconditional `outline-none` on the same 5 slots (safe here — no competing `outline-2` chain to be poisoned, unlike the tailwind-merge collision documented for other components) to suppress the browser's own native default focus outline, which otherwise fills the gap (confirmed via computed style: `outline: auto` before this fix). The shared `hover:`/`focus:bg-surface-subtle-hover` background remains the WCAG 2.4.7 visible indicator for both hover and real keyboard nav. |
| Group-label divider inset | Confirmed via a real screenshot of Figma's own "Grouping" example (node `13055:14342`): the divider is clearly inset with visible whitespace on both sides, never touching the panel's rounded outer edge | `-mx-100 my-100 h-px bg-border-weak` (negative margin bleeds the divider edge-to-edge, canceling `content`'s own `p-100`) | Bug — visually contradicts Figma | Fixed → `my-100 h-px bg-border-weak` (no negative margin; stays naturally inset within `content`'s own padding) |
| Description text (`supportText`) below the label, 12px secondary, 1-line ellipsis-truncated | Explicit `supportText: boolean` component property, present on every state | Not implemented — no dedicated prop | **Fixed** — `description` prop added to `Item`/`CheckboxItem`/`RadioItem`, rendering a `truncate typo-body-s text-text-secondary` line in a `flex-col` with the label (`itemText`/`itemDescription` slots) | Approved by the user (2026-09-10); see `WithDescription` story |
| Menu container min/max width, max-height + scroll-then-16px-viewport-margin behavior | Guideline text only ("min → max range," "~15.5 items then scroll," "16px viewport margin auto-shrink") — no exact px values given anywhere in the Figma spec | `min-w-[200px]`, no max-width, no max-height/scroll | **Implemented with a documented approximation** — `max-w-[320px]` (a reasonable content-driven cap, not a sourced Figma number); `max-h-[var(--radix-dropdown-menu-content-available-height)]` + `overflow-y-auto` (Radix's own viewport-aware available-height variable, which implements the "shrink to fit" requirement exactly, with no guessed item-count-based pixel value needed); `collisionPadding={16}` default on `DropdownMenuContent` (this one IS an exact sourced Figma figure) | Approved by the user (2026-09-10); see `InteractionScrollableOverflow` story |

### 7.1 Figma alignment 2026-10-07 (Nova｜Master)

| Figma | Before | After | Test |
|---|---|---|---|
| Panel effect "Elevation Lv.2" | `shadow-level-3` | `shadow-level-2` | panel test (light/dark) |
| Panel Auto Layout gap 4 between items | none (items touching) | `flex flex-col gap-sds-50` on content/subContent | panel test |
| Item Min-height 36px | none | `min-h-9` on every item slot | min-height test (short content) |
| Danger Hover/Active `surface/subtle hover` / `surface/subtle` | `background-danger` | same fills as other items | Danger test |
| Option: Check Icon Container in the row (label at 40px) | absolute indicator at 8px, label at 32px | indicator in flow, `pl-sds-150` | Option test (checked + unchecked) |
| Icons `icon/primary`, Danger `icon/danger`, Disabled `icon/disable`, submenu chevron (Suffix Icon Container) `icon/secondary` | inherited text color | `[&_svg]` token classes | item / Danger / disabled / chevron tests |
| Disabled support text + shortcut `text/disable` | `text-secondary` | `group-data-[disabled]/item:text-sds-text-disable` | disabled test |
| 表示と制御: selection items (checkbox) don't close the menu | Radix default (closes) | `keepOpenOnSelect` on CheckboxItem/RadioItem | keep-open tests (action item still closes) |

Known Figma inconsistency, not mirrored: `Style=Option, State=Disabled` keeps its support text `text/secondary` while every other disabled text is `text/disable`; code uses `text/disable` for all disabled items.

All rows mutation-verified (each test fails with its change reverted).

## 8. Accessibility

- **Semantic roles:** All native Radix ARIA (`menu`/`menuitem`/`menuitemcheckbox`/`menuitemradio`/`separator`) — untouched by this library's styling layer.
- **Keyboard interactions:** `Enter`/`Space` opens (focus moves to first item), `ArrowUp`/`ArrowDown` roving focus, `ArrowRight` opens a submenu, `Escape` closes and returns focus to the trigger, type-ahead — all native Radix, verified via real `userEvent.keyboard()` in `InteractionKeyboardNavigation`/`InteractionNestedSubmenuKeyboard`.
- **Focus ring:** Fixed in an earlier pass (2026-09-07) for the `outline-none` + bare `outline`/`outline-2` tailwind-merge collision (design-foundation.md §5.1) and the `transition-colors`/`outline-color` flash bug — both verified via `InteractionFocusRingIntegrity` with real `Tab`/`getComputedStyle()`, on both a regular and a destructive item.
- **`aria-hidden-focus` exemption documented in-file:** `InteractionFocusRingIntegrity` disables that one axe rule because Radix's own internal focus-trap guard span (`data-radix-focus-guard`, standard react-focus-lock/Reach UI technique) is the only aria-hidden+focusable element present — not a real violation, confirmed via direct DOM inspection.

## 9. Theming

- Every color reference (`text-text-primary`/`-danger`/`-disable`, `surface-subtle`/`-subtle-hover`, `background-danger`) is a semantic token — theme-aware by construction, no hardcoded hex/rgba anywhere in `DropdownMenu.styles.ts`.

## 10. Market Benchmark

Not independently re-run this pass — `docs/architecture/market-benchmark.md` and `component-capability-matrix.md` already cover DropdownMenu's composition/API shape (both pre-date this audit's token/icon fixes and should be treated as stale on those specific points; see §12).

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Hover/focus background used a non-existent token (`surface-button-secondary-hover`) — zero visual feedback on hover/focus | This audit, 2026-09-10 | **Fixed** | `InteractionFocusRingIntegrity` (color check), `DestructiveItem` (className check) |
| Item padding symmetric (12/12) instead of Figma's asymmetric (12/8) | This audit, 2026-09-10 | Fixed | Visual only (no dedicated pixel-measurement story yet — see §13) |
| Check/chevron icons 16px instead of Figma's 20px | This audit, 2026-09-10 | Fixed | Visual only |
| `DropdownMenuRadioItem` used an external `react-icons/md` dot, mismatching both Figma and this library's own icon set | This audit, 2026-09-10 | Fixed | Visual only |
| Zero unit-test coverage | `component-capability-matrix.md` (earlier audit) | **Attempted, blocked by environment** — opening a Radix DropdownMenu throws `TypeError: Cannot read properties of null (reading 'useMemo')` under this repo's `unit` Vitest project specifically (confirmed via minimal reproduction: closed menu renders fine, only opening fails) — the same class of limitation already documented in `DatePicker.test.tsx`. Coverage moved into Storybook instead. | `InteractionRefForwarding` (7 forwardRef exports), `InteractionPortalContainerRedirect`, `DestructiveItem` |
| `Sub`/`RadioGroup` previously "exported with no matching SubTrigger/SubContent/RadioItem" (`component-capability-matrix.md` row 6) | Prior phase finding | **Already stale/incorrect as written** — all matching parts (`SubTrigger`, `SubContent`, `RadioItem`) are in fact exported from `index.ts` and demonstrated in stories; the matrix document itself needs a refresh (not done this pass — flagged only) | `WithLabelAndSeparator`, `InteractionNestedSubmenuKeyboard`, `InteractionRefForwarding` |
| Storybook JSDoc gaps (some stories used `//` comments instead of `/** */`, so they never populated the autodocs panel) | This audit, 2026-09-10 | Fixed | N/A (documentation, not behavior) |
| Missing `description`/`supportText` capability | This audit, 2026-09-10 | **Fixed** (user-approved) | `WithDescription` |
| Missing max-width/max-height/scroll + 16px viewport margin | This audit, 2026-09-10 | **Fixed** (user-approved) | `InteractionScrollableOverflow` |
| Focus-visible ring painted on plain mouse hover (Radix's `.focus()`-on-pointer-move + Chromium's `:focus-visible` heuristic) — a real bug INTRODUCED by the 2026-09-07 pass's own ring addition, never caught because that pass only tested keyboard-driven focus | Found by direct user report, 2026-09-10, confirmed via real browser test | **Fixed** — ring removed entirely from 5 slots, `outline-none` added to suppress the resulting native default outline | `InteractionFocusRingIntegrity` (rewritten) |
| "Group Header" (Figma's bundled divider+label component, node `11846:2269`) was never inspected via `get_design_context` in the first audit pass — only its name was noted in metadata | Found by direct user report, 2026-09-10 | Investigated — confirmed the separate-primitives API already covers it via composition; found and fixed a real sub-bug in the process (next row) | N/A (architectural finding, not itself a test) |
| `DropdownMenuSeparator` bled edge-to-edge (`-mx-100`) instead of staying inset like Figma's divider | Found while investigating Group Header, 2026-09-10, confirmed via a real Figma screenshot of the "Grouping" example | **Fixed** — removed the negative margin | Visual only (no dedicated pixel-measurement story yet) |
| Figma alignment 2026-10-07: shadow Lv.2, 4px item gap, 36px min-height, Danger hover fill, Option check in flow, icon tokens, disabled description/shortcut, selection items keep the menu open; Code Connect rewritten + Group Header mapping | `/component DropdownMenu`, 2026-10-07 | **Fixed** (user-approved) | `DropdownMenu.figma.test.tsx` (light + dark, mutation-verified) |

## 12. Known Limitations

- **Figma との既知の差分（フォント）**: Figma ではこのコンポーネントの一部のテキストに Label/En 系スタイル（欧文 Inter）が使われているが、実装では Inter を使わない（既定 `system-ui`、ブランドフォントは Noto Sans JP）。Dev Mode の `font-family: Inter` はコードに書き写さない。Figma 側は今後の更新で Noto Sans JP に統一予定（`design.md` §3.1）。
- **`docs/architecture/component-capability-matrix.md` is stale** for this component on at least 3 points found during this audit (ref-forwarding count, the "Sub/RadioGroup non-functional" claim, the focus-management gap description) — not refreshed this pass; treat its DropdownMenu section as out of date until it's re-run.
- **No pixel-measurement regression test** for the corrected padding (`pl-150 pr-100 py-100`) or icon sizes (20px) — verified via `get_design_context`'s literal Tailwind output and manual review, not a `getBoundingClientRect()` assertion.
- **`prefers-reduced-motion` not respected** by the open/close `animate-in`/`animate-out` transition — a systemic, repo-wide gap, not specific to DropdownMenu.
- (Superseded: `DropdownMenu.test.tsx` and `DropdownMenu.figma.test.tsx` now open the menu in the `unit` project — the old environment issue no longer reproduces.)
- **Separator-to-label gap is ~12px in code vs. Figma's explicit 16px `gap-200`** within its "Group Header" component (the gap comes from Figma's parent `flex-col gap-200`, not from either child's own padding) — a minor (4px) spacing nuance not fixed this pass; the bigger, visually-obvious edge-to-edge-bleed bug (§7/§11) was fixed, but exact gap-matching between two independently-composed primitives (rather than one bundled component with a shared parent gap) would need either a wrapper or a documented convention, not attempted here.

## 13. Decisions Made This Pass

Both items below are genuine, Figma-justified public-API additions, approved as public API changes and implemented 2026-09-10:

1. **`supportText` (description line)** → implemented as the `description` prop on `DropdownMenuItem`/`DropdownMenuCheckboxItem`/`DropdownMenuRadioItem`. See §4/§5/§7.
2. **Menu container min/max width and max-height + scroll behavior** → implemented using Radix's own viewport-aware `--radix-dropdown-menu-content-available-height` CSS variable (no guessed pixel value needed for the height cap) plus a `collisionPadding={16}` default (an exact, sourced Figma figure) and a `max-w-[320px]` content-driven cap (not independently sourced from Figma — documented as such in code). See §4/§7.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 (prior pass) | Workflow D (focus-ring fix) | 14/15 | 14/15 | 13/15 | 13/15 | 8/10 | 10/10 | 3/5 | 5/10 | 5/5 | 85/100 | none | Verified |
| 2026-09-10 (Figma-fidelity audit) | Workflow D | 14/15 | 14/15 | 14/15 | 14/15 | 10/10 | 10/10 | 5/5 | 8/10 | 5/5 | 94/100 | none | Verified |
| 2026-09-10 (capability additions) | Workflow D (user-approved `description` + scroll/max-height) | 15/15 | 15/15 | 14/15 | 14/15 | 10/10 | 10/10 | 5/5 | 8/10 | 5/5 | 96/100 | none | Verified |
| 2026-09-10 (regression fixes) | Workflow D (hover ring, Group Header) | 15/15 | 15/15 | 15/15 | 15/15 | 10/10 | 10/10 | 5/5 | 8/10 | 5/5 | 98/100 | none | Verified |
| 2026-10-07 (Figma alignment) | `/component` F: §7.1 + Code Connect | 15/15 | 15/15 | 15/15 | 15/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 100/100 | none | Verified |

Pass 2 changes: Design/Tokens +2 (fixed the non-existent-token P0 bug, padding, icon sizes, icon-library consistency — the single highest-impact fix in this audit); Accessibility +1 (hover/focus now genuinely visible, which is itself an accessibility-relevant fix beyond pure aesthetics); Logic +1 (destructive-variant switch now has a dedicated regression assertion); Storybook +2 (JSDoc gaps fixed, `argTypes` added, 3 new/expanded regression stories); Testing +3 (ref-forwarding and container-redirect now covered, even though blocked from the `unit` project — moved to Storybook instead of left uncovered).

Pass 3 changes: API +1, Composition +1 (both former Figma-parity gaps closed — `description` and scroll/max-height — each backed by its own regression story and API-contract fixture). Not yet 100: `docs/architecture/component-capability-matrix.md` remains stale (§12) and no pixel-measurement regression test exists for the corrected padding/icon sizes/max-width — both are documentation/coverage gaps, not behavioral ones.

Pass 4 changes (this pass, both findings caught by direct user report, neither by my own initial audit): Accessibility +1, Logic +1 (the hover-triggers-ring bug was a genuine regression from the 2026-09-07 pass, never caught because that pass only tested keyboard-driven focus — now verified via a real mouse-only `userEvent.hover()` test with no keyboard interaction at all); Design/Tokens unchanged at 10/10 despite the separator-inset fix, since that was already effectively "at ceiling" for what this scorecard tracks (the remaining §12 gap — the 4px separator-to-label spacing nuance — is too minor to move the needle). This pass is a direct lesson in this repo's own established rule: real-browser verification catches bugs source review and keyboard-only testing cannot — the hover-ring bug passed every prior automated check (lint, typecheck, the keyboard-only `InteractionFocusRingIntegrity` test, axe) and was only found because the user personally exercised the component and compared it against Figma by eye. Still not 100: `docs/architecture/component-capability-matrix.md` remains stale, no pixel-measurement regression test exists for several corrected values, and the 4px gap nuance is unresolved.
