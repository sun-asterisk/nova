import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, waitFor } from 'storybook/test';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { useState } from 'react';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A Radix-based tooltip that appears on hover or keyboard focus of its trigger, and dismisses on `Escape`. Composed from `TooltipProvider` (shared delay context), `Tooltip` (root, controlled via `open`/`onOpenChange` or uncontrolled via `defaultOpen`), `TooltipTrigger`, and `TooltipContent` (positioned via `side`/`align`).',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      description: 'Controlled open state of the tooltip',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        category: 'State',
      },
    },
    defaultOpen: {
      description: 'Default open state in uncontrolled mode',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    onOpenChange: {
      description: 'Callback fired when open state changes',
      table: {
        type: { summary: '(open: boolean) => void' },
        category: 'Events',
      },
    },
    delayDuration: {
      description: 'Delay in milliseconds before showing tooltip',
      control: { type: 'number', min: 0, max: 2000, step: 100 },
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '500' },
        category: 'Timing',
      },
    },
  },
  // Tooltip.Root requires a TooltipProvider ancestor (Radix throws without
  // one) — real apps mount exactly one TooltipProvider near the root; this
  // decorator plays that role for every story in this file.
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div style={{ padding: '100px', minHeight: '300px' }}>
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Interactive playground to test all tooltip options.
 * Use the controls panel to adjust positioning, timing, and content.
 */
export const Playground: Story = {
  args: {
    defaultOpen: false,
  },
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger>
        <Button variant="primary" size="medium">
          Hover or Focus
        </Button>
      </TooltipTrigger>
      <TooltipContent>This is a customizable tooltip</TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Experiment with tooltip behavior using the controls below.',
      },
    },
  },
};

/**
 * Basic tooltip positioned at the top of the trigger element.
 * This is the most common placement for tooltips.
 */
export const Top: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">ラベル</Button>
      </TooltipTrigger>
      <TooltipContent side="top">トップに表示されるツールチップ</TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip displayed above the trigger element. Default behavior with 500ms delay.',
      },
    },
  },
};

/**
 * Tooltip positioned below the trigger element.
 * Useful when there's limited space above.
 */
export const Bottom: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">ラベル</Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">ボトムに表示されるツールチップ</TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip displayed below the trigger element. Useful when space above is limited.',
      },
    },
  },
};

/**
 * Tooltip positioned to the left of the trigger element.
 */
export const Left: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">ラベル</Button>
      </TooltipTrigger>
      <TooltipContent side="left">左側に表示されるツールチップ</TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip displayed to the left of the trigger element.',
      },
    },
  },
};

/**
 * Tooltip positioned to the right of the trigger element.
 */
export const Right: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">ラベル</Button>
      </TooltipTrigger>
      <TooltipContent side="right">右側に表示されるツールチップ</TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltip displayed to the right of the trigger element.',
      },
    },
  },
};

/**
 * Comprehensive demonstration of all 4 tooltip positions.
 * Shows Top, Bottom, Left, and Right placements.
 */
export const AllPlacements: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-8">
      {/* Top */}
      <div className="col-span-3 flex justify-center">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="secondary">Top</Button>
          </TooltipTrigger>
          <TooltipContent side="top">トップに表示されるツールチップ</TooltipContent>
        </Tooltip>
      </div>

      {/* Left */}
      <div className="flex items-center justify-end">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="secondary">Left</Button>
          </TooltipTrigger>
          <TooltipContent side="left">左側に表示されるツールチップ</TooltipContent>
        </Tooltip>
      </div>

      {/* Center */}
      <div className="flex items-center justify-center">
        <div className="rounded-lg border-2 border-dashed border-sds-border-basic p-8">
          <span className="text-sds-text-secondary">Trigger Area</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-start">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="secondary">Right</Button>
          </TooltipTrigger>
          <TooltipContent side="right">右側に表示されるツールチップ</TooltipContent>
        </Tooltip>
      </div>

      {/* Bottom */}
      <div className="col-span-3 flex justify-center">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="secondary">Bottom</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">ボトムに表示されるツールチップ</TooltipContent>
        </Tooltip>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Demonstration of all 4 available tooltip positions: Top, Bottom, Left, and Right.',
      },
    },
  },
};

/**
 * Tooltips commonly used with icon buttons to provide additional context.
 * Icons alone may not be self-explanatory, making tooltips essential for usability.
 */
export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-4">
      <Tooltip>
        <TooltipTrigger>
          <Button variant="secondary" className="h-8! w-8! min-w-0! rounded-sds-full! p-0!">
            ?
          </Button>
        </TooltipTrigger>
        <TooltipContent>ヘルプ情報が表示されます</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <Button variant="primary" className="h-8! w-8! min-w-0! rounded-sds-full! p-0!">
            i
          </Button>
        </TooltipTrigger>
        <TooltipContent>情報アイコン</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <Button variant="secondary" className="h-8! w-8! min-w-0! rounded-sds-full! p-0!">
            ⚙
          </Button>
        </TooltipTrigger>
        <TooltipContent>設定</TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips used with icon buttons to provide additional context.',
      },
    },
  },
};

/**
 * Example of tooltip with long text content.
 * Text automatically wraps at the maximum width of 250px for readability.
 */
