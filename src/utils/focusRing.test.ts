import { describe, expect, it } from 'vitest';
import { FOCUS_RING_OFFSET_2, FOCUS_RING_OFFSET_3 } from './focusRing';

describe('focusRing constants', () => {
  it('FOCUS_RING_OFFSET_2 sets width, offset-2, and the border-focus color', () => {
    expect(FOCUS_RING_OFFSET_2).toContain('focus-visible:outline-2');
    expect(FOCUS_RING_OFFSET_2).toContain('focus-visible:outline-offset-2');
    expect(FOCUS_RING_OFFSET_2).toContain('focus-visible:outline-sds-border-focus');
  });

  it('FOCUS_RING_OFFSET_3 sets width, offset-3, and the border-focus color', () => {
    expect(FOCUS_RING_OFFSET_3).toContain('focus-visible:outline-2');
    expect(FOCUS_RING_OFFSET_3).toContain('focus-visible:outline-offset-3');
    expect(FOCUS_RING_OFFSET_3).toContain('focus-visible:outline-sds-border-focus');
  });

  it('never contains an unconditional outline-none (the confirmed regression class)', () => {
    for (const ring of [FOCUS_RING_OFFSET_2, FOCUS_RING_OFFSET_3]) {
      expect(ring).not.toMatch(/(?<!disabled:)(?<!hover:)\boutline-none\b/);
    }
  });

  it('the two constants differ only in offset', () => {
    expect(FOCUS_RING_OFFSET_2.replace('offset-2', 'offset-3')).toBe(FOCUS_RING_OFFSET_3);
  });
});
