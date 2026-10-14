import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import * as Icons from './index';

const meta = {
  title: 'Foundation/Icons',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The full icon set — every icon is a `forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>` wrapper around a 24x24 outline `<path fill="currentColor">`, `aria-hidden="true"` by default. Pass `aria-label`/`role="img"` to make one accessible when it is the sole content of a control; leave the default when paired with visible text.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const entries = Object.entries(Icons).sort(([a], [b]) => a.localeCompare(b));

/** Every exported icon rendered together, confirming each mounts a real `<svg>` with path data — not a blank/broken glyph. */
export const Gallery: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-4">
      {entries.map(([name, IconComponent]) => (
        <div
          key={name}
          className="flex flex-col items-center gap-2 rounded-sds-200 border border-sds-border-weak p-4"
        >
          <IconComponent className="text-sds-icon-primary" width={24} height={24} />
          <span className="typo-body-s text-sds-text-secondary text-center">
            {name.replace(/^Icon/, '')}
          </span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Sanity check: every icon in the module actually rendered a real <svg>
    // with path data — not a blank/broken glyph.
    const svgs = canvasElement.querySelectorAll('svg');
    expect(svgs.length).toBe(entries.length);
    for (const svg of svgs) {
      expect(svg.querySelector('path')).not.toBeNull();
    }
    expect(canvas.getByText('Home')).toBeInTheDocument();
    expect(canvas.getByText('Bell')).toBeInTheDocument();
  },
};

/** Every icon paints via `fill="currentColor"`, so it visually inherits whatever text color surrounds it. */
export const CurrentColorInheritance: Story = {
  name: 'Inherits text color (currentColor)',
  render: () => (
    <div className="flex gap-4 items-center text-sds-text-danger">
      <Icons.IconExclamationCircle width={24} height={24} />
      <span className="typo-body-l">This icon inherits the surrounding text color</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg') as SVGSVGElement;
    const path = svg.querySelector('path') as SVGPathElement;
    // Real resolved-color check (not just asserting the `currentColor`
    // keyword is present) — the path's painted fill must match the
    // surrounding text-danger color, proving inheritance actually resolves.
    const wrapperColor = getComputedStyle(svg.parentElement as Element).color;
    expect(wrapperColor).toMatch(/^rgb/);
    expect(getComputedStyle(path).fill).toBe(wrapperColor);
  },
};
