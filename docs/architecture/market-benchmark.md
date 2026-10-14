# Sun Design System — Market / API / Product Capability Benchmark

**Status:** Analysis only (Market benchmark). No source, config, package.json, exports, documentation, Figma, or CI was modified. Nothing was implemented. Every recommendation is a proposal pending explicit approval.
**Scope:** Sun Design System's public component API, composability, customization, accessibility interaction model, state management, and developer experience, benchmarked against MUI, Radix UI, React Aria, Chakra UI, shadcn/ui, Headless UI, Ant Design, and Mantine — verified against each library's actual current documentation/source, not memory.
**Explicit scope boundary:** Package audit already established, with reproducible evidence, that Sun's *packaging* (tree-shaking, subpath exports, CSS distribution, publish pipeline) is currently broken and not production-ready. This document evaluates a different question — **API and product-capability maturity** — and assumes, for the purpose of this comparison, that Package audit's packaging defects will be fixed. A library can have an excellent component API riding on a broken build pipeline (that is, in fact, Sun's exact current situation); this document does not re-litigate Package audit.

---

## A. Executive Summary

**Sun Design System's component API scores 58/100** against the current React component-library market, placing it at **"Solid Internal Library, approaching Advanced Internal Design System"** — a meaningful step below "Production-grade Design System" and well below "Market-leading."

**What earns the score it has:**
- Built entirely on Radix UI primitives for its interactive components — the same accessibility foundation Chakra v3 deliberately moved *toward* (via Ark UI) and shadcn/ui defaults to for the majority of real-world installs today. This is the single highest-leverage architectural decision a design system can make, and Sun made it correctly for 7 of its interactive components.
- Chose `tailwind-variants` over the more common `class-variance-authority` — a genuinely more capable choice for multi-part components (native slot support, built-in `tailwind-merge` deduplication) that most of the benchmarked libraries' Tailwind-based competitors (including shadcn/ui) don't have.
- Already ships working dark mode and a real, verified-functional CSS-variable branding override path (Package audit finding) — capability several benchmarked libraries (Ant Design's per-component override, Mantine's Tailwind story) handle less cleanly.
- Modal, DropdownMenu, Tabs, RadioGroup, and Tooltip all use genuine compound-component composition, structurally comparable to Chakra v3's Ark-UI-based rewrite and to shadcn/ui's own Dialog implementation.

**What holds the score down:**
- **No `slots`/`slotProps`-equivalent customization mechanism anywhere in the library.** Every benchmarked library except Ant Design has *some* answer to "let a consumer restyle/replace an internal part without forking" (MUI's `slots`/`slotProps`, Chakra's Slot Recipes, Mantine's `classNames`/`styles`). Sun has exactly one working example of even a partial answer to this (Scrollbar's `viewportClassName`/`scrollbarClassName`/`thumbClassName`), and the rest of the library defaults to either "no override surface at all" (Input's internal wrapper/adornment divs, Snackbar's six internal slots, TextField/TextareaField's label/support/error text) or "split into more components" (Modal/DropdownMenu/Tabs) — two incompatible idioms with no documented rule for which to use when.
- **Real, avoidable API inconsistency**, most concretely: "is this in an error state" is expressed three different ways across the library (`variant='error'`, a plain `error?: string` prop, `destructive?: boolean`); `disabled` is implemented four different ways internally for the same semantic outcome; `size` exists on only 3 of 17 components with no stated rule for which get it.
- **Capability Sun's own foundation (Radix) already provides for free but doesn't ship**: `Modal` documents `ModalDescription` in its own JSDoc and exports the type, but never implements the component (Radix's own `Dialog.Description` fixes exactly this); `DropdownMenu` re-exports raw, unstyled `Sub`/`RadioGroup` Radix primitives with none of `CheckboxItem`/`RadioItem`/`SubTrigger`/`SubContent` built on top, making submenus and checkbox/radio items effectively inaccessible through Sun's own API; `Switch` hand-tracks checked state in a `useState` instead of using Radix's own `[data-state]` attribute the way every sibling component in the library correctly does.
- **No polymorphism story for the component most likely to need one.** `Button` cannot render as `<a>`; only `Tooltip` (via a Radix-default flip) and `Modal`'s Trigger/Close (via manual Radix `asChild` passthrough) support it today.
- **No first-party form library, no React Hook Form binding story, and no locale/i18n layer** — the last of these is a category every benchmarked library except plain Radix-based ones addresses (React Aria's `useLocale`/`I18nProvider` is the clear standard-bearer here). `DatePicker` gained a narrow `formatLocale` prop on 2026-09-07 (BCP-47 string, controls only the trigger's own `Intl.DateTimeFormat` label — not a full i18n layer, not the calendar's own month/weekday labels, not action-button label translation); the broader gap (RTL, a real `useLocale`-equivalent, translated default labels) remains open.

**Verdict:** Sun is not a beginner library — its Radix foundation, token architecture, and several individually excellent components (Switch's controlled/uncontrolled handling aside, TextField's accessibility wiring, Scrollbar's slot API) are genuinely good engineering. What's missing is **consistency and a small number of specific "power APIs"** (a customization mechanism, polymorphism where it matters, complete use of Radix's own DropdownMenu/Dialog surface) rather than a fundamental architecture problem — closing the gap identified in this document is realistic within a small number of focused, low-risk changes, not a rewrite.

---

## B. Capability Gap Report

| Capability | Present in Sun today? | Present in market (which libraries)? | Gap severity |
|---|---|---|---|
| Slots / element-substitution customization | No (1 partial example: Scrollbar) | MUI (`slots`/`slotProps`, callback-aware) | High |
| Slot-level class/style targeting (without element substitution) | No | Mantine (`classNames`/`styles`), Chakra (Slot Recipes) | High |
| Global theme-level component default-prop override | No (only CSS-variable-level token override) | MUI (`components.X.defaultProps`), Mantine (`theme.components`) | Medium |
| Polymorphism (`as`/`component`/`asChild` on the components that need it) | Partial (Tooltip, Modal Trigger/Close only) | MUI, Mantine, Chakra v3 (`asChild`), Radix itself, shadcn | High (specifically for Button) |
| Consistent controlled-state naming | Partial (3 internally-consistent Radix-derived conventions, 1 outlier — Snackbar's `onClose`) | Chakra v3, Mantine (single consistent convention each) | Medium |
| Consistent "error state" expression | No (3 different mechanisms across the library) | MUI (`color='error'`, one axis), Chakra (status tokens) | Medium |
| Complete use of the underlying primitive's own compound API (DropdownMenu submenus/checkbox/radio items, Modal Description) | No (documented gaps in both) | Radix itself, shadcn/ui's Dialog (has `DialogDescription`) | High |
| Data-attribute-driven state styling used consistently (no redundant JS state) | Partial (Switch is the one outlier) | Radix (all primitives), React Aria (`data-hovered` etc.) | Low-Medium |
| First-party or well-documented form-library integration | No | Mantine (`@mantine/form`), community bindings exist for MUI/Chakra/AntD | Medium |
| Locale / RTL / i18n-aware formatting | Partial (DatePicker's `formatLocale`, added 2026-09-07, covers only trigger-label date formatting) | React Aria (`useLocale`, `I18nProvider`, 30+ languages) | Medium (High specifically for DatePicker) |
| Boolean-prop discipline (no unstructured multi-boolean explosion) | Yes (DatePicker's 4-boolean explosion collapsed into `actions` on 2026-09-07) | N/A — general best practice | None (resolved) |
| Reduced-motion respect for animations | No (confirmed systemic gap, architecture audit finding, outside this benchmark's scope but relevant to "genuinely accessible" framing) | Headless UI/Radix leave this to the consumer too, but React Aria handles it more consistently by default | Medium |
| Imperative toast API | Yes (via `sonner`) | Reasonable choice — Radix's own official Toast primitive ships no imperative API either (confirmed via Radix's own GitHub issue tracker) | None (not a gap) |
| Compound component API for complex overlays | Yes (Modal, DropdownMenu, Tabs) | Matches Radix, Chakra v3, Mantine, shadcn | None (strength) |
| Multi-part variant/slot styling system (`tv()`) | Yes | More capable than `cva` (used by shadcn) for this specific need | None (strength) |
| Working dark mode + verified CSS-variable branding | Yes (Package audit finding) | Matches or exceeds Ant Design/Mantine's ease of override | None (strength) |

---

## C. API Improvement Catalog

```
Capability: Slot-level customization for high-usage primitives (Input, Snackbar, TextField/TextareaField)
Current Sun API: Single root `className` only; Input's wrapper/adornment divs, Snackbar's icon/content/title/message/actions/closeButton, and TextField/TextareaField's label/support/error text all have zero override surface beyond forking the component.
Problem: A consumer needing a differently-sized adornment slot, a custom-styled Snackbar action row, or a restyled TextField label must either accept the fixed look or copy the entire component's source.
Real-world use case: A product team needs a Snackbar variant with a larger icon for a marketing surface, or an Input with a taller wrapper for a dense data-table inline-edit context — both routine asks in any design system's second year of adoption.
Industry precedent: MUI's `slots`/`slotProps` (mui.com/material-ui/customization/overriding-component-structure); Mantine's `classNames`/`styles` Styles API (mantine.dev/styles/styles-api).
Recommended API: Extend Scrollbar's own proven pattern (named `*ClassName` props) to Input (`wrapperClassName`, `startAdornmentClassName`, `endAdornmentClassName`) and Snackbar (`iconClassName`, `contentClassName`, `actionsClassName`); for TextField/TextareaField, extract the shared label/support/error JSX into a small internal `FieldLabel`/`FieldMessages` pair (already independently recommended in Logic audit for duplication reasons) and give each a `*ClassName` prop.
Affected components: Input, Snackbar, TextField, TextareaField.
Breaking change: No — purely additive props.
Complexity: Small per component.
Priority: High
```

```
Capability: Polymorphism on Button
Current Sun API: `Button` always renders a literal `<button>`; no `asChild`/`as`/`component` prop exists.
Problem: A "styled as a button, semantically a link" use case (a very common nav/CTA pattern) forces either duplicating Button's Tailwind classes on a raw `<a>`, or misusing `<button onClick={() => navigate(...)}>` for navigation — the latter directly violates `.claude/rules/accessibility.md` §1.1.
Real-world use case: "View details" / "Learn more" CTAs that must be real `<a href>` for SEO, right-click/open-in-new-tab, and screen-reader link semantics, but need Button's exact visual treatment.
Industry precedent: MUI's `component` prop (`<Button component={Link} to="/settings">`); Mantine's identical `component` prop; Chakra v3's Radix-inspired `asChild`; Radix's own `Slot`/`asChild` (which Sun already correctly uses on `Tooltip`/`Modal`).
Recommended API: Add `asChild?: boolean` to `Button`, using the unified `radix-ui` package's `Slot` (see Recommendation F.3 on packaging convention) — the exact mechanism Sun already uses correctly elsewhere, applied to the one component most likely to need it.
Affected components: Button.
Breaking change: No — additive, defaults to current behavior.
Complexity: Small.
Priority: High
```

```
Capability: Complete DropdownMenu compound API (CheckboxItem, RadioItem, SubTrigger, SubContent, ItemIndicator)
Current Sun API: `DropdownMenuSub`/`DropdownMenuRadioGroup` re-export bare, unstyled Radix `Root`-level primitives with no matching styled children — submenus, checkbox items, and radio items are exported but non-functional without a consumer reaching directly into `@radix-ui/react-dropdown-menu`.
Problem: This is capability Radix ships completely, documented in Radix's own anatomy (Root/Trigger/Portal/Content/Item/CheckboxItem/RadioGroup/RadioItem/ItemIndicator/Label/Separator/Group/Sub/SubTrigger/SubContent/Arrow — verified against radix-ui.com), that Sun's own wrapper simply never finishes wiring up.
Real-world use case: A "column visibility" menu with checkbox items, a "sort by" menu with radio items, a settings menu with a "Share" submenu — all extremely common dropdown-menu patterns that Sun's API cannot currently support without bypassing the design system.
Industry precedent: Radix itself (the primitive Sun is already paying the dependency cost for); shadcn/ui's own DropdownMenu registry component ships all of these.
Recommended API: Add styled `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` following the exact thin-wrapper pattern already used for `DropdownMenuItem`/`DropdownMenuContent`.
Affected components: DropdownMenu.
Breaking change: No — additive.
Complexity: Medium (4 new thin wrapper components, following an established pattern).
Priority: High
```

```
Capability: Modal Description
Current Sun API: `ModalDescriptionProps` is exported and referenced in JSDoc `@example` blocks, but `ModalDescription` itself is never implemented.
Problem: Following Modal's own documented usage verbatim throws a ReferenceError; separately, no current Modal usage in the codebase wires `aria-describedby`, which surfaces Radix Dialog's own dev-console warning ("Missing Description or aria-describedby") on every instance (confirmed via Radix's own GitHub issue tracker, #3579/#3007).
Real-world use case: Every dialog that needs a screen-reader-announced description beyond its title (nearly all confirmation/form dialogs).
Industry precedent: Radix's own `Dialog.Description`; shadcn/ui's Dialog ships a working `DialogDescription` using the identical thin-wrapper pattern Sun already uses for `ModalTitle`.
Recommended API: Implement `ModalDescription` as a `forwardRef` wrapper over `DialogPrimitive.Description`, matching `ModalTitle`'s existing pattern exactly.
Affected components: Modal.
Breaking change: No.
Complexity: Trivial.
Priority: High (already flagged in Architecture audit as an implementation-integrity defect; restated here as a market-parity gap since it is capability every comparable library in this benchmark actually ships)
```

```
Capability: Switch driven by Radix's own `[data-state]`/`[data-disabled]` attributes instead of hand-tracked React state
Current Sun API: `Switch` keeps an internal `uncontrolledChecked` `useState` purely so `switchStyles({checked, disabled})` (a JS variant) can compute classes — duplicating what Radix's `SwitchPrimitive.Root` already stamps onto the DOM (`data-state="checked"|"unchecked"`, `data-disabled`).
Problem: Every sibling component in the library (Checkbox, RadioGroup, Tab, DropdownMenu, Tooltip) correctly drives its visual state off Radix's own data-attributes with zero extra JS; Switch alone reimplements this, and Logic audit already found a real, reproducible bug in the reimplementation (stale state across a controlled→uncontrolled transition).
Real-world use case: N/A — this is an internal-consistency and correctness argument, not a new consumer capability.
Industry precedent: Radix's own documented data-attribute convention, which every other Sun component already correctly follows.
Recommended API: Rewrite `switchStyles`'s `checked`/`disabled` variants as `data-[state=checked]:...`/`data-[disabled]:...` selectors (matching Checkbox's/RadioGroup's existing pattern) and delete the `uncontrolledChecked` state entirely.
Affected components: Switch.
Breaking change: No — internal implementation only.
Complexity: Small.
Priority: Medium-High (closes a correctness bug and a consistency gap simultaneously)
```

```
Capability: Unify the three "error state" expressions into one convention
Current Sun API: `variant='error'` (Checkbox, Input, RadioGroupItem, Textarea, Snackbar-as-status), a separate `error?: string` prop that is simultaneously a flag and a message (TextField, TextareaField, with both signals able to disagree), and `destructive?: boolean` (DropdownMenuItem, a related-but-distinct "dangerous action" concept).
Problem: A consumer moving between components has to relearn "how do I mark this as invalid" three times, and TextField/TextareaField's dual-signal design is a real API-integrity risk (`variant='error'` and `error=undefined` can be set simultaneously with undefined precedence documented).
Real-world use case: Building a form with mixed control types (a Checkbox next to a TextField, both potentially invalid) currently requires two different prop patterns for the same validation concept.
Industry precedent: MUI's single `error` boolean + `helperText` pairing used identically across `TextField`, `Checkbox`, `FormControl`; Chakra's `invalid` state token used the same way across its Field-wrapped components.
Recommended API: Standardize on `error?: string` (presence = invalid + message) for every form-adjacent component, with `variant` reserved exclusively for non-status visual axes (Badge/Button's actual use of the word). For components that currently use `variant='error'` only, either add a proper `error` prop alongside (deprecating the error-as-variant value over a documented migration window) or, at minimum, document today's dual-mechanism split as intentional so it stops looking like drift.
Affected components: Checkbox, Input, RadioGroupItem, Textarea, TextField, TextareaField, DropdownMenuItem (rename consideration only, lower priority).
Breaking change: Yes if `variant='error'` is actually removed; No if the fix is additive (a new `error` prop layered onto components that only have `variant` today) with the old path kept temporarily.
Complexity: Medium (touches many components; needs a deliberate migration plan, not a one-shot change).
Priority: Medium
```

```
Capability: A `size` prop family for form-adjacent primitives
Current Sun API: Only Button (3 values), Modal's `Content` (3 values), and Switch (2 values) have a `size` prop. Input, TextField, Textarea, TextareaField, Checkbox, RadioGroupItem have none.
Problem: A form needing a compact input (a common density requirement in data-table inline editing, filter bars) has no supported way to get one — only an arbitrary `className` height override, which itself violates the design-foundation rule against arbitrary bracket values.
Real-world use case: Any application with both a "comfortable" primary form and a "compact" data-table/filter-bar context — extremely common in enterprise internal tools, which is Sun's own stated primary audience.
Industry precedent: MUI's Input/TextField/Checkbox all share the same `size: 'small'|'medium'` axis as Button; Mantine's `xs|sm|md|lg|xl` scale applies uniformly across nearly all form components.
Recommended API: Add `size?: 'small' | 'medium'` (matching Button's existing smallest two values, to avoid introducing a fourth naming scheme) to Input/TextField/Textarea/TextareaField/Checkbox/RadioGroupItem, each mapping to the existing token scale's height/padding steps.
Affected components: Input, TextField, Textarea, TextareaField, Checkbox, RadioGroupItem.
Breaking change: No — additive with a sensible default matching current fixed sizing.
Complexity: Medium (new `tv()` variant per component, needs Figma source-of-truth confirmation per design-foundation.md §6 before picking exact pixel values — do not guess).
Priority: Medium
```

```
Capability: Collapse DatePicker's boolean explosion
STATUS (2026-09-07): IMPLEMENTED. `actions?: boolean | { today?: boolean; clear?: boolean; apply?: boolean }` replaced `showActions`/`showTodayAction`/`showClearAction`/`showApplyAction` (breaking change, shipped as part of the 2026-09-07 Figma-fidelity audit's approved quality-improvement scope). See `docs/components/datePicker.md` §4/§7 and `DatePicker.tsx`.
Current Sun API (historical, pre-2026-09-07): `disabled`, `showActions`, `showTodayAction`, `showClearAction`, `showApplyAction` (5 booleans). The three `show*Action` flags were each individually meaningless unless `showActions` was also true (verified: they were only read inside a `showActions &&` render gate).
Problem: 2⁴ theoretical combinations of the 4 action-related booleans, only a handful meaningful — an invalid-by-construction API shape.
Real-world use case: N/A — internal API-quality argument.
Industry precedent: React Aria's collection/config-object pattern for structured, related options; general "group related flags into one object" best practice, not tied to a specific library feature.
Recommended API (as implemented): `actions?: boolean | { today?: boolean; clear?: boolean; apply?: boolean }` — collapses 4 booleans into one prop whose absence/presence directly and only matters as a unit.
Affected components: DatePicker.
Breaking change: Yes — changed `DatePickerProps`'s public shape.
Complexity: Medium (touched the popover's action-bar render logic and every story using these props).
Priority: Medium (valuable, but batch with any other planned DatePicker API changes given the breaking-change cost — already flagged this way in Architecture audit). Batched with the `formatLocale` addition below in the same release.
```

```
Capability: Portal `container` passthrough for DropdownMenu and Tooltip
Current Sun API: Both hardcode their Radix `Portal` internally with zero props forwarded; Modal already has this capability via its separately-exported `ModalPortal`.
Problem: Radix's own `Portal` utility documents a `container` prop specifically for this ("choose a different container... by default appended to document.body") — a consumer embedding Sun inside a Shadow DOM host or needing a specific stacking-context container has no way to use it for these two components.
Real-world use case: A micro-frontend or Web-Component-wrapped host application, or any app needing dropdown/tooltip content scoped inside a specific stacking-context ancestor.
Industry precedent: Radix's own documented `Portal container` prop; matches what Sun's own Modal already correctly exposes.
Recommended API: Add an optional `container`/`portalContainer` prop to `DropdownMenuContent` and `TooltipContent`, forwarded to the internal Portal, mirroring Modal's existing (if underdocumented) pattern.
Affected components: DropdownMenu, Tooltip.
Breaking change: No.
Complexity: Trivial.
Priority: Low-Medium
```

---

## D. Top 20 Improvements (ranked by leverage)

1. Implement `ModalDescription` (trivial, closes a real bug + a market-parity gap simultaneously).
2. Add `asChild` polymorphism to `Button`.
3. Complete DropdownMenu's compound API (`CheckboxItem`/`RadioItem`/`SubTrigger`/`SubContent`).
4. Fix `Switch` to use Radix's own `[data-state]`/`[data-disabled]` attributes, removing the redundant/buggy internal state.
5. Add slot-level `*ClassName` props to `Input` (wrapper, adornments) — the highest-usage primitive with the worst current customization surface.
6. Add slot-level `*ClassName` props to `Snackbar` (icon, content, actions, close button).
7. Extract and reuse a shared `FieldLabel`/`FieldMessages` internal pair for `TextField`/`TextareaField`, each with `*ClassName` props (also closes a Logic audit duplication finding).
8. Add a `size` prop to `Input`/`TextField`/`Textarea`/`TextareaField` matching Button's smallest two values.
9. Add a `size` prop to `Checkbox`/`RadioGroupItem` for density parity with Switch.
10. Standardize the "error state" expression toward `error?: string` across all form-adjacent components (additive first, deprecate `variant='error'` later).
11. Collapse DatePicker's `show*Action` booleans into one `actions` config prop.
12. Add `container`/`portalContainer` passthrough to `DropdownMenuContent` and `TooltipContent`.
13. Document (in JSDoc/Storybook, not just inherited silently) the already-available Radix Popper props (`avoidCollisions`, `collisionPadding`, `sticky`, `collisionBoundary`) on `DropdownMenuContent`/`TooltipContent`/`DatePickerPopoverContent` — zero code change, pure discoverability.
14. Standardize Radix packaging: pick either the individual `@radix-ui/react-*` packages or the unified `radix-ui` meta-package as the one convention (currently split — 7 components use the former, DatePicker uses the latter) and record the decision (already flagged in Architecture audit §8).
15. Add a documented, first-party-recommended React Hook Form integration pattern (even without a dedicated binding package) for the form-adjacent components — a short guide showing the correct `ref`/`name`/`onChange` wiring per component, closing the "can I use RHF" DX gap every benchmarked library except Mantine also has to solve via documentation or a community package.
16. Add locale-awareness to `DatePicker`'s date formatting (currently hardcoded `ja-JP`/English defaults per an earlier hardening pass) — at minimum accept a `locale` prop, following the shape (not necessarily the full internationalization machinery) of React Aria's `useLocale` pattern.
17. Add a global `prefers-reduced-motion` rule at the Foundation/token layer (already Architecture audit's highest-leverage systemic fix; restated here because React Aria treats this as table-stakes and it directly affects the "genuinely accessible interaction model" framing of this benchmark).
18. Export every component's `*Props` type consistently (currently ~10 of 17 withhold it) — a zero-risk, purely additive fix that materially improves "can a TypeScript consumer discover and use the API without reading implementation source."
19. Decide and document the Snackbar/`sonner` architectural trade-off explicitly (this benchmark confirms it is a reasonable choice — Radix's own official Toast primitive ships no imperative API, per Radix's own GitHub issue tracker — but the decision should be written down, not silently inferred).
20. Publish a one-page "Ideal Sun API Principles" reference (see Section F below) so every future component follows one settled convention for controlled state, slots, polymorphism, and error state, preventing this exact class of drift from recurring as the library grows past 17 components.

---

## E. "Do NOT Implement" List

- **Do NOT adopt MUI's `sx` prop or an equivalent inline-style-object API.** Sun already has Tailwind utility classes plus `tv()` slots plus CSS-variable theming — three composable mechanisms that already cover everything `sx` solves (theme-aware shorthand values, responsive variants, one-off overrides). Adding a fourth, JS-object-based styling mechanism on top would directly contradict CLAUDE.md's own "do not create a parallel token system" principle and would fragment styling into two philosophies for no net capability gain.
- **Do NOT migrate the variant system from `tailwind-variants` to `class-variance-authority`** merely because shadcn/ui uses `cva`. `tv()` is a strict superset for Sun's actual need (native multi-part slots, built-in `tailwind-merge` dedup) — this benchmark's own research confirms `cva` alone lacks the slot concept Sun already depends on for Switch/DropdownMenu/Snackbar. This would be a regression dressed as market alignment.
- **Do NOT build a React Aria-style raw-hooks layer** (`useButton`, `useDialog`, etc.) under Sun's components. Sun's actual product need (styled, opinionated, ready-to-use enterprise components, per CLAUDE.md's own stated goal) is served by Radix's "give me an accessible component" model, not React Aria's "give me accessible DOM props, you build the component" model — adopting the hooks-first architecture would be a multi-month rewrite trading away exactly the "ready-to-use" property that makes Sun useful to its actual internal consumers today.
- **Do NOT adopt Ant Design's implicit `Form.Item` prop-injection pattern** (automatically cloning `value`/`onChange` onto an arbitrary child). This benchmark's own research found this is the exact mechanism that breaks React Hook Form integration for Ant Design (requiring a dedicated `react-hook-form-antd` shim library to work around it) — the opposite of the improvement Sun should be making (#15 above).
- **Do NOT chase full React Aria-style internationalization (30+ languages, full RTL layout engine) as a near-term goal.** This is real, valuable capability (see Capability Gap Report), but it is a large, ongoing investment matched to a component library whose primary current consumers are internal Sun Asterisk products — recommend the narrow `DatePicker` locale-prop fix (#16) now, and revisit full i18n only if a genuine multi-locale product requirement emerges.
- **Do NOT introduce a generic polymorphic `as`/`component` prop on every component "for consistency."** This benchmark explicitly found value in polymorphism only for `Button` (a real, common use case) — applying it to `Badge`, `Divider`, `Checkbox`, `Switch`, or other components with no legitimate "render as a different semantic element" use case would be exactly the kind of premature, unused API surface CLAUDE.md's own "avoid premature abstractions" principle warns against.
- **Do NOT migrate to Base UI** merely because shadcn/ui switched its default in July 2026. Sun's entire existing component set is built on Radix; Radix is confirmed still fully supported and not deprecated (per shadcn's own July 2026 changelog), and a migration would be a large, purely-cosmetic architectural change with no capability gain for Sun's actual gaps (identified above as slots, polymorphism-where-needed, and completeness of the existing Radix surface — none of which Base UI solves any better than Radix already can).
- **Do NOT build a first-party form library from scratch** (matching Mantine's `@mantine/form`) as a near-term priority. This is a legitimate, large investment that would meaningfully help DX, but the narrower, cheaper fix (#15, a documented RHF integration pattern) captures most of the near-term value at a fraction of the cost and risk.

---

## F. Ideal Sun API Principles

1. **Controlled state convention**: follow Radix's own naming exactly for anything built on a Radix primitive (`onCheckedChange` for boolean-value controls, `onValueChange` for scalar/selection controls, `onOpenChange` for visibility controls) — do not invent a new name for a concept Radix already names. For non-Radix components (like Snackbar), a fire-and-forget lifecycle event (`onClose`) is acceptable but should be explicitly documented as a distinct category from the `on___Change` family, not treated as an oversight.
2. **Error/validation state convention**: `error?: string` (presence = invalid + message) is the one and only mechanism for "this input is invalid" across every form-adjacent component. `variant` is reserved for non-status visual axes only (see Badge/Button's legitimate use).
3. **Slot/customization convention**: a component with 2 or fewer visually distinct internal DOM parts gets named `*ClassName` props (Scrollbar's proven pattern). A component with 3+ conceptually independent, individually-composable parts gets a full compound API (Modal/DropdownMenu/Tabs' proven pattern). Do not mix the two idioms within one component.
4. **Ref convention**: every component that renders a real DOM node uses `forwardRef` typed precisely against the actual wrapped element/primitive (`ComponentRef<typeof X>`, never a loosely-typed `HTMLElement`) — already the library's dominant, correct pattern; keep it.
5. **Polymorphism convention**: add `asChild` (via Radix `Slot`, matching Sun's existing correct usage on Tooltip/Modal) only to components with a demonstrated real-world "render as a different semantic element" need. Default to `false` unless a documented accessibility reason justifies flipping the default (Tooltip's precedent).
6. **Variant convention**: `variant` describes visual hierarchy/emphasis/status-category (Button's primary/secondary/danger, Badge's count/dot/label/error). It never describes interaction state (disabled) or binary boolean concerns (destructive-vs-not) — those get their own named boolean or are derived internally, never exposed as a synthesized variant string value in the public type.
7. **Disabled convention**: always a real native `disabled` HTML attribute (or the wrapped headless primitive's equivalent), styled via CSS `disabled:`/`data-[disabled]:` pseudo-selectors — never folded into a JS-computed variant string. (This principle, if adopted, would also resolve Checkbox/Input/RadioGroupItem/Textarea's current internal `effectiveVariant` pattern in favor of Button's simpler, already-correct approach.)
8. **Size convention**: `size?: 'small' | 'medium' | 'large'` (the Button/Modal precedent) for any component with a legitimate density axis; omit entirely (not a partial 2-value subset) for components with no such axis, and do not introduce a fourth naming scale.
9. **Composition convention**: prefer children/compound sub-components over a boolean flag whenever the underlying capability is "show or hide a whole region with configurable content" (Modal's Header/Body/Footer precedent). Reserve booleans for genuinely independent, orthogonal toggles (Scrollbar's `showVertical`/`showHorizontal` precedent) — 3 or more booleans on one component is the threshold to stop and reconsider (DatePicker crossed it).
10. **Public type convention**: every component's own `*Props` type is always `export`ed, with no exceptions — this costs nothing and the majority pattern (Modal, Tooltip, Switch, Divider, Scrollbar, DatePicker) already does it correctly.
11. **Data-attribute-first styling convention**: any component wrapping a Radix primitive drives its interaction-state visuals off Radix's own `[data-state]`/`[data-disabled]`/`[data-highlighted]` attributes exclusively — never a parallel, hand-tracked React state mirroring what Radix already exposes on the DOM (Switch is the one component to fix under this rule).

---

## G. Target API Examples

**Button polymorphism (Improvement #2):**
```tsx
// Before — impossible without duplicating Button's classes on a raw <a>
<a href="/settings" className="/* copy-pasted Button classes */">Settings</a>

// After
import { Button } from '@sun-asterisk/nova';
import { Link } from 'react-router-dom';

<Button asChild variant="primary" size="medium">
  <Link to="/settings">Settings</Link>
</Button>
```

**DropdownMenu with checkbox items and a submenu (Improvement #3):**
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild><Button variant="secondary">Columns</Button></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuCheckboxItem checked={showEmail} onCheckedChange={setShowEmail}>
      Email
    </DropdownMenuCheckboxItem>
    <DropdownMenuCheckboxItem checked={showRole} onCheckedChange={setShowRole}>
      Role
    </DropdownMenuCheckboxItem>
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>Export</DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        <DropdownMenuItem onSelect={() => exportAs('csv')}>CSV</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => exportAs('json')}>JSON</DropdownMenuItem>
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  </DropdownMenuContent>
</DropdownMenu>
```

**Input slot customization (Improvement #5):**
```tsx
<Input
  startAdornment={<SearchIcon />}
  wrapperClassName="h-12 rounded-200"   // taller, more rounded wrapper — no fork needed
  startAdornmentClassName="text-icon-emphasis"
  placeholder="Search users…"
/>
```

**Unified error-state convention (Improvement #10):**
```tsx
// Every form-adjacent component takes the same shape going forward:
<Checkbox error="You must accept the terms" />
<Input error="Email is required" />
<RadioGroupItem error="Please choose an option" value="a" />
// `variant` is no longer overloaded to mean "invalid" anywhere.
```

**DatePicker's collapsed actions config (Improvement #11):**
```tsx
// Before
<DatePicker showActions showTodayAction showClearAction={false} showApplyAction />

// After
<DatePicker actions={{ today: true, apply: true }} />
// or, to hide the whole action bar entirely (unchanged concept, cleaner API):
<DatePicker actions={false} />
```

---

## H. Component-by-Component Recommendations

| Component | Strengths | Weaknesses | Missing capability | Recommended action |
|---|---|---|---|---|
| **Badge** | Clean, minimal, correct `role="status"` | `label` silently ignored for `error` variant; `BadgeProps` not exported | None significant | Export `BadgeProps`; discriminated-union `label` (Logic audit findings, restated) |
| **Button** | Clean variant/size API, correct native `disabled` | No polymorphism, no `type="button"` default | `asChild` | Top-priority: add `asChild` (#2); add `type="button"` default (Logic audit) |
| **Checkbox** | Correct Radix delegation, good focus ring | `effectiveVariant` disabled-folding pattern; no `size`; no `error` prop (only `variant='error'`) | Slot for the Indicator icon | Standardize error convention (#10); add `size` (#9) |
| **DatePicker** | Sophisticated 3-layer state model (correctly implemented), best use of Radix data-attributes in the library, working Japanese localization defaults | 5-boolean explosion; no generic `locale` prop; `ModalDescription`-class gaps don't apply here but `DatePickerButton`'s own `asChild` capability is unused by `DatePicker` itself | `actions` config object; locale prop | Collapse booleans (#11); add `locale` prop (#16) |
| **Divider** | Minimal, correct `role="separator"` | Missing `aria-orientation`; accepts+silently-drops `children` (Logic audit) | None | Both are cheap, already-identified fixes; no new capability needed |
| **DropdownMenu** | Correct Trigger/Content/Item compound shape, correct data-attribute styling | Incomplete compound API (no CheckboxItem/RadioItem/SubTrigger/SubContent); no Portal container passthrough; missing focus ring (Logic audit Critical) | The 4 missing sub-components | Top-priority: complete the compound API (#3) |
| **Input** | Solid adornment support, correct focus-within ring | Zero slot customization beyond the leaf `<input>`; no `size`; three-way disabled-folding pattern shared with Checkbox/RadioGroupItem/Textarea | `*ClassName` slot props; `size` | Top-priority: add slot props (#5); add `size` (#8) |
| **Modal** | Full, correctly-structured compound API, working focus trap/restoration | `ModalDescription` documented but unimplemented; overlay hardcoded inside Content (no override path); `size` default doc/code mismatch | `ModalDescription` | Top-priority: implement `ModalDescription` (#1) |
| **RadioGroup/RadioGroupItem** | Correct Radix delegation, correct focus ring | No `<fieldset>`/`<legend>` in reference usage (Architecture audit); no `size`; same three-way error/disabled pattern as Checkbox | `size` | Add `size` (#9); fix reference story's fieldset usage |
| **Scrollbar** | **Best slot-customization example in the library** (`viewportClassName`/`scrollbarClassName`/`thumbClassName`) | Dual style-source-of-truth between `ScrollBarArea`'s inline defaults and `scrollbarStyles()` (Logic audit) | None — this is the pattern to generalize, not extend | Use as the reference implementation for Improvement #5's rollout to Input/Snackbar |
| **Snackbar** | Correct `role="alert"`/`role="status"` derivation, sensible imperative API given Radix's own Toast gap | Zero slot customization across 6 internal visual parts; no focus ring on close/action buttons (Logic audit Critical); architecturally the one non-Radix interactive component | `*ClassName` slot props | Add slot props (#6); fix the missing focus ring (carried from Logic audit) |
| **Switch** | Correct focus ring, dual controlled/uncontrolled support | The one component that hand-tracks state instead of using Radix's own `[data-state]` — and has a real bug because of it (Logic audit) | None — fix, don't add | Top-priority: rewrite to use Radix data-attributes (#4) |
| **Tabs** | Correct 4-part compound API, correct data-attribute styling | JSDoc documents nonexistent `badgeLabel`/`icon` props (Logic audit); `defaultValue` unnecessarily required | None significant | Fix the documentation drift; make `defaultValue` optional |
| **TextField** | Best-verified accessibility wiring in the library (`useFieldIds`, tested `aria-invalid`/`aria-describedby`) | No slot customization for label/support/error; dual `variant`/`error` signal | `*ClassName` slot props | Extract shared `FieldLabel`/`FieldMessages` with slot props (#7) |
| **Textarea** | Correctly uses `focus-visible` (the stricter, better-targeted choice vs. Input's `focus-within`) | No `size`; no adornment support (asymmetric vs. Input) | `size` | Add `size` (#8) |
| **TextareaField** | Shares TextField's correct accessibility wiring | Same slot-customization gap as TextField, plus a 5th slot (character counter) with no `aria-live` | `*ClassName` slot props; `aria-live` on counter | Same fix as TextField (#7); add `aria-live` |
| **Tooltip** | Correct, deliberate `asChild` default flip with documented rationale — the library's best example of thoughtful polymorphism | No Portal container passthrough | Portal `container` prop | Add container passthrough (#12) |

---

## I. Product-Level Recommendations

1. **Publish the "Ideal Sun API Principles" (Section F) as a living document** consumers and future component authors can reference — this is the single highest-leverage, lowest-cost fix, since nearly every inconsistency found in this benchmark (error-state naming, disabled-handling strategy, size-prop presence, slot-customization idiom choice) stems from the absence of a settled, written convention, not from any individual bad decision.
2. **Adopt one customization mechanism, deliberately, rather than two competing ones.** Scrollbar's `*ClassName` props are the right answer for 2-part components; the compound-component split is the right answer for 3+-part components. Both are already proven in this codebase — the fix is applying the existing right answer consistently (Input, Snackbar, TextField/TextareaField), not inventing a third mechanism.
3. **Treat "does this component fully use what Radix already gives us" as a standing checklist item** for any future Radix-based component, given this benchmark found two concrete instances (Modal's missing Description, DropdownMenu's incomplete compound set) of Sun paying for Radix's full capability while shipping only part of it.
4. **Decide the Radix-packaging-convention question** (individual `@radix-ui/react-*` vs. the unified `radix-ui` meta-package) once, and record it — currently split with no stated rule (Architecture audit finding, reconfirmed here).
5. **Write a short, official React Hook Form integration guide** rather than building a first-party form library — this captures most of the DX value the benchmarked libraries' own RHF community packages provide, at a fraction of the investment, and is a natural companion to the "Field" standardization work already worth doing per Logic audit.
6. **Treat the "error state" unification (Item C's #10) and the DatePicker boolean collapse (#11) as the two improvements most worth batching into a single, explicitly-versioned breaking-change release**, since both require touching public prop shapes — bundling them (rather than shipping either alone) minimizes the number of major-version bumps consumers have to absorb.
7. **Do not treat this benchmark's market-position gap as an architecture crisis.** Every specific gap identified here (slots, polymorphism-on-Button, DropdownMenu completeness, Switch's data-attribute fix) is a bounded, low-risk, mostly-additive change — the underlying architectural choices (Radix, `tailwind-variants`, compound components where they matter) are already correct and market-competitive; the work here is finishing what's already started, not starting over.

---

## Market Capability Matrix

| Capability | Sun | MUI | Radix | React Aria | Chakra v3 | shadcn/ui (Radix flavor) | Recommendation |
|---|---|---|---|---|---|---|---|
| Slots / element substitution | No | Yes (`slots`/`slotProps`) | N/A (unstyled by design) | Partial (render props) | Partial (Slot Recipes, theme-time) | No (thin wrapper, same gap as Sun) | Add named `*ClassName` props where needed (not a full `slots` clone) |
| Slot-level class/style targeting | Partial (Scrollbar only) | Yes | N/A | Yes (data-attributes) | Yes | No | Generalize Scrollbar's pattern |
| Compound components | Yes (Modal, DropdownMenu, Tabs) | Partial | Yes (native) | Partial (collection-based) | Yes (Ark UI-based) | Yes (same as Radix) | Keep; complete DropdownMenu's set |
| Controlled state (consistent naming) | Partial (Radix-derived components consistent; Snackbar an outlier) | Yes (`open`/`onClose`) | Yes (per-primitive convention) | Yes | Yes (`value`/`onValueChange`) | Yes (inherits Radix) | Document Snackbar's `onClose` as a deliberate different category |
| Polymorphism | Partial (Tooltip, Modal Trigger/Close) | Yes (`component`) | Yes (`asChild`) | N/A (you author the DOM) | Yes (`asChild`, v3) | Yes (`asChild`, inherits Radix) | Add to Button |
| Theme-level component default overrides | No (token-level only) | Yes (`components.X.defaultProps`) | N/A | N/A | Yes (recipes) | N/A (source-owned, edit directly) | Low priority — Sun's copy-in-source-adjacent token model already covers most of this need |
| CSS variables / token theming | Yes (verified working, incl. dark mode) | Partial (theme object, not pure CSS vars) | N/A | N/A | Yes | Yes (CSS vars, same philosophy as Sun) | Keep — a genuine strength |
| Form integration / RHF story | Undocumented (works via ref/native props, no guide) | Manual (`inputRef` gotcha) | N/A (unstyled) | N/A (hooks-level) | Manual (`Field`+`Controller`) | Manual (same as Sun, undocumented) | Write a short official guide (#15) |
| i18n / locale-awareness | No | Partial (via consumer's own i18n) | No | Yes (`useLocale`, 30+ languages) | No | No | Narrow fix: `DatePicker` locale prop only (#16) |
| Imperative toast API | Yes (`sonner`) | Yes (`Snackbar` component, not global queue) | No (Radix ships no imperative API — confirmed via Radix's own issue tracker) | Yes (`ToastQueue`, `UNSTABLE_`) | Yes | Yes (historically also reaches for a wrapper) | Keep — not a gap relative to the Radix ecosystem |
| Data-attribute-driven state styling | Mostly yes (Switch is the one exception) | N/A (CSS-in-JS driven) | Yes (native) | Yes (richer vocabulary, e.g. `data-pending`) | Yes (Ark UI-based) | Yes (inherits Radix) | Fix Switch (#4) |

---

## Final Verdict

### Current Market Position: **Solid Internal Library, approaching Advanced Internal Design System**

Sun Design System is meaningfully past "beginner" — its Radix foundation, `tailwind-variants` slot architecture, working dark mode, and several genuinely well-built components (TextField's accessibility wiring, Scrollbar's customization API, DatePicker's state model) are evidence of real engineering maturity. It is not yet a "Production-grade Design System" or "Market-leading" library, and the gap is specific and closeable, not systemic: a missing customization mechanism generalized from an already-working internal example, one component's incomplete use of a dependency it already pays for, one component's redundant state management, and a small number of naming inconsistencies that a single written convention document would prevent from recurring.

**What Sun Design System must become capable of before it can reasonably be considered a truly mature component library:**

1. A working, consistent answer to "how do I customize an internal part without forking" — today the answer is "you can't, except for Scrollbar."
2. Complete, not partial, use of every Radix primitive it already depends on (DropdownMenu's submenu/checkbox/radio items, Modal's Description) — the capability is already paid for and unused.
3. One settled, written convention for controlled-state naming, error-state expression, disabled-state implementation, and size-prop presence — enforced going forward, not re-derived per component.
4. Polymorphism exactly where it has real value (Button) and nowhere else.
5. A fixed, correctness-verified Switch that matches its siblings' data-attribute-driven approach.

None of these require new architecture, a new dependency, or a rewrite — they require finishing, standardizing, and correcting what the current 17-component library has already mostly figured out. This is precisely the situation in which a design system is closest to a genuine step-change in maturity: the hard architectural decisions are already made and mostly correct; what remains is disciplined completion.

**This document is analysis, benchmark, and recommendation only.** Implementation of the approved recommendations is tracked in `docs/architecture/remediation-matrix.md`.
