import '../../App.css';
import { fireEvent, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Scrim } from './Scrim';

// Figma "Scrim" (10930:5994, frame 10930:5489): a full-viewport Background/
// Scrim layer that fades in with the front component; the whole scrim is the
// click target when a click should close that component.
describe.each(['light', 'dark'] as const)('Scrim (%s)', (theme) => {
  it('covers the viewport with Background/Scrim and fades in', () => {
    render(
      <div data-theme={theme}>
        <Scrim data-testid="scrim" />
      </div>,
    );
    const el = screen.getByTestId('scrim');
    const cs = getComputedStyle(el);
    expect(cs.backgroundColor).toBe(tokenColor(el, '--color-sds-background-scrim'));
    expect(cs.position).toBe('fixed');
    const r = el.getBoundingClientRect();
    expect([r.width, r.height]).toEqual([window.innerWidth, window.innerHeight]);
    expect(cs.animationName).not.toBe('none');
  });
});

describe('Scrim behavior', () => {
  it('is decorative to assistive technology and forwards clicks and refs', () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(<Scrim ref={ref} data-testid="scrim" onClick={onClick} className="custom" />);
    const el = screen.getByTestId('scrim');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(ref.current).toBe(el);
    expect(el.className).toContain('custom');
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
