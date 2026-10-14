/**
 * Foundation Capability (see component-development-system.md §11.1) — a
 * shared implementation with a documented consumer-evidence/Stop-Condition
 * lineage, distinct from this directory's generic utilities (style.ts).
 *
 * Canonical focus-visible ring recipe — the single source of truth for a
 * class string that has independently appeared, and independently
 * regressed, across Button, Checkbox, Switch, RadioGroup, Modal, Snackbar,
 * Scrollbar, DatePicker/DatePickerButton, Textarea, Link, and Avatar.
 *
 * Two variants exist because exactly one axis of variation is genuinely
 * intentional (`.claude/rules/design-foundation.md` §5.1): 2px offset for
 * filled/shape elements, 3px for text elements — with confirmed,
 * Figma-sourced exceptions in either direction (e.g. `Avatar` is a filled
 * shape but Figma's own component uses 3px). Named by the literal CSS
 * property they set, not by an element-type story that has exceptions.
 *
 * Everything else about the ring (2px width, `border-focus` color, outside
 * placement via `outline` rather than `border`) is NOT a per-component
 * decision and must not vary.
 *
 * Composition rules for any component using these constants:
 *
 * 1. Never add an unconditional `outline-none` in the same class string.
 *    `tailwind-merge` treats a bare `outline` utility and `outline-2` as
 *    conflicting and drops the earlier one — harmless on its own, but if an
 *    unconditional (non-`focus-visible:`/non-`disabled:`-gated) `outline-none`
 *    is *also* present, it permanently sets `--tw-outline-style: none` and
 *    nothing ever restores it, so the ring never paints even on genuine
 *    `:focus-visible`. This exact bug was found and independently fixed in
 *    Checkbox, RadioGroup, DropdownMenu, Snackbar, DatePicker/
 *    DatePickerButton, and Scrollbar before this constant existed. A
 *    *gated* `disabled:focus-visible:outline-none` is fine (Checkbox/
 *    RadioGroup use it correctly to suppress the ring
 *    specifically on `:disabled`, per design-foundation.md §5.3).
 * 2. Never pair with `transition-all`/`transition-colors` on the same
 *    element. Both include `outline-color` in their transitioned property
 *    list; since `outline-color` is unset while unfocused (computing as
 *    `currentColor`), the ring visibly animates in from the element's own
 *    text color instead of snapping to `border-focus` instantly — a real,
 *    confirmed flash (found in DatePickerButton, Checkbox). Scope the
 *    transition to the specific properties that should animate instead
 *    (e.g. `transition-[background-color]`).
 * 3. A component whose visual structure genuinely can't use `outline` (e.g.
 *    `Tabs`, where `outline` paints outside the border-box and can never
 *    visually cover the trigger's own `border-b-2` active indicator
 *    underneath it — confirmed by rendering both together) should not force
 *    these constants in; build a component-local equivalent instead and
 *    document why, the way `Tabs.styles.ts` already does.
 * 4. A component whose Figma spec has no distinct focus-ring visual at all
 *    (e.g. `DropdownMenu`'s menu-item family, which relies on the shared
 *    hover/focus background as its WCAG 2.4.7 indicator) should not add a
 *    ring just for consistency — document the omission instead, the way
 *    `DropdownMenu.styles.ts` already does.
 * 5. A component whose focusable element is not the element the ring must
 *    surround (e.g. `Switch`: the focusable root is a transparent 44x44 tap
 *    area, while Figma's ring surrounds the smaller visible track) puts the
 *    same 2px / offset / `border-focus` recipe on the inner element with
 *    `group-focus-visible:` — written out literally, since Tailwind only
 *    generates class strings it can see in source — and documents it, the way
 *    `Switch.styles.ts` does.
 */
export const FOCUS_RING_OFFSET_2 =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sds-border-focus';

export const FOCUS_RING_OFFSET_3 =
  'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-sds-border-focus';
