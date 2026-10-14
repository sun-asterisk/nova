import '../../App.css';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

// Figma "Icon Button" (component set 3700:7301) — `/component Button` sync,
// 2026-10-05: an icon-only Button rendered 40×32 / 52×40 / 64×48 because the
// label-sized `min-width` still applied; Figma's Icon Button is square
// (32 / 40 / 48). Real computed sizes, so App.css is imported (the unit
// project loads no styles by default).
const Icon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M0 0h24v24H0z" />
  </svg>
);

const box = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return { width: r.width, height: r.height };
};

describe('Button iconOnly', () => {
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['small', 32],
    ['medium', 40],
    ['large', 48],
  ] as const)('size="%s" renders a %dpx square (Figma Icon Button)', (size, px) => {
    render(
      <Button iconOnly size={size} aria-label="Add">
        <Icon />
      </Button>,
    );
    expect(box(screen.getByRole('button', { name: 'Add' }))).toEqual({ width: px, height: px });
  });

  it('without iconOnly keeps the label min-width (existing usage unchanged)', () => {
    render(
      <Button size="small" aria-label="Add">
        <Icon />
      </Button>,
    );
    expect(box(screen.getByRole('button', { name: 'Add' }))).toEqual({ width: 40, height: 32 });
  });

  // The warning is deduplicated by a module-level flag, so each warning test
  // loads a fresh module instance — otherwise test order would decide the
  // outcome (a "no warning" assertion could pass only because an earlier test
  // already consumed the one-time warning).
  const freshButton = async () => {
    vi.resetModules();
    return (await import('./Button')).Button;
  };

  it('warns once when an icon-only button has no accessible name', async () => {
    const Button = await freshButton();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <Button iconOnly>
          <Icon />
        </Button>
        <Button iconOnly>
          <Icon />
        </Button>
      </>,
    );
    const calls = warn.mock.calls.filter((c) => String(c[0]).includes('[Sun Button]'));
    expect(calls).toHaveLength(1);
  });

  it('does not warn when named via aria-label, aria-labelledby or title, or with asChild', async () => {
    const Button = await freshButton();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <>
        <Button iconOnly aria-label="Add">
          <Icon />
        </Button>
        <span id="lbl">Search</span>
        <Button iconOnly aria-labelledby="lbl">
          <Icon />
        </Button>
        <Button iconOnly title="Close">
          <Icon />
        </Button>
        <Button iconOnly asChild>
          <a href="/x" aria-label="Home">
            <Icon />
          </a>
        </Button>
      </>,
    );
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('[Sun Button]'))).toHaveLength(0);
  });
});