export const LongText: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="secondary">長いテキスト</Button>
      </TooltipTrigger>
      <TooltipContent>
        これは非常に長いツールチップのテキストです。最大幅は240pxに制限されているため、自動的に折り返されます。複数行になっても読みやすいデザインになっています。
      </TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Tooltip with long text that wraps to multiple lines. Maximum width is limited to 240px.',
      },
    },
  },
};

/**
 * Tooltips on form inputs to provide helpful hints or validation requirements.
 * Appears on focus to guide users during data entry.
 */
export const OnTextInput: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Tooltip>
        <TooltipTrigger>
          <Input type="text" placeholder="Username" />
        </TooltipTrigger>
        <TooltipContent side="top">ユーザー名を入力してください</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <Input type="email" placeholder="Email" />
        </TooltipTrigger>
        <TooltipContent side="bottom">有効なメールアドレスを入力してください</TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips on form inputs to provide additional guidance.',
      },
    },
  },
};

/**
 * Important pattern for disabled elements.
 * Disabled elements don't trigger events, so wrap them in a span for tooltips to work.
 */
export const DisabledButton: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <span className="inline-block">
          <Button disabled variant="secondary">
            無効なボタン
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>この操作は現在利用できません</TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Tooltip on a disabled button. Note: Wrap disabled buttons in a span for tooltips to work properly.',
      },
    },
  },
};

/**
 * Control tooltip appearance delay using TooltipProvider.
 * Adjust timing based on your UI needs: instant (0ms), standard (500ms), or delayed (1000ms+).
 */
export const CustomDelay: Story = {
  render: () => (
    <div className="flex gap-4">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="secondary">即座 (0ms)</Button>
          </TooltipTrigger>
          <TooltipContent>即座に表示されます</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={500}>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="secondary">標準 (500ms)</Button>
          </TooltipTrigger>
          <TooltipContent>0.5秒後に表示されます</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={1000}>
        <Tooltip>
          <TooltipTrigger>
            <Button variant="secondary">遅延 (1000ms)</Button>
          </TooltipTrigger>
          <TooltipContent>1秒後に表示されます</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips with different entrance delays using TooltipProvider.',
      },
    },
  },
};

/**
 * Interactive example showing tooltip content can be dynamic.
 * Tooltip updates based on component state changes.
 */
export const InteractiveDemo: Story = {
  render: () => {
    const [count, setCount] = useState(0);
    return (
      <div className="flex flex-col items-center gap-4">
        <Tooltip>
          <TooltipTrigger>
            <Button variant="primary" size="medium" onClick={() => setCount((c) => c + 1)}>
              クリックしてください
            </Button>
          </TooltipTrigger>
          <TooltipContent>クリック回数: {count}</TooltipContent>
        </Tooltip>
        <p className="text-sm text-sds-text-secondary">カウント: {count}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive tooltip that updates based on component state.',
      },
    },
  },
};

/**
 * Controlled tooltip where open state is managed externally.
 * Useful for programmatic control or complex interactions.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="flex flex-col items-center gap-4">
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger>
            <Button variant="secondary">Controlled Tooltip</Button>
          </TooltipTrigger>
          <TooltipContent>This tooltip is controlled by external state</TooltipContent>
        </Tooltip>
        <div className="flex gap-2">
          <Button variant="primary" size="small" onClick={() => setOpen(true)}>
            Show
          </Button>
          <Button variant="danger" size="small" onClick={() => setOpen(false)}>
            Hide
          </Button>
          <Button variant="emphasis" size="small" onClick={() => setOpen((o) => !o)}>
            Toggle
          </Button>
        </div>
        <p className="text-sm text-sds-text-secondary">State: {open ? 'Open' : 'Closed'}</p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of controlled tooltip. Use `open` and `onOpenChange` props for full state control.',
      },
    },
  },
};

/**
 * Radix's visually-hidden accessible-name fallback clips itself to a 1x1px
 * box (see Tooltip's own primitive source) — anything bigger than that is
 * the real, on-screen content.
 */
function isElementVisible(el: Element) {
  const rect = el.getBoundingClientRect();
  return rect.width > 1 && rect.height > 1;
}

export const InteractionFocusShowEscapeHide: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger>
        <Button variant="primary" size="medium">
          Interaction Test Trigger
        </Button>
      </TooltipTrigger>
      <TooltipContent>Interaction test tooltip content</TooltipContent>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Interaction Test Trigger' });

    await userEvent.tab();
    expect(trigger).toHaveFocus();

    // Radix always renders the tooltip text twice: once in the visible
    // content, and once more inside a visually-hidden (clip-rect) span used
    // as the accessible name fallback. Both match the same role/text query,
    // so check that AT LEAST ONE match is genuinely visible (jest-dom's
    // toBeVisible accounts for the clip-rect hiding technique) rather than
    // assuming there's only one match.
    const body = within(canvasElement.ownerDocument.body);
    await waitFor(() => {
      const matches = body.getAllByText('Interaction test tooltip content');
      expect(matches.some(isElementVisible)).toBe(true);
    });

    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      const matches = body.queryAllByText('Interaction test tooltip content');
      expect(matches.every((el) => !isElementVisible(el))).toBe(true);
    });
  },
};
