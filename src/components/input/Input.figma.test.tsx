import '../../App.css';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Input } from './Input';

// Figma "Text Field" (component set 610:2971) fidelity — /component TextField
// Figma sync, 2026-10-05. Real computed styles (App.css loaded), checked in a
// light AND a dark data-theme region, compared against the token resolved
// inside that region (never a hardcoded color).
const Icon = (props: { 'data-testid': string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M0 0h24v24H0z" />
  </svg>
);

describe.each(['light', 'dark'] as const)('Input — Figma Text Field (%s)', (theme) => {
  const renderIn = (ui: ReactNode) =>
    render(
      <div data-theme={theme} data-testid="region">
        {ui}
      </div>,
    );

  it('placeholder uses the text-placeholder token (not the browser default)', () => {
    renderIn(<Input aria-label="Name" placeholder="Type here" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(getComputedStyle(input, '::placeholder').color).toBe(
      tokenColor(input, '--color-sds-text-placeholder'),
    );
  });

  it('adornment icons: icon-secondary; start icon icon-danger in error; icon-disable when disabled', () => {
    renderIn(
      <>
        <Input
          aria-label="a"
          startAdornment={<Icon data-testid="s1" />}
          endAdornment={<Icon data-testid="e1" />}
        />
        <Input
          aria-label="b"
          variant="error"
          startAdornment={<Icon data-testid="s2" />}
          endAdornment={<Icon data-testid="e2" />}
        />
        <Input
          aria-label="c"
          disabled
          startAdornment={<Icon data-testid="s3" />}
          endAdornment={<Icon data-testid="e3" />}
        />
      </>,
    );
    const color = (id: string) => getComputedStyle(screen.getByTestId(id)).color;
    const region = screen.getByTestId('region');
    const secondary = tokenColor(region, '--color-sds-icon-secondary');
    expect(color('s1')).toBe(secondary);
    expect(color('e1')).toBe(secondary);
    expect(color('s2')).toBe(tokenColor(region, '--color-sds-icon-danger'));
    expect(color('e2')).toBe(secondary);
    expect(color('s3')).toBe(tokenColor(region, '--color-sds-icon-disable'));
    expect(color('e3')).toBe(tokenColor(region, '--color-sds-icon-disable'));
  });

  it('keyboard focus draws a 2px border-focus ring 2px outside the field', async () => {
    renderIn(<Input aria-label="Focus me" />);
    const input = screen.getByRole('textbox', { name: 'Focus me' });
    await userEvent.click(document.body);
    await userEvent.tab();
    expect(input).toHaveFocus();
    const cs = getComputedStyle(input.parentElement!);
    expect([cs.outlineStyle, cs.outlineWidth, cs.outlineOffset]).toEqual(['solid', '2px', '2px']);
    expect(cs.outlineColor).toBe(tokenColor(input, '--color-sds-border-focus'));
  });

  it('hover paints surface-subtle-hover (default and error), never when disabled', async () => {
    renderIn(
      <>
        <Input aria-label="h1" />
        <Input aria-label="h2" variant="error" />
        <Input aria-label="h3" disabled />
      </>,
    );
    const region = screen.getByTestId('region');
    const hoverBg = tokenColor(region, '--color-sds-surface-subtle-hover');
    for (const [name, expected] of [
      ['h1', hoverBg],
      ['h2', hoverBg],
      ['h3', tokenColor(region, '--color-sds-surface-disabled')],
    ] as const) {
      const wrapper = screen.getByRole('textbox', { name }).parentElement!;
      await userEvent.hover(wrapper);
      expect(wrapper.matches(':hover')).toBe(true);
      // The wrapper transitions background-color (200ms): read the settled value.
      await Promise.all(wrapper.getAnimations().map((a) => a.finished));
      expect(getComputedStyle(wrapper).backgroundColor).toBe(expected);
    }
  });
});
