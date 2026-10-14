<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `TextField` — Component Specification

## 1. Identity

- **Figma component name:** Text Field (per `TextField.figma.ts`; properties `Title Label`, `Placeholder Text Label`, `State` = Enabled / Focus / Filled / Disabled / Error, `Tag` (required badge), `Support Text` + `Support Text Label`, Prefix/Suffix icons)
- **Figma file:** the Nova Figma file (see `figma.config.json`).
- **Figma node/component URL:** https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Sun--Design-System-Nova?node-id=610-2971 (from `TextField.figma.ts`) — **not re-inspected for this spec**.
- **Code name:** `TextField`
- **Package export:** `@sun-asterisk/nova/text-field` (and root). Public types: `TextFieldProps`, `TextFieldVariant` (= `InputVariant`).
- **Category:** Composite — label + `Input` + support/error message, wired with the internal `useFieldIds()` foundation (`src/utils/useFieldIds.ts`, not exported).

## 2. Status

- **Lifecycle status:** Verified (CLAUDE.md §36 — unit, type-contract and Storybook tests exist and pass; not `/test`-certified).
- **Last verified:** 2026-09-29 — `pnpm exec vitest run --project unit src/components/textField` (8/8), `--project storybook` (11/11 stories), `--project api test/api/textField.test-d.tsx` (no type errors). Not via `/test`.
- **Owner/last touched by:** Spec written retroactively (no Workflow C/D run), 2026-09-29.

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `<div>` | none | `flex flex-col w-full gap-sds-100`. **Not** reachable by `className` |
| 2 | Label | `<label htmlFor={fieldId}>` (rendered when `label` is truthy) | label | `typo-label-m-bold text-sds-text-primary`; `classNames.label` |
| 2a | Required badge | `<span>` inside the label (when `required`) | none | `requiredText` (default `必須`), `bg-sds-background-emphasis text-sds-text-emphasis typo-label-s-bold` |
| 3 | Control | `Input` (see `docs/components/input.md`) | textbox | Receives `ref`, `className`, `id`, `name`, `required`, `aria-invalid`, `aria-describedby`, adornments and the remaining native props |
| 4a | Error message | `<div id="{fieldId}-error">` with `IconExclamationCircle` (16px) + `<span>` (when `error`) | none | `text-sds-text-danger typo-body-s`; `classNames.error` |
| 4b | Support text | `<span id="{fieldId}-description">` (whenever `supportText` is set — kept alongside `error`, per Figma's Error variant) | none | `text-sds-text-secondary typo-body-s`; `classNames.supportText` |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `label` | `string` | `'ラベル'` | No | Visible label; pass `''` to render none | — |
| `error` | `string` | — | No | Error message; its presence forces the error visual and `aria-invalid`. Rendered **below** `supportText`, which stays visible (Figma `Status=Error` shows both; changed 2026-10-05 — it used to replace `supportText`) | §3 |
| `supportText` | `string` | — | No | Helper text, linked via `aria-describedby`; stays visible while `error` is set | — |
| `required` | `boolean` | `false` | No | Native `required` on the input + visible badge | — |
| `requiredText` | `string` | `'必須'` | No | Badge text | — |
| `variant` | `TextFieldVariant` (`'default' \| 'error'`) | `'default'` | No | Visual only; overridden to `'error'` by `error`. `variant="error"` alone sets **no** `aria-invalid` | §3, §5 |
| `startAdornment` / `endAdornment` | `ReactNode` | — | No | Forwarded to `Input` | — |
| `classNames` | `{ label?; supportText?; error? }` | — | No | Per-part classes; `className` reaches only the leaf `<input>` | §8 |
| `id` | `string` | `useId()` | No | Field id; drives `htmlFor` and message ids | — |

Extends `Omit<ComponentProps<'input'>, 'size'>` (controlled/uncontrolled native passthrough to `Input`). Input's own `classNames` (wrapper/adornments) is **not** exposed — `TextFieldProps['classNames']` replaces it. Ref: `HTMLInputElement` (the native input).

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Props + `classNames` (three text parts). A `Field`-style compound API is out of scope (CLAUDE.md §8/§9 — not introduced without evidence).
- **`asChild`:** Not applicable.
- **Internal parts a consumer can realistically reach without forking:** label, support text, error container, leaf input. Not reachable: the root `<div>`, the required badge, the error icon, and Input's wrapper/adornment slots.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Default | Input default chrome; label above | Native | label ↔ input via `htmlFor`/`id` | `useFieldIds` | `TextField.test.tsx` "associates the label…" |
| Focus | Input's wrapper `focus-within` ring | — | — | Input | Input's `InteractionFocusRing` (not repeated here) |
| With support text | Secondary text below | — | `aria-describedby="{id}-description"` | `useFieldIds(id, hasDescription, hasError)` | `TextField.test.tsx` "shows supportText when there is no error" |
| Error (`error` set) | Danger border, red message + icon below the support text (both visible); start-adornment icon turns `icon-danger` | — | `aria-invalid="true"`, `aria-describedby="{id}-error {id}-description"` (each id only when that element renders) | `inputVariant = error ? 'error' : variant` | `TextField.test.tsx` error tests; `InteractionErrorWiring` story |
| Required | Badge next to label | Native constraint validation | native `required` | prop | `TextField.test.tsx` required tests |
| Disabled | Input disabled chrome | Native `disabled` | native | passthrough to Input | `Disabled` story |

## 7. Design Tokens — Figma Traceability

Figma was not re-inspected; no value in `TextField.tsx` carries a Figma citation. Control tokens are Input's (see `input.md` §7).

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Label typography/color | Not documented | `typo-label-m-bold`, `text-sds-text-primary` | `TextField.tsx` label | `Default` | none |
| Required tag | Figma `Tag` boolean (via `.figma.ts`) | `bg-sds-background-emphasis`, `text-sds-text-emphasis`, `typo-label-s-bold`, `rounded-sds-100 p-sds-50` | label badge | `Required`, `CustomRequiredText` | `TextField.test.tsx` |
| Vertical rhythm | Not documented | `gap-sds-100` (root), `gap-sds-50` (label/badge, icon/message) | root | — | none |
| Support text | Not documented | `typo-body-s text-sds-text-secondary` | support span | `WithSupportText` | none |
| Error message | `.figma.ts` comment: Error-state Support Text row shows red icon + red text | `text-sds-text-danger typo-body-s`, `IconExclamationCircle` 16px | error div | `ErrorState` | `TextField.test.tsx` |

## 8. Accessibility

- **Semantic element / role:** Native `<label>` + native `<input>`.
- **Accessible name:** From the label (default text `'ラベル'` if the consumer supplies nothing — a placeholder-like name). With `label=""`, the consumer must supply `aria-label`.
- **Keyboard interactions:** Native.
- **Focus management:** Delegated to `Input`.
- **Disabled semantics:** Native `disabled`.
- **Screen reader behavior:** `aria-invalid` and `aria-describedby` are set only from `error`/`supportText` (verified in `InteractionErrorWiring` and unit tests). The error message is not a live region, so it is announced on focus/description, not when it appears.

## 9. Theming

- **Light/dark behavior:** Semantic tokens only.
- **Verification method used:** Not verified in dark mode for this spec.

## 10. Market Benchmark

`market-benchmark.md` "Unify the three error state expressions" singles out TextField's dual signal (`variant='error'` and `error`) as an API-integrity risk; still open (Medium). Slot customization for TextField is addressed by `classNames` (`remediation-matrix.md` #5/#6/#7). `size` prop DEFERRED.

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| `htmlFor` pointed at `name`, no `aria-describedby`/`aria-invalid` | Pre-Foundation capability audit (documented in `useFieldIds.ts`) | Fixed — `useFieldIds()` | `TextField.test.tsx` "associates the label…"; `InteractionErrorWiring` |
| `aria-describedby` could dangle-reference the hidden support-text id when both `error` and `supportText` are set | Field-shell review | Fixed — description counted only when rendered | `TextField.test.tsx` "shows the error message and hides supportText…" |
| OVER-ABSTRACTION-08: label/message JSX duplicated with TextareaField | Logic audit | `remediation-matrix.md` #7 records FIXED, but current source still duplicates the label/badge/message JSX inline (no shared `FieldLabel`/`FieldMessages` exists) — only `useFieldIds` and `classNames` are shared/added | none |
| Code Connect mapped Figma's Error message to `supportText` instead of `error` | `figma-code-connect.md` §3 (2026-09-16) | Being fixed on this branch (`TextField.figma.ts` modified, uncommitted) | n/a (manual check per §11 item 4) |

## 12. Examples

```tsx
<TextField
  label="Work email"
  type="email"
  name="email"
  autoComplete="email"
  required
  requiredText="Required"
  supportText="We'll only use this for sign-in."
/>

// Error: the `error` prop is the only path that sets aria-invalid + aria-describedby
<TextField label="Password" type="password" error="Must be at least 8 characters" />

// React Hook Form (Sun stays a consumer target, not a form library)
<TextField label="Name" {...register('name')} error={errors.name?.message} />
```

## 13. Known Limitations

- **Error icon color fixed 2026-10-06.** The ⓘ icon in the error message inherited the message's `text-danger`; Figma Text Field `610:2971` uses `Icon/Danger` (light #dd2305 vs #c50e03, dark #fc593f vs #fd8c77). Now `text-sds-icon-danger`, tested in light and dark. Found by re-measuring every disabled/error variant against Figma — `figma:theme-check` compares Figma with `global.css` values, not which token the code applies.

- **Contrast (Figma token values, not fixed here):** `pnpm figma:theme-check fSzxt8wKkXsn8fmxkPBUr2 2002-1624` (2026-10-05): placeholder `text-placeholder` on the hover fill `surface-subtle-hover` is **4.12:1 in light** (4.61:1 on the resting background; 4.96/5.69:1 in dark). Placeholder text is not a label (Figma's own guideline notes it may not reach 4.5:1), but this needs designer confirmation.

- **Figma alignment 2026-10-05.** Figma `Text Field` (`610:2971`, file "Nova｜Master") showed `Status=Error` with **both** support text and the error message; code replaced support text with the error, and an earlier version of this spec claimed "no mockup shows both". Now both render. `TextareaField` deliberately keeps replacing: its own Figma `Text Area` Error variant (`598:2713`) shows only the error message (checked the same day).

- Dual error signal: `variant="error"` without `error` shows the red border but sets no `aria-invalid` (violates the spirit of `accessibility.md` §4.3 if used alone).
- `label` defaults to the placeholder string `'ラベル'`; omitting `label` does not omit the label.
- Error text is not announced when it appears (no live region).
- Root `<div>`, required badge and Input's wrapper/adornment `classNames` are unreachable.
- Code Connect maps Figma's Prefix/Suffix Icon to `startAdornment` / `endAdornment` (2026-10-06): it finds the Code Connect-mapped icon instances inside the `TextField` frame and renders them (`<IconMail />`), so a swapped icon follows the design.
- Code Connect correctness fixes (`error` vs `supportText`) are in progress on this branch — see `.claude/rules/figma-code-connect.md` §3.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-29 | Retroactive spec (no C/D run) | — | — | — | — | — | — | — | — | — | not scored | none known | Verified (no `/test` run; not scored) |

A Critical/P0 finding in any category forces the row's Status to FAIL regardless of the numeric total — the score is a summary, never an override.
