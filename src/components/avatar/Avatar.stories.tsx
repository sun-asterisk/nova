import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Avatar } from './Avatar';
import { IconExclamationCircle } from '../icons';
import { tokenColor } from '../../../.storybook/tokenColor';

const PHOTO_URL =
  'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=128&h=128&fit=crop&crop=faces';
const BROKEN_URL = 'https://example.com/does-not-exist.jpg';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
    // Known, accepted WCAG 1.4.3 failure (team decision 2026-10-07, follow
    // Figma): the initials use Figma's Text/On Surface (white) on
    // Surface/Secondary — 1.88:1 light / 1.71:1 dark. axe's color-contrast
    // rule skips ONLY the fallback (initials/icon) element; every other
    // element in these stories is still checked. See Avatar.styles.ts.
    a11y: {
      config: {
        rules: [{ id: 'color-contrast', selector: '*:not([data-slot="avatar-fallback"])' }],
      },
    },
    docs: {
      description: {
        component:
          'A circular display element for identifying a user or organization — photo, initials, or a generic icon, in that priority order. Not interactive by itself (wrap it in a `Button`/`Link` if it needs to be clickable). Always circular — never a rounded rectangle or ellipse.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      description: 'Size of the avatar',
      control: 'select',
      options: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
      table: {
        type: { summary: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'" },
        defaultValue: { summary: "'medium'" },
      },
    },
    src: {
      description: 'Image URL — takes priority over initial/icon when it loads successfully',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    alt: {
      description: 'Accessible name for the image — provide this whenever src is set',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    initial: {
      description: 'Fallback initials (1-2 characters), shown when src is absent or fails to load',
      control: 'text',
      table: {
        type: { summary: 'string' },
      },
    },
    icon: {
      description: 'Fallback icon, shown when neither src nor initial resolve to content',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    ring: {
      description:
        'Adds a 2px, page-background-colored outer ring, for stacked/overlapping avatars',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    status: {
      description: 'Presence-status dot, overlaid bottom-right. Not shown at size="xsmall"',
      control: 'select',
      options: [undefined, 'online', 'away', 'busy', 'offline'],
      table: {
        type: { summary: "'online' | 'away' | 'busy' | 'offline'" },
      },
    },
    statusLabel: {
      description:
        'Accessible (visually-hidden) text naming the status — defaults to the capitalized status value',
      control: 'text',
      table: {
        type: { summary: 'string' },
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
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default medium avatar showing a photo. */
export const Default: Story = {
  args: {
    src: PHOTO_URL,
    alt: '佐藤 花子',
  },
};

/** `size="xsmall"` — 24px. Does not support `status`. */
export const XSmall: Story = {
  args: { size: 'xsmall', initial: 'A' },
};

/** `size="small"` — 32px. */
export const Small: Story = {
  args: { size: 'small', initial: 'A' },
};

/** `size="medium"` — 40px, the default. */
export const Medium: Story = {
  args: { size: 'medium', initial: 'A' },
};

/** `size="large"` — 56px. */
export const Large: Story = {
  args: { size: 'large', initial: 'A' },
};

/** `size="xlarge"` — 80px. */
export const XLarge: Story = {
  args: { size: 'xlarge', initial: 'A' },
};

/** Initials fallback, shown when no `src` is provided. */
export const WithInitial: Story = {
  args: { initial: '鈴' },
};

/** The generic `IconUser` fallback, shown when neither `src` nor `initial` are provided. */
export const WithDefaultIcon: Story = {
  args: {},
};

/** A custom icon fallback, for representing something other than a person (e.g. a team or a bot). */
export const WithCustomIcon: Story = {
  args: { icon: <IconExclamationCircle /> },
};

/**
 * When `src` points to an image that fails to load, the fallback (initial,
 * then icon) is shown instead — Figma's own priority chain: photo → initial
 * → generic icon.
 */
export const BrokenImageFallsBackToInitial: Story = {
  args: { src: BROKEN_URL, alt: 'Broken image', initial: 'B' },
};

/** `ring` adds a 2px background-colored outer ring — for visually separating stacked/overlapping avatars. */
export const WithRing: Story = {
  args: { src: PHOTO_URL, alt: '佐藤 花子', ring: true },
  parameters: {
    docs: {
      description: {
        story:
          'A single avatar with `ring` enabled. See `InteractionStackedGroup` for the real stacked-avatars use case this exists for.',
      },
    },
  },
};

/** A realistic stacked-avatar group, using `ring` and a negative-margin overlap — matches Figma\'s own "重ねて並べる" (overlapping arrangement) guideline. */
export const StackedGroup: Story = {
  render: () => (
    <div className="flex -space-x-2">
      <Avatar ring size="medium" initial="A" />
      <Avatar ring size="medium" initial="B" />
      <Avatar ring size="medium" initial="C" />
      <Avatar ring size="medium" initial="D" />
    </div>
  ),
};

/** Each presence-status value. */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex gap-4">
      <Avatar size="large" initial="A" status="online" />
      <Avatar size="large" initial="A" status="away" />
      <Avatar size="large" initial="A" status="busy" />
      <Avatar size="large" initial="A" status="offline" />
    </div>
  ),
};

/** Paired with adjacent name text — Figma's own recommended pattern for providing identification information (not decoration). */
export const WithName: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Avatar size="medium" src={PHOTO_URL} alt="鈴木 一郎" />
      <span className="typo-body-m text-sds-text-primary">鈴木 一郎</span>
    </div>
  ),
};

/** The `className` prop merges with the internal variant classes. */
export const CustomClassName: Story = {
  args: { initial: 'A', className: 'shadow-sds-level-2' },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates merging a consumer `className` (here, a shadow) with the internal styling.',
      },
    },
  },
};

/**
 * Regression coverage: the status dot must never rely on color alone —
 * `statusLabel` (or its built-in capitalized default) provides a real,
 * queryable accessible name for the status.
 */
export const InteractionStatusHasAccessibleLabel: Story = {
  args: { initial: 'A', status: 'busy' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The default label is used since `statusLabel` wasn't provided.
    expect(canvas.getByText('Busy')).toBeInTheDocument();
  },
};

/**
 * Real keyboard `Tab` produces the correct focus ring (2px, `border-focus`,
 * 3px offset — confirmed via Figma's own component, see Avatar.styles.ts)
 * when a consumer makes the avatar focusable (e.g. `tabIndex={0}`, or by
 * wrapping it in a real button/link in practice).
 */
export const InteractionFocusRing: Story = {
  args: { initial: 'A', tabIndex: 0 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const avatar = canvas.getByText('A').closest('[tabindex]') as HTMLElement;

    await userEvent.tab();
    await waitFor(() => expect(avatar).toHaveFocus());
    expect(avatar.matches(':focus-visible')).toBe(true);

    const cs = getComputedStyle(avatar);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineOffset).toBe('3px');
  },
};

