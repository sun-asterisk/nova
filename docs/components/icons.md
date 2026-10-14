# `Icons` — Component Specification

## 1. Identity

- **Figma component name:** `Icon / {Name}` (62 master components in the "Icon Master" section `16062:1647` of the official file Nova｜Master — 61 icons plus the blank `Icon / Empty` placeholder — and the "Icon Guideline" page `13484:8788`)
- **Figma file:** `FIGMA_FILE_KEY` (Sun Design System)
- **Figma node/component URL:** Guideline: node `13484:8788`; Icon list: node `16062:1648`
- **Code name:** `Icon{Name}` (61 components, e.g. `IconHome`, `IconBell`, `IconChevronRight`)
- **Package export:** `@sun-asterisk/nova/icons` (one shared subpath, 61 named exports)
- **Category:** Primitive — 61 independent leaf components sharing one prop shape (`SVGProps<SVGSVGElement>`), not a compound/composite component

## 2. Status

- **Lifecycle status:** Certified (real build + real Storybook/visual verification; not yet re-verified against a packed external consumer specifically for this set — see §11)
- **Last verified:** 2026-09-07 via manual `pnpm typecheck` / `eslint` / `vitest --project unit --project storybook` / `pnpm build` / `verify-package.mjs` / `verify-treeshaking.mjs` (not yet run through the formal `/test Icons` orchestrator)
- **Owner/last touched by:** Workflow C (new), 2026-09-07, `/component Icon` session

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<svg>` | `img` (implicit, decorative by default) | A single `<svg viewBox="0 0 24 24">`, no wrapper element |
| 2 | Path(s) | `<path>` (1 or more, some icons wrap multiple in a `<g>`) | — | Vector glyph data extracted verbatim from Figma's own 24×24 master component |

## 4. API

Each of the 61 icon components shares this identical shape:

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| (all standard SVG props) | `SVGProps<SVGSVGElement>` | `width=24 height=24 viewBox="0 0 24 24" fill="none" aria-hidden="true"` | No | Full passthrough — `className`, `width`, `height`, `onClick`, etc. all work; `aria-hidden` defaults to `true` but can be overridden | §1 (native-props extension) |
| `ref` | `Ref<SVGSVGElement>` | — | No | Forwarded to the root `<svg>` | §3 (ref forwarding) |

No `size` prop (react-icons' own convention) was added — a consumer sets `width`/`height` or CSS directly, consistent with every other Sun component's sizing approach (`[&_svg]:w-4 [&_svg]:h-4` descendant selectors already used in `Button.styles.ts`, `Snackbar.styles.ts`, etc.). No `color` prop either — icons are `fill="currentColor"` on every path, so they inherit the surrounding text color by design (see §9).

## 5. Composition & Customization

- **Compound API vs. `classNames`:** N/A — each icon is a single-element leaf, nothing to slot.
- **`asChild`:** N/A — an icon has no child content to merge onto.
- **Internal parts a consumer can realistically reach without forking:** the whole `<svg>` via standard props (`className`, `width`, `height`, `style`, `onClick`, etc.).
- **Architecture decision (separate components, not one dynamic `<Icon name="...">`):** matches the codebase's existing convention (icons rendered directly as children, e.g. `<MdAdd />` in `Button.stories.tsx`) rather than introducing a new runtime name-lookup indirection. Also matches the market precedent set by Radix Icons and Lucide (see §10).

## 6. State Matrix

N/A — icons are purely presentational; they carry no interactive or visual state of their own. Any state (hover, disabled, error) belongs to the component that renders the icon (e.g. `Button`'s `disabled:text-text-disable`, which the icon inherits via `currentColor`).

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Icon color = current text color ("アイコン自体には固有の色を持たせず、Current Colorとして定義します") | Icon Guideline page, "カラーの適用" section | `fill="currentColor"` (no Sun color token — inherits whatever `color`/`text-*` the consumer or ancestor sets) | Every `Icon*.tsx`'s `<path fill="currentColor">` | `Icons.stories.tsx` → "Inherits text color (currentColor)" | Real resolved-color assertion (not just the `currentColor` keyword) — see below |
| Standard size = 24×24px master component | Icon Guideline, "標準出力サイズ" | N/A — fixed intrinsic size, not a spacing/sizing token | `width="24" height="24" viewBox="0 0 24 24"` default on every icon | `Icons.stories.tsx` → Gallery | Gallery `play()` asserts every rendered `<svg>` has a `<path>` |
| Outline style is the default; Filled exists for selected/emphasis states | Icon Guideline, "スタイルと状態" | N/A | **Not implemented — see §13** | — | — |

**Figma alignment (2026-10-06):**
- **Geometry:** every icon's SVG export from Figma was compared with its `Icon*.tsx` path data — 61/61 identical (same commands, coordinates within 0.01).
- **6 icons added** (created in Figma 2026-10-05): `IconSun`, `IconMoon`, `IconCloud`, `IconArrowUturnLeft`, `IconArrowUturnRight`, `IconArrowsUpDown` — generated from the Figma SVG export, `#333333` → `currentColor`.
- **Code Connect:** every icon has a generated mapping `src/components/icons/IconX.figma.ts` (`pnpm run figma:icons`; Figma `Icon / Arrow Right` ↔ `IconArrowRight`, node IDs from Icon Master). It emits `<IconX />` imported from `@sun-asterisk/nova/icons` and lets nested icon instances in Button / Icon Button / TextField render as real code. `Icon / Empty` (blank placeholder, no code component) maps to an empty template (`EmptyIcon.figma.ts`), so a slot holding it renders no icon.
- **Filled style:** the guideline describes a Filled style for selected/emphasis states, but Icon Master contains no Filled icons yet — nothing to implement.

