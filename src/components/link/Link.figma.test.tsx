import '../../App.css';
import { render, screen } from '@testing-library/react';
import type { CSSProperties } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { IconExternalLink } from '../icons';
import { Link, type LinkSize } from './Link';

// Figma "Link" (COMPONENT_SET 16337:8408, frame 16399:10751, Nova｜Master) —
// /component Link Figma sync, 2026-10-07. Real computed styles in a light AND
// a dark region.

const SIZES: Array<[LinkSize, string, string, number]> = [
  ['large', '16px', '25.6px', 18],
  ['medium', '14px', '22.4px', 16],
  ['small', '12px', '19.2px', 14],
];

describe.each(['light', 'dark'] as const)('Link — Figma (%s)', (theme) => {
  it.each(SIZES)('%s: font %s / line %s, icon %ipx (font + 2)', (size, font, line, icon) => {
    render(
      <div data-theme={theme}>
        <Link href="#" size={size} endAdornment={<IconExternalLink data-testid="icon" />}>
          リンクテキスト
        </Link>
      </div>,
    );
    const cs = getComputedStyle(screen.getByRole('link'));
    expect([cs.fontSize, cs.lineHeight]).toEqual([font, line]);
    const rect = screen.getByTestId('icon').getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([icon, icon]);
  });

  it('enabled: Text/Link label, Icon/Link icon, underline 1px with a 2px offset', () => {
    render(
      <div data-theme={theme}>
        <Link href="#" startAdornment={<IconExternalLink data-testid="icon" />}>
          リンクテキスト
        </Link>
      </div>,
    );
    const link = screen.getByRole('link');
    const cs = getComputedStyle(link);
    expect(cs.color).toBe(tokenColor(link, '--color-sds-text-link'));
    expect(getComputedStyle(screen.getByTestId('icon')).color).toBe(
      tokenColor(link, '--color-sds-icon-link'),
    );
    expect(cs.textDecorationLine).toBe('underline');
    expect(cs.textDecorationThickness).toBe('1px');
    expect(cs.textUnderlineOffset).toBe('2px');
  });

  // Icon/Link and Text/Link (Icon/Disable and Text/Disable) currently resolve
  // to the same color, so override each icon token in scope to prove the
  // icons bind the icon token, not the inherited text color.
  it('icons bind Icon/Link and Icon/Disable, not the label color', () => {
    render(
      <div
        data-theme={theme}
        style={
          {
            '--color-sds-icon-link': 'rgb(1, 2, 3)',
            '--color-sds-icon-disable': 'rgb(4, 5, 6)',
          } as CSSProperties
        }
      >
        <Link href="#" endAdornment={<IconExternalLink data-testid="on" />}>
          有効
        </Link>
        <Link href="#" disabled endAdornment={<IconExternalLink data-testid="off" />}>
          無効
        </Link>
      </div>,
    );
    expect(getComputedStyle(screen.getByTestId('on')).color).toBe('rgb(1, 2, 3)');
    expect(getComputedStyle(screen.getByTestId('off')).color).toBe('rgb(4, 5, 6)');
  });

  it('disabled: Text/Disable label, Icon/Disable icon, underline kept with the same offset', () => {
    render(
      <div data-theme={theme}>
        <Link href="#" disabled endAdornment={<IconExternalLink data-testid="icon" />}>
          リンクテキスト
        </Link>
      </div>,
    );
    const el = screen.getByText('リンクテキスト');
    const cs = getComputedStyle(el);
    expect(cs.color).toBe(tokenColor(el, '--color-sds-text-disable'));
    expect(getComputedStyle(screen.getByTestId('icon')).color).toBe(
      tokenColor(el, '--color-sds-icon-disable'),
    );
    expect([cs.textDecorationLine, cs.textUnderlineOffset]).toEqual(['underline', '2px']);
  });
});
