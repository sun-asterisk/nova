import '../../App.css';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@vitest/browser/context';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { RadioGroup, RadioGroupItem, type RadioGroupItemVariant } from './RadioGroup';

// Figma "Radio" (component set 17503:9702, Nova｜Master) fidelity —
// /component Radio button Figma sync, 2026-10-06. Real computed styles
// (App.css loaded), checked in a light AND a dark data-theme region, compared
// against the token resolved inside that region (never a hardcoded color).
// Same structure as Checkbox.figma.test.tsx.

// Figma: Status × Value → circle fill / border (State=Enabled); the 8px dot is
// Surface/Base whenever Value=True.
const enabledBg = (variant: RadioGroupItemVariant, checked: boolean) =>
  !checked
    ? '--color-sds-surface-base'
    : variant === 'error'
      ? '--color-sds-surface-danger'
      : '--color-sds-surface-primary';

// Figma State=Hover.
const hoveredBg = (variant: RadioGroupItemVariant, checked: boolean) =>
  !checked
    ? variant === 'error'
      ? '--color-sds-background-danger'
      : '--color-sds-surface-secondary-hover'
    : variant === 'error'
      ? '--color-sds-surface-danger'
      : '--color-sds-surface-primary-hover';

describe.each(['light', 'dark'] as const)('RadioGroupItem — Figma Radio (%s)', (theme) => {
  const renderIn = (ui: ReactNode) =>
    render(
      <div data-theme={theme} data-testid="region">
        {ui}
      </div>,
    );
  // `checked` item value is "on"; the group is controlled so both states render.
  const pair = (props: { variant?: RadioGroupItemVariant; disabled?: boolean }) => (
    <RadioGroup value="on">
      <RadioGroupItem aria-label="on" value="on" {...props} />
      <RadioGroupItem aria-label="off" value="off" {...props} />
    </RadioGroup>
  );
  const item = (name: string) => screen.getByRole('radio', { name });
  const dot = (el: HTMLElement) => el.querySelector('svg')!;

  it.each(['default', 'error'] as const)(
    'enabled %s: fill and border per Value; dot surface-base',
    (variant) => {
      renderIn(pair({ variant }));
      for (const checked of [true, false]) {
        const el = item(checked ? 'on' : 'off');
        const cs = getComputedStyle(el);
        expect(cs.backgroundColor, `${checked} bg`).toBe(
          tokenColor(el, enabledBg(variant, checked)),
        );
        expect(cs.borderTopColor, `${checked} border`).toBe(
          tokenColor(
            el,
            variant === 'error' ? '--color-sds-border-danger' : '--color-sds-border-strong',
          ),
        );
        expect(cs.opacity).toBe('1');
        if (checked)
          expect(getComputedStyle(dot(el)).fill).toBe(tokenColor(el, '--color-sds-surface-base'));
      }
    },
  );

  // Figma State=Disabled is identical for Status=Default and Status=Error:
  // surface-disabled fill whether or not it is selected, border-disable, and
  // an icon-disable dot (the item kept the white surface-base fill when
  // unselected and drew a surface-base dot — nearly invisible on
  // surface-disabled — when selected).
  it.each(['default', 'error'] as const)(
    'disabled %s: surface-disabled, border-disable, icon-disable dot',
    (variant) => {
      renderIn(pair({ variant, disabled: true }));
      for (const checked of [true, false]) {
        const el = item(checked ? 'on' : 'off');
        const cs = getComputedStyle(el);
        expect(cs.backgroundColor, `${checked} bg`).toBe(
          tokenColor(el, '--color-sds-surface-disabled'),
        );
        expect(cs.borderTopColor, `${checked} border`).toBe(
          tokenColor(el, '--color-sds-border-disable'),
        );
        expect(cs.opacity).toBe('1');
        if (checked)
          expect(getComputedStyle(dot(el)).fill, 'dot').toBe(
            tokenColor(el, '--color-sds-icon-disable'),
          );
      }
    },
  );

  it.each(['default', 'error'] as const)(
    'hover %s: fill per Value; disabled does not react',
    async (variant) => {
      renderIn(
        <>
          {pair({ variant })}
          <RadioGroup>
            <RadioGroupItem aria-label="disabled" value="x" variant={variant} disabled />
          </RadioGroup>
        </>,
      );
      for (const checked of [true, false]) {
        const el = item(checked ? 'on' : 'off');
        await userEvent.hover(el);
        await Promise.all(el.getAnimations().map((a) => a.finished));
        expect(getComputedStyle(el).backgroundColor, `${checked} hover`).toBe(
          tokenColor(el, hoveredBg(variant, checked)),
        );
      }
      const off = item('disabled');
      await userEvent.hover(off);
      expect(getComputedStyle(off).backgroundColor).toBe(
        tokenColor(off, '--color-sds-surface-disabled'),
      );
    },
  );

  // The <label> composition RadioGroup.figma.ts emits when Figma's Label is on
  // (RadioGroupItem has no label prop). Figma: gap 8, Body M, Text/Primary,
  // Text/Disable when disabled — same as Checkbox.
  it('Code Connect label snippet: names the radio, selects on label click, Figma text style', async () => {
    renderIn(
      <RadioGroup>
        <label
          className="flex items-center gap-sds-100 typo-body-m text-sds-text-primary"
          data-testid="l1"
        >
          <RadioGroupItem value="a" />
          ラベル
        </label>
        <label
          className="flex items-center gap-sds-100 typo-body-m text-sds-text-disable"
          data-testid="l2"
        >
          <RadioGroupItem value="b" disabled />
          Off
        </label>
      </RadioGroup>,
    );
    await userEvent.click(screen.getByText('ラベル'));
    expect(item('ラベル')).toHaveAttribute('aria-checked', 'true');
    const l1 = screen.getByTestId('l1');
    const cs = getComputedStyle(l1);
    expect([cs.columnGap, cs.fontSize, cs.fontWeight]).toEqual(['8px', '14px', '400']);
    expect(cs.color).toBe(tokenColor(l1, '--color-sds-text-primary'));
    const l2 = screen.getByTestId('l2');
    expect(getComputedStyle(l2).color).toBe(tokenColor(l2, '--color-sds-text-disable'));
  });

  it('circle is 18px inside a 24px footprint with an 8px dot; keyboard focus draws a 2px ring 2px out', async () => {
    renderIn(
      <RadioGroup value="a">
        <RadioGroupItem aria-label="focus" value="a" />
      </RadioGroup>,
    );
    const el = item('focus');
    const cs = getComputedStyle(el);
    expect([cs.width, cs.height, cs.marginTop, cs.marginLeft]).toEqual([
      '18px',
      '18px',
      '3px',
      '3px',
    ]);
    const d = dot(el).getBoundingClientRect();
    expect([d.width, d.height]).toEqual([8, 8]);
    await userEvent.click(document.body);
    await userEvent.tab();
    expect(el).toHaveFocus();
    const f = getComputedStyle(el);
    expect([f.outlineStyle, f.outlineWidth, f.outlineOffset]).toEqual(['solid', '2px', '2px']);
    expect(f.outlineColor).toBe(tokenColor(el, '--color-sds-border-focus'));
  });
});
