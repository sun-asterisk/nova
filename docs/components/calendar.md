# `Calendar` — Component Specification

## 1. Identity

- **Figma component name:** "Date Picker" panel — component set `11864:19567` (`Style = Single / Range`, booleans `Backward`, `Forward`, `Date Picker Actions`, `-> Today Button`, `-> Clear Button`) inside the documentation frame `11864:19561`, file `fSzxt8wKkXsn8fmxkPBUr2` ("Nova｜Master"). Figma has no separate "Calendar" component: this set *is* the calendar panel, which `DatePicker` shows in a popover.
- **Code name:** `Calendar`
- **Package export:** `@sun-asterisk/nova/date-picker` (same subpath as `DatePicker`) and the package root. Types: `CalendarProps`, `CalendarActionsConfig`.
- **Category:** Composite component — Sun-styled react-day-picker grid + optional footer, no overlay.

## 2. Status

- **Lifecycle status:** Verified
- **Added:** 2026-10-06 — exposes the existing internal DatePicker panel as a public component (name `Calendar`, `./date-picker` subpath, immediate commit, Today/Clear only).
- **Why it exists:** a real consumer need — show the calendar inline without clicking a trigger. Market precedent: shadcn `Calendar`, React Aria `Calendar`/`RangeCalendar`, MUI `DateCalendar`, Mantine `Calendar`.

## 3. Anatomy

| # | Element | HTML | Role | Notes |
|---|---|---|---|---|
| 1 | Panel | `<div>` (ref target) | `role="group"`, named by `aria-label` (default `日付選択カレンダー`) or `aria-labelledby` | `rounded-sds-400 border border-sds-border-weak bg-sds-surface-base` |
| 2 | Grid | `DatePickerCalendarGrid` (internal, shared with `DatePicker`) → react-day-picker | grid / table semantics from react-day-picker | Same classNames, day cells (`DatePickerDayButton`), keyboard navigation as `DatePicker` |
| 3 | Footer | `<div>` | — | Today (`Button` plain) left, Clear (`Button` secondary) right; omitted when `actions={false}` or both buttons disabled by config |

## 4. API

| Prop | Type | Default | Description |
|---|---|---|---|
| `mode` | `'single' \| 'range'` | `'single'` | Selection mode |
| `value` | `DatePickerValue` | — | Controlled value. The **key** decides controlled mode (same rule as `DatePicker`): `value={undefined}` = controlled and empty |
| `defaultValue` | `DatePickerValue` | — | Initial value when uncontrolled |
| `onValueChange` | `(value: DatePickerValue) => void` | — | Fires on **every** selection — no Apply step. Range clicks follow Figma's 期間選択の制御フロー (shared `selectRangeDate`, see `datePicker.md` §4.2), so it also reports the in-progress `{ from, to: undefined }` |
| `numberOfMonths` | `number` | `1` single / `2` range | Months side by side |
| `minDate` / `maxDate` | `Date` | — | Days outside are disabled; a value that falls outside new bounds is cleared (`onValueChange(undefined)`), same as `DatePicker` |
| `actions` | `boolean \| { today?: boolean; clear?: boolean }` | `true` | Figma "Date Picker Actions" (default on). Today commits today and jumps to this month — in range, today becomes the new start and the end is cleared (`{ from: today, to: undefined }`, Figma 今日（Range）; was `{ from: today, to: today }` before 2026-10-07); Clear commits `undefined` and is disabled while empty. **No Apply**: Figma's footer is 今日 / クリア / 適用, but Apply only makes sense for the popover's draft — inline selection commits immediately (corrected 2026-10-07: this row used to claim Figma had no Apply) |
| `todayLabel` / `clearLabel` | `string` | `'今日'` / `'クリア'` | Localizable labels |
| `aria-label` / `aria-labelledby` | `string` | `'日付選択カレンダー'` / — | Name of the `role="group"` panel |
| `className` | `string` | — | Outer panel |
| ref | `HTMLDivElement` | — | The panel |
| pass-through | react-day-picker props (`defaultMonth`, `month`, `onMonthChange`, `locale`, `weekStartsOn`, …) | — | Same pass-through set as `DatePicker` (`CalendarPassThroughProps`) |

## 5. Composition & Customization

- Use `DatePicker` when the calendar should open from a field; use `Calendar` when it should always be visible (side panels, booking pages, filters).
- Both share `DatePickerCalendarGrid` (internal, extracted 2026-10-06 when Calendar became the second consumer) — a styling or day-cell fix lands in both.

