# Sun Design System — Component Capability Matrix

**Status:** Analysis artifact (component architecture audit & capability specification)
**Scope:** All 17 public components in `src/components/`, audited against 22 capability dimensions.
**Method:** Full source read (`.tsx`, `.styles.ts`, `index.ts`, `.stories.tsx`) per component, four parallel research passes, every rating backed by a `file:line` citation. No implementation code was modified to produce this document.
**Companion documents:** `docs/architecture/remediation-matrix.md` (remediation of the findings) and `docs/architecture/market-benchmark.md`.

---

## How to read this matrix

Each component is scored across the same 22 dimensions, grouped into six themes:

| Group | Dimensions |
|---|---|
| **Composition & Extensibility** | 1 Category · 2 Underlying primitive · 3 Ref forwarding · 4 Polymorphism · 5 Controlled/uncontrolled · 6 Compound API · 7 Composition primitives used |
| **Styling & Variants** | 8 Styling override surface · 9 Variant system |
| **API Surface** | 10 Boolean prop count · 11 Size variants · 12 Loading state · 13 Error/invalid state · 14 Disabled handling · 15 Icon/adornment support |
| **Accessibility** | 16 Semantic HTML/ARIA · 17 Keyboard interaction · 18 Focus management |
| **Engineering Quality** | 19 TypeScript API quality · 20 Form integration · 21 Animation/motion |
| **Verification** | 22 Storybook/test coverage |

"Category" is this audit's *proposed* classification against the capability taxonomy (Foundation → Primitive → Behavior Primitive → Simple → Composite → Pattern) — it is not yet a decided architecture, only a current-state observation.

All file paths are relative to the repository root. Line numbers reflect the working tree audited on 2026-09-01.

---

## 1. Badge

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Simple Component** — single presentational element, no internal parts, no state machine, wraps a native `<span>` | `src/components/badge/Badge.tsx:71-80` |
| 2 | Underlying primitive | Native HTML `<span>`; no Radix | `src/components/badge/Badge.tsx:72` |
| 3 | Ref forwarding | Yes, `forwardRef<HTMLSpanElement, BadgeProps>` | `src/components/badge/Badge.tsx:46` |
| 4 | Polymorphism | Absent — no `asChild`/`Slot` | `src/components/badge/Badge.tsx:1-86` |
| 5 | Controlled/uncontrolled | Stateless/presentational — no `value`/`checked`, no internal `useState` | `src/components/badge/Badge.tsx:12-19` |
| 6 | Compound API | Single component, no compound API | `src/components/badge/index.ts:1` |
| 7 | Composition primitives | `forwardRef`, `useMemo`; no Slot/Portal/Context | `src/components/badge/Badge.tsx:2` |
| 8 | Styling override surface | `className` merged via `cn()` (twMerge); single root = full override surface | `src/components/badge/Badge.tsx:12-19,47-57`; `src/utils/style.ts:4` |
| 9 | Variant system | `tv()`; `variant: count \| dot \| label \| error` | `src/components/badge/Badge.styles.ts:3,8-31` |
| 10 | Boolean prop count | 0 — no explosion risk | `src/components/badge/Badge.tsx:12-19` |
| 11 | Size variants | None — each variant has fixed dimensions | `src/components/badge/Badge.styles.ts:16-20` |
| 12 | Loading state | N/A — static indicator | — |
| 13 | Error/invalid state | Visual `error` variant only (icon + danger color), conflates "error look" with "invalid state" | `src/components/badge/Badge.styles.ts:27-30` |
| 14 | Disabled handling | N/A — non-interactive | — |
| 15 | Icon/adornment | Via `children` override of `label`; `error` variant auto-renders `MdErrorOutline` | `src/components/badge/Badge.tsx:59-69` |
| 16 | Semantic HTML/ARIA | `role="status"` + `aria-label` | `src/components/badge/Badge.tsx:75-76` |
| 17 | Keyboard interaction | N/A — non-interactive | — |
| 18 | Focus management | N/A — never focusable | `src/components/badge/Badge.styles.ts:3-36` |
| 19 | TypeScript API quality | `BadgeVariant` exported; **`BadgeProps` not exported**; no `any`/`@ts-ignore`; JSDoc present | `src/components/badge/Badge.tsx:7,12-19`; `src/components/badge/index.ts:1` |
| 20 | Form integration | N/A | — |
| 21 | Animation/motion | None | `src/components/badge/Badge.styles.ts:1-36` |
| 22 | Storybook/test | 6 stories; **no `play` tests** | `src/components/badge/Badge.stories.tsx:42-103` |

**Notable findings:** `BadgeProps` isn't exported (blocks consumer wrapper typing, inconsistent with `Divider`). The `error` variant conflates a visual style with a semantic state — cannot combine "error look" with a text label. `role="status"` fires even on a `dot` variant with no `label`, producing an empty-announcement status region. No `size` prop, inconsistent with `Button`.

---

## 2. Button

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Simple Component** — thin wrapper over native `<button>` | `src/components/button/Button.tsx:54-58` |
| 2 | Underlying primitive | Native HTML `<button>`; no Radix | `src/components/button/Button.tsx:55` |
| 3 | Ref forwarding | Yes, `forwardRef<HTMLButtonElement, ButtonProps>` | `src/components/button/Button.tsx:40` |
| 4 | Polymorphism | **Absent** — always renders a literal `<button>`, cannot render as `<a>` | `src/components/button/Button.tsx:1-63` |
| 5 | Controlled/uncontrolled | Stateless; native `onClick`/`disabled` pass through `ComponentProps<'button'>` | `src/components/button/Button.tsx:14-19` |
| 6 | Compound API | Single component | `src/components/button/index.ts:1` |
| 7 | Composition primitives | `forwardRef`, `useMemo` | `src/components/button/Button.tsx:2` |
| 8 | Styling override surface | `className` via native props, merged with `cn()`; full override (single root) | `src/components/button/Button.tsx:41-52` |
| 9 | Variant system | `tv()`; `variant: primary \| secondary \| emphasis \| plain \| danger`, `size: small \| medium \| large` | `src/components/button/Button.styles.ts:3,9-55` |
| 10 | Boolean prop count | 0 hand-declared (native `disabled` inherited) | `src/components/button/Button.tsx:14-19` |
| 11 | Size variants | Yes — `small \| medium \| large`, default `small` | `src/components/button/Button.tsx:9,17-18` |
| 12 | Loading state | **None** — no `loading`/`aria-busy`/spinner | `src/components/button/Button.tsx:14-19` |
| 13 | Error/invalid state | No dedicated variant; `danger` is a style choice, not validation | `src/components/button/Button.styles.ts:34-39` |
| 14 | Disabled handling | Native `disabled` attribute, styled via `disabled:` pseudo-classes | `src/components/button/Button.styles.ts:14,20,26,32,38` |
| 15 | Icon/adornment | Via `children` only, no dedicated `startIcon`/`endIcon` prop | `src/components/button/Button.stories.tsx:169-223` |
| 16 | Semantic HTML/ARIA | Native `<button>`; consumer must supply `aria-label` for icon-only (unenforced) | `src/components/button/Button.stories.tsx:209-215` |
| 17 | Keyboard interaction | Native (Enter/Space); verified in interaction test | `src/components/button/Button.stories.tsx:350-352` |
| 18 | Focus management | `focus-visible:outline-2 outline-offset-2 outline-border-focus` in `base` — matches spec, unconditional across variants | `src/components/button/Button.styles.ts:4-7` |
| 19 | TypeScript API quality | `ButtonVariant`/`ButtonSize` exported; **`ButtonProps` not exported**; no `any`; JSDoc with examples | `src/components/button/Button.tsx:6,9,14-19` |
| 20 | Form integration | Native `type="submit"` works via native props | `src/components/button/Button.stories.tsx:71-79` |
| 21 | Animation/motion | No `data-state` transitions, no motion at all | `src/components/button/Button.styles.ts:9-55` |
| 22 | Storybook/test | 14 stories; **2 `play` interaction tests** (`InteractionClick`, `InteractionDisabledBlocksClick`) | `src/components/button/Button.stories.tsx:338-371` |

**Notable findings:** No `asChild` polymorphism — the most consequential composability gap in the library for a component this central; forces consumers to duplicate Button styling on raw `<a>` or misuse `<button onClick>` for navigation (violates `.claude/rules/accessibility.md` §1.1). No `loading` state despite the accessibility rules' own Button checklist requiring one (§7.1). Icon-only accessible-name compliance is unenforced. `ButtonProps` not exported.

---

