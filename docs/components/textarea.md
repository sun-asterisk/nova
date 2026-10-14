<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Textarea` — Component Specification

## 1. Identity

- **Figma component name:** N/A — no Code Connect mapping exists (`src/components/textarea/` has no `Textarea.figma.ts`). Figma's "Textarea Field" component (node `598-2713`, see `docs/components/textareaField.md`) maps to `TextareaField`, which renders `Textarea` internally.
- **Figma file:** N/A — no Figma node is attributed to `Textarea` itself in source.
- **Figma node/component URL:** None in source; not inspected for this spec.
- **Code name:** `Textarea`
- **Package export:** `@sun-asterisk/nova/textarea` (and root). Public types: `TextareaProps`, `TextareaVariant`.
- **Category:** Primitive — native `<textarea>`, no Radix; documented foundation for `TextareaField` (`component-capability-matrix.md` §14).

## 2. Status

- **Lifecycle status:** Verified (CLAUDE.md §36 — unit, type-contract and Storybook tests exist and pass; not `/test`-certified).
- **Last verified:** 2026-09-29 — `pnpm exec vitest run --project unit src/components/textarea/` (9/9), `--project storybook` (7/7 stories), `--project api test/api/textarea.test-d.tsx` (no type errors). Not via `/test`.
- **Owner/last touched by:** Spec written retroactively (no Workflow C/D run), 2026-09-29.

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | native `<textarea>` | `textbox` (multiline) | Single element: receives `ref`, `className`, `id` (falls back to `useId()`), and all native attributes |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `variant` | `TextareaVariant` (`'default' \| 'error'`) | `'default'` | No | Visual status only — does **not** set `aria-invalid` | §3, §5 |
| `id` | `string` | `useId()` | No | Explicit id; auto-generated when omitted (`id \|\| autoId`) | — |
| `placeholder` | `string` | `'テキストを入力'` | No | Japanese fallback placeholder | — |
| `disabled` | `boolean` | — | No | Native disabled. An independent style axis combined with `variant` (2026-10-05): Figma Text Area keeps the error border when disabled | §2 |

Extends `ComponentProps<'textarea'>` (controlled/uncontrolled via `value`/`defaultValue`/`onChange`, `maxLength`, `rows`, …). Ref: `HTMLTextAreaElement`.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Neither — one element; `className` is merged via `cn(textareaStyles(...), className)`.
- **`asChild`:** Not applicable.
- **Internal parts a consumer can realistically reach without forking:** The whole component (single element).

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Default | `border-sds-border-strong`, `bg-sds-surface-base`, `typo-body-m`, `p-sds-150` | Native | Native multiline textbox | tv `default` | `Default` story `play()` |
| Focus-visible | 2px `border-focus` outline, 2px offset (Figma Text Area Focus Ring, OUTSIDE, radius 6) | — | native `:focus-visible` | `FOCUS_RING_OFFSET_3` | none — gap (no real-Tab + `getComputedStyle` story, unlike Input/Checkbox) |
| Error | `border-sds-border-danger` only | Unchanged | **No `aria-invalid`** unless passed (TextareaField passes it) | `variant="error"` | `ErrorState` story (no `play()`) |
| Disabled | `bg-sds-surface-disabled`; value text `text-primary`; placeholder `text-disable` (default) / `text-placeholder` (error); border `border-disable` (default) / `border-danger` (error); no hover; `cursor-not-allowed` | Native `disabled` | `disabled` attribute | `effectiveVariant` | `Textarea.test.tsx` (2 disabled tests); `Disabled` story `play()` |
| With content / maxLength | Native | Browser enforces `maxlength` | native | passthrough | `WithMaxLength` story `play()`; `Textarea.test.tsx` controlled-value test |

## 7. Design Tokens — Figma Traceability

No Figma source is attributed to Textarea in code.

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Min width 320px | Not documented | `min-w-[320px]` (arbitrary, uncommented) | `Textarea.styles.ts` base | `Default` | none |
| Height range 98–230px | Not documented | `min-h-[98px] max-h-[230px]` (arbitrary, uncommented) | base | `LargeTextarea` | none |
| Padding | — | `p-sds-150` | base | — | none |
| Radius / type | — | `rounded-sds-100`, `typo-body-m` | base | — | none |
| Colors | — | `sds-surface-base`, `sds-text-primary`, `sds-text-placeholder`, `sds-border-strong`, `sds-border-danger`, `sds-background-container`, `sds-text-disable`, `sds-border-disable` | variants | `ErrorState`, `Disabled` | none |
| Focus ring 2px / offset 2px | Figma Text Area `Focus Ring` (stroke OUTSIDE, radius 6 = 4 + 2) — overrides the "text element → 3px" default (§5.1: check Figma) | `FOCUS_RING_OFFSET_2` | base | — | none — gap |
| Vertical resize | Figma Text Area guideline (height grows with content; scroll beyond the max) | `resize-y` (2026-10-05; was `resize-vertical`, which is not a Tailwind utility and generated no CSS — the textarea was still vertical-only because Tailwind preflight, shipped in `.../styles`, sets `textarea { resize: vertical }`) | base | `Textarea.figma.test.tsx` | none |

## 8. Accessibility

- **Semantic element / role:** Native `<textarea>`.
- **Accessible name:** Consumer-supplied (`<label htmlFor>` pointing at the explicit or auto id, or `aria-label`). The auto id is not exposed to the consumer, so pass `id` when labelling with a separate `<label>`.
- **Keyboard interactions:** Native.
- **Focus management:** `FOCUS_RING_OFFSET_3` with `transition-[background-color,border-color]` (avoids the outline-color flash). Not verified with a real-browser computed-style test for this spec.
- **Disabled semantics:** Native `disabled`.
- **Screen reader behavior:** Error is visual-only at this layer; use `TextareaField` or pass `aria-invalid`/`aria-describedby`.

## 9. Theming

- **Light/dark behavior:** Semantic tokens only (`!important` on text color).
- **Verification method used:** Not verified in dark mode for this spec.

## 10. Market Benchmark

`market-benchmark.md`: Textarea is named in error-state unification (`variant='error'`, open) and the `size` prop family (DEFERRED). Full `className` override on a single element already satisfies the slot-customization item.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| `component-capability-matrix.md` #11: uncommented arbitrary `min-w-[320px]`/`min-h-[100px]` | Capability audit | Partly stale (now `min-h-[98px] max-h-[230px]`), still uncommented | none |
| LOGIC-DUP-01: `effectiveVariant` pattern duplicated across Input/Checkbox/RadioGroup/Textarea | Logic audit | Open, P3 | `Textarea.test.tsx` "disabled forces the disabled variant…" |
| LOGIC-DUP-02: Textarea has an id fallback, Input does not | Logic audit | Open (asymmetry) | `Textarea.test.tsx` id fallback tests |

## 12. Examples

```tsx
<label htmlFor="feedback">Feedback</label>
<Textarea id="feedback" name="feedback" rows={5} maxLength={500} placeholder="Tell us what went well" />

