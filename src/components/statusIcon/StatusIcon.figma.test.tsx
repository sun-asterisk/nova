import '../../App.css';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { StatusIcon, type StatusIconValue } from './StatusIcon';

// Figma "Status Icon" (COMPONENT_SET 8867:2716, frame 17234:11801, Nova｜Master)
// — /component StatusIcon Figma sync, 2026-10-07. Real computed styles in a
// light AND a dark region.

const ICONS: Array<[Exclude<StatusIconValue, 'loading'>, string]> = [
  ['info', 'info'],
  ['success', 'success'],
  ['caution', 'caution'],
  ['danger', 'danger'],
];

describe.each(['light', 'dark'] as const)('StatusIcon — Figma (%s)', (theme) => {
  it.each(ICONS)('%s: 24px icon in a 24px box, Icon/%s (and its inverse)', (status, token) => {
    render(
      <div data-theme={theme}>
        <StatusIcon status={status} data-testid="default" />
        <StatusIcon status={status} inverse data-testid="inverse" />
      </div>,
    );
    for (const [id, suffix] of [
      ['default', ''],
      ['inverse', '-inverse'],
    ] as const) {
      const box = screen.getByTestId(id);
      const svg = box.querySelector('svg')!;
      expect([box.getBoundingClientRect().width, box.getBoundingClientRect().height]).toEqual([
        24, 24,
      ]);
      expect([svg.getBoundingClientRect().width, svg.getBoundingClientRect().height]).toEqual([
        24, 24,
      ]);
      expect(getComputedStyle(svg).color).toBe(
        tokenColor(box, `--color-sds-icon-${token}${suffix}` as `--color-sds-${string}`),
      );
    }
  });

  it('loading: a Medium spinner scaled to 20px (stroke ~1.67px), track/arc tokens', () => {
    render(
      <div data-theme={theme}>
        <StatusIcon status="loading" data-testid="default" />
        <StatusIcon status="loading" inverse data-testid="inverse" />
      </div>,
    );
    for (const [id, track, arc] of [
      ['default', '--color-sds-surface-subtle', '--color-sds-icon-primary'],
      ['inverse', '--color-sds-surface-subtle-inverse', '--color-sds-icon-primary-inverse'],
    ] as const) {
      const box = screen.getByTestId(id);
      const svg = box.querySelector('svg')!;
      const rect = svg.getBoundingClientRect();
      expect([rect.width, rect.height]).toEqual([20, 20]);
      // viewBox 24 rendered at 20px → the 2px stroke renders at 20/24 × 2.
      expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
      const [trackCircle, arcCircle] = svg.querySelectorAll('circle');
      expect(trackCircle.getAttribute('stroke-width')).toBe('2');
      expect(getComputedStyle(trackCircle).stroke).toBe(tokenColor(box, track));
      expect(getComputedStyle(arcCircle).stroke).toBe(tokenColor(box, arc));
    }
  });
});
