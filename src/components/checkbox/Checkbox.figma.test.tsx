import '../../App.css';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { Checkbox, type CheckboxVariant } from './Checkbox';

// Figma "Checkbox" (component set 17503:9619, Nova｜Master) fidelity —
// /component Checkbox Figma sync, 2026-10-06. Real computed styles (App.css
// loaded), checked in a light AND a dark data-theme region, compared against
// the token resolved inside that region (never a hardcoded color).
type Value = boolean | 'indeterminate';
const VALUES: Value[] = [true, false, 'indeterminate'];

// Figma: Status × Value → box fill / border / icon (State=Enabled).
const enabled = (variant: CheckboxVariant, value: Value) =>
  ({
    bg:
      value === false
        ? '--color-sds-surface-base'
        : variant === 'error'
          ? '--color-sds-surface-danger'
          : '--color-sds-surface-primary',
    border: variant === 'error' ? '--color-sds-border-danger' : '--color-sds-border-strong',
    icon: '--color-sds-icon-on-surface',
  }) as const;

// Figma State=Hover.
const hovered = (variant: CheckboxVariant, value: Value) =>
  value === false
    ? variant === 'error'
      ? '--color-sds-background-danger'
      : '--color-sds-surface-secondary-hover'
    : variant === 'error'
      ? '--color-sds-surface-danger'
      : '--color-sds-surface-primary-hover';

describe.each(['light', 'dark'] as const)('Checkbox — Figma Checkbox (%s)', (theme) => {
  const renderIn = (ui: ReactNode) =>
    render(
      <div data-theme={theme} data-testid="region">
        {ui}
      </div>,
    );
  const box = (name: string) => screen.getByRole('checkbox', { name });
  const visibleIcon = (el: HTMLElement) =>
    Array.from(el.querySelectorAll('svg')).find((s) => getComputedStyle(s).display !== 'none');

  it.each(['default', 'error'] as const)(
    'enabled %s: fill, border and icon per Value',
    (variant) => {
      renderIn(
        VALUES.map((v) => (
          <Checkbox key={String(v)} aria-label={String(v)} variant={variant} checked={v} />
        )),
      );
      for (const v of VALUES) {
        const el = box(String(v));
        const want = enabled(variant, v);
        const cs = getComputedStyle(el);
        expect(cs.backgroundColor, `${v} bg`).toBe(tokenColor(el, want.bg));
        expect(cs.borderTopColor, `${v} border`).toBe(tokenColor(el, want.border));
        expect(cs.opacity).toBe('1');
        if (v !== false) {
          expect(getComputedStyle(visibleIcon(el)!).color, `${v} icon`).toBe(
            tokenColor(el, want.icon),
          );
        }
      }
    },
  );

  // Figma State=Disabled is identical for Status=Default and Status=Error:
  // surface-disabled fill, border-disable border, icon-disable icon, and NO
  // opacity (the box used `opacity-50` and an icon-on-surface icon, which
  // made a checked disabled box nearly indistinguishable from an unchecked one).
  it.each(['default', 'error'] as const)(
    'disabled %s: surface-disabled, border-disable, icon-disable, no opacity',
    (variant) => {
      renderIn(
        VALUES.map((v) => (
          <Checkbox key={String(v)} aria-label={String(v)} variant={variant} checked={v} disabled />
        )),
      );
      for (const v of VALUES) {
        const el = box(String(v));
        const cs = getComputedStyle(el);
        expect(cs.backgroundColor, `${v} bg`).toBe(tokenColor(el, '--color-sds-surface-disabled'));
        expect(cs.borderTopColor, `${v} border`).toBe(tokenColor(el, '--color-sds-border-disable'));
        expect(cs.opacity, `${v} opacity`).toBe('1');
        if (v !== false) {
          expect(getComputedStyle(visibleIcon(el)!).color, `${v} icon`).toBe(
            tokenColor(el, '--color-sds-icon-disable'),
          );
        }
      }
    },
  );

  it.each(['default', 'error'] as const)(
    'hover %s: fill per Value; disabled does not react',
    async (variant) => {
      renderIn(
        <>
          {VALUES.map((v) => (
            <Checkbox key={String(v)} aria-label={String(v)} variant={variant} checked={v} />
          ))}
          <Checkbox aria-label="disabled" variant={variant} disabled />
        </>,
      );
      for (const v of VALUES) {
        const el = box(String(v));
        await userEvent.hover(el);
        await Promise.all(el.getAnimations().map((a) => a.finished));
        expect(getComputedStyle(el).backgroundColor, `${v} hover`).toBe(
          tokenColor(el, hovered(variant, v)),
        );
      }
      const off = box('disabled');
      await userEvent.hover(off);
      await Promise.all(off.getAnimations().map((a) => a.finished));
      expect(getComputedStyle(off).backgroundColor).toBe(
        tokenColor(off, '--color-sds-surface-disabled'),
      );
    },
  );

  // The <label> composition Checkbox.figma.ts emits when Figma's Label is on
  // (Checkbox has no label prop). Figma: gap 8, Body M, Text/Primary,
  // Text/Disable when disabled.
  it('Code Connect label snippet: names the checkbox, toggles on label click, Figma text style', async () => {
    renderIn(
      <>
        <label
          className="flex items-center gap-sds-100 typo-body-m text-sds-text-primary"
          data-testid="l1"
        >
          <Checkbox checked={false} />
          ラベル
        </label>
        <label className="flex items-center gap-sds-100 typo-body-m text-sds-text-primary">
          <Checkbox />
          Toggle me
        </label>
        <label
          className="flex items-center gap-sds-100 typo-body-m text-sds-text-disable"
          data-testid="l3"
        >
          <Checkbox checked disabled />
          Off
        </label>
      </>,
    );
    const toggle = box('Toggle me');
    await userEvent.click(screen.getByText('Toggle me'));
    expect(toggle).toHaveAttribute('aria-checked', 'true');

    const l1 = screen.getByTestId('l1');
    expect(box('ラベル')).toBeInTheDocument();
    const cs = getComputedStyle(l1);
    expect([cs.columnGap, cs.fontSize, cs.fontWeight]).toEqual(['8px', '14px', '400']);
    expect(cs.color).toBe(tokenColor(l1, '--color-sds-text-primary'));
    const l3 = screen.getByTestId('l3');
    expect(getComputedStyle(l3).color).toBe(tokenColor(l3, '--color-sds-text-disable'));
  });

  it('box is 18px inside a 24px footprint; keyboard focus draws a 2px border-focus ring 2px out', async () => {
    renderIn(<Checkbox aria-label="focus" />);
    const el = box('focus');
    const cs = getComputedStyle(el);
    expect([cs.width, cs.height, cs.marginTop, cs.marginLeft]).toEqual([
      '18px',
      '18px',
      '3px',
      '3px',
    ]);
    await userEvent.click(document.body);
    await userEvent.tab();
    expect(el).toHaveFocus();
    const f = getComputedStyle(el);
    expect([f.outlineStyle, f.outlineWidth, f.outlineOffset]).toEqual(['solid', '2px', '2px']);
    expect(f.outlineColor).toBe(tokenColor(el, '--color-sds-border-focus'));
  });
});
