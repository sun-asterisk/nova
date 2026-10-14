import '../../App.css';
import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { TextField } from './TextField';

// Figma Text Field `Status=Error` (610:2971): the error message icon is
// `Icon/Danger`, the text `Text/Danger` — distinct tokens with different
// values (light #dd2305 vs #c50e03). The icon used to inherit the text color
// (found 2026-10-06 by the disabled-state recheck).
describe.each(['light', 'dark'] as const)('TextField error message — Figma (%s)', (theme) => {
  const renderIn = (ui: ReactNode) => render(<div data-theme={theme}>{ui}</div>);

  it('error icon uses icon-danger and the message uses text-danger', () => {
    renderIn(<TextField label="Email" error="Invalid" />);
    const text = screen.getByText('Invalid');
    const icon = text.parentElement!.querySelector('svg')!;
    expect(getComputedStyle(icon).color).toBe(tokenColor(text, '--color-sds-icon-danger'));
    expect(getComputedStyle(text).color).toBe(tokenColor(text, '--color-sds-text-danger'));
  });
});
