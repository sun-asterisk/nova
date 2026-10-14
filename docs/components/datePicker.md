# `DatePicker` — Component Specification

## 1. Identity

- **Figma component name:** Date Picker (Foundations day-cell states referenced: `Style=Default/Today/Select/RangeStart/RangeEnd`, `State=Default/Hover/Focus`)
- **Figma file:** `FIGMA_FILE_KEY` — Sun Design System (`fSzxt8wKkXsn8fmxkPBUr2`)
- **Figma node/component URL:** `https://www.figma.com/design/fSzxt8wKkXsn8fmxkPBUr2/Nova%EF%BD%9CMaster?node-id=11864-19561` (panel set `11864:19567`, day set `12206:13709`; the guideline frames ガイドライン / デザイン仕様 in the same page are the behavior source for §4.2)
- **Code name:** `DatePicker`
- **Code Connect:** `src/components/datePicker/DatePicker.figma.ts` → `11864:19567` (2026-10-07)
- **Package export:** `@sun-asterisk/nova/date-picker` (subpath), also re-exported from the package root
- **Category:** Composite/Compound Component — a `Popover` (Radix) wrapping a `Calendar` (react-day-picker) plus an optional footer action bar; publicly exposed as a single non-compound `DatePicker` component (the sub-parts — `DatePickerButton`, `DatePickerDayButton`, `DatePickerBase`, `DatePickerPopover*` — are internal implementation, not part of the public API)

## 2. Status

- **Lifecycle status:** Verified
- **Last verified:** 2026-10-07 via `/component DatePicker + Calendar --figma <url>` (Figma alignment: field trigger with keyboard entry, range start/end fields, Figma range control flow, panel visuals — **breaking**, see §4.3)
- **Owner/last touched by:** Workflow D (modify), 2026-10-07 — see §14

## 3. Anatomy

