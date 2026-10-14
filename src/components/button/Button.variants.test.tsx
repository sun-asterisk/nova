import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

// Split into its own file rather than living in Button.test.tsx alongside
// the other 8 tests there: confirmed, via direct local bisection, that
// Button.test.tsx hangs completely (Vitest+Playwright browser mode never
// reports a single result, even for its own first test) the moment it
// carries a 9th test — reproduced identically whether that 9th test was
// this real regression assertion, a trivial no-op, or an unrelated plain
// assertion, and unaffected by whether it's declared via `it.each` or a
// plain `it`. The original 8 tests alone consistently complete and report
// real results (they can still trigger Vitest's separate, already-known
// post-results teardown hang — see run-vitest-safe.mjs's own header
// comment — but that one is harmless and already handled). Keeping this
// file's own test count low avoids the 8→9 threshold entirely; this is a
// workaround for a real, reproducible environmental defect (confirmed on
// both a local machine and GitHub Actions CI, PR #42), not a change to
// what's actually being tested.
describe('Button variants', () => {
  // Regression coverage for LOGIC-BUTTON-02 (Phase 5.5 High, closed Phase
  // 14): the `secondary` variant previously hardcoded `bg-white`, bypassing
  // the semantic token layer (design-foundation.md §1 P0 — "never a
  // primitive/raw value"). Fixed to `bg-sds-surface-base`, but had no permanent
  // test, so a future refactor could silently reintroduce a hardcoded
  // background with nothing to catch it. Asserts both directions: the real
  // semantic token IS present, and no raw/hardcoded background pattern
  // (`bg-white`, `bg-black`, an arbitrary hex bracket) is — for every
  // variant that renders on a light `surface-base`-family background, not
  // just `secondary`, since the same regression could recur in any of them.
  it.each(['secondary', 'danger'] as const)(
    'variant="%s" uses a semantic background token, never a hardcoded one',
    (variant) => {
      render(
        <Button variant={variant} data-testid="button">
          Click
        </Button>,
      );
      const el = screen.getByTestId('button');
      expect(el.className).toMatch(/\bbg-sds-surface-base\b/);
      expect(el.className).not.toMatch(/\bbg-white\b/);
      expect(el.className).not.toMatch(/\bbg-black\b/);
      expect(el.className).not.toMatch(/bg-\[#/);
    },
  );
});
