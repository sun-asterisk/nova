<!-- Component Specification — see docs/components/_template.md for the schema this extends. -->

# `Scrim` — Component Specification

## 1. Identity

- **Figma component name:** Scrim — property-less component `10930:5994`, documentation frame `10930:5489`, file `fSzxt8wKkXsn8fmxkPBUr2` ("Nova｜Master", the official file). Inspected 2026-10-07.
- **Code name:** `Scrim` (public, added 2026-10-07). `ModalOverlay` renders the same styles (`scrimStyles`).
- **Package export:** `@sun-asterisk/nova/scrim` and the package root. Type: `ScrimProps`.
- **Category:** Primitive — a presentational backdrop.

## 2. Status

- **Lifecycle status:** Verified.
- **Why it exists:** Figma defines Scrim as its own component with its own guideline. Made public on 2026-10-07 by explicit decision (the only in-repo consumer is `Modal`, which renders it automatically; the public `Scrim` serves consumers building their own overlay, e.g. a custom drawer).

## 3. Anatomy

| # | Element | HTML | Role | Notes |
|---|---|---|---|---|
| 1 | Root | `<div data-slot="scrim" aria-hidden="true">` | decorative | `fixed inset-0 z-50 bg-sds-background-scrim`, fade-in animation; `data-[state=closed]` fade-out for presence-aware parents |

No children (`children` omitted from the props).

## 4. API

| Prop | Type | Default | Description |
|---|---|---|---|
| (all `<div>` props except `children`) | `Omit<ComponentProps<'div'>, 'children'>` | — | `onClick` to close the front component when the backdrop is clicked; `className` e.g. for a different z-index |
| ref | `HTMLDivElement` | — | The scrim element |

## 5. Behavior (Figma guideline)

- Shows that the page behind is temporarily unavailable — an interaction element, not a decorative background. Not for transient, non-blocking notices (Snackbar).
- Fades in with the front component and fades out when it closes (CSS animation — collapsed by the global `prefers-reduced-motion` rule, design-foundation.md §5.4).
- When a click on the backdrop may close the front component, the **whole scrim** is the click target and the close happens immediately.
- Presentational only: no portal, focus trap or scroll lock — the front component owns those (`Modal` does via Radix Dialog).

## 6. Accessibility

- `aria-hidden="true"`: the scrim conveys nothing to assistive technology. A backdrop click is a pointer convenience; the front component must offer its own keyboard close (Escape / a close button).

## 7. Design Tokens

| Figma | Light / Dark | Implementation | Test |
|---|---|---|---|
| `Background/Scrim` | `#00000094` / `#000000b8` (`figma:theme-check` PASS) | `bg-sds-background-scrim` | `Scrim.test.tsx`, `Modal.figma.test.tsx` (light + dark, mutation-verified) |
| Full viewport | 1440×1024 frame | `fixed inset-0` | `Scrim.test.tsx` |

## 8. Theming

Verified in a light and a dark `data-theme` region (`Scrim.test.tsx`), `storybook` + `storybook-dark`.

## 9. Market Benchmark

MUI `Backdrop`, Chakra `ModalOverlay`, Mantine `Overlay`, Radix `Dialog.Overlay` — all expose the backdrop as its own part; Sun's `Scrim` is the minimal presentational equivalent.

## 10. Code Connect

`Scrim.figma.ts` maps Figma Scrim to `<Scrim onClick={() => {}} />`. Inside a Modal you do not render it: `ModalContent` renders it.

## 11. Known Limitations

- No built-in presence handling: to animate the fade-out the consumer (or a presence-aware primitive) must keep it mounted with `data-state="closed"` during the exit.
- `z-50` matches the other floating components; a stacked custom overlay may need its own `className` z-index.

## 12. Quality Score & History

| Date | Workflow | Total | Critical | Status |
|---|---|---:|---|---|
| 2026-10-07 | `/component` (new public export, Figma `10930:5994`) | 95/100 | none | Verified |
