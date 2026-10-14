import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScrollArea } from 'radix-ui';
import { createRef } from 'react';
import { Scrollbar, ScrollBarArea } from './Scrollbar';

// Regression coverage for a previously-zero-coverage gap: Scrollbar had no
// `.test.tsx` at all (only Storybook stories/play tests). Visual/interaction
// behavior (focus ring, track/thumb sizing) is covered by
// Scrollbar.stories.tsx's `InteractionFocusRingAndThumbSizing` — this file
// targets ref forwarding, which isn't reasonably observable there.
describe('Scrollbar', () => {
  it('forwards a ref to the root element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Scrollbar ref={ref} data-testid="scrollbar-root">
        content
      </Scrollbar>,
    );
    expect(ref.current).toBe(screen.getByTestId('scrollbar-root'));
  });

  it('ScrollBarArea forwards a ref to the scrollbar track element', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <ScrollArea.Root type="always" style={{ height: 50, width: 50 }}>
        <ScrollArea.Viewport style={{ height: '100%', width: '100%' }}>
          <div style={{ height: 200, width: 200 }}>content</div>
        </ScrollArea.Viewport>
        <ScrollBarArea ref={ref} data-testid="scroll-area-scrollbar" />
      </ScrollArea.Root>,
    );
    expect(ref.current).toBe(screen.getByTestId('scroll-area-scrollbar'));
  });

  it('renders only a horizontal scrollbar track when showVertical is false', () => {
    const { container } = render(
      <Scrollbar showVertical={false} type="always" style={{ height: 50, width: 50 }}>
        <div style={{ height: 200, width: 200 }}>content</div>
      </Scrollbar>,
    );
    const tracks = container.querySelectorAll('[data-slot="scroll-area-scrollbar"]');
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('renders only a vertical scrollbar track when showHorizontal is false', () => {
    const { container } = render(
      <Scrollbar showHorizontal={false} type="always" style={{ height: 50, width: 50 }}>
        <div style={{ height: 200, width: 200 }}>content</div>
      </Scrollbar>,
    );
    const tracks = container.querySelectorAll('[data-slot="scroll-area-scrollbar"]');
    expect(tracks).toHaveLength(1);
    expect(tracks[0]).toHaveAttribute('data-orientation', 'vertical');
  });

  it('applies viewportClassName to the viewport and scrollbarClassName to both scrollbar tracks', () => {
    const { container } = render(
      <Scrollbar
        type="always"
        style={{ height: 50, width: 50 }}
        viewportClassName="viewport-x"
        scrollbarClassName="scrollbar-x"
      >
        <div style={{ height: 200, width: 200 }}>content</div>
      </Scrollbar>,
    );
    expect(container.querySelector('[data-slot="scroll-area-viewport"]')?.className).toContain(
      'viewport-x',
    );
    const tracks = container.querySelectorAll('[data-slot="scroll-area-scrollbar"]');
    expect(tracks).toHaveLength(2);
    tracks.forEach((track) => expect(track.className).toContain('scrollbar-x'));
  });
});
