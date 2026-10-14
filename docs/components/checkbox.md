<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Checkbox` — Component Specification

## 1. Identity

- **Figma component name:** Checkbox — component set `17503:9619` in the documentation frame `2002:1669`, file `fSzxt8wKkXsn8fmxkPBUr2` ("Nova｜Master", the `FIGMA_FILE_KEY` in `.env`). Properties: `State` = Enabled / Hover / Disabled, `Status` = Default / Error, `Value` = True / False, `Indeterminate` = False / True, `Focus` (boolean), `Label` (boolean) + `Label text` — 18 variants. Inspected 2026-10-06.
- **Older schema:** an older version of the Figma component uses `Type` = Checked / Unchecked / Indeterminate and `State` = Enabled / Focus / Desabled / Error (Figma's own misspelling). `Checkbox.figma.ts` handles both schemas.
- **Figma node URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Nova%EF%BD%9CMaster?node-id=2002-1669
- **Code name:** `Checkbox`
- **Package export:** `@sun-asterisk/nova/checkbox` (and root). Public types: `CheckboxProps`, `CheckboxVariant`.
- **Category:** Radix wrapper — `@radix-ui/react-checkbox` (`CheckboxPrimitive.Root` / `CheckboxPrimitive.Indicator`). Simple Component (single visible part).

## 2. Status

- **Lifecycle status:** Verified (CLAUDE.md §36).
- **Last verified:** 2026-09-29 — `pnpm exec vitest run --project unit src/components/checkbox` (13/13 across `Checkbox.test.tsx` + `Checkbox.indicator.test.tsx`), `--project storybook` (15/15 stories), `--project api test/api/checkbox.test-d.tsx` (no type errors). Not via `/test`.
- **Owner/last touched by:** Spec written retroactively (no Workflow C/D run), 2026-09-29.

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<button type="button" role="checkbox">` (`CheckboxPrimitive.Root`), `data-slot="checkbox"` | `checkbox` | The focusable/clickable box. 18x18px (`size-[18px]`) with `m-0.75` (3px) margin on every side. Receives `ref`, `className` and all Radix Root props |
| 2 | Indicator | `<span>` (`CheckboxPrimitive.Indicator`), `data-slot="checkbox-indicator"` | none (presentational) | Mounted by Radix only while `checked` is `true` or `'indeterminate'`; carries its own Radix `data-state` |
| 3 | Check icon | `IconCheck` (`<svg>`) | decorative | Always rendered inside the Indicator; hidden via `[[data-state=indeterminate]>&]:hidden` |
| 4 | Minus icon | `IconMinus` (`<svg>`) | decorative | Always rendered inside the Indicator; hidden via `[[data-state=checked]>&]:hidden` |

No label part: `children` is omitted from the props type; a label is a sibling element associated via `id`/`htmlFor` (or `aria-label`).

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `variant` | `CheckboxVariant` (`'default' \| 'error'`) | `'default'` | No | Visual status. `'error'` also derives `aria-invalid="true"` unless `disabled` | §3 (error), §5 (variants) |
| `disabled` | `boolean` | `false` | No | Native disabled; forces the internal `disabled` style bucket and suppresses the derived `aria-invalid`, overriding `variant` | §2 |

Extends `Omit<ComponentProps<typeof CheckboxPrimitive.Root>, 'children' | 'asChild'>` — `checked` (`boolean | 'indeterminate'`), `defaultChecked`, `onCheckedChange`, `required`, `name`, `value`, `id`, `aria-*` and native button attributes pass through. An explicit `aria-invalid` prop wins over the derived value (it spreads after it). `children`/`asChild` removal is asserted in `test/api/checkbox.test-d.tsx`. Ref type: `HTMLButtonElement`.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Neither — a single styled part (the box). `className` targets the root. The indicator's icons are not individually customizable.
- **`asChild`:** Deliberately omitted from the type (Checkbox always renders its own indicator as its only child).
- **Internal parts a consumer can realistically reach without forking:** Root via `className`; indicator/icons only via descendant selectors against `data-slot="checkbox-indicator"` (not a supported contract).

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Unchecked | `border-sds-border-strong`, `bg-sds-surface-base`; no indicator | Click / Space toggles to checked | `aria-checked="false"`, `data-state="unchecked"` | Radix `data-state` | `Checkbox.test.tsx` "renders no indicator icon when unchecked"; `InteractionToggle` story |
| Checked | `bg-sds-surface-primary`, check icon in `text-sds-icon-on-surface` | Click / Space toggles to unchecked | `aria-checked="true"` | Radix `data-state` + CSS on Indicator `data-state` | `Checkbox.indicator.test.tsx` "checked shows only the Check icon"; `InteractionToggle` |
| Indeterminate | Same fill as checked, minus icon only | Click moves to `checked` (Radix) | `aria-checked="mixed"` | Radix `data-state="indeterminate"` | `Checkbox.indicator.test.tsx` (controlled, uncontrolled `defaultChecked="indeterminate"`, and indeterminate→checked click) |
| Hover | Unchecked: `bg-sds-surface-secondary-hover`; checked/indeterminate: `bg-sds-surface-primary-hover` (error: unchecked `bg-sds-background-danger`, checked stays `bg-sds-surface-danger`) | — | — | CSS `hover:` | `Checkbox.figma.test.tsx` (light + dark, real hover) |
| Focus-visible | 2px `border-focus` outline, 2px offset | Tab reaches it | native `:focus-visible` | `FOCUS_RING_OFFSET_2` | `InteractionFocusRing` story (real Tab + `getComputedStyle`: solid, 2px) |
| Error | `border-sds-border-danger`; checked fill `bg-sds-surface-danger` | Unchanged | `aria-invalid="true"` | `variant="error"` → tv variant + derived attribute | `Checkbox.test.tsx` aria-invalid tests; `InteractionAriaInvalid` story |
| Disabled | `bg-sds-surface-disabled`, `border-sds-border-disable`, check/minus in `text-sds-icon-disable`, no opacity, `cursor-not-allowed`; ring suppressed; identical for `variant="error"` (Figma Disabled × Error) | Native `disabled`, no toggle, no `onCheckedChange` | `disabled` attribute; derived `aria-invalid` suppressed | `effectiveVariant = disabled ? 'disabled' : variant` | `Checkbox.test.tsx` disabled tests; `InteractionDisabledBlocksToggle` story |

