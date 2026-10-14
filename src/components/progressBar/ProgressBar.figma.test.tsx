import '../../App.css';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { ProgressBar, type ProgressBarSize } from './ProgressBar';

// Figma "Progress Bar" (COMPONENT_SET 16982:11702, frame 17121:11722,
// Nova｜Master) — /component ProgressBar Figma sync, 2026-10-07 (no drift
// found; this pins the Figma values). Real computed styles in light AND dark.

const SIZES: Array<[ProgressBarSize, number]> = [
  ['small', 4],
  ['medium', 6],
  ['large', 8],
];

describe.each(['light', 'dark'] as const)('ProgressBar — Figma (%s)', (theme) => {
  it.each(SIZES)('%s: %ipx tall, fully rounded, fills its container', (size, height) => {
    render(
      <div data-theme={theme} style={{ width: 240 }}>
        <ProgressBar value={60} size={size} aria-label="p" />
      </div>,
    );
    const bar = screen.getByRole('progressbar');
    const rect = bar.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([240, height]);
    expect(getComputedStyle(bar).borderTopLeftRadius).not.toBe('0px');
    const fill = bar.firstElementChild as HTMLElement;
    expect(fill.getBoundingClientRect().width).toBe(144);
  });

  it.each([
    [false, '--color-sds-surface-subtle', '--color-sds-icon-primary'],
    [true, '--color-sds-surface-subtle-inverse', '--color-sds-icon-primary-inverse'],
  ] as const)('inverse=%s: track %s, progress %s', (inverse, track, progress) => {
    render(
      <div data-theme={theme} style={{ width: 240 }}>
        <ProgressBar value={60} inverse={inverse} aria-label="p" />
      </div>,
    );
    const bar = screen.getByRole('progressbar');
    expect(getComputedStyle(bar).backgroundColor).toBe(tokenColor(bar, track));
    expect(getComputedStyle(bar.firstElementChild!).backgroundColor).toBe(
      tokenColor(bar, progress),
    );
  });
});
