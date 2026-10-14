<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Input` — Component Specification

## 1. Identity

- **Figma component name:** N/A — no Code Connect mapping exists (`src/components/input/` has no `Input.figma.ts`). Figma's "Text Field" component (node `610-2971`, see `docs/components/textField.md`) maps to `TextField`, which renders `Input` internally.
- **Figma file:** N/A — no Figma node is attributed to `Input` itself in source.
- **Figma node/component URL:** None in source; not inspected for this spec.
- **Code name:** `Input`
- **Package export:** `@sun-asterisk/nova/input` (and root). Public types: `InputProps`, `InputVariant`.
- **Category:** Primitive — native `<input>`, no Radix; documented foundation for `TextField` (`component-capability-matrix.md` §6).

## 2. Status

- **Lifecycle status:** Verified (CLAUDE.md §36 — unit, type-contract and Storybook tests exist and pass; not `/test`-certified).
- **Last verified:** 2026-09-29 — `pnpm exec vitest run --project unit src/components/input` (9/9), `--project storybook` (10/10 stories), `--project api test/api/input.test-d.tsx` (no type errors). Not via `/test`.
- **Owner/last touched by:** Spec written retroactively (no Workflow C/D run), 2026-09-29.

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Wrapper | `<div>` | none | Carries all chrome: border, background, radius, 40px height, `focus-within` ring. Customized via `classNames.wrapper` |
| 2 | Start adornment | `<div>` (only when `startAdornment` is set) | none | Absolutely positioned `left-3`, `pointer-events-none` (clicks pass through to the input). `classNames.startAdornment` |
| 3 | Input | native `<input>` | `textbox` (or per `type`) | Receives `ref`, `className`, and all native attributes. Transparent background, `outline-none` (the ring lives on the wrapper) |
| 4 | End adornment | `<div>` (only when `endAdornment` is set) | none | Absolutely positioned `right-3`, **interactive** (no `pointer-events-none`) so it can host a real button. `classNames.endAdornment` |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `variant` | `InputVariant` (`'default' \| 'error'`) | `'default'` | No | Visual status only — does **not** set `aria-invalid` | §3, §5 |
| `startAdornment` | `ReactNode` | — | No | Leading element; adds `pl-[44px]` to the input (sized for a 24px icon) | — |
| `endAdornment` | `ReactNode` | — | No | Trailing element; adds `pr-[44px]` | — |
| `classNames` | `{ wrapper?; startAdornment?; endAdornment? }` | — | No | Per-part classes; `className` reaches only the leaf `<input>` | §8 (classNames slot API) |
| `placeholder` | `string` | `'テキストを入力'` | No | Japanese fallback placeholder when none is given | — |
| `disabled` | `boolean` | — | No | Native disabled + internal `disabled` style bucket, overriding `variant` | §2 |

Extends `ComponentProps<'input'>` (all native attributes, controlled/uncontrolled via `value`/`defaultValue`/`onChange`). Ref type: `HTMLInputElement` (asserted in `test/api/input.test-d.tsx` and `Input.test.tsx`).

## 5. Composition & Customization

- **Compound API vs. `classNames`:** `classNames` — three parts (wrapper + two adornment slots), consistent with the §8 slot convention used by Switch/TextField/TextareaField/Snackbar. A compound API was not introduced.
- **`asChild`:** Not applicable — no evidence of need.
- **Internal parts a consumer can realistically reach without forking:** All four parts (wrapper/adornments via `classNames`, input via `className`).

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Default | `border-sds-border-strong`, `bg-sds-background-base`, `typo-body-l`, 40px tall | Native typing | Native textbox | tv `default` variant | `Default` story |
| Focus (focus-within) | 2px `border-focus` outline, 2px offset (Figma Text Field Focus Ring, 2026-10-05), on the wrapper; border → `border-sds-border-focus` | — | Native focus on `<input>` | `focus-within:outline-*` on wrapper (hand-written, not `FOCUS_RING_OFFSET_3` — see §13) | `InteractionFocusRing` story (real Tab + `getComputedStyle` on wrapper: solid, 2px) |
| Error | `border-sds-border-danger` only | Unchanged | **No `aria-invalid`** unless the consumer passes it (TextField does) | `variant="error"` | `ErrorState` story; `Input.test.tsx` (disabled-overrides-error) |
| Disabled | `bg-sds-surface-disabled`, `text-sds-text-disable`, `border-sds-border-disable`, `cursor-not-allowed` on wrapper, input and both adornments | Native `disabled` | `disabled` attribute | `effectiveVariant = disabled ? 'disabled' : variant` | `Input.test.tsx` (2 tests); `DisabledState` story |
| With adornments | Input padding switches from 12px to 44px on the adorned side | Start adornment click-through; end adornment interactive | Adornments carry no semantics of their own | conditional classes | `Input.test.tsx` padding + pointer-events tests; `PasswordField` story (real toggle button, `aria-pressed`) |

Hover (not disabled): background `surface-subtle-hover` (5% black / 5% white in dark) — Figma Text Field `State=Hover`, both `Status` values. Before 2026-10-05 there was no visible hover change.

## 7. Design Tokens — Figma Traceability

No Figma source is attributed to Input in code; values below are what the source uses.

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Height 40px | Not documented | `h-[40px]` (arbitrary, uncommented) | `Input.styles.ts` base | `AllStates` | none |
| Horizontal padding 12px / 44px with adornment | Not documented (LOGIC-INPUT-02 documents the 24px-icon contract) | `pl-[12px] pr-[12px]`, `pl-[44px]`/`pr-[44px]` (arbitrary) | `Input.tsx` | `WithBothIcons` | `Input.test.tsx` padding test |
| 24px adornment icons | JSDoc sizing contract | `[&_svg]:w-[24px] [&_svg]:h-[24px]` | `Input.styles.ts` | `WithStartIcon` | none |
| Typography | — | `typo-body-l` | base | — | none |
| Radius | — | `rounded-sds-100` | base | — | none |
| Colors | — | `sds-border-strong`, `sds-background-base`, `sds-text-primary`, `sds-text-placeholder`, `sds-border-focus`, `sds-border-danger`, `sds-surface-disabled`, `sds-text-disable`, `sds-border-disable` | `Input.styles.ts` | `AllStates` | none |
| Focus ring 2px / offset 2px | Figma Text Field `Focus Ring` (stroke OUTSIDE, 2px outside the field, radius 6 = 4 + 2) — Figma overrides the "text element → 3px" default (`design-foundation.md` §5.1: check Figma, don't assume) | `focus-within:outline-2 outline-offset-2 outline-sds-border-focus` | base | `InteractionFocusRing` | story `play()` |

## 8. Accessibility

- **Semantic element / role:** Native `<input>`.
- **Accessible name:** Consumer-supplied (`<label htmlFor>`, `aria-label`) — Input renders no label. `placeholder` is not a label (and a default one is always present).
- **Keyboard interactions:** Native.
- **Focus management:** Ring on the wrapper via `:focus-within` (so it surrounds the adornments), verified via real Tab + `getComputedStyle()`. Because it is `focus-within`, not `focus-visible`, the ring also shows on mouse click — expected for text inputs.
- **Disabled semantics:** Native `disabled`.
- **Screen reader behavior:** Error is visual-only at this layer; pass `aria-invalid`/`aria-describedby` yourself, or use `TextField`.
- **Adornments:** Icons are not given `aria-hidden` by Input; an interactive end adornment must be a real `<button>` with an accessible name (see `PasswordField`).

## 9. Theming

- **Light/dark behavior:** Semantic tokens only. `!text-sds-text-primary`/`!text-sds-text-disable` use `!important`.
- **Verification method used:** Not verified in dark mode for this spec.

## 10. Market Benchmark

`market-benchmark.md`: slot-level customization for Input (addressed — `classNames` exists; `remediation-matrix.md` Improvement #5/#6 FIXED); error-state unification lists Input's `variant='error'` (open); `size` prop family lists Input (DEFERRED pending Figma confirmation).

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| No slot customization (wrapper/adornments unreachable) | Market benchmark (market benchmark), `remediation-matrix.md` #5/#6 | Fixed — `classNames` | `Input.test.tsx` "applies classNames…"; `test/api/input.test-d.tsx` |
| LOGIC-INPUT-02: fixed 44px adornment padding overlaps wider content | Logic audit | Documented in JSDoc, no code change | `Input.test.tsx` padding test (asserts current contract) |
| LOGIC-INPUT-03: `PasswordField` story's fake toggle | Logic audit | Fixed — real button with `aria-pressed` | `PasswordField` story `play()` |
| LOGIC-INPUT-01: `useMemo` invalidated per render by adornment identity | Logic audit | Obsolete — current `Input.tsx` has no `useMemo` | n/a |
| LOGIC-DUP-02: Input has no id fallback, Textarea does | Logic audit | Open (asymmetry remains) | n/a |
| `transition-colors` outline-color flash risk | `Input.styles.ts` comment | Scoped preventively to `transition-[background-color,border-color]`; not re-verified with a timing test | none — gap |

## 12. Examples

```tsx
// Labelled search input
<label htmlFor="search" className="sr-only">Search projects</label>
<Input id="search" type="search" placeholder="Search projects" startAdornment={<MdSearch aria-hidden />} />

