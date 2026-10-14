import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

// Regression coverage for a real, previously-zero-coverage gap found during
// Phase 10 certification: Badge had no `.test.tsx` and no Storybook
// `play()` function anywhere — its accessible-name/role claims were
// entirely unverified by any automated DOM assertion.
describe('Badge', () => {
  // RR-02 (2026-09-29): Badge is not a live region by default
  // (accessibility.md §2.1 — live regions only for asynchronously-updating
  // content). A static count/label is plain text.
  it('is not a live region by default (no role="status")', () => {
    const { container } = render(<Badge variant="count" label="5" />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute('role');
    expect(container.firstElementChild).not.toHaveAttribute('aria-live');
  });

  it('a consumer can opt in to a live region by passing role="status"', () => {
    render(<Badge variant="count" label="5" role="status" />);
    expect(screen.getByRole('status')).toHaveTextContent('5');
  });

  it('count/label variants expose their text content without a redundant aria-label', () => {
    const { container } = render(<Badge variant="count" label="99+" />);
    expect(container.firstElementChild).toHaveTextContent('99+');
    expect(container.firstElementChild).not.toHaveAttribute('aria-label');
  });

  it('does not add a separate announcement to a containing control’s accessible name beyond its text', () => {
    render(
      <button>
        Upcoming <Badge variant="count" label="3" />
      </button>,
    );
    expect(screen.getByRole('button')).toHaveAccessibleName('Upcoming 3');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('dot variant renders a decorative, aria-hidden indicator and is a named graphic once the consumer labels it', () => {
    render(<Badge variant="dot" aria-label="Unread notifications" />);
    const badge = screen.getByRole('img', { name: 'Unread notifications' });
    // The visible 10x10 circle is a decorative inner element (Figma reserves
    // a 24x24 anchor footprint for Dot, same as Count/Label/Error) — it must
    // stay `aria-hidden` so it never contributes to the accessible name.
    expect(badge.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('an unlabeled dot gets no role (a nameless role="img" would itself be an a11y violation)', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(<Badge variant="dot" />);
    expect(container.firstElementChild).not.toHaveAttribute('role');
    vi.restoreAllMocks();
  });

  // Regression coverage for LOGIC-BADGE-01 (Phase 5.5 High, closed Phase 14
  // P3-1): the original fix only added `aria-label` to this component's own
  // Dot story — story-level, not component-enforced, so a consumer could
  // still ship an unlabeled `variant="dot"` Badge with zero warning. A
  // dev-mode `console.warn` now enforces this at the component level
  // (matching the unconditional-warning convention already established in
  // ThemeProvider.tsx).
  describe('dot variant accessible-name enforcement', () => {
    // The warning is deduplicated once per module instance (it runs during
    // render — see NX-02 in Badge.tsx), so each test imports a fresh copy.
    // (A query-suffixed URL makes Vite serve a distinct module instance;
    // vi.resetModules() does not re-evaluate modules in browser mode.)
    let FreshBadge: typeof Badge;
    let instance = 0;
    beforeEach(async () => {
      instance += 1;
      const url = `./Badge.tsx?fresh=${instance}`;
      FreshBadge = ((await import(/* @vite-ignore */ url)) as typeof import('./Badge')).Badge;
    });

    it('warns when rendered without an aria-label or aria-labelledby', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<FreshBadge variant="dot" />);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('variant="dot"'));
      warn.mockRestore();
    });

    it('warns only once per module, not on every render', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { rerender } = render(<FreshBadge variant="dot" />);
      rerender(<FreshBadge variant="dot" className="x" />);
      render(<FreshBadge variant="dot" />);
      expect(warn).toHaveBeenCalledTimes(1);
      warn.mockRestore();
    });

    it('does not warn when aria-label is provided', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<FreshBadge variant="dot" aria-label="Online" />);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('does not warn when aria-labelledby is provided', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(
        <>
          <span id="dot-label">Online</span>
          <FreshBadge variant="dot" aria-labelledby="dot-label" />
        </>,
      );
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('does not warn for non-dot variants even without an explicit aria-label', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      render(<FreshBadge variant="count" label="5" />);
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  // NX-02 (2026-09-29): Badge must be usable from a React Server Component,
  // where hooks like useEffect throw. Calling the render function directly,
  // outside any React render, throws on the first hook call ("Invalid hook
  // call" / null dispatcher) — so this proves Badge calls no hooks at all.
  it('uses no React hooks (RSC-safe): its render function runs outside React', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const renderFn = (Badge as unknown as { render: (props: object, ref: null) => unknown }).render;
    for (const variant of ['count', 'dot', 'label', 'error'] as const) {
      expect(() => renderFn({ variant, label: '1' }, null)).not.toThrow();
    }
    expect(() => renderFn({ variant: 'dot' }, null)).not.toThrow();
    warn.mockRestore();
  });

  it('error variant has a built-in accessible name independent of `label`', () => {
    render(<Badge variant="error" />);
    expect(screen.getByRole('img', { name: 'Error badge' })).toBeInTheDocument();
  });

  // BD-01 (2026-09-29, external consumer audit): `{...rest}` spread after the
  // built-in name let an explicit `aria-label={undefined}` (a common
  // conditional-prop pattern) erase it → axe `role-img-alt`.
  it('error variant keeps its built-in name when aria-label is explicitly undefined', () => {
    render(<Badge variant="error" aria-label={undefined} />);
    expect(screen.getByRole('img', { name: 'Error badge' })).toBeInTheDocument();
  });

  it('error variant still lets a consumer override its role', () => {
    render(<Badge variant="error" role="status" />);
    expect(screen.getByRole('status', { name: 'Error badge' })).toBeInTheDocument();
  });

  it('error variant uses a consumer-provided aria-label over the built-in one', () => {
    render(<Badge variant="error" aria-label="3 failed uploads" />);
    expect(screen.getByRole('img', { name: '3 failed uploads' })).toBeInTheDocument();
  });

  it('custom children override the default content and are rendered', () => {
    const { container } = render(<Badge variant="count">🔥</Badge>);
    expect(container.firstElementChild).toHaveTextContent('🔥');
  });

  it('forwards a ref to the underlying span', () => {
    let node: HTMLSpanElement | null = null;
    render(
      <Badge
        variant="count"
        label="1"
        ref={(el) => {
          node = el;
        }}
      />,
    );
    expect(node).toBeInstanceOf(HTMLSpanElement);
  });

  describe('max (numeric truncation)', () => {
    it('truncates a numeric label exceeding max, with a "+" suffix', () => {
      render(<Badge variant="count" label="150" max={99} />);
      expect(screen.getByText('99+')).toBeInTheDocument();
    });

    it('does not truncate when the label is at or below max', () => {
      render(<Badge variant="count" label="42" max={99} />);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('has no effect on a non-numeric label', () => {
      render(<Badge variant="label" label="New" max={99} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    it('has no effect when max is unset', () => {
      render(<Badge variant="count" label="150" />);
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('truncates the accessible name to match the visible, truncated content', () => {
      render(
        <button>
          <Badge variant="count" label="150" max={99} />
        </button>,
      );
      expect(screen.getByRole('button')).toHaveAccessibleName('99+');
    });
  });

  describe('position (corner anchoring)', () => {
    it('is static/inline by default (no position class applied)', () => {
      render(<Badge variant="dot" aria-label="dot" />);
      expect(screen.getByRole('img').className).not.toContain('absolute');
    });

    it('applies absolute positioning when a corner is set', () => {
      render(<Badge variant="dot" aria-label="dot" position="top-right" />);
      expect(screen.getByRole('img').className).toContain('absolute');
    });
  });
});

// Pixel-dimension/computed-style regression coverage (pill height, font
// weight, anchor footprints) deliberately lives in Badge.stories.tsx's
// `PixelDimensionsMatchFigma` story `play()`, not here: this file's "unit"
// Vitest project renders components without the real compiled Tailwind
// stylesheet, so `getComputedStyle` assertions here would silently check
// browser defaults instead of the actual design tokens. The Storybook
// project loads the real built CSS, so that's the correct place for any
// future style-value regression test — see the reference note there.
