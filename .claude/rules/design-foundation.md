# Design Foundation Rules — Color / Typography / Spacing / Radius / Elevation / Interaction

These rules define how component code must consume the design system's Foundation layer (the Nova Figma library's Foundations page). They cover **usage discipline**, not token *values* — the token values themselves are generated mechanically by `scripts/build-tokens.mjs` from `scripts/design-tokens.tokens.json` — this file does not describe the token pipeline itself.

Severity follows the same P0/P1/P2 convention as `.claude/rules/accessibility.md`.

---

## 1. Color Usage

| Criterion | Rule | Severity |
|---|---|---|
| **Semantic only** | Components reference semantic color classes (`bg-sds-surface-primary`, `text-sds-text-danger`, `border-sds-border-focus`) — never a primitive (`bg-neutral-700`) or a raw hex/`rgba()` value | P0 |
| **No new semantic tokens without a source** | Do not invent a semantic color name that doesn't exist in `design.md` §2.2 or the current Figma "Colors｜Semantic" collection — if a component needs a color role that doesn't exist, stop and ask, don't approximate with the nearest existing token silently | P1 |
| **Dark mode readiness** | Never assume a semantic token's value is theme-invariant — semantic tokens may resolve differently under `[data-theme="dark"]` once the dark-mode CSS bridge (see the token architecture spec) is wired for that token. Don't hardcode an assumption like "surface-primary is always dark text" | P1 |

## 2. Typography Usage

| Criterion | Rule | Severity |
|---|---|---|
| **Utility classes only** | Text styling uses `typo-{role}-{size}` utility classes (e.g. `typo-heading-desktop-h1`, `typo-title-l`, `typo-label-m-bold`, `typo-body-s` — Heading is the only role with a device split) — never set `font-size`/`line-height`/`font-weight` ad hoc in a component | P0 |
| **Never hardcode `font-family`** | No component sets `font-family` directly. The shipped default is `system-ui` (native OS font stack, via `--font-family-sds-sans`) — this is a deliberate choice from Figma's own Typography frame ("フォントは原則としてシステムフォントを適用します"), not a placeholder | P0 |
| **Branded fonts are opt-in only, via one file** | If a consumer wants Noto Sans JP (for both Latin and Japanese — Nova does not use Inter) instead of the OS-native stack, the only sanctioned mechanism is importing `@sun-asterisk/nova/branded-fonts.css` (source: `src/branded-fonts.css`) — never add a `<link>` tag, `@font-face` block, or a hardcoded `'Noto Sans JP'` font-family inside a component | P0 |
| **Don't confuse this with Figma-mockup generation** | `.claude/skills/sun-design-system/references/guideline-template.md`'s "Eina 03 → Noto Sans JP" substitution is about a *different* constraint: the Figma Plugin API cannot load the private `Eina 03`/`SF Pro` fonts when *generating new Figma mockup frames* via `use_figma`, so Noto Sans JP is used as a stand-in inside Figma itself. That is unrelated to what font ships in the actual web component library (which is `system-ui`, per above) — do not let one inform the other | P1 |
| **Only the unified `typo-{role}-{size}` table exists — the old `-eg-`/`-ja-` scheme is gone** | The original `typo-{device}-{lang}-{role}-{size}` classes were removed from `design-tokens.tokens.json`/`global.css` (not just deprecated; see `design.md` §3.2). Do not write a component class matching the old pattern; it no longer generates any CSS. If you see one in a diff, flag it | P0 |

## 3. Spacing & Radius Usage