// Interactive end adornment must be a real button
<Input
  type={visible ? 'text' : 'password'}
  aria-label="Password"
  endAdornment={
    <button type="button" aria-label={visible ? 'Hide password' : 'Show password'} aria-pressed={visible} onClick={toggle}>
      {visible ? <MdVisibilityOff /> : <MdVisibility />}
    </button>
  }
/>

// Error at the primitive layer: wire the ARIA yourself (or use TextField)
<Input variant="error" aria-invalid aria-describedby="email-error" aria-label="Email" />
```

## 13. Known Limitations

- **Figma alignment 2026-10-05.** Fixed against Figma `Text Field` (`610:2971`): (1) **placeholder color was never applied** — `placeholder:text-sds-text-placeholder` sat on the wrapper `<div>` (no `::placeholder`), so the browser default (50% of the text color) showed; now on the `<input>`; (2) hover background `surface-subtle-hover`; (3) adornment icons `icon-secondary`, start adornment `icon-danger` in error, `icon-disable` when disabled (previously inherited `text-primary`); (4) focus offset 3px → 2px; (5) resting background `surface-base` (Figma's token; same value as `background-base` in both themes).

- `variant="error"` does not set `aria-invalid` (Checkbox/RadioGroupItem derive it; Input does not). Use `TextField` or pass it explicitly.
- The focus ring is hand-written (`focus-within:outline-*`) instead of `FOCUS_RING_OFFSET_3` — a structural need (the ring must live on the wrapper via `:focus-within`), but `design-foundation.md` §5.1 lists only Tabs and DropdownMenu as documented exceptions, and `focusRing.ts` does not list Input as a consumer. Flag for an audit decision.
- Arbitrary values `h-[40px]`, `pl-[12px]`, `pr-[12px]`, `pl-[44px]`, `pr-[44px]` have no inline justification comment (`design-foundation.md` §3).
- Adornment padding assumes 24px icons (LOGIC-INPUT-02).
- Default placeholder `'テキストを入力'` always renders unless overridden.
- No `size` prop; no Figma mapping or Code Connect file for this component.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | Retroactive spec (no C/D run) | — | — | — | — | — | — | — | — | — | not scored | none known | Verified (no `/test` run; not scored) |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
