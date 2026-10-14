# Accessibility Rules — WCAG 2.1 Level AA

These rules define the accessibility criteria that design system components must satisfy. They are applied by `/component`, `/test`, and the `sun-design-system` skill.

---

## 1. Semantic HTML

### 1.1 Interactive Elements

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Buttons** | Interactive elements that trigger actions MUST use `<button>` (or `Slot` with `asChild`), never `<div onClick>` or `<span onClick>` | P0 |
| **Links** | Navigation elements MUST use `<a href>` or router `<Link>`, never `<button>` for navigation | P0 |
| **Headings** | Page sections MUST use heading elements (`<h1>`–`<h6>`) in logical order, never skip levels | P1 |
| **Lists** | Groups of related items MUST use `<ul>`/`<ol>`/`<li>`, not `<div>` sequences | P1 |
| **Landmarks** | Page regions SHOULD use landmark elements (`<main>`, `<nav>`, `<aside>`, `<header>`, `<footer>`) or `role` equivalents | P1 |

### 1.2 Form Elements

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Labels** | Every `<input>`, `<select>`, `<textarea>` MUST have an associated `<label htmlFor={id}>` or `aria-label`/`aria-labelledby` | P0 |
| **Fieldsets** | Related form controls (radio groups, checkbox groups) MUST be wrapped in `<fieldset>` with `<legend>` | P1 |
| **Error association** | Error messages MUST be linked via `aria-describedby` pointing to the error element's `id` | P0 |
| **Required fields** | Required inputs MUST have `aria-required="true"` or the HTML `required` attribute | P1 |
| **Autocomplete** | Inputs for personal data SHOULD use the correct `autocomplete` attribute value | P2 |

### 1.3 Tables

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Structure** | Data tables MUST use `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` | P0 |
| **Headers** | `<th>` elements MUST have `scope="col"` or `scope="row"` | P1 |
| **Caption** | Tables SHOULD have a `<caption>` or `aria-label` describing the table's purpose | P1 |

---

## 2. ARIA Attributes