No press/active visual, per `design-foundation.md` §5.2 (form controls have no press state).

## 7. Design Tokens — Figma Traceability

Source: Figma component set `17503:9619`, all 18 variants read via the REST API on 2026-10-06. `pnpm figma:theme-check fSzxt8wKkXsn8fmxkPBUr2 17503:9619`: 16/16 color variables match `scripts/global.css` in Light and Dark, 0 contrast failures.

| Figma | Value | Implementation | Test |
|---|---|---|---|
| Bounding box | 18×18 inside a 24×24 frame, radius 4, 1px inside stroke | `size-[18px]`, `m-0.75`, `rounded-sds-100`, `border` | `Checkbox.figma.test.tsx` (size + margin) |
| Icon | 14×14 `Icon / Check` / `Icon / Minus` | `[&_svg]:w-3.5 [&_svg]:h-3.5` | — |
| Default: unchecked / checked | `Surface/Base` / `Surface/Primary`, border `Border/Strong`, icon `Icon/On Surface` | `bg-sds-surface-base` / `bg-sds-surface-primary`, `border-sds-border-strong`, `text-sds-icon-on-surface` | `Checkbox.figma.test.tsx` |
| Hover: unchecked / checked | `Surface/Secondary Hover` / `Surface/Primary Hover` | `hover:` classes | `Checkbox.figma.test.tsx` |
| Error: unchecked / checked / hover unchecked | `Surface/Base` / `Surface/Danger` / `Background/Danger`, border `Border/Danger` | `variant="error"` | `Checkbox.figma.test.tsx` |
| Disabled (Default and Error) | `Surface/Disabled`, `Border/Disable`, icon `Icon/Disable`, no opacity | `disabled` variant | `Checkbox.figma.test.tsx` (mutation-verified) |
| Focus ring | 22×22 rect, 2px `Border/Focus` outside stroke, radius 6 (2px from the box) | `FOCUS_RING_OFFSET_2` | `Checkbox.figma.test.tsx`, `InteractionFocusRing` |
| Label (`Label` on) | gap 8, `Body/Ja - M` (14px), `Text/Primary`; `Text/Disable` when disabled | No prop — consumer `<label className="flex items-center gap-sds-100 typo-body-m text-sds-text-primary">` (the snippet Code Connect emits) | `Checkbox.figma.test.tsx` (name, click, gap, size, color) |

## 8. Accessibility

Verified via real rendered DOM in the unit (Chromium/Playwright) and Storybook projects.

- **Semantic element / role:** `<button role="checkbox">` from Radix.
- **Accessible name:** Consumer-supplied — sibling `<label htmlFor>` (see `WithLabel`/`FormExample` stories) or `aria-label`.
- **Keyboard interactions:** Tab to focus; Space toggles (Radix). Enter does not toggle (Radix follows the WAI-ARIA checkbox pattern).
- **Focus management:** `FOCUS_RING_OFFSET_2` — verified via real `Tab` + `getComputedStyle()` (`InteractionFocusRing`). `transition-[background-color]` (not `transition-all`) avoids the outline-color flash (`design-foundation.md` §5.1).
- **Disabled semantics:** Native `disabled`; no hover/focus feedback; `aria-invalid` suppressed.
- **Screen reader behavior:** `aria-checked` true/false/mixed from Radix; `aria-invalid="true"` for `variant="error"`. Error *message* association (`aria-describedby`) is the consumer's responsibility — Checkbox has no message part.
- **Touch target:** Visible box is 18x18px; the 3px margin gives a 24x24 footprint, relying on WCAG 2.5.8's spacing exception rather than a 24px hit area. No 44x44 tap-area wrapper (unlike `Switch`). Not measured in a real browser for this spec.

