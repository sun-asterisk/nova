import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import '../../styles.css';
import { Switch } from './Switch';

// Real-CSS regression coverage for the thumb's hover shadow. The class used to
// be assembled at runtime (`group-hover:${HOVER_SHADOW}`), so the class STRING
// on the element was correct while Tailwind's source scanner never saw the
// literal and never generated the rule — a className assertion passes either
// way. This loads the real stylesheet and checks the computed box-shadow
// under a real Playwright pointer hover instead.
function thumbOf(root: HTMLElement) {
  const thumb = root.querySelector<HTMLElement>('span[data-state]');
  if (!thumb) throw new Error('thumb not found');
  return thumb;
}

describe('Switch hover shadow (real CSS)', () => {
  it.each([
    ['medium', false],
    ['medium', true],
    ['large', false],
    ['large', true],
  ] as const)('size=%s checked=%s: thumb gains a box-shadow on hover', async (size, checked) => {
    render(<Switch size={size} defaultChecked={checked} data-testid="switch" />);
    const root = screen.getByTestId('switch');
    const thumb = thumbOf(root);
    expect(getComputedStyle(thumb).boxShadow).toBe('none');

    await userEvent.hover(root);
    await expect.poll(() => getComputedStyle(thumb).boxShadow).not.toBe('none');
  });

  it('a disabled switch gets no hover shadow', async () => {
    render(<Switch disabled data-testid="switch" />);
    const root = screen.getByTestId('switch');
    await userEvent.hover(root);
    expect(getComputedStyle(thumbOf(root)).boxShadow).toBe('none');
  });
});
