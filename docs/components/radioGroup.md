<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `RadioGroup` / `RadioGroupItem` — Component Specification

## 1. Identity

- **Figma component name:** Radio — component set `17503:9702` in the documentation frame `2002:1714`, file `fSzxt8wKkXsn8fmxkPBUr2` ("Nova｜Master", the official file / `.env` `FIGMA_FILE_KEY`). A single radio, mapped to `RadioGroupItem` in `RadioGroup.figma.ts`. Properties: `State` = Enabled / Hover / Disabled, `Status` = Default / Error, `Value` = True / False, `Focus` (boolean), `Label` (boolean) + `Label text` — 12 variants. Inspected 2026-10-06. No Figma node is mapped to the `RadioGroup` root (Figma has no group component).
- **Older schema:** an older version of the Figma component uses `State` = Enabled / Focus / Disabled / Error. `RadioGroup.figma.ts` handles both.
- **Figma node URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Nova%EF%BD%9CMaster?node-id=2002-1714
- **Code name:** `RadioGroup`, `RadioGroupItem`
- **Package export:** `@sun-asterisk/nova/radio-group` (and root). Public types: `RadioGroupProps`, `RadioGroupItemProps`, `RadioGroupItemVariant`.
- **Category:** Radix wrapper — `@radix-ui/react-radio-group` (`Root`, `Item`, `Indicator`). Compound (2 parts).

## 2. Status

- **Lifecycle status:** Verified (CLAUDE.md §36).
- **Last verified:** 2026-09-29 — `pnpm exec vitest run --project unit src/components/radioGroup` (13/13), `--project storybook` (12/12 `RadioGroup` + 5/5 `RadioGroupItem` stories), `--project api test/api/radioGroup.test-d.tsx` (no type errors). Not via `/test`.
- **Owner/last touched by:** Spec written retroactively (no Workflow C/D run), 2026-09-29.

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Group root | `<div role="radiogroup">` (`RadioGroupPrimitive.Root`), `data-slot="radio-group"` | `radiogroup` | Default layout `grid gap-3`; merged with `className` |
| 2 | Item | `<button role="radio">` (`RadioGroupPrimitive.Item`), `data-slot="radio-group-item"` | `radio` | 18x18px circle (`size-4.5`, `rounded-sds-full`) with `m-0.75` (3px) margin |
| 3 | Indicator | `<span>` (`RadioGroupPrimitive.Indicator`), `data-slot="radio-group-indicator"` | presentational | Mounted by Radix only when checked |
| 4 | Dot | `MdCircle` from `react-icons/md` | decorative | 8px (`size-2`), `fill-sds-surface-base`, centered |

Labels are siblings associated via `id`/`htmlFor`; group labelling is via a wrapping `<fieldset>`/`<legend>` or `aria-label(ledby)` on the root.

## 4. API

**`RadioGroup`** — `ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>` with no added props: `value`, `defaultValue`, `onValueChange`, `disabled`, `required`, `name`, `orientation`, `loop`, `dir`, `className`, etc. Ref: `HTMLDivElement`.

**`RadioGroupItem`**

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `value` | `string` | — | Yes (Radix) | Item identity; must be unique in the group | — |
| `variant` | `RadioGroupItemVariant` (`'default' \| 'error'`) | `'default'` | No | Visual status; `'error'` derives `aria-invalid="true"` unless `disabled` | §3, §5 |
| `disabled` | `boolean` | — | No | Native disabled; forces the `disabled` style bucket and suppresses derived `aria-invalid` | §2 |