## 3. Checkbox

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Primitive** (Radix-wrapped) | `src/components/checkbox/Checkbox.tsx:2,44-75` |
| 2 | Underlying primitive | `@radix-ui/react-checkbox` (individual package, `^1.3.3`) | `src/components/checkbox/Checkbox.tsx:2`; `package.json:150` |
| 3 | Ref forwarding | Yes, `forwardRef<ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>` | `src/components/checkbox/Checkbox.tsx:44` |
| 4 | Polymorphism | Type-level only — `asChild` inherited via `ComponentProps<typeof Root>` but component hardcodes its own `children` (the `Indicator`), so a consumer-supplied `asChild` would conflict | `src/components/checkbox/Checkbox.tsx:17,59-72` |
| 5 | Controlled/uncontrolled | Both, fully delegated to Radix (`checked`/`onCheckedChange`/`defaultChecked`) | `src/components/checkbox/Checkbox.tsx:17` |
| 6 | Compound API | Single public export; Radix Root+Indicator not exposed separately | `src/components/checkbox/index.ts:1` |
| 7 | Composition primitives | `forwardRef`, `useMemo`, Radix Root/Indicator | `src/components/checkbox/Checkbox.tsx:1-5` |
| 8 | Styling override surface | Root `className` merged via `cn()`; **Indicator className is hardcoded, non-overridable** | `src/components/checkbox/Checkbox.tsx:47-57,66-69` |
| 9 | Variant system | `tv()`; `variant: default \| error \| disabled` internally, but public `CheckboxVariant` only exposes `default \| error` | `src/components/checkbox/Checkbox.styles.ts:3,13-34`; `src/components/checkbox/Checkbox.tsx:8,46` |
| 10 | Boolean prop count | 3 effective booleans via inherited Radix props: `disabled`, `required`, `defaultChecked` (none hand-declared) | `src/components/checkbox/Checkbox.tsx:17,45,63` |
| 11 | Size variants | **None** — fixed `size-200` | `src/components/checkbox/Checkbox.styles.ts:5` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | Visual only (`variant="error"`) — **no `aria-invalid` set anywhere** | `src/components/checkbox/Checkbox.styles.ts:20-24` |
| 14 | Disabled handling | Real native `disabled` boolean, confirmed hardened (not a `variant: 'disabled'` string) | `src/components/checkbox/Checkbox.tsx:45-46,63` |
| 15 | Icon/adornment | Fixed internal icons only (`MdCheck`/`MdRemove`), not swappable | `src/components/checkbox/Checkbox.tsx:4,66-71` |
| 16 | Semantic HTML/ARIA | Radix sets `role="checkbox"` + `aria-checked` automatically | `src/components/checkbox/Checkbox.tsx:59-72` |
| 17 | Keyboard interaction | Inherited from Radix (Space toggles) | `src/components/checkbox/Checkbox.stories.tsx:405-424` |
| 18 | Focus management | `focus-visible:outline-2 outline-offset-2 outline-border-focus`, correctly suppressed when disabled | `src/components/checkbox/Checkbox.styles.ts:5,8-9` |
| 19 | TypeScript API quality | `CheckboxVariant` exported, **`CheckboxProps` not exported**; best-documented JSDoc rationale of the four in this group | `src/components/checkbox/Checkbox.tsx:8,10-20` |
| 20 | Form integration | `name`/`value`/`required` pass through natively; label association by sibling-`<label>` convention only, not enforced | `src/components/checkbox/Checkbox.stories.tsx:189-211,353-403` |
| 21 | Animation/motion | `data-state`-driven, but Indicator sets `transition-none`; no `prefers-reduced-motion` | `src/components/checkbox/Checkbox.tsx:68`; `src/components/checkbox/Checkbox.styles.ts:5,10-11` |
| 22 | Storybook/test | 13 stories; **2 `play` tests** (`InteractionToggle`, `InteractionDisabledBlocksToggle`) | `src/components/checkbox/Checkbox.stories.tsx:405-441` |

**Notable findings:** No `aria-invalid`/`aria-describedby` wiring on the error variant (P0 per accessibility rules §1.2/§7.6). `asChild` is a latent foot-gun — type-permitted but functionally broken due to hardcoded children. No compound `Checkbox.Label`/`Checkbox.Group` despite the label pattern being hand-copied in every story. No `size` prop.

> **Resolved (foundation capability implementation):** row 13's `aria-invalid` gap is fixed — `aria-invalid` is now derived automatically from `effectiveVariant === 'error'` (`Checkbox.tsx`), mutation-tested, with a real-DOM Storybook `play()` assertion (`InteractionAriaInvalid`). `aria-describedby` remains out of scope: Checkbox does not own description/error rendering (label/description/error stay external, consumer-supplied), so there is no Sun-generated id to wire it to — see `component-development-system.md` §11.1 for why this is a deliberate, not overlooked, scope boundary.

---