### 2.1 Required ARIA

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Roles** | Custom interactive widgets MUST have explicit ARIA roles (`role="dialog"`, `role="tablist"`, etc.) | P0 |
| **State** | Dynamic state MUST be communicated via ARIA (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-pressed`, `aria-disabled`) | P0 |
| **Live regions** | Content that updates asynchronously (toasts, error messages, loading states) MUST use `aria-live="polite"` or `role="alert"` / `role="status"` | P0 |
| **Descriptions** | Complex widgets SHOULD provide `aria-describedby` for supplemental instructions | P1 |

### 2.2 ARIA Prohibitions

| Criterion | Rule | Severity |
|-----------|------|----------|
| **No redundant roles** | Do NOT add roles that duplicate native semantics (`<button role="button">` is redundant) | P1 |
| **No abstract roles** | Never use abstract roles (`widget`, `input`, `section`, etc.) | P0 |
| **Valid values** | ARIA attribute values MUST be valid per the WAI-ARIA spec (e.g., `aria-expanded` takes `"true"` / `"false"`, not `"yes"`) | P0 |

### 2.3 Headless UI / Radix Components

Components built on headless UI primitives (Radix UI, Headless UI, etc.) inherit correct ARIA attributes automatically. When auditing these:

- Verify the primitive is used correctly (not detached or reimplemented)
- Verify consumer-provided labels (`aria-label`, `title`, dialog titles) are present
- Verify dialog descriptions are provided or explicitly suppressed

---

## 3. Keyboard Navigation

### 3.1 Focus Management

| Criterion | Rule | Severity |
|-----------|------|----------|
| **All interactive elements focusable** | Every clickable element MUST be reachable via Tab key. Use native `<button>`, `<a>`, `<input>` — not `tabIndex="0"` on `<div>` | P0 |
| **Visible focus indicator** | Focused elements MUST have a visible focus ring. Use `focus-visible:ring-2 focus-visible:ring-offset-2` or equivalent | P0 |
| **Logical tab order** | Tab order MUST follow visual reading order. Avoid positive `tabIndex` values | P0 |
| **No focus trap** | Users MUST be able to navigate away from any component using Tab/Shift+Tab (except modal dialogs) | P0 |
| **Focus restoration** | When a dialog/popover closes, focus MUST return to the triggering element | P0 |

### 3.2 Keyboard Interactions

| Widget | Expected Keys | Severity |
|--------|--------------|----------|
| **Button** | `Enter` / `Space` to activate | P0 |
| **Link** | `Enter` to activate | P0 |
| **Dialog** | `Escape` to close, focus trapped inside, Tab cycles through focusable children | P0 |
| **Tabs** | `Arrow Left`/`Arrow Right` between tabs, `Enter`/`Space` to select, `Home`/`End` to jump | P0 |
| **Select / Dropdown** | `Arrow Up`/`Arrow Down` to navigate options, `Enter` to select, `Escape` to close, type-ahead search | P0 |
| **Checkbox** | `Space` to toggle | P0 |
| **Radio group** | `Arrow Up`/`Arrow Down` between options, `Space` to select | P0 |
| **Tooltip** | `Escape` to dismiss, appears on focus (not just hover) | P1 |
| **Table** | Arrow keys for cell navigation (if interactive) | P2 |
| **Date Picker / Calendar grid** | `Tab` enters/exits the grid as ONE stop (single roving `tabIndex=0` cell, not one per day); `Arrow Left/Right/Up/Down`, `Home`/`End`, `PageUp`/`PageDown` move the focused day, including across month boundaries; `Enter`/`Space` selects | P0 |

### 3.3 Skip Links

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Skip to main** | Pages SHOULD provide a "Skip to main content" link as the first focusable element | P1 |

---

## 4. Color & Contrast

### 4.1 Text Contrast (WCAG 1.4.3 / 1.4.6)

| Element | Minimum Ratio | Severity |
|---------|--------------|----------|
| **Normal text** (< 18px, or < 14px bold) | **4.5:1** against background | P0 |
| **Large text** (>= 18px, or >= 14px bold) | **3.0:1** against background | P0 |
| **Disabled text** | Exempt from contrast requirements | — |
| **Placeholder text** | **4.5:1** (users may rely on it as a label) | P1 |

### 4.2 Non-Text Contrast (WCAG 1.4.11)

| Element | Minimum Ratio | Severity |
|---------|--------------|----------|
| **UI components** (buttons, inputs, badges, icons) | **3.0:1** against adjacent colors | P0 |
| **Focus indicators** | **3.0:1** against surrounding background | P0 |
| **Graphical objects** (charts, icons conveying meaning) | **3.0:1** | P0 |

### 4.3 Color Independence (WCAG 1.4.1)

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Not color alone** | Information MUST NOT be conveyed by color alone. Use icons, text, patterns, or underlines as secondary indicators | P0 |
| **Error states** | Error inputs MUST have more than a red border — add an error icon, error text, or `aria-invalid="true"` | P0 |
| **Status indicators** | Status badges MUST include text labels, not just colored dots | P1 |

### 4.4 Contrast Calculation

Use the WCAG 2.0 relative luminance formula:

```
L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin

Where R_lin = (R/255 <= 0.04045) ? R/255/12.92 : ((R/255 + 0.055)/1.055) ^ 2.4

Contrast Ratio = (L_lighter + 0.05) / (L_darker + 0.05)
```

For semi-transparent colors, composite onto the background before calculating.

### 4.5 Theme Modes

All contrast checks MUST pass in **both** Light and Dark themes. Semantic tokens that provide adequate contrast in one mode may fail in the other if their resolved values collapse.

---

## 5. Content & Media

### 5.1 Images

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Alt text** | Informative images MUST have descriptive `alt` text | P0 |
| **Decorative images** | Decorative images MUST have `alt=""` or `aria-hidden="true"` | P0 |
| **Icons** | Icons that convey meaning MUST have `aria-label` or adjacent visually-hidden text. Decorative icons MUST have `aria-hidden="true"` | P0 |

### 5.2 Icon Handling

For icon libraries (Remix Icon, Heroicons, Lucide, etc.):
- When paired with visible text (e.g., button with label + icon), the icon SHOULD have `aria-hidden="true"`
- When used as the sole indicator (e.g., icon-only button), the parent MUST have `aria-label`

### 5.3 Motion & Animation

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Reduced motion** | Animations MUST respect `prefers-reduced-motion: reduce`. Use `motion-safe:` prefix or media query | P0 |
| **No auto-play** | Content MUST NOT auto-play for more than 5 seconds without a pause mechanism | P1 |
| **No flashing** | Content MUST NOT flash more than 3 times per second | P0 |

---

## 6. Responsive & Touch

### 6.1 Touch Targets (WCAG 2.5.8)

| Criterion | Rule | Severity |
|-----------|------|----------|
| **Minimum size** | Interactive elements MUST be at least **24x24 CSS pixels**, SHOULD be **44x44** on touch devices | P0 |
| **Spacing** | If targets are smaller than 44px, they MUST have sufficient spacing to prevent accidental activation | P1 |

### 6.2 Zoom & Reflow (WCAG 1.4.4 / 1.4.10)

| Criterion | Rule | Severity |
|-----------|------|----------|
| **200% zoom** | Content MUST remain functional at 200% browser zoom | P0 |
| **Reflow** | Content MUST reflow to fit 320px viewport width without horizontal scrolling (except data tables, maps) | P1 |
| **Text resize** | Text MUST remain readable when resized up to 200% without assistive technology | P0 |

---

## 7. Component-Specific Checklists

### 7.1 Button

- [ ] Uses `<button>` element (or `<Slot>` with `asChild`)
- [ ] Has accessible name (visible text, `aria-label`, or `aria-labelledby`)
- [ ] `disabled` attribute used (not just visual styling)
- [ ] Focus ring visible on keyboard focus
- [ ] Loading state: `aria-busy="true"` when loading, label preserved for screen readers
- [ ] Icon-only buttons: `aria-label` provided

### 7.2 Input / TextArea

- [ ] Has associated `<label htmlFor={id}>` or `aria-label`
- [ ] Error state: `aria-invalid="true"` + `aria-describedby` pointing to error message
- [ ] Required: `required` or `aria-required="true"`
- [ ] Disabled: `disabled` attribute set, cursor changes
- [ ] Placeholder is supplemental, not a replacement for label

### 7.3 Select / Dropdown

- [ ] Trigger has `aria-haspopup="listbox"` or `role="combobox"`
- [ ] `aria-expanded` reflects open state
- [ ] Options have `role="option"` with `aria-selected`
- [ ] Keyboard: Arrow keys navigate, Enter selects, Escape closes
- [ ] Type-ahead: Typing filters or jumps to matching options

### 7.4 Dialog / Modal

- [ ] `role="dialog"` with `aria-modal="true"`
- [ ] Has `aria-labelledby` pointing to the dialog title
- [ ] Has `aria-describedby` pointing to description (or explicitly `undefined`)
- [ ] Focus trapped inside while open
- [ ] Focus returns to trigger on close
- [ ] Escape key closes the dialog
- [ ] Background content is `aria-hidden="true"` or `inert` when dialog is open

### 7.5 Tabs

- [ ] Tab list: `role="tablist"`
- [ ] Tabs: `role="tab"` with `aria-selected`, `aria-controls`
- [ ] Panels: `role="tabpanel"` with `aria-labelledby`
- [ ] Keyboard: Arrow keys between tabs, roving `tabIndex`
- [ ] Only selected tab has `tabIndex="0"`, others have `tabIndex="-1"`

### 7.6 Checkbox / Radio

- [ ] Uses semantic `<input type="checkbox|radio">` or headless UI primitive
- [ ] Has associated label via `htmlFor`/`id` pairing
- [ ] `aria-checked` / `data-state` reflects current state
- [ ] Radio group wrapped in `<fieldset>` with `<legend>`

### 7.7 Table

- [ ] Uses `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, `<td>`
- [ ] Sortable columns: `aria-sort="ascending|descending|none"` on `<th>`
- [ ] Has `aria-label` or `<caption>` describing the data
- [ ] Interactive rows: `role="row"` with keyboard navigation

### 7.8 Tooltip

- [ ] Triggering element has `aria-describedby` pointing to tooltip content
- [ ] Tooltip appears on focus, not just hover
- [ ] Escape dismisses the tooltip
- [ ] Content is text-only (no interactive elements inside)

### 7.9 Notifications / Toasts

- [ ] Container has `role="status"` or `aria-live="polite"`
- [ ] Error notifications use `role="alert"` (assertive)
- [ ] Toasts persist long enough to read (minimum 5 seconds) or have dismiss button
- [ ] Dismiss button is keyboard accessible

### 7.10 Date Picker / Calendar

- [ ] Trigger has `aria-haspopup="dialog"`/`aria-expanded`; popover content has `role="dialog"` with an `aria-label`
- [ ] Day cells have a real, localized accessible name (full date, not just the day number) that contains the visible day number as a word (WCAG 2.5.3 Label in Name) — an ordinal such as "December 28th" for a cell showing "28" fails axe-core 4.14's `label-content-name-mismatch`; react-day-picker's default `PPPP` label does exactly this, so `DatePickerBase` formats with `Intl` `dateStyle: 'full'` instead — found and fixed 2026-10-14 when Storybook 10.6 shipped axe-core 4.14
- [ ] `Tab` reaches the grid as ONE stop (single roving `tabIndex=0` cell), not one per day
- [ ] Arrow keys (`Left`/`Right`/`Up`/`Down`, `Home`/`End`, `PageUp`/`PageDown`) actually move DOM focus, including across month boundaries — **if a custom `DayButton`/day-cell component replaces the calendar library's own default, it MUST replicate the library's focus-management effect** (e.g. react-day-picker's default `DayButton` calls `ref.current?.focus()` in a `useEffect` keyed on `modifiers.focused` — arrow-key handlers only update which day IS that target in React state, they never move DOM focus themselves). A day-cell override that doesn't replicate this compiles and renders correctly but leaves keyboard users stuck on a single cell (P0)
- [ ] Disabled/outside-month days that are still real, non-`disabled`, interactive buttons (not exempted by the native `disabled` attribute) meet the normal 4.5:1 text contrast minimum — a de-emphasized-but-clickable day is NOT exempt the way a truly `disabled` day is (§4.1) — e.g. `DatePickerDayButton` uses `text-sds-text-secondary` (not `text-sds-text-disable`) for `outside` days

---

## 8. Scoring

When auditing a component, score each category on a 0–5 scale:

| Score | Meaning |
|-------|---------|
| 5 | Fully compliant, no issues |
| 4 | Minor issues (P2 only) |
| 3 | Some issues (P1, no P0) |
| 2 | Significant issues (1–2 P0) |
| 1 | Major issues (3+ P0) |
| 0 | Not implemented / completely inaccessible |

**Categories:**
1. Semantic HTML (5 points)
2. ARIA Attributes (5 points)
3. Keyboard / Focus (5 points)
4. Color / Contrast (5 points)

**Total: X/20**

**Verdicts:**
- **18–20**: COMPLIANT
- **14–17**: MINOR ISSUES — fix before release
- **10–13**: TO FIX — multiple accessibility barriers
- **0–9**: NON-COMPLIANT — critical rework needed