No arbitrary Tailwind bracket values are used by these components (they take no Tailwind classes of their own at all — sizing/color are consumer-supplied CSS or props).

## 8. Accessibility

Verified via real rendered DOM (Chromium, `Icons.stories.tsx`).

- **Semantic element / role:** `<svg>`, decorative by default (`aria-hidden="true"`) — matches `.claude/rules/accessibility.md` §5.2: "when paired with visible text, the icon SHOULD have `aria-hidden=\"true\"`."
- **Accessible name:** none by default (decorative). A consumer using an icon as the *sole* indicator (e.g. an icon-only button) must put `aria-label` on the **parent** control, not the icon — per the same rule; this is the existing, already-correct pattern in `Button`'s icon-only story (`aria-label="Add"` on the `<Button>`, not on `<MdAdd />`), unchanged by this addition.
- **Keyboard interactions:** N/A — not focusable, not interactive.
- **Focus management:** N/A.
- **Disabled semantics:** N/A — inherited visually via `currentColor` from a disabled ancestor's text color, not a prop of the icon itself.
- **Screen reader behavior:** silent by default (`aria-hidden`), as intended.

## 9. Theming

- **Light/dark behavior:** every icon is `currentColor`-based with zero hardcoded color of its own — it automatically follows whatever semantic text/icon color token the consumer applies (`text-icon-primary`, `text-icon-danger`, etc.), which already have real light/dark values in `scripts/global.css`. The icon component itself introduces no new theming surface.
- **Verification method used:** real `getComputedStyle` check in `Icons.stories.tsx`'s "Inherits text color" story — asserts the path's resolved `fill` equals the wrapping element's resolved `color`, not just that the `currentColor` keyword is present (Production certification's standard: a keyword match is not evidence of an actually-working visual result).

## 10. Market Benchmark

- **Radix Icons** (`@radix-ui/react-icons`): one named React component per icon, `currentColor`-based, no `size` prop, 15×15 canonical grid — same architecture Sun follows here (Sun's own 24×24 grid, per its own Figma guideline).
- **Lucide** (`lucide-react`): one named component per icon, but with `forwardRef`, a `size` prop (defaults to 24), and `absoluteStrokeWidth`. Sun deliberately did **not** add a `size` prop — the existing convention (`[&_svg]:w-4 [&_svg]:h-4` CSS, or plain `width`/`height`) already covers this, and adding a second sizing mechanism would be exactly the kind of premature, redundant API surface `CLAUDE.md` warns against.
- **Ant Design Icons** (`@ant-design/icons`): a single dynamic `<Icon component={...} />` plus per-icon exports — the pattern this document explicitly rejected in favor of matching Sun's own existing "render the icon directly as a child" convention (react-icons' `<MdAdd />` today).
- **Heroicons**: ships raw `.svg` files plus optional generated React components — closest precedent for the "just paths + a thin wrapper" approach taken here.

