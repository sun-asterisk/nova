import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import '../../styles.css';
import { Button } from './Button';

// Real-CSS regression coverage for design-foundation.md §5.3 (P0, "disabled
// suppresses every other state"). Class-string assertions can't prove this:
// the bug was a missing *override*, and whether `hover:` or `disabled:` wins
// is decided by Tailwind's generated CSS ordering, not by the class list. So
// this file loads the real stylesheet (styles.css) and drives a real
// Playwright pointer hover, then reads the computed background.
//
// Kept in its own file (not Button.test.tsx) — see Button.variants.test.tsx's
// header for the 8→9 test-count hang in that file.
describe('Button disabled state (real CSS)', () => {
  it('a disabled plain Button shows no hover background', async () => {
    render(
      <Button variant="plain" disabled data-testid="button">
        Plain
      </Button>,
    );
    const el = screen.getByTestId('button');
    expect(getComputedStyle(el).backgroundColor).toBe('rgba(0, 0, 0, 0)');

    await userEvent.hover(el);
    expect(el.matches(':hover')).toBe(true);
    expect(getComputedStyle(el).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  // Control: proves the hover actually lands and the hover token paints on an
  // ENABLED plain Button — without this, the test above would also pass if
  // hover simply never applied in this environment.
  it('an enabled plain Button does show its hover background', async () => {
    render(
      <Button variant="plain" data-testid="button">
        Plain
      </Button>,
    );
    const el = screen.getByTestId('button');
    await userEvent.hover(el);
    expect(getComputedStyle(el).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});
