import type { Meta, StoryObj } from '@storybook/react';
import { ScrollArea } from 'radix-ui';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ScrollBarArea, Scrollbar } from './Scrollbar';

const meta = {
  title: 'Components/Scrollbar',
  component: Scrollbar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A customizable scrollbar component built on Radix UI ScrollArea. Supports vertical, horizontal, and bidirectional scrolling with multiple visibility modes. Also exposes low-level ScrollArea primitive for advanced composition.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      description: 'Scrollbar visibility behavior (auto, always, scroll, hover)',
      control: 'select',
      options: ['auto', 'always', 'scroll', 'hover'],
      table: {
        type: { summary: '"auto" | "always" | "scroll" | "hover"' },
        defaultValue: { summary: 'hover' },
      },
    },
    scrollHideDelay: {
      description: 'Delay in milliseconds before hiding scrollbars when type is "hover"',
      control: 'number',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '600' },
      },
    },
    showVertical: {
      description: 'Whether to show the vertical scrollbar when content overflows',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showHorizontal: {
      description: 'Whether to show the horizontal scrollbar when content overflows',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply to the root element',
      control: 'text',
      table: { type: { summary: 'string' } },
    },
    viewportClassName: {
      description: 'Additional CSS classes to apply to the scroll viewport',
      control: 'text',
      table: { type: { summary: 'string' } },
    },
    scrollbarClassName: {
      description: 'Additional CSS classes to apply to the scrollbar tracks',
      control: 'text',
      table: { type: { summary: 'string' } },
    },
    thumbClassName: {
      description: 'Additional CSS classes to apply to the scrollbar thumbs',
      control: 'text',
      table: { type: { summary: 'string' } },
    },
  },
} satisfies Meta<typeof Scrollbar>;

export default meta;

type Story = StoryObj<typeof meta>;

const VerticalContent = () => (
  <div className="flex flex-col gap-3 p-4">
    {Array.from({ length: 20 }, (_, index) => (
      <div
        key={index}
        className="rounded-sds-100 border border-sds-border-basic bg-sds-surface-base px-3 py-2 text-sm text-sds-text-secondary"
      >
        Item {index + 1}
      </div>
    ))}
  </div>
);

const HorizontalContent = () => (
  <div className="flex gap-3 p-4">
    {Array.from({ length: 12 }, (_, index) => (
      <div
        key={index}
        className="min-w-[140px] rounded-sds-100 border border-sds-border-basic bg-sds-surface-base px-3 py-6 text-center text-sm text-sds-text-secondary"
      >
        Card {index + 1}
      </div>
    ))}
  </div>
);

/**
 * Default vertical scrollbar with standard behavior.
 * The scrollbar appears when content overflows vertically.
 */
export const Default: Story = {
  render: () => (
    <div className="h-[280px] w-80 rounded-sds-100 border border-sds-border-basic bg-sds-surface-base">
      <Scrollbar showHorizontal={false}>
        <VerticalContent />
      </Scrollbar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Basic vertical scrollbar that appears when content overflows. Scrollbar uses the hover type by default, appearing when you interact with the scroll area.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const viewport = canvasElement.querySelector('[data-slot="scroll-area-viewport"]');
    await expect(viewport).toBeInTheDocument();
    await expect(canvas.getAllByText(/^Item \d+$/)).toHaveLength(20);
  },
};

/**
 * Horizontal scrollbar for content that overflows horizontally.
 */
export const Horizontal: Story = {
  render: () => (
    <div className="h-40 w-[360px] rounded-sds-100 border border-sds-border-basic bg-sds-surface-base">
      <Scrollbar showVertical={false}>
        <HorizontalContent />
      </Scrollbar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Horizontal scrollbar for content that needs to scroll from left to right. Useful for card carousels, tables, or wide content.',
      },
    },
  },
};

/**
 * Bidirectional scrolling with both vertical and horizontal scrollbars.
 */
export const BothAxes: Story = {
  render: () => (
    <div className="h-60 w-[360px] rounded-sds-100 border border-sds-border-basic bg-sds-surface-base">
      <Scrollbar>
        <div className="min-w-[600px]">
          <VerticalContent />
        </div>
      </Scrollbar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Scrollbar supporting both vertical and horizontal scrolling. Both scrollbars appear when content overflows in their respective directions.',
      },
    },
  },
};

