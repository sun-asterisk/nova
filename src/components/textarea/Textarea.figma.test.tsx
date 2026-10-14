import '../../App.css';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Textarea } from './Textarea';

// Figma "Text Area" (component set 598:2713) fidelity — /component TextArea
// Figma sync, 2026-10-05. Real computed styles, checked in a light AND a dark
// data-theme region against the token resolved there (never hardcoded).
describe.each(['light', 'dark'] as const)('Textarea — Figma Text Area (%s)', (theme) => {
  const renderIn = (ui: ReactNode) =>
    render(
      <div data-theme={theme} data-testid="region">
        {ui}
      </div>,
    );
  const token = (name: `--color-sds-${string}`) => tokenColor(screen.getByTestId('region'), name);
  const settle = (el: Element) => Promise.all(el.getAnimations().map((a) => a.finished));

  it('keyboard focus draws a 2px border-focus ring 2px outside', async () => {
    renderIn(<Textarea aria-label="Focus me" />);
    const el = screen.getByRole('textbox', { name: 'Focus me' });
    await userEvent.click(document.body);
    await userEvent.tab();
    expect(el).toHaveFocus();
    const cs = getComputedStyle(el);
    expect([cs.outlineStyle, cs.outlineWidth, cs.outlineOffset]).toEqual(['solid', '2px', '2px']);
    expect(cs.outlineColor).toBe(token('--color-sds-border-focus'));
  });

  it('hover paints surface-subtle-hover (default and error), never when disabled', async () => {
    renderIn(
      <>
        <Textarea aria-label="h1" />
        <Textarea aria-label="h2" variant="error" />
        <Textarea aria-label="h3" disabled />
      </>,
    );
    for (const [name, expected] of [
      ['h1', token('--color-sds-surface-subtle-hover')],
      ['h2', token('--color-sds-surface-subtle-hover')],
      ['h3', token('--color-sds-surface-disabled')],
    ] as const) {
      const el = screen.getByRole('textbox', { name });
      await userEvent.hover(el);
      expect(el.matches(':hover')).toBe(true);
      await settle(el);
      expect(getComputedStyle(el).backgroundColor).toBe(expected);
    }
  });

  it('disabled: surface-disabled background, value in text-primary, border-disable', () => {
    renderIn(<Textarea aria-label="d" disabled defaultValue="Filled" />);
    const cs = getComputedStyle(screen.getByRole('textbox', { name: 'd' }));
    expect(cs.backgroundColor).toBe(token('--color-sds-surface-disabled'));
    expect(cs.color).toBe(token('--color-sds-text-primary'));
    expect(cs.borderTopColor).toBe(token('--color-sds-border-disable'));
  });

  it('disabled placeholder: text-disable by default, text-placeholder in error', () => {
    renderIn(
      <>
        <Textarea aria-label="p1" disabled placeholder="x" />
        <Textarea aria-label="p2" disabled variant="error" placeholder="x" />
      </>,
    );
    const ph = (name: string) =>
      getComputedStyle(screen.getByRole('textbox', { name }), '::placeholder').color;
    expect(ph('p1')).toBe(token('--color-sds-text-disable'));
    expect(ph('p2')).toBe(token('--color-sds-text-placeholder'));
  });

  // Vertical-only resize (Figma: height grows, scroll beyond the max). Pinned
  // to the explicit `resize-y` class — preflight also sets textarea resize,
  // so assert the class too, or removing it would go unnoticed.
  it('resizes vertically only, via the explicit resize-y utility', () => {
    renderIn(<Textarea aria-label="r" />);
    const el = screen.getByRole('textbox', { name: 'r' });
    expect(getComputedStyle(el).resize).toBe('vertical');
    expect(el.className.split(' ')).toContain('resize-y');
  });

  it('disabled + error keeps the border-danger border (Figma Text Area)', () => {
    renderIn(<Textarea aria-label="de" disabled variant="error" />);
    const cs = getComputedStyle(screen.getByRole('textbox', { name: 'de' }));
    expect(cs.borderTopColor).toBe(token('--color-sds-border-danger'));
    expect(cs.backgroundColor).toBe(token('--color-sds-surface-disabled'));
  });
});
