import { createRef, useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Switch } from './Switch';

describe('Switch', () => {
  it('reflects the checked prop while controlled', () => {
    render(<Switch checked onCheckedChange={() => {}} data-testid="switch" />);
    expect(screen.getByTestId('switch')).toHaveAttribute('data-state', 'checked');
  });

  it('reflects defaultChecked while uncontrolled', () => {
    render(<Switch defaultChecked data-testid="switch" />);
    expect(screen.getByTestId('switch')).toHaveAttribute('data-state', 'checked');
  });

  // PHASE 14 CORRECTION of a confirmed Phase 10 false-confidence finding.
  //
  // The original version of this test (pre-Phase-14) asserted Radix's own
  // `data-state` attribute stayed "checked" after a controlled ->
  // uncontrolled transition, read synchronously immediately after a native
  // `.click()`. Phase 10 already flagged this as false confidence (it
  // passes even with the real fix removed) — but re-investigating this
  // phase found the test was actually WRONG on a second, deeper axis too,
  // not merely insufficient: read synchronously, it observes a STALE
  // pre-re-render value (a real timing artifact of the two-hop
  // Harness-state -> Switch-prop -> Radix-internal-state update chain, not
  // a meaningful assertion of settled behavior). Waiting for the update to
  // actually settle (`waitFor`) reveals Radix's `data-state` genuinely
  // becomes "unchecked" once uncontrolled — Radix's own internal fallback
  // state is independent of Sun's `checked` prop history and was never
  // "checked" from Radix's own point of view once the prop stops being
  // passed. This is Radix's real, correct, expected behavior at that
  // boundary — not a bug — but it makes `data-state` fundamentally the
  // wrong signal for this regression, in both directions (insufficient
  // AND, read without waiting, actively misleading).
  it('Radix data-state genuinely becomes "unchecked" once the switch is no longer passed a checked prop (Radix behavior, not a Sun bug)', async () => {
    // Triggers a real, expected Radix console.warn ("Switch is changing
    // from controlled to uncontrolled..."), already documented as Radix's
    // own behavior, not a Sun bug — see above. Suppressed globally in
    // test/unit.setup.ts (not per-test here) — see that file's own comment
    // for the full reasoning, including two earlier failed attempts at this
    // (both mistakenly patched `console.error`; the real call, per Radix's
    // own source, is `console.warn`).
    function Harness() {
      const [isControlled, setIsControlled] = useState(true);
      return (
        <>
          <Switch
            checked={isControlled ? true : undefined}
            defaultChecked={false}
            data-testid="switch"
          />
          <button onClick={() => setIsControlled(false)}>release</button>
        </>
      );
    }

    render(<Harness />);
    const switchEl = screen.getByTestId('switch');
    expect(switchEl).toHaveAttribute('data-state', 'checked');

    screen.getByText('release').click();
    await waitFor(() => expect(switchEl).toHaveAttribute('data-state', 'unchecked'));
  });

  // The ACTUAL regression test for LOGIC-SWITCH-01 (Phase 10 correction,
  // re-derived Phase 14). The bug only ever affected Sun's own
  // CSS-class-driven track styling (switchStyles({checked: isChecked}) in
  // Switch.tsx, isChecked derived from the local uncontrolledChecked
  // mirror) — this is genuinely independent of, and the opposite sign from,
  // Radix's own data-state (see the test above).
  //
  // Mutation-tested (Phase 14, real break -> fail -> restore -> pass
  // cycle): commenting out Switch.tsx's `useEffect(() => { if (checked
  // !== undefined) setUncontrolledChecked(checked) }, [checked])` makes
  // THIS test fail (track settles to bg-sds-surface-secondary instead of
  // staying bg-sds-surface-primary) while the settled `data-state` assertion
  // above is unaffected either way (already correctly "unchecked" with or
  // without the fix, since it never depended on Sun's own mirror to begin
  // with) — proving this specific assertion, read only after a real
  // `waitFor` settle, is the one that actually protects the fix.
  it('track keeps the checked visual style across a controlled -> uncontrolled transition', async () => {
    // Triggers the same expected console.warn — see the test above and
    // unit.setup.ts for why it's suppressed globally, not per-test here.
    function Harness() {
      const [isControlled, setIsControlled] = useState(true);
      return (
        <>
          <Switch
            checked={isControlled ? true : undefined}
            defaultChecked={false}
            data-testid="switch"
          />
          <button onClick={() => setIsControlled(false)}>release</button>
        </>
      );
    }

    render(<Harness />);
    const switchEl = screen.getByTestId('switch');
    const track = switchEl.firstElementChild as HTMLElement;
    expect(track.className).toContain('bg-sds-surface-primary');
    expect(track.className).not.toContain('bg-sds-surface-secondary');

    screen.getByText('release').click();

    // Synchronize on data-state's own transition first (verified,
    // above, to reliably flip to "unchecked" once uncontrolled,
    // independent of this bug) before reading the track's className.
    // `waitFor` only re-polls a callback that THROWS on its first
    // synchronous attempt — if the assertion-of-interest happens to
    // already match a stale, pre-re-render DOM read (which it does here,
    // since the track's old "bg-sds-surface-primary" class is still present
    // synchronously right after `.click()`, before React's async update
    // chain across the Harness -> Switch -> Radix boundary has actually
    // run), `waitFor` resolves immediately without ever observing the
    // real, settled state — silently reintroducing the same
    // false-confidence failure mode a naive `waitFor` "fix" would still
    // have. Waiting on data-state's own guaranteed state change first
    // forces the real re-render to have actually happened before the
    // className read below runs.
    await waitFor(() => expect(switchEl).toHaveAttribute('data-state', 'unchecked'));

    // Still the "checked" track color — the last controlled value was
    // synced into the internal fallback, not the stale mount-time
    // defaultChecked={false}. Without the useEffect fix, isChecked falls
    // back to the stale uncontrolledChecked=false and the track silently
    // reverts to the unchecked color even though the switch's actual
    // boolean value is still "checked" (data-state itself is a red
    // herring here — see the test above — it transitions to "unchecked"
    // in both the correct and buggy case, which is exactly why it cannot
    // be the assertion that protects this fix).
    expect(track.className).toContain('bg-sds-surface-primary');
    expect(track.className).not.toContain('bg-sds-surface-secondary');
  });

  it('disabled switch has no press affordance (native disabled attribute)', () => {
    render(<Switch disabled data-testid="switch" />);
    expect(screen.getByTestId('switch')).toBeDisabled();
  });

  it('forwards the ref to the root element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Switch ref={ref} data-testid="switch" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies classNames to the track and thumb parts independently', () => {
    render(<Switch data-testid="switch" classNames={{ track: 'track-x', thumb: 'thumb-x' }} />);
    const root = screen.getByTestId('switch');
    const track = root.firstElementChild as HTMLElement;
    const thumb = track.firstElementChild as HTMLElement;
    expect(track.className).toContain('track-x');
    expect(thumb.className).toContain('thumb-x');
  });
});
