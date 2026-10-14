import type { Meta, StoryObj } from '@storybook/react';
import { fn, expect, userEvent, within } from 'storybook/test';
import { MdAdd, MdArrowForward, MdDelete, MdFavorite, MdSearch } from 'react-icons/md';
import { Button } from './Button';
import { tokenColor } from '../../../.storybook/tokenColor';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible button component with multiple variants, sizes, and support for icons. Built with accessibility and modern design principles in mind.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'Visual style variant of the button that determines its appearance and purpose',
      control: 'select',
      options: ['primary', 'secondary', 'emphasis', 'plain', 'danger'],
      table: {
        type: { summary: 'ButtonVariant' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      description: 'Size of the button affecting padding, font size, and overall dimensions',
      control: 'select',
      options: ['small', 'medium', 'large'],
      table: {
        type: { summary: 'ButtonSize' },
        defaultValue: { summary: 'small' },
      },
    },
    children: {
      description:
        'Content to be displayed inside the button. Can include text, icons, or other React elements',
      table: {
        type: { summary: 'ReactNode' },
      },
    },
    iconOnly: {
      description:
        'Figma "Icon Button": square (32/40/48px), no label min-width. Needs aria-label (or aria-labelledby / title)',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      description: 'Whether the button is disabled and cannot be interacted with',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      description: 'Callback function fired when the button is clicked',
      table: {
        type: { summary: '(event: MouseEvent<HTMLButtonElement>) => void' },
      },
    },
    onFocus: {
      description: 'Callback function fired when the button receives focus',
      table: {
        type: { summary: '(event: FocusEvent<HTMLButtonElement>) => void' },
      },
    },
    onBlur: {
      description: 'Callback function fired when the button loses focus',
      table: {
        type: { summary: '(event: FocusEvent<HTMLButtonElement>) => void' },
      },
    },
    type: {
      description: 'HTML button type attribute (button, submit, reset)',
      control: 'select',
      options: ['button', 'submit', 'reset'],
      table: {
        type: { summary: 'button | submit | reset' },
        defaultValue: { summary: 'button' },
      },
    },
    className: {
      description: 'Additional CSS classes to apply to the button',
      table: {
        type: { summary: 'string' },
      },
    },
  },
  args: { onClick: () => alert('Button clicked!') },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'The primary button variant used for main actions and calls-to-action.',
      },
    },
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'The secondary button variant used for less prominent actions.',
      },
    },
  },
};

export const Emphasis: Story = {
  args: {
    children: 'Emphasis Button',
    variant: 'emphasis',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'The emphasis button variant used to highlight important actions.',
      },
    },
  },
};

export const Plain: Story = {
  args: {
    children: 'Plain Button',
    variant: 'plain',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'The plain button variant with minimal styling for subtle actions.',
      },
    },
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'The danger button variant used for destructive actions like delete or remove.',
      },
    },
  },
};

export const WithStartIcon: Story = {
  args: {
    children: (
      <>
        <MdAdd />
        Add Item
      </>
    ),
    variant: 'primary',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with an icon at the beginning to indicate the action type.',
      },
    },
  },
};

export const WithEndIcon: Story = {
  args: {
    children: (
      <>
        Next
        <MdArrowForward />
      </>
    ),
    variant: 'primary',
    size: 'medium',
  },
  parameters: {
    docs: {
      description: {
        story: 'Button with an icon at the end, commonly used for navigation actions.',
      },
    },
  },
};

export const IconOnly: Story = {
  args: {
    children: <MdAdd />,
    iconOnly: true,
    variant: 'primary',
    size: 'medium',
    'aria-label': 'Add',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Figma "Icon Button": `iconOnly` renders a square button for a single icon. Give it an accessible name with `aria-label`.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    variant: 'primary',
    size: 'medium',
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Button in disabled state, preventing user interaction.',
      },
    },
  },
};

export const ButtonSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button variant="primary" size="small">
        Small
      </Button>
      <Button variant="primary" size="medium">
        Medium
      </Button>
      <Button variant="primary" size="large">
        Large
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of all available button sizes.',
      },
    },
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <Button variant="primary" size="medium">
          Primary
        </Button>
        <Button variant="secondary" size="medium">
          Secondary
        </Button>
        <Button variant="emphasis" size="medium">
          Emphasis
        </Button>
        <Button variant="plain" size="medium">
          Plain
        </Button>
        <Button variant="danger" size="medium">
          Danger
        </Button>
      </div>
      <div className="flex gap-4">
        <Button variant="primary" size="medium" disabled>
          Primary
        </Button>
        <Button variant="secondary" size="medium" disabled>
          Secondary
        </Button>
        <Button variant="emphasis" size="medium" disabled>
          Emphasis
        </Button>
        <Button variant="plain" size="medium" disabled>
          Plain
        </Button>
        <Button variant="danger" size="medium" disabled>
          Danger
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all button variants in both enabled and disabled states.',
      },
    },
  },
};

export const IconButtons: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button iconOnly variant="primary" size="medium" aria-label="Add">
        <MdAdd />
      </Button>
      <Button iconOnly variant="secondary" size="medium" aria-label="Search">
        <MdSearch />
      </Button>
      <Button iconOnly variant="emphasis" size="medium" aria-label="Favorite">
        <MdFavorite />
      </Button>
      <Button iconOnly variant="danger" size="medium" aria-label="Delete">
        <MdDelete />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Collection of icon-only buttons with different variants.',
      },
    },
  },
};

