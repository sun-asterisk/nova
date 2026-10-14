import { describe, expect, it } from 'vitest';
import { parseDateInput, selectRangeDate } from './dateLogic';

const d = (month: number, day: number) => new Date(2026, month - 1, day);

// Figma Date Picker 期間選択の制御フロー — every rule has its own case.
describe('selectRangeDate', () => {
  describe('basic flow (auto)', () => {
    it('1st click sets the start and waits for the end', () => {
      expect(selectRangeDate(undefined, d(1, 10), 'auto')).toEqual({
        range: { from: d(1, 10), to: undefined },
        target: 'end',
      });
    });

    it('2nd click sets the end', () => {
      expect(selectRangeDate({ from: d(1, 10) }, d(1, 15), 'auto')).toEqual({
        range: { from: d(1, 10), to: d(1, 15) },
        target: 'auto',
      });
    });

    it('a day before the start replaces the start; the end stays empty', () => {
      expect(selectRangeDate({ from: d(1, 10) }, d(1, 5), 'auto')).toEqual({
        range: { from: d(1, 5), to: undefined },
        target: 'end',
      });
    });

    it('the same day as the start confirms a one-day range', () => {
      expect(selectRangeDate({ from: d(1, 10) }, d(1, 10), 'auto')).toEqual({
        range: { from: d(1, 10), to: d(1, 10) },
        target: 'auto',
      });
    });

    it('a click after a confirmed range starts a new range', () => {
      expect(selectRangeDate({ from: d(1, 10), to: d(1, 15) }, d(1, 12), 'auto')).toEqual({
        range: { from: d(1, 12), to: undefined },
        target: 'end',
      });
    });
  });

  describe('start re-selection', () => {
    const range = { from: d(1, 10), to: d(1, 20) };

    it('a new start before the end updates only the start', () => {
      expect(selectRangeDate(range, d(1, 5), 'start')).toEqual({
        range: { from: d(1, 5), to: d(1, 20) },
        target: 'auto',
      });
    });

    it('a new start on the end day keeps the end (one-day range)', () => {
      expect(selectRangeDate(range, d(1, 20), 'start').range).toEqual({
        from: d(1, 20),
        to: d(1, 20),
      });
    });

    it('a new start after the end clears the end and waits for it', () => {
      expect(selectRangeDate(range, d(1, 25), 'start')).toEqual({
        range: { from: d(1, 25), to: undefined },
        target: 'end',
      });
    });

    it('with no confirmed end, sets the start and waits for the end', () => {
      expect(selectRangeDate({ from: d(1, 10) }, d(1, 25), 'start')).toEqual({
        range: { from: d(1, 25), to: undefined },
        target: 'end',
      });
    });
  });

  describe('end re-selection', () => {
    const range = { from: d(1, 10), to: d(1, 20) };

    it('a new end after the start updates only the end', () => {
      expect(selectRangeDate(range, d(1, 25), 'end')).toEqual({
        range: { from: d(1, 10), to: d(1, 25) },
        target: 'auto',
      });
    });

    it('a new end before the start becomes the new start and waits for the end', () => {
      expect(selectRangeDate(range, d(1, 5), 'end')).toEqual({
        range: { from: d(1, 5), to: undefined },
        target: 'end',
      });
    });

    it('with no start, the date becomes the start', () => {
      expect(selectRangeDate(undefined, d(1, 5), 'end')).toEqual({
        range: { from: d(1, 5), to: undefined },
        target: 'end',
      });
    });
  });

  it('compares calendar days, ignoring the time of day', () => {
    const start = new Date(2026, 0, 10, 18, 0);
    expect(selectRangeDate({ from: start }, new Date(2026, 0, 10, 9, 0), 'auto').range.to).toEqual(
      new Date(2026, 0, 10, 9, 0),
    );
  });
});

describe('parseDateInput', () => {
  it.each([
    ['2026年3月14日', 'ja-JP'],
    ['2026/3/14', 'ja-JP'],
    ['2026-03-14', 'ja-JP'],
    ['2026.03.14', 'ja-JP'],
    ['20260314', 'ja-JP'],
    [' 2026 / 3 / 14 ', 'ja-JP'],
    ['2026/3/14', 'en-US'],
    ['3/14/2026', 'en-US'],
    ['14/3/2026', 'en-GB'],
    ['26/3/14', 'ja-JP'],
  ])('reads %s (%s) as 2026-03-14', (text, locale) => {
    expect(parseDateInput(text, locale)).toEqual(new Date(2026, 2, 14));
  });

  it.each(['', 'abc', '2026/3', '2026/2/30', '2026/13/1', '2026/0/10', '2026/3/14/1', '2026314'])(
    'rejects %j',
    (text) => {
      expect(parseDateInput(text, 'ja-JP')).toBeUndefined();
    },
  );
});
