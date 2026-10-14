import '../../App.css';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Badge } from './Badge';

// Figma "Badge" (component set 1065:507, frame 2006:1708, Nova｜Master) —
// /component Badge Figma sync, 2026-10-07. Real computed styles (App.css
// loaded), in a light AND a dark data-theme region, compared against the token
// resolved inside that region. The visual already matched Figma; these lock it.

describe.each(['light', 'dark'] as const)('Badge — Figma Badge (%s)', (theme) => {
  const renderIn = (ui: ReactNode) =>
    render(
      <div data-theme={theme} data-testid="region">
        {ui}
      </div>,
    );
  const box = (el: Element) => el.getBoundingClientRect();

  // Figma Count / Label: 20px-tall pill (centered in the 24px symbol), 8px
  // horizontal padding, Surface/Emphasis fill, Text/On Surface 12px text —
  // Regular for Count, Bold for Label.
  it.each([
    ['count', '99', '400'],
    ['label', 'New', '700'],
  ] as const)(
    '%s: 20px pill, 8px padding, emphasis fill, on-surface 12px text (weight %s)',
    (variant, label, weight) => {
      renderIn(<Badge data-testid="b" variant={variant} label={label} />);
      const el = screen.getByTestId('b');
      const cs = getComputedStyle(el);
      expect(box(el).height).toBe(20);
      expect([cs.paddingLeft, cs.paddingRight]).toEqual(['8px', '8px']);
      expect(cs.backgroundColor).toBe(tokenColor(el, '--color-sds-surface-emphasis'));
      expect(cs.color).toBe(tokenColor(el, '--color-sds-text-on-surface'));
      expect([cs.fontSize, cs.fontWeight]).toEqual(['12px', weight]);
      expect(parseFloat(cs.borderTopLeftRadius)).toBeGreaterThanOrEqual(10);
    },
  );

  // Figma Dot: 24×24 footprint, 10×10 Surface/Emphasis circle centered.
  it('dot: 24px footprint with a centered 10px emphasis circle', () => {
    renderIn(<Badge data-testid="b" variant="dot" aria-label="Online" />);
    const el = screen.getByTestId('b');
    const dot = el.firstElementChild as HTMLElement;
    const o = box(el);
    const d = box(dot);
    expect([o.width, o.height]).toEqual([24, 24]);
    expect([d.width, d.height]).toEqual([10, 10]);
    expect([d.left - o.left, d.top - o.top]).toEqual([7, 7]);
    expect(getComputedStyle(dot).backgroundColor).toBe(
      tokenColor(el, '--color-sds-surface-emphasis'),
    );
  });

  // Figma Error: 24×24 footprint, 16px Icon/Danger ring.
  it('error: 24px footprint, icon-danger glyph', () => {
    renderIn(<Badge data-testid="b" variant="error" />);
    const el = screen.getByTestId('b');
    const o = box(el);
    expect([o.width, o.height]).toEqual([24, 24]);
    const svg = el.querySelector('svg')!;
    expect(getComputedStyle(svg).color).toBe(tokenColor(el, '--color-sds-icon-danger'));
  });
});