/**
 * Figma Avatar (16593:8749, re-checked 2026-10-07): initials use
 * Text/On Surface and the fallback icon Icon/Secondary, on Surface/Secondary,
 * in both themes. (SC-05 had switched the initials to text-primary for
 * contrast; the team chose to follow Figma — see Avatar.styles.ts.)
 */
export const InteractionFigmaFallbackColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      {(['light', 'dark'] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          data-testid={`theme-${theme}`}
          className="bg-sds-background-base"
          style={{ display: 'flex', gap: 8, padding: 8 }}
        >
          <Avatar initial="鈴" />
          <Avatar data-testid={`icon-${theme}`} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fills: string[] = [];
    for (const theme of ['light', 'dark'] as const) {
      const region = canvas.getByTestId(`theme-${theme}`);
      const initial = within(region).getByText('鈴');
      const root = initial.parentElement as HTMLElement;
      fills.push(getComputedStyle(root).backgroundColor);
      await expect(getComputedStyle(root).backgroundColor).toBe(
        tokenColor(root, '--color-sds-surface-secondary'),
      );
      await expect(getComputedStyle(initial).color).toBe(
        tokenColor(root, '--color-sds-text-on-surface'),
      );
      const icon = canvas.getByTestId(`icon-${theme}`).querySelector('svg')!;
      await expect(getComputedStyle(icon).color).toBe(
        tokenColor(root, '--color-sds-icon-secondary'),
      );
    }
    // Proves the dark region really resolved dark tokens (not light twice).
    await expect(fills[0]).not.toBe(fills[1]);
  },
};

/**
 * NX-05 regression (2026-09-29): initials-only and icon-only avatars can be
 * named. Named avatars render as one `role="img"` graphic — the story-level
 * axe gate (`a11y.test: 'error'`) fails on `aria-prohibited-attr` if the
 * name ever lands on a role-less element again.
 */
export const NamedWithoutPhoto: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Avatar initial="鈴" alt="Suzuki Taro" status="online" />
      <Avatar aria-label="Unknown user" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('img', { name: 'Suzuki Taro, Online' })).toBeInTheDocument();
    expect(canvas.getByRole('img', { name: 'Unknown user' })).toBeInTheDocument();
  },
};