/**
 * Always show scrollbars, even when not scrolling.
 */
export const TypeAlways: Story = {
  render: () => (
    <div className="h-60 w-80 rounded-sds-100 border border-sds-border-basic bg-sds-surface-base">
      <Scrollbar type="always" showHorizontal={false}>
        <VerticalContent />
      </Scrollbar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Scrollbars are always visible regardless of scroll state. Useful when you want to make scrollable content obvious to users.',
      },
    },
  },
};

/**
 * Show scrollbars only when hovering over the scroll area.
 */
export const TypeHover: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-sds-text-secondary">
        Hover over the content to see scrollbar
      </span>
      <div className="h-60 w-80 rounded-sds-100 border border-sds-border-basic bg-sds-surface-base">
        <Scrollbar type="hover" showHorizontal={false}>
          <VerticalContent />
        </Scrollbar>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Scrollbars appear only when hovering over the scroll area, providing a cleaner interface while still indicating scrollable content.',
      },
    },
  },
};

/**
 * Custom styling for scrollbar track and thumb.
 */
export const WithCustomStyling: Story = {
  render: () => (
    <div className="h-60 w-80 rounded-sds-100 border border-sds-border-basic bg-sds-surface-base">
      <Scrollbar
        showHorizontal={false}
        scrollbarClassName="px-1"
        thumbClassName="bg-sds-border-strong hover:bg-sds-text-disabled transition-colors rounded-sds-full"
      >
        <VerticalContent />
      </Scrollbar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Customize the scrollbar appearance using scrollbarClassName for the track and thumbClassName for the thumb. This example shows a stronger color and rounded thumb.',
      },
    },
  },
  play: async ({ canvasElement }) => {
    // Regression for the Scrollbar/ScrollBarArea dual-style-source bug
    // fixed in Phase 8: thumbClassName must reach the actual thumb element,
    // not be silently dropped or double-applied. This story uses the
    // default `type="hover"` behavior, so Radix only mounts/shows the
    // thumb once the scroll area is actually hovered; it also measures
    // overflow via ResizeObserver, so poll rather than asserting on mount.
    const scrollArea = canvasElement.querySelector('[data-slot="scroll-area"]');
    await userEvent.hover(scrollArea as HTMLElement);
    await waitFor(() => {
      const thumb = canvasElement.querySelector('[data-slot="scroll-area-thumb"]');
      expect(thumb).toBeInTheDocument();
      expect(thumb?.className).toContain('bg-sds-border-strong');
    });
  },
};

/**
 * Regression coverage for three real, confirmed bugs found and fixed during
 * the 2026-09-08 Figma-fidelity audit (see docs/components/scrollbar.md §7
 * and .claude/rules/design-foundation.md §5.1):
 * (1) the scroll viewport (tabIndex=0, genuinely keyboard-focusable) had no
 *     visible focus ring at all — the same tailwind-merge `outline-none` +
 *     bare `outline`/`outline-2` collision found repeatedly elsewhere.
 * (2) the track was 8px thick (`w-2`/`h-2`) with 2px padding, not Figma's
 *     measured 12px/4px.
 * (3) the thumb's `data-[orientation=...]:` size classes never matched
 *     anything (Radix's `ScrollAreaThumb` never carries its own
 *     `data-orientation`), so the intended 4px→8px hover-widen had NEVER
 *     actually worked in any shipped version — the visible ~3-4px width was
 *     an accident of `flex-1` filling leftover track space, and Radix's own
 *     inline `style="width:...; height:..."` on the thumb meant even a
 *     correctly-scoped class needed `!important` to ever take effect. The
 *     widen trigger is now real React state on the TRACK's own pointer
 *     events (`data-[hovered=true]` on the thumb), not a plain CSS
 *     `:hover` — both to match Figma's own spec (hovering the full 12px
 *     Hit Area triggers it, not just the thin 4px thumb) and to make it
 *     reliably testable via `userEvent.hover()` below.
 */