## 4. Divider

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Primitive** — purely presentational separator | `src/components/divider/Divider.tsx:36-52` |
| 2 | Underlying primitive | Native `<div>`; hand-rolled, not `@radix-ui/react-separator` | `src/components/divider/Divider.tsx:50` |
| 3 | Ref forwarding | Yes, `forwardRef<HTMLDivElement, DividerProps>` | `src/components/divider/Divider.tsx:36` |
| 4 | Polymorphism | Absent | `src/components/divider/Divider.tsx:1-55` |
| 5 | Controlled/uncontrolled | Stateless | `src/components/divider/Divider.tsx:37` |
| 6 | Compound API | Single component | `src/components/divider/index.ts:1` |
| 7 | Composition primitives | `forwardRef`, `useMemo` | `src/components/divider/Divider.tsx:2` |
| 8 | Styling override surface | `className` via native props, merged with `cn()`; full override | `src/components/divider/Divider.tsx:38-47` |
| 9 | Variant system | `tv()`; `orientation: horizontal \| vertical`, `flexItem: true` | `src/components/divider/Divider.styles.ts:3,8-22` |
| 10 | Boolean prop count | 1 (`flexItem`) — no explosion | `src/components/divider/Divider.tsx:11-16` |
| 11 | Size variants | None — fixed thickness per orientation | `src/components/divider/Divider.styles.ts:9-16` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | N/A | — |
| 14 | Disabled handling | N/A | — |
| 15 | Icon/adornment | **API defect**: `children` is type-permitted (not `Omit`'d) but never rendered — silently dropped at runtime | `src/components/divider/Divider.tsx:11,50` |
| 16 | Semantic HTML/ARIA | Explicit `role="separator"` | `src/components/divider/Divider.tsx:50` |
| 17 | Keyboard interaction | N/A — non-interactive | `src/components/divider/Divider.tsx:50` |
| 18 | Focus management | N/A — not focusable | `src/components/divider/Divider.styles.ts:1-27` |
| 19 | TypeScript API quality | **Only component of the four in this group that exports its full `DividerProps`**; no `any` | `src/components/divider/Divider.tsx:6,11,18-34` |
| 20 | Form integration | N/A | — |
| 21 | Animation/motion | None | `src/components/divider/Divider.styles.ts:1-27` |
| 22 | Storybook/test | 5 stories; **no `play` tests** | `src/components/divider/Divider.stories.tsx:44-146` |

**Notable findings:** `children` is accepted by the type but silently discarded at render — a real type/behavior mismatch. `my-[8px]`/`mx-[8px]` are uncommented arbitrary Tailwind brackets where a numeric-scale token (`my-200`) likely exists — a design-foundation §3 P1 candidate. No `size`/`color` variant (defensible for a minimal primitive).

---

## 5. DropdownMenu

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Composite Component / Pattern** — 10-part compound API | `src/components/dropdownMenu/DropdownMenu.tsx:8-81` |
| 2 | Underlying primitive | `@radix-ui/react-dropdown-menu` (individual package) | `src/components/dropdownMenu/DropdownMenu.tsx:2`; `package.json:152` |
| 3 | Ref forwarding | 4 of 10 exports `forwardRef` (`Content`, `Item`, `Separator`, `Label`), all → `HTMLDivElement`; `Shortcut` has no ref support | `src/components/dropdownMenu/DropdownMenu.tsx:14-16,29-31,41-43,53-55,65-67` |
| 4 | Polymorphism | Supported transitively — wrappers spread `...props` onto Radix primitives that accept `asChild` natively | `src/components/dropdownMenu/DropdownMenu.tsx:9,19-24` |
| 5 | Controlled/uncontrolled | Fully delegated — `DropdownMenu = DropdownMenuPrimitive.Root` | `src/components/dropdownMenu/DropdownMenu.tsx:8` |
| 6 | Compound API | 10 exports; **`Sub`/`RadioGroup` exported with no matching `SubTrigger`/`SubContent`/`RadioItem`** — non-functional out of the box | `src/components/dropdownMenu/DropdownMenu.tsx:11-12`; `index.ts:1-12` |
| 7 | Composition primitives | `Portal` (hardcoded, no `container` passthrough), `forwardRef` ×4, `cn()` | `src/components/dropdownMenu/DropdownMenu.tsx:18,25` |
| 8 | Styling override surface | `className` merged on every wrapped part; Portal target not exposed | `src/components/dropdownMenu/DropdownMenu.tsx:22,35,47,59,66` |
| 9 | Variant system | `tv({slots})`, 6 slots, **no `variants` key**; `destructive` chosen imperatively in TSX | `src/components/dropdownMenu/DropdownMenu.styles.ts:3-42` |
| 10 | Boolean prop count | 1 (`destructive` on `Item`) — no explosion | `src/components/dropdownMenu/DropdownMenu.tsx:31,35` |
| 11 | Size variants | None | — |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | N/A — `itemDestructive` is an action-severity slot, not validation | `src/components/dropdownMenu/DropdownMenu.styles.ts:23-31` |
| 14 | Disabled handling | Native Radix `disabled`, CSS attribute-selector styling | `src/components/dropdownMenu/DropdownMenu.styles.ts:21,30` |
| 15 | Icon/adornment | No dedicated prop; consumers place icons as children; no story demonstrates a leading icon | `src/components/dropdownMenu/DropdownMenu.styles.ts:15` |
| 16 | Semantic HTML/ARIA | `role="menu"`/`"menuitem"` from Radix; no explicit ARIA hand-set | — |
| 17 | Keyboard interaction | Fully inherited from Radix (arrows, Home/End, Escape, type-ahead) | — |
| 18 | Focus management | **Gap**: `item` slot uses `outline-none` + background-color-only focus indication, not a visible ring; `Trigger` is unstyled with no ring in any story | `src/components/dropdownMenu/DropdownMenu.styles.ts:17,19`; `DropdownMenu.stories.tsx:28` |
| 19 | TypeScript API quality | Idiomatic `ComponentProps<typeof X>` derivation; no `any`; minimal JSDoc | `src/components/dropdownMenu/DropdownMenu.tsx:14-16,29-31` |
| 20 | Form integration | N/A | — |
| 21 | Animation/motion | `data-[state]` driven `animate-in`/`animate-out`; no `prefers-reduced-motion` | `src/components/dropdownMenu/DropdownMenu.styles.ts:11-12` |
| 22 | Storybook/test | 6 stories; **1 `play` test** (`InteractionOpenAndSelect`, with `waitFor` for Radix's async `aria-hidden` cleanup) | `src/components/dropdownMenu/DropdownMenu.stories.tsx:25-139` |

**Notable findings:** `Sub`/`RadioGroup` exports are non-functional without reaching into raw Radix primitives — breaks encapsulation. Portal target not configurable. Menu-item focus visibility relies on background color only, not a ring — a milder version of the exact bug class the design-foundation rules were written to catch (`Switch`'s prior fix).

---

## 6. Input

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Primitive** — explicitly documented foundation for `TextField` | `src/components/input/Input.tsx:20-22` |
| 2 | Underlying primitive | Native `<input>`; no Radix | `src/components/input/Input.tsx:91-97` |
| 3 | Ref forwarding | Yes, `forwardRef<HTMLInputElement, InputProps>` | `src/components/input/Input.tsx:41,92` |
| 4 | Polymorphism | Absent | — |
| 5 | Controlled/uncontrolled | Fully native passthrough via `...rest` | `src/components/input/Input.tsx:11,50,96` |
| 6 | Compound API | N/A — single component | — |
| 7 | Composition primitives | `forwardRef`, `cn()`, `useMemo` ×2 | `src/components/input/Input.tsx:1-2,56-77` |
| 8 | Styling override surface | **Partial only** — `className` merges into the inner `<input>` only; the outer wrapper `<div>` (border/background/height/focus ring) does not accept consumer classes | `src/components/input/Input.tsx:56-65` vs `67-77` |
| 9 | Variant system | `tv()`; `variant: default \| error \| disabled` internally, public `InputVariant` exposes `default \| error` only | `src/components/input/Input.styles.ts:11-28`; `Input.tsx:6` |
| 10 | Boolean prop count | 0 hand-declared new booleans | `src/components/input/Input.tsx:11-18` |
| 11 | Size variants | None — fixed `h-[40px]` | `src/components/input/Input.styles.ts:9` |
| 12 | Loading state | None | — |
| 13 | Error/invalid state | **Visual only** — no `aria-invalid` anywhere in the component | `src/components/input/Input.styles.ts:18-20` |
| 14 | Disabled handling | Native `disabled` + internal `effectiveVariant` for styling | `src/components/input/Input.tsx:54,95` |
| 15 | Icon/adornment | `startAdornment`/`endAdornment` props | `src/components/input/Input.tsx:14-17,70-72,81-90` |
| 16 | Semantic HTML/ARIA | Native `<input>`; no ARIA, no label association (deferred to `TextField`) | `src/components/input/Input.tsx:91-97` |
| 17 | Keyboard interaction | Fully native | — |
| 18 | Focus management | `focus-within:outline-2 outline-offset-3 outline-border-focus` — uses `focus-within` not `focus-visible`, so it also fires on mouse-click focus | `src/components/input/Input.styles.ts:6` |
| 19 | TypeScript API quality | Idiomatic `ComponentProps<'input'>` extension; JSDoc present; no `any` | `src/components/input/Input.tsx:5-18,20-39` |
| 20 | Form integration | Native passthrough; no `htmlFor`/label pairing by design (deferred to `TextField`) | `src/components/input/Input.tsx:50,96` |
| 21 | Animation/motion | `transition-colors duration-200`; no `prefers-reduced-motion` | `src/components/input/Input.styles.ts:7` |
| 22 | Storybook/test | 9 stories; **zero `play` tests** | `src/components/input/Input.stories.tsx:1-268` |

**Notable findings:** Error state has no `aria-invalid`/`aria-describedby` hook of its own (P0 gap, though `TextField` compensates one layer up). The wrapper `<div>`'s class list ignores consumer `className` entirely — a genuine composability limitation on the component's primary visual chrome, distinct from Modal's "some parts locked" pattern. Zero interaction tests despite being the most-reused primitive in the system.

---

## 7. Modal

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Composite Component / Pattern** — 9-part compound dialog (`ModalDescription` documented but unimplemented, see below) | `src/components/modal/Modal.tsx:73-371` |
| 2 | Underlying primitive | `@radix-ui/react-dialog` (individual package) | `src/components/modal/Modal.tsx:2`; `package.json:151` |
| 3 | Ref forwarding | `Trigger`/`Close`/`Overlay`/`Content`/`Title` all forward refs to their respective Radix targets; `Body`/`Footer` forward to `HTMLDivElement` | `src/components/modal/Modal.tsx:94-96,140,161-163,211-213,299,330,357` |
| 4 | Polymorphism | Supported and actively used (`asChild` on `Trigger`/`Close`) | `src/components/modal/Modal.tsx:98,142`; `Modal.stories.tsx:61-63` |
| 5 | Controlled/uncontrolled | Fully delegated to Radix | `src/components/modal/Modal.tsx:14,73-75`; `Modal.stories.tsx:463-509` |
| 6 | Compound API | `Modal`, `Trigger`, `Portal`, `Close`, `Overlay`, `Content`, `Header`, `Title`, `Body`, `Footer` — **`ModalDescription` type exported and documented, component never implemented** (real bug) | `src/components/modal/Modal.tsx:20`; `index.ts:21` |
| 7 | Composition primitives | `Portal` (hardcoded inside `Content`), `forwardRef` throughout, `cn()` | `src/components/modal/Modal.tsx:119-121,218` |
| 8 | Styling override surface | `className` merged on every part; **but `Content` hardcodes its own `<Overlay />` internally with no passthrough** — a consumer cannot restyle the overlay through normal composition | `src/components/modal/Modal.tsx:170,223,268,306,334,364` vs `217-229` |
| 9 | Variant system | `tv({slots})`; `size: small \| medium \| large`, default **`small`** | `src/components/modal/Modal.styles.ts:4-73` |
| 10 | Boolean prop count | 1 (`showCloseButton`) | `src/components/modal/Modal.tsx:27-30,265,270` |
| 11 | Size variants | Yes — `small \| medium \| large` | `src/components/modal/Modal.tsx:12,22-25,214` |
| 12 | Loading state | None | — |
| 13 | Error/invalid state | None at component level; `ErrorModal` story is content composition, not a variant | `Modal.stories.tsx:594-630` |
| 14 | Disabled handling | N/A | — |
| 15 | Icon/adornment | No dedicated prop; documented children-composition pattern inside `Header` | `src/components/modal/Modal.tsx:250-262` |
| 16 | Semantic HTML/ARIA | Radix supplies `role="dialog"`/`aria-modal`; **`aria-label="Close dialog"` confirmed present** on the close button | `src/components/modal/Modal.tsx:271-278` |
| 17 | Keyboard interaction | Fully inherited (Escape closes, Tab cycles, focus trapped); verified by test | `Modal.stories.tsx:632-672` |
| 18 | Focus management | Close-button ring **confirmed present**; focus restore to trigger **confirmed via test**; async `aria-hidden` cleanup handled with `waitFor` | `src/components/modal/Modal.styles.ts:26-36`; `Modal.stories.tsx:663-670` |
| 19 | TypeScript API quality | Extensive `ComponentPropsWithoutRef<typeof X>` derivation; rich JSDoc; **defect: `ModalDescriptionProps` exported for a component that doesn't exist** | `src/components/modal/Modal.tsx:14-32`; defect at `:20` |
| 20 | Form integration | N/A directly; `TextField` commonly composed inside `Body`, no story wires a real `onSubmit` | `Modal.stories.tsx:176-214,416-458` |
| 21 | Animation/motion | `data-[state]`-driven fade+zoom, `duration-200`; no `prefers-reduced-motion` | `src/components/modal/Modal.styles.ts:5-25` |
| 22 | Storybook/test | 13 stories; **1 `play` test** (`InteractionOpenEscapeClose`) covering open→Escape→close→focus-restore→aria-hidden-cleanup | `Modal.stories.tsx:57-672` |

**Notable findings:** `ModalDescription` is documented in JSDoc `@example` blocks and its prop type is publicly exported, but the component was never implemented — following the documented usage verbatim throws a `ReferenceError`, and no `Modal` instance in the codebase wires `aria-describedby`, which likely surfaces Radix's own dev-console warning on every usage. JSDoc claims `size` defaults to `'medium'` and the `Default` story's copy says the same, but the actual code default is `'small'` (384px, not 500/560px) — a real doc/code drift. The overlay cannot be restyled through the standard `Content` composition path despite `ModalOverlay` being exported as if independently usable.

---

## 8. RadioGroup

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Simple Component** — 2-part compound (Group + Item) | `src/components/radioGroup/RadioGroup.tsx:45-109` |
| 2 | Underlying primitive | `@radix-ui/react-radio-group` (individual package) | `RadioGroup.tsx:2`; `package.json:153` |
| 3 | Ref forwarding | Both forward refs — `Root`→`div[role=radiogroup]`, `Item`→`button[role=radio]` | `RadioGroup.tsx:45-48,74-77` |
| 4 | Polymorphism | Correctly absent — Radix's own primitives don't expose `asChild` here | — |
| 5 | Controlled/uncontrolled | Fully delegated (`value`/`onValueChange`/`defaultValue`) | `RadioGroup.tsx:13,45-59` |
| 6 | Compound API | `RadioGroup`, `RadioGroupItem`; Radix `Indicator` used internally, not exposed | `RadioGroup.tsx:99-104` |
| 7 | Composition primitives | `forwardRef` ×2, `cn()`, `useMemo` ×2 | `RadioGroup.tsx:49,80-89` |
| 8 | Styling override surface | Full override on both Group and Item; selected-state icon (`MdCircle`) hardcoded, not swappable | `RadioGroup.tsx:49,82-87`; `:4,103` |
| 9 | Variant system | `tv()`; `variant: default \| error \| disabled` internally, public `RadioGroupItemVariant` = `default \| error` only (**confirmed correctly hardened**) | `RadioGroup.styles.ts:11-30`; `RadioGroup.tsx:8,78` |
| 10 | Boolean prop count | 0 hand-declared new booleans | `RadioGroup.tsx:18-21` |
| 11 | Size variants | None — fixed `size-4.5` | `RadioGroup.styles.ts:5` |
| 12 | Loading state | None | — |
| 13 | Error/invalid state | Visual only — no `aria-invalid` | `RadioGroup.styles.ts:17-20` |
| 14 | Disabled handling | Native `disabled` + internal style variant; focus ring correctly suppressed when disabled | `RadioGroup.tsx:78,96`; `RadioGroup.styles.ts:8,21-24` |
| 15 | Icon/adornment | N/A beyond the fixed selection dot | `RadioGroup.tsx:4,103` |
| 16 | Semantic HTML/ARIA | Radix `role="radiogroup"`/`role="radio"`; **no `<fieldset>`/`<legend>` grouping anywhere, including the "production" `FormExample` story** | `RadioGroup.stories.tsx:410` |
| 17 | Keyboard interaction | Fully inherited (Arrow keys, Space); verified by test | `RadioGroup.stories.tsx:526-568` |
| 18 | Focus management | `focus-visible:outline-2 outline-offset-2 outline-border-focus`, correctly suppressed on disabled | `RadioGroup.styles.ts:6-8` |
| 19 | TypeScript API quality | Idiomatic; JSDoc with examples; no `any` in component (one `as any` in Storybook meta only, low severity) | `RadioGroup.tsx:18-21,23-43`; `RadioGroup.stories.tsx:9` |
| 20 | Form integration | `name`/`value`/`required`/`disabled` native; label via manual `id`/`htmlFor` pairing | `RadioGroup.stories.tsx:399-524` |
| 21 | Animation/motion | N/A — static control | — |
| 22 | Storybook/test | 14 stories combined (`RadioGroup` + `RadioGroupItem`); **1 `play` test** (`InteractionSelectAndArrowNav`) | `RadioGroup.stories.tsx:91-568`; `RadioGroupItem.stories.tsx:59-163` |

**Notable findings:** No enforced `<fieldset>`/`<legend>` semantics anywhere, including the story meant to model production usage — a silent, untested gap against accessibility rules §7.6. Same visual-only error-state gap as `Input` (no `aria-invalid`). Selection-dot glyph is hardcoded with no theming hook.

> **Resolved (foundation capability implementation):** row 13's `aria-invalid` gap is fixed on `RadioGroupItem` — derived automatically from `effectiveVariant === 'error'`, mutation-tested, with a real-DOM Storybook `play()` assertion (`InteractionAriaInvalid`). Row 16's `<fieldset>`/`<legend>` gap is fixed at the documentation layer, not by a component code change: independent re-verification found Radix's `RadioGroupPrimitive.Root` (`role="radiogroup"`) already supports being wrapped in a native `<fieldset>`/`<legend>` with zero API additions — the actual gap was the missing example, now added as `RadioGroup.stories.tsx`'s `AccessibleFormFieldset` story.

---

## 9. Scrollbar

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Simple Component** (leans Composite via the exposed low-level `ScrollBarArea`) | `src/components/scrollbar/Scrollbar.tsx:1-121` |
| 2 | Underlying primitive | Radix `ScrollArea`, via the **unified `radix-ui` package** | `Scrollbar.tsx:2` |
| 3 | Ref forwarding | Both exports forward refs — `Scrollbar`→Root (`div`), `ScrollBarArea`→`ScrollAreaScrollbar` (`div`) | `Scrollbar.tsx:30-32,67` |
| 4 | Polymorphism | Absent | — |
| 5 | Controlled/uncontrolled | N/A — forwards Radix `type`/`scrollHideDelay`, no local state | `Scrollbar.tsx:6,84-89` |
| 6 | Compound API | 2 public pieces: high-level `Scrollbar`, low-level `ScrollBarArea` for manual composition | `index.ts:1`; `Scrollbar.tsx:30,67`; `Scrollbar.stories.tsx:244-265` |
| 7 | Composition primitives | `forwardRef`, Radix `Root`/`Viewport`/`ScrollAreaScrollbar`/`Thumb`/`Corner` | `Scrollbar.tsx:2-4,30-118` |
| 8 | Styling override surface | 4 named override props (`className`, `viewportClassName`, `scrollbarClassName`, `thumbClassName`) covering every visual part — the most granular override surface of any audited component | `Scrollbar.tsx:6-17,87,93-97,103-104,110-111` |
| 9 | Variant system | `tv()` slots + an explicit `orientation` **`variants` key** (added 2026-09-08) — thumb sizing is driven by `scrollbarStyles({ orientation })`, NOT `data-[orientation]:` selectors on the thumb, since Radix's `ScrollAreaThumb` never carries its own `data-orientation` attribute (only the track does) — see Notable Findings | `Scrollbar.styles.ts` |
| 10 | Boolean prop count | 2 (`showVertical`, `showHorizontal`) — no explosion | `Scrollbar.tsx:13-16` |
| 11 | Size variants | N/A — fixed thickness (12px track, 4px/8px-hover thumb, corrected 2026-09-08 to match Figma's measured spec; was 8px/4px-hover) | `Scrollbar.styles.ts` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | N/A | — |
| 14 | Disabled handling | N/A | — |
| 15 | Icon/adornment | N/A — `children` is the scroll content itself | `Scrollbar.tsx:71,90-100` |
| 16 | Semantic HTML/ARIA | No explicit role (Radix `ScrollArea` is ARIA-less by design); **`tabIndex={0}` fix confirmed present** on the viewport | `Scrollbar.tsx:92`; `Scrollbar.stories.tsx:248` |
| 17 | Keyboard interaction | Native scroll behavior once focusable; no custom key handler | `Scrollbar.tsx:92` |
| 18 | Focus management | **CORRECTED 2026-09-08** — this row previously said "confirmed correct," which was WRONG: the viewport had the same `outline-none` + bare `outline`/`outline-2` tailwind-merge collision found repeatedly elsewhere in this library, permanently suppressing the focus ring. The prior audit checked token/class *presence* in source, not actual computed style — this exact class of bug is invisible from source inspection alone. Fixed and verified via a real neutral browser + real keyboard `Tab` + `getComputedStyle()` | `Scrollbar.tsx`; `docs/components/scrollbar.md` §7 |
| 19 | TypeScript API quality | Fully derived from actual Radix primitive types; no `any`; JSDoc present | `Scrollbar.tsx:6-24,26-29,63-66` |
| 20 | Form integration | N/A | — |
| 21 | Animation/motion | `transition-colors` on the track; `transition-[width,height,background-color]` on the thumb (Figma's own guideline explicitly requires the hover-widen to animate, and the thumb previously had no transition at all); no `prefers-reduced-motion` (systemic, unrelated to this component alone) | `Scrollbar.styles.ts` |
| 22 | Storybook/test | 8 stories (2 with `play()`), including a regression story covering the focus-ring/track-width/thumb-width/hover-widen fixes (`userEvent.hover()`/`unhover()` on the track asserts the full 4px→8px→4px cycle) + `Scrollbar.test.tsx` (2 ref-forwarding tests, previously zero unit coverage). A real axe-core scan and a real-browser dark-mode contrast check were also run (2026-09-08 quality-improvement pass) — zero violations, all ratios pass — but neither is persisted as an automated/CI test | `Scrollbar.stories.tsx`; `Scrollbar.test.tsx` |

**Notable findings (updated 2026-09-08, two passes — Figma-fidelity audit then a quality-improvement pass):** The previously-flagged "dual style-source-of-truth" duplication (`tv()` slots vs. `ScrollBarArea`'s own inline defaults) no longer exists in current code — `ScrollBarArea` already consumes `scrollbarStyles()` as its single source. A far more severe, previously-undetected bug was found instead: the thumb's `data-[orientation=vertical]:w-1`/`hover:w-2`/etc. classes **never matched anything at all**, because Radix's `ScrollAreaThumb` element never sets its own `data-orientation` attribute (only the parent `ScrollAreaScrollbar` does) — confirmed via Radix's own source. The thumb's visible ~3-4px width came entirely from an unrelated `flex-1` (flex-basis:0%, flex-grow:1) filling leftover track space, meaning the intended hover-widen-to-8px behavior had never once worked in any shipped version. Additionally, Radix's `ScrollAreaThumb` always sets `width`/`height` via inline `style`, so even a correctly-scoped class needs `!important` to ever take effect — fixed by converting to an explicit `tv()` `variants: { orientation }` key (driven by the real `orientation` prop, not a CSS attribute selector) with `!`-suffixed size utilities. The hover-widen TRIGGER was then further corrected in the quality-improvement pass: Figma's own guideline specifies hovering the full 12px track ("Hit Area"), not just the thin 4px thumb, and a plain CSS `hover:` is untestable via `userEvent.hover()` (dispatches synthetic events without a real cursor move). Both issues were fixed together by tracking hover as real React state on the track's `onPointerEnter`/`onPointerLeave`, exposed to the thumb via `data-hovered` and styled with `data-[hovered=true]:` instead of `hover:`. See `docs/components/scrollbar.md` for full detail.

---

## 10. Snackbar

*(Composite: `Snackbar.tsx` + `ProgressBar.tsx` + `SnackbarAction.tsx` + `SnackbarWrapper.tsx` + `useSnackbar.tsx`. Internal architecture: `Snackbar` is the presentational leaf; `ProgressBar`/`SnackbarAction` are internal-only, not exported; `SnackbarWrapper` exports `SnackbarContainer`; `useSnackbar.tsx` exports the imperative `showSnackbar()` function — despite its filename, it is not a React hook.)*

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Composite Component / Pattern** — toast pattern: presentational component + imperative trigger + portal container | `Snackbar.tsx:105-177`; `useSnackbar.tsx:64-99`; `SnackbarWrapper.tsx:21-33` |
| 2 | Underlying primitive | **`sonner`** — not Radix. The bare `<Snackbar>` itself is plain native HTML | `SnackbarWrapper.tsx:2,23-32`; `useSnackbar.tsx:1,75-98` |
| 3 | Ref forwarding | `Snackbar`→`HTMLDivElement`, `SnackbarAction`→`HTMLButtonElement`, `ProgressBar`→`HTMLDivElement`; **`SnackbarContainer` has no `forwardRef`** | `Snackbar.tsx:105`; `SnackbarAction.tsx:21`; `ProgressBar.tsx:33`; `SnackbarWrapper.tsx:21` |
| 4 | Polymorphism | Absent across the family | — |
| 5 | Controlled/uncontrolled | The bare `Snackbar` has **no internal state at all** (pure presentational, `onClose` only); `showSnackbar()` delegates all lifecycle state to `sonner`'s internal store | `Snackbar.tsx:127-129`; `useSnackbar.tsx:75-98` |
| 6 | Compound API | Public: `showSnackbar`, `SnackbarContainer` + re-exported types. **`Snackbar` itself is not re-exported from `index.ts`** — cannot be imported from the package barrel | `index.ts:1-2` |
| 7 | Composition primitives | `forwardRef` (3 of 4 sub-components), `sonner`'s own portal/store, `useRef` for imperative DOM animation | `ProgressBar.tsx:1,36-37`; `SnackbarWrapper.tsx:2,23` |
| 8 | Styling override surface | Each of `Snackbar`/`SnackbarAction`/`ProgressBar` accepts/merges its own `className` (root only, no per-slot overrides); **`SnackbarContainer`/`showSnackbar()` expose no `className` at all** — positioning is hardcoded (`position="top-right"`) in `SnackbarWrapper` | `Snackbar.tsx:134`; `SnackbarWrapper.tsx:23-32` |
| 9 | Variant system | `tv({slots})`; single variant key `variant: info \| success \| error`. **Confirmed: no dead `container`/`position` machinery remains.** Two smaller dead-code items found instead: an unused `progressContainer` slot, and a `ProgressBarVariant` type including an unreachable `'warning'` member | `Snackbar.styles.ts:1-51`; `:31-33`; `ProgressBar.tsx:6,34-35` |
| 10 | Boolean prop count | 1 (`closable`) | `Snackbar.tsx:38-55` |
| 11 | Size variants | None | — |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | **Confirmed**: `variant === 'error'` → `role="alert"`, else `role="status"` — correctly satisfies accessibility rules §7.9 | `Snackbar.tsx:135` |
| 14 | Disabled handling | N/A | — |
| 15 | Icon/adornment | `icon?: ReactNode` override + structured `actions?: SnackbarActionConfig[]` (prop-driven array, not children-slot) | `Snackbar.tsx:49-62,123,138-139,28-33,151-160` |
| 16 | Semantic HTML/ARIA | Dynamic `role` per variant; close button is a real `<button>` with `aria-label="Close notification"` | `Snackbar.tsx:132-137,164-173` |
| 17 | Keyboard interaction | Native button semantics for close/action buttons; **no `Escape`-to-dismiss handler anywhere** | — |
| 18 | Focus management | **Real gap — the only interactive elements across all 17 components with no focus-visible ring at all.** Close button and action buttons have hover/active classes but zero `focus-visible:outline*` | `Snackbar.styles.ts:27-30,53-63` |
| 19 | TypeScript API quality | No `any`; `Omit<ComponentProps<'div'>, 'title'>` correctly avoids clashing with the native `title` attribute; rich JSDoc. **Type drift**: `ProgressBarVariant` includes `'warning'`, which `SnackbarVariant` doesn't have and `ProgressBar` is never invoked with | `Snackbar.tsx:38`; `ProgressBar.tsx:6` vs `Snackbar.tsx:9` |
| 20 | Form integration | N/A | — |
| 21 | Animation/motion | **Triple-stacked animation**: `sonner`'s own transition + a redundant 200ms Tailwind `animate-in` layered in `SnackbarWrapper`'s `toastOptions.className` + the `Snackbar` root's own 300ms `animate-in` slot — three systems for one visual effect. No `prefers-reduced-motion` anywhere | `Snackbar.styles.ts:5-10`; `SnackbarWrapper.tsx:28-30` |
| 22 | Storybook/test | 9 stories; **zero `play` tests** despite having the most complex state lifecycle (timers, sonner store, dismiss-on-action) of any audited component | `Snackbar.stories.tsx:1-481` |

**Notable findings:** **Architecturally, this is the library's clear outlier** — every other interactive/overlay component is Radix-based; Snackbar depends entirely on `sonner` for portaling, stacking, and timing, meaning its accessibility/keyboard guarantees are only as good as a third-party dependency this codebase doesn't own or test (`design.md:360` itself lists the components expected to be Radix-based, and Snackbar isn't a natural fit for that list, but the split is real and worth a deliberate architectural decision, not silent drift). `Snackbar` isn't part of the public barrel export. **Default `duration` confirmed at 4000ms** (hardening-pass change verified intact) in both `Snackbar.tsx:112` and `useSnackbar.tsx:69`. No focus ring on any interactive element — the most concrete accessibility finding in this entire matrix.

---

## 11. Switch

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Primitive** | `src/components/switch/Switch.tsx:43-77` |
| 2 | Underlying primitive | `@radix-ui/react-switch` (individual package — inconsistent with Scrollbar's unified-package choice) | `Switch.tsx:2` |
| 3 | Ref forwarding | Yes, resolves to a native `<button role="switch">` | `Switch.tsx:43` |
| 4 | Polymorphism | Absent | — |
| 5 | Controlled/uncontrolled | Full dual-mode support **plus** a local `uncontrolledChecked` state purely to drive visual styling consistently regardless of mode (`isChecked = checked ?? uncontrolledChecked`) — the most deliberate controlled/uncontrolled implementation among the primitives audited | `Switch.tsx:45,50-51,64-67` |
| 6 | Compound API | Single export | `index.ts:1` |
| 7 | Composition primitives | `forwardRef`, `useMemo`, `useState`, Radix `Root`/`Thumb` | `Switch.tsx:1-10,50,53-56,59-72` |
| 8 | Styling override surface | Root `className` only; **thumb has no override prop** (unlike Scrollbar's per-part override props) | `Switch.tsx:61,71` |
| 9 | Variant system | `tv({slots, variants, compoundVariants})`; `size: medium \| large`, `checked: true\|false`, `disabled: true`, plus 6 compound-variant combinations | `Switch.styles.ts:9,24-51,52-107` |
| 10 | Boolean prop count | 0 hand-declared new booleans (inherited `checked`/`defaultChecked`/`disabled`/`required`) | `Switch.tsx:18-21` |
| 11 | Size variants | Confirmed — `medium \| large`, default `medium` | `Switch.tsx:13,19-20,44`; `Switch.styles.ts:25-33` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | N/A (correct — a value-toggle control, not a validation-bearing input) | — |
| 14 | Disabled handling | Real native `disabled` + separate visual `tv()` variant | `Switch.tsx:45,68`; `Switch.styles.ts:45-50` |
| 15 | Icon/adornment | N/A | — |
| 16 | Semantic HTML/ARIA | Radix native `role="switch"` + `aria-checked` | `Switch.stories.tsx:284-290` |
| 17 | Keyboard interaction | Fully inherited (Space/Enter); verified by test | `Switch.stories.tsx:277-296` |
| 18 | Focus management | **Confirmed correct** — real `border-focus` token, 2px, offset-2; `disabled:focus-visible:outline-none` is redundant-but-harmless defensive CSS since a disabled native `<button>` leaves the tab order entirely | `Switch.styles.ts:15-16` |
| 19 | TypeScript API quality | Clean intersection type, no `Omit` needed, no `any`; JSDoc with multiple `@example`s | `Switch.tsx:12-21,23-41` |
| 20 | Form integration | Native passthrough via `...rest`; label via external `<label htmlFor>` convention | `Switch.tsx:69`; `Switch.stories.tsx:189-193` |
| 21 | Animation/motion | `transition-all duration-200`; no `prefers-reduced-motion` | `Switch.styles.ts:14,21` |
| 22 | Storybook/test | 9 stories; **2 `play` tests** (`InteractionToggle`, `InteractionDisabledBlocksToggle`) — **the strongest test coverage of the whole Scrollbar/Snackbar/Switch/Tab group** | `Switch.stories.tsx:1-4,277-313` |

**Notable findings:** The most mature component in its audit group — no P0/P1 gaps found; the prior focus-ring fix is verified correct and not merely superficially present. Minor: no per-part (`thumb`) style override, an inconsistency versus Scrollbar's granular override props. Compound-variant pixel geometry (`translate-x-[16px]` etc.) is uncommented, unlike the file's own `HOVER_SHADOW` constant, which does explain itself.

---

## 12. Tab (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`)

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Composite Component** — true 4-part compound API mirroring Radix's own | `Tabs.tsx:42-203` |
| 2 | Underlying primitive | `@radix-ui/react-tabs` (individual package) | `Tabs.tsx:2` |
| 3 | Ref forwarding | All 4 forward refs (`Tabs`/`List`/`Content`→`HTMLDivElement`, `Trigger`→`HTMLButtonElement`) | `Tabs.tsx:42,82,141,190` |
| 4 | Polymorphism | Not surfaced/documented, though type-inheritable via `ComponentProps<typeof X>` | `Tabs.tsx:9,63,103,171` |
| 5 | Controlled/uncontrolled | Fully delegated, **no local state at all** — cleaner than Switch's shadow-state pattern since Tabs doesn't need a visual mirror of state | `Tabs.tsx:9-18,42-52` |
| 6 | Compound API | 4 exports, complete and idiomatic | `index.ts:1`; `Tabs.tsx:42,82,141,190` |
| 7 | Composition primitives | `forwardRef`, low-value `useMemo` (the `tv()` call has no variant input, so this memoization is a near-no-op) | `Tabs.tsx:1,44,84,143,192` |
| 8 | Styling override surface | Each of the 4 parts independently overridable; inner `triggerContent` wrapper has no separate override | `Tabs.tsx:47,87,145-146,152,195` |
| 9 | Variant system | `tv({slots})` — **no `variants` key at all**; all state styling via `data-[state]`/pseudo-selectors | `Tab.styles.ts:1-41` |
| 10 | Boolean prop count | 0 hand-declared (native `disabled` inherited on `Trigger`) | `Tabs.tsx:9-18,63-68,103-108,171-176` |
| 11 | Size variants | None — fixed 40px height via padding math | `Tabs.tsx:27`; `Tab.styles.ts:32` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | N/A | — |
| 14 | Disabled handling | Native `disabled` forwarded to `Trigger`; CSS pseudo-class styling | `Tabs.tsx:142,153`; `Tab.styles.ts:16-18` |
| 15 | Icon/adornment | **Documentation/API drift**: JSDoc documents `badgeLabel`/`icon` as if they were real props — they do not exist on `TabsTriggerProps`; the only working mechanism is plain `children` composition | `Tabs.tsx:126,131` (doc) vs `:103-108` (actual type) vs `Tab.stories.tsx:81-89` (actual working pattern) |
| 16 | Semantic HTML/ARIA | Correct, fully Radix-supplied `tablist`/`tab`/`tabpanel` roles with no wrapper interference | `Tabs.tsx:87,150,195` |
| 17 | Keyboard interaction | Fully inherited (Arrow keys, roving tabindex, Home/End) | — |
| 18 | Focus management | Ring applied to the **inner `triggerContent` div** via a `group`/`group-focus-visible:` pattern, not the outer focused button itself — a structurally different approach from Switch/Scrollbar; visually correct but a literal deviation from "radius matches the target element's own" (§5.1); a secondary non-`focus-visible` `focus:pb-50` rule also fires on mouse-click focus | `Tab.styles.ts:9,12,31-35` |
| 19 | TypeScript API quality | No `any`; **the `badgeLabel`/`icon` JSDoc-vs-type drift is a real documentation-accuracy defect** | `Tabs.tsx:100-140` vs `103-108` |
| 20 | Form integration | N/A — navigation pattern, not a form control | — |
| 21 | Animation/motion | `transition-colors` only, no panel-switch animation; no `prefers-reduced-motion` | `Tab.styles.ts:14` |
| 22 | Storybook/test | 7 stories; **zero `play` tests** despite Tabs' keyboard-navigation surface being exactly the kind of behavior worth regression-testing | `Tab.stories.tsx:1-377` |

**Notable findings:** The `badgeLabel`/`icon` JSDoc-documented-but-nonexistent props are a concrete, fixable documentation defect that could mislead a consumer into writing code that doesn't type-check. `defaultValue` is required (not optional) on `TabsProps` even though Radix's own `Tabs.Root` supports a fully-controlled `value`-only usage without it — potentially over-constraining a valid Radix pattern. No interaction tests despite the arrow-key/roving-tabindex surface being directly comparable to what `Switch` already tests for.

---

## 13. TextField

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Composite Component** — label + `Input` + support/error text | `TextField.tsx:82-121` |
| 2 | Underlying primitive | Wraps the library's own `Input` (no Radix) | `TextField.tsx:2`; `Input.tsx:41-113` |
| 3 | Ref forwarding | Yes, `forwardRef<HTMLInputElement, TextFieldProps>` through to the native input | `TextField.tsx:57,98`; `Input.tsx:41,92` |
| 4 | Polymorphism | Absent | `TextField.tsx:12-29` |
| 5 | Controlled/uncontrolled | Pure passthrough, no internal value state | `TextField.tsx:71,108` |
| 6 | Compound API | None — single export | `index.ts:1` |
| 7 | Composition primitives | `forwardRef`, **`useFieldIds()`** — confirmed genuinely consumed, not hand-duplicated | `TextField.tsx:4,57,76-80` |
| 8 | Styling override surface | `className` reaches only `Input`'s inner element; the outer field-shell `<div>` is hardcoded | `TextField.tsx:83,100` |
| 9 | Variant system | **No `.styles.ts` of its own** — `TextFieldVariant` is a bare re-export of `InputVariant`; all real styling lives in `Input.styles.ts` | `TextField.tsx:7,75,99` |
| 10 | Boolean prop count | 1 (`required`) | `TextField.tsx:22` |
| 11 | Size variants | N/A — `size` `Omit`'d to avoid clashing with the native HTML attribute | `TextField.tsx:12` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | **Correctly wired**: `aria-invalid`, `aria-describedby` via `useFieldIds`, error block `id` matches | `TextField.tsx:76-80,104-105,116` |
| 14 | Disabled handling | Native passthrough to `Input` | `TextField.tsx:71,108` |
| 15 | Icon/adornment | `startAdornment`/`endAdornment` forwarded to `Input` | `TextField.tsx:24-26,106-107` |
| 16 | Semantic HTML/ARIA | `<label htmlFor={fieldId}>` + native input + explicit `aria-invalid`/`aria-describedby`/`required` | `TextField.tsx:85-95,103-105` |
| 17 | Keyboard interaction | Fully native | — |
| 18 | Focus management | Inherited from `Input`'s `focus-within` ring (not `focus-visible`) | `Input.styles.ts:6` |
| 19 | TypeScript API quality | `Omit<ComponentProps<'input'>, 'size'>` — **confirmed does NOT also omit `disabled`**; no `any`; full JSDoc | `TextField.tsx:12,9-11,31-55` |
| 20 | Form integration | Fully wired: `name`, `id→fieldId→htmlFor`, `required`, `descriptionId`/`errorId`→`aria-describedby` | `TextField.tsx:66-67,76-80,87,102-105` |
| 21 | Animation/motion | N/A | — |
| 22 | Storybook/test | 10 stories; **2 `play` tests** — `InteractionTyping` and `InteractionErrorWiring` (the latter explicitly asserts `aria-invalid`/`aria-describedby` resolve to the real error text) | `TextField.stories.tsx:303-334` |

**Notable findings:** The best-verified form-field component in the library — its ARIA wiring is both implemented correctly and covered by an interaction test that asserts the wiring, not just the visual result. Owns no visual styling of its own; is purely a "label + messages" shell around `Input`. Narrow style-override surface (only the leaf input, not the field shell).

---

## 14. Textarea

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Primitive** — explicitly documented foundation for `TextareaField` | `Textarea.tsx:19-20,32-55` |
| 2 | Underlying primitive | Native `<textarea>`; no Radix | `Textarea.tsx:45-52` |
| 3 | Ref forwarding | Yes, `forwardRef<HTMLTextAreaElement, TextareaProps>` | `Textarea.tsx:32,47` |
| 4 | Polymorphism | Absent | `Textarea.tsx:11-16` |
| 5 | Controlled/uncontrolled | Native passthrough via `...rest` | `Textarea.tsx:51` |
| 6 | Compound API | None | `index.tsx:1` |
| 7 | Composition primitives | `forwardRef`, `cn()`, `useId()`; correctly **does not** use `useFieldIds()` (no label/description concept at this layer) | `Textarea.tsx:1-2,37,40,46` |
| 8 | Styling override surface | Full override — single element, `cn(textareaStyles({variant}), className)` | `Textarea.tsx:40` |
| 9 | Variant system | `tv()`; `variant: default \| error \| disabled` internally, public `TextareaVariant` = `default \| error` | `Textarea.styles.ts:12-27`; `Textarea.tsx:6,38` |
| 10 | Boolean prop count | 0 hand-declared new booleans | `Textarea.tsx:11-16` |
| 11 | Size variants | None; **`min-w-[320px]`/`min-h-[100px]` are uncommented arbitrary brackets** | `Textarea.styles.ts:5,10` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | Visual only, correctly deferred to `TextareaField` | `Textarea.styles.ts:17-19` |
| 14 | Disabled handling | **Confirmed**: real native `disabled` boolean, drives `effectiveVariant` for styling | `Textarea.tsx:34,38,50` |
| 15 | Icon/adornment | **N/A — no adornment props at all**, an asymmetry versus `Input` | `Textarea.tsx:11-16` |
| 16 | Semantic HTML/ARIA | Plain `<textarea>`; Japanese default placeholder (`'テキストを入力'`) | `Textarea.tsx:34,45` |
| 17 | Keyboard interaction | Fully native | — |
| 18 | Focus management | **Correctly uses `focus-visible`** (unlike Input/TextField's `focus-within`), 3px offset per the "text element" spec | `Textarea.styles.ts:7` |
| 19 | TypeScript API quality | No `Omit` needed (no `size` clash); no `any`; JSDoc present | `Textarea.tsx:11-16,8-10,18-30` |
| 20 | Form integration | `id` via `useId()` fallback only; no label logic by design | `Textarea.tsx:37,46` |
| 21 | Animation/motion | `transition-colors duration-200`, not gated by `motion-safe`/`prefers-reduced-motion` | `Textarea.styles.ts:9` |
| 22 | Storybook/test | 7 stories; **zero `play` tests, zero `storybook/test` import** | `Textarea.stories.tsx:1-4` |

**Notable findings:** No adornment slot at all, unlike its sibling primitive `Input` — a real API asymmetry between the library's two leaf text-entry primitives. Zero automated test coverage — the only gap found on an otherwise clean, correctly-hardened component. Uncommented arbitrary-bracket sizing values.

---

## 15. TextareaField

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Composite Component** — label + `Textarea` + support/error text + character counter | `TextareaField.tsx:98-147` |
| 2 | Underlying primitive | Wraps the library's own `Textarea` | `TextareaField.tsx:2` |
| 3 | Ref forwarding | Yes, through to the native `<textarea>` | `TextareaField.tsx:56,114`; `Textarea.tsx:47` |
| 4 | Polymorphism | Absent | `TextareaField.tsx:12-27` |
| 5 | Controlled/uncontrolled | Both supported, **plus** an internal `textLength` state (`useState`+`useEffect`) purely to drive the character counter | `TextareaField.tsx:68-70,76-89,122-125` |
| 6 | Compound API | None | `index.ts:1` |
| 7 | Composition primitives | `forwardRef`, `useState`/`useEffect` (counter), **`useFieldIds()`** — byte-for-byte identical call shape to `TextField`'s, confirming genuinely shared infrastructure | `TextareaField.tsx:1,4,92-96` |
| 8 | Styling override surface | `className` reaches only the `<Textarea>` box; outer shell and counter/error row hardcoded | `TextareaField.tsx:99,116,133` |
| 9 | Variant system | **No `.styles.ts` of its own** — `TextareaFieldVariant` re-exports `TextareaVariant` | `TextareaField.tsx:7,91,115` |
| 10 | Boolean prop count | 1 (`required`) | `TextareaField.tsx:22` |
| 11 | Size variants | N/A — `size` `Omit`'d but vestigial (native `<textarea>` has no `size` attribute to clash with) | `TextareaField.tsx:12` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | Correctly wired, identical pattern to `TextField` | `TextareaField.tsx:92-96,120-121,135` |
| 14 | Disabled handling | Implicit passthrough via `...rest`, not separately documented in the component's own JSDoc list (though present in Storybook argTypes) | `TextareaField.tsx:72,126`; `TextareaField.stories.tsx:19-23` |
| 15 | Icon/adornment | N/A (Textarea has none to forward) | `TextareaField.tsx:12-27` |
| 16 | Semantic HTML/ARIA | `<label htmlFor>` + `aria-invalid`/`aria-describedby`/`required`; **character counter has no `aria-live` region** — no announcement as the count changes | `TextareaField.tsx:101-111,119-121,140-144` |
| 17 | Keyboard interaction | Fully native | — |
| 18 | Focus management | Inherited from `Textarea`'s correct `focus-visible` ring | `Textarea.styles.ts:7` |
| 19 | TypeScript API quality | `Omit<ComponentProps<'textarea'>, 'size'>` confirmed does not also omit `disabled`; no `any`; full JSDoc | `TextareaField.tsx:12,9-27,29-54` |
| 20 | Form integration | Identical to `TextField`'s wiring via `useFieldIds` | `TextareaField.tsx:66-67,92-96,103,119-121` |
| 21 | Animation/motion | Inherits `Textarea`'s ungated transition | `Textarea.styles.ts:9` |
| 22 | Storybook/test | 11 stories; **zero `play` tests** — unverified despite sharing `TextField`'s exact ARIA-wiring pattern, which *is* tested there | `TextareaField.stories.tsx:1-2` |

**Notable findings:** `useFieldIds()` usage is confirmed genuinely shared (identical call shape to `TextField`), not hand-duplicated — the outer field-shell markup (`<div>`+`<label>`+required-badge classes), however, *is* duplicated verbatim between `TextField.tsx` and `TextareaField.tsx`, a legitimate extraction candidate not yet acted on. Character counter lacks `aria-live`. No interaction tests despite sharing an ARIA pattern that is tested one file over.

---

## 16. Tooltip

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Pattern / Composite Component** (borderline) — a documented, fixed 4-part composition recipe | `Tooltip.tsx:63-76` |
| 2 | Underlying primitive | `@radix-ui/react-tooltip` (**individual package** — inconsistent with `DatePicker`'s unified-package choice) | `Tooltip.tsx:1`; `package.json:156` |
| 3 | Ref forwarding | `Trigger`/`Content` forward refs; `Tooltip`/`TooltipProvider` correctly have none (match Radix's own Root/Provider shape) | `Tooltip.tsx:120-125,161-195,32-44,87-89` |
| 4 | Polymorphism | Yes — `TooltipTrigger` **deliberately flips Radix's own default**, defaulting `asChild=true` "for accessibility" | `Tooltip.tsx:101,123` |
| 5 | Controlled/uncontrolled | Both, pure Radix passthrough | `Tooltip.tsx:10,87-89`; `Tooltip.stories.tsx:450-484` |
| 6 | Compound API | 4 exports, all public, all in one file (no internal-only sub-files) | `Tooltip.tsx:32,87,120,161`; `index.ts:1` |
| 7 | Composition primitives | `forwardRef`, Radix `Portal`, `cn()` | `Tooltip.tsx:166,170` |
| 8 | Styling override surface | Full — `className` merged via `cn()` | `Tooltip.tsx:170-183` |
| 9 | Variant system | **No `.styles.ts` at all** — the only audited component with zero `tv()`/CVA usage (justified: no real variants exist) | `Tooltip.tsx:170-183` |
| 10 | Boolean prop count | 0 — all 4 prop types are bare Radix `ComponentProps` aliases | `Tooltip.tsx:9-12` |
| 11 | Size variants | N/A — fixed `max-w-60` | `Tooltip.tsx:172` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | N/A | — |
| 14 | Disabled handling | N/A at the Tooltip level; documented workaround (wrap disabled triggers in `<span>`) since disabled elements don't fire the events tooltips need | `Tooltip.stories.tsx:345-370` |
| 15 | Icon/adornment | N/A — `Content` just renders `children` | `Tooltip.tsx:186` |
| 16 | Semantic HTML/ARIA | Radix `role="tooltip"`; **confirmed the duplicate visually-hidden accessible-name span still exists** by design (Radix's own fallback mechanism) | `Tooltip.stories.tsx:513-524` |
| 17 | Keyboard interaction | Fully inherited (shows on focus, Escape dismisses); verified by test | `Tooltip.stories.tsx:496-532` |
| 18 | Focus management | `Content` has no ring (correct — non-interactive); `Trigger` inherits whatever ring the wrapped child defines via `asChild` merging | — |
| 19 | TypeScript API quality | All 4 types are direct Radix aliases, no custom fields, no `any`; extensive JSDoc | `Tooltip.tsx:9-12,18-31,52-86,97-119,133-160` |
| 20 | Form integration | N/A | — |
| 21 | Animation/motion | `data-[state]`-driven fade; no `prefers-reduced-motion` gating | `Tooltip.tsx:177-181` |
| 22 | Storybook/test | 14 stories; **1 `play` test** (`InteractionFocusShowEscapeHide`) using a custom `isElementVisible()` helper, specifically required because Radix renders the tooltip text twice (visible + visually-hidden accessible-name fallback) | `Tooltip.stories.tsx:491-532` |

**Notable findings:** Confirms a real, repo-wide **Radix packaging inconsistency**: this component uses the individual `@radix-ui/react-tooltip` package while `DatePicker`'s Popover/Slot use the unified `radix-ui` meta-package — both are present as dependencies, evidencing an in-progress, undecided migration. No `prefers-reduced-motion` gating on the fade. The `isElementVisible()` test helper is a deliberate, well-documented workaround, not an accidental test artifact.

---

## 17. DatePicker

*(Composite: `DatePicker.tsx` + `DatePickerBase.tsx` + `DatePickerButton.tsx` + `DatePickerDayButton.tsx` + `DatePickerPopover.tsx`. Only `DatePicker` is publicly exported; the other 4 files are internal-only.)*

> **Update 2026-10-07 (Figma alignment, breaking):** rows 3/8/13/15/16/17/20 are superseded. The trigger is now a Text Field (`inputStyles`) with typed date entry — single: one `<input>`; range: start/end `<input>`s in a named `role="group"` — plus a calendar `Button` (Radix `Popover.Trigger`); `ref` → the (start) input (`HTMLInputElement`); `className` → the field wrapper; `aria-invalid` now also shows the error border (row 13); `id`/`htmlFor` reach the input (row 20; still no `name`/native form submission). Range clicks follow Figma's control flow via the internal `dateLogic.ts` (shared with `Calendar`). See `docs/components/datePicker.md` §4.2–4.3.

| # | Dimension | Rating / Finding | Evidence |
|---|---|---|---|
| 1 | Category | **Composite Component with internal Pattern-style architecture** — 5 sub-files collapsed into 1 public export | `DatePicker.tsx:125-389`; `index.ts:1` |
| 2 | Underlying primitive | `react-day-picker` v9 for the calendar; `Intl.DateTimeFormat`/native `Date` for formatting; Radix via the **unified `radix-ui` package** for `Popover`/`Slot` | `DatePicker.tsx:4,74-79`; `DatePickerPopover.tsx:1`; `DatePickerButton.tsx:2` |
| 3 | Ref forwarding | `DatePicker`, `DatePickerButton`, `DatePickerDayButton`, both `DatePickerPopover*` all forward refs; **`DatePickerBase` — the only sub-file in the entire audit without `forwardRef`** (low practical impact, internal-only) | `DatePicker.tsx:125,256`; `DatePickerButton.tsx:29`; `DatePickerDayButton.tsx:10-12`; `DatePickerPopover.tsx:10-21`; `DatePickerBase.tsx:12-20` |
| 4 | Polymorphism | **Yes** — `DatePickerButton` supports `asChild` via `Slot.Root` from the unified `radix-ui` package, used internally to merge the trigger button into `Popover.Trigger` | `DatePickerButton.tsx:2,26,31,34-40`; `DatePicker.tsx:254-279` |
| 5 | Controlled/uncontrolled | Full support **plus a third "draft" state layer** (`isControlled`/`internalValue`/`draftValue`) for the staged-selection Apply/Cancel flow — the most complex state management of any audited component | `DatePicker.tsx:149-151,167-178,247-250` |
| 6 | Compound API | Internally 5 parts; **publicly none** — only `DatePicker` is exported | `index.ts:1`; `DatePicker.tsx:5-12` |
| 7 | Composition primitives | `forwardRef` (4/5 files), Radix `Slot`, Radix `Portal`, react-day-picker's own `components` slot-override system (`DayButton`/`MonthCaption`/`Root`/`Nav`/`Chevron`/`WeekNumber`/`Weekday`); **no `useFieldIds()`** — DatePicker has no `label`/`error`/`supportText` props | `DatePickerBase.tsx:100-153`; `DatePicker.tsx:310-312,337-339,23-61` |
| 8 | Styling override surface | Public `className` reaches only the trigger button; popover content/calendar grid/day buttons/action bar are all hardcoded with no dedicated override props | `DatePicker.tsx:134,264,285,287,296-309,322-336,345-380` |
| 9 | Variant system | Only `DatePickerButton` uses `tv()`, with **no `variants` key** (fixed base styling). `DatePicker`/`DatePickerBase` have no `.styles.ts` at all | `DatePickerButton.tsx:7-23`; `DatePickerBase.tsx:37-99` |
| 10 | Boolean prop count | **2 explicit** (`disabled`, and `actions` when passed the literal `false`) — the 2026-09-07 breaking-change audit collapsed `showActions`/`showTodayAction`/`showClearAction`/`showApplyAction` into `actions?: boolean \| { today?, clear?, apply? }` | `DatePicker.tsx` |
| 11 | Size variants | No design `size`; `numberOfMonths?: number` controls layout width | `DatePicker.tsx:47` |
| 12 | Loading state | N/A | — |
| 13 | Error/invalid state | **N/A — no `error`/invalid concept at all**, a real gap versus `TextField`/`TextareaField`/`Textarea` | `DatePicker.tsx:23-61` |
| 14 | Disabled handling | Native `disabled` + dedicated `disabled:` classes + a manual icon-color branch (icon isn't itself a button) | `DatePicker.tsx:35,258,263,277`; `DatePickerButton.tsx:15`; `DatePickerDayButton.tsx:28` |
| 15 | Icon/adornment | A single **fixed** `CalendarIcon`, not configurable — no `startAdornment`/`endAdornment`, an asymmetry versus `Input`/`TextField` | `DatePicker.tsx:3,275-278` |
| 16 | Semantic HTML/ARIA | Real `<button type="button">` trigger; **`aria-label="日付選択カレンダー"` confirmed still present**; `Weekday` correctly renders a non-focusable `<th><span>` with an explanatory comment; `MonthCaption`'s `calendarMonth` DOM-leak fix confirmed present | `DatePicker.tsx:255-257,284`; `DatePickerBase.tsx:139-151,159-166` |
| 17 | Keyboard interaction | Calendar grid navigation fully inherited from react-day-picker; month prev/next hand-assembled using react-day-picker's own `useDayPicker()` hooks (not reimplemented from scratch); Popover Escape/click-outside inherited from Radix | `DatePickerBase.tsx:159-236` |
| 18 | Focus management | **Both trigger and day-cell buttons confirmed correct** — real `border-focus` token, `offset-2`, no stray `outline-none` anywhere | `DatePicker.tsx:262`; `DatePickerButton.tsx:21` |
| 19 | TypeScript API quality | **`modifiers: any` on `DatePickerDayButtonProps` — unjustified `any`, no comment**, violates the codebase's TypeScript-strictness rule; otherwise well-typed with deliberate, well-reasoned `Omit`s | `DatePickerDayButton.tsx:7`; `DatePicker.tsx:58-61,24-57` |
| 20 | Form integration | **None** — no `name`, no `htmlFor`, no `label`, no hidden input for native form submission; the clear outlier versus the text-field family despite functioning as a de facto form input in practice | `DatePicker.tsx:23-61` |
| 21 | Animation/motion | Richest animation set of any component (fade + zoom + 4 directional slides keyed on `data-[side]`); no `prefers-reduced-motion` gating | `DatePickerPopover.tsx:30` |
| 22 | Storybook/test | 7 stories; **1 `play` test** (`InteractionSelectToday`) — a genuine end-to-end open→select→apply flow using Japanese accessible names | `DatePicker.stories.tsx:172-193` |

**Notable findings — the highest-severity findings in this entire matrix:**
- **Leftover shadcn/default Tailwind tokens confirmed non-existent in this design system** inside the `dropdown_root` classNames block (`has-focus:border-ring`, `border-input`, `has-focus:ring-ring/50`, `ring-[3px]`, `rounded-md`, plus ad hoc `text-sm font-medium`/`text-sm`) — `grep` against `scripts/global.css` confirms none of these tokens exist in generated CSS. This violates design-foundation.md §1 (semantic-only color, P0), §2 (`typo-*` only, P0), and §3 (numeric-scale radius, P0). Only reachable when `captionLayout` is `dropdown`/`dropdown-months`/`dropdown-years` (default is `label`), so it's currently dormant but shipped and reachable via `calendarProps`.
- Two occurrences of uncommented `w-[2.5rem] h-[2.5rem]` arbitrary brackets using the identical value — a strong signal a numeric-scale token should exist for this size.
- A locale inconsistency: `formatMonthDropdown`'s default locale is `'default'`, while the rest of the component explicitly uses `'ja-JP'` — only reachable in the same dormant dropdown-caption-layout path.
- `modifiers: any` is an unjustified strictness violation.
- 5 booleans on `DatePickerProps`, 3 of them conditionally meaningful — the clearest prop-explosion candidate in the matrix.
- No `error` prop and no native form integration — the two most consequential API gaps versus the text-field family, despite this component's real-world usage being overwhelmingly form-adjacent.

---

## Cross-component summary

| Component | Category | Primitive dependency | Polymorphism | Compound API | Error/`aria-invalid` | Focus ring | Test coverage |
|---|---|---|---|---|---|---|---|
| Badge | Simple | native | No | No | Visual only | N/A | 0 interaction |
| Button | Simple | native | **No** | No | N/A | Yes (correct) | 2 interaction |
| Checkbox | Primitive | Radix (individual) | Type-only, broken | No | **No aria-invalid** | Yes (correct) | 2 interaction |
| Divider | Primitive | native | No | No | N/A | N/A | 0 interaction |
| DropdownMenu | Composite/Pattern | Radix (individual) | Transitive | Partial (2 non-functional) | N/A | **Gap (bg-only)** | 1 interaction |
| Input | Primitive | native | No | No | **No aria-invalid** | Yes (`focus-within`) | 0 interaction |
| Modal | Composite/Pattern | Radix (individual) | Yes | Yes (1 missing component) | N/A | Yes (correct) | 1 interaction |
| RadioGroup | Simple | Radix (individual) | Correctly N/A | Yes (2-part) | **No aria-invalid** | Yes (correct) | 1 interaction |
| Scrollbar | Simple | Radix (unified) | No | Yes (2-part) | N/A | Yes (correct) | 0 interaction |
| Snackbar | Composite/Pattern | **sonner (non-Radix)** | No | Partial (root not exported) | Yes (correct) | **No ring at all** | 0 interaction |
| Switch | Primitive | Radix (individual) | No | No | N/A | Yes (correct) | 2 interaction |
| Tab | Composite | Radix (individual) | Type-only | Yes (4-part) | N/A | Yes (non-standard target) | 0 interaction |
| TextField | Composite | native (wraps Input) | No | No | **Yes, correct + tested** | Yes (`focus-within`) | 2 interaction |
| Textarea | Primitive | native | No | No | N/A (deferred) | Yes (`focus-visible`, correct) | 0 interaction |
| TextareaField | Composite | native (wraps Textarea) | No | No | Yes, correct (untested) | Yes (correct) | 0 interaction |
| Tooltip | Pattern/Composite | Radix (individual) | Yes (flipped default) | Yes (4-part) | N/A | N/A | 1 interaction |
| DatePicker | Composite/Pattern | react-day-picker + Radix (unified) | Yes | No (internal only) | **N/A — missing entirely** | Yes (correct) | 1 interaction |

**Systemic patterns visible only at this cross-component level** (elaborated with full findings, severity, and recommendations in the companion audit report):

1. **`prefers-reduced-motion` is entirely absent from the codebase** — every one of the 9 components that animates (`Checkbox`, `DropdownMenu`, `Modal`, `Snackbar`, `Switch`, `Tab`, `Tooltip`, `DatePicker`, plus `Scrollbar`'s hover transition) is affected equally. This is the single highest-leverage systemic fix available (one global CSS rule), not a per-component one.
2. **Radix packaging is split between the individual `@radix-ui/react-*` packages and the unified `radix-ui` meta-package**, with no apparent decision rule — `Checkbox`/`Switch`/`Tab`/`RadioGroup`/`Modal`/`DropdownMenu`/`Tooltip` use individual packages; `Scrollbar`/`DatePicker` use the unified package. Both are dependencies simultaneously.
3. **`asChild`/polymorphism coverage is inconsistent and undocumented** — present and load-bearing on `Modal`/`Tooltip`/`DatePicker`; type-permitted-but-non-functional on `Checkbox`/`Tab`; entirely absent on `Button` (arguably the highest-value place for it to exist and currently isn't).
4. **Public/internal `.styles.ts` variant keys diverge from public prop types** in the same shape across `Checkbox`, `Input`, `Textarea`, `RadioGroup` — an internal `'disabled'` `tv()` variant that is never assignable through the public `variant` prop. Consistent, so likely intentional, but undocumented as a convention.
5. **`aria-invalid`/`aria-describedby` wiring for error states exists only in the `TextField`/`TextareaField` layer** — `Checkbox`, `Input`, `RadioGroup` all have a visual-only `error` variant with no ARIA signal, and `DatePicker` has no error concept at all.
6. **Test coverage is markedly uneven**: `Switch`, `TextField`, `Button`, `Checkbox` each have 2 `play` tests; `Badge`, `Divider`, `Input`, `Scrollbar`, `Snackbar`, `Tab`, `Textarea`, `TextareaField` have zero — several of these (`Scrollbar`'s keyboard fix, `Snackbar`'s lifecycle, `TextareaField`'s shared ARIA wiring) are components with a specific, known-fragile behavior that a regression test would directly protect.
7. **Public barrel-export conventions are inconsistent**: `Snackbar` withholds its main presentational component from `index.ts`; `DropdownMenu` exports two non-functional compound pieces (`Sub`, `RadioGroup`); `DatePicker` withholds all 4 of its internal sub-parts (arguably correct, given their internal-only nature) — there is no single stated policy for "what counts as public" across the library.