Extends `ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>` (`id`, `aria-*`, `className`, …). An explicit `aria-invalid` wins over the derived value. Ref: `HTMLButtonElement`. Both refs asserted in `test/api/radioGroup.test-d.tsx` and `RadioGroup.test.tsx`.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Compound (Root + Item) mirroring Radix, since items are laid out freely by the consumer alongside their own labels. No `classNames` on Item; the dot is not customizable.
- **`asChild`:** Not re-exposed as a Sun concern (inherited from Radix types, not tested).
- **Internal parts a consumer can realistically reach without forking:** Root and Item via `className`; indicator only via `data-slot` selectors (not a supported contract).

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Unchecked | `border-sds-border-strong`, `bg-sds-surface-base` | Click / Space selects | `aria-checked="false"` | Radix `data-state` | `RadioGroup.test.tsx` "renders no indicator when unchecked" |
| Checked | `bg-sds-surface-primary` fill + white 8px dot | — | `aria-checked="true"` | Radix `data-state`, Indicator mount | `RadioGroup.test.tsx` "renders the indicator when checked", "selecting one item deselects…" |
| Hover | Unchecked `bg-sds-surface-secondary-hover`; checked `bg-sds-surface-primary-hover` (error: danger tokens) | — | — | CSS `hover:` | none — gap |
| Focus-visible | 2px `border-focus` outline, 2px offset | Tab enters the group at the checked (or first) item | native `:focus-visible` | `FOCUS_RING_OFFSET_2` | `RadioGroupItem` `InteractionFocusRing` story (real Tab + `getComputedStyle`) |
| Arrow navigation | Focus and selection move together | ArrowUp/Down/Left/Right, wraps (Radix roving focus) | roving `tabIndex` | Radix | `InteractionSelectAndArrowNav` story (click, ArrowDown, Space) |
| Error | `border-sds-border-danger`, checked fill `bg-sds-surface-danger` | Unchanged | `aria-invalid="true"` on the item | `variant="error"` | `RadioGroup.test.tsx` aria-invalid tests; `InteractionAriaInvalid` story |
| Disabled (item or group) | `bg-sds-surface-disabled` (selected or not), `border-sds-border-disable`, dot `fill-sds-icon-disable`, no opacity, `cursor-not-allowed`, ring suppressed; identical for `variant="error"` (Figma Disabled × Error) | Not selectable; skipped by arrows (Radix) | `disabled` attribute | `effectiveVariant`; Radix group `disabled` | `RadioGroup.test.tsx` disabled tests; `DisabledState`/`IndividualDisabled` stories |

No press/active visual (`design-foundation.md` §5.2).

## 7. Design Tokens — Figma Traceability

Source: Figma component set `17503:9702`, all 12 variants read via the REST API on 2026-10-06. `pnpm figma:theme-check fSzxt8wKkXsn8fmxkPBUr2 17503:9702`: 14/14 color variables match `scripts/global.css` in Light and Dark, 0 contrast failures.

| Figma | Value | Implementation | Test |
|---|---|---|---|
| Circle | 18×18 ellipse inside a 24×24 frame, 1px inside stroke | `size-4.5`, `m-0.75`, `rounded-sds-full`, `border` | `RadioGroup.figma.test.tsx` (size + margin) |
| Dot (Value=True) | 8×8 ellipse, `Surface/Base` | `MdCircle` `size-2`, `[&_svg]:fill-sds-surface-base` | `RadioGroup.figma.test.tsx` (size + fill) |
| Default: unselected / selected | `Surface/Base` / `Surface/Primary`, border `Border/Strong` | `bg-sds-surface-base` / `bg-sds-surface-primary`, `border-sds-border-strong` | `RadioGroup.figma.test.tsx` |
| Hover: unselected / selected | `Surface/Secondary Hover` / `Surface/Primary Hover` | `hover:` classes | `RadioGroup.figma.test.tsx` |
| Error: unselected / selected / hover unselected | `Surface/Base` / `Surface/Danger` / `Background/Danger`, border `Border/Danger` | `variant="error"` | `RadioGroup.figma.test.tsx` |
| Disabled (Default and Error) | `Surface/Disabled` (selected or not), `Border/Disable`, dot `Icon/Disable`, no opacity | `disabled` variant | `RadioGroup.figma.test.tsx` (mutation-verified) |
| Focus ring | 22×22 ellipse, 2px `Border/Focus` outside stroke (2px from the circle) | `FOCUS_RING_OFFSET_2` | `RadioGroup.figma.test.tsx`, `InteractionFocusRing` |
| Label (`Label` on) | gap 8, Body M (14px), `Text/Primary`; `Text/Disable` when disabled | No prop — consumer `<label className="flex items-center gap-sds-100 typo-body-m text-sds-text-primary">` (the snippet Code Connect emits) | `RadioGroup.figma.test.tsx` (name, click, gap, size, color) |
| Group gap | Not specified in Figma | `gap-3` (unchanged) | `RadioGroup.test.tsx` |

## 8. Accessibility

