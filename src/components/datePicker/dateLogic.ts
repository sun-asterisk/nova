import type { DateRange } from 'react-day-picker';

/**
 * INTERNAL (not exported from the package). Pure date logic shared by
 * `DatePicker` and `Calendar` — the Figma "期間選択の制御フロー" range rules and
 * DatePicker's keyboard direct-input parsing (Figma 設計の原則: "慣れたユーザーの
 * ためのキーボード直接入力"). Kept free of React so every branch is unit-testable.
 */

const dayKey = (date: Date) => date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();

export const isSameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
export const isBeforeDay = (a: Date, b: Date) => dayKey(a) < dayKey(b);
export const isAfterDay = (a: Date, b: Date) => dayKey(a) > dayKey(b);

export const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Which end of the range the next click (or typed date) edits.
 * - `auto`: the basic flow — 1st click sets the start, 2nd click the end.
 * - `start` / `end`: the re-selection modes entered by clicking the start /
 *   end field of a confirmed range (Figma 確定後の再編集).
 */
export type RangeTarget = 'auto' | 'start' | 'end';

/**
 * Applies one selected date to a range, following Figma's 期間選択の制御フロー:
 *
 * - Basic flow: no start (or a confirmed range) → the date becomes the new
 *   start and the end waits; otherwise it becomes the end.
 * - Exceptions while waiting for the end: a date BEFORE the start replaces
 *   the start (end stays empty); the SAME date confirms a one-day range.
 * - Start re-selection: a date on/before the end updates only the start; a
 *   date after the end becomes the new start and clears the end.
 * - End re-selection: a date on/after the start updates only the end; a
 *   date before the start becomes the new start and clears the end.
 *
 * Returns the next range and which end the following selection edits.
 */
export function selectRangeDate(
  range: DateRange | undefined,
  date: Date,
  target: RangeTarget,
): { range: DateRange; target: RangeTarget } {
  const from = range?.from;
  const to = range?.to;
  const waitForEnd = (start: Date) => ({
    range: { from: start, to: undefined },
    target: 'end' as const,
  });

  if (target === 'start' && from && to) {
    return isAfterDay(date, to) ? waitForEnd(date) : { range: { from: date, to }, target: 'auto' };
  }

  if (target === 'auto' && (!from || to)) return waitForEnd(date);
  if (!from) return waitForEnd(date);
  if (target === 'start') return waitForEnd(date);

  // Waiting for (or re-selecting) the end.
  if (isBeforeDay(date, from)) return waitForEnd(date);
  return { range: { from, to: date }, target: 'auto' };
}

/** Order of the year / month / day fields in `locale`'s numeric date format. */
const fieldOrder = (locale: string): Array<'year' | 'month' | 'day'> => {
  try {
    const parts = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(new Date(2000, 10, 22));
    const order = parts
      .map((part) => part.type)
      .filter(
        (type): type is 'year' | 'month' | 'day' =>
          type === 'year' || type === 'month' || type === 'day',
      );
    if (order.length === 3) return order;
  } catch {
    // Invalid locale — fall through to ISO order.
  }
  return ['year', 'month', 'day'];
};

/**
 * Parses a typed date. Accepts any text holding exactly three numbers — the
 * ja-JP display format itself (`2025年11月15日`), `2025/11/15`, `2025-11-15`,
 * `2025.11.15` — plus the compact `20251115`. A 4-digit first number is read
 * as year-month-day; otherwise the numbers follow `locale`'s own numeric order
 * (e.g. `11/15/2025` for en-US). A 2-digit year means 20xx. Returns
 * `undefined` for anything else, including impossible dates (`2025/2/30`).
 */
export function parseDateInput(text: string, locale: string): Date | undefined {
  const numbers = text.match(/\d+/g);
  if (!numbers) return undefined;

  let fields: Record<'year' | 'month' | 'day', number>;
  if (numbers.length === 1 && numbers[0].length === 8) {
    const compact = numbers[0];
    fields = {
      year: Number(compact.slice(0, 4)),
      month: Number(compact.slice(4, 6)),
      day: Number(compact.slice(6, 8)),
    };
  } else if (numbers.length === 3) {
    const order: Array<'year' | 'month' | 'day'> =
      numbers[0].length === 4 ? ['year', 'month', 'day'] : fieldOrder(locale);
    fields = { year: 0, month: 0, day: 0 };
    order.forEach((field, index) => {
      fields[field] = Number(numbers[index]);
    });
  } else {
    return undefined;
  }

  const year = fields.year < 100 ? 2000 + fields.year : fields.year;
  const date = new Date(year, fields.month - 1, fields.day);
  // Rejects rollover (e.g. Feb 30 → Mar 2) and month/day of 0.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== fields.month - 1 ||
    date.getDate() !== fields.day
  ) {
    return undefined;
  }
  return date;
}

export const formatDateLabel = (date: Date, locale: string) =>
  new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
