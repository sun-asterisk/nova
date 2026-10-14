<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `TextareaField` — Component Specification

## 1. Identity

- **Figma component name:** Textarea Field (per `TextareaField.figma.ts`; properties `Title Label`, `Placeholder Text Label`, `State`, `Tag` (required badge), `Support Text` + `Support Text Label`, `Letter Count` with a nested `Letter Counter` instance whose `Max` text holds the limit)
- **Figma file:** the Nova Figma file (see `figma.config.json`).
- **Figma node/component URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System-Nova?node-id=598-2713 (from `TextareaField.figma.ts`) — **not re-inspected for this spec**.
- **Code name:** `TextareaField`
- **Package export:** `@sun-asterisk/nova/textarea-field` (and root). Public types: `TextareaFieldProps`, `TextareaFieldVariant` (= `TextareaVariant`).
- **Category:** Composite — label + `Textarea` + support/error message + character counter, wired with the internal `useFieldIds()` foundation (shared with `TextField`).

## 2. Status

- **Lifecycle status:** Verified (CLAUDE.md §36 — unit, type-contract and Storybook tests exist and pass; not `/test`-certified).
- **Last verified:** 2026-09-29 — `pnpm exec vitest run --project unit src/components/textareaField` (9/9), `--project storybook` (14/14 stories), `--project api test/api/textareaField.test-d.tsx` (no type errors). Not via `/test`.
- **Owner/last touched by:** Spec written retroactively (no Workflow C/D run), 2026-09-29.

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<div>` | none | `flex flex-col w-full gap-sds-100`; not reachable by `className` |
| 2 | Label | `<label htmlFor={fieldId}>` (when `label` is truthy) | label | Same markup/tokens as TextField; `classNames.label` |
| 2a | Required badge | `<span>` (when `required`) | none | `requiredText` (default `必須`) |
| 3 | Control | `Textarea` (see `docs/components/textarea.md`) | textbox | Receives `ref`, `className`, `id`, `name`, `required`, `aria-invalid`, `aria-describedby`, `value`/`defaultValue`, native `maxLength`, wrapped `onChange` |
| 4 | Footer row | `<div>` (when any of `supportText`, `error`, `maxLength` is truthy) | none | `flex justify-end gap-sds-200` |
| 4a | Error message | `<div id="{fieldId}-error">` + `IconExclamationCircle` 16px | none | Replaces support text; `classNames.error` |
| 4b | Support text | `<span id="{fieldId}-description">` | none | Only when no `error`; `classNames.supportText` |
| 4c | Counter | `<div aria-live="polite">` `"{n} / {maxLength}"` (when `maxLength`) | live region | Danger color when over the limit or when `error` is set |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `label` | `string` | `'ラベル'` | No | Visible label; `''` renders none | — |
| `error` | `string` | — | No | Forces error visual + `aria-invalid`, replaces `supportText`, turns counter red | §3 |
| `supportText` | `string` | — | No | Helper text linked via `aria-describedby` (only while no `error`) | — |
| `maxLength` | `number` | — | No | Native `maxlength` **and** shows the counter | — |
| `required` / `requiredText` | `boolean` / `string` | `false` / `'必須'` | No | Native `required` + badge | — |
| `variant` | `TextareaFieldVariant` (`'default' \| 'error'`) | `'default'` | No | Visual only; overridden by `error`; alone sets no `aria-invalid` | §3, §5 |
| `value` / `defaultValue` / `onChange` | native | — | No | Controlled or uncontrolled; `onChange` is called after the internal count update | §1 |
| `classNames` | `{ label?; supportText?; error? }` | — | No | Per-part classes; `className` reaches only the leaf `<textarea>` | §8 |
| `id` | `string` | `useId()` | No | Field id | — |

Extends `Omit<ComponentProps<'textarea'>, 'size'>`. Ref: `HTMLTextAreaElement`.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Props + `classNames` (same shape as TextField). No Field compound API (CLAUDE.md §8/§9).
- **`asChild`:** Not applicable.
- **Internal parts a consumer can realistically reach without forking:** label, support text, error container, leaf textarea. Not reachable: root, footer row, counter, required badge.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Default | Textarea default chrome, label above | Native | label ↔ textarea | `useFieldIds` | `Default` story |
| Counting (uncontrolled) | `n / max`, secondary color | Updates on every change | `aria-live="polite"` | `useState` updated in `handleChange`, initialised from `defaultValue` | `TextareaField.test.tsx` "counts characters as the user types"; `InteractionCharacterCounter` story |
| Counting (controlled) | Length derived from `value` at render time | External `value` changes reflected in the same render | same | `value != null ? value.length : uncontrolled` | `TextareaField.test.tsx` "reflects an externally-driven value change immediately" |
| Over limit | Counter `text-sds-text-danger` | Browser blocks typing past `maxlength`; over-limit only via `value`/`defaultValue` | Not announced as invalid (no `aria-invalid`) | `displayedLength > maxLength` | `TextareaField.test.tsx` "shows the danger color once the count exceeds maxLength" |
| Error | Danger border, red icon + message, counter red; support text hidden | — | `aria-invalid="true"`, `aria-describedby="{id}-error"` only | `textareaVariant = error ? 'error' : variant` | `TextareaField.test.tsx` error/dangling-id tests; `InteractionErrorWiring` story |
| Disabled | Textarea disabled chrome | Native | native | passthrough | `Disabled` story |

## 7. Design Tokens — Figma Traceability

Figma was not re-inspected; control tokens are Textarea's (see `textarea.md` §7), label/message tokens match `textField.md` §7.

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Letter counter | Figma `Letter Count` + `Letter Counter.Max` (via `.figma.ts`) | `typo-body-s`, `text-sds-text-secondary` / `text-sds-text-danger` | counter div | `WithCharacterLimit`, `ErrorStateWithCharacterLimit` | `TextareaField.test.tsx` |
| Footer layout | Not documented | `gap-sds-200`, `justify-end`, message `flex-1 min-w-0`, counter `shrink-0` | footer row | `AllFeatures` | none |
| Label / badge / messages | Not documented | as TextField | `TextareaField.tsx` | `Required`, `ErrorState` | `TextareaField.test.tsx` classNames test |

## 8. Accessibility

- **Semantic element / role:** Native `<label>` + `<textarea>`.
- **Accessible name:** From the label (defaults to `'ラベル'`).
- **Keyboard interactions:** Native.
- **Focus management:** Delegated to `Textarea`.
- **Disabled semantics:** Native `disabled`.
- **Screen reader behavior:** `aria-invalid`/`aria-describedby` from `error`/`supportText`; the dangling-id case is guarded. The counter is a polite live region, so it is announced after every keystroke (verbose for long text), and it is **not** part of `aria-describedby`.

## 9. Theming

- **Light/dark behavior:** Semantic tokens only.
- **Verification method used:** Not verified in dark mode for this spec.

## 10. Market Benchmark

Same items as TextField: the dual error signal (`market-benchmark.md` "Unify the three error state expressions", open), slot customization (addressed by `classNames`), `size` (DEFERRED). The built-in character counter was not benchmarked in `market-benchmark.md`.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| LOGIC-TEXTAREAFIELD-01: counter stale for one paint after external `value` change | Logic audit | Fixed — derived at render time | `TextareaField.test.tsx` controlled test + Storybook |
| LOGIC-TEXTAREAFIELD-02: `\|\|` vs `??` initializer | Logic audit | Fixed (superseded by the above; now `?? 0`) | covered by uncontrolled counting test |
| LOGIC-TEXTAREAFIELD-03: over-limit not shown in danger color | Logic audit | Fixed | "shows the danger color once the count exceeds maxLength" |
| `aria-describedby` dangling support-text id with both `error` + `supportText` | Field-shell review | Fixed | "does not dangle-reference the support-text id…" |
| Zero `play()` coverage | Logic audit | Fixed | `InteractionCharacterCounter`, `InteractionErrorWiring` |
| OVER-ABSTRACTION-08: JSX duplicated with TextField | Logic audit | `remediation-matrix.md` #7 records FIXED, but the label/message JSX is still duplicated inline (no shared `FieldLabel`/`FieldMessages` exists) | none |
| Code Connect mapped Figma's Error message to `supportText` | `figma-code-connect.md` §3 (2026-09-16) | Being fixed on this branch (`TextareaField.figma.ts` modified, uncommitted) | n/a |

## 12. Examples

```tsx
<TextareaField
  label="Project description"
  name="description"
  required
  requiredText="Required"
  maxLength={500}
  supportText="Shown on the public project page."