- **Semantic element / role:** `radiogroup` root, `radio` items (Radix).
- **Accessible name:** Items — sibling `<label htmlFor>`; group — `<fieldset>`/`<legend>` (demonstrated in `AccessibleFormFieldset`) or `aria-label(ledby)`.
- **Keyboard interactions:** Tab enters/leaves the group as one stop; arrow keys move focus and selection; Space selects the focused item (Radix, exercised in `InteractionSelectAndArrowNav`).
- **Focus management:** `FOCUS_RING_OFFSET_2`, verified via real Tab + `getComputedStyle()`.
- **Disabled semantics:** Native `disabled`; no hover/focus feedback.
- **Screen reader behavior:** `aria-checked` per item; `aria-invalid` per error item. A group-level error message must be linked by the consumer (e.g. `aria-describedby` on the root).
- **Touch target:** 18px circle + 3px margin (24px footprint via WCAG 2.5.8 spacing exception); not measured in a real browser for this spec.

## 9. Theming

- **Light/dark behavior:** Semantic tokens only.
- **Verification method used:** the 4 layers of `references/theme-verification.md` — `figma:theme-check` (14/14 tokens, Light + Dark), `storybook` 17/17 + `storybook-dark` 17/17, token-resolved tests in a light and a dark region (`RadioGroup.figma.test.tsx`), all-state contrast PASS (disabled text exempt).

## 10. Market Benchmark

`market-benchmark.md`: RadioGroup is listed among the genuine compound components (strength, Radix/shadcn parity). Open items that name RadioGroupItem: error-state unification (`variant='error'`) and the deferred `size` prop family.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| `outline-none` + `outline-2` collision suppressed the focus ring | `design-foundation.md` §5.1 (2026-09-07) | Fixed | `RadioGroupItem` `InteractionFocusRing` |
| Missing `aria-invalid` for error items | Foundation capability implementation | Fixed — derived from `variant`/`disabled` | `RadioGroup.test.tsx` (4 tests), `InteractionAriaInvalid` |
| No story showed the fieldset/legend pattern | Accessibility review (`accessibility.md` §7.6) | Fixed (story only; no code change needed) | `AccessibleFormFieldset` (no `play()`) |
| LOGIC-RADIOGROUP-01: removing the focused item drops focus to `body` | Logic audit | Open — inherited Radix behavior, documented here | none |
| Code Connect emitted `value="undefined"` when Show Label was off | `figma-code-connect.md` §3 (2026-09-16) | Fixed 2026-09-29 — `value` always uses `Label text`, falling back to `'option'` | mock-runtime harness (2026-10-06) |
| Disabled item kept a white `surface-base` fill when unselected and drew a `surface-base` dot (nearly invisible on `surface-disabled`) when selected | Figma alignment, 2026-10-06 | Fixed — `surface-disabled` fill, `icon-disable` dot | `RadioGroup.figma.test.tsx` (removing either fix fails 4–8 tests) |
| Code Connect pointed at node `985-1697` (not found in the official file) and read only the old schema (`State=Hover` → `undefined`, no Error on the active file) | Figma alignment, 2026-10-06 | Fixed — node `17503-9702`, both schemas, `<label>` composition when Label is on | `RadioGroup.figma.test.tsx` (label snippet behavior) |

## 12. Examples

```tsx
<fieldset>
  <legend>Shipping speed</legend>
  <RadioGroup defaultValue="standard" name="shipping">
    <div className="flex items-center gap-sds-100">
      <RadioGroupItem value="standard" id="ship-standard" />
      <label htmlFor="ship-standard">Standard (5–7 days)</label>
    </div>
    <div className="flex items-center gap-sds-100">
      <RadioGroupItem value="express" id="ship-express" />
      <label htmlFor="ship-express">Express (2–3 days)</label>
    </div>
  </RadioGroup>
</fieldset>

// Horizontal, controlled
<RadioGroup value={size} onValueChange={setSize} orientation="horizontal" className="flex gap-sds-300" aria-label="Size">
  …
</RadioGroup>
```

## 13. Known Limitations

- The dot uses `MdCircle` from `react-icons/md` (a runtime dependency) rather than this library's own `icons` set — unlike `Checkbox` and `DropdownMenu`'s item indicators, which use the internal `IconCheck`/`IconMinus`.
- Default `gap-3` and `size-4.5`/`m-0.75` are default-Tailwind values, not `sds` tokens, and are uncommented.
- No `size` prop; no group-level error/description part.
- No built-in label part (same as `Checkbox` / `Switch`; Figma's Label is expressed as a `<label>` composition). Code Connect `value` uniqueness within a group is the consumer's responsibility (the template API cannot see sibling instances).

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | Retroactive spec (no C/D run) | — | — | — | — | — | — | — | — | — | not scored | none known | Verified (no `/test` run; not scored) |
| 2026-10-06 | Figma alignment (Classification F) | — | — | — | — | — | — | — | — | — | 93/100 | none | Verified |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
