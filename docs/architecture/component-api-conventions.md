# Sun Design System — Component API Conventions

**Status:** Living convention document. This codifies the conventions this codebase already mostly follows (per the market benchmark) so future components stay consistent by design rather than by accident. It does not introduce new capabilities — see `docs/architecture/market-benchmark.md` (Section F) for the reasoning behind each rule. §15–17 (added 2026-09-08/09) extend this doc's scope from prop/API *design* to the *test-file* conventions (`test/api/`, `.test.tsx`, `.stories.tsx` `play()`) that verify that design — kept in one document rather than split, since `/test` and `/component` already point here for both.

---

## 1. Controlled / Uncontrolled State

- For any component wrapping a Radix primitive, use Radix's own naming exactly for the concept it represents — do not invent a new name:
  - `onCheckedChange` for boolean-value controls (Checkbox, Switch).
  - `onValueChange` for scalar/selection controls (RadioGroup, Tabs, DropdownMenu's RadioGroup).
  - `onOpenChange` for visibility controls (Modal, Tooltip, DropdownMenu, DatePicker's internal popover).
- For a non-Radix component representing a lifecycle event rather than a value (e.g. Snackbar's `onClose`), a bare, argument-less callback is acceptable — but treat it as a distinct category from the `on___Change` family, not an inconsistency.
- `value`/`checked` + `onValueChange`/`onCheckedChange` (controlled) and `defaultValue`/`defaultChecked` (uncontrolled) must both be supported wherever a component has meaningful value state. Delegate to the wrapped Radix primitive's own controlled/uncontrolled resolution wherever one exists — do not reimplement it by hand.
- If a component keeps its own internal state mirroring a controlled/uncontrolled prop purely to drive styling (as `Switch` does), guard the write-back so the internal mirror never goes stale while controlled: sync it via an effect keyed on the controlled prop (see `Switch.tsx`'s `useEffect(() => { if (checked !== undefined) setUncontrolledChecked(checked) }, [checked])` for the reference implementation).

## 2. Disabled State

- Always a real native `disabled` HTML attribute (or the wrapped headless primitive's own `disabled`/`data-disabled`), styled via CSS `disabled:`/`data-[disabled]:` pseudo-selectors.
- Where a component's variant system needs to visually represent "disabled" as a `tv()` variant key (to unify with its other visual states), derive it internally (`const effectiveVariant = disabled ? 'disabled' : variant`) — never expose `'disabled'` as an assignable value in the component's own public `*Variant` type. The public type should only ever contain values a consumer is meant to set directly.
- Disabled must suppress every other interactive visual (hover/focus/active) per `.claude/rules/design-foundation.md` §5.3 — this is automatic when using the native `disabled` attribute, since a disabled native element is unreachable by keyboard/pointer.

## 3. Error / Validation State

- `error?: string` (presence of a non-empty string = invalid + the message to display) is the convention for every form-adjacent component: TextField, TextareaField (already implemented this way) and, going forward, any new field-shaped component.
- `variant` is reserved for non-status visual axes only (Button's primary/secondary/danger, Badge's count/dot/label/error-as-a-category). Do not overload `variant` to also mean "this specific instance is currently invalid" going forward, even though several existing primitives (Checkbox, Input, RadioGroupItem, Textarea) still use `variant: 'error'` for this today — that pattern is a known, documented inconsistency (see `docs/architecture/market-benchmark.md` Improvement Catalog entry on unifying error-state expression) carried forward as a deliberate, deferred breaking-change candidate, not a pattern to copy into new components.
- New field-shaped primitives should accept an `error` prop from day one rather than adding an `'error'` value to their `variant` union.
- **Foundation capability implementation addition:** for the existing `variant: 'error'` components (`Checkbox`, `RadioGroupItem`), `aria-invalid` is now derived automatically from `effectiveVariant === 'error'` (disabled suppresses it, matching the same disabled-overrides-error precedent already used for visual styling) — zero new prop, and a consumer-supplied `aria-invalid` always wins since it spreads after the derived value. This is a stopgap consistent with the *existing* `variant: 'error'` inconsistency noted above, not a reversal of the decision to eventually unify error-state representation — when that unification happens, this derivation moves to read the new `error` prop instead of `variant`. `Switch` was independently verified (Foundation capability implementation) to have no error/`variant` concept at all — no aria-invalid was added to it; don't add one speculatively "for consistency" with Checkbox/RadioGroup.

## 4. Size

- `size?: 'small' | 'medium' | 'large'` is the canonical scale (Button's existing three values). Components needing only a subset (Switch currently ships `'medium' | 'large'`) may omit the values that don't apply, but must not introduce a fourth naming scheme (no `xs`/`sm`/`lg`/`compact` etc.).
- Only add a `size` prop when a component has a genuine density/scale axis confirmed by Figma — do not guess pixel values (see `.claude/rules/design-foundation.md` §6).
- It is acceptable for a component to have no `size` prop at all when no such axis exists (Badge, Divider, DropdownMenu) — omission is only a gap when the component is form-adjacent and a real density need exists (this is why Input/TextField/Textarea/TextareaField/Checkbox/RadioGroupItem are named in the Market benchmark benchmark as candidates, while Badge/Divider are not).

## 5. Variants

- `variant` describes visual hierarchy, emphasis, or a status *category* the design system itself defines (Button's `primary|secondary|emphasis|plain|danger`, Badge's `count|dot|label|error`, Snackbar's `info|success|error`) — never a boolean-shaped concern and never form-validation state (see §3).
- Every `tv()` variant key that's reachable through the public `variant` prop must correspond to a real, intentional design decision — no dead/unreachable variant values (verify against the component's actual call sites, not just the type).
- `compoundVariants` are appropriate when two or more variant axes interact non-trivially (Switch's size×checked×disabled thumb geometry is the reference example) — don't reach for them prematurely when independent per-axis classes are sufficient.

## 6. Events

- Native DOM event props (`onClick`, `onChange`, `onFocus`, `onBlur`, etc.) always pass through untouched via `...rest`/`...props` spreading — never intercepted or wrapped unless the component has a specific, documented reason (e.g. TextareaField's `handleChange` wrapper, which exists specifically to drive the character counter and always still calls the consumer's own `onChange`).
- When a component must intercept a native event for internal logic, always call the consumer's own handler too, and do so unconditionally (not gated behind internal logic succeeding) unless there's a specific, documented reason to swallow it (there is currently no such case in this library — flag it in review if one is proposed).
- See §1 for the `on___Change` naming family used for non-native, semantic state-change events.

## 7. Ref Forwarding

- Every component that renders a real DOM node uses `forwardRef`, typed precisely against the actual wrapped element/primitive: `ComponentRef<typeof RadixPrimitive.Root>` for Radix-wrapped components, or the concrete native element type (`HTMLButtonElement`, `HTMLDivElement`, etc.) for plain-HTML components. Never a loosely-typed `HTMLElement`.
- A component with no DOM node of its own (a pure Radix `Root`/`Provider` alias, or a component that only ever composes other already-ref-forwarding components with no wrapper element) correctly has no `forwardRef` — this is not a gap, it's the correct shape when there's genuinely no node to reference.

## 8. `className` and Slot Customization

Two customization idioms coexist in this library, chosen by part count:

- **2 or fewer visually-distinct internal parts beyond the root:** expose named `classNames.<part>` object props (or, for a small number of top-level parts, individually-named `*ClassName` props like Scrollbar's `viewportClassName`/`scrollbarClassName`/`thumbClassName`). This is the pattern now used by Scrollbar, Input (`classNames.wrapper/startAdornment/endAdornment`), Snackbar (`classNames.icon/content/actions/closeButton`), TextField and TextareaField (`classNames.label/supportText/error`).
- **3 or more conceptually independent, individually-composable parts:** expose a full compound API — separate exported sub-components, each taking its own plain `className` (Modal, DropdownMenu, Tabs).

Do not mix both idioms within the same component. When extending an existing component with a new customizable part, follow whichever idiom that component already uses.

## 9. Accessibility

- Delegate ARIA roles/state/keyboard behavior to the underlying Radix primitive wherever one exists — never re-declare an ARIA attribute Radix already sets correctly.
- Set an ARIA attribute directly in component code only when the component has information the headless layer doesn't (Snackbar's `role={variant === 'error' ? 'alert' : 'status'}`, Divider's `aria-orientation` derived from its own `orientation` prop — both are the reference examples).
- Every focusable element gets the standard focus-visible ring via `FOCUS_RING_OFFSET_2`/`FOCUS_RING_OFFSET_3` from `src/utils/focusRing.ts` (Foundation capability audit Foundation Capability Audit §4.3) — do not hand-type the Tailwind string; import the constant. Offset-2 for filled/shape elements, offset-3 for text-input elements, per `.claude/rules/design-foundation.md` §5.1 (Figma-confirmed exceptions exist either direction — check Figma, don't assume from element type). Never set `outline-none`/`focus-visible:outline-none` without providing this replacement ring in the same change.
- Any component that renders through a Radix `Portal` (overlays: Modal, DropdownMenu, Tooltip, DatePicker's popover) accepts and forwards a `container` prop to that Portal's own `container` — the established convention (Foundation capability audit §4.1), needed so `ThemeProvider`'s `scoped` mode can redirect portaled content into the scoped subtree. Match the existing pattern in any of those four components' source rather than inventing a new shape.
- Prefer driving interaction-state visuals off the wrapped Radix primitive's own `data-state`/`data-disabled`/`data-highlighted` attributes rather than hand-tracked React state mirroring the same information — this is both simpler and avoids the exact class of staleness bug found and fixed in `Switch` (see Logic audit/8 remediation).

## 10. Polymorphism (`asChild`)

- Add `asChild` (via `Slot`/`Slot.Root` from the `radix-ui` package) only to a component with a demonstrated real-world need to render as a different semantic element (Button, Tooltip's Trigger, Modal's Trigger/Close). Do not add it to every component "for consistency" — Badge, Divider, Checkbox, Switch, and similar components have no legitimate polymorphism need and should not carry the prop.
- Default `asChild` to `false` unless a documented accessibility reason justifies flipping the default (Tooltip's `TooltipTrigger` defaults it to `true`, with the rationale stated directly in its own JSDoc — follow that precedent for any future default flip, don't do it silently).
- If a component hardcodes its own children internally (Checkbox's `Indicator`) and therefore cannot meaningfully support `asChild` even though the type would otherwise inherit it from a wrapped Radix primitive, explicitly `Omit<..., 'asChild'>` from the public props type rather than leaving a type-permitted-but-broken option.

## 11. Public TypeScript Types

- Every component's own `*Props` type is always `export`ed — no exceptions. This is zero-cost and lets consumers write `ComponentProps & {...}`-style wrapper components without reaching into internal, non-exported types.
- Prop types derive from the underlying native/headless element's own types (`ComponentProps<'input'>`, `ComponentPropsWithoutRef<typeof RadixPrimitive.Root>`) rather than being hand-redeclared field-by-field, so the two can't drift independently.
- `Omit<...>` only for props that genuinely conflict with a same-named Sun-specific prop — verify the omitted key actually exists on the underlying element before copying an `Omit` pattern from a sibling component (TextareaField's now-removed vestigial `Omit<..., 'size'>` — native `<textarea>` has no `size` attribute to conflict with — was exactly this kind of copy-paste-without-verification mistake).
- No `any` without an explicit, commented justification. No `@ts-ignore` — use a narrowly-scoped `@ts-expect-error` with a comment citing the specific upstream reason if a genuine, verified upstream typing gap must be worked around (see `DatePickerDayButton.tsx`'s adapter pattern for the preferred alternative: fix the mismatch with a correctly-typed wrapper rather than suppressing the error).

## 12. Boolean Props

- 1–2 independent, genuinely orthogonal booleans on one component are fine (Scrollbar's `showVertical`/`showHorizontal`, Divider's `flexItem`).
- At 3 or more booleans on one component, stop and check whether some of them are actually a single nested concern wearing multiple names. DatePicker's old `showTodayAction`/`showClearAction`/`showApplyAction` (each only meaningful when `showActions` was also true) was the example this rule exists to prevent recurring — collapsed into one `actions?: boolean | { today?, clear?, apply? }` config object on 2026-09-07 (breaking change, approved and shipped; see `market-benchmark.md`).
- Prefer composition/children over a boolean flag whenever the underlying capability is "show or hide a whole region with configurable content" rather than a single, atomic on/off switch.

## 13. Compound Components

- Flat named exports (`ModalTrigger`, `ModalContent`, `DropdownMenuItem`), matching this codebase's established convention — not dot-notation (`Modal.Trigger`).
- A compound API is only "complete" when every exported part actually works standalone, without requiring the consumer to reach into the underlying headless-UI package directly. Before exporting a compound part, verify its sibling parts exist and are also exported (DropdownMenu's `Sub`/`RadioGroup` shipping with no matching `SubTrigger`/`SubContent`/`RadioItem` was exactly this mistake, now fixed — see `remediation-matrix.md` Wave 4).
- Don't turn a Simple/Primitive component into a compound API unless 3+ genuinely independent parts justify it (see §8's part-count threshold, which applies to this decision too).

## 14. Motion

- Any component-driven animation should, in principle, respect `prefers-reduced-motion` — this is currently a systemic, library-wide gap (see Architecture audit's findings) best solved once at the Foundation/token layer rather than per-component. New components should not add motion that makes this gap worse, but fixing it globally is out of scope for individual component work.

## 15. API Contract Test Files (`test/api/`)

### 15.1 File organization — one file per component. No exceptions, no shared "misc" file.

- Every component's public API contract fixtures live in their own file: `test/api/<ComponentName>.test-d.tsx`, named to match the component's own folder under `src/components/<name>/` (e.g. `src/components/dropdownMenu/` → `test/api/dropdownMenu.test-d.tsx`, `src/components/datePicker/` → `test/api/datePicker.test-d.tsx`).
- **Never append a new component's fixtures to an existing file that covers a different component.** This repo previously had a single `test/api/component-api.test-d.tsx` covering 14 unrelated components in one file — found on 2026-09-08 to be actively harmful: every new `/component` audit's own instinct (correctly) was to append its component's block to "the API test file" rather than create a new one, and the file kept growing with no natural point at which a contributor would notice and split it. Split into one file per component that day; the rule exists specifically to stop this from re-accumulating.
- A component whose only meaningful public-API surface is a single, narrow assertion (e.g. a `classNames` slot shape — see §8) still gets its own file, not a shared "classNames slot APIs" file grouping several components together. Each file is scoped to exactly one component's public contract, full stop — even when the assertions inside it happen to test the same *pattern* (a slot API, a compound API, a polymorphic `asChild`) that another component's file also exercises.
- Each file is self-contained: import only what that one component's fixtures need, even if that means re-importing a shared dependency (e.g. `Button`) that another component's file also imports for its own JSX fixtures. Do not import across `test/api/*.test-d.tsx` files to "share" a fixture — each file must typecheck and read standalone.
- File header: a short comment naming the component, stating these are type-only checks run via `pnpm test:api`, and pointing back to this section — not the full rationale restated every time. See any existing `test/api/*.test-d.tsx` file for the reference shape.
- When `/component <Name>` or a manual API change touches a component's public props/ref/exported types, update (or create) that component's own `test/api/<Name>.test-d.tsx` — never bundle the update into a different component's file just because it's nearby in a diff.
- The `api` Vitest project (`vite.config.ts`) globs `test/api/**/*.test-d.tsx`, so a new correctly-named file is picked up automatically — no project-config change needed when adding one.

### 15.2 Coverage bar — mandatory, per component, no partial credit

A `test/api/<Name>.test-d.tsx` file is not "done" because it compiles. It is done when it satisfies every item below for that component's actual public surface. Found on 2026-09-08/09: the original single-file version of this test layer had drifted into spot-checking one or two props per component (whichever the audit that added them happened to touch) instead of covering the real surface — technically passing, but unable to catch most real breaking changes. Do not repeat that.

**The litmus test:** before considering a file finished, ask — *"Is there a realistic breaking change to this component's public API that would NOT make this file fail to typecheck?"* If yes, the file is missing an assertion. Keep adding until the honest answer is no.

Concretely, for every component's file:

1. **Every own prop gets its own assertion.** Every field the component itself declares on its `*Props` type (not inherited/passed-through native or Radix props) gets an explicit `expectTypeOf<XProps['field']>().toEqualTypeOf<...>()` — not a representative subset. If the component has 10 own props, the file has 10 (or more, see below) corresponding assertions, not 2–3.
2. **Every union/enum is checked exhaustively, not sampled.** A variant/size/orientation/mode/position type's `expectTypeOf` equality check must list literally every member of the union (copy it from the source type, don't approximate). At least one realistic JSX usage must exist per union member with materially different rendered behavior; for large unions (5+ members with similar behavior) every member still appears in the type check, but JSX sampling may cover a representative subset — never fewer than 2.
3. **Required vs. optional is asserted precisely.** A required field's `expectTypeOf` check must NOT include `| undefined`; an optional field's must. This is what actually catches a required↔optional narrowing/widening — get it backwards and the fixture silently stops protecting anything.
4. **Every native/inherited prop the component removes or narrows is asserted, not just implied.** E.g. `Omit<ComponentProps<'input'>, 'size'>` needs `expectTypeOf<XProps>().not.toHaveProperty('size')` (or an equivalent positive check that the field is gone) — don't rely on the reader noticing the `Omit` in source.
5. **Every ref-forwarding export in the file gets its own ref assertion.** A compound component with multiple `forwardRef` parts (e.g. `ModalContent` and `ModalTrigger`) needs a `ComponentRef` check for each one it exports, not just the root.
6. **Compound/multi-part APIs get a realistic full composition, not a 2-node fragment**, and — when there is more than one genuinely valid shape (controlled vs. uncontrolled, with vs. without an optional sub-part, single vs. range mode, etc.) — more than one shape is exercised.
7. **`classNames`/slot objects are checked key-by-key.** Every key in the object type appears in the `expectTypeOf` equality check, and at least one key is exercised in a JSX fixture.
8. **Every separately-exported public type gets its own direct assertion**, not just indirectly through `XProps['field']` — e.g. `BadgeVariant`, `ButtonVariant`, `DatePickerActionsConfig`, `ThemeMode` each get their own `expectTypeOf<TypeName>().toEqualTypeOf<...>()` in addition to whatever `Props` field references them.
9. **Every discriminant enum/union prop gets a commented-out invalid-usage example** directly beneath its valid-usage block (not just one example prop in the whole file) — per the file-level header's standing convention (`// @ts-expect-error` is not used; a plain comment documents what must not compile).
10. **No `any`, no `@ts-ignore`/`@ts-expect-error`, no cross-file imports** (§15.1) — a shortcut here defeats the point of a type-only contract fixture.

This checklist is not a suggestion to gold-plate every component equally — a component with 3 own props and no compound structure will naturally have a short file once items 1–10 are honestly satisfied; a component like `DatePicker` or `Modal` will naturally have a long one. The bar is "every real prop/type/ref/omission is covered," not "every file reaches some target line count."

## 16. Unit Test Files (`<Name>.test.tsx`)

**The litmus test:** before considering a component's unit-test coverage sufficient, ask — *"Is there a realistic logic bug in this component (state derivation, an effect, a ref, a controlled/uncontrolled transition, a callback) that would NOT make some test in this file fail?"* If yes, coverage is missing. This is the same discipline as §15.2, applied to runtime behavior instead of types.

`.test.tsx` exists specifically for logic that isn't reasonably observable through a Storybook `play()` — state derivation, effect cleanup, ref forwarding, controlled/uncontrolled transitions (see `Switch.test.tsx`/`TextareaField.test.tsx` for the reference shape). It is not a duplicate of what `play()` already covers; see §17 for the interaction/visual half of coverage.

1. **Every derived-state/computed-value branch gets its own test**, not just the default branch — if a value is computed differently for 3 input shapes, there are (at least) 3 tests, not 1.
2. **Controlled and uncontrolled behavior are both tested**, including the transition between them where the component supports switching (the `Switch` controlled→uncontrolled staleness bug — see `Switch.test.tsx` — is the reference precedent for why this specific transition needs its own test, not just each mode in isolation).
3. **Every callback prop (`onXxx`) is verified to actually fire**, with the correct argument(s), at the correct trigger — not merely that the component renders without crashing when the callback is passed.
4. **Every `forwardRef` export gets a ref-forwarding test** — the ref must resolve to the actual DOM node a consumer would expect (verified via `toBe`, not just `toBeTruthy`).
5. **Boundary/edge-case inputs are tested**, not just the happy-path value: empty/undefined/zero, a value that flips a derived boolean, a prop combination the component must reconcile (e.g. a value that becomes invalid after a constraint prop changes — see `DatePicker.test.tsx`'s `minDate`/`maxDate` auto-clear tests).
6. **Effects that register listeners/timers/observers are tested for correct cleanup** (no double-firing after rerender, no stale closure after prop change) wherever such an effect exists — not assumed correct because it "looks fine."
7. **Every previously-fixed regression for this component gets a dedicated test that would fail if the bug recurred** — cross-reference `remediation-matrix.md`/`component-logic-audit.md`/`component-capability-matrix.md` by component name (§6 of `.claude/commands/test.md` already requires this cross-reference; this item makes explicit that the output must be an actual test, not just a note that a finding exists).
8. **State-flag props (`disabled`, `error`, etc.) are tested to verify they actually change behavior**, not just that the component accepts the prop without crashing (e.g. a disabled control must be verified genuinely non-interactive, not just visually styled).
9. **Prop changes after mount are tested via rerender**, not only the initial-mount shape, wherever the component's behavior is meant to react to a later prop change.
10. **Assertions target public, observable behavior** (rendered DOM, attributes, callback invocations) — never an internal state variable name, a CSS class string as a proxy for "did the logic run," or any other implementation detail a refactor could break without changing actual behavior.

Same closing caveat as §15.2: this is not a target line/test count. A component with one simple derived value and no effects needs a short file once items 1–10 are honestly satisfied for its actual surface; `DatePicker`/`Modal`-shaped components will naturally need more.

## 17. Storybook Interaction Test Files (`<Name>.stories.tsx` `play()`)

**The litmus test:** before considering a component's Storybook coverage sufficient, ask — *"Is there a realistic interactive/visual regression (a missing focus ring, a keyboard interaction that stopped working, a state that stopped rendering correctly, an accessibility violation) that would ship unnoticed because no story's `play()` would catch it?"* If yes, coverage is missing.

This session's own history is the concrete evidence for why "the story renders" is not the bar: a missing focus ring (`Checkbox`, `RadioGroup`, `DropdownMenu`, `Snackbar`, `DatePicker`, `Scrollbar` — all found via `getComputedStyle()` after a *real* keyboard `Tab`, never from a screenshot or source read alone), broken arrow-key navigation (`DatePicker`), a completely non-functional hover-widen animation (`Scrollbar`), a real WCAG contrast violation (`DatePicker`), and a focus-visible ring that painted on PLAIN MOUSE HOVER with zero keyboard interaction (`DropdownMenu`, found 2026-09-10 — see item 9 below) all shipped and stayed invisible until a rigorous `play()` was written specifically to catch them — several past their component's own "Verified"/"Certified" sign-off, and the `DropdownMenu` hover-ring bug specifically shipped past a keyboard-only `InteractionFocusRingIntegrity` story that looked rigorous but tested the wrong interaction — it was caught by a human directly comparing the rendered component against Figma, not by any automated check in this repo.

1. **Every meaningfully-different, behaviorally-distinct state gets a story**, and if that state is interactive, a `play()` — disabled, error, loading, open/closed, checked/indeterminate, focus-visible. A purely visual variant showcase (no behavior difference) does not need one, but that decision must be a conscious judgment call each time, not a default.
2. **Every keyboard interaction documented in `.claude/rules/accessibility.md` §7's per-component checklist is exercised with real key presses** (`userEvent.tab()`/`userEvent.keyboard('{...}')`) in at least one `play()` — Tab order, Enter/Space activation, Arrow-key navigation, Escape dismissal, Home/End/PageUp/PageDown where applicable. Documented-but-unexercised keyboard behavior is not verified behavior.
3. **Focus-visible ring assertions use real `Tab` + `getComputedStyle()`**, not source inspection or a screenshot — the reference pattern is `DatePicker.stories.tsx`'s `InteractionFocusRingIntegrity` / `Scrollbar.stories.tsx`'s `InteractionFocusRingAndThumbSizing`. "The classes look right in `.styles.ts`" is exactly the false confidence this rule exists to prevent (see `.claude/rules/design-foundation.md` §5.1's own real-bug history).
4. **Every previously-fixed regression for this component gets a dedicated `play()` that would fail if it recurred** — same cross-reference discipline as §16 item 7, applied to interactive/visual bugs instead of logic bugs.
5. **Compound/multi-part components get at least one `play()` exercising the full realistic interactive flow** (open → interact with a nested part → close), not just a static render of the composition.
6. **Don't structure a `play()` to artificially avoid triggering a state that would surface a real problem.** `.storybook/preview.ts`'s `a11y.test: 'error'` runs axe after every `play()` completes — a story that always closes a popover/dialog before ending never lets axe scan that content. (`DatePicker`'s `InteractionFocusRingIntegrity` and `Scrollbar`'s `InteractionFocusRingAndThumbSizing` are the reference precedent: both are the first story for their component to leave a popover open at the end, and both caught a real, previously-shipped WCAG violation the moment they did.) At least one interactive story per component that opens a popover/menu/dialog should leave it open when `play()` ends, specifically so axe can scan the open content.
7. **A `play()` that only asserts DOM presence (`toBeInTheDocument()`) where real interaction is possible and meaningful is the Storybook-layer equivalent of a shallow API fixture** — if a click, hover, or key press would exercise more of the component's real behavior, do that instead of (or in addition to) a presence check.
8. **Testing-tool limitations are documented, not silently worked around by testing something weaker.** `userEvent.hover()` cannot reliably trigger a plain CSS `:hover` pseudo-class (see `Scrollbar`'s `data-hovered`-over-`hover:` fix, 2026-09-08) — when a component's own interactive behavior depends on real `:hover`, either drive it via a testable mechanism (real React state from pointer events, as `Scrollbar` was refactored to do) or explicitly document in the story why the assertion is verified externally (a neutral-browser check) instead.
9. **For any roving-tabindex composite widget (Menu, Listbox, Combobox, Tabs, RadioGroup, or anything else where the framework moves DOM focus in response to pointer hover, not only keyboard input), a `focus-visible:outline-*`-gated ring MUST be tested with a HOVER-ONLY interaction (`userEvent.hover()`, zero `Tab`/`keyboard()` calls anywhere in that assertion) in addition to a keyboard-driven one.** Found 2026-09-10 in `DropdownMenu`: Radix's Menu implementation calls `.focus()` on an item when the mouse merely moves over it (the correct ARIA composite-menu pattern — roving focus must follow hover so a subsequent Enter/click acts on the hovered item) — and Chromium's `:focus-visible` heuristic treats that programmatic, non-click focus as keyboard-like, painting the ring on every plain mouse hover. A keyboard-only test (`InteractionFocusRingIntegrity`'s original version) cannot catch this: it never exercises the hover-triggers-focus path at all. Two independent, real assertions are required: (a) hover-only shows the shared background/state highlight but NO ring, and (b) real keyboard navigation still shows a visible indicator. If Figma's own spec shows no distinct ring-based "Focus" state for the widget (as `DropdownMenu`'s "Menu Item" component does not), the correct fix is usually to remove the ring and rely on the shared hover/focus background as the WCAG 2.4.7 indicator — not to try to distinguish "real" keyboard focus from hover-triggered focus in CSS, which browsers do not reliably support.

Same closing caveat: the bar is "every real interactive/visual/accessibility-relevant behavior is exercised," not a target story count, and not every story needing a `play()`.

## 18. Storybook Story File Format — documentation completeness

§17 is about *behavioral* rigor (does a `play()` actually verify the right things). This section is about *documentation* completeness — found on 2026-09-09 to be genuinely inconsistent across the library: some components' stories have a full `parameters.docs.description` on the meta block and on individual stories, fully-described `argTypes`, and a JSDoc comment above every story; others have none of that, or only some. A reader relying on the rendered Storybook docs page (not the source) should never hit a gap.

**The litmus test:** could a new team member understand every prop, see a working example of every meaningfully-different state, and know what each story demonstrates — using *only* the rendered Storybook docs page, never opening the source file? If no, the story file is incomplete.

### 18.1 Meta block

- `title: 'Components/<Name>'`, `component: <Name>`, `tags: ['autodocs']` — already the universal pattern, keep it.
- `parameters.layout` set deliberately (`centered` for a small/inline component, `padded` or `fullscreen` for a layout-filling one) — not left at the Storybook default by omission.
- `parameters.docs.description.component` is **required, non-empty, and substantive** — it must describe the component's purpose and any notable capability/constraint (e.g. "presentational only, no portal — use `showSnackbar()` for a positioned toast instead"), not just restate the component's name. A component whose meta block omits this entirely is not documentation-complete.
- `argTypes` covers **every prop that takes a meaningful control** (variant/size/orientation/boolean/text/number props — not necessarily every native HTML passthrough attribute). Each entry has:
  - `description` — what the prop does, in user-facing terms (not a restatement of the TS type).
  - `control` — the correct control type for that prop's shape (`'select'` with `options` for a union, `'boolean'`, `'text'`, `'number'`).
  - `table.type.summary` — the literal type signature (e.g. `"'primary' | 'secondary' | ..."`), not just `'string'`.
  - `table.defaultValue.summary` — present whenever the prop has a real default (cross-check against the component's own JSDoc `@default` tag so the two never drift apart).

### 18.2 Per-story requirements

- **Every exported story constant has a JSDoc comment directly above it** stating what it demonstrates — this is not optional stylistic polish, it is what populates the autodocs panel for that story. A story with no comment is incomplete.
- **`parameters.docs.description.story`** is present for any story demonstrating non-obvious behavior (an interaction flow, an edge case, a customization pattern) — a plain variant showcase may rely on its JSDoc comment alone, but add the `description.story` too when it's not immediately self-evident from the name.
- **Canonical baseline story checklist** — the same list CLAUDE.md's own "Storybook" section already names, made concrete and checkable per component: `Default`, every meaningfully-different **variant**, every **size**, **Disabled** (if the component has a disabled state), **Loading** (if applicable), **Error** (if applicable), a **long/overflow content** edge case (if the component's layout can break under long content), an **empty content** edge case (if applicable), a **customization example** (using `classNames`/`*ClassName`/`asChild` if the component has one), and the `Interaction*` `play()` stories required by §17. Not every item applies to every component — but each item's absence should be a conscious "not applicable, because X" judgment, not silently missing.
- **Naming convention**: `Default` (never `Basic`/`Primary`/`Playground` used inconsistently across components for the same role), a variant story named after its literal variant value in PascalCase (`Primary`, `WithError`), a state story named for the state (`Disabled`, `TypeAlways`), and interactive regression stories prefixed `Interaction` (already the established convention — `InteractionClick`, `InteractionFocusRingIntegrity`, etc.).
- **File order**: `Default` first, then variant/size stories, then state stories (disabled/loading/error), then edge cases, then customization examples, then compound/composition examples, then `Interaction*` stories last — so a reader scanning top-to-bottom sees the component's basic shape before its edge cases and regression tests.

Same closing caveat as §15–17: this is not a target story count — a component with 2 variants and no disabled/loading/error states will naturally have a short file once every applicable item is honestly covered; a component like `DatePicker`/`Modal` will naturally need more.

---

These conventions are descriptive of what this codebase already does correctly in the majority case, made explicit so the minority-case inconsistencies documented in `docs/architecture/market-benchmark.md` don't recur as the library grows past its current 17 components.
