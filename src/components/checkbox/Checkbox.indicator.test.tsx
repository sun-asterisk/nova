import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import '../../styles.css';
import { Checkbox } from './Checkbox';
import { IconCheck, IconMinus } from '../icons';

// Real-CSS coverage for which indicator icon is actually VISIBLE. The icon
// choice must follow Radix's own resolved state (controlled OR uncontrolled),
// not just the `checked` prop — `defaultChecked="indeterminate"` used to
// render a check mark. Loads the real stylesheet because visibility is
// decided by CSS on the Indicator's `data-state`.
function renderedPathD(Icon: typeof IconCheck) {
  const { container, unmount } = render(<Icon />);
  const d = container.querySelector('path')?.getAttribute('d');
  unmount();
  return d;
}

function visibleIconPaths(root: HTMLElement) {
  return Array.from(root.querySelectorAll<SVGSVGElement>('[data-slot="checkbox-indicator"] svg'))
    .filter((svg) => getComputedStyle(svg).display !== 'none')
    .map((svg) => svg.querySelector('path')?.getAttribute('d'));
}

describe('Checkbox indicator icon (real CSS)', () => {
  it('uncontrolled defaultChecked="indeterminate" shows only the Minus icon', () => {
    render(<Checkbox defaultChecked="indeterminate" data-testid="cb" />);
    expect(visibleIconPaths(screen.getByTestId('cb'))).toEqual([renderedPathD(IconMinus)]);
  });

  it('uncontrolled: clicking indeterminate -> checked switches to the Check icon', async () => {
    render(<Checkbox defaultChecked="indeterminate" data-testid="cb" />);
    const cb = screen.getByTestId('cb');
    cb.click();
    await expect.poll(() => cb.getAttribute('data-state')).toBe('checked');
    expect(visibleIconPaths(cb)).toEqual([renderedPathD(IconCheck)]);
  });

  it('controlled checked="indeterminate" shows only the Minus icon', () => {
    render(<Checkbox checked="indeterminate" data-testid="cb" />);
    expect(visibleIconPaths(screen.getByTestId('cb'))).toEqual([renderedPathD(IconMinus)]);
  });

  it('checked shows only the Check icon', () => {
    render(<Checkbox checked onCheckedChange={() => {}} data-testid="cb" />);
    expect(visibleIconPaths(screen.getByTestId('cb'))).toEqual([renderedPathD(IconCheck)]);
  });
});
