import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Link } from './Link';
import { IconExternalLink } from '../icons';

const meta = {
  title: 'Components/Link',
  component: Link,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A standalone text link for page transitions or navigation to an external site — not for executing an action or opening/closing a dialog (use `Button` for those). The underline is always shown and never changes color on hover — only its thickness (1px → 2px) — so link state is never identifiable by color alone.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Size of the link, driving its typography scale',
      control: 'select',
      options: ['large', 'medium', 'small'],
      table: {
        type: { summary: "'large' | 'medium' | 'small'" },
        defaultValue: { summary: "'large'" },
      },
    },
    disabled: {
      description:
        'Renders as non-interactive text (a <span>) instead of a real anchor — not a disabled <a>',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    href: {
      description: 'The link destination',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    startAdornment: {
      description: 'Icon or element displayed before the label',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    endAdornment: {
      description: 'Icon or element displayed after the label — commonly IconExternalLink',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default large link, underline always visible. */
export const Default: Story = {
  args: {
    href: '/settings',
    children: 'リンクテキスト',
  },
};

/** `size="large"` — 16px, the default. */
export const Large: Story = {
  args: {
    href: '/settings',
    size: 'large',
    children: 'リンクテキスト',
  },
};

/** `size="medium"` — 14px. */
export const Medium: Story = {
  args: {
    href: '/settings',
    size: 'medium',
    children: 'リンクテキスト',
  },
};

/** `size="small"` — 12px. */
export const Small: Story = {
  args: {
    href: '/settings',
    size: 'small',
    children: 'リンクテキスト',
  },
};

/** `disabled` renders non-interactive text — not a disabled `<a>` — per Figma's own accessibility guidance. */
export const Disabled: Story = {
  args: {
    href: '/settings',
    disabled: true,
    children: 'リンクテキスト',
  },
};

/** `startAdornment` for indicating navigation direction/target. */
export const WithStartAdornment: Story = {
  args: {
    href: '/settings',
    startAdornment: <IconExternalLink width={18} height={18} />,
    children: 'リンクテキスト',
  },
};

/**
 * `endAdornment` with `IconExternalLink` — Figma's own recommended pattern
 * for links leaving the current site ("外部サイトへの導線（Suffix に
 * Icon / External Link）").
 */
export const WithEndAdornment: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    endAdornment: <IconExternalLink width={18} height={18} />,
    children: '外部サイトへ移動',
  },
};

/** A long label stays on one line (`whitespace-nowrap`, matching Figma) rather than wrapping. */
export const LongContent: Story = {
  render: (args) => (
    <div style={{ maxWidth: 200, border: '1px dashed #ccc', padding: 8 }}>
      <Link {...args}>これは非常に長いリンクテキストで、コンテナの幅を超えてもラップしません</Link>
    </div>
  ),
  args: {
    href: '/settings',
  },
};

/** The `className` prop merges with the internal variant classes. */
export const CustomClassName: Story = {
  args: {
    href: '/settings',
    className: 'italic',
    children: 'リンクテキスト',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates merging a consumer `className` (here, `italic`) with the internal styling.',
      },
    },
  },
};

/**
 * Regression coverage for the underline-thickness-only hover change
 * (Figma's own component description: "下線は常時表示。ホバーで1pxから2pxに
 * 太くなる" — underline always shown; on hover, thickens from 1px to 2px).
 * The link text color must NOT change on hover — state changes must be
 * identifiable by means other than color alone
 * (`.claude/rules/accessibility.md` §4.3).
 */
export const InteractionHoverThickensUnderline: Story = {
  args: {
    href: '/settings',
    children: 'リンクテキスト',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'リンクテキスト' });
    const win = canvasElement.ownerDocument.defaultView!;

    const restCs = win.getComputedStyle(link);
    expect(restCs.textDecorationThickness).toBe('1px');

    // `userEvent.hover()` dispatches synthetic pointer events without moving
    // the real OS cursor, so it does not reliably activate a plain CSS
    // `:hover` pseudo-class (documented precedent: Scrollbar's own hover
    // mechanism had to move off `:hover` entirely for this reason) — the
    // actual thickness-on-hover behavior is verified via a neutral,
    // non-Storybook browser with a real cursor move instead, not
    // re-asserted here as a false-confidence `getComputedStyle` check after
    // a hover that may not have genuinely engaged. What CAN be verified in
    // this environment is that the mechanism is wired up correctly at all —
    // the class list carries the real hover utility, and NOT a color-based
    // one (the whole point of this component's design: state must not be
    // color-only).
    expect(link.className).toContain('hover:decoration-2');
    expect(link.className).not.toMatch(/hover:text-/);
  },
};

/** Real keyboard `Tab` produces the correct focus ring: 2px, `border-focus`, 3px offset (text-element spec), 2px corner radius. */
export const InteractionFocusRing: Story = {
  args: {
    href: '/settings',
    children: 'リンクテキスト',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'リンクテキスト' });

    await userEvent.tab();
    await waitFor(() => expect(link).toHaveFocus());
    expect(link.matches(':focus-visible')).toBe(true);

    const cs = getComputedStyle(link);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineOffset).toBe('3px');
  },
};

/** A disabled link is not focusable at all — real keyboard `Tab` skips over it entirely. */
export const InteractionDisabledSkipsFocus: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Link href="/before">Before</Link>
      <Link href="/settings" disabled>
        Disabled
      </Link>
      <Link href="/after">After</Link>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const before = canvas.getByRole('link', { name: 'Before' });
    const after = canvas.getByRole('link', { name: 'After' });

    expect(canvas.queryByRole('link', { name: 'Disabled' })).not.toBeInTheDocument();

    before.focus();
    expect(before).toHaveFocus();
    await userEvent.tab();
    expect(after).toHaveFocus();
  },
};

/**
 * RR-01 (2026-09-29): `asChild` styles a router link's own anchor (React
 * Router `NavLink`, Next.js `Link`) instead of nesting a second `<a>`. The
 * stand-in `<a data-router>` below plays the router link's role.
 */
export const AsChildRouterLink: Story = {
  render: () => (
    <Link asChild endAdornment={<IconExternalLink />}>
      <a href="#router-target" data-router="true">
        Router link
      </a>
    </Link>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Router link' });
    expect(canvasElement.querySelectorAll('a')).toHaveLength(1);
    expect(link).toHaveAttribute('data-router', 'true');
    expect(link.querySelector('svg')).not.toBeNull();
  },
};