| # | Element | HTML/Component | Role | Description |
|---|---|---|---|---|
| 1 | Root | `PopoverPrimitive.Root` (via `DatePickerPopover`) | — | Owns open/closed state; controlled internally by `DatePicker`'s own `open`/`setOpen` |
| 2 | Field | `<div data-slot="date-picker-field">` (Radix `Popover.Anchor`) | range: `role="group"` named by `aria-label`/`aria-labelledby` | Bordered Text Field chrome (`inputStyles`: border-strong, radius 4, h-40, focus-within ring, error border while `aria-invalid`). The popover is anchored to it |
| 2a | Date input(s) | `<input type="text">` — single: one; range: start `−` end | textbox | Shows the **committed** value, formatted by `formatLocale`; accepts typed dates (§4.2). `ref` targets the (start) input |
| 2b | Calendar button | `Button variant="plain" iconOnly` (via `DatePickerPopoverTrigger asChild`) | `aria-haspopup="dialog"`, `aria-expanded`, `aria-label={openCalendarLabel}` | Toggles the popover and moves focus into the grid |
| 3 | Popover content | `PopoverPrimitive.Content` (via `DatePickerPopoverContent`) | `role="dialog"` | Portal-rendered floating panel; `aria-label={calendarLabel}` (default `"日付選択カレンダー"`) |
| 4 | Calendar | `DayPicker` (react-day-picker, via `DatePickerBase`) | composite grid (react-day-picker's own semantics) | Renders 1 month (single mode) or 2 months side-by-side (range mode, default) |
| 5 | Month navigation | `PreviousMonthButton`/`NextMonthButton` (react-day-picker components, styled via `DatePickerBase`'s `classNames.button_previous/button_next`) | `aria-label="Go to the Previous/Next Month"` | A single `DayPicker` instance with `numberOfMonths={2}` synchronizes both visible months on navigation automatically (react-day-picker's own built-in behavior — not custom logic) |
| 6 | Day cell | `DatePickerButton` (via `DatePickerDayButtonAdapter`/`DatePickerDayButton`) | `<button>`, `aria-label` (full localized date via `Intl.DateTimeFormat` `dateStyle: "full"`, e.g. "Sunday, August 30, 2026" — the day stays a plain number so the visible text is part of the name, WCAG 2.5.3; see §13), `aria-selected` via `data-selected` | The individual, keyboard-navigable calendar day; carries `data-day` (ISO date), `data-selected`, `data-range-middle` |
| 7 | Action bar | `<div>` | — | Rendered only when `actions` is not `false` (default `true`); contains up to 3 `Button`s: Today / Clear / Apply, each individually hideable via `actions`'s object form |

## 4. API

| Prop | Type | Default | Required | Description | `component-api-conventions.md` rule |
|---|---|---|---|---|---|
| `mode` | `'single' \| 'range'` | `'single'` | No | Selection mode | §2 |
| `value` | `Date \| DateRange \| undefined` | — | No | Controlled value | §3 |
| `defaultValue` | `Date \| DateRange \| undefined` | — | No | Uncontrolled initial value | §3 |
| `onValueChange` | `(value: DatePickerValue) => void` | — | No | Fires on commit (immediately if `actions={false}`, on Apply otherwise) | §3 |
| `placeholder` | `string` | `'日付を選択'` | No | Placeholder of the single-mode input. Range mode uses `startDateLabel`/`endDateLabel` as its two placeholders (**2026-10-07**: previously one placeholder for the whole range button) | §4 |
| `disabled` | `boolean` | `false` | No | Disables the input(s) and the calendar button | §4 |
| `className` | `string` | — | No | Applied to the field wrapper (the bordered box) | §8 |
| `startDateLabel` / `endDateLabel` | `string` | `'開始日'` / `'終了日'` | No | Range mode: accessible names and placeholders of the two inputs. **New 2026-10-07** | §4 |
| `openCalendarLabel` | `string` | `'カレンダーを開く'` | No | Accessible name of the calendar button. **New 2026-10-07** | §4 |
| `actions` | `boolean \| DatePickerActionsConfig` | `true` | No | Footer action bar. `true` shows Today/Clear/Apply; `false` hides the footer entirely (selecting a day commits immediately); an object (`{ today?, clear?, apply? }`) shows/hides individual buttons. **Replaces the removed `showActions`/`showTodayAction`/`showClearAction`/`showApplyAction` booleans — breaking change, 2026-09-07.** | §12 |
| `numberOfMonths` | `number` | `2` (range) / `1` (single) | No | Number of months displayed side by side | §4 |
| `minDate` | `Date` | — | No | Dates before this are disabled; an already-selected value that becomes invalid is auto-cleared | §4 |
| `maxDate` | `Date` | — | No | Dates after this are disabled; same auto-clear behavior as `minDate` | §4 |
| `todayLabel` | `string` | `'今日'` | No | Today button label | §4 |
| `clearLabel` | `string` | `'クリア'` | No | Clear button label | §4 |
| `applyLabel` | `string` | `'適用'` | No | Apply button label | §4 |
| `formatLocale` | `string` | `'ja-JP'` | No | BCP-47 locale used to format the field's displayed date via `Intl.DateTimeFormat`, and (2026-10-07) to read the day/month order of typed numeric dates. **New, 2026-09-07** (additive, non-breaking). Distinct from react-day-picker's own `locale` prop (a date-fns `Locale` object, still available via pass-through) — that one controls the calendar's OWN internal i18n (month/weekday names); this one controls only the trigger label | §4 |

| `calendarLabel` | `string` | `'日付選択カレンダー'` | No | Accessible name of the calendar popover (`role="dialog"`). **New, 2026-09-29 (SC-07)**, additive — previously hard-coded. Default unchanged; override it for non-Japanese UIs (the same mixed-locale caveat as `todayLabel`/`clearLabel`/`applyLabel`/`placeholder` applies — every default is Japanese, each is individually overridable) | §4 |
| `id` | `string` | — | No | `id` of the date **input** (range: the start input), so `<label htmlFor={id}>` labels it. **2026-09-29 (SC-04)**; target changed from the trigger button to the input 2026-10-07 | §9 (field semantics) |
| `aria-label` / `aria-labelledby` | `string` | — | No | Single: the input's name. Range: the name of the `role="group"` holding both inputs (each input is additionally named by `startDateLabel`/`endDateLabel`) — for range, prefer these over `<label htmlFor>`, which only reaches the start input | §9 |
| `aria-describedby` | `string` | — | No | Description (helper/error text id) of the input(s) — both inputs in range mode | §9 |
| `aria-invalid` | `boolean \| 'true' \| 'false' \| 'grammar' \| 'spelling'` | — | No | Marks the input(s) invalid **and** (2026-10-07) shows the Text Field error border (Figma Date Picker guideline shows the field as a Text Field with Error Message); pair with `aria-describedby` → error text | §9 |

Also extends `Omit<ComponentProps<typeof DatePickerBase>, 'mode' | 'selected' | 'onSelect' | 'numberOfMonths' | 'id' | 'aria-label' | 'aria-labelledby'>` — i.e. every other react-day-picker `DayPicker` prop (`fromDate`, `toDate`, `weekStartsOn`, its own `locale` for calendar-internal i18n, etc.) passes through directly. `id`/`aria-label`/`aria-labelledby` are deliberately excluded from the pass-through and re-declared as trigger props (above): the trigger `<button>` is the focusable form control, and the calendar root only exists while the popover is open. (There is no `name`/hidden input — DatePicker does not participate in native form submission; serialize `onValueChange` yourself.)

**`DatePickerActionsConfig`** (exported type): `{ today?: boolean; clear?: boolean; apply?: boolean }`, each defaulting to `true` when `actions` is an object.

**Ref:** forwarded to the date `<input>` — the start input in range mode (`ComponentRef<typeof DatePicker>` is `HTMLInputElement`; was `HTMLButtonElement` before 2026-10-07, see §4.3).

### 4.2 Field entry & range control flow (Figma, 2026-10-07)

Source: the Figma page's ガイドライン frames (設計の原則 / 表示と制御 / 期間選択の制御フロー / 配置とレイアウト). Pure logic lives in the internal `dateLogic.ts` (`selectRangeDate`, `parseDateInput`), shared by `DatePicker` and `Calendar`, with one unit test per rule (`dateLogic.test.ts`).

| Behavior | Figma | Implementation |
|---|---|---|
| Keyboard direct input | 設計の原則: "慣れたユーザーのためのキーボード直接入力" | Typed text commits on **Enter or blur** (no Apply — user decision 2026-10-07, MUI/React Aria precedent) and is normalized to the display format. Accepted: any text with exactly 3 numbers (`2025年11月15日`, `2025/11/15`, `2025-11-15`, `2025.11.15`), or `20251115`. A 4-digit first number = y-m-d; otherwise `formatLocale`'s numeric order (`11/15/2025` en-US, `15/11/2025` en-GB); 2-digit year = 20xx. Impossible or out-of-`minDate`/`maxDate` dates revert; Escape restores the committed text; empty text clears (range end: clears only the end) |
| Opening | — | Click in an input opens the calendar **keeping focus/caret in the input**; the calendar button and ArrowDown (in an input) open it **with focus on the grid's roving day**. Opens on the month of the selected date (start date in range). Clicks/focus moving between the field's own parts never dismiss it. On close, focus returns to the input it was opened from |
| Placement | 配置とレイアウト: Bottom, left-aligned, flip to Top, right-align at the edge | Radix Popper: `side="bottom"`, `align="start"`, `sideOffset=4` (デザイン仕様 "4"), default collision handling flips/shifts |
| 1st / 2nd click | 基本フロー | 1st = start (end waits), 2nd = end; Apply waits for the end |
| Hover preview | 1回目のクリック → 選択中: In Range style from the start to the cursor | `range_preview` modifier from the start to the hovered day — **never** towards an earlier day (Figma Don't) |
| Earlier 2nd click | 例外: 開始日より過去 → new start, end cleared | `selectRangeDate` |
| Same-day 2nd click | 例外: 開始日と同じ → one-day range | `selectRangeDate`; the day keeps the full Select radius |
| Start field re-selection | 開始日フィールドをクリック: before end → only start; after end → end cleared, wait for end | `rangeTarget='start'` |
| End field re-selection | 終了日フィールドをクリック: after start → only end; before start → becomes the new start, wait for end | `rangeTarget='end'` |
| Click after a confirmed range (no field) | not specified | Starts a new range (react-day-picker / React Aria convention) |
| 今日 (Single) | move to this month, select today | Draft = today; calendar jumps to today's month |
| 今日 (Range) | today = new start, end cleared, wait for the end | Draft `{ from: today, to: undefined }`, `rangeTarget='end'` (was `{ from: today, to: today }`) |
| 適用 | disabled until the needed dates are selected | single: a date; range: both ends |
| クリア | disabled until at least one date is selected/entered | draft has a date (single) / a start (range) |
| No Cancel | Esc / outside click discards | Radix dismiss → draft resets from the committed value on close |

### 4.3 Breaking change (2026-10-07): field trigger

The `<button>` trigger became a Text Field with typed entry (single: one input; range: start/end inputs) plus a calendar button — required by the Figma guideline above. Released as a **major** version.

| Before | After |
|---|---|
| `ref` → `HTMLButtonElement` (trigger) | `ref` → `HTMLInputElement` (single input / range start input) |
| `id`/`aria-*` on the trigger button | on the input (range: `aria-label`/`aria-labelledby` name the group; `aria-describedby`/`aria-invalid` on both inputs) |
| `getByRole('button', { name: <value or placeholder> })` | `getByRole('textbox')` (value in `.value`); open with `getByRole('button', { name: 'カレンダーを開く' })` |
| range `placeholder` | `startDateLabel` / `endDateLabel` |
| Today (range) = `{ from: today, to: today }` | `{ from: today, to: undefined }` (Figma 今日（Range）) |
| range clicks: react-day-picker's extend/shrink algorithm | Figma 期間選択の制御フロー (§4.2) |

### 4.1 Controlled/uncontrolled state model (2026-09-29)

DatePicker is **controlled iff the `value` key is present in props** (`'value' in props`), not iff `value !== undefined`:

| Usage | Mode | Trigger shows |
|---|---|---|
| `value` omitted | Uncontrolled | internal state (initialized once from `defaultValue`) |
| `value={date}` | Controlled | `date` |
| `value={undefined}` | Controlled, empty | placeholder (`defaultValue` ignored) |
| `value` key removed at runtime | Uncontrolled again | internal state — only ever written while uncontrolled, so never a stale controlled value |

**Why this differs from Radix's `useControllableState`** (Checkbox/Switch/RadioGroup/Tabs, `prop !== undefined`): those values (`boolean`/`string`) are never legitimately `undefined` while controlled. DatePicker's value is — "no date selected" — and the idiomatic controlled pattern starts that way (`useState<DatePickerValue>()`). With `value !== undefined`, an empty controlled picker was silently uncontrolled: the first commit also wrote into internal state, and a later reset to `undefined` (form reset, A → B → `undefined`) re-displayed that stale date. Tests: `DatePicker.test.tsx:shows the placeholder when a controlled value is cleared to undefined…`, `:falls back to its own internal state when the value prop is removed entirely…`, `DatePicker.stories.tsx:InteractionControlledReset`.

### Breaking change (2026-09-07): `actions` replaces 4 booleans

`showActions`/`showTodayAction`/`showClearAction`/`showApplyAction` no longer exist. Per `docs/architecture/market-benchmark.md`'s own long-standing recommendation ("Collapse DatePicker's boolean explosion" — the three `show*Action` flags were each individually meaningless unless `showActions` was also `true`), they were collapsed into a single `actions` prop:

```tsx
// Before (removed)
<DatePicker showActions showTodayAction showClearAction={false} showApplyAction />

// After
<DatePicker actions={{ clear: false }} />
```

This is an approved, intentional breaking change made as part of this component's own quality-improvement pass (not silently introduced) — see §14 for the before/after quality score.

## 5. Composition & Customization

- **Compound API vs. `classNames`:** Deliberately NOT a compound API (no `DatePicker.Trigger`/`DatePicker.Content` exported) — the internal parts (`DatePickerButton`, `DatePickerDayButton`, `DatePickerBase`, `DatePickerPopover*`) exist only to share code between single/range rendering paths, not as a public composition surface. `component-api-conventions.md`'s part-count rule doesn't push this into compound territory: unlike `Modal`/`DropdownMenu`, a consumer has no realistic reason to reorder or omit the calendar's internal pieces — the only meaningful axis of variation (single vs. range, which actions to show) is already covered by props.
- **`asChild`:** Not exposed on `DatePicker` itself (the trigger is a fixed `<button>` styled as a form field, matching `Input`'s bordered-box convention — see §7). `DatePickerButton` (internal) does support `asChild` via `Slot.Root`, but this is not part of the public surface.
- **Internal parts a consumer can realistically reach without forking:** none beyond the documented props — `className` reaches only the trigger button. This boundary is deliberate: `DatePickerButton`/`DatePickerDayButton`/`DatePickerBase`/`DatePickerPopover*` are not barrel-exported from `src/components/datePicker/index.ts` (only `DatePicker.tsx`'s own exports are), so there is no accidental public surface to maintain compatibility for.

## 6. State Matrix

| State | Visual behavior | Interaction behavior | Accessibility behavior | Implementation mechanism | Test coverage |
|---|---|---|---|---|---|
| Closed | Input(s) show the placeholder or the formatted committed value | Click in an input, the calendar button, or ArrowDown opens the popover; typing commits on Enter/blur (§4.2) | calendar button `aria-expanded="false"` | Radix `Popover` state lifted into `DatePicker` | `DatePicker.test.tsx` "DatePicker typed input" |
| Open | Popover renders calendar + optional action bar | `Escape` closes; outside click closes (Radix default) | `role="dialog"`, `aria-expanded="true"` | Radix `Popover` internal state, `open`/`onOpenChange` lifted into `DatePicker` | `DatePicker.stories.tsx:InteractionSelectToday`, `:InteractionDraftNotCommittedUntilApply`, `:InteractionFocusRingIntegrity`, `:InteractionRangeKeyboardFlow` |
| Day: default | `text-text-primary`, no fill | Click selects; Arrow keys move the roving cursor (Tab enters/exits the grid as ONE stop) | `aria-label` = full localized date | `DatePickerDayButton` modifier classes | Storybook (visual); axe a11y check runs automatically on every story (`.storybook/preview.ts`'s `a11y.test: 'error'`) |
| Day: today | `text-text-emphasis` (red), no fill unless also selected | Same as default | Same as default | `isToday` modifier check in `DatePickerDayButton` | Storybook (visual); axe |
| Day: selected (single) / range start / range end | `bg-surface-primary text-text-on-surface`, `rounded-200` on the appropriate corner(s) | Click toggles/moves selection | `data-selected="true"` | `DatePickerDayButton`'s `isSelected`/`range_start`/`range_end` modifier classes | `DatePicker.stories.tsx:InteractionFocusRingIntegrity` (radius), verified in both light and dark themes via a neutral browser harness |
| Day: range middle | `bg-surface-subtle`, `rounded-0` | Non-interactive endpoint, still focusable/clickable to restart selection | `data-range-middle="true"` | `range_middle` modifier | `DatePicker.stories.tsx:InteractionRangeKeyboardFlow` (axe scan covers this state) |
| Day: disabled (`minDate`/`maxDate`) | `text-text-disable`, **regular** weight, no fade (Figma Day State=Disabled; `opacity-50` and bold removed 2026-10-07) | Not clickable | native `disabled` attribute (react-day-picker sets this); exempt from contrast requirements per `.claude/rules/accessibility.md` §4.1 | `disabled` modifier passed through to `<button disabled>` | `DatePicker.test.tsx:clears a value that becomes disabled...` |
| Day: outside (adjacent month) | `text-text-secondary` unless selected | Clickable — a real, interactive, keyboard-focusable button (NOT the native `disabled` attribute) | same as default | `outside` modifier | `DatePicker.stories.tsx:InteractionFocusRingIntegrity`/`InteractionRangeKeyboardFlow` (axe catches contrast regressions here — see §7) |
| Day: focus-visible | 2px `border-focus` outline, `outline-offset-2`, radius matches the day's own `rounded-200`, no color transition | Real keyboard `Tab`/Arrow focus (arrow keys move focus across the whole grid, including month boundaries) | `:focus-visible` (native) | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus` in `DatePickerButton.tsx`; a `useEffect` in `DatePickerDayButton.tsx` calls `.focus()` when `modifiers.focused` becomes true (replicating react-day-picker's own default `DayButton`) | `DatePicker.stories.tsx:InteractionFocusRingIntegrity`, `:InteractionRangeKeyboardFlow`; also verified via a neutral non-Storybook browser + real keyboard presses |
| Day: range preview | `bg-surface-subtle` (In Range) from the start to the hovered day; the start takes the Range Start shape | Hover while only the start is set | — (visual only) | `range_preview`/`range_preview_start` modifiers from `DatePickerCalendarGrid` | `Calendar.test.tsx:range: hovering after the start previews…` |
| Field: disabled | `inputStyles` disabled variant; calendar icon `text-icon-disable` | Inputs and calendar button not focusable/clickable | native `disabled` | `DatePicker.tsx` | `DatePicker.test.tsx:disabled DatePicker disables the input and the calendar button` |
| Field: error | `inputStyles` error variant (`border-danger`) | Same as default | `aria-invalid` on the input(s) | `aria-invalid` → `variant: 'error'` | `DatePicker.test.tsx:shows the error border while aria-invalid` |
| Clear button | `disabled` until a draft value exists | Resets the in-progress draft (not yet committed) | native `disabled` | `hasSelectedValue` check in `DatePicker.tsx` | `DatePicker.stories.tsx:InteractionDraftNotCommittedUntilApply` |
| Apply button | `disabled` until the draft selection is "complete" (a single date, or both ends of a range) | Commits the draft and closes the popover | native `disabled` | `canApply` check in `DatePicker.tsx` | `DatePicker.stories.tsx:InteractionSelectToday`, `:InteractionDraftNotCommittedUntilApply` |
| Action bar: selective (`actions` object) | Only the requested buttons render | Same as above, per button | Same as above, per button | `actionsConfig.today/clear/apply` in `DatePicker.tsx` | `DatePicker.stories.tsx:SelectiveActions` |

## 7. Design Tokens — Figma Traceability

| Figma requirement | Source | Token | Implementation | Story | Test |
|---|---|---|---|---|---|
| Day cell corner radius (Select/RangeStart/RangeEnd/Hover) = 8px | `get_variable_defs`/`get_design_context` on Figma nodes for `Style=Select/RangeStart/RangeEnd`, `State=Hover` — all resolve to `radius-200` | `radius-200` | `DatePickerButton.tsx` base (`rounded-200`), `DatePickerDayButton.tsx` (`rounded-l-200`/`rounded-r-200` for range endpoints), `DatePickerBase.tsx` (`day`/`range_start`/`range_end`/`today` wrapper classNames) | `Single`/`Range` (visual) | `InteractionFocusRingIntegrity` asserts `getComputedStyle().borderRadius === '8px'` |
| Day-cell focus ring: 2px `border-focus`, offset outward, radius matches the day's own radius | `get_design_context` on the Figma "Style=Default, State=Focus" day symbol — Figma's own implementation is a separate absolutely-positioned `Focus Ring` div (44×44, -2px inset, `radius:10px` = 8px content radius + 2px outward offset) | `border-focus` | `DatePickerButton.tsx`: native CSS `outline` — a deliberate simplification vs. Figma's separate-div technique, consistent with every other focus ring in this codebase; native `outline` follows the element's own `border-radius` in modern browsers | `Single`/`Range` (visual) | `InteractionFocusRingIntegrity` asserts `outlineStyle`/`outlineWidth`/`outlineColor` resolve to the real `border-focus` token, immediately after focus (no color transition) |
| Field chrome | Figma guideline shows the trigger as a Text Field (label, 必須, support text, error message) | `inputStyles` (Input/TextField's own tv) | `DatePicker.tsx` field wrapper | `Invalid` story | `DatePicker.test.tsx` field semantics |
| Panel: Surface/Base, radius 16, **Elevation Lv.2**, no border, 4px below the field | `11864:19568` fills/radius/effect style + デザイン仕様 frame | `surface-base`, `radius-400`, `shadow-level-2` (was `level-5` + `border-basic` + `w-72`/`p-4` — not from Figma; corrected 2026-10-07, `design.md` §6.1 updated) | `DatePickerPopoverContent` | `Single` / `Range` | `DatePicker.test.tsx:popover matches the Figma panel` (light + dark: no border, 16px radius, level-2 shadow, 312px wide, 4px gap) |
| Header: padding 16/8, 40px Plain Medium icon buttons | `11864:19569` | `buttonStyles({ variant: 'plain', size: 'medium', iconOnly: true })` (was a 32px button with no focus ring) | `DatePickerCalendarGrid` | visual | — |
| Weekday row: 40×32, 12px regular Text/Secondary | `11864:19583` Week | `typo-body-s text-sds-text-secondary` (was 40×40 16px bold) | `DatePickerBase` `CalendarWeekday` | visual | — |
| Grid: padding 8 top / 16 sides+bottom, 2px between weeks; range months 24 apart | `11864:19583`, Range `Date Picker Container` gap 24 | `pt-sds-100 px-sds-200 pb-sds-200`, `mt-sds-25`, `gap-sds-300` | `DatePickerCalendarGrid` | visual | 312px width asserted |
| Footer: Border/Weak top, padding 16, gap 12, **Medium** buttons (Plain / Secondary / Primary) | `12219:18483` | `border-sds-border-weak p-sds-200 gap-sds-150`, `size="medium"` (was `py-2` + 28px buttons) | `DatePicker.tsx`, `Calendar.tsx` | visual | footer padding/border/40px button asserted |
| Outside-day / disabled-day text contrast | WCAG AA 4.5:1 minimum for normal text (`.claude/rules/accessibility.md` §4.1) | `text-text-secondary` for `outside`; `text-text-disable` remains correct for the native-`disabled` case (exempt) | `DatePickerDayButton.tsx` | `InteractionFocusRingIntegrity`/`InteractionRangeKeyboardFlow` (axe scans while the popover is open) | axe (`@storybook/addon-a11y`, `test: 'error'`) — caught the pre-fix violation directly |

**Bugs found and fixed across this component's 2026-09-07 audits (two passes: initial Figma-fidelity audit, then a quality-improvement pass):**

1. **Missing focus ring on every day cell.** `DatePickerButton.tsx`'s `tv()` base string had an unconditional `outline-none` alongside a bare `focus-visible:outline` and `focus-visible:outline-2` — `tailwind-merge` drops the bare `outline`, and the unconditional `outline-none` then permanently suppressed the ring. The exact bug class documented in `.claude/rules/design-foundation.md` §5.1, previously found in `Checkbox`/`RadioGroup`/`DropdownMenu`/`Snackbar`. Fixed by keeping only the gated `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus` chain.
2. **Wrong day-cell corner radius.** `rounded-100` (4px) was used where Figma's Select/RangeStart/RangeEnd/Hover states all measure `radius-200` (8px). Fixed across `DatePickerButton.tsx`, `DatePickerDayButton.tsx`, and `DatePickerBase.tsx`'s wrapper `<td>` classNames (the wrapper and the inner button both needed the same value or their corners would visually mismatch).
3. **Focus ring color flash on every keyboard move.** `transition-all`/`transition-colors` both include `outline-color` in their transitioned-property list. Since `outline-color` is unset while unfocused (computing as `currentColor` — the day's own text color, e.g. red for "Today"), the ring visibly animated from that wrong color to the correct blue over ~300ms on every focus move. Confirmed via `getComputedStyle().outlineColor` read immediately after a real keyboard `Tab` vs. ~400ms later (`rgb(221, 35, 5)` → `rgb(4, 100, 190)`). Fixed by scoping the transition to `transition-[background-color,box-shadow,color]`. Documented as a new rule in `.claude/rules/design-foundation.md` §5.1 — `Checkbox`/`Switch` likely carry the same latent bug (not fixed here, see §13).
4. **Outside-day text contrast failure (found via automated axe, quality-improvement pass).** `text-text-disable` (#959595 on white) measured 2.99:1 for `outside` (adjacent-month) days — a real WCAG AA failure, since these are genuinely interactive, non-`disabled` buttons (not exempt the way a truly `disabled` day is). Caught only once a Storybook story left the popover open when axe scanned (`InteractionFocusRingIntegrity`) — every earlier story closed the popover before its `play()` completed, so this violation went undetected until then. Fixed: `text-text-disable` → `text-text-secondary` (#5a5a5a, ~6.9:1) for the `outside` modifier only; the native-`disabled` case keeps `text-text-disable` (correctly exempt).
5. **Arrow-key navigation completely non-functional (found via a real-browser keyboard test, quality-improvement pass).** react-day-picker's own default `DayButton` calls `ref.current?.focus()` in a `useEffect` keyed on `modifiers.focused` (its arrow-key handlers only update which day IS that roving target in React state — they never move DOM focus themselves). `DatePickerDayButton` replaced the default `DayButton` for styling without replicating this effect, so `ArrowLeft/Right/Up/Down`/`Home`/`End`/`PageUp`/`PageDown` did nothing at all — confirmed via a neutral, non-Storybook browser + real keyboard `ArrowRight` presses (`document.activeElement` never changed across 10 presses). Fixed by adding a local `ref` + the same `useEffect` pattern, merged with the externally-forwarded ref via a small `mergeRefs` helper (same pattern as `Modal.tsx`/`ThemeProvider.tsx`). This was arguably the most severe finding of the two audits — Tab could reach exactly one day cell and keyboard users were then completely stuck, with the trigger and Tab-based reach being the *only* navigable elements.

Also newly documented in `.claude/rules/accessibility.md` §3.2/§7.10 (Date Picker / Calendar-grid-specific keyboard and contrast rules, added 2026-09-07) so future custom-`DayButton` implementations don't reintroduce bug #5, and future de-emphasized-but-interactive day states don't reintroduce bug #4.

## 8. Accessibility

Verified via real rendered DOM (neutral non-Storybook Vite+Playwright harness, Storybook interaction tests, and automated axe scans).

- **Semantic element / role:** Trigger is a native `<button>` with `aria-haspopup="dialog"`/`aria-expanded` (via Radix `Popover.Trigger asChild`); popover content is `role="dialog"` with `aria-label`; day cells are native `<button>`s with full localized `aria-label`s (react-day-picker's own default formatter, e.g. "Sunday, August 30th, 2026" — already accessible out of the box).
- **Accessible name:** Trigger's accessible name is, in order: `aria-labelledby` → `aria-label` → an associated `<label htmlFor={id}>` → its own text content (placeholder or formatted value); day cells' accessible names come from react-day-picker's default `aria-label` formatter.
- **Field association (2026-09-29, SC-04):** `id`, `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid` are applied to the trigger button (tested in `DatePicker.test.tsx` "DatePicker trigger field semantics"; mutation-verified — each test fails when the forwarding is removed). Usage:
  ```tsx
  <label htmlFor="due">Due date</label>
  <DatePicker id="due" aria-invalid={!!error} aria-describedby={error ? 'due-error' : undefined} />
  {error && <p id="due-error">{error}</p>}
  ```
- **Keyboard interactions (2026-10-07):** Tab reaches the date input(s) then the calendar button; typing + `Enter` commits a date (§4.2); `ArrowDown` in an input opens the calendar and moves focus to the grid; `Enter`/`Space` on the calendar button toggles it; the calendar grid is ONE Tab stop (a single roving `tabIndex=0` cell shared across all visible months — the correct ARIA composite-grid pattern, confirmed NOT one tab-stop per month); Arrow keys / `Home` / `End` / `PageUp` / `PageDown` move the roving cursor, including across month boundaries — this was completely broken before bug #5's fix (see §7); `Escape` closes the popover (Radix default).
- **Focus management:** Focus ring verified per §7 (fixed: missing ring, wrong radius, wrong-color flash, and the underlying arrow-key focus-movement bug). Radix `Popover` handles focus restoration to the trigger on close (not custom logic).
- **Disabled semantics:** Trigger uses native `disabled`; day cells use native `disabled` (react-day-picker sets this for `minDate`/`maxDate`-excluded days) — correctly distinct from the merely-de-emphasized `outside` state, which is NOT `disabled` and is held to the normal contrast bar (bug #4 fix); Clear/Apply buttons use native `disabled` based on draft-completeness.
- **Automated accessibility gate:** `.storybook/preview.ts` sets `a11y.test: 'error'`, so `@storybook/addon-a11y`'s axe scan runs after every story's `play()` and fails CI on any violation. This is real, working coverage — it directly caught bug #4 (contrast) once a story (`InteractionFocusRingIntegrity`) left the popover open at the end of its `play()` for the first time; every earlier story closed the popover before the scan ran, so the violation had been present but undetected.
- **Screen reader behavior:** Not independently re-verified with an actual manual screen-reader pass in either audit turn (relies on react-day-picker's and Radix `Popover`'s own established accessible defaults, both widely used, ARIA-compliant primitives, plus the automated axe gate above) — see §13.

## 9. Theming

- **Light/dark behavior:** All colors are semantic tokens (`text-text-primary`, `text-text-emphasis`, `text-text-secondary`, `bg-surface-primary`, `border-border-focus`, etc.) which resolve differently under `[data-theme="dark"]`.
- **Verification method used:** A neutral, non-Storybook browser harness rendered `DatePicker` under `<html data-theme="dark">` (built package CSS, real Playwright screenshot + `getComputedStyle()` contrast checks). Confirmed: trigger label (13.78:1), outside-day text (9.07:1), today's emphasis text (7.46:1), and the selected-day button's own text-vs-background (dark #1c1c1c text on light #e7e7e7 `surface-primary`, correctly inverted for dark mode) all pass comfortably. No dark-mode-specific bug was found.

## 10. Market Benchmark

Per `docs/architecture/market-benchmark.md` (§ Capability Gap Report / Component Deep-Dive):

- **Boolean-prop explosion — RESOLVED 2026-09-07.** `showActions`/`showTodayAction`/`showClearAction`/`showApplyAction` (5 booleans, 3 meaningless without a 4th) collapsed into a single `actions?: boolean | { today?, clear?, apply? }` prop, per the benchmark's own long-standing recommendation. `market-benchmark.md`'s Capability Gap Report table now marks "Boolean-prop discipline" as resolved for this component.
- **Locale/i18n — PARTIALLY ADDRESSED 2026-09-07.** Added `formatLocale` (BCP-47 string), a narrow fix controlling only the trigger's own `Intl.DateTimeFormat` label — explicitly NOT a full `useLocale`/`I18nProvider`-equivalent layer (no RTL, no translated default labels, no calendar-internal month/weekday-name localization beyond what react-day-picker's own pass-through `locale` prop already provides). The broader gap remains open and is unchanged in scope from the benchmark's original assessment.
- **Radix packaging inconsistency** (unified `radix-ui` meta-package vs. individual `@radix-ui/react-*` packages elsewhere in the library): unchanged, still a repo-wide convention decision, not specific to this component, out of scope for both audit passes.

Strengths already credited in the benchmark: "Sophisticated 3-layer state model (correctly implemented), best use of Radix data-attributes in the library, working Japanese localization defaults."

## 11. Regression Matrix

| Finding | Source phase | Status | Regression test |
|---|---|---|---|
| Boolean-prop explosion (`show*Action` × 4) | `market-benchmark.md` (Market/API capability audit) | **Fixed 2026-09-07** — collapsed into `actions` | `DatePicker.stories.tsx:SelectiveActions`; `test/api/datePicker.test-d.tsx` |
| No `locale`/date-formatting control | `market-benchmark.md` | **Partially fixed 2026-09-07** — `formatLocale` added (narrow scope, see §10) | `DatePicker.test.tsx:formats the trigger label using formatLocale` / `:defaults formatLocale to ja-JP` |
| Radix packaging inconsistency (unified `radix-ui` vs. individual packages) | `market-benchmark.md` | Open — repo-wide decision, not `DatePicker`-specific | none |
| Missing day-cell focus ring (`outline-none` + bare `outline` tailwind-merge drop) | Figma-fidelity audit, 2026-09-07 | Fixed | `DatePicker.stories.tsx:InteractionFocusRingIntegrity` |
| Wrong day-cell radius (`rounded-100` vs. `rounded-200`) | Figma-fidelity audit, 2026-09-07 | Fixed | `DatePicker.stories.tsx:InteractionFocusRingIntegrity` |
| Focus ring color flash from `transition-all` including `outline-color` | Figma-fidelity audit, 2026-09-07 | Fixed | `DatePicker.stories.tsx:InteractionFocusRingIntegrity` |
| Outside-day text contrast failure (2.99:1, WCAG AA violation) | Quality-improvement pass, 2026-09-07 (found via automated axe) | Fixed | `DatePicker.stories.tsx:InteractionFocusRingIntegrity`/`InteractionRangeKeyboardFlow` (axe gate) |
| Arrow-key navigation completely non-functional | Quality-improvement pass, 2026-09-07 (found via real-browser keyboard test) | Fixed | `DatePicker.stories.tsx:InteractionRangeKeyboardFlow` |
| Controlled value reset to `undefined` showed a stale date (`isControlled = value !== undefined`) | Code review, 2026-09-29 | Fixed — `'value' in props` (§4.1) | `DatePicker.test.tsx:shows the placeholder when a controlled value is cleared to undefined…`; `DatePicker.stories.tsx:InteractionControlledReset` |
| `data-day` built from `toISOString()` (UTC) — previous day in UTC+ timezones | Code review, 2026-09-29 | Fixed — local `yyyy-MM-dd` | `DatePicker.test.tsx:renders data-day as the local calendar date at local midnight` / `…at local end of day` |
| Day-cell hover ring shown on `disabled` (minDate/maxDate) days (design-foundation §5.3) | Code review, 2026-09-29 | Fixed — `enabled:hover:ring-*` | `DatePicker.test.tsx:gates the hover ring on :enabled so disabled days show no hover ring` |
| SC-04: `id`/`aria-label`/`aria-labelledby`/`aria-describedby`/`aria-invalid` reached react-day-picker, not the trigger — no `<label htmlFor>`/error association possible | External consumer verification, 2026-09-29 | Fixed — explicit trigger props | `DatePicker.test.tsx` "DatePicker trigger field semantics"; `test/api/datePicker.test-d.tsx` |
| SC-07: calendar dialog name hard-coded `日付選択カレンダー` | External consumer verification, 2026-09-29 | Fixed — `calendarLabel` (default unchanged) | `DatePicker.stories.tsx:InteractionCalendarLabel` |
| Field trigger, typed entry, range fields (Figma guideline) | Figma alignment, 2026-10-07 | Implemented (breaking, §4.3) | `DatePicker.test.tsx` "typed input", "popover" (range describe); `dateLogic.test.ts`; stories `InteractionTypedInput`, `InteractionRangeReselectEnd` |
| Range clicks used react-day-picker's extend/shrink algorithm instead of Figma's flow; Today (range) set start = end | Figma alignment, 2026-10-07 | Fixed | `dateLogic.test.ts`; `DatePicker.test.tsx` range describe; `Calendar.test.tsx` range tests |
| Panel had border + level-5 + fixed `w-72`/`p-4`; footer `py-2` + 28px buttons; weekday 16px bold; disabled days faded/bold | Figma alignment, 2026-10-07 | Fixed | `DatePicker.test.tsx:popover matches the Figma panel (light/dark)`; `Calendar.test.tsx:disabled days use the regular weight` |
| `DatePickerBase` declared its react-day-picker sub-components inline → the whole grid re-mounted on every parent re-render (lost the in-progress click once the hover preview added state) | Found while implementing, 2026-10-07 | Fixed — module-level components | `Calendar.test.tsx:single: clicking a day commits immediately…` (fails without the fix) |
| One-day range (start = end) lost its left radius (`rounded-l-0` from range_end won) | Found while implementing, 2026-10-07 | Fixed | `Calendar.test.tsx:range: a day before the start replaces the start; the same day makes a one-day range` |
| Same `transition-all` flash risk in `Checkbox`/`Switch` | Identified 2026-09-07, out of scope to fix here | Open — flagged in `.claude/rules/design-foundation.md` §5.1 | none |

## 12. Examples

```tsx
// Single date picker (uncontrolled)
<DatePicker
  mode="single"
  defaultValue={new Date()}
  onValueChange={(date) => console.log(date)}
/>

// With a visible label and error text (single)
<label htmlFor="due">お届け希望日</label>
<DatePicker id="due" aria-invalid={!!error} aria-describedby={error ? 'due-error' : undefined} />
{error && <p id="due-error">{error}</p>}

// Date range picker (controlled) — name the group of start/end inputs
const [range, setRange] = useState<DatePickerValue>();
<DatePicker mode="range" aria-label="予約期間" value={range} onValueChange={setRange} />

// Immediate-commit mode (no Today/Clear/Apply footer)
<DatePicker mode="single" actions={false} onValueChange={setDate} />

// Selectively hide one footer action
<DatePicker mode="single" actions={{ today: false }} />

// With date constraints
<DatePicker
  mode="single"
  minDate={new Date('2025-01-01')}
  maxDate={new Date('2025-12-31')}
/>

// English-formatted trigger label
<DatePicker mode="single" formatLocale="en-US" defaultValue={new Date()} />

// Disabled
<DatePicker disabled placeholder="日付を選択" />
```

## 13. Known Limitations

- **Day-button names (2026-10-14):** `DatePickerBase` replaces react-day-picker's default day label (date-fns `PPPP`, "Sunday, December 28th, 2025") with `Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone })` ("Sunday, December 28, 2025"). The ordinal "28th" does not contain the visible "28" as a word, so axe-core 4.14's `label-content-name-mismatch` (WCAG 2.5.3 Label in Name) failed every day button once Storybook 10.6 shipped it. "Today, " / ", selected" are unchanged. A consumer-passed `labels.labelDayButton` still wins, and a custom `dateLib` or `numerals` keeps react-day-picker's own label (Intl's Gregorian/latn output would not match their visible day). With `locale={ja}` the name is "2025年12月28日日曜日" (no word break around the number); not covered by the axe gate, since every story uses the default English locale. Guarded by `Calendar.test.tsx` ("names each day button with its visible day number as a plain word").
- **Figma との既知の差分（フォント）**: Figma ではこのコンポーネントの一部のテキストに Label/En 系スタイル（欧文 Inter）が使われているが、実装では Inter を使わない（既定 `system-ui`、ブランドフォントは Noto Sans JP）。Dev Mode の `font-family: Inter` はコードに書き写さない。Figma 側は今後の更新で Noto Sans JP に統一予定（`design.md` §3.1）。
- **`Checkbox`/`Switch` likely carry the same `transition-all`-includes-`outline-color` flash bug** fixed here for `DatePicker` — not fixed in this turn (scope discipline), flagged as a new P1 rule in `.claude/rules/design-foundation.md` §5.1 for a future pass.
- **`formatLocale` is a narrow fix, not a full i18n layer** — no RTL support, no translated default `placeholder`/`todayLabel`/`clearLabel`/`applyLabel` (these remain explicit override props), and it does not affect react-day-picker's own calendar-internal month/weekday-name localization (use its own pass-through `locale` prop, a date-fns `Locale` object, for that).
- **Radix packaging inconsistency** (unified `radix-ui` package vs. individual `@radix-ui/react-*` packages elsewhere) — unchanged, a repo-wide decision out of scope for this component alone.
- **No independent manual screen-reader verification** — accessibility relies on react-day-picker's and Radix `Popover`'s own established defaults plus the automated axe gate (`a11y.test: 'error'`), not a fresh manual screen-reader pass with VoiceOver/NVDA.
- **Range control flow is now Sun's own** (2026-10-07, §4.2) — react-day-picker's range algorithm is bypassed (only the clicked date is used), so its `min`/`max`/`excludeDisabled`/`resetOnSelect` range props have no effect through the pass-through.
- **Typed-entry formats:** month names are not parsed (`November 15, 2025` cannot be typed back in en-US; numeric `11/15/2025` can). No input mask / segmented field.
- **Calendar-internal language** (caption, weekday names) still follows react-day-picker's `locale` (default English); Figma shows Japanese (`2025年11月`, 日月火…) with the year/month numbers bold and 年/月 regular. Pass `locale={ja}` (date-fns) for Japanese; the bold/regular caption split is not implemented.
- **Field label / support text** around the field (shown in the Figma guideline) is composed by the consumer (`<label htmlFor>` + `aria-describedby`), as before — DatePicker does not render them.
- **Code Connect** (added 2026-10-07): `DatePicker.figma.ts` maps the panel set `11864:19567` → `<DatePicker>` (`Style=Range` → `mode="range"`; `Date Picker Actions` OFF → `actions={false}`; `-> Today Button`/`-> Clear Button` OFF → `actions={{ today: false }}` / `{{ clear: false }}`). Apply has no Figma toggle, so it is never emitted. `Backward`/`Forward` are not mapped: there is no prop that hides one side only. All 16 property combinations were rendered through a mock runtime and checked against `DatePicker`'s real `actions` behavior.
- **No persisted pixel-measurement regression story beyond `InteractionFocusRingIntegrity`** — that story does cover radius/outline as a byproduct of its focus-ring assertions, but there's no dedicated `PixelDimensionsMatchFigma`-style story measuring every other dimension (padding, gaps, month-caption height, etc.) against Figma.

## 14. Quality Score & History

| Date | Workflow | API | Composition | Accessibility | Logic | Design/Tokens | Theming | Storybook | Testing | Package | Total | Critical findings | Status |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| 2026-09-07 (pass 1) | Workflow D (Figma-fidelity audit) | 12/15 | 13/15 | 13/15 | 15/15 | 9/10 | 7/10 | 5/5 | 9/10 | 5/5 | 88/100 | none | Verified |
| 2026-09-07 (pass 2) | Workflow D (quality-improvement: non-breaking fixes + accessibility deep-dive + breaking API redesign) | 15/15 | 14/15 | 15/15 | 15/15 | 10/10 | 10/10 | 5/5 | 10/10 | 5/5 | 99/100 | none | Verified |
| 2026-10-07 | Figma alignment (F): field trigger + typed entry, range fields + Figma control flow, panel visuals; also fixed DatePickerBase re-mounting the whole grid on every parent re-render (inline sub-components) and a one-day range losing its right radius | 14/15 | 14/15 | 15/15 | 15/15 | 9/10 | 10/10 | 5/5 | 10/10 | 5/5 | 97/100 | none | Verified |

Pass 2 changes: API +3 (boolean explosion resolved; narrow `formatLocale` added — both scored per §10's honest accounting of what was and wasn't addressed); Composition +1 (internal-parts boundary now explicitly documented in §5, though still not a compound API by design); Accessibility +2 (arrow-key navigation bug — the most severe finding of either pass — found and fixed; automated axe gate confirmed working and credited); Design/Tokens +1 (contrast bug found and fixed, now covered by the axe gate); Theming +3 (real neutral-harness dark-mode verification performed, all contrast ratios confirmed passing); Testing +1 (`InteractionFocusRingIntegrity`/`InteractionRangeKeyboardFlow`/`SelectiveActions` stories now give the three original fixes plus both new-pass fixes persistent, automated regression coverage). Remaining -1 (Testing): no dedicated full pixel-measurement story beyond what the focus-ring story covers as a byproduct (see §13).
