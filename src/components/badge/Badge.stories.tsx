import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A small status indicator for counts, unread dots, labels, or error markers. Anchors to a corner via `position` for overlaying icons/avatars, or renders inline by default. `max` truncates a numeric `label` with a "+" suffix (e.g. `max={99}` turns `150` into `99+`).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['count', 'dot', 'label', 'error'],
      description: 'Visual style variant of the badge',
      table: {
        type: { summary: 'BadgeVariant' },
        defaultValue: { summary: 'count' },
      },
    },
    label: {
      control: 'text',
      description: 'Label text for count and label variants',
      table: {
        type: { summary: 'string' },
      },
    },
    max: {
      control: 'number',
      description: 'Maximum numeric value before `label` is truncated with a "+" suffix',
      table: {
        type: { summary: 'number' },
      },
    },
    position: {
      control: 'select',
      options: [undefined, 'top-right', 'top-left', 'bottom-right', 'bottom-left'],
      description: 'Anchors the badge to a corner via absolute positioning',
      table: {
        type: { summary: 'BadgePosition' },
      },
    },
    children: {
      control: false,
      description: 'Custom content to render inside badge',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Badge>;

/**
 * Count badge displays numerical values, commonly used for notification counts
 */
export const Count: Story = {
  args: {
    variant: 'count',
    label: '99+',
  },
};

/**
 * Dot badge is a small circular indicator, typically used for status or presence
 */
export const Dot: Story = {
  args: {
    variant: 'dot',
    'aria-label': 'Unread notifications',
  },
};

/**
 * Label badge displays text labels, useful for tags or status indicators
 */
export const Label: Story = {
  args: {
    variant: 'label',
    label: 'New',
  },
};

/**
 * Error badge displays an error icon indicator
 */
export const Error: Story = {
  args: {
    variant: 'error',
  },
};

/**
 * All badge variants displayed together for comparison
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Badge variant="count" label="5" />
      <Badge variant="count" label="99+" />
      <Badge variant="dot" />
      <Badge variant="label" label="New" />
      <Badge variant="label" label="Premium" />
      <Badge variant="error" />
    </div>
  ),
};

/**
 * Regression coverage for the 2026-09-07 Figma-fidelity audit: verifies the
 * exact computed pixel values against real Figma metadata (pill height,
 * font-weight, anchor footprints), using the real built stylesheet — this
 * story's `play()` runs against Storybook's actual CSS, unlike the plain
 * unit-test project (see the note in Badge.test.tsx). A prior fix (commit
 * 6057da4) silently regressed the Label font-weight with nothing catching
 * it; these assertions exist so that class of drift fails CI instead.
 */
export const PixelDimensionsMatchFigma: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Badge variant="count" label="99" />
      <Badge variant="label" label="New" />
      <Badge variant="dot" aria-label="dot" />
      <Badge variant="error" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const count = canvas.getByText('99');
    const countCs = getComputedStyle(count);
    expect(count.getBoundingClientRect().height).toBeCloseTo(20, 0);
    expect(countCs.fontWeight).toBe('400');
    expect(countCs.fontSize).toBe('12px');
    expect(countCs.borderRadius).toBe('999px');

    const label = canvas.getByText('New');
    const labelCs = getComputedStyle(label);
    expect(label.getBoundingClientRect().height).toBeCloseTo(20, 0);
    expect(labelCs.fontWeight).toBe('700');
    expect(labelCs.fontSize).toBe('12px');
    expect(labelCs.borderRadius).toBe('999px');

    const dot = canvas.getByLabelText('dot');
    const dotRect = dot.getBoundingClientRect();
    expect(dotRect.width).toBeCloseTo(24, 0);
    expect(dotRect.height).toBeCloseTo(24, 0);
    const dotIndicator = dot.firstElementChild as HTMLElement;
    const dotIndicatorRect = dotIndicator.getBoundingClientRect();
    expect(dotIndicatorRect.width).toBeCloseTo(10, 0);
    expect(dotIndicatorRect.height).toBeCloseTo(10, 0);

    const error = canvas.getByLabelText('Error badge');
    const errorRect = error.getBoundingClientRect();
    expect(errorRect.width).toBeCloseTo(24, 0);
    expect(errorRect.height).toBeCloseTo(24, 0);
  },
};

/**
 * `max` truncates a numeric `label` once it exceeds the threshold, with a
 * "+" suffix — has no effect on non-numeric labels.
 */
export const MaxTruncation: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Badge variant="count" label="42" max={99} />
      <Badge variant="count" label="150" max={99} />
      <Badge variant="label" label="New" max={99} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('42')).toBeInTheDocument();
    expect(canvas.getByText('99+')).toBeInTheDocument();
    expect(canvas.getByText('New')).toBeInTheDocument();
  },
};

/**
 * `position` anchors the badge to a corner via absolute positioning, for
 * overlaying it on an icon/avatar. The wrapper needs its own
 * `position: relative` for this to anchor correctly — Badge does not create
 * that wrapper itself.
 */
export const AnchoredPosition: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '32px' }}>
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: 40,
          height: 40,
          background: '#e5e5e5',
          borderRadius: 8,
        }}
      >
        <Badge variant="dot" position="top-right" aria-label="Online" />
      </div>
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          width: 40,
          height: 40,
          background: '#e5e5e5',
          borderRadius: 8,
        }}
      >
        <Badge variant="count" label="5" position="top-right" />
      </div>
    </div>
  ),
};

/**
 * Badge with custom content using children prop
 */
export const CustomContent: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Badge variant="count">🔥</Badge>
      <Badge variant="label">★ VIP</Badge>
    </div>
  ),
};
