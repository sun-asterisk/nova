import type { MouseEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('defaults to type="button" (never submits a surrounding form by accident)', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toHaveAttribute('type', 'button');
  });

  it('respects an explicit type', () => {
    render(<Button type="submit">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  // Regression coverage for the asChild API added in Phase 8: it must
  // render the child's own element (not wrap it in an extra <button>),
  // forward the ref to that element, and preserve the child's own
  // semantics/attributes.
  it('asChild renders the child element instead of a <button>', () => {
    let node: HTMLElement | null = null;
    render(
      <Button
        asChild
        ref={(el) => {
          node = el as HTMLElement | null;
        }}
      >
        <a href="/settings">Settings</a>
      </Button>,
    );

    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/settings');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(node).toBe(link);
  });

  it('applies the button visual classes to the asChild target', () => {
    render(
      <Button asChild variant="danger">
        <a href="/delete">Delete</a>
      </Button>,
    );
    const link = screen.getByRole('link', { name: 'Delete' });
    expect(link.className.length).toBeGreaterThan(0);
  });

  it('forwards a ref to the native button element', () => {
    let node: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(el) => {
          node = el;
        }}
      >
        Click
      </Button>,
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });

  it('is unreachable/inert when disabled', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Click
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Click' })).toBeDisabled();
  });

  // §16 item 3: every callback prop must be verified to actually fire, not
  // merely accepted. onClick's real-keyboard/click activation is already
  // covered by Button.stories.tsx's `InteractionClick` play() — this
  // targets the one path that's NOT reasonably observable there: does the
  // handler still fire once `asChild` reroutes rendering through Radix's
  // `Slot` onto a completely different host element (an <a>, not a
  // <button>)? Slot merges props via its own prop-composition logic, which
  // is exactly the kind of composition bug a visual story wouldn't surface.
  it('onClick still fires through asChild (Slot prop composition)', () => {
    // preventDefault stops the real browser-mode iframe from actually
    // navigating to the anchor's href — vitest 4's browser orchestrator
    // (unlike 3's) surfaces that stray navigation as an unhandled error
    // once this file's tests finish and the iframe tears down.
    const onClick = vi.fn((e: MouseEvent) => e.preventDefault());
    render(
      <Button asChild onClick={onClick}>
        <a href="/settings">Settings</a>
      </Button>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Settings' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  // §16 item 5: a boundary/native-prop-interaction case — `type="button"`
  // only makes sense on a real <button>; when Button reroutes to asChild's
  // arbitrary host element, the component must NOT force a `type`
  // attribute onto it (an <a type="button"> is invalid HTML, and future
  // careless refactors could easily reintroduce this by moving the
  // `type = 'button'` default outside the `if (asChild)` branch).
  it('does not force a `type` attribute onto the asChild target', () => {
    render(
      <Button asChild>
        <a href="/settings">Settings</a>
      </Button>,
    );
    expect(screen.getByRole('link', { name: 'Settings' })).not.toHaveAttribute('type');
  });

  // LOGIC-BUTTON-02's regression test (secondary/danger variants must use
  // the semantic bg-sds-surface-base token, never a hardcoded bg-white) lives
  // in the sibling Button.variants.test.tsx file, not here — see that
  // file's own header comment for why (a real, reproducible environmental
  // defect confirmed on both a local machine and CI: this file hangs
  // completely once it carries more than 8 tests).
});
