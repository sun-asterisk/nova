import '../../App.css';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Avatar, type AvatarSize } from './Avatar';

// Figma "Avatar" (COMPONENT_SET 16593:8749, frame 16609:8640, Nova｜Master) and
// "_Avatar / Status" (16591:8648) — /component Avatar Figma sync, 2026-10-07.
// Real computed styles in a light AND a dark region.

// size → [box, initial font, icon, status dot, status inset]
const SIZES: Array<[AvatarSize, number, string, number, number | null, string]> = [
  ['xsmall', 24, '12px', 16, null, ''],
  ['small', 32, '14px', 20, 10, '0px'],
  ['medium', 40, '16px', 24, 12, '0px'],
  ['large', 56, '20px', 32, 16, '0px'],
  ['xlarge', 80, '28px', 40, 20, '2px'],
];

describe.each(['light', 'dark'] as const)('Avatar — Figma (%s)', (theme) => {
  it.each(SIZES)(
    '%s: %ipx circle, initials %s, icon %ipx, status %spx',
    (size, box, font, icon, dot, inset) => {
      render(
        <div data-theme={theme}>
          <Avatar size={size} initial="A" status="online" data-testid="initial" />
          <Avatar size={size} data-testid="icon" />
        </div>,
      );
      const root = screen.getByTestId('initial');
      const rect = root.getBoundingClientRect();
      expect([rect.width, rect.height]).toEqual([box, box]);
      expect(getComputedStyle(root).borderRadius).not.toBe('0px');
      expect(getComputedStyle(screen.getByText('A')).fontSize).toBe(font);
      const svg = screen.getByTestId('icon').querySelector('svg')!.getBoundingClientRect();
      expect([svg.width, svg.height]).toEqual([icon, icon]);
      const status = root.querySelector('.sr-only')?.parentElement;
      if (dot === null) {
        // Figma: XSmall does not support status.
        expect(status).toBeUndefined();
      } else {
        const r = status!.getBoundingClientRect();
        expect([r.width, r.height]).toEqual([dot, dot]);
        const cs = getComputedStyle(status!);
        expect([cs.right, cs.bottom]).toEqual([inset, inset]);
      }
    },
  );

  it('fallback: Surface/Secondary fill, Text/On Surface initials, Icon/Secondary icon', () => {
    render(
      <div data-theme={theme}>
        <Avatar initial="鈴" data-testid="initial" />
        <Avatar data-testid="icon" />
      </div>,
    );
    const root = screen.getByTestId('initial');
    expect(getComputedStyle(root).backgroundColor).toBe(
      tokenColor(root, '--color-sds-surface-secondary'),
    );
    expect(getComputedStyle(screen.getByText('鈴')).color).toBe(
      tokenColor(root, '--color-sds-text-on-surface'),
    );
    const svg = screen.getByTestId('icon').querySelector('svg')!;
    expect(getComputedStyle(svg).color).toBe(tokenColor(root, '--color-sds-icon-secondary'));
  });

  it.each([
    ['online', '--color-sds-icon-success'],
    ['away', '--color-sds-icon-caution'],
    ['busy', '--color-sds-icon-danger'],
    ['offline', '--color-sds-icon-disable'],
  ] as const)('status %s: %s dot with a 2px Surface/Base border inside', (status, token) => {
    render(
      <div data-theme={theme}>
        <Avatar initial="A" status={status} data-testid="a" />
      </div>,
    );
    const root = screen.getByTestId('a');
    const dot = root.querySelector('.sr-only')!.parentElement!;
    const cs = getComputedStyle(dot);
    expect(cs.backgroundColor).toBe(tokenColor(root, token));
    expect([cs.borderTopWidth, cs.borderTopColor]).toEqual([
      '2px',
      tokenColor(root, '--color-sds-surface-base'),
    ]);
  });

  it('ring: 2px Surface/Base outside the circle', () => {
    render(
      <div data-theme={theme}>
        <Avatar initial="A" ring data-testid="a" />
      </div>,
    );
    const root = screen.getByTestId('a');
    const shadow = getComputedStyle(root).boxShadow;
    expect(shadow).toContain(tokenColor(root, '--color-sds-surface-base'));
    expect(shadow).toContain('0px 0px 0px 2px');
    expect(root.getBoundingClientRect().width).toBe(40);
  });
});
