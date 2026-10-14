import '../../App.css';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Divider } from './Divider';

// Figma "Divider / Horizontal" (977:1950) and "Divider / Vertical" (2692:1756),
// frame 2006:1755 (Nova｜Master) — /component Divider Figma sync, 2026-10-07:
// a 1px Border/Weak line. Real computed styles in a light AND a dark region.

describe.each(['light', 'dark'] as const)('Divider — Figma Divider (%s)', (theme) => {
  it('horizontal: one 1px border-weak top edge, full width, no other border', () => {
    render(
      <div data-theme={theme} style={{ display: 'flex', flexDirection: 'column', width: 400 }}>
        <Divider data-testid="d" />
      </div>,
    );
    const el = screen.getByTestId('d');
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    expect([r.width, r.height]).toEqual([400, 1]);
    expect([cs.borderTopWidth, cs.borderTopStyle]).toEqual(['1px', 'solid']);
    expect(cs.borderTopColor).toBe(tokenColor(el, '--color-sds-border-weak'));
    expect([cs.borderBottomWidth, cs.borderLeftWidth, cs.borderRightWidth]).toEqual([
      '0px',
      '0px',
      '0px',
    ]);
  });

  it('vertical: one 1px border-weak left edge, full height', () => {
    render(
      <div data-theme={theme} style={{ display: 'flex', height: 80 }}>
        <Divider data-testid="d" orientation="vertical" flexItem />
      </div>,
    );
    const el = screen.getByTestId('d');
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    expect([r.width, r.height]).toEqual([1, 80]);
    expect([cs.borderLeftWidth, cs.borderLeftStyle]).toEqual(['1px', 'solid']);
    expect(cs.borderLeftColor).toBe(tokenColor(el, '--color-sds-border-weak'));
    expect([cs.borderTopWidth, cs.borderBottomWidth, cs.borderRightWidth]).toEqual([
      '0px',
      '0px',
      '0px',
    ]);
  });
});