| Criterion | Rule | Severity |
|---|---|---|
| **Token-only** | Spacing (`p-*`, `gap-*`, `m-*`) and radius (`rounded-*`) always come from the generated scale — never an arbitrary Tailwind bracket value (`p-[14px]`, `rounded-[10px]`) unless the value genuinely cannot be expressed by any existing step, and even then it needs a comment explaining why | P1 |
| **Only the numeric scale exists — the letter-keyed scale is gone** | The Spacing/Radius scale was renamed from size letters (`xxs`/`s`/`m`/`l`/`xl`/etc.) to a numeric scale (`25`/`100`/`200`/`400`/etc., per Figma's own changelog). The letter-keyed scale was removed from `design-tokens.tokens.json`/`global.css` — `p-m`, `gap-s`, `rounded-l`, etc. no longer generate any CSS. Use the numeric scale (`p-sds-200`, `gap-sds-150`, `rounded-sds-400`); do not write a letter-keyed class in new code | P0 |

## 4. Elevation / Shadow Usage

| Criterion | Rule | Severity |
|---|---|---|
| **Token-only, never raw** | Shadows always use the `shadow-sds-level-{1-5}` utility — never a raw `shadow-[...]` bracket value or hand-written `box-shadow`/`rgba()` | P0 |
| **Floating elements only** | Per `design.md` §6.2: shadows are for elements that float above the page (Modal, Snackbar, DropdownMenu, DatePicker, Tooltip, hover cards). Static, in-page content shows boundaries with `border-weak`, not a shadow | P1 |
| **Match the documented level per component** | `design.md` §6.1 maps components to levels: `level-1` Card hover/Badge, `level-2` small popovers/DatePicker/DropdownMenu, `level-3` Tooltip/Select, `level-4` Snackbar/Sticky Header, `level-5` Modal. A component using a different level than this table needs a documented reason, not an arbitrary choice. DatePicker and DropdownMenu use `level-2` because their Figma panels apply the effect style "Elevation Lv.2" | P2 |

## 5. Interaction States

Source: Figma's "Interaction" foundation frame — see `design.md` §7 for the full, human-readable version. Summarized here as enforceable rules.

### 5.1 Focus Display

| Criterion | Rule | Severity |
|---|---|---|
| **Every interactive element has a visible focus ring** | No component may set `focus-visible:outline-none` (or equivalent) without providing a replacement ring | P0 |
| **Use `FOCUS_RING_OFFSET_2`/`FOCUS_RING_OFFSET_3` from `src/utils/focusRing.ts` — do not hand-type the ring recipe** | The recipe (2px thick, color `border-focus`, `outline` not `border`) regresses easily when hand-typed per component; this shared constant is the single source. Import `FOCUS_RING_OFFSET_2` for filled/shape elements or `FOCUS_RING_OFFSET_3` for text elements (Figma-confirmed exceptions exist either direction — e.g. `Avatar` is a shape but uses 3px; check Figma, don't assume from element type). Every current consumer (`Button`, `Checkbox`, `RadioGroup`, `Modal`, `Snackbar`, `Scrollbar`, `DatePicker`/`DatePickerButton`, `Textarea`, `Link`, `Avatar`) already does this — a new component hand-typing the literal Tailwind string instead is a regression of exactly the bug class this file exists to prevent. `Tabs` (a real structural exception — `outline` can't visually cover its own `border-b-2` active indicator), `DropdownMenu`'s menu-item family (no distinct Figma focus visual at all) and `Switch` (the focusable root is a transparent 44x44 tap area, but Figma's ring surrounds the smaller visible track — the same recipe is applied to the track via `group-focus-visible:`, covered by `Switch.figma.test.tsx`) are the only components that legitimately don't use it; if a new component needs a genuinely different treatment, it needs the same kind of documented, verified reason those have, not just a preference | P0 |
| **Focus is a boolean, not a variant** | Focus must be able to coexist with any other state (hover, active, error) — never implement it as a mutually-exclusive `tv()` variant that can't combine with e.g. an error variant | P1 |
| **Never mix an unconditional `outline-none` with a `focus-visible:outline*` chain in the same class string** | `tailwind-merge` treats a bare `outline` and `outline-2` as conflicting utilities and silently drops the earlier one — harmless on its own, but if an unconditional (non-`focus-visible:`/non-`disabled:`-gated) `outline-none` is *also* present in the same string, it permanently sets `--tw-outline-style: none` and nothing ever restores it, so the focus ring never paints even though the element is genuinely `:focus-visible` (verify on a neutral, non-Storybook page with real keyboard `Tab`/arrow-key focus + `getComputedStyle()` — Storybook's own preview environment masks this class of bug, so a Storybook screenshot alone does not prove a focus ring renders). A *gated* `disabled:focus-visible:outline-none` is fine (see `Checkbox.styles.ts`/`RadioGroup.styles.ts` for the reference explanation); don't reintroduce a bare, unconditional one | P0 |
| **Never pair `transition-all`/`transition-colors` with a `focus-visible:outline-*` utility** | Both Tailwind transition utilities include `outline-color` in their transitioned property list. Since `outline-color` is unset while unfocused (computing as `currentColor`, i.e. the element's own text color), the moment focus lands, the ring visibly *animates* from that text color to the real `border-focus` blue over the transition duration — a visible mis-colored flash on every keyboard move (verify on a neutral non-Storybook page: `outline-color` read immediately after a real keyboard `Tab` differs from the same read ~300ms later). Narrow the transition instead (e.g. `transition-[background-color,box-shadow,color]`, as `DatePickerButton`, `Checkbox` and the `Switch` track do). The rule applies only when both utilities are **on the same element** — check which slot actually carries the outline before assuming a bug exists just because `transition-all` appears somewhere in the same styles file | P1 |
| **A `focus-visible:outline-*` ring on a roving-tabindex composite widget (Menu, Listbox, Combobox, and similar) must be verified with a HOVER-ONLY test, not just keyboard `Tab`** | Radix (and most correct ARIA composite-widget implementations) call `.focus()` on an item when the mouse merely moves over it, so the roving-focus position follows hover — this is correct behavior, not a bug. But Chromium's `:focus-visible` heuristic treats that programmatic, non-click focus as keyboard-like, so a plain `focus-visible:outline-*` ring paints on every mouse hover, not just real keyboard navigation — a keyboard-only regression story passes and gives false confidence. If the widget's own Figma spec shows no distinct ring-based "Focus" state (as `DropdownMenu`'s "Menu Item" component does not — every state uses only a background-color change), the fix is to remove the ring entirely and rely on the shared hover/focus background as the WCAG 2.4.7 visible indicator, plus add an unconditional `outline-none` (safe here specifically because no competing `outline-2`/`focus-visible:outline-*` chain remains to be poisoned by it — otherwise the browser's own native default focus outline fills the gap, visible as `getComputedStyle().outlineStyle === 'auto'`) | P0 |

### 5.2 Press / Active Representation

| Criterion | Rule | Severity |
|---|---|---|
| **Button-family components get an Active state** | Buttons, links, and similar actionable elements switch to their `surface-*-active` token while pressed | P2 |
| **Menu items get a Subtle active fill** | Menu/list items (DropdownMenu, etc.) apply `surface-subtle` while pressed, not a `surface-*-active` token | P2 |
| **Form controls have no press state** | Checkbox, Switch, RadioGroup, and similar value-changing controls must NOT implement a press/active visual — the value change itself is the feedback. Do not add one "for consistency" | P2 |

### 5.3 State Coexistence & Priority

| Criterion | Rule | Severity |
|---|---|---|
| **Disabled suppresses every other state** | A `disabled` element must show no hover, focus, or active visual — reacting to interaction on a disabled element implies (incorrectly) that it's operable | P0 |
| **Hover+Focus and Active+Focus both render together** | Do not make these states mutually exclusive in a component's variant system | P1 |
| **Error coexists with Hover/Focus** | Error is an independent status axis, not a state that overrides interaction feedback — an errored input must still show hover/focus normally | P1 |

### 5.4 Reduced Motion

| Criterion | Rule | Severity |
|---|---|---|
| **A global foundation already respects `prefers-reduced-motion` — do not add a per-component `motion-reduce:`/`motion-safe:` class as the primary mechanism** | `src/styles.css` already collapses every CSS *animation* (`animate-in`/`animate-out`, `Spinner`'s rotation, any future `@keyframes`-based effect) to near-instant under `prefers-reduced-motion: reduce`, globally, with no per-component opt-in required. A new component does not need its own `motion-reduce:animate-none` class — the existing ones on `Spinner`/`ProgressBar` predate this global rule and are harmless belt-and-suspenders, not a pattern to keep copying | P2 |
| **The global rule only touches `animation-*`, never `transition-*`** | If a component's timing (not just decorative motion) is driven by a CSS `transition` — e.g. an inline `style.transition` used as an actual countdown/delay mechanism, the way `Snackbar`'s auto-dismiss bar works — that transition duration is deliberately NOT affected by the global reduced-motion rule, because collapsing it would be a functional regression (less time to read/act), not an accessibility improvement. Do not "fix" this by trying to make the global rule also catch `transition-*` — that was evaluated and explicitly rejected (see the CSS comment in `src/styles.css` for the full reasoning). If a *decorative* (non-timing) `transition-*` genuinely needs to respect reduced motion, use a scoped `motion-reduce:transition-none` on that element specifically, not a change to the global rule | P1 |

## 6. Figma Traceability Discipline

| Criterion | Rule | Severity |
|---|---|---|
| **Never assume a Figma value from memory** | `scripts/design-tokens.tokens.json` is a stale, manually-exported snapshot. Before treating any color/spacing/radius/typography/shadow value as current, either re-run `pnpm run figma:pull` (reads Figma Variables via the REST API into `scripts/figma-variables.json`; needs `FIGMA_ACCESS_TOKEN`/`FIGMA_FILE_KEY` in `.env`) or check `scripts/figma-variables.json`'s `$changelog` key, which carries every foundation frame's full dated update history | P0 |
| **A stale-looking value needs a changelog citation, not a guess** | If a token in code looks wrong or outdated, find the specific dated changelog entry that explains it (or confirms nothing changed) before "fixing" it — apparent bugs often turn out to be deliberate, dated design decisions | P1 |
| **Report drift, don't silently correct it** | If live Figma data conflicts with what's shipped, document the discrepancy (with the specific changelog date/entry) and ask before changing generated tokens or component code | P0 |

---

## 7. Component-Specific Checklist

When writing or reviewing a component's `.styles.ts`/`.tsx`:

- [ ] Every color class is semantic (§1)
- [ ] Every text style is a `typo-*` class; no inline `font-family` (§2)
- [ ] Every spacing/radius value is a token class, no arbitrary brackets without a comment (§3)
- [ ] Every shadow is a `shadow-sds-level-*` class, appropriate to the component's role (§4)
- [ ] Focus-visible ring is present and matches the spec (§5.1)
- [ ] Press/Active state matches the component's category — present for buttons/menu items, absent for form controls (§5.2)
- [ ] Disabled state suppresses hover/focus/active visuals (§5.3)
- [ ] If a Figma-derived value looks surprising, the relevant changelog entry has been checked (§6)
