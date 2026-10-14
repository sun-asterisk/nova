import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A visual separator, horizontal or vertical. Renders with no built-in margin — Figma varies the gap around a divider by context (dense list items, card padding, page sections), so spacing is left entirely to the consumer’s own layout. Never renders `children` — it is a pure separator.',
      },
    },
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Orientation of the divider',
      table: {
        type: { summary: 'DividerOrientation' },
        defaultValue: { summary: 'horizontal' },
      },
    },
    flexItem: {
      control: 'boolean',
      description: 'If true, the divider will stretch to fill its container when vertical',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Divider>;

/**
 * Default horizontal divider separating content vertically
 */
export const Horizontal: Story = {
  render: (args) => (
    <div style={{ width: '300px' }}>
      <p style={{ margin: '8px 0' }}>Content above</p>
      <Divider {...args} />
      <p style={{ margin: '8px 0' }}>Content below</p>
    </div>
  ),
  args: {
    orientation: 'horizontal',
  },
};

/**
 * Vertical divider separating content horizontally in a flex layout
 */
export const Vertical: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', height: '80px', gap: '8px' }}>
      <span>Left content</span>
      <Divider {...args} />
      <span>Right content</span>
    </div>
  ),
  args: {
    orientation: 'vertical',
    flexItem: true,
  },
};

/**
 * Vertical divider without flexItem - fixed height
 */
export const VerticalFixedHeight: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span>Left</span>
      <div style={{ height: '50px' }}>
        <Divider {...args} />
      </div>
      <span>Right</span>
    </div>
  ),
  args: {
    orientation: 'vertical',
    flexItem: false,
  },
};

/**
 * Multiple sections separated by dividers
 */
export const MultipleSections: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <section style={{ padding: '16px 0' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Section 1</h3>
        <p style={{ margin: 0 }}>This is the first section content.</p>
      </section>
      <Divider />
      <section style={{ padding: '16px 0' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Section 2</h3>
        <p style={{ margin: 0 }}>This is the second section content.</p>
      </section>
      <Divider />
      <section style={{ padding: '16px 0' }}>
        <h3 style={{ margin: '0 0 8px 0' }}>Section 3</h3>
        <p style={{ margin: 0 }}>This is the third section content.</p>
      </section>
    </div>
  ),
};

/**
 * Regression coverage for the 2026-09-07 Figma-fidelity audit: Divider
 * previously rendered as a 2px-thick line (unconditional `border` on all 4
 * sides conflicting with a `border-none` in the same string — tailwind-merge
 * drops the `border-none`, same class of bug documented in
 * Checkbox.styles.ts for `outline`) instead of Figma's literal 1px stroke.
 * Also confirms no built-in margin remains (Figma's own real usage varies
 * the gap by context: 8/16/32px — margin is the consumer's responsibility).
 */
export const PixelDimensionsMatchFigma: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Divider data-testid="divider-h" />
      <div style={{ display: 'flex', height: '40px' }}>
        <Divider data-testid="divider-v" orientation="vertical" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const horizontal = canvas.getByTestId('divider-h');
    const hCs = getComputedStyle(horizontal);
    expect(horizontal.getBoundingClientRect().height).toBeCloseTo(1, 0);
    expect(hCs.borderTopWidth).toBe('1px');
    expect(hCs.borderBottomWidth).toBe('0px');
    expect(hCs.borderLeftWidth).toBe('0px');
    expect(hCs.borderRightWidth).toBe('0px');
    expect(hCs.marginTop).toBe('0px');
    expect(hCs.marginBottom).toBe('0px');

    const vertical = canvas.getByTestId('divider-v');
    const vCs = getComputedStyle(vertical);
    expect(vertical.getBoundingClientRect().width).toBeCloseTo(1, 0);
    expect(vCs.borderLeftWidth).toBe('1px');
    expect(vCs.borderRightWidth).toBe('0px');
    expect(vCs.borderTopWidth).toBe('0px');
    expect(vCs.borderBottomWidth).toBe('0px');
    expect(vCs.marginLeft).toBe('0px');
    expect(vCs.marginRight).toBe('0px');
  },
};

/**
 * Vertical dividers in a navigation bar
 */
export const NavigationBar: Story = {
  render: () => (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px',
        height: '48px',
      }}
      className="bg-sds-background-container"
    >
      <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
        Home
      </a>
      <Divider orientation="vertical" flexItem />
      <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
        About
      </a>
      <Divider orientation="vertical" flexItem />
      <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
        Contact
      </a>
    </nav>
  ),
};