/>

// Controlled, with an external reset — the counter updates in the same render
const [text, setText] = useState('');
<TextareaField label="Notes" value={text} onChange={(e) => setText(e.target.value)} maxLength={200} />
<Button onClick={() => setText('')}>Clear</Button>

// Error
<TextareaField label="Reason" error="Please describe the reason." />
```

## 13. Known Limitations

- **Error icon color fixed 2026-10-06.** The ⓘ icon in the error message inherited the message's `text-danger`; Figma Text Area `598:2713` uses `Icon/Danger` (light #dd2305 vs #c50e03, dark #fc593f vs #fd8c77). Now `text-sds-icon-danger`, tested in light and dark. Found by re-measuring every disabled/error variant against Figma — `figma:theme-check` compares Figma with `global.css` values, not which token the code applies.

- **Figma alignment 2026-10-05.** Label row gap 4px → 8px (`gap-sds-100`, Figma Text Area `Label` frame — Text Field's is 4px). Error behaviour unchanged and confirmed: Figma `Status=Error` shows only the error message (the support text is hidden), the letter counter turns `text-danger`. `TextareaField.figma.ts` handles both Figma schemas (older `State` incl. Error vs the current `Status` + `State` + `Filled`), and finds the counter by its real layer name `_Text Area / Letter Counter` (the old `'Letter Counter'` lookup never matched, so `maxLength` was never emitted).

- Dual error signal (`variant="error"` without `error` sets no `aria-invalid`).
- Over-limit is visual only (no `aria-invalid`, no message).
- The polite live-region counter announces on every keystroke and is not linked via `aria-describedby`.
- By source reading (untested): `maxLength={0}` would render a stray `0` text node, because the footer guard is `(supportText || error || maxLength) && …`.
- Label/message JSX is duplicated with `TextField` (see §11).
- `label` defaults to `'ラベル'`.
- Code Connect correctness fixes are in progress on this branch — see `.claude/rules/figma-code-connect.md` §3.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | Retroactive spec (no C/D run) | — | — | — | — | — | — | — | — | — | not scored | none known | Verified (no `/test` run; not scored) |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
