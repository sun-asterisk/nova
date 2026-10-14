import '../../App.css';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Switch, type SwitchSize } from './Switch';

// Figma "Switch" (component set 8248:329, frame 10245:2939, Nova｜Master) —
// /component Switch Figma sync, 2026-10-07. Real computed styles (App.css
// loaded), in a light AND a dark data-theme region, against the token resolved
// inside that region.

const SIZES: Record<
  SwitchSize,
  { w: number; h: number; thumb: number; on: number; hoverW: number; hoverOn: number }
> = {
  // Figma: track 40×24 / 52×32 with 2px padding, handle 20 / 28 (x=18 / 22 when
  // on), hover handle 24 / 32 wide (x=14 / 18 when on).
  medium: { w: 40, h: 24, thumb: 20, on: 16, hoverW: 24, hoverOn: 12 },
  large: { w: 52, h: 32, thumb: 28, on: 20, hoverW: 32, hoverOn: 16 },
};

const settle = (el: Element) => Promise.all(el.getAnimations().map((a) => a.finished));

describe.each(['light', 'dark'] as const)('Switch — Figma Switch (%s)', (theme) => {
  const renderIn = (ui: ReactNode) =>
    render(
      <div data-theme={theme} data-testid="region">
        {ui}
      </div>,
    );
  const parts = (name: string) => {
    const root = screen.getByRole('switch', { name });
    const track = root.firstElementChild as HTMLElement;
    const thumb = track.firstElementChild as HTMLElement;
    return { root, track, thumb };
  };
  const thumbX = (track: HTMLElement, thumb: HTMLElement) =>
    Math.round(thumb.getBoundingClientRect().left - track.getBoundingClientRect().left - 2);

  it.each(['medium', 'large'] as const)(
    '%s: track size, thumb size/position and colors (off, on, disabled)',
    async (size) => {
      const s = SIZES[size];
      renderIn(
        <>
          <Switch aria-label="off" size={size} />
          <Switch aria-label="on" size={size} defaultChecked />
          <Switch aria-label="disabled-on" size={size} defaultChecked disabled />
        </>,
      );
      for (const name of ['off', 'on', 'disabled-on']) {
        const { track, thumb } = parts(name);
        await settle(thumb);
        const t = track.getBoundingClientRect();
        const h = thumb.getBoundingClientRect();
        expect([t.width, t.height], name).toEqual([s.w, s.h]);
        expect([h.width, h.height], name).toEqual([s.thumb, s.thumb]);
        expect(thumbX(track, thumb), name).toBe(name === 'off' ? 0 : s.on);
      }
      const color = (el: HTMLElement) => getComputedStyle(el).backgroundColor;
      const off = parts('off');
      const on = parts('on');
      const dis = parts('disabled-on');
      expect(color(off.track)).toBe(tokenColor(off.track, '--color-sds-surface-secondary'));
      expect(color(on.track)).toBe(tokenColor(on.track, '--color-sds-surface-primary'));
      expect(color(on.thumb)).toBe(tokenColor(on.thumb, '--color-sds-surface-base'));
      expect(color(dis.track)).toBe(tokenColor(dis.track, '--color-sds-surface-disabled'));
      expect(color(dis.thumb)).toBe(tokenColor(dis.thumb, '--color-sds-surface-disabled-strong'));
    },
  );

  it.each(['medium', 'large'] as const)(
    '%s hover: wider thumb with Elevation/Lv.1; on-track primary-hover',
    async (size) => {
      const s = SIZES[size];
      renderIn(<Switch aria-label="on" size={size} defaultChecked />);
      const { root, track, thumb } = parts('on');
      await userEvent.hover(root);
      await settle(thumb);
      await settle(track);
      expect(thumb.getBoundingClientRect().width).toBe(s.hoverW);
      expect(thumbX(track, thumb)).toBe(s.hoverOn);
      expect(getComputedStyle(thumb).boxShadow).not.toBe('none');
      expect(getComputedStyle(track).backgroundColor).toBe(
        tokenColor(track, '--color-sds-surface-primary-hover'),
      );
    },
  );

  // Figma's Focus ring (Focus boolean) surrounds the visible TRACK — a pill,
  // 2px Border/Focus, 2px away from the track — not the transparent 44×44 tap
  // area around it (which drew a square ring well outside the switch).
  it.each(['medium', 'large'] as const)(
    '%s keyboard focus: 2px border-focus pill ring 2px around the track, none on the tap area',
    async (size) => {
      renderIn(<Switch aria-label="focus" size={size} />);
      const { root, track } = parts('focus');
      await userEvent.click(document.body);
      await userEvent.tab();
      expect(root).toHaveFocus();
      expect(root.matches(':focus-visible')).toBe(true);
      const ring = getComputedStyle(track);
      expect([ring.outlineStyle, ring.outlineWidth, ring.outlineOffset]).toEqual([
        'solid',
        '2px',
        '2px',
      ]);
      expect(ring.outlineColor).toBe(tokenColor(track, '--color-sds-border-focus'));
      expect(parseFloat(ring.borderTopLeftRadius)).toBeGreaterThanOrEqual(SIZES[size].h / 2);
      expect(getComputedStyle(root).outlineStyle).toBe('none');
    },
  );
});
