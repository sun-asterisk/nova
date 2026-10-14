import '../../App.css';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { tokenColor } from '../../../.storybook/tokenColor';
import { TextareaField } from './TextareaField';

// Figma "Text Area" (598:2713) `Label` frame: 8px between the label text and
// the 必須 tag (Text Field's is 4px) — /component TextArea sync, 2026-10-05.
it('label row has an 8px gap between the label and the required tag', () => {
  render(<TextareaField label="Comment" required />);
  const label = screen.getByText('Comment').closest('label')!;
  expect(getComputedStyle(label).columnGap).toBe('8px');
});

// Figma Text Area `Status=Error` (598:2713): error icon `Icon/Danger`, text
// `Text/Danger` — the icon used to inherit the text color (2026-10-06).
describe.each(['light', 'dark'] as const)('TextareaField error message — Figma (%s)', (theme) => {
  const renderIn = (ui: ReactNode) => render(<div data-theme={theme}>{ui}</div>);

  it.each([false, true])('error icon uses icon-danger (disabled=%s)', (disabled) => {
    renderIn(<TextareaField label="Comment" error="Too long" disabled={disabled} />);
    const text = screen.getByText('Too long');
    const icon = text.parentElement!.querySelector('svg')!;
    expect(getComputedStyle(icon).color).toBe(tokenColor(text, '--color-sds-icon-danger'));
    expect(getComputedStyle(text).color).toBe(tokenColor(text, '--color-sds-text-danger'));
  });
});
