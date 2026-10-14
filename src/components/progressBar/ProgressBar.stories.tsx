import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { useEffect, useState } from 'react';
import { ProgressBar } from './ProgressBar';

const meta = {
  title: 'Components/ProgressBar',
  component: ProgressBar,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          "A determinate progress indicator — shows how far a measurable process has advanced. Use `Spinner` instead when the remaining time/progress can't be measured, and never show both for the same process at once.",
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    value: {
      description: 'Current progress value',
      control: { type: 'range', min: 0, max: 100 },
      table: { type: { summary: 'number' } },
    },
    max: {
      description: 'The value that represents 100% completion',
      control: 'number',
      table: { type: { summary: 'number' }, defaultValue: { summary: '100' } },
    },
    size: {
      description: 'Size of the progress bar',
      control: 'select',
      options: ['small', 'medium', 'large'],
      table: {
        type: { summary: "'small' | 'medium' | 'large'" },
        defaultValue: { summary: "'small'" },
      },
    },
    inverse: {
      description: 'Inverts the track/fill colors for placement on dark surfaces or overlays',
      control: 'boolean',
      table: { type: { summary: 'boolean' }, defaultValue: { summary: 'false' } },
    },
    className: {
      description: 'Additional CSS classes to apply',
      control: 'text',
      table: { type: { summary: 'string' } },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[240px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default small progress bar at 60%. */
export const Default: Story = {
  args: { value: 60, 'aria-label': 'Loading progress' },
};

/** `size="small"` — 4px, for lists/cards with limited display space. */
export const Small: Story = {
  args: { value: 60, size: 'small', 'aria-label': 'Loading progress' },
};

/** `size="medium"` — 6px, for a single form/task-level progress display. */
export const Medium: Story = {
  args: { value: 60, size: 'medium', 'aria-label': 'Loading progress' },
};

/** `size="large"` — 8px, for a full-page display where progress is the primary information. */
export const Large: Story = {
  args: { value: 60, size: 'large', 'aria-label': 'Loading progress' },
};

/** `inverse` swaps the track/fill to light-on-dark colors — use on dark surfaces or scrims. */
export const Inverse: Story = {
  args: { value: 60, size: 'large', inverse: true, 'aria-label': 'Loading progress' },
  decorators: [
    (Story) => (
      <div className="bg-sds-surface-primary p-sds-200 rounded-sds-200 w-[240px]">
        <Story />
      </div>
    ),
  ],
};

/** `value` at the boundaries — 0% and 100%. */
export const Boundaries: Story = {
  args: { value: 0 },
  render: () => (
    <div className="flex flex-col gap-4 w-full">
      <ProgressBar value={0} aria-label="Loading progress, 0%" />
      <ProgressBar value={100} aria-label="Loading progress, complete" />
    </div>
  ),
};

/**
 * A `value` outside `[0, max]` is defensively clamped for rendering (never
 * overflows or goes negative), while still being passed through unclamped
 * to Radix's own validation (which logs a console error for genuinely
 * invalid input — a caller bug worth surfacing, not silently hiding).
 */
export const OutOfRangeValueIsClamped: Story = {
  args: { value: 150, 'aria-label': 'Loading progress' },
};

/**
 * Paired with a right-aligned, fixed-width numeric label — Figma's own
 * placement guideline: "数値の表記は右揃えで固定幅にします" (fixed-width,
 * right-aligned, to avoid layout jitter as the number of digits changes).
 * The label is not a built-in slot — it's composed as a sibling element.
 */
export const WithValueLabel: Story = {
  args: { value: 74 },
  render: () => (
    <div className="flex items-center gap-2 w-full">
      <ProgressBar value={74} className="flex-1" aria-label="Loading progress" />
      <span className="typo-label-s text-sds-text-secondary text-right w-[32px]">74%</span>
    </div>
  ),
};

/** A custom `getValueLabel` overrides the default `"NN%"` accessible text (e.g. for a file-count-based progress). */
export const CustomValueLabel: Story = {
  args: {
    value: 18,
    max: 40,
    getValueLabel: (value: number, max: number) => `${value} of ${max} images`,
    'aria-label': 'Loading images',
  },
};

/**
 * Simulates a live-updating process (e.g. a file upload) — the fill tracks
 * the real measured value directly with only a brief 200ms smoothing
 * transition, never an artificial ease toward an estimated endpoint
 * (Figma's own guidance: "実測から外れると予測が成り立たなくなります").
 */
export const LiveUpdating: Story = {
  args: { value: 0 },
  render: () => {
    const [value, setValue] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setValue((v) => (v >= 100 ? 0 : v + 10)), 400);
      return () => clearInterval(id);
    }, []);
    return <ProgressBar value={value} aria-label="Uploading" />;
  },
};

/** The `className` prop merges with the internal variant classes. */
export const CustomClassName: Story = {
  args: { value: 60, className: 'shadow-sds-level-1', 'aria-label': 'Loading progress' },
};

/**
 * Regression coverage: the accessible value (`role="progressbar"` +
 * `aria-valuenow`/`aria-valuemin`/`aria-valuemax`/`aria-valuetext`) must be
 * present regardless of whether a visible numeric label is also shown —
 * Figma's own accessibility guidance: "バーの見た目だけでは割合が伝わりません"
 * (the visual bar alone doesn't convey the percentage).
 *
 * Also regression coverage for a real bug caught by this repo's own
 * addon-a11y gate while writing this story: `aria-valuetext` describes the
 * *value*, not the widget's *name* — axe correctly flags a bare
 * `role="progressbar"` with no `aria-label`/`aria-labelledby` as failing
 * `aria-progressbar-name`. `aria-label` (or `aria-labelledby`) is therefore
 * a required part of real usage, not optional — see
 * docs/components/progressBar.md §9.
 */
export const InteractionHasAccessibleValue: Story = {
  args: { value: 42, 'aria-label': 'Uploading file' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bar = canvas.getByRole('progressbar', { name: 'Uploading file' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuenow', '42');
    expect(bar).toHaveAttribute('aria-valuetext', '42%');
  },
};