export const InteractionFocusRingAndThumbSizing: Story = {
  render: () => (
    <div className="h-[200px] w-80 rounded-sds-100 border border-sds-border-basic bg-sds-surface-base">
      <Scrollbar showHorizontal={false}>
        <VerticalContent />
      </Scrollbar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const viewportEl = canvasElement.querySelector(
      '[data-slot="scroll-area-viewport"]',
    ) as HTMLElement;
    await expect(viewportEl).toBeInTheDocument();

    const win = canvasElement.ownerDocument.defaultView!;

    // Bug #1: real keyboard Tab must land a genuine, correctly-colored
    // focus ring on the viewport (not silently suppressed).
    await userEvent.tab();
    let tries = 0;
    while (canvasElement.ownerDocument.activeElement !== viewportEl && tries < 10) {
      await userEvent.tab();
      tries += 1;
    }
    await expect(canvasElement.ownerDocument.activeElement).toBe(viewportEl);
    await expect(viewportEl.matches(':focus-visible')).toBe(true);
    const viewportCs = win.getComputedStyle(viewportEl);
    await expect(viewportCs.outlineStyle).toBe('solid');
    await expect(viewportCs.outlineWidth).toBe('2px');

    // Bug #2: track thickness must be Figma's measured 12px, not 8px.
    // Radix only mounts the track once the scroll area is actually
    // hovered (default `type="hover"`) and measures overflow via
    // ResizeObserver, so poll rather than asserting immediately.
    await userEvent.hover(viewportEl);
    await waitFor(() => {
      const trackEl = canvasElement.querySelector('[data-slot="scroll-area-scrollbar"]');
      expect(trackEl).toBeInTheDocument();
      expect(trackEl!.getBoundingClientRect().width).toBe(12);
    });

    // Bug #3: the thumb must have a REAL, effective 4px default width — not
    // the old accidental ~3px `flex-1`-fill value, and not the 0px it
    // briefly regressed to mid-fix when `flex-1` was swapped for
    // `flex-none` without also adding `!important` (see Scrollbar.styles.ts
    // for why an inline Radix `style="width:..."` requires `!important` to
    // ever be overridden by a class).
    let trackEl: Element | null = null;
    await waitFor(() => {
      trackEl = canvasElement.querySelector('[data-slot="scroll-area-scrollbar"]');
      const thumbEl = canvasElement.querySelector('[data-slot="scroll-area-thumb"]');
      expect(trackEl).toBeInTheDocument();
      expect(thumbEl).toBeInTheDocument();
      expect(thumbEl!.getBoundingClientRect().width).toBe(4);
    });

    // Bug #3, continued — hover-widen: the width-expand is driven by real
    // React state on the TRACK's own pointer events (not a plain CSS
    // `:hover` pseudo-class — see Scrollbar.tsx), specifically so this is
    // reliably testable via `userEvent.hover()`, which dispatches real
    // pointerenter/pointerleave events even though it doesn't move the
    // actual OS cursor (CSS `:hover` needs a real cursor move; JS pointer
    // listeners don't). Hovering the track (the full 12px Hit Area, per
    // Figma's own "Track領域に入った時" spec) must widen the thumb to 8px.
    await userEvent.hover(trackEl!);
    await waitFor(() => {
      const thumbEl = canvasElement.querySelector('[data-slot="scroll-area-thumb"]');
      expect(thumbEl!.getBoundingClientRect().width).toBe(8);
    });

    // Un-hovering the track must shrink it back to 4px.
    await userEvent.unhover(trackEl!);
    await waitFor(() => {
      const thumbEl = canvasElement.querySelector('[data-slot="scroll-area-thumb"]');
      expect(thumbEl!.getBoundingClientRect().width).toBe(4);
    });
  },
};

/**
 * Using the low-level ScrollBar primitive for advanced composition.
 */
export const PrimitiveUsage: Story = {
  render: () => (
    <div className="h-60 w-80 rounded-sds-100 border border-sds-border-basic bg-sds-surface-base">
      <ScrollArea.Root className="relative size-full">
        <ScrollArea.Viewport tabIndex={0} className="size-full rounded-[inherit]">
          <VerticalContent />
        </ScrollArea.Viewport>
        {/* px-[3px]: consumer-chosen scrollbar track inset, not on the spacing scale (2px/4px) */}
        <ScrollBarArea
          className="px-[3px]"
          thumbClassName="bg-sds-border-strong rounded-sds-full"
        />
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use the ScrollBar primitive directly when building custom scroll components. This allows full control over the scrollbar track and thumb styling while composing with Radix UI primitives.',
      },
    },
  },
};