## 9. Theming

- **Light/dark behavior:** All colors are semantic `sds-*` tokens; no Checkbox-specific theme logic.
- **Verification method used:** the 4 layers of `references/theme-verification.md` — `figma:theme-check` (16/16 tokens, Light + Dark), `storybook` 15/15 + `storybook-dark` 15/15, token-resolved tests in a light and a dark region (`Checkbox.figma.test.tsx`), all-state contrast PASS (disabled text exempt).

## 10. Market Benchmark

`docs/architecture/market-benchmark.md`: "Unify the three 'error state' expressions" lists Checkbox among the `variant='error'` users (Medium priority, not implemented — see `remediation-matrix.md` item 5, still open). "A `size` prop family for form-adjacent primitives" lists Checkbox with no `size` prop (DEFERRED pending Figma pixel confirmation, `remediation-matrix.md` Improvement #8/#9). Sun's tri-state `checked` value and Radix semantics match Radix/shadcn directly.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Uncontrolled `defaultChecked="indeterminate"` showed a check mark (indicator read `props.checked`) | Review remediation (2026-09-29) | Fixed — both icons rendered, CSS keyed on the Indicator's own `data-state` | `Checkbox.indicator.test.tsx` (4 tests) |
| `outline-none` + `outline-2` tailwind-merge collision suppressed the focus ring | `design-foundation.md` §5.1 (2026-09-07) | Fixed | `InteractionFocusRing` story |
| `transition-all` animated `outline-color` on focus | `design-foundation.md` §5.1 (2026-09-09) | Fixed (`transition-[background-color]`) | none — gap (no timing assertion) |
| `aria-invalid` missing for error state | Foundation capability implementation | Fixed — derived from `variant`/`disabled` | `Checkbox.test.tsx` (4 aria-invalid tests), `InteractionAriaInvalid` |
| LOGIC-CHECKBOX-01: `disabled` discards error styling | Logic audit | **Resolved 2026-10-06 — intended.** Figma `State=Disabled, Status=Error` is identical to Disabled | `Checkbox.test.tsx` ("disabled forces the disabled variant…"), `Checkbox.figma.test.tsx` |
| Disabled checked/indeterminate box used `opacity-50` and an `icon-on-surface` icon (nearly invisible on `surface-disabled`) | Figma alignment, 2026-10-06 | Fixed — `icon-disable`, no opacity | `Checkbox.figma.test.tsx` (removing either fix fails 4 tests) |
| Code Connect read only the old schema (`State=Hover` → `undefined`, no Error/Indeterminate on the active file) | Figma alignment, 2026-10-06 | Fixed — both schemas; emits a `<label>` composition when Label is on | `Checkbox.figma.test.tsx` (label snippet behavior) |
| LOGIC-CHECKBOX-02: `disabled:focus-visible:outline-none` is unreachable CSS | Logic audit | Open, P3, kept defensively | n/a |
| LOGIC-CHECKBOX-03: uncommented `m-0.75` | Logic audit | Open, P3 | n/a |

## 12. Examples

```tsx
// Labelled checkbox (sibling label, associated via id/htmlFor)
<div className="flex items-center gap-sds-100">
  <Checkbox id="terms" />
  <label htmlFor="terms">I accept the terms of service</label>
</div>

// Controlled tri-state "select all"
<Checkbox
  aria-label="Select all rows"
  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
  onCheckedChange={(next) => setAllSelected(next === true)}
/>

// Invalid, with an associated message
<Checkbox id="consent" variant="error" aria-describedby="consent-error" />
<label htmlFor="consent">I agree to data processing</label>
<p id="consent-error">You must agree to continue.</p>
```

## 13. Known Limitations

- No `size` prop (deferred; see §10).
- No built-in label or error-message part (same as `RadioGroup` / `Switch`; decided 2026-10-06 — Figma's Label is expressed as a `<label>` composition); `aria-describedby` wiring is manual.
- Code Connect: `Checkbox.figma.ts` points at node `17503-9619` in the Nova Figma file; `code-connect:check` validates it. The mapping also handles the older schema.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | Retroactive spec (no C/D run) | — | — | — | — | — | — | — | — | — | not scored | none known | Verified (no `/test` run; not scored) |
| 2026-10-06 | Figma alignment (Classification F) | — | — | — | — | — | — | — | — | — | 93/100 | none | Verified |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