**Decision:** KEEP the separate-components architecture (matches Radix Icons/Lucide, matches Sun's own existing icon-usage convention). REJECT a `size` prop (Lucide has one; Sun's existing CSS-descendant-selector convention already solves this). REJECT a dynamic name-lookup `<Icon name="...">` (Ant Design's pattern; would be a new, inconsistent convention and worse for tree-shaking).

## 11. Regression Matrix

No prior-phase finding names an "Icon" component (it didn't exist before this session — confirmed via repository-wide grep). This is a new addition, not a regression fix, with one exception: it directly resolves the previously-undocumented fact that `Button`, `TextField`, `TextareaField`, `Badge`, `Snackbar`, `Modal`, `Checkbox`, and `DropdownMenu` were all rendering `react-icons`' generic Material Design glyphs as stand-ins for Sun's own actual icon designs — a real, silent Figma/code drift at the glyph level, now closed for those 8 components (see the replacement table below).

| Component | Old (react-icons) | New (Sun icon) |
|---|---|---|
| `Checkbox` | `MdCheck`, `MdRemove` | `IconCheck`, `IconMinus` |
| `Snackbar` | `MdInfoOutline`, `MdCheckCircleOutline`, `MdErrorOutline`, `MdClose` | `IconInfoCircle`, `IconCheckCircle`, `IconExclamationCircle`, `IconCross` |
| `TextField` / `TextareaField` / `Badge` | `MdErrorOutline` | `IconExclamationCircle` |
| `Modal` | `MdClose` | `IconCross` |
| `DropdownMenu` | `MdCheck`, `MdChevronRight` | `IconCheck`, `IconChevronRight` |

`DropdownMenu`'s and `RadioGroup`'s `MdCircle` (the small filled radio-selection dot) were deliberately **not** replaced — it is a decorative UI bullet, not one of the pictograms in Figma's Icon Guideline/Component List, so there is no real Sun equivalent to swap in.

## 12. Examples

```tsx
import { IconHome, IconExclamationCircle } from '@sun-asterisk/nova/icons';

// Decorative, paired with visible text (the common case) — no aria-label needed,
// the icon defaults to aria-hidden.
<button>
  <IconHome className="w-5 h-5" />
  Home
</button>

// Icon-only control — the accessible name goes on the CONTROL, not the icon.
<button aria-label="Go home">
  <IconHome className="w-5 h-5" />
</button>

// Inherits the surrounding text color automatically (currentColor).
<span className="text-text-danger flex items-center gap-1">
  <IconExclamationCircle width={16} height={16} />
  This field is required
</span>
```

## 13. Known Limitations

- **Outline style only.** Figma's Icon Guideline documents a second "Filled" style (for selected/emphasis states) — not implemented in this pass. Deferred, not silently dropped: adding it later means either a `Filled` suffix per icon (`IconHomeFilled`) or a `variant` prop; no consumer currently needs it.
- **Icons follow Figma Icon Master by hand-triggered sync.** As of 2026-10-06 code has all 61 Figma icons (the 62nd, `Icon / Empty`, is a placeholder). A new Figma icon needs its `Icon*.tsx` added (generate it from the Figma SVG export, `#333333` → `currentColor`) and then `pnpm run figma:icons`, which also reports icons present on only one side.
- **"Icon / Empty" was excluded.** Figma's list includes a placeholder "Empty" symbol with no real vector content (a "no icon selected" option for other components' property panels) — it has no code equivalent and isn't a real icon.
- **`MdCircle` (decorative radio-selection dot) intentionally left as `react-icons` in `RadioGroup`/`DropdownMenu`** — not part of Figma's icon set (see §11).

## 14. Quality Score & History

Scored against the actual weighted rubric in `docs/architecture/component-development-system.md` §6.1 (API 15 / Composition 15 / Accessibility 15 / Logic 15 / Design-token 10 / Theming 10 / Storybook 5 / Testing 10 / Package 5 = 100) — an earlier version of this table used a different, non-canonical 10-category equal-weighted breakdown; that was a mistake, corrected here.

| Date | Workflow | API /15 | Composition /15 | Accessibility /15 | Logic /15 | Design/Tokens /10 | Theming /10 | Storybook /5 | Testing /10 | Package /5 | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 | Workflow C | 15 | 15 (N/A — single-element leaf, no slots/compound structure needed) | 15 | 15 | **9** (Filled style documented in Figma, not implemented — see below) | 10 | 5 | 10 (`/test Icons` run this session: Storybook 2/2, `test:api` 0 errors, package/tree-shaking checks all pass) | 5 | **99/100** | none | Certified |

**The one open point:** §7's Figma Traceability table has one incomplete row — Figma's Icon Guideline documents both an Outline (shipped) and a Filled style (for selected/emphasis states, not shipped). Closing this to a true 100/100 requires one of two decisions, not a score adjustment:
1. Implement the Filled variant for every icon (real work — a second Figma extraction + generation pass), or
2. A deliberate, documented decision that Filled is out of scope for v1 (no current Sun component demonstrates a "selected/filled icon" need across the 8 components already audited) — which would change §7's row to "N/A — no demonstrated consumer need, explicitly deferred" rather than "Not implemented."

Explicitly deferred (2026-09-07, user request) — neither path taken yet. Do not silently pick one later; ask.

A real, confirmed tree-shaking defect was found and fixed during this same session (importing one icon initially pulled in all 55 — a `displayName` side-effect assignment blocking intra-file dead-code elimination when all 55 icons shared one built file) — fixed by giving each icon its own Rollup entry, exactly the precedent set for `ThemeProvider`/`ThemeScript`. Verified via `scripts/quality/verify-treeshaking.mjs`: an `IconHome`-only bundle dropped from 66.86kB to 1.23kB after the fix.