// Error at the primitive layer: wire ARIA yourself (or use TextareaField)
<Textarea id="bio" variant="error" aria-invalid aria-describedby="bio-error" />
<p id="bio-error">Bio is required.</p>
```

## 13. Known Limitations

- **Figma alignment 2026-10-05** against Figma `Text Area` (`598:2713`, "Nova｜Master"), measured in a real browser: hover now paints `surface-subtle-hover` (enabled only); focus offset 3px → 2px (`FOCUS_RING_OFFSET_2`); disabled background `background-container` (#fafafa) → `surface-disabled` (#f2f2f2). **Disabled styling follows Figma Text Area, which differs from Text Field in the same file — confirmed 2026-10-06: each component follows its own Figma, the difference is intended; do not "align" Textarea with Text Field**: a disabled textarea with content shows the value in `text-primary` (Text Field: `text-disable`), and a disabled textarea in error keeps the `border-danger` border and `text-placeholder` placeholder (Text Field: `border-disable`). This replaces the earlier "disabled always wins over error" rule for Textarea only.
- **Contrast (Figma token values, not fixed here):** `pnpm figma:theme-check fSzxt8wKkXsn8fmxkPBUr2 3122-1746` (2026-10-05): placeholder on the hover fill is **4.12:1 in light** (same tokens as Text Field). Needs designer confirmation.

- Vertical-only resize relies on the explicit `resize-y` utility (fixed 2026-10-05). Before that the class was a non-existent `resize-vertical` and the behaviour came only from Tailwind preflight (`textarea { resize: vertical }`); an earlier version of this note wrongly said the textarea resized in both directions — measured `getComputedStyle().resize === 'vertical'`.
- `variant="error"` sets no `aria-invalid`.
- `min-w-[320px]` can force horizontal overflow in containers narrower than 320px (`accessibility.md` §6.2 reflow).
- Arbitrary sizes are uncommented (`design-foundation.md` §3).
- No focus-ring interaction story.
- Default placeholder `'テキストを入力'` always renders unless overridden.
- No Figma mapping or Code Connect file.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | Retroactive spec (no C/D run) | — | — | — | — | — | — | — | — | — | not scored | none known | Verified (no `/test` run; not scored) |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