export const InteractionClick: Story = {
  args: {
    children: 'Click me',
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click me' });

    await userEvent.click(button);
    expect(args.onClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveFocus();

    await userEvent.keyboard('{Enter}');
    expect(args.onClick).toHaveBeenCalledTimes(2);

    // §17 item 2: every documented keyboard interaction gets exercised —
    // accessibility.md §3.2's Button row requires both Enter AND Space.
    await userEvent.keyboard(' ');
    expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

// §17 item 3: focus-visible ring assertions use real Tab + getComputedStyle,
// never a screenshot or source read alone — this session found the same
// tailwind-merge `outline-none` + bare `outline`/`outline-2` collision
// (which silently kills the ring) repeatedly across other components
// (Checkbox, RadioGroup, DropdownMenu, Snackbar, DatePicker, Scrollbar).
// Button.styles.ts has no unconditional `outline-none`, so this is expected
// to pass, but the whole point of this rule is not to trust that
// expectation without a real, computed-style regression test backing it.
export const InteractionFocusRing: Story = {
  args: {
    children: 'Focus me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Focus me' });

    await userEvent.tab();
    expect(button).toHaveFocus();
    expect(button.matches(':focus-visible')).toBe(true);

    const win = canvasElement.ownerDocument.defaultView!;
    const cs = win.getComputedStyle(button);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineOffset).toBe('2px');
  },
};

// Figma "Icon Button" (3700:7301) is square at every size; also checks the
// accessible name and that the shared focus ring still applies.
export const InteractionIconOnlySquare: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button iconOnly size="small" aria-label="Add small">
        <MdAdd />
      </Button>
      <Button iconOnly size="medium" aria-label="Add medium">
        <MdAdd />
      </Button>
      <Button iconOnly size="large" aria-label="Add large">
        <MdAdd />
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [size, px] of [
      ['small', 32],
      ['medium', 40],
      ['large', 48],
    ] as const) {
      const button = canvas.getByRole('button', { name: `Add ${size}` });
      const r = button.getBoundingClientRect();
      expect([r.width, r.height]).toEqual([px, px]);
    }

    await userEvent.tab();
    const first = canvas.getByRole('button', { name: 'Add small' });
    expect(first).toHaveFocus();
    const cs = canvasElement.ownerDocument.defaultView!.getComputedStyle(first);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
  },
};

// Dark-mode token wiring (2026-10-05). Two explicit theme regions side by
// side, so this holds in both the light and the `storybook-dark` project:
// every variant must render exactly its Figma token (background / border /
// text) as resolved inside its own region — never a hardcoded value — with
// text contrast ≥ 4.5:1, and light and dark must actually differ. Disabled
// is excluded from the contrast rule (WCAG 1.4.3 exempts it).
const DARK_THEME_VARIANTS = {
  primary: { bg: '--color-sds-surface-primary', border: null, text: '--color-sds-text-on-surface' },
  secondary: {
    bg: '--color-sds-surface-base',
    border: '--color-sds-border-strong',
    text: '--color-sds-text-primary',
  },
  emphasis: {
    bg: '--color-sds-surface-emphasis',
    border: null,
    text: '--color-sds-text-on-surface',
  },
  plain: { bg: null, border: null, text: '--color-sds-text-primary' },
  danger: {
    bg: '--color-sds-surface-base',
    border: '--color-sds-border-danger',
    text: '--color-sds-text-danger',
  },
} as const;

function contrastRatio(a: string, b: string) {
  const lum = (c: string) => {
    const [r, g, bl] = (c.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
    const lin = (v: number) => {
      const x = v / 255;
      return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl);
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export const InteractionDarkTheme: Story = {
  render: () => (
    <div className="flex gap-4">
      {(['light', 'dark'] as const).map((theme) => (
        <div
          key={theme}
          data-theme={theme}
          data-testid={`region-${theme}`}
          className="flex flex-col gap-2 p-sds-200 bg-sds-background-base"
        >
          {(Object.keys(DARK_THEME_VARIANTS) as (keyof typeof DARK_THEME_VARIANTS)[]).map((v) => (
            <Button key={v} variant={v} size="medium">
              {`${v} ${theme}`}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const seen: Record<string, string> = {};
    for (const theme of ['light', 'dark'] as const) {
      const region = canvas.getByTestId(`region-${theme}`);
      const pageBg = getComputedStyle(region).backgroundColor;
      for (const [variant, t] of Object.entries(DARK_THEME_VARIANTS)) {
        const button = within(region).getByRole('button', { name: `${variant} ${theme}` });
        const cs = getComputedStyle(button);
        expect(cs.backgroundColor).toBe(t.bg ? tokenColor(button, t.bg) : 'rgba(0, 0, 0, 0)');
        if (t.border) expect(cs.borderTopColor).toBe(tokenColor(button, t.border));
        expect(cs.color).toBe(tokenColor(button, t.text));
        const effectiveBg = t.bg ? cs.backgroundColor : pageBg;
        expect(contrastRatio(cs.color, effectiveBg)).toBeGreaterThanOrEqual(4.5);
        seen[`${variant}|${theme}`] = `${cs.backgroundColor}/${cs.color}`;
      }
    }
    for (const variant of Object.keys(DARK_THEME_VARIANTS)) {
      expect(seen[`${variant}|dark`]).not.toBe(seen[`${variant}|light`]);
    }
  },
};

export const InteractionDisabledBlocksClick: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    onClick: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled' });

    expect(button).toBeDisabled();

    await userEvent.click(button, { pointerEventsCheck: 0 });
    expect(args.onClick).not.toHaveBeenCalled();
  },
};