## 6. State Matrix

| State | Visual | Test |
|---|---|---|
| Empty | No selected day; Clear disabled | `Calendar.test.tsx` "Today commits…" |
| Selected (single) | Day `data-selected="true"` | unit + `Default` story |
| Range | Range start / in range / end day styles (shared day cell); a one-day range keeps the full radius | unit + `Range` story |
| Range in progress | Hover preview (In Range) from the start to the cursor, never backwards | `Calendar.test.tsx:range: hovering after the start previews…` |
| Disabled day (min/max) | Native `disabled` on the day button | unit + `WithMinMax` story |

## 7. Design Tokens — Figma Traceability

| Figma | Value | Implementation |
|---|---|---|
| Panel fill | `Surface/Base` | `bg-sds-surface-base` |
| Panel radius | 16 | `rounded-sds-400` |
| Header / grid / footer | padding 16/8; weekday 40×32 12px; footer padding 16, gap 12, Medium buttons | Shared with `DatePicker` — see `datePicker.md` §7 (synced 2026-10-07) |
| Panel effect | 2 drop shadows (floating popover) | **Not used inline** — in-page content shows its boundary with `border-sds-border-weak` (design-foundation.md §4). `DatePicker`'s popover keeps the shadow |
| Grid / day cells | `_Date Picker / Day` (`12206:13709`) | Shared with `DatePicker` — see `datePicker.md` §7 |

## 8. Accessibility

- Named `role="group"` panel; day cells keep react-day-picker's grid semantics and the shared roving-focus day button (see `datePicker.md` / `accessibility.md` §7.10). Day buttons are named with the visible day number as a plain word ("Thursday, January 15, 2026"), shared with DatePicker via `DatePickerBase` (`datePicker.md` §13).
- Footer buttons are real `<button>`s; Clear is natively `disabled` while empty.
- axe runs on every story in light **and** dark (`storybook`, `storybook-dark`).

## 9. Theming

All colors are `-sds-` tokens; verified in a light and a dark region (`InteractionThemes` story, unit test) against `tokenColor()`.

## 10. Market Benchmark

| Library | Inline calendar | Immediate commit |
|---|---|---|
| shadcn/ui | `Calendar` | yes |
| React Aria | `Calendar` / `RangeCalendar` | yes |
| MUI | `DateCalendar` | yes |
| Mantine | `Calendar` / `DatePicker` (inline) | yes |

## 11. Regression Matrix

| Behavior | Test | Mutation verified |
|---|---|---|
| Commits on click (single/range) | `Calendar.test.tsx` | `onValueChange` removed → 4 fail |
| Named group | `Calendar.test.tsx` | role changed → 4 fail |
| No floating shadow, border-weak, light + dark | `Calendar.test.tsx`, `InteractionThemes` | shadow added → 2 fail |
| Clear disabled when empty | `Calendar.test.tsx` | → 1 fail |
| Out-of-range value cleared | `Calendar.test.tsx` | effect removed → 1 fail |
| Today commits immediately | `Calendar.test.tsx` | → 1 fail |
| Range rules: earlier click → new start, same day → one-day range | `Calendar.test.tsx`, `dateLogic.test.ts` | see `datePicker.md` §11 |
| Today (range) = new start, end cleared; jumps to this month | `Calendar.test.tsx` | see §14 |

## 12. Examples

```tsx
import { Calendar, type DatePickerValue } from '@sun-asterisk/nova/date-picker';

const [range, setRange] = useState<DatePickerValue>();
<Calendar mode="range" value={range} onValueChange={setRange} minDate={new Date()} />

<Calendar actions={false} aria-label="Delivery date" onValueChange={save} />
```

## 13. Known Limitations

- Code Connect maps the Figma panel `11864:19567` to `<DatePicker>` (the guideline shows it as the field's popover), not `<Calendar>`. One node can only have one mapping. For an always-visible panel, use the same props on `<Calendar>`, without Apply.
- Calendar-internal language follows react-day-picker's `locale` (default English); see `datePicker.md` §13.

## 14. Quality Score & History

| Date | Workflow | Total | Critical | Status |
|---|---|---:|---|---|
| 2026-10-06 | `/component` (Classification B, new public export) | 95/100 | none | Verified |
| 2026-10-07 | Figma alignment (F): Figma range flow, Today (range), footer/grid visuals, hover preview | 96/100 | none | Verified |
