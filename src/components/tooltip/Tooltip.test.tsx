import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

// Regression coverage for a previously-zero-coverage gap: Tooltip had no
// `.test.tsx` at all (only Storybook stories/play tests), leaving its
// non-visual logic — the deliberate `asChild=true` default flip and ref
// forwarding on Trigger/Content — entirely unverified by a DOM assertion.
describe('Tooltip', () => {
  it('TooltipTrigger defaults asChild to true, merging props onto the child with no extra wrapper element', () => {
    const { container } = render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    // If asChild had introduced a wrapper (or defaulted to false, which
    // would render Radix's own <button> around the child), the trigger's
    // parent would not be the render container itself.
    expect(trigger.parentElement).toBe(container);
  });

  it('forwards a ref to the trigger element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger ref={ref}>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(ref.current).toBe(screen.getByRole('button', { name: 'Hover me' }));
  });

  it('forwards a ref to the content element while open', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent ref={ref}>Tip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('renders content into a custom container via the `container` prop', () => {
    const portalTarget = document.createElement('div');
    portalTarget.setAttribute('data-testid', 'custom-portal');
    document.body.appendChild(portalTarget);

    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent container={portalTarget}>Tip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    expect(portalTarget).toHaveTextContent('Tip text');

    document.body.removeChild(portalTarget);
  });
});
