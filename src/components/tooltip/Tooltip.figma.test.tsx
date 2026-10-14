import '../../App.css';
import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

// Figma "Tooltip" (component set 9639:4097, frame 10245:3230, Nova｜Master) —
// /component Tooltip Figma sync, 2026-10-07. The content portals into a
// `data-theme` region (via `container`) so tokens resolve per theme.

function Open({
  theme,
  side,
}: {
  theme: 'light' | 'dark';
  side: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [region, setRegion] = useState<HTMLDivElement | null>(null);
  return (
    <div data-theme={theme} ref={setRegion} style={{ padding: 80 }}>
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>
            <button type="button">Trigger</button>
          </TooltipTrigger>
          {region && (
            <TooltipContent side={side} container={region} data-testid="tip">
              ラベル
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

describe.each(['light', 'dark'] as const)('Tooltip — Figma Tooltip (%s)', (theme) => {
  it('bubble: container-inverse fill, on-surface Body S text, 4/8 padding, radius 4, max 240, Lv.3 shadow', async () => {
    render(<Open theme={theme} side="top" />);
    const tip = await screen.findByTestId('tip');
    const cs = getComputedStyle(tip);
    expect(cs.backgroundColor).toBe(tokenColor(tip, '--color-sds-background-container-inverse'));
    expect(cs.color).toBe(tokenColor(tip, '--color-sds-text-on-surface'));
    expect([cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]).toEqual([
      '4px',
      '8px',
      '4px',
      '8px',
    ]);
    expect(cs.borderTopLeftRadius).toBe('4px');
    expect(cs.maxWidth).toBe('240px');
    expect([cs.fontSize, cs.lineHeight, cs.fontWeight]).toEqual(['12px', '21px', '400']);
    expect(cs.boxShadow).not.toBe('none');
  });

  // Figma: the arrow sticks out 4px (a 12×6 vector, 2px of it under the
  // bubble, in a 12×4 Arrow Container) and shares the bubble's fill.
  it.each(['top', 'bottom', 'left', 'right'] as const)(
    '%s arrow: 12px wide, 4px out, container-inverse',
    async (side) => {
      render(<Open theme={theme} side={side} />);
      const tip = await screen.findByTestId('tip');
      const arrow = tip.querySelector('svg')!;
      const r = arrow.getBoundingClientRect();
      const [long, short] =
        side === 'top' || side === 'bottom' ? [r.width, r.height] : [r.height, r.width];
      expect([long, short]).toEqual([12, 4]);
      expect(getComputedStyle(arrow).fill).toBe(
        tokenColor(tip, '--color-sds-background-container-inverse'),
      );
    },
  );
});
